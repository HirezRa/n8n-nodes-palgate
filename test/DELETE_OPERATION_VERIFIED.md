# Delete operation verified

The User Delete operation was verified to work with the correct API format:

- **Endpoint:** `POST /api1/place/<placeId>/delete-many-users`
- **Body:** `{ "userList": ["<phone>"] }`

Use env vars for tests; do not commit real place IDs or phone numbers.
