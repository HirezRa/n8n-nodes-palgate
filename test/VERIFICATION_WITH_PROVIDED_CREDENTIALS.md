# דוח בדיקות עם הנתונים שסופקו

**תאריך:** 2025-02-04  
**בסיס:** portal.pal-es.com, credentials ו-IDs שסופקו.

---

## נתוני הבדיקה

| פרמטר | ערך |
|--------|------|
| **Base URL** | https://portal.pal-es.com |
| **User** | REDACTED_EMAIL |
| **Mer Org ID** | 10131 |
| **Device ID / Serial** | LPR100200416 |
| **Place ID** | 3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad |
| **טלפון לאיתור משתמש** | 972528745552 |

---

## 1. בדיקת איתור משתמש באתר (User Find)

**סקריפט:** `test/test-find-user-by-phone.js`  
**בקשה:** `GET /api1/place/{placeId}/users?skip=0&limit=100&filter=972528745552`

### תוצאה

```
[PASS] Login OK
[PASS] Find user request OK
Results count: 1
  [1] phone/id: 972528745552, name: 
Done.
```

**מסקנה:** איתור משתמש לפי טלפון **972528745552** במקום **3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad** עובד. התקבלה תוצאה אחת (המשתמש עם המספר הזה באתר).

---

## 2. סוויטת הבדיקות האוטומטית (automated-tests.js)

אותם credentials ו-Place ID כבר מוגדרים ב-CONFIG; הסוויטה הורצה עם אותם נתונים.

### סיכום תוצאות

| קטגוריה | תוצאה | פרטים |
|---------|--------|--------|
| **Auth** | ✅ 2/2 | Login הצליח, credentials לא תקפים נדחים |
| **Places** | ✅ 2/2 | Get all places (count: 1), Get single place (name: "mer group") |
| **Users** | ✅ 3/4 | Get all users (10), Add user, Update user; SKIP: Verify after add (pagination) |
| **Groups** | ✅ 1/1 | Get all groups (count: 0) |
| **Vehicles** | ⏭️ 0/2 SKIP | 404 – ה-API לא תומך ב-endpoints של vehicles |
| **Devices** | ✅ 1/1 | Get device info (LPR100200416); Open gate – SKIP (מכוון, למניעת פתיחת שער) |
| **Error handling** | ✅ 2/3 | Invalid place ID נדחה (403), No auth נדחה (401); FAIL: API מקבל add עם טלפון ריק (התנהגות API) |
| **Delete** | ⏭️ SKIP | לא אומת מחיקה (could not verify) |

**סה"כ:** 11 PASS, 1 FAIL, 5 SKIP.

### פונקציות קריאה/מידע שאומתו בפועל

- **Auth:** התחברות עם REDACTED_EMAIL – עובד.
- **Places:** קבלת עץ מקומות ומקום בודד (mer group) – עובד.
- **Users:** קבלת רשימת משתמשים במקום, איתור משתמש לפי טלפון 972528745552 – עובד.
- **Groups:** קבלת קבוצות במקום – עובד.
- **Devices:** קבלת פרטי מכשיר LPR100200416 – עובד.

---

## 3. איך להריץ שוב

### איתור משתמש בלבד (טלפון 972528745552)

```powershell
cd "n8n-nodes-PalGate - API Creator\n8n-nodes-PalGate"
$env:PAL_USERNAME="REDACTED_EMAIL"
$env:PAL_PASSWORD='REDACTED_PASSWORD'
$env:PLACE_ID="3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad"
$env:PHONE="972528745552"
node test/test-find-user-by-phone.js
```

### סוויטה מלאה (כולל Auth, Places, Users, Groups, Devices)

```powershell
cd "n8n-nodes-PalGate - API Creator\n8n-nodes-PalGate"
node test/automated-tests.js
```

(CONFIG בקובץ כבר מכיל את אותם credentials ו-Place ID.)

---

## 4. סיכום

- **איתור משתמש באתר עם מספר טלפון 972528745552** – עובד; מתקבלת תוצאה אחת.
- **פונקציות הקריאה העיקריות** (Auth, Places, Users, Groups, Devices) – עובדות עם הנתונים שסופקו.
- **Vehicles** – לא נתמך ב-API (404).
- **הכשל היחיד בסוויטה** – API מקבל הוספת משתמש עם טלפון ריק; אם תרצה, אפשר להוסיף ולידציה בנוד לדחיית טלפון ריק.
