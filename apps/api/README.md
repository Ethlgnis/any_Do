# 🔧 AnyDo API

> **NestJS backend service** for the AnyDo platform — handles authentication, AI integrations, chat, subscriptions, and user management.

---

## 🏗️ Architecture

```
apps/api/src/
├── main.ts                → Application entry point
├── app.module.ts          → Root module
├── common/                → Shared guards, pipes, interceptors
├── config/                → Environment & app configuration
├── database/              → MongoDB connection & schemas
└── modules/
    ├── auth/              → Google OAuth, JWT, guards, strategies
    ├── ai/                → Gemini/OpenAI chat, search, summarize
    ├── chats/             → Chat rooms & message management
    ├── subscriptions/     → Subscription tiers & billing
    └── users/             → User CRUD & admin management
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB instance
- Google OAuth credentials

### Installation

```bash
cd apps/api
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=4000
FRONTEND_ORIGIN=http://localhost:888

# Database
MONGODB_URI=mongodb://localhost:27017/anydo

# Auth
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### Running

```bash
npm run start:dev      # 🔥 Watch mode (development)
npm run start          # Standard mode
npm run start:prod     # Production mode
```

---

## 📡 API Modules

| Module            | Route Prefix       | Description                          |
|------------------|--------------------|--------------------------------------|
| **Auth**         | `/auth`            | Google OAuth login & JWT tokens      |
| **Users**        | `/users`           | User CRUD (admin-only)               |
| **Chats**        | `/chats`           | Chat rooms & message history         |
| **AI**           | `/ai`              | AI chat, search, summarize, actions  |
| **Subscriptions**| `/subscriptions`   | Subscription management              |

> Full API docs: [`docs/api-spec.md`](../../docs/api-spec.md)

---

## 🧪 Testing

```bash
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage report
```

---

## 🛠️ Tech Stack

| Technology    | Purpose                        |
|--------------|--------------------------------|
| NestJS       | Backend framework              |
| TypeScript   | Type-safe development          |
| Mongoose     | MongoDB ODM                    |
| Passport     | Authentication middleware      |
| JWT          | Token-based auth               |
| Google OAuth | Social login                   |
