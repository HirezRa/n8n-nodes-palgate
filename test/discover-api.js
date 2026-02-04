/**
 * PAL Gate API Discovery
 * Finds all working endpoints directly on portal.pal-es.com
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
  apiBase: 'https://portal.pal-es.com',
  credentials: {
    username: 'REDACTED_EMAIL',
    password: 'REDACTED_PASSWORD'
  },
  placeId: '3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad',
  orgId: '10131',
  deviceId: 'LPR100200416'
};

let token = null;

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

async function tryEndpoint(method, path, body = null, description = '') {
  try {
    const result = await request(method, path, body);
    const status = result.status;
    const icon = status >= 200 && status < 300 ? '[PASS]' : status === 404 ? '[FAIL]' : '[WARN]';
    console.log(`${icon} ${method.padEnd(6)} ${path.padEnd(50)} ${status} ${description}`);
    
    if (status >= 200 && status < 300) {
      return { success: true, path, method, body, response: result.body };
    }
    return { success: false, status };
  } catch (e) {
    console.log(`[FAIL] ${method.padEnd(6)} ${path.padEnd(50)} ERROR: ${e.message}`);
    return { success: false, error: e.message };
  }
}

async function discoverAPI() {
  console.log('═'.repeat(80));
  console.log('PAL GATE API DISCOVERY - Finding all working endpoints');
  console.log('═'.repeat(80));
  
  const workingEndpoints = {
    auth: null,
    users: { getAll: null, add: null, update: null, delete: null },
    vehicles: { getAll: null, add: null, delete: null },
    places: { getAll: null, getOne: null },
    groups: { getAll: null },
    devices: { getOne: null, open: null }
  };

  // ========== 1. AUTHENTICATION ==========
  console.log('\n📌 AUTHENTICATION');
  console.log('-'.repeat(80));
  
  const authEndpoints = [
    '/api1/user/login1',
    '/api/auth/login',
    '/api/login',
    '/api1/auth/login',
    '/api1/login',
    '/p3/api/auth/login',
    '/auth/login'
  ];
  
  for (const path of authEndpoints) {
    const result = await tryEndpoint('POST', path, CONFIG.credentials, '(login)');
    if (result.success) {
      workingEndpoints.auth = { path, method: 'POST' };
      token = result.response.user?.token || result.response.token || result.response.accessToken || result.response.access_token;
      if (token) {
        console.log(`   [PASS] Token received: ${token.substring(0, 20)}...`);
        break;
      }
    }
  }
  
  if (!token) {
    console.log('[FAIL] Could not authenticate - stopping discovery');
    return workingEndpoints;
  }

  // ========== 2. PLACES ==========
  console.log('\n📌 PLACES');
  console.log('-'.repeat(80));
  
  const placesEndpoints = [
    '/api1/places-tree',
    '/api1/places',
    '/api/places',
    '/p3/api/places',
    '/api1/place',
    '/api/place'
  ];
  
  for (const path of placesEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get all places)');
    if (result.success) {
      workingEndpoints.places.getAll = { path, method: 'GET' };
      break;
    }
  }
  
  const placeDetailEndpoints = [
    `/api1/place/${CONFIG.placeId}`,
    `/api/places/${CONFIG.placeId}`,
    `/p3/api/places/${CONFIG.placeId}`
  ];
  
  for (const path of placeDetailEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get one place)');
    if (result.success) {
      workingEndpoints.places.getOne = { path: path.replace(CONFIG.placeId, '{placeId}'), method: 'GET' };
      break;
    }
  }

  // ========== 3. USERS ==========
  console.log('\n📌 USERS');
  console.log('-'.repeat(80));
  
  // Get all users
  const usersGetEndpoints = [
    `/api1/place/${CONFIG.placeId}/users`,
    `/api/places/${CONFIG.placeId}/users`,
    `/p3/api/places/${CONFIG.placeId}/users`,
    `/api1/places/${CONFIG.placeId}/users`
  ];
  
  for (const path of usersGetEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get all users)');
    if (result.success) {
      workingEndpoints.users.getAll = { path: path.replace(CONFIG.placeId, '{placeId}'), method: 'GET' };
      if (result.response) {
        const users = Array.isArray(result.response) ? result.response : 
                      result.response.users?.list || result.response.users || result.response.data || [];
        console.log(`   [INFO] Found ${users.length} users`);
      }
      break;
    }
  }
  
  // Add user - try different body formats
  console.log('\n   Testing ADD USER formats...');
  const addUserEndpoints = [
    `/api1/place/${CONFIG.placeId}/user`,
    `/api1/place/${CONFIG.placeId}/users`,
    `/api/places/${CONFIG.placeId}/users`
  ];
  
  const addUserBodies = [
    { name: 'format1', body: { id: '972561239876', firstname: 'אהרון', lastname: 'אבינו' } },
    { name: 'format2', body: { phone: '972561239876', firstName: 'אהרון', lastName: 'אבינו' } },
    { name: 'format3', body: { phone: '972561239876', FirstNameHe: 'אהרון', LastNameHe: 'אבינו' } },
    { name: 'format4', body: { M_phone: '972561239876', firstName: 'אהרון', lastName: 'אבינו' } }
  ];
  
  for (const endpoint of addUserEndpoints) {
    for (const format of addUserBodies) {
      const result = await tryEndpoint('POST', endpoint, format.body, `(add user - ${format.name})`);
      if (result.success || result.status === 409) { // 409 = already exists = endpoint works
        workingEndpoints.users.add = { 
          path: endpoint.replace(CONFIG.placeId, '{placeId}'), 
          method: 'POST',
          bodyFormat: format.name
        };
        console.log(`   [PASS] Working add format: ${format.name}`);
        break;
      }
    }
    if (workingEndpoints.users.add) break;
  }
  
  // Update user
  console.log('\n   Testing UPDATE USER endpoints...');
  const updateUserEndpoints = [
    { method: 'POST', path: `/api1/place/${CONFIG.placeId}/user` },
    { method: 'PUT', path: `/api1/place/${CONFIG.placeId}/users` },
    { method: 'PATCH', path: `/api1/place/${CONFIG.placeId}/users` },
    { method: 'POST', path: `/api1/place/${CONFIG.placeId}/users/update` }
  ];
  
  const updateBody = { id: '972561239876', firstname: 'אהרון-מעודכן' };
  
  for (const ep of updateUserEndpoints) {
    const result = await tryEndpoint(ep.method, ep.path, updateBody, '(update user)');
    if (result.success) {
      workingEndpoints.users.update = { 
        path: ep.path.replace(CONFIG.placeId, '{placeId}'), 
        method: ep.method 
      };
      break;
    }
  }
  
  // Delete user - just document based on previous test results
  workingEndpoints.users.delete = {
    path: `/api1/place/{placeId}/users`,
    method: 'DELETE',
    bodyFormat: { phones: ['phoneNumber'] },
    warning: 'API may have issues - verify results'
  };

  // ========== 4. VEHICLES ==========
  console.log('\n📌 VEHICLES');
  console.log('-'.repeat(80));
  
  const vehiclesEndpoints = [
    `/api1/place/${CONFIG.placeId}/vehicles`,
    `/api/places/${CONFIG.placeId}/vehicles`,
    `/api1/place/${CONFIG.placeId}/vehicle`,
    `/api1/place/${CONFIG.placeId}/cars`
  ];
  
  for (const path of vehiclesEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get all vehicles)');
    if (result.success) {
      workingEndpoints.vehicles.getAll = { path: path.replace(CONFIG.placeId, '{placeId}'), method: 'GET' };
      break;
    }
  }
  
  // Add vehicle
  const addVehicleBodies = [
    { userId: '972561239876', carId: '90741202' },
    { licensePlate: '90741202', phone: '972561239876' },
    { plateNumber: '90741202' },
    { vehicleNumber: '90741202' }
  ];
  
  const addVehicleEndpoints = [
    `/api1/place/${CONFIG.placeId}/cars`,
    `/api1/place/${CONFIG.placeId}/vehicles`
  ];
  
  for (const endpoint of addVehicleEndpoints) {
    for (const body of addVehicleBodies) {
      const result = await tryEndpoint('POST', endpoint, body, '(add vehicle)');
      if (result.success || result.status === 409) {
        workingEndpoints.vehicles.add = {
          path: endpoint.replace(CONFIG.placeId, '{placeId}'),
          method: 'POST',
          bodyFormat: body
        };
        break;
      }
    }
    if (workingEndpoints.vehicles.add) break;
  }

  // ========== 5. GROUPS ==========
  console.log('\n📌 GROUPS');
  console.log('-'.repeat(80));
  
  const groupsEndpoints = [
    `/api1/place/${CONFIG.placeId}/groups`,
    `/api/places/${CONFIG.placeId}/groups`
  ];
  
  for (const path of groupsEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get all groups)');
    if (result.success) {
      workingEndpoints.groups.getAll = { path: path.replace(CONFIG.placeId, '{placeId}'), method: 'GET' };
      break;
    }
  }

  // ========== 6. DEVICES ==========
  console.log('\n📌 DEVICES');
  console.log('-'.repeat(80));
  
  const deviceEndpoints = [
    `/api1/device/${CONFIG.deviceId}`,
    `/api/devices/${CONFIG.deviceId}`,
    `/api1/devices/${CONFIG.deviceId}`
  ];
  
  for (const path of deviceEndpoints) {
    const result = await tryEndpoint('GET', path, null, '(get device)');
    if (result.success) {
      workingEndpoints.devices.getOne = { path: path.replace(CONFIG.deviceId, '{deviceId}'), method: 'GET' };
      break;
    }
  }

  // ========== SUMMARY ==========
  console.log('\n' + '═'.repeat(80));
  console.log('DISCOVERY COMPLETE - WORKING ENDPOINTS');
  console.log('═'.repeat(80));
  console.log(JSON.stringify(workingEndpoints, null, 2));
  
  // Save to file
  if (!fs.existsSync('test')) {
    fs.mkdirSync('test', { recursive: true });
  }
  fs.writeFileSync(
    'test/discovered-endpoints.json',
    JSON.stringify(workingEndpoints, null, 2)
  );
  console.log('\n[INFO] Saved to test/discovered-endpoints.json');
  
  return workingEndpoints;
}

discoverAPI().catch(console.error);
