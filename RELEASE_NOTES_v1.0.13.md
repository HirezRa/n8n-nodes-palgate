# Release v1.0.13

## 🐛 Bug Fixes

### Authentication Fix
- **Fixed:** Authentication now works correctly in n8n credentials interface
- **Issue:** Credentials were failing to authenticate even with correct username/password
- **Solution:** Added fallback mechanism in `authenticate` function to perform login directly using fetch API when token is not available
- **Impact:** Users can now successfully create and use credentials in n8n without needing to save credentials multiple times

### Technical Details
- Modified `authenticate` function in `PalGateApi.credentials.ts` to perform login directly using `fetch` API when token is not in cache or credentials
- This ensures authentication works even if `preAuthentication` hook is not called
- Token caching still works as before (23 hours cache)

## 📝 Changes

- `credentials/PalGateApi.credentials.ts`: Added fallback authentication using fetch API
- Resolved linting issues with fetch API usage

## 🔗 Links

- NPM: https://www.npmjs.com/package/n8n-nodes-palgate
- GitHub: https://github.com/HirezRa/n8n-nodes-palgate

