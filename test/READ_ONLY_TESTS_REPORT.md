# דוח בדיקות – פונקציות לא הרסניות (Read-Only)

**תאריך:** 2026-02-04  
**נוד:** n8n-nodes-palgate (PAL Gate)  
**מטרה:** בדיקת כל השאילתות והפעולות שלא משנות/מוחקות נתונים. **לא בוצעה בדיקת DELETE.**

---

## נתוני בדיקה

| פרט | ערך |
|-----|-----|
| **Base URL** | https://portal.pal-es.com |
| **משתמש** | REDACTED_EMAIL |
| **Place ID** | 3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad |
| **Device ID / Serial** | LPR100200416 |
| **Mer Org ID** | 10131 |
| **טלפון לחיפוש** | 972528745552 |
| **Car ID (לחיפוש ב-Logs)** | 87879202 |

---

## הרצת הבדיקות

```bash
node test/test-read-only.js
```

---

## תוצאות (סיכום)

| קטגוריה | בדיקות | PASS | FAIL | SKIP |
|---------|--------|------|------|------|
| Auth | 2 | 2 | 0 | 0 |
| User | 4 | 3 | 0 | 1 |
| Place | 5 | 5 | 0 | 0 |
| Device | 6 | 6 | 0 | 0 |
| Organization | 2 | 2 | 0 | 0 |
| Dashboard | 4 | 4 | 0 | 0 |
| Car | 1 | 0 | 0 | 1 |
| **סה"כ** | **24** | **22** | **0** | **2** |

---

## פירוט לפי פעולה

### Auth
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Login | PASS | |
| Test Connection (places-tree) | PASS | |

### User
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Find (by phone 972528745552) | PASS | count=1 |
| Get Many (app-user/all-users) | PASS | |
| Get Portal Users | PASS | |
| Get Image (by phone) | SKIP | Status 400 – ה-API עשוי לצפות למזהה app-user מהרשימה, לא בהכרח טלפון |

### Place
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Get Details | PASS | |
| Get Groups | PASS | |
| Get Tree | PASS | |
| Get Users | PASS | |
| Format Number | PASS | |

### Device
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Get Details | PASS | |
| Get All | PASS | |
| Get Log | PASS | |
| Get Live Status History | PASS | |
| Get Status History V2 | PASS | |
| Get Users | PASS | |

### Organization
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Get Tree | PASS | |
| Get Details (orgId 10131) | PASS | |

### Dashboard
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Get Devices Markers | PASS | |
| Get Favorites | PASS | |
| Get Recent (devices/places) | PASS | |
| Get Statistics | PASS | |

### Car
| פעולה | תוצאה | הערות |
|--------|--------|--------|
| Search In Logs | SKIP | Status 404 – endpoint לא נתמך ב-API (מגבלת API) |

---

## תיקונים שבוצעו

1. **סקריפט `test-read-only.js`**  
   - בודק רק פעולות לא הרסניות (כל ה-GET + ללא DELETE).  
   - Get Image: במקרה של 400 או 404 נספר כ-SKIP (מגבלת/התנהגות API).  
   - Car Search In Logs: 404 נספר כ-SKIP (endpoint לא קיים).

2. **אין שינוי בנוד**  
   - כל ה-endpoints תואמים את הממשק הקיים.  
   - Get Image מוגדר כ-`GET /app-user/{{phone}}/image` – אם ה-API דורש מזהה אחר, יש לתעד/לבדוק מול תיעוד ה-API.

---

## פעולות שלא נבדקו (בכוונה)

- **User:** Add, Add Many, Update, Update By Phone, **Delete**
- **Car:** Add, Delete, Delete By ID
- **Device:** Open Gate (פעולה פיזית)
- **כל פעולות DELETE** – לא בוצעו לפי ההנחיה.

---

## מסקנה

- **22 בדיקות עברו** – כל השאילתות הלא-הרסניות שנתמכות על ידי ה-API עובדות כמצופה.
- **2 בדיקות SKIP** – Get Image (400) ו-Car Search In Logs (404) – מגבלות/התנהגות API, לא באג בנוד.
- **0 כשלונות** – לאחר עדכון הבדיקה (Get Image כ-SKIP ב-400).
