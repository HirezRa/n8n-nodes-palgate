# Release v1.0.22

## 🐛 Bug Fix

### Fixed Delete User Array Handling Expression

**Problem:** Delete user operation still failed with 400 Bad Request error: "Check delete number list" (errID 4101) even after previous fixes.

**Root Cause:** The expression `'={{$value || []}}'` doesn't handle string values correctly. When a user enters a single phone number as a string (e.g., `"972525904030"`), the expression returns the string instead of converting it to an array.

**What Happened:**
- User input: `"972525904030"` (string)
- Expression result: `"972525904030"` (string, not array!)
- Request body sent: `{"phones": "972525904030"}` ❌
- API expected: `{"phones": ["972525904030"]}` ✅
- Result: 400 Bad Request - "Check delete number list"

**Solution:** Changed the expression to explicitly check if the value is an array and convert strings to arrays:

```typescript
// Before
value: '={{$value || []}}'

// After
value: '={{Array.isArray($value) ? $value : ($value ? [$value] : [])}}'
```

**Changes:**
- Updated `n8n-nodes-PalGate/nodes/PalGate/resources/users/delete.ts`
  - Changed `value` expression from `'={{$value || []}}'` to `'={{Array.isArray($value) ? $value : ($value ? [$value] : [])}}'`

**Impact:**
- Delete user operation now works correctly with proper array handling
- String values are automatically converted to arrays: `"972525904030"` → `["972525904030"]`
- Array values remain arrays: `["972525904030"]` → `["972525904030"]`
- Empty/null values become empty arrays: `null` → `[]`
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
- The new expression explicitly checks if the value is an array using `Array.isArray($value)`
- If it's an array, it returns the array as-is
- If it's not an array but has a value, it wraps it in an array: `[$value]`
- If it's empty/null, it returns an empty array: `[]`
- This ensures the API always receives an array in the `phones` field

## 📦 Installation

```bash
npm install n8n-nodes-palgate@1.0.22
```

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-palgate)
- [GitHub repository](https://github.com/HirezRa/n8n-nodes-palgate)
