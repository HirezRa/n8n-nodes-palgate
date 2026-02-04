# תיקון בעיית מחיקת משתמש - v1.0.28

**תאריך:** 2026-01-13  
**בעיה:** שגיאה 4101 "Check delete number list"  
**סטטוס:** ✅ **תוקן ופורסם**

---

## הבעיה

השגיאה 4101 הופיעה כאשר n8n העביר את מספר הטלפון כמספר (number) ולא כסטרינג (string).

### סיבה

ה-value expression בדק רק:
```javascript
typeof v === "string"
```

כאשר n8n העביר את הערך מהביטוי `972{{ $json.M_phone }}` כמספר, הוא נדחה על ידי ה-filter, מה שגרם ל-array ריק → שגיאה 4101.

---

## התיקון

### שינוי ב-filter:

**לפני:**
```javascript
const valid = arr.filter(v => v && typeof v === "string" && v.trim() !== "");
```

**אחרי:**
```javascript
const valid = arr.filter(v => 
  v !== null && 
  v !== undefined && 
  v !== "" && 
  (typeof v === "string" || typeof v === "number")
);
```

### שינויים נוספים:

1. **בדיקת null משופרת:**
   - `!$value` → `!$value && $value !== 0`
   - כדי לא לדחות את המספר 0

2. **קבלת מספרים ו-strings:**
   - ה-filter מקבל גם `string` וגם `number`
   - המרה ל-string נעשית ב-`String(phone)` כך שזה עובד בשני המקרים

---

## בדיקות

### ✅ כל הפורמטים הבאים עובדים:

| פורמט | דוגמה | סטטוס |
|-------|-------|-------|
| String עם 972 | `"972525904030"` | ✅ |
| String ללא 972 | `"525904030"` | ✅ |
| String עם 0 | `"0525904030"` | ✅ |
| **Number** | `972525904030` | ✅ **תוקן** |
| Array של strings | `["972525904030"]` | ✅ |
| Array של numbers | `[972525904030]` | ✅ |

---

## קבצים שעודכנו

1. **`nodes/PalGate/resources/users/delete.ts`**
   - שינוי ב-value expression filter
   - שיפור בדיקת null/undefined/empty

2. **`package.json`**
   - גרסה: 1.0.27 → 1.0.28

3. **`CHANGELOG.md`**
   - הוספת רשומה ל-v1.0.28

---

## פרסום

- ✅ Build: Successful
- ✅ Publish: `n8n-nodes-palgate@1.0.28`
- ✅ Registry: https://registry.npmjs.org/

---

## הוראות למשתמשים

### עדכון הנוד:

```bash
npm update n8n-nodes-palgate
```

### הפעלה מחדש:

הפעל מחדש את n8n כדי לטעון את הגרסה החדשה.

### בדיקה:

לאחר העדכון, פעולת המחיקה אמורה לעבוד גם כאשר מספר הטלפון מועבר כמספר או כסטרינג.

---

## סיכום

| בעיה | פתרון |
|------|-------|
| Filter דחה numbers | ✅ עכשיו מקבל גם numbers |
| שגיאה 4101 | ✅ תוקן |
| פורמט API | ✅ נשאר נכון |

**סטטוס:** ✅ **תוקן ופורסם ב-v1.0.28**

---

**תאריך תיקון:** 2026-01-13  
**גרסה:** 1.0.28
