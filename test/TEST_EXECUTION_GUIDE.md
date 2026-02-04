# Test execution guide

Tests use **environment variables only**. Do not commit real credentials or IDs.

## Required env (see `.env.example` at repo root)

- `PAL_USERNAME` – PAL Gate account email  
- `PAL_PASSWORD` – PAL Gate account password  
- `PAL_PLACE_ID` – Place UUID  
- `PAL_DEVICE_ID` – Device/serial for device tests  
- `PAL_ORG_ID` – Organization ID  
- `PAL_PHONE` – Phone for User Find / Add / Delete tests  

Optional: `PAL_API_BASE`, `PAL_CAR_ID`, `PAL_TEST_FIRST_NAME`, `PAL_TEST_LAST_NAME`, etc. (see script headers).

## Run

1. Copy `.env.example` to `.env` and set values locally (never commit `.env`).
2. Run from repo root, e.g.:
   - `node test/test-read-only.js`
   - `node test/test-find-user-by-phone.js`
   - `node test/automated-tests.js`

Result files under `test/results/` and `test/logs/` are gitignored; do not add them to the repo.
