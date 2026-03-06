# Architecture

## Overview
This document describes the architectural decisions and layout of the AnyDo monorepo.

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                                                         │
│              ┌───────────────────────┐                  │
│              │   Next.js Frontend    │                  │
│              │     (apps/web)        │                  │
│              └───────────┬───────────┘                  │
└──────────────────────────┼──────────────────────────────┘
                           │  HTTP / REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                        SERVER                           │
│                                                         │
│              ┌───────────────────────┐                  │
│              │    NestJS Backend     │                  │
│              │     (apps/api)        │                  │
│              └──┬────────────────┬───┘                  │
│                 │                │                       │
│                 ▼                ▼                       │
│  ┌──────────────────┐  ┌────────────────────┐          │
│  │     MongoDB      │  │    AI Service      │          │
│  │   (Database)     │  │  (Gemini / OpenAI) │          │
│  └──────────────────┘  └────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

```
  User ──▶ Next.js (SSR/CSR) ──▶ NestJS API ──┬──▶ MongoDB (CRUD)
                                               │
                                               └──▶ AI Service (Chat/Prompts)
                                                        │
                                               ◀────────┘
                                          AI Response
```

## Monorepo Setup (Turborepo)
The repository leverages Turborepo to efficiently manage multiple applications and shared packages.

```
any_Do-1/
├── apps/
│   ├── api/           → NestJS backend service
│   └── web/           → Next.js frontend application
├── packages/
│   ├── types/         → Shared TypeScript interfaces & DTOs
│   ├── ui/            → Shared UI components & design system
│   └── utils/         → Shared utility functions & constants
├── docs/              → Project documentation
├── turbo.json         → Turborepo pipeline config
└── package.json       → Root workspace config
```

### Apps
- **api**: NestJS backend service — handles auth, database, and AI integrations.
- **web**: Next.js frontend application — SSR/CSR dashboard with Google OAuth.

### Packages
- **@anydo/ui**: Shared UI components and design system (React).
- **@anydo/types**: Shared TypeScript interfaces and DTOs.
- **@anydo/utils**: Shared utility functions and constants.

### Package Dependency Graph

```
  apps/web ────────┬──▶ @anydo/ui
                   ├──▶ @anydo/types
                   └──▶ @anydo/utils

  apps/api ────────┬──▶ @anydo/types
                   └──▶ @anydo/utils
```
