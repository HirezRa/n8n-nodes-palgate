/**
 * n8n-nodes-palgate - Read-Only (Non-Destructive) Tests
 * Tests ALL query/GET and non-destructive operations. NO DELETE.
 *
 * Run: node test/test-read-only.js
 *
 * REQUIRES env (do NOT commit real values; use .env or export locally):
 *   PAL_API_BASE, PAL_USERNAME, PAL_PASSWORD,
 *   PAL_PLACE_ID, PAL_DEVICE_ID, PAL_ORG_ID, PAL_PHONE
 * Optional: PAL_CAR_ID (for Car Search In Logs)
 */

const https = require('https');
const fs = require('fs');

function loadConfig() {
  const username = process.env.PAL_USERNAME;
  const password = process.env.PAL_PASSWORD;
  const placeId = process.env.PAL_PLACE_ID;
  const deviceId = process.env.PAL_DEVICE_ID;
  const orgId = process.env.PAL_ORG_ID;
  const phone = process.env.PAL_PHONE;
  if (!username || !password || !placeId || !deviceId || !orgId || !phone) {
    console.error('Missing required env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PAL_DEVICE_ID, PAL_ORG_ID, PAL_PHONE');
    process.exit(1);
  }
  return {
    apiBase: process.env.PAL_API_BASE || 'https://portal.pal-es.com',
    credentials: { username, password },
    orgId,
    deviceId,
    placeId,
    phone,
    carId: process.env.PAL_CAR_ID || '',
  };
}

const CONFIG = loadConfig();

