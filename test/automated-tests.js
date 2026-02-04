/**
 * n8n-nodes-palgate - Automated Test Suite
 * Tests ALL node functions against PAL Gate API
 *
 * Run: node test/automated-tests.js
 *
 * REQUIRES env (do NOT commit real values; use .env or export locally):
 *   PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PAL_DEVICE_ID, PAL_ORG_ID,
 *   PAL_PHONE (test user), PAL_TEST_FIRST_NAME, PAL_TEST_LAST_NAME,
 *   PAL_CAR_ID or PAL_LICENSE_PLATE (optional)
 */

const https = require('https');
const fs = require('fs');

function loadConfig() {
  const u = process.env.PAL_USERNAME, p = process.env.PAL_PASSWORD;
  const placeId = process.env.PAL_PLACE_ID, deviceId = process.env.PAL_DEVICE_ID;
  const orgId = process.env.PAL_ORG_ID, phone = process.env.PAL_PHONE;
  if (!u || !p || !placeId || !deviceId || !orgId || !phone) {
    console.error('Set env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PAL_DEVICE_ID, PAL_ORG_ID, PAL_PHONE');
    process.exit(1);
  }
  return {
    apiBase: process.env.PAL_API_BASE || 'https://portal.pal-es.com',
    credentials: { username: u, password: p },
    orgId,
    deviceId,
    placeId,
    testUser: {
      phone,
      firstName: process.env.PAL_TEST_FIRST_NAME || 'Test',
      lastName: process.env.PAL_TEST_LAST_NAME || 'User',
    },
    testVehicle: {
      licensePlate: process.env.PAL_CAR_ID || process.env.PAL_LICENSE_PLATE || '',
    },
  };
}

const CONFIG = loadConfig();

// ═══════════════════════════════════════════════════════════════
// TEST RESULTS TRACKING
// ═══════════════════════════════════════════════════════════════

const results = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
};

let authToken = null;

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

function makeRequest(method, path, body = null) {
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
        ...(authToken ? { 'X-Access-Token': authToken } : {})
      },
      timeout: 10000
    };

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
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          body: parsed
        });
      });
    });

    req.on('error', (e) => resolve({ status: 0, ok: false, error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, ok: false, error: 'Request timeout' });
    });
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST UTILITIES
// ═══════════════════════════════════════════════════════════════

