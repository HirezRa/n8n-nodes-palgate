# PAL Gate Node - Logging Documentation

## Overview

The PAL Gate Node includes comprehensive logging for all operations, making it easy to debug issues and track API calls. All logs appear in the n8n server console.

## Log Locations

- **n8n Console:** All logs appear in the n8n server console (where n8n is running)
- **n8n UI:** Error messages appear in the node execution results
- **n8n Logs:** Detailed logs are available in n8n's log files

## Log Format

### Request Logs

For normal operations (GET, POST, PUT):

```
======================================================================
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] Operation: POST /place/xxx/user
[PAL Gate Node] Request Details:
  - method: POST
  - resource: /place/xxx/user
  - url: https://portal.pal-es.com/api1/place/xxx/user
  - body: {
      "id": "972556677620",
      "firstname": "כייסף",
      "lastname": "רחמים"
    }
  - hasAuthToken: true
======================================================================
```

### Critical Operation Logs

For destructive operations (DELETE):

```
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] ⚠️  CRITICAL OPERATION: DELETE /place/xxx/users
[PAL Gate Node] This is a destructive operation - verify all parameters!
[PAL Gate Node] Operation Details:
  - method: DELETE
  - resource: /place/xxx/users
  - url: https://portal.pal-es.com/api1/place/xxx/users
  - body: {
      "phones": ["972556677620"]
    }
  - warning: This is a destructive operation - verify all parameters before proceeding!
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
```

### Response Logs

```
======================================================================
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] Response for: POST /place/xxx/user
[PAL Gate Node] Status: 200
[PAL Gate Node] Response Body:
{
  "success": true,
  "user": {
    "phone": "972556677620",
    "name": "כייסף רחמים"
  }
}
======================================================================
```

### Error Logs

```
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] ERROR in: DELETE /place/xxx/users
[PAL Gate Node] Error Message: Phone number is required
[PAL Gate Node] Stack Trace:
Error: Phone number is required
    at ...
[PAL Gate Node] Context:
  - method: DELETE
  - resource: /place/xxx/users
  - url: https://portal.pal-es.com/api1/place/xxx/users
  - body: {
      "phones": []
    }
  - statusCode: 400
  - errorResponse: {
      "err": "Parameter error",
      "errID": 4101
    }
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

### Delete User Validation Logs

When deleting a user, the validation process is logged step-by-step:

```
[PAL Gate] DELETE USER - Validation starting
[PAL Gate] Raw value: "972556677620"
[PAL Gate] Value type: string
[PAL Gate] Is array: false
[PAL Gate] Converted to array: ["972556677620"]
[PAL Gate] After filtering: ["972556677620"]
[PAL Gate] Valid count: 1
[PAL Gate] VALIDATION PASSED - Phones to delete: ["972556677620"]
```

If validation fails:

```
[PAL Gate] DELETE USER - Validation starting
[PAL Gate] Raw value: ""
[PAL Gate] Value type: string
[PAL Gate] Is array: false
[PAL Gate] Converted to array: [""]
[PAL Gate] After filtering: []
[PAL Gate] Valid count: 0
[PAL Gate] VALIDATION FAILED: CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users. Please provide at least one valid phone number.
```

## Error Messages

### Add User Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Phone number is required" | Phone field empty | Provide a valid phone number |
| "Place ID is required" | Place ID not set | Configure Place ID in node |
| "Invalid login response" | Authentication failed | Check credentials |

### Delete User Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users." | No phone provided | Provide phone number to delete |
| "CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users. Please provide at least one valid phone number." | All phones filtered out (empty/whitespace) | Provide valid phone number(s) |
| "PAL Portal authentication failed" | Token expired or invalid | Re-authenticate |

## Safety Features

### Delete Operation Safeguards

The Delete User operation includes multiple layers of protection:

1. **Required Field Check:** Field is marked as `required: true`
2. **Null/Undefined Check:** Expression checks if value exists
3. **Type Check:** Validates that value is a string
4. **Whitespace Filtering:** Removes empty/whitespace-only values
5. **Empty Array Check:** Throws error if array is empty after filtering
6. **Detailed Logging:** All validation steps are logged
7. **Critical Operation Warning:** DELETE operations show special warning

### Validation Process

For Delete User, the validation happens in this order:

1. Check if `$value` exists (null/undefined check)
2. Convert to array (handles both string and array inputs)
3. Filter out empty/null/undefined/whitespace values
4. Check if filtered array has items
5. If empty, throw error with clear message
6. Log all steps for debugging

## How to View Logs

### In n8n Console

1. Start n8n: `n8n start`
2. Watch the console output
3. All logs will appear in real-time

### In n8n UI

1. Open n8n workflow
2. Execute the node
3. Check the execution results
4. Error messages appear in the node output

### In n8n Log Files

1. Check n8n log directory (usually `~/.n8n/logs/`)
2. Look for files with timestamps
3. Search for `[PAL Gate Node]` to find relevant logs

## Logging Best Practices

1. **Always check logs before reporting issues** - Logs contain detailed information
2. **Look for validation errors** - These show what went wrong
3. **Check critical operation warnings** - DELETE operations show special warnings
4. **Review request/response logs** - These show exactly what was sent/received

## Troubleshooting

### No Logs Appearing

- Check that n8n is running with console output enabled
- Verify the node is using the latest version with logging
- Check n8n log files if console output is not available

### Logs Too Verbose

- Logs are intentionally detailed for debugging
- Use grep/filter to find specific operations: `grep "DELETE" n8n.log`

### Missing Logs for Specific Operation

- Some operations may not trigger logs if they fail early
- Check validation logs in the expression itself
- Review n8n execution results for error messages

## Security Notes

- **Sensitive data is redacted:** Tokens and passwords are never logged
- **Full request/response logging:** Helps debug API issues
- **Audit trail:** All operations are logged with timestamps

## Examples

### Successful Add User

```
======================================================================
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] Operation: POST /place/<placeId>/user
[PAL Gate Node] Request Details:
  - method: POST
  - resource: /place/<placeId>/user
  - body: {
      "id": "<phone>",
      "firstname": "...",
      "lastname": "...",
      "cars": []
    }
