<p align="center">
  <img src="https://img.shields.io/badge/AnyDo-AI%20Powered-blueviolet?style=for-the-badge&logo=openai&logoColor=white" alt="AnyDo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

# 🚀 AnyDo

> **AI-powered productivity platform** — A full-stack monorepo application with intelligent chat, Google OAuth, and subscription management.

---

## ✨ Features

- 🤖 **AI Chat** — Powered by Gemini / OpenAI for smart conversations, search, and summarization
- 🔐 **Google OAuth** — Seamless authentication with Google Sign-In
- 💬 **Real-time Chat** — Chat rooms with message history
- 💳 **Subscriptions** — Tiered subscription management
- 👥 **User Management** — Admin panel with role-based access control
- 📦 **Monorepo** — Turborepo-managed workspace with shared packages

---

## 🏗️ Architecture

```
┌──────────────┐     HTTP / REST     ┌──────────────┐
│  Next.js     │ ──────────────────▶ │  NestJS API  │
│  Frontend    │                     │  Backend     │
│  (apps/web)  │ ◀────────────────── │  (apps/api)  │
└──────────────┘                     └──┬───────┬───┘
                                       │       │
                                       ▼       ▼
                                   MongoDB   AI Service
```

> See [`docs/architecture.md`](docs/architecture.md) for full system diagrams.

---

## 📁 Project Structure

```
any_Do-1/
├── apps/
│   ├── api/             → NestJS backend (auth, AI, chats, subscriptions)
│   └── web/             → Next.js frontend (SSR/CSR dashboard)
├── packages/
│   ├── types/           → @anydo/types — Shared TypeScript interfaces & DTOs
│   ├── ui/              → @anydo/ui — Shared React components & design system
│   └── utils/           → @anydo/utils — Shared utility functions
├── docs/                → Project documentation
├── turbo.json           → Turborepo pipeline configuration
└── package.json         → Root workspace configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** instance (local or Atlas)
- **Google OAuth** credentials (Client ID & Secret)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# → Edit with MongoDB URI, JWT secret, Google OAuth credentials

# Frontend
cp apps/web/.env.example apps/web/.env.local
# → Edit with NEXT_PUBLIC_API_BASE_URL if needed
```

### 3. Run Development Servers

```bash
npm run dev          # 🚀 Starts both frontend + backend via Turborepo
```

| App          | URL                        |
|-------------|----------------------------|
| **Frontend** | http://localhost:888       |
| **Backend**  | http://localhost:4000      |

---

## 📜 Available Scripts

| Command              | Description                              |
|---------------------|------------------------------------------|
| `npm run dev`       | Start all apps in development mode       |
| `npm run build`     | Build all apps and packages              |
| `npm run lint`      | Lint all apps and packages               |

---

## 🔗 Environment Variables

| App       | File                     | Key Variables                                       |
|-----------|--------------------------|-----------------------------------------------------|
| `apps/api`  | `.env`                 | `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_ORIGIN` |
| `apps/web`  | `.env.local`           | `NEXT_PUBLIC_API_BASE_URL`                          |

---

## 📚 Documentation

| Document                                          | Description                      |
|--------------------------------------------------|----------------------------------|
| [`docs/architecture.md`](docs/architecture.md)   | System diagrams & monorepo layout |
| [`docs/api-spec.md`](docs/api-spec.md)           | REST API endpoint reference       |
| [`docs/system-design.md`](docs/system-design.md) | System design & data flows        |

---

## 🛠️ Tech Stack

| Layer        | Technology                     |
|-------------|--------------------------------|
| Frontend    | Next.js, React, SCSS           |
| Backend     | NestJS, TypeScript             |
| Database    | MongoDB, Mongoose              |
| Auth        | Google OAuth 2.0, JWT, Passport|
| AI          | Gemini / OpenAI                |
| Monorepo    | Turborepo, npm workspaces      |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
