# Troubleshooting Guide

**Last Updated:** 2026-01-13  
**Version:** 1.0.28

---

## Common Issues and Solutions

### Delete User Operation

#### Error 4101: "Check delete number list"

**Symptoms:**
- Error 400 Bad Request
- Error ID: 4101
- Message: "Check delete number list"

**Causes:**
1. Phone number passed as number instead of string (fixed in v1.0.28)
2. Empty phone number array
3. Invalid phone number format

**Solutions:**

1. **Update to v1.0.28 or later:**
   ```bash
   npm update n8n-nodes-palgate
   ```
   Then restart n8n.

2. **Check phone number format:**
   - Verify phone number is not empty
   - Check n8n expression output
   - Try different formats (with/without 972, with/without 0)

3. **Check n8n logs:**
   - Look for "[PAL Gate]" messages in execution logs
   - Verify validation steps completed
   - Check final formatted phone number

4. **Verify user exists:**
   - Use "Find" operation to verify user exists
   - Check phone number matches user's phone in system

**Example Fix:**
```javascript
// If using expression: 972{{ $json.M_phone }}
// And M_phone is a number, update to v1.0.28
// Or convert to string: String(972{{ $json.M_phone }})
```

---

#### Error 400: "Bad request"

**Symptoms:**
- Error 400 Bad Request
- Generic error message

**Causes:**
- Invalid place ID
- Missing required parameters
- Invalid request format

**Solutions:**
1. Verify place ID is correct (UUID format)
2. Check all required fields are filled
3. Verify credentials are valid
4. Check API endpoint is correct

---

#### Error 401: "Unauthorized"

**Symptoms:**
- Error 401 Unauthorized
- Authentication failed

**Solutions:**
1. Check credentials in n8n
2. Verify username and password are correct
3. Re-authenticate if token expired
4. Check API URL is correct

---

### Add User Operation

#### Error: Empty phone accepted

**Symptoms:**
- API accepts empty phone and generates random ID
- User created with unexpected phone number

**Solution:**
- Node validates and prevents empty phones (v1.0.24+)
- Update to latest version
- Always provide phone number

---

### General Issues

#### Node not found in n8n

**Solutions:**
1. Install the node:
   ```bash
   npm install n8n-nodes-palgate
   ```

2. Restart n8n

3. Check node is in community nodes list

---

#### Version mismatch

**Symptoms:**
- Old behavior persists after update
- Fixes not working

**Solutions:**
1. Update node:
   ```bash
   npm update n8n-nodes-palgate
   ```

2. Restart n8n completely

3. Clear n8n cache if available

4. Verify version in package.json

---

## Debugging Tips

### 1. Check n8n Execution Logs

Look for messages with "[PAL Gate]" prefix:
```
[PAL Gate] DELETE USER - Validation starting
[PAL Gate] Raw value: ...
[PAL Gate] Formatted phone: ... -> ...
[PAL Gate] VALIDATION PASSED - userList to delete: ...
```

### 2. Test API Directly

Use test scripts to verify API behavior:
```bash
node test/test-delete-exact-node-format.js
```

### 3. Verify Phone Number Format

Check what format the API expects:
- Try different formats in test script
- Check API documentation
- Monitor network requests in browser DevTools

### 4. Check Node Version

Verify you're using the latest version:
```bash
npm list n8n-nodes-palgate
```

---

## Getting Help

### Check Documentation

1. [README.md](../README.md) - Main documentation
2. [DELETE_OPERATION.md](DELETE_OPERATION.md) - Delete operation details
3. [CHANGELOG.md](../CHANGELOG.md) - Version history
4. [DELETE_ISSUE_ANALYSIS.md](../DELETE_ISSUE_ANALYSIS.md) - Delete issue analysis

### Report Issues

1. **GitHub Issues:**
   - https://github.com/HirezRa/n8n-nodes-palgate/issues
   - Include: version, error message, steps to reproduce

2. **Check Existing Issues:**
   - Search for similar issues
   - Check if already fixed in newer version

---

## Version-Specific Fixes

### v1.0.28
- ✅ Fixed delete operation to handle number types
- ✅ Resolved error 4101

### v1.0.26
- ✅ Added automatic phone number formatting
- ✅ Handles phone numbers starting with 0

### v1.0.25
- ✅ Fixed delete endpoint and body format

---

**For more help, see:**
- [README.md](../README.md)
- [DELETE_OPERATION.md](DELETE_OPERATION.md)
