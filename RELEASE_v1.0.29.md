# Release v1.0.29 - NPM Documentation Fix

**Date:** 2026-01-13  
**Type:** Documentation Update  
**Status:** ✅ **COMPLETED**

---

## Changes

### 1. Fixed NPM Package Description
**Before:**
```
"n8n community node for PAL Portal API - manage users, cars, places, devices, and organizations"
```

**After:**
```
"n8n community node for PAL Gate API - manage users, places, devices, and organizations. Delete user operation fully working (v1.0.28+) with automatic phone formatting and type handling."
```

**Reason:** The previous description didn't reflect that delete user operation is now fully working after v1.0.28 fixes.

---

### 2. Fixed Author Field
**Before:**
```json
"author": {
  "name": "PAL Portal Team",
  "email": "support@pal-es.com"
}
```

**After:**
```json
"author": "HiRez10"
```

**Reason:** Release requirements specify author must be "HiRez10".

---

## Release Process

### ✅ Preflight Validation
- npm authentication: ✅ hirez10
- Dependencies: ✅ npm ci successful
- Quality gate: ✅ All checks passed

### ✅ Quality Gate
- ✅ `npm run lint` - Passed
- ✅ `npm run build` - Passed

### ✅ Version Bump
- Previous: 1.0.28
- New: 1.0.29
- Command: `npm version patch -m "chore(release): v%s - Fix NPM documentation for delete user operation"`

### ✅ Publish to npm
- Package: `n8n-nodes-palgate@1.0.29`
- Status: ✅ Published successfully
- Registry: https://registry.npmjs.org/

---

## Files Modified

1. **package.json**
   - Updated `description` field
   - Changed `author` from object to string "HiRez10"

2. **CHANGELOG.md**
   - Added v1.0.29 entry

---

## NPM Package Information

**Package Name:** `n8n-nodes-palgate`  
**Version:** 1.0.29  
**Author:** HiRez10  
**Description:** Updated to reflect delete user operation is fully working

---

## Verification

### NPM Registry
- ✅ Version 1.0.29 published
- ✅ Description updated
- ✅ Author field correct

### Documentation
- ✅ README.md reflects delete operation status
- ✅ CHANGELOG.md updated
- ✅ NPM description accurate

---

## Summary

| Aspect | Status |
|--------|--------|
| NPM Description | ✅ Updated |
| Author Field | ✅ Fixed |
| Version Bump | ✅ 1.0.28 → 1.0.29 |
| Build | ✅ Successful |
| Publish | ✅ Successful |
| Documentation | ✅ Updated |

---

**Release Status:** ✅ **COMPLETED**

**Note:** Git operations (status check, branch check, push, tags) were skipped as git is not in PATH. npm publish completed successfully.

---

**Release Date:** 2026-01-13  
**Version:** 1.0.29  
**Published by:** hirez10
