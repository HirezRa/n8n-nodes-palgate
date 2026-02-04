# Postman collection sync (PAL Gate API)

## Security – do not commit sensitive exports

- **Do not commit** collections exported from HAR or recordings that contain real place IDs, org IDs, tokens, or session data.
- Use a **clean** Collection v2.1 export (variables like `{{baseUrl}}`, `{{placeId}}`) without real values, or keep export files only locally and add `postman/*.json` to `.gitignore` (already ignored except README).

## How to export the collection

1. פתח את ה-workspace **EzTest** ב-Postman:  
   https://erez-r-9380739.postman.co/workspace/EzTest~58c74e04-b69b-47f7-be94-15a3ceb58678/collection/52096695-66d82603-7e1b-4fa5-a66e-69135747a429

2. על שם הקולקציה → **⋯** (View more actions) → **Export**.

3. בחר **Collection v2.1** → **Export** ושמור את הקובץ.

4. שמור את הקובץ בתיקייה הזו בשם:  
   **`PalGate-API-Collection.json`**

5. מהשורש של הפרויקט הרץ:
   ```bash
   node test/compare-postman-to-node.js
   ```
   הסקריפט ישווה את כל ה-requests בקולקציה לפעולות בנוד וידווח:
   - מה חדש ב-Postman (להציע להוסיף לנוד)
   - מה קיים בנוד אבל לא בקולקציה
   - התאמות (אותו endpoint)

## הערה

בלי קובץ קולקציה בנתיב `postman/PalGate-API-Collection.json` אי אפשר להריץ השוואה אוטומטית. אחרי ייצוא ושמירה – הרץ את הסקריפט ועדכן את הנוד לפי הדוח.
