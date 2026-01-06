# n8n-nodes-palgate

n8n community node for PAL Portal API - manage users, cars, places, devices, and organizations.

## Features

- **User Management**: Find, add, update, and delete users
- **Car Management**: Add and remove cars from users
- **Place Management**: Manage places and their configurations
- **Device Management**: Monitor and manage devices
- **Organization Management**: Handle organizations and their hierarchies
- **Dashboard**: Access dashboard statistics and favorites

## Installation

```bash
npm install n8n-nodes-palgate
```

## Usage

1. Install the package in your n8n instance
2. Add the "PAL Gate" node to your workflow
3. Configure credentials with your PAL Portal username and password
4. Select the resource and operation you want to perform

## Resources

### User Management
- **Find**: Find a user by phone number in a place
- **Add**: Add a new user to a place
- **Add Many**: Add multiple users to a place in a single request
- **Update**: Update user information
- **Update By Phone**: Update user name and/or cars by phone number
- **Delete**: Delete a user from a place
- **Get Many**: Get all app users (mobile users)
- **Get Portal Users**: Get web users (portal users)
- **Get Image**: Get user profile image

### Car Management
- **Add**: Add a car to a user
- **Delete**: Delete a car from a user (POST method)
- **Delete By ID**: Delete a car from a user using DELETE method
- **Search In Logs**: Search for a car in logs

### Place Management
- **Get Many**: Get list of places with pagination
- **Get Tree**: Get hierarchical tree of places
- **Get Details**: Get details of a specific place
- **Update**: Update place information
- **Get Groups**: Get groups for a place
- **Get Users**: Get users in a place with filtering
- **Format Phone Number**: Format phone number according to place settings

### Device Management
- **Get Many**: Get list of devices with filtering
- **Get Details**: Get details of a specific device
- **Get Log**: Get log entries for a device
- **Get Live Status History**: Get live status history for a device
- **Get Status History V2**: Get extended status history for a device
- **Get Users**: Get users who recently passed through a device
- **Add Users**: Add users to a device
- **Update Settings**: Update device settings

### Organization Management
- **Get Tree**: Get hierarchical tree of organizations
- **Get Details**: Get details of a specific organization

### Dashboard
- **Get Favorites**: Get admin user favorites (devices and places)
- **Get Recent**: Get recent devices and places viewed by admin user
- **Update Recent**: Update recent devices and places for admin user
- **Get Statistics**: Get dashboard statistics (devices count, places count, users count)
- **Get Devices Markers**: Get device markers for map display (geographic coordinates)

## Supported API Functions

This package provides comprehensive access to the PAL Portal API. Below is a complete list of all supported API functions organized by resource category:

### 👥 User Management (9 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Find | GET | `/place/{placeId}/users` | Find user by phone number in a place |
| Add | POST | `/place/{placeId}/user` | Add a new user to a place |
| Add Many | POST | `/place/{placeId}/users` | Add multiple users to a place in a single request |
| Update | POST | `/place/{placeId}/user` | Update user information |
| Update By Phone | POST | `/place/{placeId}/user/{phone}` | Update user name and/or cars by phone number |
| Delete | POST | `/place/{placeId}/delete-many-users` | Delete a user from a place |
| Get Many | GET | `/app-user/all-users` | Get all app users (mobile users) |
| Get Portal Users | GET | `/users` | Get web users (portal users) |
| Get Image | GET | `/app-user/{phone}/image` | Get user profile image |

### 🚗 Car Management (4 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Add | POST | `/place/{placeId}/cars` | Add a car to a user |
| Delete | POST | `/place/{placeId}/delete-car` | Delete a car from a user (POST method) |
| Delete By ID | DELETE | `/place/{placeId}/user/{phone}/car/{carId}` | Delete a car from a user using DELETE method |
| Search In Logs | GET | `/place/{placeId}/reports/car` | Search for a car in logs |

### 🏢 Place Management (7 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Get Many | GET | `/place` | Get list of places with pagination |
| Get Tree | GET | `/places-tree` | Get hierarchical tree of places |
| Get Details | GET | `/place/{placeId}` | Get details of a specific place |
| Update | POST | `/place/{placeId}/general/edit` | Update place information |
| Get Groups | GET | `/place/{placeId}/groups` | Get groups for a place |
| Get Users | GET | `/place/{placeId}/users` | Get users in a place with filtering |
| Format Phone Number | GET | `/place/{placeId}/format-number` | Format phone number according to place settings |

### 🖥️ Device Management (8 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Get Many | GET | `/devices` | Get list of devices with filtering |
| Get Details | GET | `/device/{serial}` | Get details of a specific device |
| Get Log | GET | `/device/{serial}/log` | Get log entries for a device |
| Get Live Status History | GET | `/device/{serial}/live-status-history` | Get live status history for a device |
| Get Status History V2 | GET | `/device/{serial}/get-status-historyV2` | Get extended status history for a device |
| Get Users | GET | `/device/{serial}/users` | Get users who recently passed through a device |
| Add Users | POST | `/device/{serial}/users` | Add users to a device |
| Update Settings | POST | `/device/{serial}/settings` | Update device settings |

### 🏛️ Organization Management (2 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Get Tree | GET | `/orgs-tree` | Get hierarchical tree of organizations |
| Get Details | GET | `/org/{orgId}` | Get details of a specific organization |

### 📊 Dashboard (5 operations)

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Get Favorites | GET | `/user/admin/favorites` | Get admin user favorites (devices and places) |
| Get Recent | GET | `/user/admin/recent-devices-places` | Get recent devices and places viewed by admin user |
| Update Recent | PUT | `/user/admin/recent-devices-places` | Update recent devices and places for admin user |
| Get Statistics | GET | `/user/dashboard/statistics` | Get dashboard statistics (devices count, places count, users count) |
| Get Devices Markers | GET | `/devices-markers` | Get device markers for map display (geographic coordinates) |

### Summary

- **Total Operations**: 35 API operations
- **Resources**: 6 categories (User, Car, Place, Device, Organization, Dashboard)
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Base URL**: `https://portal.pal-es.com/api1`

## Credentials

The node requires PAL Portal API credentials:
- **Username**: Your PAL Portal username/email
- **Password**: Your PAL Portal password

## License

MIT

## Author

PAL Portal Team
