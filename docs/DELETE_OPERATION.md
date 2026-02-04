# Delete User Operation - Documentation

**Last Updated:** 2026-01-13  
**Version:** 1.0.28

---

## Overview

The delete user operation allows you to remove users from a place in the PAL Gate system.

---

## API Format

### Endpoint
```
POST /api1/place/{placeId}/delete-many-users
```

### Request Body
```json
{
  "userList": ["phoneNumber"]
}
```

### Response
```json
{
  "err": null,
  "errId": 0,
  "msg": "Selected users deleted!"
}
```

---

## Usage in n8n

### Basic Usage

1. **Resource:** User
2. **Operation:** Delete
3. **Place ID:** Enter the place ID (UUID format)
4. **Phone Number:** Enter phone number(s) to delete

### Phone Number Formats

The node accepts phone numbers in various formats and automatically converts them to `972XXXXXXXXX`:

| Input Format | Converted To | Example |
|--------------|--------------|---------|
| `0525904030` | `972525904030` | Local format with 0 |
| `525904030` | `972525904030` | Without country code |
| `+972-52-590-4030` | `972525904030` | With formatting |
| `972 52 590 4030` | `972525904030` | With spaces |
| `972525904030` | `972525904030` | Already correct |

### Using n8n Expressions

You can use n8n expressions to dynamically get phone numbers:

**Option 1: With 972 prefix**
```
972{{ $json.M_phone }}
```
- If `M_phone` is `525904030`, result is `972525904030`
- Works with both string and number types ✅

**Option 2: Without 972 prefix**
```
{{ $json.M_phone }}
```
- If `M_phone` is `525904030`, node will add `972` automatically
- Works with both string and number types ✅

**Option 3: Multiple phone numbers**
```
{{ $json.phones }}
```
- If `phones` is an array: `["525904030", "0665544987"]`
- Node will format each number automatically

---

## Type Handling (v1.0.28+)

The delete operation now correctly handles both string and number types:

### ✅ Supported Types

- **String:** `"972525904030"`, `"525904030"`, `"0525904030"`
- **Number:** `972525904030`, `525904030`
- **Array of strings:** `["972525904030", "0665544987"]`
- **Array of numbers:** `[972525904030, 665544987]`
- **Mixed array:** `["972525904030", 665544987]`

### Example Scenarios

**Scenario 1: String from expression**
```javascript
// n8n expression: 972{{ $json.M_phone }}
// If M_phone = "525904030"
// Result: "972525904030" (string)
// ✅ Works
```

**Scenario 2: Number from expression**
```javascript
// n8n expression: 972{{ $json.M_phone }}
// If M_phone = 525904030 (number)
// Result: 972525904030 (number)
// ✅ Works (fixed in v1.0.28)
```

**Scenario 3: Direct value**
```javascript
// Direct input: 972525904030
// ✅ Works (both string and number)
```

---

## Safety Features

### 1. Phone Number Validation
- ✅ Required field check
- ✅ Non-empty validation
- ✅ Type checking (string or number)
- ✅ Format validation

### 2. Automatic Formatting
- ✅ Removes spaces, dashes, parentheses
- ✅ Converts `0XXXXXXXXX` → `972XXXXXXXXX`
- ✅ Adds `972` prefix if missing
- ✅ Removes `+` if present

### 3. Empty Array Prevention
- ✅ Prevents sending empty `userList` arrays
- ✅ Validates array is not empty after filtering
- ✅ Throws clear error if validation fails

### 4. Detailed Logging
- ✅ Logs all validation steps
- ✅ Logs phone number formatting
- ✅ Logs final request body
- ✅ Logs API response

---

## Error Handling

### Common Errors

**Error 4101: "Check delete number list"**
- **Cause:** Phone number format issue or empty array
- **Fix (v1.0.28+):** Now handles both string and number types
- **Solution:** Update to v1.0.28 or later

**Error 400: "Bad request"**
- **Cause:** Invalid place ID or missing parameters
- **Solution:** Verify place ID and phone number are correct

**Error 401: "Unauthorized"**
- **Cause:** Invalid or expired authentication token
- **Solution:** Check credentials and re-authenticate

---

## Examples

### Example 1: Delete Single User

**Input:**
- Place ID: `3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad`
- Phone Number: `972525904030`

**Request:**
```json
POST /api1/place/3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad/delete-many-users
{
  "userList": ["972525904030"]
}
```

**Response:**
```json
{
  "err": null,
  "errId": 0,
  "msg": "Selected users deleted!"
}
```

### Example 2: Delete Multiple Users

**Input:**
- Place ID: `3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad`
- Phone Numbers: `["972525904030", "972665544987"]`

**Request:**
```json
POST /api1/place/3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad/delete-many-users
{
  "userList": ["972525904030", "972665544987"]
}
```

### Example 3: Using n8n Expression

**Input:**
- Place ID: `{{ $json.placeId }}`
- Phone Number: `972{{ $json.M_phone }}`

**Result:**
- If `M_phone` is `"525904030"` → `"972525904030"` ✅
- If `M_phone` is `525904030` (number) → `972525904030` (number) ✅
- Node formats automatically to `"972525904030"` ✅

---

## Troubleshooting

### Issue: Error 4101 still appears

**Solution:**
1. Update to v1.0.28 or later:
   ```bash
   npm update n8n-nodes-palgate
   ```
2. Restart n8n
3. Verify phone number format in n8n logs

### Issue: Phone number not found

**Solution:**
1. Verify user exists using "Find" operation
2. Check phone number format matches user's phone in system
3. Try different phone formats (with/without 972, with/without 0)

### Issue: Multiple users deleted

**Solution:**
1. This is an API limitation
2. Always verify user count before and after delete
3. Use single phone number per delete operation when possible

---

## Version History

### v1.0.28 (2026-01-13)
- ✅ Fixed handling of number types in delete operation
- ✅ Resolved error 4101 when phone is passed as number
- ✅ Improved null/undefined/empty value checking

### v1.0.26 (2026-01-13)
- ✅ Added automatic phone number formatting
- ✅ Handles phone numbers starting with 0
- ✅ Handles phone numbers without country code

### v1.0.25 (2026-01-13)
- ✅ Fixed API endpoint (POST /delete-many-users)
- ✅ Fixed body format (userList instead of phones)

---

## Best Practices

1. **Always verify before delete:**
   - Use "Find" operation to verify user exists
   - Check user count before delete

2. **Use expressions carefully:**
   - Test expressions in n8n expression editor
   - Verify output format before using in delete

3. **Monitor logs:**
   - Check n8n execution logs for validation messages
   - Look for "[PAL Gate]" prefix in logs

4. **Update regularly:**
   - Keep node updated to latest version
   - Check CHANGELOG.md for fixes

---

**For more information, see:**
- [README.md](../README.md)
- [CHANGELOG.md](../CHANGELOG.md)
- [DELETE_ISSUE_ANALYSIS.md](../DELETE_ISSUE_ANALYSIS.md)
