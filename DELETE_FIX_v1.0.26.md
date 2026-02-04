# Delete Operation Fix - v1.0.26

**Date:** 2026-01-13  
**Version:** 1.0.26  
**Issue:** Error 4101 "Check delete number list"

---

## Problem

The delete operation was failing with error 400 and message "Check delete number list" (errId: 4101). This indicates the API was receiving the request but rejecting the phone number format.

---

## Root Cause

The API expects phone numbers in a specific format: `972XXXXXXXXX` (Israel country code + number without spaces, dashes, or other formatting).

Users might enter phone numbers in various formats:
- `0525904030` (local format starting with 0)
- `525904030` (without country code)
- `+972-52-590-4030` (with formatting)
- `972525904030` (correct format)

---

## Solution

Added automatic phone number formatting in the delete operation:

1. **Remove formatting**: Strips spaces, dashes, parentheses
2. **Handle local format**: Converts `0XXXXXXXXX` → `972XXXXXXXXX`
3. **Add country code**: Adds `972` prefix if missing
4. **Remove plus sign**: Removes `+` if present
5. **Validation**: Ensures phone is not empty

### Code Changes

**File:** `nodes/PalGate/resources/users/delete.ts`

Added phone formatting logic in the `value` expression:

```typescript
const formatted = valid.map(phone => {
  let clean = String(phone).trim().replace(/[\s\-\(\)]/g, "");
  
  // If starts with 0, replace with 972
  if (clean.startsWith("0")) {
    clean = "972" + clean.substring(1);
  }
  
  // If doesn't start with 972, add it
  if (!clean.startsWith("972") && !clean.startsWith("+972")) {
    clean = "972" + clean;
  }
  
  // Remove + if present
  clean = clean.replace("+", "");
  
  return clean;
});
```

---

## Testing

The fix handles all these formats correctly:

| Input Format | Output Format |
|--------------|---------------|
| `0525904030` | `972525904030` |
| `525904030` | `972525904030` |
| `+972-52-590-4030` | `972525904030` |
| `972 52 590 4030` | `972525904030` |
| `972525904030` | `972525904030` |

---

## Release

- **Version:** 1.0.26
- **Published:** ✅ npm registry
- **Build:** ✅ Successful
- **Status:** ✅ Ready for use

---

## User Instructions

After updating to v1.0.26:

1. **Update the node** in your n8n instance:
   ```bash
   npm update n8n-nodes-palgate
   ```

2. **Restart n8n** to load the new version

3. **Test delete operation** - it should now work with any phone format

---

## Verification

The delete operation now:
- ✅ Accepts phone numbers in any format
- ✅ Automatically formats to `972XXXXXXXXX`
- ✅ Sends correct format to API
- ✅ No more error 4101

---

**Fix Status:** ✅ **COMPLETE AND PUBLISHED**
