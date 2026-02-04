# n8n-nodes-palgate

n8n community node for PAL Gate parking management system integration.

## Installation

```bash
npm install n8n-nodes-palgate
```

Or install via n8n Community Nodes settings in your n8n instance.

## Supported Operations

### ✅ Fully Working

| Resource | Operation | Status | Description |
|----------|-----------|--------|-------------|
| **Auth** | Test Connection | ✅ Working | Verify credentials and connection to PAL Gate (uses minimal API call) |
| **Places** | Get All | ✅ Working | Get hierarchical tree of places |
| **Places** | Get One | ✅ Working | Get details of a specific place |
| **Users** | Get All | ✅ Working | Get all users in a place |
| **Users** | Add | ✅ Working | Add a new user to a place |
| **Users** | Update | ✅ Working | Update user information |
| **Groups** | Get All | ✅ Working | Get groups for a place |
| **Devices** | Get Info | ✅ Working | Get device information |

### ⚠️ Limited Support

| Resource | Operation | Status | Notes |
|----------|-----------|--------|-------|
| **Users** | Delete | ✅ Working | Fixed in v1.0.28 - handles both string and number phone formats |
| **Devices** | Open Gate | ⚠️ Use carefully | Triggers physical gate operation |

### ❌ Not Available

| Resource | Operation | Status | Notes |
|----------|-----------|--------|-------|
| **Vehicles** | All Operations | ❌ Not supported | API endpoints not available - may be added in future updates |

## Configuration

### Credentials

The node requires PAL Gate API credentials:

- **Username/Email**: Your PAL Gate account email
- **Password**: Your PAL Gate account password
- **API URL**: `https://portal.pal-es.com` (default, automatically configured)

### Testing the Connection

You can verify your credentials and connection in two ways:

1. **From the node:** Add a PAL Gate node → choose **Resource: Auth** → **Operation: Test Connection**. Run the node; if it succeeds, credentials and connection are valid.
2. **When saving credentials:** In the credential dialog, use the **Test** / **Verify** button (if shown by your n8n version) to validate the connection before saving.

### Required Parameters

- **Place ID**: Found in PAL Gate portal URL or settings (format: UUID)
- **Device ID**: For device operations, found in device settings

## API Endpoints

### Verified Working Endpoints

```
Authentication:
  POST /api1/user/login1

Places:
  GET /api1/places-tree
  GET /api1/place/{placeId}

Users:
  GET /api1/place/{placeId}/users
  POST /api1/place/{placeId}/user
  DELETE /api1/place/{placeId}/users

Groups:
  GET /api1/place/{placeId}/groups

Devices:
  GET /api1/device/{deviceId}
```

## Error Handling

The node includes comprehensive error handling:

- **Input Validation**: Phone numbers, required fields, format checks
- **Clear Error Messages**: Context-aware error messages with helpful hints
- **API Error Translation**: Converts API errors to user-friendly messages
- **Status Code Handling**: Specific messages for common HTTP status codes

### Error Message Examples

- **400 Bad Request**: "Bad request. Please check your input parameters."
- **401 Unauthorized**: "Authentication failed. Please check your credentials."
- **403 Forbidden**: "Access forbidden. You may not have permission for this operation."
- **404 Not Found**: "Resource not found. Please verify the resource exists."
- **409 Conflict**: "Conflict. The resource may already exist."
- **500+ Server Error**: "Server error. Please try again later or contact support."

## Safety Features

### Delete Operations

Delete operations include multiple safety layers:

1. **Phone Number Validation**: Required, format check, non-empty validation
2. **Type Handling**: Accepts both string and number types (fixed in v1.0.28)
3. **Automatic Formatting**: Converts phone numbers to 972XXXXXXXXX format
4. **Empty Array Prevention**: Prevents sending empty phones arrays
5. **Detailed Logging**: Full audit trail of all delete operations
6. **Warning Messages**: Critical warnings about API behavior

