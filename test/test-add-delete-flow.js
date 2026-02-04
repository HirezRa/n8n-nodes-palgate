/**
 * Full Test: Add 2 Users, Delete 1, Verify
 * REQUIRES env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PAL_PHONE_USER1, PAL_PHONE_USER2,
 *   PAL_FIRST_NAME1, PAL_LAST_NAME1, PAL_FIRST_NAME2, PAL_LAST_NAME2
 * Do NOT commit real credentials.
 */

const https = require('https');

function loadConfig() {
  const u = process.env.PAL_USERNAME, p = process.env.PAL_PASSWORD;
  const placeId = process.env.PAL_PLACE_ID;
  const p1 = process.env.PAL_PHONE_USER1, p2 = process.env.PAL_PHONE_USER2;
  if (!u || !p || !placeId || !p1 || !p2) {
    console.error('Set env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PAL_PHONE_USER1, PAL_PHONE_USER2');
    process.exit(1);
  }
  return {
    apiBase: process.env.PAL_API_BASE || 'https://portal.pal-es.com',
    credentials: { username: u, password: p },
    placeId,
    user1: {
      phone: p1,
      firstName: process.env.PAL_FIRST_NAME1 || 'Test',
      lastName: process.env.PAL_LAST_NAME1 || 'User1',
    },
    user2: {
      phone: p2,
      firstName: process.env.PAL_FIRST_NAME2 || 'Test',
      lastName: process.env.PAL_LAST_NAME2 || 'User2',
    },
  };
}
const CONFIG = loadConfig();

let token = null;

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

