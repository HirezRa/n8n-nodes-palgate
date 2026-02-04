# Release v1.0.19

## 🐛 Bug Fix

### Fixed Delete User Operation

**Problem:** Delete user operation failed with 400 Bad Request error: "Check delete number list"

**Root Cause:** The API expects `phones` field in the request body, but the code was sending `userList`.

**Solution:** Changed request body field from `userList` to `phones` to match API expectations.

**Changes:**
- Updated `n8n-nodes-PalGate/nodes/PalGate/resources/users/delete.ts` - Changed `property: 'userList'` to `property: 'phones'`
- Updated `pal-portal-api/portal_client.py` - Changed `payload = {"userList": [phone]}` to `payload = {"phones": [phone]}`

**Impact:**
- Delete user operation now works correctly
- Both n8n node and Python client are now consistent with API specification

**Usage:**
1. Resource: `User`
2. Operation: `Delete`
3. Place ID: Enter your place ID
4. Phone Number: Enter phone number (e.g., `972525904030`)

**Example:**
```json
Request Body: {"phones": ["972525904030"]}
Response: 200 OK - {"success": true, "deletedCount": 1}
```

## 📦 Installation

```bash
npm install n8n-nodes-palgate@1.0.19
```

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-palgate)
- [GitHub repository](https://github.com/HirezRa/n8n-nodes-palgate)
