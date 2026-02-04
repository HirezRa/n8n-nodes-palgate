/**
 * Investigate a phone number across places (dev/debug).
 * REQUIRES env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PHONE
 * Do NOT commit real credentials. Use .env (gitignored) or export locally.
 */
const https = require('https');

const API = process.env.PAL_API_BASE || 'https://portal.pal-es.com';
const PHONE = process.env.PHONE;
const MAIN_PLACE = process.env.PAL_PLACE_ID;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, API);
    const opt = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 15000,
    };
    if (token) opt.headers['X-Access-Token'] = token;
    const r = https.request(opt, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  const username = process.env.PAL_USERNAME;
  const password = process.env.PAL_PASSWORD;
  if (!username || !password || !MAIN_PLACE || !PHONE) {
    console.error('Set env: PAL_USERNAME, PAL_PASSWORD, PAL_PLACE_ID, PHONE');
    process.exit(1);
  }

  const login = await req('POST', '/api1/user/login1', { username, password });
  const token = login.body.user?.token || login.body.token;
  if (!token) {
    console.error('Login failed');
    process.exit(1);
  }
  console.log('[OK] Login\n');

  const placeDetails = await req('GET', '/api1/place/' + MAIN_PLACE, null, token);
  const children = placeDetails.body?.place?.children || [];

  console.log('=== Searching', PHONE, 'in main place and', children.length, 'child places ===\n');

  const mainPath = '/api1/place/' + MAIN_PLACE + '/users?skip=0&limit=10&filter=' + encodeURIComponent(PHONE);
  const mainRes = await req('GET', mainPath, null, token);
  const mainList = mainRes.body?.users?.list || [];
  console.log('Main place:', mainList.length);
  mainList.forEach((u) => console.log('  ', u._id, u.firstname, u.lastname));

  for (const child of children) {
    const path = '/api1/place/' + child._id + '/users?skip=0&limit=10&filter=' + encodeURIComponent(PHONE);
    const res = await req('GET', path, null, token);
    const list = res.body?.users?.list || [];
    if (list.length > 0) {
      console.log('\nChild', child.name, ':', list.length);
      list.forEach((u) => console.log('  ', u._id, u.firstname, u.lastname));
    }
  }

  const partPath = '/api1/place/' + MAIN_PLACE + '/users?skip=0&limit=50&filter=' + encodeURIComponent(PHONE.slice(-6));
  const partRes = await req('GET', partPath, null, token);
  const partList = partRes.body?.users?.list || [];
  console.log('\nPartial filter (last 6 digits):', partList.length);
  partList.forEach((u) => console.log('  ', u._id, u.firstname, u.lastname));
})();
