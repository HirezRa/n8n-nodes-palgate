# Release v1.0.24

## 🚨 CRITICAL: Security Fix

### Fixed Mass Deletion Bug
- **CRITICAL FIX**: Prevented mass deletion bug where empty phone field would delete ALL users
- Added validation to prevent empty phone arrays from being sent to API
- Added required field validation for phone number
- Added clear error messages warning about mass deletion risk

## Technical Details
- Updated `nodes/PalGate/resources/users/delete.ts` with validation expression
- Expression filters empty/null/whitespace values before sending
- Throws error if filtered array is empty (prevents `{ phones: [] }` from being sent)
- Added `required: true` to phone field

## Safety Mechanisms
- ✅ Input validation - Phone number required
- ✅ Empty array prevention - Error thrown if empty
- ✅ Whitespace filtering - Removed before validation
- ✅ Clear error messages - Warning about mass deletion risk

## Verification
- ✅ All 11 test cases passed
- ✅ All dangerous inputs blocked (empty, null, undefined, whitespace, empty array)
- ✅ All valid inputs pass correctly
- ✅ Build: No linting errors
- ✅ Published to npm: `n8n-nodes-palgate@1.0.24`

## Impact
This fix prevents a critical bug where deleting a user with an empty phone field would result in ALL users being deleted from the place.

## Breaking Changes
None - This is a safety enhancement that only adds validation.

## Migration
No migration needed. The fix is backward compatible and only adds safety checks.
