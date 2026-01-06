# דוח חקירת בעיית האימות - PAL Gate n8n Node

**תאריך:** 2026-01-06  
**גרסה:** 1.0.6  
**סטטוס:** 🔴 בעיה זוהתה - דורש תיקון

---

## 🔴 בעיה שזוהתה

### תיאור הבעיה
שרת n8n לא מצליח להתחבר ל-PAL Portal API (`portal.pal-es.com`) למרות ש-credentials נכונים.

**שגיאה שהתקבלה:**
```
Authorization failed - please check your credentials
Request failed with status code 401
Error data: { "status": "401", "msg": "Invalid Token or Key" }
```

**Operation שנוסה:**
- Resource: Organization
- Operation: Get Tree
- URL: `/orgs-tree`

---

## 🔍 חקירה וניתוח

### 1. מנגנון האימות המקורי (API)

לאחר בדיקת הקוד המקורי ב-`pal-portal-api/portal_client.py`, זוהה כי:

1. **Login Endpoint:** `POST /api1/user/login1`
2. **Request Body:**
   ```json
   {
     "username": "email@example.com",
     "password": "password"
   }
   ```
3. **Response Structure:**
   ```json
   {
     "user": {
       "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzU1MiJ9..."
     }
   }
   ```
4. **Token Usage:** Token נשלח ב-header `X-Access-Token` בכל request
5. **Token Expiry:** Token תקף ל-24 שעות

### 2. הבעיה ב-n8n Node

**הבעיה העיקרית:**
- ה-n8n node משתמש ב-**declarative routing**
- n8n מבצע את ה-requests אוטומטית דרך `httpRequestWithAuthentication`
- ה-`authenticate` property ב-credentials ריק (placeholder)
- **n8n לא מוסיף את ה-token `X-Access-Token` ל-headers**

**קוד נוכחי (בעייתי):**

```typescript
// credentials/PalGateApi.credentials.ts
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {
    // Authentication is handled via preAuthentication hook in node
    // This is a placeholder - actual auth happens in node methods
  },
};
```

```typescript
// nodes/PalGate/shared/transport.ts
export async function getAuthToken(...): Promise<string> {
  // מבצע login ומחזיר token
  // אבל זה לא נקרא ב-declarative routing!
}

export async function palGateApiRequest(...) {
  // משתמש ב-getAuthToken ומבצע request עם token
  // אבל זה לא נקרא ב-declarative routing!
}
```

**הבעיה:**
- `palGateApiRequest` לא נקרא ב-declarative routing
- n8n מבצע את ה-requests ישירות דרך `httpRequestWithAuthentication`
- ה-`authenticate` property ריק, אז n8n לא מוסיף headers

---

## 🔧 ניסיונות תיקון

### ניסיון 1: הוספת `preAuthentication` ב-credentials
```typescript
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {},
  preAuthentication: async function (...) {
    // ❌ לא נתמך ב-IAuthenticateGeneric
  },
};
```
**תוצאה:** ❌ `preAuthentication` לא קיים ב-`IAuthenticateGeneric`

### ניסיון 2: הוספת `preAuthentication` ב-node description
```typescript
description: INodeTypeDescription = {
  // ...
  preAuthentication: async function (...) {
    // ❌ לא קיים ב-INodeTypeDescription
  },
};
```
**תוצאה:** ❌ `preAuthentication` לא קיים ב-`INodeTypeDescription`

### ניסיון 3: הוספת `methods.requestDefaults.preAuthentication`
```typescript
methods = {
  requestDefaults: {
    preAuthentication: async function (...) {
      // ❌ לא נתמך ב-INodeType.methods
    },
  },
};
```
**תוצאה:** ❌ `requestDefaults` לא קיים ב-`INodeType.methods`

### ניסיון 4: Override `execute` method
```typescript
async execute(this: IExecuteFunctions) {
  // מבצע requests ידנית עם token
  // ❌ זה מבטל את ה-declarative routing
}
```
**תוצאה:** ❌ מבטל את ה-declarative routing, לא פותר את הבעיה

---

## ✅ פתרון מוצע

### אפשרות 1: שימוש ב-`IAuthenticate` במקום `IAuthenticateGeneric`

ב-n8n, `IAuthenticate` תומך ב-`preAuthentication` hook:

```typescript
import type { IAuthenticate } from 'n8n-workflow';

authenticate: IAuthenticate = {
  type: 'preAuthentication',
  properties: [],
  preAuthentication: async function (
    this,
    requestOptions: IHttpRequestOptions,
    credentials: ICredentialDataDecryptedObject,
  ): Promise<IHttpRequestOptions> {
    // Get authentication token
    const token = await getAuthTokenForCredentials(credentials);

    // Add token to request headers
    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }
    requestOptions.headers['X-Access-Token'] = token;

    return requestOptions;
  },
};
```

**יתרונות:**
- ✅ תומך ב-`preAuthentication` hook
- ✅ עובד עם declarative routing
- ✅ Token נשלח אוטומטית בכל request

**חסרונות:**
- ⚠️ דורש שינוי מבנה ה-credentials

### אפשרות 2: שימוש ב-`requestDefaults.headers` עם expression

```typescript
requestDefaults: {
  baseURL: 'https://portal.pal-es.com/api1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Access-Token': '={{$credentials.token}}', // ❌ לא קיים
  },
},
```

**תוצאה:** ❌ `$credentials.token` לא קיים

### אפשרות 3: מעבר מ-declarative routing ל-simple node

**תוצאה:** ❌ מבטל את כל היתרונות של declarative routing

---

## 📋 המלצה

**הפתרון המומלץ:** שימוש ב-`IAuthenticate` עם `preAuthentication` hook.

זה יאפשר:
1. ✅ שמירה על declarative routing
2. ✅ הוספת token אוטומטית לכל request
3. ✅ שימוש ב-token cache הקיים
4. ✅ תמיכה מלאה ב-n8n

---

## 🔄 שלבי יישום

1. **שינוי `IAuthenticateGeneric` ל-`IAuthenticate`**
2. **הוספת `preAuthentication` hook**
3. **העברת לוגיקת ה-login ל-credentials**
4. **בדיקה והטמעה**

---

**סטטוס:** 🔴 דורש תיקון  
**עדיפות:** גבוהה  
**מורכבות:** בינונית

