# דוח בדיקת פונקציות קריאה/חיפוש – נוד PalGate

**תאריך:** 2025-02-04  
**מטרה:** וידוא שכל פונקציות הקריאה והחיפוש תקינות, ותיקון בעיות.

---

## 1. רשימת פונקציות קריאה/מידע בנוד

| Resource   | Operation        | שיטה | Endpoint / פרמטרים | סטטוס אחרי בדיקה |
|-----------|------------------|------|---------------------|-------------------|
| **Auth**  | Test Connection  | GET  | `/places-tree?skip=0&limit=1` | ✅ תקין |
| **User**  | Find             | GET  | `/place/{{placeId}}/users?skip=0&limit=100&filter={{phone}}` | ✅ תוקן (נוספו skip, limit) |
| **User**  | Get Many         | GET  | `/app-user/all-users` + skip, limit, filter | ✅ תקין |
| **User**  | Get Portal Users | GET  | `/users` + skip, limit, filter, orgId, subscription, status | ✅ תקין |
| **Place** | Get Tree         | GET  | `/places-tree` + skip, limit, filter, placeId | ✅ תקין |
| **Place** | Get Details      | GET  | `/place/{{placeId}}` | ✅ תקין |
| **Place** | Get Groups       | GET  | `/place/{{placeId}}/groups` | ✅ תקין |
| **Place** | Get Users        | GET  | `/place/{{placeId}}/users` + skip, limit, **filter** | ✅ תוקן (filter במקום phoneFilter/nameFilter) |
| **Device**| Get Details      | GET  | `/device/{{serial}}` | ✅ תקין |
| **Device**| GetAll           | GET  | `/devices` | ✅ תקין |
| **Device**| Get Log          | GET  | `/device/{{serial}}/log` | ✅ תקין |
| **Device**| Get Users        | GET  | `/device/{{serial}}/users` | ✅ תקין |
| **Device**| Get Live Status History   | GET  | `/device/{{serial}}/live-status-history` | ✅ תקין |
| **Device**| Get Status History V2     | GET  | `/device/{{serial}}/get-status-historyV2` | ✅ תקין |
| **Organization** | Get Tree   | GET  | `/orgs-tree` | ✅ תקין |
| **Organization** | Get Details | GET  | `/org/{{orgId}}` | ✅ תקין |
| **Dashboard** | Get Devices Markers | GET  | `/devices-markers` | ✅ תקין |
| **Dashboard** | Get Favorites   | GET  | `/user/admin/favorites` | ✅ תקין |
| **Dashboard** | Get Recent      | GET  | `/user/admin/recent-devices-places` | ✅ תקין |
| **Dashboard** | Get Statistics  | GET  | `/user/dashboard/statistics` | ✅ תקין |
| **Car**   | Search In Logs   | GET  | `/place/{{placeId}}/reports/car?carId={{carNumber}}` | ✅ תקין (תיעוד API) |

---

## 2. תיקונים שבוצעו

### 2.1 User > Find (חיפוש משתמש לפי טלפון)

- **בעיה:** לפי תיעוד ה-API, ה-endpoint `/place/{placeId}/users` מצפה ל-`skip` ו-`limit`. בלי limit ה-API עלול להחזיר רק 10 (ברירת מחדל) ולגרום להחמצת תוצאות.
- **תיקון:** נוספו ב-routing:
  - `skip: 0`
  - `limit: 100`
- **תיאור הפעולה:** עודכן ל־"Find user by phone number in a place (search by phone, name, or car)".

### 2.2 Place > Get Users (משתמשים במקום)

- **בעיה:** בנוד נשלחו פרמטרים `phoneFilter` ו-`nameFilter`, בעוד שבתיעוד ה-API מופיע פרמטר אחד: `filter` (חיפוש לפי שם/טלפון/רכב).
- **תיקון:** ב-`places/getUsers.ts` הוחלפו `phoneFilter` ו-`nameFilter` בשדה אחד **Filter** שממפה ל-`filter` ב-query.
- **תוצאה:** Place > Get Users תואם כעת ל-API המתועד.

---

## 3. בדיקת חיפוש משתמש לפי טלפון 972528745552

### איך הנוד עובד

- **Resource:** User  
- **Operation:** Find  
- **שדות:** Place ID, Phone Number (למשל `972528745552`)  
- **בקשה:** `GET /api1/place/{placeId}/users?skip=0&limit=100&filter=972528745552`  
- **אימות:** דרך credentials (PAL Gate API) – token ב-header `X-Access-Token`.

### הרצת בדיקה מהטרמינל

נוסף סקריפט לבדיקה ישירה מול ה-API (זהה ללוגיקה של הנוד):

```bash
cd "n8n-nodes-PalGate - API Creator/n8n-nodes-PalGate"

# הגדרת credentials (לפני הרצה)
set PAL_USERNAME=your-email@domain.com
set PAL_PASSWORD=your-password

# אופציונלי: Place ID (ברירת מחדל מהתיעוד)
set PLACE_ID=3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad

# טלפון לבדיקה (ברירת מחדל 972528745552)
set PHONE=972528745552

node test/test-find-user-by-phone.js
```

**ב-PowerShell:**

```powershell
$env:PAL_USERNAME="your-email@domain.com"
$env:PAL_PASSWORD="your-password"
$env:PLACE_ID="3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad"
$env:PHONE="972528745552"
node test/test-find-user-by-phone.js
```

אם החיבור וההרשאות תקינים והמשתמש קיים באותו Place – הסקריפט יציג `[PASS]` ומספר תוצאות (למשל משתמש עם שם/טלפון).

### בדיקה מתוך n8n

1. הוסף נוד **PAL Gate**.
2. בחר **Resource:** User, **Operation:** Find.
3. הזן **Place ID** (UUID של המקום).
4. הזן **Phone Number:** `972528745552`.
5. הרץ את ה-workflow.

אם הכל תקין – בפלט יופיעו פריטים עם פרטי המשתמש (אם נמצא) באותו מקום.

---

## 4. סיכום

| נושא | סטטוס |
|------|--------|
| פונקציות קריאה/חיפוש ממופות לתיעוד API | ✅ כולן ממופות |
| User > Find – תואם API (skip, limit, filter) | ✅ תוקן |
| Place > Get Users – שימוש ב-`filter` | ✅ תוקן |
| סקריפט בדיקה לחיפוש 972528745552 | ✅ נוסף ב-`test/test-find-user-by-phone.js` |
| הרצת lint/build אחרי השינויים | מומלץ: `npm run lint` ו-`npm run build` |

אין פונקציות קריאה נוספות שדורשות תיקון בהתאם לתיעוד שנבדק. מומלץ להריץ את `test/test-find-user-by-phone.js` עם credentials אמיתיים כדי לאמת חיפוש המשתמש עם הטלפון 972528745552.
