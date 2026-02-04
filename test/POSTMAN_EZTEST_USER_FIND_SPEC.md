# חיפוש משתמש (User Find) – מפרט להשוואה עם קולקציית Postman EzTest

**קישור לקולקציה:**  
https://erez-r-9380739.postman.co/workspace/EzTest~58c74e04-b69b-47f7-be94-15a3ceb58678/collection/52096695-66d82603-7e1b-4fa5-a66e-69135747a429?action=share&creator=52096695

**מטרה:** להשוות את פעולת "חיפוש משתמש" בנוד PalGate מול מה שמוגדר/צפוי בקולקציית EzTest – במיוחד **בקשה** ו**תוצאה צפויה**.

---

## 1. מפרט הבקשה (Request)

| פרט | ערך |
|-----|-----|
| **Method** | `GET` |
| **URL** | `{{baseUrl}}/place/{{placeId}}/users` |
| **Base URL** | `https://portal.pal-es.com/api1` |
| **Query params** | `skip=0`, `limit=100`, `filter=<phone>` |
| **Headers** | `Content-Type: application/json`, `Accept: application/json`, `X-Access-Token: <token>` |

**דוגמה מלאה:**
```
GET https://portal.pal-es.com/api1/place/3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad/users?skip=0&limit=100&filter=972528745552
X-Access-Token: <token>
Accept: application/json
```

**הערות:**
- `filter` – מחפש לפי טלפון (או שם/רכב, תלוי ב-API). בנוד כרגע משתמשים ב-`phone` כערך ל-`filter`.
- טלפון בפורמט בינלאומי (למשל `972528745552`).

---

## 2. תשובה צפויה (Response) – מבנה מלא

**Status:** `200 OK`

**מבנה גוף התשובה (מבוסס על בדיקה מול ה-API):**

```json
{
  "err": null,
  "errId": 0,
  "msg": "success",
  "users": {
    "count": 1,
    "start": 0,
    "len": 1,
    "list": [
      {
        "_id": "972528745552",
        "firstname": "ארז",
        "lastname": "רחמים",
        "places": [
          {
            "id": "dd19be45-d44c-45cc-9328-70c4ebae7f18",
            "admin": false,
            "output1": true,
            "output2": false,
            "cars": [
              { "id": "87879202", "color": "", "brand": "", "model": "", "incompleteMatch": 0 },
              { "id": "36214904", "color": "", "brand": "", "model": "", "incompleteMatch": 0 }
            ],
            "carsLimit": 0,
            "notes": "",
            "maxStayTime": 0,
            "guest": false,
            "startDate": "2024-05-18T21:00:00.311Z",
            "endDate": "2099-05-18T20:59:00.000Z",
            "firstname": "ארז",
            "lastname": "רחמים",
            "name": "רכב בנזין_היברידי MER"
          }
        ],
        "admin": false,
        "cars": [
          { "id": "87879202", "color": "", "brand": "", "model": "", "incompleteMatch": 0 },
          { "id": "36214904", "color": "", "brand": "", "model": "", "incompleteMatch": 0 }
        ],
        "unauthorizedLanes": [],
        "carsLimit": 0,
        "notes": "",
        "maxStayTime": 0,
        "guest": false,
        "startDate": "2024-05-18T21:00:00.311Z",
        "endDate": "2099-05-18T20:59:00.000Z",
        "secondaryDevice": true,
        "notifications": true,
        "guestInvitation": true,
        "inTime": 1769930448,
        "lastOutTime": 1769963378,
        "present": false,
        "carsPresent": []
      }
    ],
    "carsPresent": 142
  }
}
```

---

## 3. שדות עיקריים בתוצאה (לכל אובייקט ב-`users.list`)

| שדה | תיאור |
|-----|--------|
| `_id` | מזהה משתמש (בדרך כלל טלפון) |
| `firstname` | שם פרטי |
| `lastname` | שם משפחה |
| `places` | מערך מקומות שהמשתמש משויך אליהם (כולל רכבים ו־permissions לכל place) |
| `cars` | מערך רכבים (מס’ לוחית) ברמת המשתמש |
| `startDate` / `endDate` | תוקף |
| `guest` | האם אורח |
| `present` | האם כרגע במתחם |
| `inTime` / `lastOutTime` | זמני כניסה/יציאה |

---

## 4. התאמת הנוד PalGate

- **Resource:** User  
- **Operation:** Find  
- **Parameters:** Place ID, Phone Number  
- **Request:** `GET /place/{{placeId}}/users?skip=0&limit=100&filter={{phone}}`  
- **Output:** הנוד מחזיר את גוף התשובה המלא. רשימת המשתמשים נמצאת ב-**`json.users.list`** (מערך). ב-workflow אפשר לעבור על `$json.users.list` או לגשת ל-`$json.users.count`.

אם בקולקציית EzTest מוגדר:
- **בקשה** – אותו GET עם `placeId` ו-`filter` (טלפון) → הנוד תואם.
- **תוצאה** – מערך משתמשים עם המבנה למעלה → התשובה מה-API תואמת; פלט הנוד הוא `users.list` (פריט אחד לכל משתמש).

---

## 5. איך לבדוק מול Postman

1. **ייצוא הקולקציה מ-EzTest**  
   Postman → Workspace EzTest → הקולקציה עם ה-ID `52096695-66d82603-7e1b-4fa5-a66e-69135747a429` → ⋯ → Export → Collection v2.1. לשמור כ-JSON.

2. **איתור ה-request של חיפוש משתמש**  
   לחפש בקובץ ה-JSON request עם:
   - method: GET  
   - url שמכיל `place` ו-`users` ו-query כמו `filter` או `skip`/`limit`.

3. **השוואה**  
   - URL ו-query params מול הסעיף "מפרט הבקשה" למעלה.  
   - דוגמת תשובה (אם שמורה ב-Examples) מול המבנה בסעיף "תשובה צפויה".

4. **אופציונלי – שליפה עם Postman API**  
   עם API Key:  
   `GET https://api.getpostman.com/collections/66d82603-7e1b-4fa5-a66e-69135747a429`  
   (Header: `x-api-key: <YOUR_API_KEY>`).  
   ה-ID בקישור השיתוף הוא `52096695-66d82603-7e1b-4fa5-a66e-69135747a429` – ב-API משתמשים לרוב ב-UUID של הקולקציה (החלק השני: `66d82603-7e1b-4fa5-a66e-69135747a429`).

---

## 6. סיכום

| פריט | מפרט |
|------|------|
| **בקשה** | `GET /api1/place/{placeId}/users?skip=0&limit=100&filter={phone}` + `X-Access-Token` |
| **תוצאה** | JSON עם `users.list` – מערך אובייקטים (משתמשים). כל אובייקט כולל `_id`, `firstname`, `lastname`, `places`, `cars`, תאריכים וכו'. |
| **נוד** | User → Find; פלט = גוף תשובה מלא; רשימת משתמשים ב-`json.users.list`. |

חקירה מעמיקה מול הקולקציה: לייצא את הקולקציה מ-Postman (או לשלוף עם API Key), לאתר את ה-request של חיפוש משתמש, ולהשוות ל-URL/params ולדוגמת התשובה במסמך זה.
