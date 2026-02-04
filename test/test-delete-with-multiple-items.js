/**
 * בדיקה מדויקת של מה שקורה כשיש multiple items
 * סימולציה של מה ש-n8n עושה עם 2 פריטים
 */

const https = require('https');

// Load from env only. Do NOT commit real credentials.
function loadConfig() {
  const u = process.env.PAL_USERNAME, p = process.env.PAL_PASSWORD;
  const placeId = process.env.PAL_PLACE_ID || process.env.PLACE_ID;
  const testPhone = process.env.PHONE || process.env.PAL_PHONE;
  if (!u || !p || !placeId || !testPhone) {
    console.error('Set env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PHONE');
    process.exit(1);
  }
  return {
    apiBase: process.env.PAL_API_BASE || 'https://portal.pal-es.com',
    credentials: { username: u, password: p },
    placeId,
    testPhone,
  };
}
const CONFIG = loadConfig();

let token = null;

function request(method, path, body = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.apiBase);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...customHeaders
      },
      timeout: 10000
    };

    console.log('\n' + '═'.repeat(70));
    console.log(`📤 ${method} ${url.pathname}`);
    console.log('═'.repeat(70));
    if (body) {
      console.log('Body:');
      console.log(JSON.stringify(body, null, 2));
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log(`📥 Response Status: ${res.statusCode}`);
        console.log('═'.repeat(70));
        console.log('Response Body:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('═'.repeat(70));
        
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          body: parsed
        });
      });
    });

    req.on('error', (e) => {
      console.log(`\n❌ Request Error: ${e.message}`);
      resolve({ status: 0, ok: false, error: e.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('\n⏱️ Request Timeout');
      resolve({ status: 0, ok: false, error: 'Request timeout' });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testLogin() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 1: התחברות                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const result = await request('POST', '/api1/user/login1', CONFIG.credentials);
  
  if (result.ok && (result.body.user?.token || result.body.token)) {
    token = result.body.user?.token || result.body.token;
    console.log('\n✅ התחברות הצליחה');
    return true;
  }
  
  console.log('\n❌ התחברות נכשלה');
  return false;
}

// סימולציה של מה ש-n8n עושה עם value expression
function simulateN8nValueExpression(inputValue, itemIndex = 0) {
  console.log('\n' + '═'.repeat(70));
  console.log(`🔍 סימולציה של value expression (Item ${itemIndex})`);
  console.log('═'.repeat(70));
  console.log(`Input value: ${JSON.stringify(inputValue)}`);
  console.log(`Input type: ${typeof inputValue}`);
  console.log(`Is array: ${Array.isArray(inputValue)}`);
  
  // זה מה שה-value expression עושה:
  try {
    // 1. בדיקה אם יש ערך
    if (!inputValue && inputValue !== 0) {
      throw new Error('CRITICAL SAFETY: Phone number is required. Empty userList would delete ALL users.');
    }
    
    // 2. המרה למערך
    const arr = Array.isArray(inputValue) ? inputValue : [inputValue];
    console.log(`After converting to array: ${JSON.stringify(arr)}`);
    
    // 3. סינון ערכים ריקים
    const valid = arr.filter(v => v !== null && v !== undefined && v !== "" && (typeof v === "string" || typeof v === "number"));
    console.log(`After filtering: ${JSON.stringify(valid)}`);
    
    if (valid.length === 0) {
      throw new Error('CRITICAL SAFETY: Phone number is required.');
    }
    
    // 4. פורמט מספרי טלפון
    const formatted = valid.map(phone => {
      let clean = String(phone).trim().replace(/[\s\-\(\)]/g, '');
      console.log(`\nProcessing phone: ${phone}`);
      console.log(`  After trim/replace: ${clean}`);
      
      if (clean.startsWith('0')) {
        clean = '972' + clean.substring(1);
        console.log(`  After 0->972 conversion: ${clean}`);
      }
      
      if (!clean.startsWith('972') && !clean.startsWith('+972')) {
        clean = '972' + clean;
        console.log(`  After adding 972: ${clean}`);
      }
      
      clean = clean.replace('+', '');
      console.log(`  Final: ${clean}`);
      
      return clean;
    });
    
    console.log(`\n✅ Final formatted array: ${JSON.stringify(formatted)}`);
    return formatted;
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    throw error;
  }
}

// בדיקה: מה קורה כש-n8n מעביר את הערך ישירות (לא דרך expression)
async function testDirectValue() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקה: ערך ישיר מהביטוי                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // סימולציה: n8n מעביר את הערך מהביטוי 972{{ $json.M_phone }}
  // Use env phone (e.g. 972XXXXXXXXX)
  const directValue = CONFIG.testPhone;
  
  console.log(`\nDirect value from expression: ${directValue}`);
  const formatted = simulateN8nValueExpression(directValue);
  
  const deleteBody = {
    userList: formatted
  };
  
  console.log(`\n📋 Request body: ${JSON.stringify(deleteBody)}`);
  
  const result = await request(
    'POST',
    `/api1/place/${CONFIG.placeId}/delete-many-users`,
    deleteBody,
    { 'X-Access-Token': token }
  );
  
  if (result.ok && result.body.errId === 0) {
    console.log('\n✅✅✅ המחיקה הצליחה! ✅✅✅');
  } else {
    console.log('\n❌❌❌ המחיקה נכשלה! ❌❌❌');
    console.log(`Error: ${JSON.stringify(result.body)}`);
  }
  
  return result.ok;
}

// בדיקה: מה קורה כש-n8n מעביר array של פריטים
async function testMultipleItems() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקה: מה קורה עם multiple items                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // סימולציה: n8n מעביר 2 פריטים, כל אחד עם הביטוי 972{{ $json.M_phone }}
  // Item 0 and 1: same phone from env
  
  const items = [
    { M_phone: '525904030' },
    { M_phone: '525904030' }
  ];
  
  console.log(`\n📋 Simulating ${items.length} items from n8n`);
  
  // מה ש-n8n עושה: הוא מריץ את ה-value expression על כל פריט בנפרד
  // אבל ה-routing.send יכול לקבל את הערך מהפריט הנוכחי
  
  // סימולציה: מה קורה עם כל פריט
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const expressionResult = `972${item.M_phone}`; // זה מה שהביטוי מחזיר
    
    console.log(`\n\n📦 Item ${i}:`);
    console.log(`  M_phone: ${item.M_phone}`);
    console.log(`  Expression result: ${expressionResult}`);
    
    const formatted = simulateN8nValueExpression(expressionResult, i);
    
    const deleteBody = {
      userList: formatted
    };
    
    console.log(`\n📋 Request body for item ${i}: ${JSON.stringify(deleteBody)}`);
    
    // רק נבדוק את הפריט הראשון (לא נמחק בפועל)
    if (i === 0) {
      console.log('\n⚠️ Skipping actual delete - just testing format');
      break;
    }
  }
}

