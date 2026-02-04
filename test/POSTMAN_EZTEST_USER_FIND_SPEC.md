# User Find – Spec for Postman comparison

**Purpose:** Compare the node's "User Find" operation with Postman/EzTest collection (request and response shape).

---

## Request

| Field | Value |
|-------|--------|
| **Method** | `GET` |
| **URL** | `{{baseUrl}}/place/{{placeId}}/users` |
| **Query** | `skip=0`, `limit=100`, `filter=<phone>` |
| **Headers** | `Content-Type: application/json`, `Accept: application/json`, `X-Access-Token: <token>` |

**Example (use your own placeId and phone):**
```
GET https://portal.pal-es.com/api1/place/<placeId>/users?skip=0&limit=100&filter=<phone>
X-Access-Token: <token>
Accept: application/json
```

- `filter`: search by phone (or name/car per API). Node uses the `phone` parameter.
- Phone in international format (e.g. 972XXXXXXXXX).

---

## Response (200 OK)

Body shape:

```json
{
  "err": null,
  "errId": 0,
  "msg": "success",
  "users": {
    "count": 1,
    "start": 0,
    "len": 1,
    "list": [
      {
        "_id": "<phone>",
        "firstname": "...",
        "lastname": "...",
        "places": [ ... ],
        "cars": [ ... ]
      }
    ]
  }
}
```

In n8n, the node returns the full response body; `users.list` is at `json.users.list`.

---

**Do not commit:** Real place IDs, phone numbers, tokens, or Postman/HAR exports that contain real data.
