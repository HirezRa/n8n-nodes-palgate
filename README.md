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

### User
- **Find**: Find a user by phone number in a place
- **Add**: Add a new user to a place
- **Add Many**: Add multiple users to a place in a single request
- **Update**: Update user information
- **Update By Phone**: Update user name and/or cars by phone number
- **Delete**: Delete a user from a place
- **Get Many**: Get all app users (mobile users)
- **Get Portal Users**: Get web users (portal users)
- **Get Image**: Get user profile image

## Credentials

The node requires PAL Portal API credentials:
- **Username**: Your PAL Portal username/email
- **Password**: Your PAL Portal password

## License

MIT

## Author

PAL Portal Team
