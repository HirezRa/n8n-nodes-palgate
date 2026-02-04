/**
 * בדיקה מדויקת של פעולת מחיקת משתמש
 * שולח בדיוק כמו שהנוד של n8n שולח
 * Phone: 972525904030
 */

const https = require('https');

const CONFIG = {
  apiBase: 'https://portal.pal-es.com',
  credentials: {
    username: 'REDACTED_EMAIL',
    password: 'REDACTED_PASSWORD'
  },
  placeId: '3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad',
  phoneToDelete: '972525904030'
};

let token = null;

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT - בדיוק כמו שהנוד שולח
// ═══════════════════════════════════════════════════════════════

function makeRequest(method, path, body = null, customHeaders = {}) {
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
        console.log(`  ${key}: ${value ? value.substring(0, 20) + '...' : 'null'}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    if (body) {
      console.log('\nBody:');
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
        console.log('Response Headers:');
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`  ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
        });
        console.log('\nResponse Body:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('═'.repeat(70));
        
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          headers: res.headers,
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

// ═══════════════════════════════════════════════════════════════
// בדיקות
// ═══════════════════════════════════════════════════════════════

async function testLogin() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 1: התחברות                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const result = await makeRequest('POST', '/api1/user/login1', CONFIG.credentials);
  
  if (result.ok && (result.body.user?.token || result.body.token)) {
    token = result.body.user?.token || result.body.token;
    console.log('\n✅ התחברות הצליחה');
    console.log(`Token: ${token.substring(0, 30)}...`);
    return true;
  }
  
  console.log('\n❌ התחברות נכשלה');
  return false;
}

async function checkUserExists() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 2: בדיקה אם המשתמש קיים                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const result = await makeRequest(
    'GET',
    `/api1/place/${CONFIG.placeId}/users?filter=${CONFIG.phoneToDelete}`,
    null,
    { 'X-Access-Token': token }
  );
  
  if (result.ok) {
    const users = result.body.users?.list || result.body.list || [];
    const found = Array.isArray(users) ? users.find(u => {
      const phone = String(u._id || u.M_phone || u.phone || '');
      return phone.includes('525904030') || phone === CONFIG.phoneToDelete;
    }) : null;
    
    if (found) {
      console.log('\n✅ המשתמש נמצא במערכת');
      console.log(`Phone: ${found._id || found.M_phone || found.phone}`);
      return true;
    } else {
      console.log('\n⚠️ המשתמש לא נמצא - נוסיף אותו לבדיקה');
      return false;
    }
  }
  
  return false;
}

async function addTestUser() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 3: הוספת משתמש לבדיקה                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const result = await makeRequest(
    'POST',
    `/api1/place/${CONFIG.placeId}/user`,
    {
      id: CONFIG.phoneToDelete,
      firstname: 'בדיקה',
      lastname: 'מחיקה'
    },
    { 'X-Access-Token': token }
  );
  
  if (result.ok || result.status === 409) {
    console.log('\n✅ המשתמש נוסף (או כבר קיים)');
    return true;
  }
  
  console.log('\n❌ הוספת משתמש נכשלה');
  return false;
}

async function testDeleteExactNodeFormat() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 4: מחיקת משתמש - בדיוק כמו הנוד של n8n              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // ═══════════════════════════════════════════════════════════════
  // הפורמט המדויק שהנוד של n8n שולח:
  // Method: POST
  // Endpoint: /api1/place/{placeId}/delete-many-users
  // Body: { "userList": ["972525904030"] }
  // Headers: X-Access-Token: {token}
  // ═══════════════════════════════════════════════════════════════
  
  const endpoint = `/api1/place/${CONFIG.placeId}/delete-many-users`;
  const body = {
    userList: [CONFIG.phoneToDelete]  // בדיוק כמו שהנוד שולח
  };
  
  console.log('\n📋 פרטי הבקשה (כמו שהנוד שולח):');
  console.log(`Method: POST`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Body: ${JSON.stringify(body)}`);
  console.log(`Header: X-Access-Token: ${token.substring(0, 30)}...`);
  
  const result = await makeRequest(
    'POST',
    endpoint,
    body,
    { 'X-Access-Token': token }
  );
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     תוצאות המחיקה                                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (result.ok && result.body.errId === 0) {
    console.log('\n✅✅✅ המחיקה הצליחה! ✅✅✅');
    console.log(`Message: ${result.body.msg || 'Success'}`);
    return true;
  } else {
    console.log('\n❌❌❌ המחיקה נכשלה! ❌❌❌');
    console.log(`Status: ${result.status}`);
    console.log(`Error ID: ${result.body.errId || 'N/A'}`);
    console.log(`Error Message: ${result.body.err || result.body.msg || 'Unknown error'}`);
    console.log(`Full Response: ${JSON.stringify(result.body)}`);
    return false;
  }
}

async function verifyDeletion() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     שלב 5: אימות המחיקה                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // המתן קצת כדי שהשרת יעדכן
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const result = await makeRequest(
    'GET',
    `/api1/place/${CONFIG.placeId}/users?filter=${CONFIG.phoneToDelete}`,
    null,
    { 'X-Access-Token': token }
  );
  
  if (result.ok) {
    const users = result.body.users?.list || result.body.list || [];
    const found = Array.isArray(users) ? users.find(u => {
      const phone = String(u._id || u.M_phone || u.phone || '');
      return phone.includes('525904030') || phone === CONFIG.phoneToDelete;
    }) : null;
    
    if (found) {
      console.log('\n❌ המשתמש עדיין קיים - המחיקה לא הצליחה');
      return false;
    } else {
      console.log('\n✅ המשתמש נמחק בהצלחה');
      return true;
    }
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════
// הרצת הבדיקה המלאה
// ═══════════════════════════════════════════════════════════════

async function runFullTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     בדיקת פעולת מחיקת משתמש - פורמט מדויק של נוד n8n      ║');
  console.log('║     Phone: 972525904030                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // שלב 1: התחברות
  if (!await testLogin()) {
    console.log('\n❌ לא ניתן להמשיך ללא התחברות');
    return;
  }
  
  // שלב 2: בדיקה אם המשתמש קיים
  const userExists = await checkUserExists();
  
  // שלב 3: הוספת משתמש אם לא קיים
  if (!userExists) {
    await addTestUser();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // שלב 4: מחיקה בדיוק כמו הנוד
  const deleteSuccess = await testDeleteExactNodeFormat();
  
  // שלב 5: אימות
  if (deleteSuccess) {
    await verifyDeletion();
  }
  
  // סיכום
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     סיכום הבדיקה                                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (deleteSuccess) {
    console.log('\n✅ הבדיקה הושלמה בהצלחה');
    console.log('✅ הפורמט שהנוד שולח נכון');
    console.log('✅ המחיקה עובדת כצפוי');
  } else {
    console.log('\n❌ הבדיקה זיהתה בעיה');
    console.log('❌ יש לבדוק את הלוגים למעלה');
    console.log('❌ ייתכן שצריך לתקן את הפורמט');
  }
}

// הרצה
runFullTest().catch(err => {
  console.error('\n💥 הבדיקה קרסה:');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});
