# ניסיונות תיקון - בעיית מחיקת משתמש

**תאריך:** 2026-01-13  
**בעיה:** שגיאה 4101 "Check delete number list"  
**ביטוי בשימוש:** `{{ '972' + $json.M_phone }}` → `972525904030`

---

## ניסיונות תיקון

### ניסיון 1: Value Expression מורכב עם console.log
**סטטוס:** ❌ לא עבד  
**סיבה אפשרית:** console.log לא עובד ב-n8n routing expressions

### ניסיון 2: Value Expression מפושט
**סטטוס:** ❌ לא עבד  
**סיבה אפשרית:** עדיין מורכב מדי

### ניסיון 3: property: '=' עם body מלא
**סטטוס:** ❌ לא עבד  
**סיבה אפשרית:** conflict עם body properties אחרים

### ניסיון 4: חזרה ל-property: 'userList' עם value expression מפושט
**סטטוס:** 🔄 ניסיון נוכחי

---

## השערות

### השערה 1: Value Expression לא רץ בכלל
**אם זה נכון:**
- n8n לא מריץ את ה-value expression
- הערך נשלח כמו שהוא (string `"972525904030"`)
- API מקבל: `{ "userList": "972525904030" }` (string, לא array!)
- API מחזיר שגיאה 4101

**פתרון אפשרי:**
- להסיר את ה-value expression
- לתת ל-n8n לטפל בזה אוטומטית עם `multipleValues: true`

### השערה 2: Value Expression רץ אבל מחזיר משהו שגוי
**אם זה נכון:**
- ה-value expression רץ
- אבל מחזיר משהו שגוי (אולי undefined?)
- API מקבל: `{ "userList": undefined }` או `{ "userList": [] }`
- API מחזיר שגיאה 4101

**פתרון אפשרי:**
- לפשט עוד יותר את ה-value expression
- לבדוק מה בדיוק הוא מחזיר

### השערה 3: בעיה עם multipleValues
**אם זה נכון:**
- `multipleValues: true` לא עובד נכון עם value expression
- יש conflict בין n8n's automatic handling ל-value expression

**פתרון אפשרי:**
- להסיר את `multipleValues: true`
- או להסיר את ה-value expression

---

## פתרון מוצע - נסה ללא Value Expression

בואו ננסה להסיר את ה-value expression לגמרי ולתת ל-n8n לטפל בזה:

```typescript
routing: {
  send: {
    type: 'body',
    property: 'userList',
    // ללא value expression - תן ל-n8n לטפל בזה עם multipleValues
  },
}
```

**אבל אז צריך validation במקום אחר!**

או אולי validation ב-node level (לא ב-routing)?

---

## מה לעשות עכשיו

1. **נסה את הגרסה הנוכחית** (property: 'userList' עם value expression מפושט)
2. **אם לא עובד, נסה ללא value expression**
3. **אם עדיין לא עובד, נסה ללא multipleValues**

---

## שאלות לבדיקה

1. האם ה-value expression רץ בכלל?
   - בדוק execution logs
   - חפש שגיאות ב-value expression

2. מה בפועל נשלח ל-API?
   - בדוק network request
   - חפש את ה-request body

3. מה השגיאה המדויקת?
   - האם זה 4101?
   - או שגיאה אחרת?
