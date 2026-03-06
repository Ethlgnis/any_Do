# System Design

## Overview

AnyDo is an AI-powered productivity platform built as a Turborepo monorepo. The system follows a **client-server architecture** with a Next.js frontend communicating with a NestJS backend via REST APIs.

---

## Core Components

| Component      | Technology     | Responsibility                                    |
|---------------|----------------|----------------------------------------------------|
| **Web Client** | Next.js        | SSR/CSR dashboard, Google OAuth login, AI chat UI  |
| **API Server** | NestJS         | REST API, auth, business logic, AI orchestration   |
| **Database**   | MongoDB        | Persistent storage for users, chats, subscriptions |
| **AI Service** | Gemini/OpenAI  | Chat completion, search, summarization, actions    |

---

## Authentication Flow

```
┌──────────┐     1. Click "Sign in with Google"     ┌──────────────┐
│  Browser │ ─────────────────────────────────────▶  │  NestJS API  │
│ (Next.js)│                                         │  /auth/google│
└──────────┘                                         └──────┬───────┘
                                                            │
                                                   2. Redirect to Google
                                                            ▼
                                                     ┌─────────────┐
                                                     │ Google OAuth │
                                                     │   Consent   │
                                                     └──────┬──────┘
                                                            │
                                                   3. Callback with code
                                                            ▼
┌──────────┐    5. Redirect with JWT + user data    ┌──────────────┐
│  Browser │ ◀───────────────────────────────────── │  NestJS API  │
│ (Next.js)│                                        │  /auth/cb    │
└──────────┘                                        └──────┬───────┘
                                                           │
                                                  4. Create/update user
                                                           ▼
                                                     ┌──────────┐
                                                     │ MongoDB  │
                                                     └──────────┘
```

**Token Flow:**
1. User clicks Google Sign-In on the frontend
2. Backend redirects to Google OAuth consent screen
3. Google returns authorization code to backend callback
4. Backend creates/updates user in MongoDB, generates JWT
5. Backend redirects to frontend with JWT token & user data as query params
6. Frontend stores JWT and uses it for subsequent API requests

---

## Data Flow — AI Chat

```
┌──────────┐   POST /ai/chat    ┌──────────────┐   API call   ┌────────────┐
│  Browser │ ─────────────────▶ │  NestJS API  │ ───────────▶ │ AI Service │
│          │                    │  (AI Module) │              │ Gemini/GPT │
│          │ ◀───────────────── │              │ ◀─────────── │            │
└──────────┘   AI Response      └──────┬───────┘  Completion  └────────────┘
                                       │
                                  Save to DB
                                       ▼
                                 ┌──────────┐
                                 │ MongoDB  │
                                 └──────────┘
```

---

## Data Models

### User
| Field           | Type     | Description                    |
|----------------|----------|--------------------------------|
| `_id`          | ObjectId | Unique identifier              |
| `email`        | string   | Google email address           |
| `displayName`  | string   | User's display name            |
| `googleId`     | string   | Google account ID              |
| `role`         | string   | `user` or `admin`              |
| `subscription` | ObjectId | Reference to subscription      |
| `createdAt`    | Date     | Account creation timestamp     |

### Chat Message
| Field      | Type     | Description                     |
|-----------|----------|---------------------------------|
| `_id`     | ObjectId | Unique identifier               |
| `roomId`  | string   | Chat room identifier            |
| `sender`  | ObjectId | Reference to user               |
| `content` | string   | Message content                 |
| `createdAt`| Date    | Message timestamp               |

### Subscription
| Field      | Type     | Description                     |
|-----------|----------|---------------------------------|
| `_id`     | ObjectId | Unique identifier               |
| `userId`  | ObjectId | Reference to user               |
| `plan`    | string   | Subscription tier               |
| `status`  | string   | Active, cancelled, expired      |
| `createdAt`| Date    | Subscription start date         |

---

## Security

| Concern           | Implementation                                          |
|------------------|----------------------------------------------------------|
| Authentication   | Google OAuth 2.0 + JWT tokens                            |
| Authorization    | Role-based guards (`user`, `admin`)                      |
| API Protection   | JWT Bearer token validation on protected routes          |
| CORS             | Restricted to `FRONTEND_ORIGIN` environment variable     |
| Secrets          | Environment variables (`.env`), never committed to repo  |

---

## Scalability Considerations

- **Monorepo**: Turborepo caches builds, enabling fast incremental builds
- **Shared Packages**: `@anydo/types`, `@anydo/ui`, `@anydo/utils` eliminate code duplication
- **Stateless API**: JWT-based auth enables horizontal scaling of the API layer
- **Database**: MongoDB's document model supports flexible schema evolution