const results = { startTime: new Date().toISOString(), tests: [], summary: { total: 0, passed: 0, failed: 0, skipped: 0 } };
let authToken = null;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.apiBase);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(authToken ? { 'X-Access-Token': authToken } : {}) },
      timeout: 15000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, body: parsed });
      });
    });
    req.on('error', (e) => resolve({ status: 0, ok: false, error: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  console.log(`[${ts}] ${msg}`);
}

function record(name, status, details = {}) {
  results.summary.total++;
  results.summary[status]++;
  results.tests.push({ name, status, ...details });
  const icon = status === 'passed' ? '[PASS]' : status === 'failed' ? '[FAIL]' : '[SKIP]';
  log(`${icon} ${name}`);
  if (details.error) log(`   Error: ${details.error}`);
  if (details.info) log(`   Info: ${details.info}`);
}

async function login() {
  const res = await makeRequest('POST', '/api1/user/login1', CONFIG.credentials);
  if (res.ok && (res.body.user?.token || res.body.token)) {
    authToken = res.body.user?.token || res.body.token;
    return true;
  }
  record('Auth: Login', 'failed', { error: `Status ${res.status}`, response: res.body });
  return false;
}

async function runReadOnlyTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     n8n-nodes-palgate - READ-ONLY TESTS (no DELETE)             ║');
  console.log('║     ' + CONFIG.apiBase.padEnd(58) + '║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  if (!(await login())) {
    console.log('\n[FAIL] Login failed - aborting.');
    process.exit(1);
  }
  record('Auth: Login', 'passed');

  const placeId = CONFIG.placeId;
  const deviceId = CONFIG.deviceId;
  const orgId = CONFIG.orgId;
  const phone = CONFIG.phone;

  // ─── Auth (Test Connection) ───
  log('\n══════════════════════════════════════════════════════════');
  log('🔐 AUTH (Test Connection)');
  log('══════════════════════════════════════════════════════════');
  const authTest = await makeRequest('GET', '/api1/places-tree?skip=0&limit=1');
  if (authTest.ok) record('Auth: Test Connection (places-tree)', 'passed');
  else record('Auth: Test Connection (places-tree)', 'failed', { error: `Status ${authTest.status}` });

  // ─── User (read-only) ───
  log('\n══════════════════════════════════════════════════════════');
  log('👤 USER (Find, Get Many, Get Portal Users, Get Image)');
  log('══════════════════════════════════════════════════════════');
  const findUser = await makeRequest('GET', `/api1/place/${placeId}/users?skip=0&limit=100&filter=${encodeURIComponent(phone)}`);
  if (findUser.ok) {
    const list = findUser.body.users?.list ?? findUser.body.users ?? findUser.body.data ?? (Array.isArray(findUser.body) ? findUser.body : []);
    const count = Array.isArray(list) ? list.length : 0;
    record('User: Find (by phone)', 'passed', { info: `count=${count}` });
  } else record('User: Find', 'failed', { error: `Status ${findUser.status}` });

  const allAppUsers = await makeRequest('GET', '/api1/app-user/all-users');
  if (allAppUsers.ok) record('User: Get Many (app-user/all-users)', 'passed');
  else record('User: Get Many (app-user/all-users)', 'failed', { error: `Status ${allAppUsers.status}` });

  const portalUsers = await makeRequest('GET', '/api1/users');
  if (portalUsers.ok) record('User: Get Portal Users', 'passed');
  else record('User: Get Portal Users', 'failed', { error: `Status ${portalUsers.status}` });

  const userImage = await makeRequest('GET', `/api1/app-user/${phone}/image`);
  if (userImage.ok) record('User: Get Image (by phone)', 'passed');
  else record('User: Get Image (by phone)', (userImage.status === 404 || userImage.status === 400) ? 'skipped' : 'failed', {
    error: `Status ${userImage.status}`,
    info: (userImage.status === 400) ? 'API may require app-user id from all-users list' : undefined
  });

  // ─── Place ───
  log('\n══════════════════════════════════════════════════════════');
  log('📍 PLACE');
  log('══════════════════════════════════════════════════════════');
  const placeDetails = await makeRequest('GET', `/api1/place/${placeId}`);
  if (placeDetails.ok) record('Place: Get Details', 'passed');
  else record('Place: Get Details', 'failed', { error: `Status ${placeDetails.status}` });

  const placeGroups = await makeRequest('GET', `/api1/place/${placeId}/groups`);
  if (placeGroups.ok) record('Place: Get Groups', 'passed');
  else record('Place: Get Groups', 'failed', { error: `Status ${placeGroups.status}` });

  const placesTree = await makeRequest('GET', '/api1/places-tree');
  if (placesTree.ok) record('Place: Get Tree', 'passed');
  else record('Place: Get Tree', 'failed', { error: `Status ${placesTree.status}` });

  const placeUsers = await makeRequest('GET', `/api1/place/${placeId}/users`);
  if (placeUsers.ok) record('Place: Get Users', 'passed');
  else record('Place: Get Users', 'failed', { error: `Status ${placeUsers.status}` });

  const formatNum = await makeRequest('GET', `/api1/place/${placeId}/format-number?pn=${encodeURIComponent(phone)}`);
  if (formatNum.ok) record('Place: Format Number', 'passed');
  else record('Place: Format Number', 'failed', { error: `Status ${formatNum.status}` });

  // ─── Device ───
  log('\n══════════════════════════════════════════════════════════');
  log('📱 DEVICE');
  log('══════════════════════════════════════════════════════════');
  const deviceDetails = await makeRequest('GET', `/api1/device/${deviceId}`);
  if (deviceDetails.ok) record('Device: Get Details', 'passed');
  else record('Device: Get Details', 'failed', { error: `Status ${deviceDetails.status}` });

  const devicesAll = await makeRequest('GET', '/api1/devices');
  if (devicesAll.ok) record('Device: Get All', 'passed');
  else record('Device: Get All', 'failed', { error: `Status ${devicesAll.status}` });

  const deviceLog = await makeRequest('GET', `/api1/device/${deviceId}/log`);
  if (deviceLog.ok) record('Device: Get Log', 'passed');
  else record('Device: Get Log', 'failed', { error: `Status ${deviceLog.status}` });

  const deviceUsers = await makeRequest('GET', `/api1/device/${deviceId}/users`);
  if (deviceUsers.ok) record('Device: Get Users', 'passed');
  else record('Device: Get Users', 'failed', { error: `Status ${deviceUsers.status}` });

  const liveHistory = await makeRequest('GET', `/api1/device/${deviceId}/live-status-history`);
  if (liveHistory.ok) record('Device: Get Live Status History', 'passed');
  else record('Device: Get Live Status History', liveHistory.status === 404 ? 'skipped' : 'failed', { error: `Status ${liveHistory.status}` });

  const statusV2 = await makeRequest('GET', `/api1/device/${deviceId}/get-status-historyV2`);
  if (statusV2.ok) record('Device: Get Status History V2', 'passed');
  else record('Device: Get Status History V2', statusV2.status === 404 ? 'skipped' : 'failed', { error: `Status ${statusV2.status}` });

  // ─── Organization ───
  log('\n══════════════════════════════════════════════════════════');
  log('🏢 ORGANIZATION');
  log('══════════════════════════════════════════════════════════');
  const orgsTree = await makeRequest('GET', '/api1/orgs-tree');
  if (orgsTree.ok) record('Organization: Get Tree', 'passed');
  else record('Organization: Get Tree', 'failed', { error: `Status ${orgsTree.status}` });

  const orgDetails = await makeRequest('GET', `/api1/org/${orgId}`);
  if (orgDetails.ok) record('Organization: Get Details', 'passed');
  else record('Organization: Get Details', 'failed', { error: `Status ${orgDetails.status}` });

  // ─── Dashboard ───
  log('\n══════════════════════════════════════════════════════════');
  log('📊 DASHBOARD');
  log('══════════════════════════════════════════════════════════');
  const devMarkers = await makeRequest('GET', '/api1/devices-markers');
  if (devMarkers.ok) record('Dashboard: Get Devices Markers', 'passed');
  else record('Dashboard: Get Devices Markers', 'failed', { error: `Status ${devMarkers.status}` });

  const favorites = await makeRequest('GET', '/api1/user/admin/favorites');
  if (favorites.ok) record('Dashboard: Get Favorites', 'passed');
  else record('Dashboard: Get Favorites', 'failed', { error: `Status ${favorites.status}` });

  const recent = await makeRequest('GET', '/api1/user/admin/recent-devices-places');
  if (recent.ok) record('Dashboard: Get Recent (devices/places)', 'passed');
  else record('Dashboard: Get Recent (devices/places)', 'failed', { error: `Status ${recent.status}` });

  const stats = await makeRequest('GET', '/api1/user/dashboard/statistics');
  if (stats.ok) record('Dashboard: Get Statistics', 'passed');
  else record('Dashboard: Get Statistics', 'failed', { error: `Status ${stats.status}` });

  // ─── Car (read-only: Search In Logs) ───
  log('\n══════════════════════════════════════════════════════════');
  log('🚗 CAR (Search In Logs only)');
  log('══════════════════════════════════════════════════════════');
  const carSearch = await makeRequest('GET', `/api1/place/${placeId}/reports/car?carId=${encodeURIComponent(CONFIG.carId)}`);
  if (carSearch.ok) record('Car: Search In Logs', 'passed');
  else record('Car: Search In Logs', carSearch.status === 404 ? 'skipped' : 'failed', { error: `Status ${carSearch.status}` });

  // ─── Summary ───
  results.endTime = new Date().toISOString();
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                     READ-ONLY TEST RESULTS                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total:  ${String(results.summary.total).padEnd(52)}║`);
  console.log(`║  [PASS]  ${String(results.summary.passed).padEnd(52)}║`);
  console.log(`║  [FAIL]  ${String(results.summary.failed).padEnd(52)}║`);
  console.log(`║  [SKIP]  ${String(results.summary.skipped).padEnd(52)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  const failures = results.tests.filter(t => t.status === 'failed');
  if (failures.length > 0) {
    console.log('\n[FAIL] FAILED:');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.error || ''}`));
  }

  const dir = 'test/results';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/read-only-test-${Date.now()}.json`, JSON.stringify(results, null, 2));
  console.log(`\n[INFO] Results saved to test/results/read-only-test-*.json`);
  return results.summary.failed > 0 ? 1 : 0;
}

runReadOnlyTests()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
