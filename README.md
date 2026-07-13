# CoreSphere ERP

A production-grade, modular **Enterprise Resource Planning** platform — HR, Finance,
Procurement, Inventory, CRM, Sales, Projects, and more — built with a modern, type-safe
full-stack architecture.

> Built phase by phase. This repository is currently at **Phase 1 — Foundation**.

## Tech Stack

| Layer        | Technologies                                                                     |
| ------------ | -------------------------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Zod   |
| **Backend**  | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Zod, Pino                       |
| **Tooling**  | npm workspaces, ESLint 9 (flat config), Prettier, Docker (optional), tsx, tsup   |

## Repository Structure

```
coresphere-erp/
├── packages/
│   └── shared/          # Types & contracts shared by web + server
├── server/              # Express API (feature-based modules, MVC + service layer)
│   └── src/
│       ├── config/      # env, database, logger, constants
│       ├── middleware/  # centralized error handling, 404
│       ├── modules/     # feature modules (health, and more per phase)
│       ├── routes/      # API router composition
│       └── utils/       # ApiError, asyncHandler, response helpers
├── web/                 # React SPA
│   └── src/
│       ├── components/  # reusable UI
│       ├── features/    # feature-based UI + data hooks
│       ├── lib/         # api client, query client
│       └── providers/   # app-wide context (theme, ...)
├── docker-compose.yml   # optional local MongoDB + mongo-express
└── README.md
```

## Prerequisites

- **Node.js ≥ 20** (see `.nvmrc`)
- **MongoDB** — a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended)
  or a local instance (see [Local database](#optional-local-database-via-docker)).

## Getting Started

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure the backend environment
cp server/.env.example server/.env
#    then edit server/.env and set MONGODB_URI to your Atlas connection string

# 3. (optional) Configure the web environment
cp web/.env.example web/.env

# 4. Run both apps (API on :4000, web on :5173)
npm run dev
```

Open http://localhost:5173 — the landing page verifies the API and database connection live.

### Optional: local database via Docker

```bash
docker compose up -d          # MongoDB on :27017, mongo-express UI on :8081
# then set in server/.env:
# MONGODB_URI=mongodb://coresphere:coresphere@localhost:27017/coresphere_erp?authSource=admin
```

## Available Scripts (run from repo root)

| Script                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Run server + web concurrently                        |
| `npm run build`        | Type-check and build server and web for production   |
| `npm run typecheck`    | Type-check all workspaces                            |
| `npm run lint`         | Lint the entire repo (ESLint flat config)            |
| `npm run format`       | Format with Prettier                                 |

## Environment Variables

### `server/.env`

| Variable        | Required | Default                     | Description                          |
| --------------- | -------- | --------------------------- | ------------------------------------ |
| `NODE_ENV`      | no       | `development`               | Runtime environment                  |
| `PORT`          | no       | `4000`                      | API port                             |
| `MONGODB_URI`   | **yes**  | —                           | MongoDB connection string            |
| `CORS_ORIGINS`  | no       | `http://localhost:5173`     | Comma-separated allowed origins      |

### `web/.env`

| Variable            | Required | Default    | Description                     |
| ------------------- | -------- | ---------- | ------------------------------- |
| `VITE_API_BASE_URL` | no       | `/api/v1`  | Base path/URL for API requests  |

## API Overview

Base URL: `/api/v1`. All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }
// failure
{ "success": false, "code": "VALIDATION_ERROR", "message": "…", "errors": [ /* ... */ ] }
```

| Method | Endpoint      | Description                                  |
| ------ | ------------- | ------------------------------------------- |
| `GET`  | `/api/v1/health` | Liveness/readiness + database connectivity |

## Roadmap

Foundation → Auth & RBAC → Design System → HR → Payroll → Projects → Procurement →
Inventory & Assets → CRM & Sales → Finance → Documents & Notifications →
Reports & Analytics → Settings & Hardening.

## License

Proprietary — all rights reserved.
