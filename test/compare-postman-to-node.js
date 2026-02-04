/**
 * Compare Postman EzTest collection with PalGate node operations.
 * Run from project root: node test/compare-postman-to-node.js
 *
 * Requires: postman/PalGate-API-Collection.json (export from Postman as Collection v2.1)
 * If file is missing, prints current node operations and instructions.
 */

const fs = require('fs');
const path = require('path');

const defaultPath = path.join(__dirname, '..', 'postman', 'PalGate-API-Collection.json');
const POSTMAN_PATH = process.argv[2] ? path.resolve(process.argv[2]) : defaultPath;
const BASE_URL = 'https://portal.pal-es.com/api1';

// Current node operations: resource, operation, method, path (normalized: no baseUrl, {{x}} -> :x)
const CURRENT_NODE_OPS = [
  { resource: 'auth', operation: 'testConnection', method: 'GET', path: '/places-tree' },
  { resource: 'user', operation: 'add', method: 'POST', path: '/place/:placeId/user' },
  { resource: 'user', operation: 'addMany', method: 'POST', path: '/place/:placeId/users' },
  { resource: 'user', operation: 'delete', method: 'POST', path: '/place/:placeId/delete-many-users' },
  { resource: 'user', operation: 'find', method: 'GET', path: '/place/:placeId/users' },
  { resource: 'user', operation: 'getImage', method: 'GET', path: '/app-user/:phone/image' },
  { resource: 'user', operation: 'getAll', method: 'GET', path: '/app-user/all-users' },
  { resource: 'user', operation: 'getPortalUsers', method: 'GET', path: '/users' },
  { resource: 'user', operation: 'update', method: 'POST', path: '/place/:placeId/user' },
  { resource: 'user', operation: 'updateByPhone', method: 'POST', path: '/place/:placeId/user/:phone' },
  { resource: 'car', operation: 'add', method: 'POST', path: '/place/:placeId/cars' },
  { resource: 'car', operation: 'delete', method: 'POST', path: '/place/:placeId/delete-car' },
  { resource: 'car', operation: 'deleteById', method: 'DELETE', path: '/place/:placeId/user/:phone/car/:carId' },
  { resource: 'car', operation: 'searchInLogs', method: 'GET', path: '/place/:placeId/reports/car' },
  { resource: 'place', operation: 'getDetails', method: 'GET', path: '/place/:placeId' },
  { resource: 'place', operation: 'getGroups', method: 'GET', path: '/place/:placeId/groups' },
  { resource: 'place', operation: 'formatNumber', method: 'GET', path: '/place/:placeId/format-number' },
  { resource: 'place', operation: 'getTree', method: 'GET', path: '/places-tree' },
  { resource: 'place', operation: 'getUsers', method: 'GET', path: '/place/:placeId/users' },
  { resource: 'device', operation: 'getDetails', method: 'GET', path: '/device/:serial' },
  { resource: 'device', operation: 'getLiveStatusHistory', method: 'GET', path: '/device/:serial/live-status-history' },
  { resource: 'device', operation: 'getLog', method: 'GET', path: '/device/:serial/log' },
  { resource: 'device', operation: 'getAll', method: 'GET', path: '/devices' },
  { resource: 'device', operation: 'getStatusHistoryV2', method: 'GET', path: '/device/:serial/get-status-historyV2' },
  { resource: 'device', operation: 'getUsers', method: 'GET', path: '/device/:serial/users' },
  { resource: 'organization', operation: 'getTree', method: 'GET', path: '/orgs-tree' },
  { resource: 'organization', operation: 'getDetails', method: 'GET', path: '/org/:orgId' },
  { resource: 'dashboard', operation: 'getDevicesMarkers', method: 'GET', path: '/devices-markers' },
  { resource: 'dashboard', operation: 'getFavorites', method: 'GET', path: '/user/admin/favorites' },
  { resource: 'dashboard', operation: 'getRecent', method: 'GET', path: '/user/admin/recent-devices-places' },
  { resource: 'dashboard', operation: 'getStatistics', method: 'GET', path: '/user/dashboard/statistics' },
];

function normalizePath(url) {
  if (typeof url !== 'string') {
    if (url && typeof url === 'object' && url.path) {
      const p = Array.isArray(url.path) ? url.path.join('/') : url.path;
      url = (p.startsWith('/') ? '' : '/') + p;
    } else {
      return '';
    }
  }
  // Postman variables: {{baseUrl}}/api1/... or https://.../api1/...
  url = url.replace(/\{\{baseUrl\}\}\/?/gi, '').replace(/https?:\/\/[^/]+/i, '');
  if (url.includes('?')) url = url.split('?')[0];
  if (!url.startsWith('/')) url = '/' + url;
  if (url.startsWith('/api1')) url = url.slice(5) || '/';
  if (!url) url = '/';
  url = url.replace(/\{\{[^}]+\}\}/g, (m) => ':' + m.replace(/\{\{|\}\}/g, '').trim());
  return url;
}

// Convert path with concrete values (from HAR) to template for matching: UUID -> :placeId, 972... -> :phone, etc.
function pathToTemplate(p) {
  if (!p) return p;
  const parts = p.split('/').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) {
      out.push(':placeId');
    } else if (/^972\d{8,9}$/.test(seg) || /^\d{9,10}$/.test(seg)) {
      out.push(':phone');
    } else if (i >= 1 && parts[i - 1] === 'device' && /^[A-Za-z0-9-]+$/.test(seg)) {
      out.push(':serial');
    } else if (i >= 1 && parts[i - 1] === 'app-user' && /^\d+$/.test(seg)) {
      out.push(':phone');
    } else if (seg.indexOf('{{') === -1 && /^[0-9]+$/.test(seg) && parts[0] === 'org') {
      out.push(':orgId');
    } else {
      out.push(seg);
    }
  }
  return '/' + out.join('/');
}

