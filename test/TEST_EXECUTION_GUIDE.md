# Test Execution Guide

## Prerequisites

1. **Node.js** must be installed and available in PATH
   - Check: `node --version`
   - If not found, install Node.js from https://nodejs.org/

2. **Test Credentials** (already configured in test script)
   - API URL: https://portal.pal-es.com
   - User: REDACTED_EMAIL
   - Password: REDACTED_PASSWORD
   - Org ID: 10131
   - Device ID: LPR100200416
   - Place ID: 3c4b88c3-ab7a-4ac5-9c1a-1fb656e095ad

## Running the Tests

### Option 1: Direct Node Execution
```powershell
cd "C:\AiProjects\Cursor API Creator\n8n-nodes-PalGate"
node test\run-all-tests.js
```

### Option 2: Using npm (if node_modules exists)
```powershell
cd "C:\AiProjects\Cursor API Creator\n8n-nodes-PalGate"
npm run test
```

(Note: You may need to add a test script to package.json)

### Option 3: Using npx
```powershell
cd "C:\AiProjects\Cursor API Creator\n8n-nodes-PalGate"
npx node test\run-all-tests.js
```

## Test Output

The test suite will:

1. **Create log files** in `test/logs/`:
   - Format: `test-run-YYYY-MM-DDTHH-MM-SS-sssZ.log`
   - Contains detailed request/response logging

2. **Create result files** in `test/results/`:
   - Format: `test-results-YYYY-MM-DDTHH-MM-SS-sssZ.json`
   - Contains structured test results

3. **Display summary** in console:
   - Total tests run
   - Passed/Failed/Skipped counts
   - List of failed tests (if any)

## Test Sequence

The tests run in this order:

1. **Authentication** - Login and get token
2. **Read Operations** - Get places, users, vehicles
3. **Create Operations** - Add test user and vehicle
4. **Update Operations** - Update test user
5. **Error Handling** - Test validation and error cases
6. **Delete Operations** - Delete test user and vehicle (cleanup)

## Test Data

The test suite will:
- **Create** a test user with phone `972561239876`
- **Create** a test vehicle with license plate `90741202`
- **Delete** both at the end (cleanup)

## Expected Results

### Successful Test Run
- All authentication tests pass
- Read operations return data
- Create operations succeed
- Update operations succeed
- Error handling correctly rejects invalid inputs
- Delete operations clean up test data

### Common Issues

1. **Node.js not found**
   - Solution: Install Node.js or add to PATH

2. **Authentication fails**
   - Check credentials in test script
   - Verify API is accessible

3. **Test user already exists**
   - Test will still pass (409 status)
   - Will attempt to delete at end

4. **Delete operation fails**
   - Check if test user exists
   - Verify phone number format

## Reviewing Results

### View Log File
```powershell
Get-Content test\logs\test-run-*.log | Select-Object -Last 100
```

### View Results JSON
```powershell
Get-Content test\results\test-results-*.json | ConvertFrom-Json | Format-List
```

### Find Failed Tests
```powershell
$results = Get-Content test\results\test-results-*.json | ConvertFrom-Json
$results.tests | Where-Object { $_.status -eq 'failed' } | Format-Table name, status, details
```

## Safety Features

The test suite includes critical safety checks:

1. **Empty phones array validation** - Prevents deleting all users
2. **User count verification** - Confirms only test user is deleted
3. **Detailed logging** - Every request/response is logged
4. **Error context** - Full error details for debugging

## Next Steps After Testing

1. Review test results
2. Fix any issues found
3. Rebuild the node: `npm run build`
4. Rerun tests to verify fixes
