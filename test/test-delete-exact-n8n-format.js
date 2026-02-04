/**
 * בדיקה מדויקת של מה ש-n8n שולח
 * בדיקה של הפורמט המדויק שהנוד שולח
 */

const https = require('https');

// Load from env only. Do NOT commit real credentials.
function loadConfig() {
  const u = process.env.PAL_USERNAME, p = process.env.PAL_PASSWORD;
  const placeId = process.env.PAL_PLACE_ID || process.env.PLACE_ID;
  const phoneToDelete = process.env.PHONE || process.env.PAL_PHONE;
  if (!u || !p || !placeId || !phoneToDelete) {
    console.error('Set env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PHONE');
    process.exit(1);
  }
  return {
    apiBase: process.env.PAL_API_BASE || 'https://portal.pal-es.com',
    credentials: { username: u, password: p },
    placeId,
    phoneToDelete,
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
    console.log('Headers:');
    Object.entries(options.headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('token')) {
        console.log(`  ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    if (body) {
      console.log('\nBody (JSON):');
      console.log(JSON.stringify(body, null, 2));
      console.log('\nBody (Raw):');
      console.log(JSON.stringify(body));
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
      console.log('\n❌ Request Error:');
      console.log(e.message);
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

async function testDeleteWithDifferentFormats() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקת פורמטים שונים של מחיקה                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const endpoint = `/api1/place/${CONFIG.placeId}/delete-many-users`;
  
  // פורמט 1: כמו שהנוד אמור לשלוח (userList עם מספר אחד)
  console.log('\n📋 פורמט 1: userList עם מספר אחד (כמו שהנוד שולח)');
  const format1 = await request(
    'POST',
    endpoint,
    { userList: [CONFIG.phoneToDelete] },
    { 'X-Access-Token': token }
  );
  
  console.log(`\nתוצאה: ${format1.ok ? '✅ הצליח' : '❌ נכשל'}`);
  if (!format1.ok) {
    console.log(`Error: ${JSON.stringify(format1.body)}`);
  }
  
  // פורמט 2: userList עם מספר כסטרינג ללא 972
  console.log('\n📋 פורמט 2: userList עם מספר ללא 972 (525904030)');
  const format2 = await request(
    'POST',
    endpoint,
    { userList: ['525904030'] },
    { 'X-Access-Token': token }
  );
  
  console.log(`\nתוצאה: ${format2.ok ? '✅ הצליח' : '❌ נכשל'}`);
  if (!format2.ok) {
    console.log(`Error: ${JSON.stringify(format2.body)}`);
  }
  
  // פורמט 3: userList עם מספר כסטרינג עם 0 בתחילה
  console.log('\n📋 פורמט 3: userList עם מספר עם 0 (0525904030)');
  const format3 = await request(
    'POST',
    endpoint,
    { userList: ['0525904030'] },
    { 'X-Access-Token': token }
  );
  
  console.log(`\nתוצאה: ${format3.ok ? '✅ הצליח' : '❌ נכשל'}`);
  if (!format3.ok) {
    console.log(`Error: ${JSON.stringify(format3.body)}`);
  }
  
  // פורמט 4: userList עם מספר כנומרי (ללא מרכאות)
  console.log('\n📋 פורמט 4: userList עם מספר כנומרי (CONFIG.phoneToDelete)');
  const format4 = await request(
    'POST',
    endpoint,
    { userList: [CONFIG.phoneToDelete] }, // ללא מרכאות - מספר
    { 'X-Access-Token': token }
  );
  
  console.log(`\nתוצאה: ${format4.ok ? '✅ הצליח' : '❌ נכשל'}`);
  if (!format4.ok) {
    console.log(`Error: ${JSON.stringify(format4.body)}`);
  }
  
  // פורמט 5: בדיקה עם מספרים מרובים (כדי לראות אם זה משנה)
  console.log('\n📋 פורמט 5: userList עם מספרים מרובים');
  const format5 = await request(
    'POST',
    endpoint,
    { userList: [CONFIG.phoneToDelete, CONFIG.phoneToDelete] },
    { 'X-Access-Token': token }
  );
  
  console.log(`\nתוצאה: ${format5.ok ? '✅ הצליח' : '❌ נכשל'}`);
  if (!format5.ok) {
    console.log(`Error: ${JSON.stringify(format5.body)}`);
  }
  
  // סיכום
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     סיכום תוצאות                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const results = [
    { name: 'פורמט 1: userList: ["CONFIG.phoneToDelete"]', success: format1.ok, error: format1.body },
    { name: 'פורמט 2: userList: ["525904030"]', success: format2.ok, error: format2.body },
    { name: 'פורמט 3: userList: ["0525904030"]', success: format3.ok, error: format3.body },
    { name: 'פורמט 4: userList: [CONFIG.phoneToDelete] (number)', success: format4.ok, error: format4.body },
    { name: 'פורמט 5: userList: [multiple]', success: format5.ok, error: format5.body }
  ];
  
  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.name}`);
    if (r.success) {
      console.log('   ✅ הצליח');
    } else {
      console.log('   ❌ נכשל');
      console.log(`   Error: ${JSON.stringify(r.error)}`);
    }
  });
  
  // מציאת הפורמט שעובד
  const workingFormat = results.find(r => r.success);
  if (workingFormat) {
    console.log(`\n✅ הפורמט שעובד: ${workingFormat.name}`);
  } else {
    console.log('\n❌ אף פורמט לא עבד - צריך לבדוק יותר');
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקת פורמטים שונים של מחיקת משתמש                     ║');
  console.log('║     Phone: (from env PHONE / PAL_PHONE)                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (!await testLogin()) {
    console.log('\n❌ לא ניתן להמשיך ללא התחברות');
    return;
  }
  
  // הוספת משתמש לבדיקה (אם לא קיים)
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     הוספת משתמש לבדיקה (אם לא קיים)                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const addResult = await request(
    'POST',
    `/api1/place/${CONFIG.placeId}/user`,
    {
      id: CONFIG.phoneToDelete,
      firstname: 'בדיקה',
      lastname: 'מחיקה'
    },
    { 'X-Access-Token': token }
  );
  
  if (addResult.ok || addResult.status === 409) {
    console.log('\n✅ המשתמש קיים (או נוסף)');
  }
  
  // המתן קצת
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // בדיקת פורמטים שונים
  await testDeleteWithDifferentFormats();
}

main().catch(err => {
  console.error('\n💥 הבדיקה קרסה:');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
