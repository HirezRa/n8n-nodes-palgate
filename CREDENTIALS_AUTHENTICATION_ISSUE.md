# דוח בעיית האימות ב-Credentials - PAL Gate n8n Node

**תאריך:** 2026-01-06  
**גרסה:** 1.0.7  
**סטטוס:** 🔴 בעיה זוהתה

---

## 🔴 בעיה שזוהתה

### תיאור הבעיה
לאחר התיקון האחרון, לא מצליחים להתחבר עם שם משתמש וסיסמה ב-n8n.

**שגיאה שהתקבלה:**
```
Authentication token not found. Please check your credentials.
```

**תהליכים שקדמו לשינוי:**
1. ✅ יצירת credentials עבדה תקין (test endpoint הצליח)
2. ❌ שימוש ב-credentials ב-node נכשל

---

## 🔍 חקירה וניתוח

### הבעיה העיקרית

**הקוד הנוכחי:**
```typescript
preAuthentication = async function (
  this: IHttpRequestHelper,
  credentials: ICredentialDataDecryptedObject,
): Promise<IDataObject> {
  // מבצע login ומחזיר { token: "..." }
  return { token };
};

authenticate: IAuthenticate = async (
  credentials: ICredentialDataDecryptedObject,
  requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> => {
  // מנסה לגשת ל-credentials.token
  const token = credentials.token as string | undefined;
  // ❌ token לא קיים כי preAuthentication לא מעדכן את credentials!
};
```

**הבעיה:**
- `preAuthentication` מחזיר `IDataObject` עם token
- אבל זה **לא מעדכן** את ה-`credentials` object אוטומטית
- ה-`authenticate` function מנסה לגשת ל-`credentials.token` אבל הוא לא קיים
- Fallback ל-cache עובד, אבל רק אם `preAuthentication` כבר רץ

### איך n8n מטפל ב-`preAuthentication`?

לפי התיעוד של n8n:
- `preAuthentication` ב-`ICredentialType` מחזיר `IDataObject`
- זה **לא מעדכן** את ה-credentials object אוטומטית
- זה משמש ל-**OAuth flows** או **dynamic credential updates**
- אבל זה לא נקרא לפני כל request - רק כשמגדירים credentials

### הפתרון הנכון

ה-`authenticate` function צריך לבצע login ישירות, עם caching. אבל הבעיה היא ש-`authenticate` function לא יכול לבצע HTTP requests ישירות כי אין לו access ל-`httpRequest` helper.

**הפתרון:** להשתמש ב-token cache בלבד, ולהבטיח ש-`preAuthentication` נקרא לפני השימוש ב-credentials.

אבל יש בעיה נוספת: `preAuthentication` לא נקרא לפני כל request, רק כשמגדירים credentials.

---

## ✅ פתרון מוצע

### אפשרות 1: שימוש ב-`preAuthentication` + cache fallback

הקוד הנוכחי כבר משתמש ב-cache fallback, אבל צריך לוודא ש-`preAuthentication` נקרא לפני השימוש.

**הבעיה:** `preAuthentication` לא נקרא לפני כל request.

### אפשרות 2: ביצוע login ישירות ב-`authenticate` function

הבעיה: `authenticate` function לא יכול לבצע HTTP requests ישירות.

### אפשרות 3: שימוש ב-`fetch` API ב-`authenticate` function

**זה הפתרון הנכון!** להשתמש ב-`fetch` API (זמין ב-Node.js 18+) ב-`authenticate` function לבצע login ישירות.

---

## 🔧 תיקון מוצע

שינוי ה-`authenticate` function לבצע login ישירות עם `fetch` API:

```typescript
authenticate: IAuthenticate = async (
  credentials: ICredentialDataDecryptedObject,
  requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> => {
  const username = credentials.username as string;
  const password = credentials.password as string;
  
  // Check cache first
  const cacheKey = `pal_gate_${username}`;
  const cached = tokenCache[cacheKey];
  const now = Date.now();
  
  let token: string;
  
  if (cached && cached.expiry > now) {
    token = cached.token;
  } else {
    // Perform login using fetch API
    const loginUrl = 'https://portal.pal-es.com/api1/user/login1';
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const loginResponse = await response.json();
    token = loginResponse.user.token;
    
    // Cache token
    tokenCache[cacheKey] = {
      token,
      expiry: now + 23 * 60 * 60 * 1000,
    };
  }
  
  // Add token to headers
  if (!requestOptions.headers) {
    requestOptions.headers = {};
  }
  requestOptions.headers['X-Access-Token'] = token;
  
  return requestOptions;
};
```

**יתרונות:**
- ✅ עובד ישירות ב-`authenticate` function
- ✅ לא תלוי ב-`preAuthentication` hook
- ✅ Token caching עובד
- ✅ עובד עם declarative routing

**חסרונות:**
- ⚠️ דורש Node.js 18+ (אבל n8n כבר דורש את זה)

---

**סטטוס:** 🔴 דורש תיקון  
**עדיפות:** גבוהה מאוד  
**מורכבות:** נמוכה

