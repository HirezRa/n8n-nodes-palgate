# מדריך דיבוג - בעיית מחיקת משתמש

**תאריך:** 2026-01-13  
**בעיה:** שגיאה בעת מחיקת משתמש ב-n8n

---

## שלבי דיבוג

### 1. בדוק את הלוגים ב-n8n

כשמנסים למחוק משתמש, ה-value expression מדפיס לוגים. בדוק את ה-execution logs ב-n8n:

1. פתח את ה-workflow
2. הרץ את ה-node
3. לחץ על ה-node → "View Execution"
4. בדוק את ה-logs

**מה לחפש:**
- `[PAL Gate] DELETE USER - Validation starting` - האם זה מופיע?
- `[PAL Gate] Raw value:` - מה הערך הגולמי?
- `[PAL Gate] Value type:` - מה הסוג?
- `[PAL Gate] Is array:` - האם זה array?

**אם הלוגים לא מופיעים:**
- ה-value expression לא רץ בכלל
- יש בעיה ב-routing configuration

---

### 2. בדוק את ה-Request שנשלח

בדוק מה בפועל נשלח ל-API:

1. פתח את ה-execution logs
2. חפש את ה-HTTP request
3. בדוק את ה-request body

**מה צריך להיות:**
```json
{
  "userList": ["972525904030"]
}
```

**אם זה לא מה שנשלח:**
- יש בעיה ב-value expression
- או ב-routing configuration

---

### 3. בדוק את השגיאה המדויקת

מה השגיאה המדויקת שאתה מקבל?

**שגיאות אפשריות:**
- `400 Bad Request - Check delete number list` (errId: 4101)
- `CRITICAL SAFETY: Phone number is required...`
- שגיאה אחרת?

---

### 4. בדוק את ה-Expression

מה הביטוי שאתה משתמש בו?

**אפשרויות:**
- `972{{ $json.M_phone }}` - זה מה שאתה משתמש?
- או משהו אחר?

**מה התוצאה של הביטוי?**
- האם זה `972525904030`?
- או משהו אחר?

---

### 5. בדוק אם יש Multiple Items

מהתמונה אני רואה "2 items" - האם יש לך 2 פריטים ב-input?

**אם כן:**
- כל פריט צריך להיות מטופל בנפרד
- כל פריט צריך ליצור request נפרד
- כל request צריך להכיל `userList` עם מספר אחד

---

## פתרונות אפשריים

### פתרון 1: פשוט את ה-Expression

אם ה-value expression המורכב לא עובד, נסה גרסה פשוטה יותר:

```typescript
value: '={{Array.isArray($value) ? $value.map(v => String(v).trim()) : [String($value).trim()]}}'
```

### פתרון 2: הסר את ה-Expression

אם multipleValues: true אמור לטפל בזה אוטומטית:

```typescript
routing: {
  send: {
    type: 'body',
    property: 'userList',
    // ללא value expression - תן ל-n8n לטפל בזה
  },
}
```

**אבל אז צריך validation במקום אחר!**

### פתרון 3: השתמש ב-Property: '='

אם צריך יותר שליטה:

```typescript
routing: {
  send: {
    type: 'body',
    property: '=',
    value: '={{ { userList: Array.isArray($value) ? $value : [$value] } }}',
  },
}
```

---

## מה לעשות עכשיו

1. **בדוק את הלוגים** - מה מופיע ב-execution logs?
2. **בדוק את ה-Request** - מה בפועל נשלח ל-API?
3. **שתף את השגיאה המדויקת** - מה השגיאה שאתה מקבל?
4. **שתף את ה-Expression** - מה הביטוי שאתה משתמש בו?

---

## גרסה מעודכנת

הגרסה הנוכחית (v1.0.30) כוללת:
- ✅ Value expression מפושט (ללא console.log)
- ✅ טיפול ב-string ו-number
- ✅ פורמט אוטומטי של מספרי טלפון
- ✅ בדיקות אבטחה

אם זה עדיין לא עובד, צריך לבדוק מה בדיוק קורה.

---

**עדכן אותי עם:**
1. הלוגים מה-execution
2. השגיאה המדויקת
3. מה הביטוי שאתה משתמש בו