======================================================================

======================================================================
[PAL Gate Node] 2026-01-13T12:00:01.000Z
[PAL Gate Node] Response for: POST /place/<placeId>/user
[PAL Gate Node] Status: 200
[PAL Gate Node] Response Body:
{
  "success": true
}
======================================================================
```

### Failed Delete (Empty Phone)

```
[PAL Gate] DELETE USER - Validation starting
[PAL Gate] Raw value: ""
[PAL Gate] Value type: string
[PAL Gate] Is array: false
[PAL Gate] Converted to array: [""]
[PAL Gate] After filtering: []
[PAL Gate] Valid count: 0
[PAL Gate] VALIDATION FAILED: CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users. Please provide at least one valid phone number.

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] ERROR in: DELETE /place/xxx/users
[PAL Gate Node] Error Message: CRITICAL SAFETY: Phone number is required. Empty phone list would delete ALL users. Please provide at least one valid phone number.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

### Successful Delete

```
[PAL Gate] DELETE USER - Validation starting
[PAL Gate] Raw value: "972556677620"
[PAL Gate] Value type: string
[PAL Gate] Is array: false
[PAL Gate] Converted to array: ["972556677620"]
[PAL Gate] After filtering: ["972556677620"]
[PAL Gate] Valid count: 1
[PAL Gate] VALIDATION PASSED - Phones to delete: ["972556677620"]

🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
[PAL Gate Node] 2026-01-13T12:00:00.000Z
[PAL Gate Node] ⚠️  CRITICAL OPERATION: DELETE /place/xxx/users
[PAL Gate Node] This is a destructive operation - verify all parameters!
[PAL Gate Node] Operation Details:
  - body: {
      "phones": ["972556677620"]
    }
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

======================================================================
[PAL Gate Node] 2026-01-13T12:00:01.000Z
[PAL Gate Node] Response for: DELETE /place/xxx/users
[PAL Gate Node] Status: 200
[PAL Gate Node] Response Body:
{
  "success": true
}
======================================================================
```
