/**
 * Test the fixed delete operation
 * Tests the CORRECT API format: POST /api1/place/{placeId}/delete-many-users
 * Body: { "userList": ["phoneNumber"] }
 */

const https = require('https');

const CONFIG = {
  apiBase: 'https://portal.pal-es.com',
  credentials: {
    username: 'REDACTED_EMAIL',
    password: 'REDACTED_PASSWORD'
  },
  placeId: '3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad',
  testPhone: '972561239876'
};

let token = null;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.apiBase);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'X-Access-Token': token } : {})
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testDeleteFix() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     Testing Fixed Delete Operation                               ║');
  console.log('║     CORRECT FORMAT: POST /delete-many-users                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  // 1. Login
  console.log('[1/5] Logging in...');
  const login = await request('POST', '/api1/user/login1', CONFIG.credentials);
  
  if (login.status === 200 && (login.body.user?.token || login.body.token)) {
    token = login.body.user?.token || login.body.token;
    console.log('   [PASS] Login successful\n');
  } else {
    console.log('   [FAIL] Login failed\n');
    return;
  }
  
  // 2. Get users before
  console.log('[2/5] Getting users before delete...');
  const before = await request('GET', `/api1/place/${CONFIG.placeId}/users`);
  let usersBefore = 0;
  if (before.status === 200) {
    const users = Array.isArray(before.body) ? before.body :
                  before.body.users?.list || before.body.users || before.body.data || [];
    usersBefore = Array.isArray(users) ? users.length : 0;
  }
  console.log(`   Users count before: ${usersBefore}\n`);
  
  // 3. First, add a test user (so we have something to delete)
  console.log('[3/5] Adding test user...');
  const addResult = await request('POST', `/api1/place/${CONFIG.placeId}/user`, {
    id: CONFIG.testPhone,
    firstname: 'Test',
    lastname: 'Delete'
  });
  
  if (addResult.status === 200 || addResult.status === 409) {
    console.log(`   [PASS] User added or already exists (${addResult.status})\n`);
  } else {
    console.log(`   [WARN] Add result: ${addResult.status}\n`);
  }
  
  // 4. Test the CORRECT delete format
  console.log('[4/5] Testing CORRECT delete format...');
  console.log('   Method: POST');
  console.log(`   Endpoint: /api1/place/${CONFIG.placeId}/delete-many-users`);
  console.log(`   Body: { "userList": ["${CONFIG.testPhone}"] }`);
  console.log('');
  
  const deleteResult = await request(
    'POST',  // CORRECT METHOD
    `/api1/place/${CONFIG.placeId}/delete-many-users`,  // CORRECT ENDPOINT
    { userList: [CONFIG.testPhone] }  // CORRECT BODY FORMAT
  );
  
  console.log(`   Response status: ${deleteResult.status}`);
  console.log(`   Response body: ${JSON.stringify(deleteResult.body)}`);
  console.log('');
  
  if (deleteResult.status === 200 && deleteResult.body.errId === 0) {
    console.log('   [PASS] DELETE TEST PASSED!');
    console.log(`   Message: ${deleteResult.body.msg || 'Success'}\n`);
  } else {
    console.log('   [FAIL] DELETE TEST FAILED');
    console.log(`   Error: ${deleteResult.body.err || deleteResult.body.error || 'Unknown'}\n`);
  }
  
  // 5. Verify deletion
  console.log('[5/5] Verifying deletion...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for API to process
  
  const after = await request('GET', `/api1/place/${CONFIG.placeId}/users`);
  let usersAfter = 0;
  if (after.status === 200) {
    const users = Array.isArray(after.body) ? after.body :
                  after.body.users?.list || after.body.users || after.body.data || [];
    usersAfter = Array.isArray(users) ? users.length : 0;
  }
  
  console.log(`   Users count after: ${usersAfter}`);
  
  // Calculate deleted count (accounting for the user we added)
  const deletedCount = usersBefore - usersAfter;
  console.log(`   Users deleted: ${deletedCount}`);
  
  if (deletedCount === 1) {
    console.log('\n   [PASS] VERIFICATION PASSED - Only 1 user deleted!');
  } else if (usersAfter === 0 && usersBefore > 0) {
    console.log('\n   [FAIL] CRITICAL: ALL users were deleted!');
  } else {
    console.log(`\n   [WARN] Unexpected result: ${deletedCount} users deleted`);
  }
  
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST COMPLETE                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
}

testDeleteFix().catch(err => {
  console.error('\n[FAIL] Test crashed:', err.message);
  process.exit(1);
});
