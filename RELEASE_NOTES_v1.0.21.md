# Release v1.0.21

## 🐛 Bug Fix

### Fixed Delete User Array Handling

**Problem:** Delete user operation still failed with 400 Bad Request error: "Check delete number list" even after previous fixes.

**Root Cause:** The expression `Array.isArray($value) ? $value : [$value]` was not being parsed correctly by n8n, causing the phone number to not be sent as an array.

**Solution:** Changed to use `typeOptions.multipleValues: true` which is the recommended n8n pattern for handling arrays, matching the approach used in other operations like `add` and `updateByPhone` for the `cars` array.

**Changes:**
- Updated `n8n-nodes-PalGate/nodes/PalGate/resources/users/delete.ts`
  - Added `typeOptions: { multipleValues: true }`
  - Changed `value` expression from `'={{Array.isArray($value) ? $value : [$value]}}'` to `'={{$value || []}}'`
  - Added `default: []`

**Impact:**
- Delete user operation now works correctly with proper array handling
- n8n automatically handles array conversion when user enters a single phone number
- Matches the pattern used in other array fields (cars) for consistency
- More reliable expression parsing in n8n

**Usage:**
1. Resource: `User`
2. Operation: `Delete`
3. Place ID: Enter your place ID
4. Phone Number: Enter phone number(s) - can be single or multiple
   - Single: `972525904030`
   - Multiple: `972525904030`, `972501234567`

**Example:**
```json
Input: Phone Number = "972525904030"
Request Body: {"phones": ["972525904030"]}
Response: 200 OK - {"success": true, "deletedCount": 1}
```

**Technical Details:**
- Using `typeOptions.multipleValues: true` allows n8n to handle the array conversion automatically
- The expression `$value || []` ensures an empty array if no value is provided
- This approach is more reliable than manual array conversion expressions in n8n

## 📦 Installation

```bash
npm install n8n-nodes-palgate@1.0.21
```

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-palgate)
- [GitHub repository](https://github.com/HirezRa/n8n-nodes-palgate)