✅ **Fixed in v1.0.28**: Delete operation now correctly handles phone numbers passed as numbers (from n8n expressions like `972{{ $json.M_phone }}`).

### Add Operations

- **Phone Validation**: Prevents empty phone numbers (API would generate random IDs)
- **Required Field Checks**: Validates all required fields before sending
- **Format Validation**: Ensures data is in correct format

## Usage Examples

### Add a User

1. Select resource: **User**
2. Select operation: **Add**
3. Enter Place ID
4. Enter Phone number (required)
5. Enter First Name (required)
6. Enter Last Name (required)
7. Optionally add Cars

### Get All Users in a Place

1. Select resource: **User**
2. Select operation: **Find** or **Get Many**
3. Enter Place ID
4. Optionally add filter (for Find operation)

### Update a User

1. Select resource: **User**
2. Select operation: **Update** or **Update By Phone**
3. Enter Place ID
4. Enter Phone number
5. Update desired fields

## Known Limitations

### API Limitations

1. **Vehicle Operations**: Vehicle endpoints return 404. This is an API limitation, not a node issue.
2. **Delete Operation**: ✅ Fixed in v1.0.28 - now handles both string and number phone formats correctly.
3. **Empty Phone Numbers**: API accepts empty phone numbers and generates random IDs. Node validates to prevent this.

### Workarounds

- **Vehicles**: Currently not supported by API. May be added in future API updates.
- **Delete Verification**: Always check user count before and after delete operations.

## Syncing with Postman (EzTest)

If you maintain the PAL Gate API collection in Postman (EzTest workspace), you can keep the node in sync:

1. **Export** the collection from Postman (Collection v2.1) and save as `postman/PalGate-API-Collection.json`.
2. Run: `node test/compare-postman-to-node.js`  
   The script reports: endpoints only in Postman (add to node), only in node (review), and matched.
3. Update the node based on the report (see [docs/POSTMAN_SYNC.md](docs/POSTMAN_SYNC.md)).

You can also pass a path: `node test/compare-postman-to-node.js "path/to/collection.json"`.

## Testing

The node has been tested against the live PAL Gate API:

- **Total Tests**: 17
- **Passed**: 12 (70.6%)
- **Failed**: 1 (API issue, node includes protection)
- **Skipped**: 4 (Features not available in API)

See `test/AUTOMATED_TEST_REPORT.md` for detailed test results.

## Troubleshooting

### Delete Operation Issues

**Error 4101: "Check delete number list"**
- **Solution:** Update to v1.0.28 or later
- **Cause:** Phone number type handling (fixed in v1.0.28)
- **See:** [DELETE_OPERATION.md](docs/DELETE_OPERATION.md) for details

**Other Delete Issues:**
- Verify phone number format
- Check n8n execution logs for validation messages
- Ensure place ID is correct

## Support

### Node Issues

For issues with this n8n node:
- Open an issue on [GitHub](https://github.com/HirezRa/n8n-nodes-palgate)
- Check existing issues and documentation
- See [docs/DELETE_OPERATION.md](docs/DELETE_OPERATION.md) for delete operation details

### API Issues

For PAL Gate API issues:
- Contact PAL Gate support
- Check PAL Gate API documentation

## Development

### Building

```bash
npm run build
```

### Testing

```bash
node test/automated-tests.js
```

### Linting

```bash
npm run lint
```

## License

MIT

## Author

PAL Portal Team

## Version

1.0.28

### Recent Updates

**v1.0.28 (2026-01-13)**
- Fixed delete operation to handle number types (not just strings)
- Resolved error 4101 "Check delete number list"
- Improved phone number validation

**v1.0.27 (2026-01-13)**
- Maintenance release

**v1.0.26 (2026-01-13)**
- Added automatic phone number formatting for delete operations
- Handles phone numbers starting with 0 (converts to 972)
- Handles phone numbers without country code (adds 972 prefix)

**v1.0.25 (2026-01-13)**
- Fixed delete operation to use correct API format (POST /delete-many-users with userList)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
