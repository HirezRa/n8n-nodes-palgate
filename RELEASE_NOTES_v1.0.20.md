# Release v1.0.20

## 🐛 Bug Fix

### Fixed Delete User Expression Syntax

**Problem:** Delete user operation still failed with 400 Bad Request error: "Check delete number list" even after fixing the field name from `userList` to `phones`.

**Root Cause:** The value expression syntax was incorrect: `'=[{{$value}}]'` is not valid n8n syntax. n8n expects expressions in the format `'={{...}}'`, not `'=[{{...}}]'`.

**Solution:** Changed the value expression to properly convert a single phone number string to an array format that the API expects.

**Changes:**
- Updated `n8n-nodes-PalGate/nodes/PalGate/resources/users/delete.ts` - Changed `value: '=[{{$value}}]'` to `value: '={{Array.isArray($value) ? $value : [$value]}}'`

**Impact:**
- Delete user operation now works correctly with proper array formatting
- Handles both single phone number strings and arrays correctly
- Expression is now properly parsed by n8n

**Usage:**
1. Resource: `User`
2. Operation: `Delete`
3. Place ID: Enter your place ID
4. Phone Number: Enter phone number (e.g., `972525904030`)

**Example:**
```json
Input: Phone Number = "972525904030"
Request Body: {"phones": ["972525904030"]}
Response: 200 OK - {"success": true, "deletedCount": 1}
```

**Technical Details:**
- The expression `Array.isArray($value) ? $value : [$value]` ensures:
  - If the value is already an array, it's used as-is
  - If the value is a string, it's wrapped in an array
  - This matches the API requirement for an array of phone numbers

## 📦 Installation

```bash
npm install n8n-nodes-palgate@1.0.20
```

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-palgate)
- [GitHub repository](https://github.com/HirezRa/n8n-nodes-palgate)
