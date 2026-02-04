# Testing the PAL Gate Node

## Prerequisites

1. **n8n installed and running**
   - n8n should be installed: `npm install -g n8n`
   - Or running via Docker/other method

2. **PAL Gate node installed**
   - Development: `npm link` in the node directory, then `npm link n8n-nodes-palgate` in n8n
   - Production: `npm install n8n-nodes-palgate` in n8n

3. **PAL Gate credentials configured**
   - Create credentials in n8n UI with your PAL Gate username and password
   - Do not commit or document real credentials

## Test 1: Add User

### Setup

1. Create new workflow in n8n
2. Add "PAL Gate" node
3. Configure credentials (select the credentials you created)
4. Select **Resource:** `User`
5. Select **Operation:** `Add`

### Parameters

- **Place ID:** your place UUID (from PAL portal)
- **Phone:** test user phone (e.g. international format)
- **First Name / Last Name:** any test values
- **Cars:** (leave empty or add car numbers)

### Expected Result

- **Status:** Success (green checkmark)
- **Response:** Contains user data or success message
- **Console:** Shows detailed logs:
  ```
  ======================================================================
  [PAL Gate Node] Operation: POST /place/xxx/user
  [PAL Gate Node] Request Details: ...
  ======================================================================
  ```

### Verify

1. **Check n8n console** for detailed logs
2. **Check n8n UI** - node should show success
3. **Verify in PAL Gate portal** - user should appear in the place

### Troubleshooting

- **If login fails:** Check credentials are correct
- **If 400 error:** Check Place ID is valid
- **If 401 error:** Token expired, try again (token is cached for 23 hours)

---

## Test 2: Delete User (AFTER Add User succeeds)

### ⚠️ WARNING: This is a destructive operation!

**Only test this AFTER successfully adding the test user.**

### Setup

- Same workflow or create new one
- Select **Resource:** `User`
- Select **Operation:** `Delete`

### Parameters

- **Place ID:** same as used for Add
- **Phone:** the test user phone you added

### Expected Result

- **Status:** Success (green checkmark)
- **Response:** Success message
- **Console:** Shows:
  1. Validation logs (step-by-step)
  2. Critical operation warning (🔴)
  3. Request details
  4. Response details

### Verify

1. **Check n8n console** - should show:
   ```
   [PAL Gate] DELETE USER - Validation starting
   [PAL Gate] Raw value: "972556677620"
   [PAL Gate] VALIDATION PASSED - Phones to delete: ["972556677620"]
   
   🔴🔴🔴 CRITICAL OPERATION: DELETE /place/xxx/users 🔴🔴🔴
   ```
2. **Verify in PAL Gate portal** - ONLY the test user should be deleted
3. **Verify other users still exist** - no mass deletion occurred

### Troubleshooting

- **If validation error:** Check phone number is correct
- **If all users deleted:** This is the bug we're fixing - check logs immediately!

---

## Test 3: Error Handling - Empty Phone (Delete)

### Setup

- Delete operation
- **Phone field:** Leave empty or enter only whitespace

### Expected Result

- **Status:** Error (red X)
- **Error message:** "CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users."
- **Console:** Shows validation failure:
  ```
  [PAL Gate] DELETE USER - Validation starting
  [PAL Gate] Raw value: ""
  [PAL Gate] After filtering: []
  [PAL Gate] VALIDATION FAILED: CRITICAL SAFETY: ...
  ```
- **NO API call should be made** - error happens before request

### Verify

1. **Check error message** - should be clear and explain the danger
2. **Check console logs** - should show validation steps
3. **Verify no API call** - no request logs should appear
4. **Verify users still exist** - no deletion occurred

---

## Test 4: Error Handling - Missing Phone (Delete)

### Setup

- Delete operation
- Don't fill in phone field at all (leave it empty)

### Expected Result

- **Status:** Error (red X)
- **Error message:** "CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users."
- **NO API call should be made**

### Verify

- Same as Test 3

---

## Test 5: Multiple Phones (Delete)

### Setup

- Delete operation
- **Phone:** Enter multiple phone numbers:
  - `972556677620`
  - `972501234567`

### Expected Result

- **Status:** Success
- **Console:** Shows validation with multiple phones:
  ```
  [PAL Gate] Raw value: ["972556677620", "972501234567"]
  [PAL Gate] VALIDATION PASSED - Phones to delete: ["972556677620", "972501234567"]
  ```
- **Request body:** `{ "phones": ["972556677620", "972501234567"] }`

### Verify

- Both users should be deleted
- Other users should remain

---

## Test 6: Mixed Valid/Invalid Phones (Delete)

### Setup

- Delete operation
- **Phone:** Enter:
  - `972556677620` (valid)
  - `` (empty)
  - `   ` (whitespace)
  - `972501234567` (valid)

### Expected Result

- **Status:** Success
- **Console:** Shows filtering:
  ```
  [PAL Gate] After filtering: ["972556677620", "972501234567"]
  ```
- **Request body:** Only valid phones: `{ "phones": ["972556677620", "972501234567"] }`

### Verify

- Only valid phones are deleted
- Empty/whitespace values are filtered out

---

## Test 7: All Invalid Phones (Delete)

### Setup

- Delete operation
- **Phone:** Enter only empty/whitespace values:
  - ``
  - `   `
  - `null` (if possible)

### Expected Result

- **Status:** Error (red X)
- **Error message:** "CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users. Please provide at least one valid phone number."
- **NO API call should be made**

### Verify

- Validation should catch this
- No deletion should occur

---

## Logging Checklist

For each test, verify logs show:

- ✅ **Request details** - method, URL, body
- ✅ **Response details** - status, body
- ✅ **Validation steps** (for delete) - raw value, filtering, result
- ✅ **Error details** (if error) - message, context
- ✅ **Critical operation warning** (for delete) - special warning

## Success Criteria

### Add User Test
- [ ] User added successfully
- [ ] Logs show request/response
- [ ] User appears in PAL Gate portal

### Delete User Test
- [ ] Only specified user deleted
- [ ] Validation logs show correct phone
- [ ] Critical operation warning appears
- [ ] Other users still exist
- [ ] No mass deletion occurred

### Error Handling Tests
- [ ] Empty phone shows clear error
- [ ] No API call made for invalid input
- [ ] Error message explains the danger
- [ ] Validation logs show failure reason

## Reporting Issues

If you encounter issues:

1. **Copy full console logs** - Include all `[PAL Gate Node]` messages
2. **Note the test case** - Which test failed?
3. **Check validation logs** - What did validation show?
4. **Verify node version** - Is it the latest with logging?

## Next Steps After Testing

1. **If all tests pass:** Node is working correctly with logging
2. **If delete still deletes all users:** 
   - Check logs to see what was actually sent
   - Verify validation expression is working
   - Report with full logs
3. **If logs don't appear:**
   - Check n8n console is enabled
   - Verify node version has logging
   - Check n8n log files
