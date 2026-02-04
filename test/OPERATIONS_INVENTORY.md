# PAL Gate Node - Operations Inventory

## Resources & Operations

### User Resource
- [x] **Add** - Create new user (`POST /place/{placeId}/user`)
  - Required: phone (as `id`), firstName (as `firstname`), lastName (as `lastname`)
  - Optional: cars (array)
  
- [x] **Add Many** - Create multiple users (`POST /place/{placeId}/users`)
  - Batch operation for adding multiple users
  
- [x] **Delete** - Delete user(s) (`DELETE /place/{placeId}/users`)
  - **CRITICAL**: Requires `phones` array in body
  - **SAFETY**: Empty phones array would delete ALL users - validation prevents this
  
- [x] **Find** - Find user by phone (`GET /place/{placeId}/users?filter={phone}`)
  - Query parameter: `filter` with phone number
  
- [x] **Get Many** - Get all app users (`GET /app-user/all-users`)
  - Returns mobile app users
  
- [x] **Get Portal Users** - Get web users (`GET /users`)
  - Returns portal/web users
  
- [x] **Update** - Update user (`POST /place/{placeId}/user`)
  - Update user information
  
- [x] **Update By Phone** - Update user by phone (`POST /place/{placeId}/user/{phone}`)
  - Update user name and/or cars by phone number

### Car Resource
- [x] **Add** - Add car to user (`POST /place/{placeId}/cars`)
  - Required: userId (phone), carId (car number)
  - Optional: color
  
- [x] **Delete** - Delete car from user (`POST /place/{placeId}/delete-car`)
  - Query params: carId, userId (phone)
  
- [x] **Delete By ID** - Delete car by ID (`DELETE /place/{placeId}/user/{phone}/car/{carId}`)
  - RESTful delete operation
  
- [x] **Search In Logs** - Search car in logs (`GET /place/{placeId}/reports/car?carId={carNumber}`)
  - Query parameter: carId

### Place Resource
- [x] **Get Details** - Get place details (`GET /place/{placeId}`)
  - Returns place information
  
- [x] **Get Groups** - Get place groups (`GET /place/{placeId}/groups`)
  - Returns groups for a place
  
- [x] **Get Tree** - Get places tree (`GET /places-tree`)
  - Returns hierarchical places structure
  
- [x] **Get Users** - Get place users (`GET /place/{placeId}/users`)
  - Returns all users in a place

### Device Resource
- [x] **Get** - Get device (`GET /device/{deviceId}`)
- [x] **Get All** - Get all devices (`GET /devices`)
- [x] **Get Details** - Get device details (`GET /device/{deviceId}/details`)
- [x] **Get Live Status History** - Get live status (`GET /device/{deviceId}/live-status-history`)
- [x] **Get Log** - Get device log (`GET /device/{deviceId}/log`)
- [x] **Get Status History V2** - Get status history (`GET /device/{deviceId}/status-history-v2`)
- [x] **Get Users** - Get device users (`GET /device/{deviceId}/users`)

### Organization Resource
- [x] **Get** - Get organization (`GET /organization/{orgId}`)
- [x] **Get Details** - Get organization details (`GET /organization/{orgId}/details`)
- [x] **Get Tree** - Get organization tree (`GET /organizations-tree`)

### Dashboard Resource
- [x] **Get Devices Markers** - Get device markers
- [x] **Get Favorites** - Get favorites
- [x] **Get Recent** - Get recent items
- [x] **Get Recent Devices Places** - Get recent devices/places
- [x] **Get Statistics** - Get statistics

## API Endpoints Used

### Base URL
- `https://portal.pal-es.com/api1`

### Authentication
- `POST /api1/user/login1`
  - Body: `{ username, password }`
  - Response: `{ user: { token } }`
  - Token cached for 23 hours

### User Endpoints
- `POST /api1/place/{placeId}/user` - Add user
- `POST /api1/place/{placeId}/users` - Add many users
- `DELETE /api1/place/{placeId}/users` - Delete users (body: `{ phones: [...] }`)
- `GET /api1/place/{placeId}/users?filter={phone}` - Find user
- `GET /api1/app-user/all-users` - Get all app users
- `GET /api1/users` - Get portal users
- `POST /api1/place/{placeId}/user` - Update user
- `POST /api1/place/{placeId}/user/{phone}` - Update user by phone

### Car Endpoints
- `POST /api1/place/{placeId}/cars` - Add car
- `POST /api1/place/{placeId}/delete-car?carId={id}&userId={phone}` - Delete car
- `DELETE /api1/place/{placeId}/user/{phone}/car/{carId}` - Delete car by ID
- `GET /api1/place/{placeId}/reports/car?carId={number}` - Search car in logs

### Place Endpoints
- `GET /api1/place/{placeId}` - Get place details
- `GET /api1/place/{placeId}/groups` - Get place groups
- `GET /api1/places-tree` - Get places tree
- `GET /api1/place/{placeId}/users` - Get place users

## Critical Safety Features

### Delete User Operation
- **CRITICAL**: Empty `phones` array would delete ALL users in a place
- **Protection**: Multi-layer validation in `delete.ts`:
  1. Required field validation
  2. Array conversion and filtering
  3. Empty array check with detailed error message
  4. Console logging for debugging

### Request Headers
- `X-Access-Token`: Authentication token (from login)
- `Content-Type`: `application/json`
- `Accept`: `application/json`

## Test Data Requirements

### Test User
- Phone: `972561239876` (with country code) or `0561239876` (local)
- First Name: `אהרון`
- Last Name: `אבינו`

### Test Vehicle
- License Plate: `90741202`
- Associated with test user

## Test Sequence

1. **Authentication** - Login and get token
2. **Read Operations** - Get places, users, vehicles
3. **Create Operations** - Add test user and vehicle
4. **Update Operations** - Update test user
5. **Error Handling** - Test validation and error cases
6. **Delete Operations** - Delete test user and vehicle (cleanup)
