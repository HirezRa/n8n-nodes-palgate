# סנכרון עם Postman EzTest

אחרי עדכון בקולקציית Postman (EzTest), כך תזהה שינויים ותעדכן את הנוד.

## שלב 1: ייצוא הקולקציה מ-Postman

1. Open your Postman workspace and the PAL Gate API collection (do not commit or share workspace URLs).
2. ⋯ (View more actions) → **Export** → **Collection v2.1** → שמור קובץ.
3. שמור את הקובץ בפרויקט:  
   **`postman/PalGate-API-Collection.json`**  
   (או הרץ את סקריפט ההשוואה עם נתיב מלא, ראה למטה.)

## שלב 2: הרצת השוואה

משורש הפרויקט:

```bash
node test/compare-postman-to-node.js
```

או עם נתיב לקובץ קולקציה:

```bash
node test/compare-postman-to-node.js "C:\path\to\exported-collection.json"
```

הסקריפט מדפיס:

- **Only in Postman** – endpoints שקיימים בקולקציה אבל לא בנוד → מומלץ להוסיף לנוד.
- **Only in Node** – פעולות שקיימות בנוד אבל לא הותאמו ל-request בקולקציה (או חסרות שם) → לבדוק אם לשמור/לעדכן.
- **Matched** – התאמה בין קולקציה לנוד.

## שלב 3: עדכון הממשק (הנוד)

1. **להוספת פעולה חדשה (רק ב-Postman):**
   - בחר Resource מתאים (או צור resource חדש ב-`PalGate.node.ts`).
   - הוסף אופציה חדשה ב-`resources/<resource>/index.ts` (במערך `options`).
   - הוסף קובץ תיאור פרמטרים אם נדרש (למשל `getX.ts`) ו-import ב-`index.ts`.
   - עדכן את `requestDefaults` / `url` ו-`qs` לפי ה-request ב-Postman.

2. **לשינוי endpoint קיים:**
   - עדכן ב-`resources/<resource>/index.ts` את ה-`url` או ה-`qs` ב-`routing.request` כך שיתאימו ל-Postman.

3. **לאחר עדכונים:**
   - `npm run lint`
   - `npm run build`
   - הרץ שוב `node test/compare-postman-to-node.js` כדי לוודא שהכל מסונכרן.

## רשימת הפעולות הנוכחיות בנוד (בסיס להשוואה)

נכון למועד יצירת המסמך – 29 פעולות:

| Resource     | Operations |
|-------------|------------|
| Auth        | testConnection |
| User        | add, addMany, delete, find, getAll, getPortalUsers, update, updateByPhone |
| Car         | add, delete, deleteById, searchInLogs |
| Place       | getDetails, getGroups, getTree, getUsers |
| Device      | getDetails, getAll, getLog, getUsers, getLiveStatusHistory, getStatusHistoryV2 |
| Organization| getTree, getDetails |
| Dashboard   | getDevicesMarkers, getFavorites, getRecent, getStatistics |

פירוט מלא של method + path מודפס בהרצת הסקריפט בלי קובץ קולקציה.
