# Release v1.0.23

## Fixed
- **Delete User Operation**: Fixed delete user operation that was returning error 400 "Check delete number list" (errId: 4101)
  - Changed HTTP method from POST to DELETE
  - Changed endpoint from `/place/{placeId}/delete-many-users` to `/place/{placeId}/users`
  - Body format remains unchanged (`phones` array)

## Technical Details
- Updated `nodes/PalGate/resources/users/index.ts` to use correct HTTP method and endpoint
- Updated `README.md` with correct API documentation

## Verification
- ✅ API test: DELETE `/api1/place/{placeId}/users` returns 200 OK
- ✅ Build: No linting errors
- ✅ Published to npm: `n8n-nodes-palgate@1.0.23`
