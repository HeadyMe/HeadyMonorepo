# Heady API Guide

Complete API reference for the Heady Headless CMS.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "editor"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@heady.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@heady.local",
    "name": "Admin User",
    "role": "admin"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token"
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

### Logout

```http
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Get Current User

```http
GET /auth/me
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@heady.local",
  "name": "Admin User",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Content Type Endpoints

### List Content Types

```http
GET /content-types
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "blog",
    "display_name": "Blog Post",
    "description": "Blog post content type",
    "schema": {
      "fields": [
        {
          "name": "title",
          "type": "text",
          "required": true
        },
        {
          "name": "content",
          "type": "richtext",
          "required": true
        }
      ]
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Content Type

```http
GET /content-types/:id
```

**Response:** Same as single item in list above

### Create Content Type

```http
POST /content-types
```

**Requires:** Admin role

**Request Body:**
```json
{
  "name": "product",
  "display_name": "Product",
  "description": "Product catalog",
  "schema": {
    "fields": [
      {
        "name": "name",
        "type": "text",
        "required": true
      },
      {
        "name": "price",
        "type": "number",
        "required": true
      },
      {
        "name": "description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "image",
        "type": "media",
        "required": false
      }
    ]
  }
}
```

**Field Types:**
- `text` - Short text
- `textarea` - Long text
- `richtext` - Rich text editor
- `number` - Numeric value
- `boolean` - True/false
- `date` - Date value
- `media` - Media file reference
- `array` - Array of values
- `object` - Nested object

### Update Content Type

```http
PUT /content-types/:id
```

**Requires:** Admin role

**Request Body:** Same as create

### Delete Content Type

```http
DELETE /content-types/:id
```

**Requires:** Admin role

## Content Entry Endpoints

### List Entries

```http
GET /entries/:contentType
```

**Query Parameters:**
- `status` - Filter by status (draft, published, archived)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**
```http
GET /entries/blog?status=published&limit=10&offset=0
```

**Response:**
```json
[
  {
    "id": "uuid",
    "content_type_id": "uuid",
    "data": {
      "title": "My First Post",
      "content": "<p>Hello world!</p>",
      "author": "John Doe"
    },
    "status": "published",
    "created_by": "uuid",
    "creator_name": "Admin User",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "published_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Entry

```http
GET /entries/:contentType/:id
```

**Response:** Same as single item in list above

### Create Entry

```http
POST /entries/:contentType
```

**Request Body:**
```json
{
  "data": {
    "title": "My New Post",
    "content": "<p>Content here</p>",
    "author": "Jane Doe"
  },
  "status": "draft"
}
```

**Status Options:**
- `draft` - Not published
- `published` - Live content
- `archived` - Archived content

### Update Entry

```http
PUT /entries/:contentType/:id
```

**Request Body:** Same as create

### Delete Entry

```http
DELETE /entries/:contentType/:id
```

## Media Endpoints

### Upload File

```http
POST /media/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - The file to upload

**Query Parameters:**
- `resize` - Optional resize (e.g., `800x600`)

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "resize=800x600"
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "uuid.jpg",
  "original_name": "image.jpg",
  "mime_type": "image/jpeg",
  "size": 123456,
  "path": "/path/to/file",
  "url": "/uploads/uuid.jpg",
  "uploaded_by": "uuid",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### List Media

```http
GET /media
```

**Query Parameters:**
- `type` - Filter by MIME type prefix (e.g., `image`)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "filename": "uuid.jpg",
    "original_name": "image.jpg",
    "mime_type": "image/jpeg",
    "size": 123456,
    "path": "/path/to/file",
    "url": "/uploads/uuid.jpg",
    "uploaded_by": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Media

```http
GET /media/:id
```

**Response:** Same as single item in list above

### Delete Media

```http
DELETE /media/:id
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable in `.env` file

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

## Example Usage

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@heady.local',
  password: 'admin123'
});

// Set token for future requests
api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

// Create entry
await api.post('/entries/blog', {
  data: {
    title: 'My Post',
    content: '<p>Content</p>'
  },
  status: 'published'
});
```

### Python

```python
import requests

BASE_URL = 'http://localhost:3000/api/v1'

# Login
response = requests.post(f'{BASE_URL}/auth/login', json={
    'email': 'admin@heady.local',
    'password': 'admin123'
})
token = response.json()['accessToken']

# Create entry
headers = {'Authorization': f'Bearer {token}'}
requests.post(f'{BASE_URL}/entries/blog', 
    headers=headers,
    json={
        'data': {
            'title': 'My Post',
            'content': '<p>Content</p>'
        },
        'status': 'published'
    }
)
```

### cURL

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@heady.local","password":"admin123"}' \
  | jq -r '.accessToken')

# Create entry
curl -X POST http://localhost:3000/api/v1/entries/blog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "My Post",
      "content": "<p>Content</p>"
    },
    "status": "published"
  }'
```
