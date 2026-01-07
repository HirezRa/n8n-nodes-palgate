# Release v1.0.18

## 🐛 Bug Fix

### Fixed Pagination for Place Get Users

**Problem:** When using "Place - Get Users" with `Return All: true`, only 100 users were returned instead of all users (e.g., 450, 500, 750, 910+).

**Solution:** Added automatic pagination support using n8n's offset pagination mechanism.

**Changes:**
- Added pagination operations to `Place - Get Users` operation
- Configured automatic pagination with `pageSize: 100`
- n8n now automatically fetches all pages until all users are retrieved

**How it works:**
- Each page fetches 100 users
- n8n automatically increments `skip` parameter (0, 100, 200, 300, ...)
- Continues until all users are fetched
- No limit on total number of users (500, 750, 910, 1000+ all supported)

**Usage:**
1. Resource: `Place`
2. Operation: `Get Users`
3. Place ID: Enter your place ID
4. Return All: `true` ← This will now fetch ALL users automatically
5. Skip: `0` (default)

**Example:**
- 450 users: 5 pages (100+100+100+100+50)
- 750 users: 8 pages (7×100 + 50)
- 910 users: 10 pages (9×100 + 10)
- 2000 users: 20 pages (20×100)

## 📦 Installation

```bash
npm install n8n-nodes-palgate@1.0.18
```

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-palgate)
- [GitHub repository](https://github.com/HirezRa/n8n-nodes-palgate)

