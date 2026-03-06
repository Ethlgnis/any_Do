# 📡 API Specification

> **Base URL**: `http://localhost:4000`

All protected endpoints require the header:
```
Authorization: Bearer <jwt>
```

---

## 🔐 Authentication

| Method | Endpoint                | Auth | Description                              |
|--------|------------------------|------|------------------------------------------|
| `GET`  | `/auth/google`         | ❌   | Redirects to Google OAuth consent screen |
| `GET`  | `/auth/google/callback`| ❌   | Handles OAuth callback, issues JWT       |
| `GET`  | `/auth/me`             | ✅   | Returns the authenticated user profile   |

### `GET /auth/google/callback`

On success, redirects to the frontend with query params:

| Param        | Type   | Description                |
|-------------|--------|----------------------------|
| `token`     | string | JWT access token           |
| `driveToken`| string | Google Drive access token  |
| `user`      | string | JSON-stringified user data |

### `GET /auth/me`

**Response:**
```json
{
  "_id": "abc123",
  "email": "user@gmail.com",
  "displayName": "John Doe",
  "role": "user"
}
```

---

## 👥 Users (Admin Only)

All endpoints require `admin` role.

| Method   | Endpoint      | Description             |
|----------|--------------|-------------------------|
| `GET`    | `/users`     | List all users          |
| `GET`    | `/users/:id` | Get user by ID          |
| `PATCH`  | `/users/:id` | Update user by ID       |
| `DELETE` | `/users/:id` | Delete user by ID       |

---

## 💬 Chats

| Method | Endpoint                     | Auth | Description                    |
|--------|------------------------------|------|--------------------------------|
| `GET`  | `/chats/:roomId/messages`    | ✅   | List messages in a chat room   |
| `POST` | `/chats/:roomId/messages`    | ✅   | Send a message to a chat room  |

### `POST /chats/:roomId/messages`

**Request Body:**
| Field     | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| `content` | string | ✅       | Message content |

**Response:**
```json
{
  "_id": "msg123",
  "roomId": "room-abc",
  "sender": "user-id",
  "content": "Hello!",
  "createdAt": "2026-03-07T00:00:00.000Z"
}
```

---

## 💳 Subscriptions

| Method | Endpoint              | Auth  | Description                          |
|--------|-----------------------|-------|--------------------------------------|
| `GET`  | `/subscriptions/me`   | ✅    | Get current user's subscription      |
| `POST` | `/subscriptions`      | ✅    | Create/update user's subscription    |
| `GET`  | `/subscriptions`      | Admin | List all subscriptions               |

---

## 🤖 AI

All AI endpoints require authentication.

### `POST /ai/chat`

Generate an AI chat response.

| Field     | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `message` | string | ✅       | User's chat message  |
| `context` | object | ❌       | Additional context   |

**Response:**
```json
{
  "reply": "Here's what I found...",
  "metadata": {}
}
```

### `POST /ai/search`

AI-powered semantic search.

| Field   | Type   | Required | Description     |
|---------|--------|----------|-----------------|
| `query` | string | ✅       | Search query    |
| `data`  | object | ❌       | Search data     |

### `POST /ai/summarize`

Summarize content using AI.

| Field     | Type   | Required | Description                         |
|-----------|--------|----------|-------------------------------------|
| `content` | string | ✅       | Content to summarize                |
| `type`    | string | ❌       | Type of summary (default: `chat`)   |

### `POST /ai/suggestions`

Get AI-powered suggestions.

| Field     | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `context` | object | ❌       | Context for suggestions |

### `POST /ai/quick-action`

Execute a quick AI action.

| Field    | Type   | Required | Description   |
|----------|--------|----------|---------------|
| `action` | string | ✅       | Action name   |
| `data`   | object | ❌       | Action data   |

---

## 🔄 Status Codes

| Code  | Meaning                            |
|-------|------------------------------------|
| `200` | Success                            |
| `201` | Created                            |
| `400` | Bad Request — invalid input        |
| `401` | Unauthorized — missing/invalid JWT |
| `403` | Forbidden — insufficient role      |
| `404` | Not Found                          |
| `500` | Internal Server Error              |

---

## 📊 Request / Response Flow

```
Client Request
     │
     ▼
 ┌────────────────┐
 │  Auth Guard    │──▶ 401 if no valid JWT
 │  (JWT check)   │
 └────────┬───────┘
          │
          ▼
 ┌────────────────┐
 │  Role Guard    │──▶ 403 if wrong role
 │  (admin check) │
 └────────┬───────┘
          │
          ▼
 ┌────────────────┐
 │  Controller    │──▶ Validates input
 │  (Route logic) │
 └────────┬───────┘
          │
          ▼
 ┌────────────────┐
 │  Service       │──▶ Business logic
 │  (DB / AI)     │
 └────────┬───────┘
          │
          ▼
    JSON Response
```