// בדיקה: מה קורה אם הערך הוא array כבר
async function testArrayValue() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקה: מה קורה אם הערך הוא array                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // סימולציה: מה אם n8n מעביר array ישירות?
  const arrayValue = [CONFIG.testPhone, CONFIG.testPhone];
  
  console.log(`\nArray value: ${JSON.stringify(arrayValue)}`);
  const formatted = simulateN8nValueExpression(arrayValue);
  
  const deleteBody = {
    userList: formatted
  };
  
  console.log(`\n📋 Request body: ${JSON.stringify(deleteBody)}`);
  
  // בדיקה: האם זה הפורמט הנכון?
  if (Array.isArray(deleteBody.userList) && deleteBody.userList.length > 0) {
    console.log('\n✅ Format looks correct');
  } else {
    console.log('\n❌ Format issue detected');
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקת מחיקה עם multiple items                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (!await testLogin()) {
    console.log('\n❌ לא ניתן להמשיך ללא התחברות');
    return;
  }
  
  // בדיקה 1: ערך ישיר
  await testDirectValue();
  
  // המתן קצת
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // בדיקה 2: multiple items
  await testMultipleItems();
  
  // בדיקה 3: array value
  await testArrayValue();
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     סיכום                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n✅ בדיקות הושלמו');
  console.log('📋 בדוק את הלוגים למעלה כדי לראות מה בדיוק נשלח');
}

main().catch(err => {
  console.error('\n💥 הבדיקה קרסה:');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
