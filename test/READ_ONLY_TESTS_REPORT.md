# Read-Only Tests Report (Template)

**Node:** n8n-nodes-palgate (PAL Gate)  
**Purpose:** Run all non-destructive (GET/query) operations. No DELETE tests.

---

## Required environment (do NOT commit real values)

Set these before running tests (e.g. in `.env` which must be gitignored):

| Variable | Description |
|----------|-------------|
| `PAL_USERNAME` | PAL Gate account email |
| `PAL_PASSWORD` | PAL Gate account password |
| `PAL_PLACE_ID` | Place UUID for tests |
| `PAL_DEVICE_ID` | Device/serial for device tests |
| `PAL_ORG_ID` | Organization ID for org tests |
| `PAL_PHONE` | Phone number for User Find / Format Number / Get Image |
| `PAL_CAR_ID` | (Optional) Car ID for Car Search In Logs |

---

## Run

```bash
node test/test-read-only.js
```

Results are written to `test/results/` (gitignored). Do not commit result files; they may contain environment-specific IDs.

---

## Categories tested

- Auth (Login, Test Connection)
- User (Find, Get Many, Get Portal Users, Get Image)
- Place (Get Details, Get Groups, Get Tree, Get Users, Format Number)
- Device (Get Details, Get All, Get Log, Get Users, etc.)
- Organization (Get Tree, Get Details)
- Dashboard (Markers, Favorites, Recent, Statistics)
- Car (Search In Logs – may be skipped if API returns 404)