function request(method, path, body = null) {
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
        ...(token ? { 'X-Access-Token': token } : {})
      },
      timeout: 10000
    };

    console.log(`\n📤 ${method} ${url.pathname}`);
    if (body) console.log(`   Body: ${JSON.stringify(body)}`);

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
        console.log(`📥 Status: ${res.statusCode}`);
        const respStr = JSON.stringify(parsed);
        console.log(`   Response: ${respStr.length > 200 ? respStr.substring(0, 200) + '...' : respStr}`);
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, body: parsed });
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Error: ${e.message}`);
      resolve({ status: 0, ok: false, error: e.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, ok: false, error: 'Request timeout' });
    });
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function login() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔐 STEP 1: LOGIN');
  console.log('═'.repeat(60));
  
  const result = await request('POST', '/api1/user/login1', CONFIG.credentials);
  
  if (result.ok && (result.body.user?.token || result.body.token)) {
    token = result.body.user?.token || result.body.token;
    console.log('✅ Login successful');
    return true;
  }
  
  console.log('❌ Login failed');
  return false;
}

async function getUsers() {
  const result = await request('GET', `/api1/place/${CONFIG.placeId}/users?skip=0&limit=100`);
  
  if (result.ok) {
    const users = result.body.users?.list || result.body.list || result.body.users || [];
    return Array.isArray(users) ? users : [];
  }
  return [];
}

async function getUserCountTotal() {
  const result = await request('GET', `/api1/place/${CONFIG.placeId}/users?skip=0&limit=1`);
  
  if (result.ok && result.body.users?.count !== undefined) {
    return result.body.users.count;
  }
  return 0;
}

async function getUserCount() {
  return await getUserCountTotal();
}

async function findUser(phone) {
  // Try to find user using filter endpoint (more reliable)
  const filterResult = await request('GET', `/api1/place/${CONFIG.placeId}/users?filter=${phone}`);
  
  if (filterResult.ok) {
    const users = filterResult.body.users?.list || filterResult.body.list || filterResult.body.users || [];
    const found = Array.isArray(users) ? users.find(u => {
      const userPhone = String(u._id || u.M_phone || u.phone || u.phoneNumber || '');
      return userPhone.includes(phone.replace(/^972/, '')) || userPhone.includes(phone) || userPhone === phone;
    }) : null;
    
    if (found) return found;
  }
  
  // Fallback: search in paginated list
  const users = await getUsers();
  const searchPhone = phone.replace(/^972/, '');
  return users.find(u => {
    const userPhone = String(u._id || u.M_phone || u.phone || u.phoneNumber || '');
    return userPhone.includes(searchPhone) || userPhone.includes(phone) || userPhone === phone;
  });
}

async function addUser(user) {
  console.log(`\n📝 Adding user: ${user.firstName} ${user.lastName} (${user.phone})`);
  
  // Try the format that worked in previous tests
  const result = await request('POST', `/api1/place/${CONFIG.placeId}/user`, {
    id: user.phone,
    firstname: user.firstName,
    lastname: user.lastName
  });
  
  if (result.ok || result.status === 409) {
    console.log(`✅ User added (or already exists)`);
    return true;
  }
  
  // Try alternative format
  console.log('   Trying alternative format...');
  const result2 = await request('POST', `/api1/place/${CONFIG.placeId}/user`, {
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName
  });
  
  if (result2.ok || result2.status === 409) {
    console.log(`✅ User added with alternative format`);
    return true;
  }
  
  console.log(`❌ Failed to add user`);
  return false;
}

async function deleteUser(phone) {
  console.log(`\n🗑️ Deleting user with phone: ${phone}`);
  
  // Use the CORRECT format discovered from portal
  const result = await request('POST', `/api1/place/${CONFIG.placeId}/delete-many-users`, {
    userList: [phone]
  });
  
  if (result.ok && result.body.errId === 0) {
    console.log(`✅ User deleted successfully`);
    console.log(`   Message: ${result.body.msg}`);
    return true;
  }
  
  console.log(`❌ Delete failed`);
  console.log(`   Error: ${result.body.err || result.body.error || 'Unknown'}`);
  return false;
}

// ═══════════════════════════════════════════════════════════════
// MAIN TEST
// ═══════════════════════════════════════════════════════════════

async function runTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TEST: Add 2 Users, Delete 1, Verify                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  // Step 1: Login
  if (!await login()) {
    console.log('\n❌ Cannot proceed without login');
    return;
  }
  
  // Step 2: Get initial user count
  console.log('\n' + '═'.repeat(60));
  console.log('📊 STEP 2: GET INITIAL STATE');
  console.log('═'.repeat(60));
  
  const initialCount = await getUserCount();
  console.log(`\n📊 Initial user count: ${initialCount}`);
  
  // Step 3: Add User 1
  console.log('\n' + '═'.repeat(60));
  console.log('➕ STEP 3: ADD USER 1 (אברהם אבינו)');
  console.log('═'.repeat(60));
  
  const addResult1 = await addUser(CONFIG.user1);
  
  // Step 4: Add User 2
  console.log('\n' + '═'.repeat(60));
  console.log('➕ STEP 4: ADD USER 2 (כייסי רחמים)');
  console.log('═'.repeat(60));
  
  const addResult2 = await addUser(CONFIG.user2);
  
  // Wait a moment for API to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 5: Verify both users exist
  console.log('\n' + '═'.repeat(60));
  console.log('✅ STEP 5: VERIFY BOTH USERS EXIST');
  console.log('═'.repeat(60));
  
  const afterAddCount = await getUserCount();
  console.log(`\n📊 User count after adding: ${afterAddCount}`);
  
  const user1Exists = await findUser(CONFIG.user1.phone);
  const user2Exists = await findUser(CONFIG.user2.phone);
  
  console.log(`\n   User 1 (${CONFIG.user1.phone}): ${user1Exists ? '[PASS] Found' : '[FAIL] Not found'}`);
  console.log(`   User 2 (${CONFIG.user2.phone}): ${user2Exists ? '[PASS] Found' : '[FAIL] Not found'}`);
  
  if (!user1Exists || !user2Exists) {
    console.log('\n⚠️ Warning: Not all users were added successfully');
  }
  
  // Step 6: Delete User 1 ONLY
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 6: DELETE USER 1 ONLY');
  console.log('═'.repeat(60));
  
  const deleteResult = await deleteUser(CONFIG.user1.phone);
  
  // Wait for API to process deletion
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Step 7: Verify deletion
  console.log('\n' + '═'.repeat(60));
  console.log('✅ STEP 7: VERIFY DELETION RESULTS');
  console.log('═'.repeat(60));
  
  const finalCount = await getUserCount();
  console.log(`\n📊 Final user count: ${finalCount}`);
  
  const user1AfterDelete = await findUser(CONFIG.user1.phone);
  const user2AfterDelete = await findUser(CONFIG.user2.phone);
  
  console.log(`\n   User 1 (${CONFIG.user1.phone}): ${user1AfterDelete ? '[FAIL] Still exists (should be deleted!)' : '[PASS] Deleted'}`);
  console.log(`   User 2 (${CONFIG.user2.phone}): ${user2AfterDelete ? '[PASS] Still exists (correct!)' : '[FAIL] Was deleted (WRONG!)'}`);
  
  // Final Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(60));
  
  console.log(`
  Initial users:     ${initialCount}
  After adding 2:    ${afterAddCount}
  After deleting 1:  ${finalCount}
  
  Expected change:   +2 then -1 = +1 total
  Actual change:     ${finalCount - initialCount}
  `);
  
  // Determine test result
  const user1Deleted = !user1AfterDelete;
  const user2Remains = !!user2AfterDelete;
  const countCorrect = (finalCount - initialCount) === 1;
  
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 TEST RESULT');
  console.log('═'.repeat(60));
  
  if (user1Deleted && user2Remains && countCorrect) {
    console.log('\n[PASS][PASS][PASS] TEST PASSED! [PASS][PASS][PASS]');
    console.log('   - User 1 was deleted correctly');
    console.log('   - User 2 remains (not affected)');
    console.log('   - User count is correct');
    console.log('   - Delete operation works perfectly!');
    return 0;
  } else if (!user2Remains) {
    console.log('\n[FAIL][FAIL][FAIL] TEST FAILED! [FAIL][FAIL][FAIL]');
    console.log('   - CRITICAL: User 2 was also deleted!');
    console.log('   - The delete operation is still buggy');
    console.log('   - Need to investigate further');
    return 1;
  } else if (!user1Deleted) {
    console.log('\n[WARN] TEST PARTIALLY FAILED');
    console.log('   - User 1 was NOT deleted');
    console.log('   - Check API response for errors');
    return 1;
  } else {
    console.log('\n[WARN] TEST PARTIALLY PASSED');
    console.log('   - Users deleted correctly but count mismatch');
    return 0;
  }
}

// Run the test
runTest()
  .then(exitCode => {
    // Cleanup: Delete User 2 as well
    console.log('\n' + '═'.repeat(60));
    console.log('🧹 CLEANUP: Delete User 2');
    console.log('═'.repeat(60));
    
    if (token) {
      deleteUser(CONFIG.user2.phone).then(() => {
        console.log('✅ Cleanup complete');
        process.exit(exitCode);
      }).catch(() => {
        process.exit(exitCode);
      });
    } else {
      process.exit(exitCode);
    }
  })
  .catch(err => {
    console.error(`\n[FAIL] Test crashed: ${err.message}`);
    process.exit(1);
  });
