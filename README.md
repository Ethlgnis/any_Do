# AnyDo

Full-stack app with **backend** and **frontend** in two separate folders, connected via HTTP API.

## Project structure

```
any_Do-7/
├── backend/     ← NestJS API (only backend code)
├── frontend/    ← Next.js app (only frontend code)
└── README.md    ← this file
```

- **`backend/`** – NestJS server, REST API, MongoDB, auth, todos, chats, files, subscriptions, AI.
- **`frontend/`** – Next.js app, UI, calls backend API.

They are **connected** by:

- Frontend uses `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000`) to call the backend.
- Backend allows the frontend origin via CORS (`FRONTEND_ORIGIN`, default `http://localhost:888`).

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit .env with MongoDB, JWT secret, etc.
npm install
npm run start:dev      # API at http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL if needed
npm install
npm run dev                  # App at http://localhost:888
```

### 3. Run both from repo root (optional)

From the project root you can run backend and frontend in one go:

```bash
npm install          # only once, installs concurrently
npm run dev          # runs backend + frontend together
```

Or use two terminals:

```bash
npm run dev:backend   # terminal 1
npm run dev:frontend  # terminal 2
```

Root `package.json` only has scripts that delegate to `backend/` and `frontend/`; dependencies live only inside those folders.

## Environment

| Folder     | Env file        | Purpose |
|-----------|------------------|---------|
| `backend/`  | `.env` (from `.env.example`) | MongoDB, JWT, PORT, FRONTEND_ORIGIN |
| `frontend/` | `.env.local` (from `.env.example`) | NEXT_PUBLIC_API_BASE_URL, optional API keys |

Keep backend config only in `backend/` and frontend config only in `frontend/`.
