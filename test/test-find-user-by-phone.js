/**
 * Test: Find user by phone (e.g. 972528745552)
 * Simulates the node operation: User > Find with filter=phone
 *
 * Usage:
 *   PLACE_ID=<uuid> node test/test-find-user-by-phone.js
 *   Or set credentials in .env / environment (see below)
 *
 * Required env (or copy from test/automated-tests.js CONFIG):
 *   PAL_USERNAME, PAL_PASSWORD, PLACE_ID
 * Optional: PHONE (default 972528745552)
 */

const https = require('https');

const PLACE_ID = process.env.PLACE_ID || '3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad';
const PHONE = process.env.PHONE || '972528745552';
const API_BASE = 'https://portal.pal-es.com';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = path.startsWith('http') ? path : API_BASE + path;
    const url = new URL(fullUrl);
    const pathname = url.pathname + (url.search || '');

    const options = {
      hostname: url.hostname,
      port: 443,
      path: pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { 'X-Access-Token': token } : {}),
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, body: parsed });
      });
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const username = process.env.PAL_USERNAME;
  const password = process.env.PAL_PASSWORD;

  if (!username || !password) {
    console.error('Set PAL_USERNAME and PAL_PASSWORD (or run from project that has .env)');
    process.exit(1);
  }

  console.log('=== Find user by phone test ===');
  console.log('Phone:', PHONE);
  console.log('Place ID:', PLACE_ID);
  console.log('');

  let token;
  try {
    const login = await makeRequest('POST', '/api1/user/login1', { username, password });
    if (!login.ok || !(login.body.user?.token || login.body.token)) {
      console.error('Login failed:', login.status, login.body);
      process.exit(1);
    }
    token = login.body.user?.token || login.body.token;
    console.log('[PASS] Login OK');
  } catch (e) {
    console.error('[FAIL] Login error:', e.message);
    process.exit(1);
  }

  // Same request as node: GET /api1/place/{placeId}/users?skip=0&limit=100&filter={phone}
  const path = `/api1/place/${PLACE_ID}/users?skip=0&limit=100&filter=${encodeURIComponent(PHONE)}`;
  try {
    const res = await makeRequest('GET', path, null, token);
    if (!res.ok) {
      console.error('[FAIL] Find users request failed:', res.status, res.body);
      process.exit(1);
    }

    const users = Array.isArray(res.body)
      ? res.body
      : res.body.users?.list || res.body.users || res.body.data || [];
    const list = Array.isArray(users) ? users : [];

    console.log('[PASS] Find user request OK');
    console.log('Results count:', list.length);
    if (list.length > 0) {
      list.forEach((u, i) => {
        const id = u._id ?? u.phone ?? u.M_phone ?? u.id ?? '?';
        const name = u.name ?? u.firstName ?? u.lastName ?? '';
        console.log(`  [${i + 1}] phone/id: ${id}, name: ${name}`);
      });
    } else {
      console.log('  (No user found for this phone in this place)');
    }
  } catch (e) {
    console.error('[FAIL] Request error:', e.message);
    process.exit(1);
  }

  console.log('');
  console.log('Done.');
}

main();
