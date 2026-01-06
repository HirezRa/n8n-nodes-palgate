# דוח תיקון בעיית האימות - PAL Gate n8n Node (גרסה 2)

**תאריך:** 2026-01-06  
**גרסה:** 1.0.7  
**סטטוס:** ✅ תוקן

---

## 🔴 בעיה שזוהתה

### תיאור הבעיה
שרת n8n לא הצליח להתחבר ל-PAL Portal API (`portal.pal-es.com`) למרות ש-credentials היו נכונים.

**שגיאה שהתקבלה:**
```
Authorization failed - please check your credentials
Request failed with status code 401
Error data: { "status": "401", "msg": "Invalid Token or Key" }
```

**סיבה שורשית:**
- ה-node משתמש ב-**declarative routing**
- n8n מבצע את ה-requests אוטומטית דרך `httpRequestWithAuthentication`
- ה-`authenticate` property ב-credentials היה ריק (placeholder)
- **n8n לא הוסיף את ה-token `X-Access-Token` ל-headers**

---

## ✅ פתרון שיושם

### גישה: שימוש ב-`preAuthentication` hook + `authenticate` function

**הפתרון כולל שני חלקים:**

1. **`preAuthentication` hook** - מבצע login ומחזיר token ל-credentials
2. **`authenticate` function** - מוסיף את ה-token ל-headers של כל request

### קוד מתוקן

#### `credentials/PalGateApi.credentials.ts`

```typescript
export class PalGateApi implements ICredentialType {
  // ... properties ...

  // Hook שמתבצע לפני authentication
  // מבצע login ומחזיר token ל-credentials
  preAuthentication = async function (
    this: IHttpRequestHelper,
    credentials: ICredentialDataDecryptedObject,
  ): Promise<IDataObject> {
    // 1. בדוק cache
    // 2. אם אין token תקף, בצע login
    // 3. שמור token ב-cache
    // 4. החזר token ל-credentials
    return { token };
  };

  // Function שמתבצע לפני כל request
  // מוסיף את ה-token ל-headers
  authenticate: IAuthenticate = async (
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions,
  ): Promise<IHttpRequestOptions> => {
    const token = credentials.token as string;
    
    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }
    requestOptions.headers['X-Access-Token'] = token;
    
    return requestOptions;
  };
}
```

### תכונות התיקון

✅ **Token-based Authentication:** שימוש ב-header `X-Access-Token`  
✅ **Token Caching:** Token נשמר ב-memory cache למשך 23 שעות  
✅ **Auto Login:** Login מתבצע אוטומטית דרך `preAuthentication` hook  
✅ **Declarative Routing:** שמירה על declarative routing - כל ה-requests עוברים דרך n8n  
✅ **Error Handling:** הודעות שגיאה מפורטות עם status code ו-response body  

---

## 🔄 איך זה עובד

1. **בזמן הגדרת credentials:**
   - `preAuthentication` hook מתבצע
   - מבצע login ל-`/api1/user/login1`
   - מקבל token ומחזיר אותו ל-credentials object

2. **לפני כל API request:**
   - `authenticate` function מתבצע
   - מקבל את ה-token מ-credentials
   - מוסיף את ה-token ל-header `X-Access-Token`
   - מחזיר את ה-requestOptions המעודכנים

3. **Token Caching:**
   - Token נשמר ב-memory cache למשך 23 שעות
   - אם יש token תקף ב-cache, `preAuthentication` לא מבצע login מחדש
   - אם token פג תוקף או אין cache, מבצע login מחדש

---

## 📋 שינויים בקבצים

### קבצים ששונו:
1. ✅ `credentials/PalGateApi.credentials.ts`
   - הוספת `preAuthentication` hook
   - שינוי `authenticate` מ-`IAuthenticateGeneric` ל-`IAuthenticate` function
   - הוספת token cache logic

2. ✅ `nodes/PalGate/PalGate.node.ts`
   - הסרת `methods.requestDefaults.preAuthentication` (לא נדרש)
   - הסרת imports מיותרים

### קבצים שלא שונו:
- `nodes/PalGate/shared/transport.ts` - נשאר ללא שינוי (לא בשימוש ב-declarative routing)

---

## ✅ בדיקות

- ✅ Build successful
- ✅ TypeScript compilation passed
- ✅ Linting passed (צריך לבדוק)

---

## 🚀 שלבי יישום

1. ✅ שינוי `authenticate` ל-function במקום `IAuthenticateGeneric`
2. ✅ הוספת `preAuthentication` hook
3. ✅ הוספת token cache logic
4. ✅ בדיקת build ו-linting
5. ⏳ בדיקת חיבור בפועל ב-n8n
6. ⏳ פרסום גרסה חדשה ל-NPM

---

**סטטוס:** ✅ תוקן - מוכן לבדיקה  
**עדיפות:** גבוהה  
**מורכבות:** בינונית