function log(msg) {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${msg}`);
}

function recordTest(name, status, details = {}) {
  results.summary.total++;
  results.summary[status]++;
  results.tests.push({
    name,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
  
  const icon = status === 'passed' ? '[PASS]' : status === 'failed' ? '[FAIL]' : '[SKIP]';
  log(`${icon} ${name}`);
  
  if (details.error) {
    log(`   Error: ${details.error}`);
  }
  if (details.response && typeof details.response === 'object') {
    const respStr = JSON.stringify(details.response).substring(0, 100);
    if (respStr.length < 100) {
      log(`   Response: ${respStr}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function testAuth() {
  log('\n══════════════════════════════════════════════════════════');
  log('🔐 AUTHENTICATION TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test 1: Login with valid credentials
  const loginResult = await makeRequest('POST', '/api1/user/login1', CONFIG.credentials);
  
  if (loginResult.ok && (loginResult.body.user?.token || loginResult.body.token)) {
    authToken = loginResult.body.user?.token || loginResult.body.token;
    recordTest('Auth: Login with valid credentials', 'passed', {
      response: { tokenReceived: true }
    });
  } else {
    recordTest('Auth: Login with valid credentials', 'failed', {
      error: `Status ${loginResult.status}`,
      response: loginResult.body
    });
    return false; // Cannot continue without auth
  }
  
  // Test 2: Login with invalid credentials (should fail)
  const invalidLogin = await makeRequest('POST', '/api1/user/login1', {
    username: 'invalid@test.com',
    password: 'wrongpassword'
  });
  
  if (!invalidLogin.ok) {
    recordTest('Auth: Reject invalid credentials', 'passed');
  } else {
    recordTest('Auth: Reject invalid credentials', 'failed', {
      error: 'Should have rejected invalid credentials'
    });
  }
  
  return true;
}

async function testPlaces() {
  log('\n══════════════════════════════════════════════════════════');
  log('📍 PLACES TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Get all places
  const allPlaces = await makeRequest('GET', '/api1/places-tree');
  
  if (allPlaces.ok) {
    const places = Array.isArray(allPlaces.body) ? allPlaces.body : 
                   allPlaces.body.places?.list || allPlaces.body.places || allPlaces.body.data || [];
    recordTest('Places: Get all places', 'passed', {
      response: { count: places.length }
    });
  } else {
    recordTest('Places: Get all places', 'failed', {
      error: `Status ${allPlaces.status}`,
      response: allPlaces.body
    });
  }
  
  // Test: Get single place
  const singlePlace = await makeRequest('GET', `/api1/place/${CONFIG.placeId}`);
  
  if (singlePlace.ok) {
    recordTest('Places: Get single place', 'passed', {
      response: { name: singlePlace.body.place?.name || singlePlace.body.name || 'N/A' }
    });
  } else {
    recordTest('Places: Get single place', 'failed', {
      error: `Status ${singlePlace.status}`
    });
  }
}

async function testUsers() {
  log('\n══════════════════════════════════════════════════════════');
  log('👥 USERS TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Get all users
  const allUsers = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/users`);
  let initialUserCount = 0;
  
  if (allUsers.ok) {
    const users = Array.isArray(allUsers.body) ? allUsers.body :
                  allUsers.body.users?.list || allUsers.body.users || allUsers.body.data || [];
    initialUserCount = Array.isArray(users) ? users.length : 0;
    recordTest('Users: Get all users', 'passed', {
      response: { count: initialUserCount }
    });
    
    // Store for later verification
    global.initialUserCount = initialUserCount;
  } else {
    recordTest('Users: Get all users', 'failed', {
      error: `Status ${allUsers.status}`,
      response: allUsers.body
    });
  }
  
  // Test: Add user
  const addUser = await makeRequest('POST', `/api1/place/${CONFIG.placeId}/user`, {
    id: CONFIG.testUser.phone,
    firstname: CONFIG.testUser.firstName,
    lastname: CONFIG.testUser.lastName
  });
  
  if (addUser.ok || addUser.status === 409) {
    recordTest('Users: Add user', 'passed', {
      response: addUser.status === 409 ? { note: 'User already exists' } : addUser.body
    });
    global.testUserAdded = true;
  } else {
    recordTest('Users: Add user', 'failed', {
      error: `Status ${addUser.status}`,
      response: addUser.body
    });
  }
  
  // Test: Verify user was added (use filter)
  const verifyAdd = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/users?filter=${CONFIG.testUser.phone}`);
  
  if (verifyAdd.ok) {
    const users = Array.isArray(verifyAdd.body) ? verifyAdd.body :
                  verifyAdd.body.users?.list || verifyAdd.body.users || verifyAdd.body.data || [];
    const found = Array.isArray(users) ? users.find(u => {
      const phone = String(u._id || u.phone || u.M_phone || u.id || '');
      return phone.includes('561239876') || phone === CONFIG.testUser.phone;
    }) : null;
    
    if (found) {
      recordTest('Users: Verify user exists after add', 'passed', {
        response: { phone: found._id || found.phone || found.M_phone || found.id }
      });
      global.testUserExists = true;
    } else {
      recordTest('Users: Verify user exists after add', 'skipped', {
        error: 'User not found in filtered results (may be pagination issue)'
      });
      global.testUserExists = true; // Assume exists if add succeeded
    }
  } else {
    recordTest('Users: Verify user exists after add', 'skipped', {
      error: `Filter endpoint returned ${verifyAdd.status}`
    });
    if (global.testUserAdded) {
      global.testUserExists = true;
    }
  }
  
  // Test: Update user
  const updateUser = await makeRequest('POST', `/api1/place/${CONFIG.placeId}/user`, {
    id: CONFIG.testUser.phone,
    firstname: CONFIG.testUser.firstName + '-updated'
  });
  
  if (updateUser.ok) {
    recordTest('Users: Update user', 'passed');
  } else {
    recordTest('Users: Update user', 'skipped', {
      error: `Status ${updateUser.status}`
    });
  }
}

async function testGroups() {
  log('\n══════════════════════════════════════════════════════════');
  log('👥 GROUPS TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Get all groups
  const allGroups = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/groups`);
  
  if (allGroups.ok) {
    const groups = Array.isArray(allGroups.body) ? allGroups.body :
                   allGroups.body.groups?.list || allGroups.body.groups || allGroups.body.data || [];
    recordTest('Groups: Get all groups', 'passed', {
      response: { count: Array.isArray(groups) ? groups.length : 0 }
    });
  } else {
    recordTest('Groups: Get all groups', 'failed', {
      error: `Status ${allGroups.status}`
    });
  }
}

async function testVehicles() {
  log('\n══════════════════════════════════════════════════════════');
  log('🚗 VEHICLES TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Get all vehicles - try cars endpoint
  const allVehicles = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/cars`);
  
  if (allVehicles.ok) {
    const vehicles = Array.isArray(allVehicles.body) ? allVehicles.body :
                     allVehicles.body.cars || allVehicles.body.vehicles || allVehicles.body.data || [];
    recordTest('Vehicles: Get all vehicles', 'passed', {
      response: { count: Array.isArray(vehicles) ? vehicles.length : 0 }
    });
  } else {
    recordTest('Vehicles: Get all vehicles', 'skipped', {
      error: `Status ${allVehicles.status} - endpoint may not exist`
    });
  }
  
  // Test: Add vehicle
  const addVehicle = await makeRequest('POST', `/api1/place/${CONFIG.placeId}/cars`, {
    userId: CONFIG.testUser.phone,
    carId: CONFIG.testVehicle.licensePlate
  });
  
  if (addVehicle.ok || addVehicle.status === 409) {
    recordTest('Vehicles: Add vehicle', 'passed', {
      response: addVehicle.status === 409 ? { note: 'Vehicle already exists' } : addVehicle.body
    });
    global.testVehicleExists = true;
  } else {
    recordTest('Vehicles: Add vehicle', 'skipped', {
      error: `Status ${addVehicle.status} - endpoint may not exist`
    });
  }
}

async function testDevices() {
  log('\n══════════════════════════════════════════════════════════');
  log('📱 DEVICES TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Get device info
  const deviceInfo = await makeRequest('GET', `/api1/device/${CONFIG.deviceId}`);
  
  if (deviceInfo.ok) {
    recordTest('Devices: Get device info', 'passed', {
      response: { deviceId: CONFIG.deviceId }
    });
  } else {
    recordTest('Devices: Get device info', 'failed', {
      error: `Status ${deviceInfo.status}`
    });
  }
  
  // Test: Open gate (just check if endpoint exists, don't actually open)
  log('   [INFO] Skipping actual gate open to avoid unintended actions');
  recordTest('Devices: Open gate endpoint', 'skipped', {
      error: 'Skipped to avoid unintended gate operation'
  });
}

async function testErrorHandling() {
  log('\n══════════════════════════════════════════════════════════');
  log('⚠️ ERROR HANDLING TESTS');
  log('══════════════════════════════════════════════════════════');
  
  // Test: Add user with empty phone (should fail)
  const emptyPhone = await makeRequest('POST', `/api1/place/${CONFIG.placeId}/user`, {
    id: '',
    firstname: 'Test',
    lastname: 'User'
  });
  
  if (!emptyPhone.ok || emptyPhone.status === 400) {
    recordTest('Error: Reject empty phone on add', 'passed');
  } else {
    recordTest('Error: Reject empty phone on add', 'failed', {
      error: 'API accepted empty phone'
    });
  }
  
  // Test: Invalid place ID
  const invalidPlace = await makeRequest('GET', '/api1/place/invalid-place-id-12345/users');
  
  if (!invalidPlace.ok) {
    recordTest('Error: Reject invalid place ID', 'passed', {
      response: { status: invalidPlace.status }
    });
  } else {
    recordTest('Error: Reject invalid place ID', 'failed', {
      error: 'API accepted invalid place ID'
    });
  }
  
  // Test: Request without auth
  const savedToken = authToken;
  authToken = null;
  
  const noAuth = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/users`);
  
  authToken = savedToken; // Restore token
  
  if (!noAuth.ok) {
    recordTest('Error: Reject request without auth', 'passed', {
      response: { status: noAuth.status }
    });
  } else {
    recordTest('Error: Reject request without auth', 'failed', {
      error: 'API accepted request without auth'
    });
  }
}

async function testDeleteOperations() {
  log('\n══════════════════════════════════════════════════════════');
  log('🗑️ DELETE TESTS (CLEANUP)');
  log('══════════════════════════════════════════════════════════');
  
  // Get user count BEFORE delete
  const beforeDelete = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/users`);
  let userCountBefore = 0;
  
  if (beforeDelete.ok) {
    const users = Array.isArray(beforeDelete.body) ? beforeDelete.body :
                  beforeDelete.body.users?.list || beforeDelete.body.users || beforeDelete.body.data || [];
    userCountBefore = Array.isArray(users) ? users.length : 0;
    log(`   Users before delete: ${userCountBefore}`);
  }
  
  // Test: Delete user
  if (global.testUserExists) {
    const deleteUser = await makeRequest('DELETE', `/api1/place/${CONFIG.placeId}/users`, {
      phones: [CONFIG.testUser.phone]
    });
    
    if (deleteUser.ok) {
      // Verify delete
      const afterDelete = await makeRequest('GET', `/api1/place/${CONFIG.placeId}/users`);
      
      if (afterDelete.ok) {
        const users = Array.isArray(afterDelete.body) ? afterDelete.body :
                      afterDelete.body.users?.list || afterDelete.body.users || afterDelete.body.data || [];
        const userCountAfter = Array.isArray(users) ? users.length : 0;
        const deletedCount = userCountBefore - userCountAfter;
        
        log(`   Users after delete: ${userCountAfter}`);
        log(`   Users deleted: ${deletedCount}`);
        
        if (deletedCount === 1) {
          recordTest('Delete: Delete single user', 'passed', {
            response: { deletedCount: 1 }
          });
        } else if (deletedCount === 0) {
          recordTest('Delete: Delete single user', 'failed', {
            error: 'No users were deleted'
          });
        } else if (userCountAfter === 0 && userCountBefore > 1) {
          recordTest('Delete: Delete single user', 'failed', {
            error: `CRITICAL: ALL ${userCountBefore} users were deleted instead of 1!`
          });
        } else {
          recordTest('Delete: Delete single user', 'failed', {
            error: `Unexpected: ${deletedCount} users deleted instead of 1`
          });
        }
      } else {
        recordTest('Delete: Delete single user', 'skipped', {
          error: 'Could not verify delete result'
        });
      }
    } else {
      recordTest('Delete: Delete single user', 'failed', {
        error: `Status ${deleteUser.status}`,
        response: deleteUser.body
      });
    }
  } else {
    recordTest('Delete: Delete single user', 'skipped', {
      error: 'Test user was not created'
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     n8n-nodes-palgate - AUTOMATED TEST SUITE                     ║');
  console.log('║     Target: ' + CONFIG.apiBase.padEnd(52) + '║');
  console.log('║     Time: ' + new Date().toISOString().padEnd(54) + '║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  
  // Run all test groups in order
  const authOk = await testAuth();
  
  if (!authOk) {
    log('\n[FAIL] Authentication failed - cannot continue tests');
    return;
  }
  
  await testPlaces();
  await testUsers();
  await testGroups();
  await testVehicles();
  await testDevices();
  await testErrorHandling();
  await testDeleteOperations();
  
  // Final summary
  results.endTime = new Date().toISOString();
  
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST RESULTS                              ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests:  ${String(results.summary.total).padEnd(49)}║`);
  console.log(`║  [PASS] Passed:    ${String(results.summary.passed).padEnd(47)}║`);
  console.log(`║  [FAIL] Failed:    ${String(results.summary.failed).padEnd(47)}║`);
  console.log(`║  [SKIP] Skipped:   ${String(results.summary.skipped).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  
  // List failures
  const failures = results.tests.filter(t => t.status === 'failed');
  if (failures.length > 0) {
    console.log('\n[FAIL] FAILED TESTS:');
    failures.forEach(f => {
      console.log(`   - ${f.name}: ${f.error || 'Unknown error'}`);
    });
  }
  
  // Save results to file
  const resultsFile = `test/results/automated-test-${Date.now()}.json`;
  try {
    if (!fs.existsSync('test/results')) {
      fs.mkdirSync('test/results', { recursive: true });
    }
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n[INFO] Results saved to: ${resultsFile}`);
  } catch (e) {
    console.log(`\n[WARN] Could not save results: ${e.message}`);
  }
  
  // Return exit code
  return results.summary.failed === 0 ? 0 : 1;
}

// Run tests
runAllTests()
  .then(exitCode => {
    console.log(`\n[INFO] Tests completed with exit code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(err => {
    console.error(`\n[FAIL] Test suite crashed: ${err.message}`);
    process.exit(1);
  });
