# Release v1.0.14

## 🔒 Security Fix

- **Fixed:** Removed sensitive credentials from documentation files
- **Impact:** Documentation files no longer contain hardcoded credentials

## 🐛 Bug Fixes

### Authentication Fix
- **Fixed:** Authentication now works correctly in n8n credentials interface
- **Issue:** Credentials were failing to authenticate even with correct username/password
- **Solution:** Added fallback mechanism in `authenticate` function to perform login directly using fetch API when token is not available
- **Impact:** Users can now successfully create and use credentials in n8n without needing to save credentials multiple times

## 📝 Changes

- `credentials/PalGateApi.credentials.ts`: Added fallback authentication using fetch API
- `AUTHENTICATION_FIX_FINAL.md`: Removed sensitive credentials
- `AUTHENTICATION_FIX_REPORT.md`: Removed sensitive credentials
- Resolved linting issues with fetch API usage

## 🔗 Links

- NPM: https://www.npmjs.com/package/n8n-nodes-palgate
- GitHub: https://github.com/HirezRa/n8n-nodes-palgate

