/**
 * Investigate phone 972528745554 across all places
 */
const https = require('https');
const API = 'https://portal.pal-es.com';
const PHONE = '972528745554';
const MAIN_PLACE = '3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad';

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
  const login = await req('POST', '/api1/user/login1', {
    username: 'REDACTED_EMAIL',
    password: 'REDACTED_PASSWORD',
  });
  const token = login.body.user?.token || login.body.token;
  if (!token) {
    console.error('Login failed');
    process.exit(1);
  }
  console.log('[OK] Login\n');

  // Get child places
  const placeDetails = await req('GET', '/api1/place/' + MAIN_PLACE, null, token);
  const children = placeDetails.body?.place?.children || [];

  console.log('=== Searching', PHONE, 'in main place and', children.length, 'child places ===\n');

  // Search main place
  const mainPath = '/api1/place/' + MAIN_PLACE + '/users?skip=0&limit=50&filter=' + encodeURIComponent(PHONE);
  const mainRes = await req('GET', mainPath, null, token);
  const mainList = mainRes.body?.users?.list || [];
  console.log('Main place (mer group): found', mainList.length, 'for exact phone');
  mainList.forEach((u) => console.log('  _id:', u._id, ', name:', (u.firstname || '') + ' ' + (u.lastname || '')));

  // Search each child place
  for (const child of children) {
    const path = '/api1/place/' + child._id + '/users?skip=0&limit=50&filter=' + encodeURIComponent(PHONE);
    const res = await req('GET', path, null, token);
    const list = res.body?.users?.list || [];

    // Also partial
    const path2 = '/api1/place/' + child._id + '/users?skip=0&limit=50&filter=528745554';
    const res2 = await req('GET', path2, null, token);
    const list2 = res2.body?.users?.list || [];

    console.log(child.name + ': found', list.length, 'for exact,', list2.length, 'for partial 528745554');
    if (list.length > 0) {
      list.forEach((u) => console.log('  EXACT: _id:', u._id, ', name:', (u.firstname || '') + ' ' + (u.lastname || '')));
    }
    if (list2.length > 0) {
      list2.forEach((u) => console.log('  PARTIAL: _id:', u._id, ', name:', (u.firstname || '') + ' ' + (u.lastname || '')));
    }
  }

  // Search with just the distinctive part in main place
  console.log('\n=== Search 8745554 in main place ===');
  const partPath = '/api1/place/' + MAIN_PLACE + '/users?skip=0&limit=50&filter=8745554';
  const partRes = await req('GET', partPath, null, token);
  const partList = partRes.body?.users?.list || [];
  console.log('Results for 8745554:', partList.length);
  partList.forEach((u) => console.log('  _id:', u._id, ', name:', (u.firstname || '') + ' ' + (u.lastname || '')));

  console.log('\n=== CONCLUSION ===');
  console.log('Phone', PHONE, '(ending in 54) search results above.');
  console.log('Similar phones (8745554) show related users.');
})();