function extractRequestsFromCollection(collection, baseUrl = '') {
  const requests = [];
  function walk(items, folderName = '') {
    if (!items || !Array.isArray(items)) return;
    for (const item of items) {
      if (item.request) {
        const req = item.request;
        const method = (req.method || 'GET').toUpperCase();
        let url = req.url;
        if (typeof url === 'object') {
          const pathParts = url.path && Array.isArray(url.path) ? url.path : [url.path || ''];
          const pathStr = pathParts.join('/').replace(/^\/+/, '') ? '/' + pathParts.join('/').replace(/^\/+/, '') : '';
          url = (url.host && Array.isArray(url.host)) ? 'https://' + url.host.join('.') + pathStr : pathStr || '';
        }
        const pathNorm = normalizePath(String(url));
        if (pathNorm) {
          const pathTemplate = pathToTemplate(pathNorm);
          requests.push({
            name: item.name || 'Unnamed',
            folder: folderName,
            method,
            path: pathNorm,
            pathTemplate,
            raw: url,
          });
        }
      }
      if (item.item && item.item.length) {
        walk(item.item, item.name || folderName);
      }
    }
  }
  walk(collection.item || [], '');
  return requests;
}

function pathMatch(a, b) {
  const na = a.replace(/:[^/]+/g, ':x');
  const nb = b.replace(/:[^/]+/g, ':x');
  return na === nb;
}

function pathMatchTemplate(nodePath, postmanTemplate) {
  return pathMatch(nodePath, postmanTemplate);
}

function runComparison() {
  if (!fs.existsSync(POSTMAN_PATH)) {
    console.log('No Postman collection found at: postman/PalGate-API-Collection.json');
    console.log('');
    console.log('Current PalGate node operations (baseline for comparison):');
    console.log('---');
    CURRENT_NODE_OPS.forEach((op) => {
      console.log(`${op.method.padEnd(6)} ${op.path}  [${op.resource}.${op.operation}]`);
    });
    console.log('---');
    console.log('Total:', CURRENT_NODE_OPS.length);
    console.log('');
    console.log('To compare: Export the EzTest collection (Collection v2.1) and save as postman/PalGate-API-Collection.json, then run this script again.');
    return;
  }

  let collection;
  try {
    collection = JSON.parse(fs.readFileSync(POSTMAN_PATH, 'utf8'));
  } catch (e) {
    console.error('Failed to read/parse Postman collection:', e.message);
    process.exit(1);
  }

  const postmanRequests = extractRequestsFromCollection(collection);
  const matchedNode = new Set();
  const matched = [];
  const onlyInPostmanByTemplate = new Map(); // key: method + pathTemplate, value: first request (for display)

  console.log('=== Postman vs PalGate Node ===');
  console.log('Postman requests found:', postmanRequests.length);
  console.log('Node operations:', CURRENT_NODE_OPS.length);
  console.log('');

  for (const req of postmanRequests) {
    const template = req.pathTemplate || req.path;
    const nodeOp = CURRENT_NODE_OPS.find((n) => n.method === req.method && pathMatchTemplate(n.path, template));
    if (nodeOp) {
      matched.push({ postman: req.name, node: `${nodeOp.resource}.${nodeOp.operation}`, path: template });
      matchedNode.add(nodeOp.resource + '.' + nodeOp.operation);
    } else {
      const key = req.method + ' ' + template;
      if (!onlyInPostmanByTemplate.has(key)) {
        onlyInPostmanByTemplate.set(key, { name: req.name, method: req.method, path: template, folder: req.folder });
      }
    }
  }

  const onlyInPostman = Array.from(onlyInPostmanByTemplate.values());
  const onlyInNode = CURRENT_NODE_OPS.filter((n) => !matchedNode.has(n.resource + '.' + n.operation));

  console.log('--- Only in Postman (suggest ADD to node) ---');
  if (onlyInPostman.length === 0) {
    console.log('(none)');
  } else {
    onlyInPostman.forEach((r) => console.log(`  ${r.method.padEnd(6)} ${r.path}  [${r.folder}] ${r.name}`));
  }
  console.log('');

  console.log('--- Only in Node (missing in Postman or different path) ---');
  if (onlyInNode.length === 0) {
    console.log('(none)');
  } else {
    onlyInNode.forEach((r) => console.log(`  ${r.method.padEnd(6)} ${r.path}  [${r.resource}.${r.operation}]`));
  }
  console.log('');

  console.log('--- Matched (same endpoint) ---');
  const matchedUnique = [];
  const seen = new Set();
  matched.forEach((m) => {
    const k = m.node + ' ' + m.path;
    if (!seen.has(k)) {
      seen.add(k);
      matchedUnique.push(m);
    }
  });
  matchedUnique.forEach((m) => console.log(`  ${m.path}  <- ${m.node}`));
  console.log('');
  console.log('Summary: Only in Postman (unique):', onlyInPostman.length, '| Only in Node:', onlyInNode.length, '| Matched:', matchedUnique.length);
}

runComparison();
