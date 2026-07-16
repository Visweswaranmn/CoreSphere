# CoreSphere ERP

A production-grade, modular **Enterprise Resource Planning** platform covering HR,
Payroll, Projects, Procurement, Inventory, CRM, Sales, Finance, Documents, and more —
built with a modern, fully type-safe full-stack architecture.

## Highlights

- **13 modules** spanning the full business lifecycle, each independently scoped
- **Role-based access control** across eight roles, enforced on the server and reflected in the UI
- **JWT auth** with short-lived access tokens + rotating refresh cookies and session invalidation
- **Live executive dashboard** aggregating real data across every module
- **Report exports** to CSV, Excel, and PDF
- **Approval workflows** for purchase orders, expenses, and leave
- Type-safe end to end via a shared contracts package — no `any` at module boundaries
- Every list is paginated, searchable, and filterable; every mutation is validated with Zod

## Tech Stack

| Layer        | Technologies                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, TanStack Query, React Hook Form, Zod, Framer Motion, Recharts, Lucide |
| **Backend**  | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Zod, Multer, ExcelJS, PDFKit, Pino, Helmet, rate limiting |
| **Tooling**  | npm workspaces, ESLint 9 (flat config), Prettier, tsx, tsup, Docker (optional)     |

## Modules

| Module | Route | Access |
| ------ | ----- | ------ |
| Executive Dashboard | `/` | All |
| Employees, Attendance, Leave | `/hr/*` | HR Manager |
| Payroll | `/hr/payroll` | HR + Finance Manager |
| Projects (Kanban) | `/projects` | Project Manager |
| Procurement & Vendors | `/procurement`, `/vendors` | Procurement Manager |
| Inventory & Assets | `/inventory`, `/assets` | Inventory Manager |
| CRM & Sales Pipeline | `/crm`, `/sales` | Sales Manager |
| Finance (expenses, budgets) | `/finance` | Finance Manager |
| Documents | `/documents` | All |
| Notifications | `/notifications` | All |
| Analytics & Reports | `/analytics`, `/reports` | All |
| System Settings | `/settings` | Super Admin |

Super Admin has access to every module.

## Repository Structure

```
coresphere-erp/
├── packages/shared/         # Types & contracts shared by web + server
│   └── src/{domain,types,rbac}/
├── server/                  # Express API
│   └── src/
│       ├── config/          # env, database, logger, upload, rate limiting
│       ├── middleware/      # auth, validation, centralized error handling
│       ├── modules/         # feature modules (model/repo/service/controller/routes)
│       ├── routes/          # API router composition
│       └── utils/           # ApiError, pagination, sequence, dates
├── web/                     # React SPA
│   └── src/
│       ├── components/      # design system (ui/) + layout
│       ├── features/        # feature-based UI + data hooks
│       ├── lib/             # api client, query client, formatting
│       ├── providers/       # theme, auth, toast
│       └── routes/          # route guards
├── docker-compose.yml       # optional local MongoDB + mongo-express
├── DEPLOYMENT.md            # deployment guide
└── README.md
```

Each server module follows the same layering: **model → repository → service → controller → routes**.

## Prerequisites

- **Node.js ≥ 20** (see `.nvmrc`)
- **MongoDB** — a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended) or a local instance.

## Getting Started

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure the backend environment
cp server/.env.example server/.env
#    edit server/.env — set MONGODB_URI and strong JWT secrets

# 3. (optional) configure the web environment
cp web/.env.example web/.env

# 4. Seed the initial Super Admin + demo users
npm run seed -w server

# 5. Run both apps (API on :4000, web on :5173)
npm run dev
```

Open http://localhost:5173 and sign in with the seeded Super Admin
(`admin@gmail.com` / `12345678`). Override these with `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` — and use a strong password in production.

### Optional: local database via Docker

```bash
docker compose up -d          # MongoDB on :27017, mongo-express UI on :8081
# then set in server/.env:
# MONGODB_URI=mongodb://coresphere:coresphere@localhost:27017/coresphere_erp?authSource=admin
```

## Available Scripts (repo root)

| Script              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Run server + web concurrently                        |
| `npm run build`     | Type-check and build server and web for production   |
| `npm run typecheck` | Type-check all workspaces                            |
| `npm run lint`      | Lint the entire repo (ESLint flat config)            |
| `npm run format`    | Format with Prettier                                 |
| `npm run seed -w server` | Seed the initial users                          |

## Roles

`Super Admin` · `HR Manager` · `Finance Manager` · `Procurement Manager` ·
`Inventory Manager` · `Sales Manager` · `Project Manager` · `Employee`.

Routes are guarded on the server with `authorize(...roles)` (Super Admin bypasses) and
mirrored in the UI with role-aware navigation and route guards.

## API Overview

Base URL: `/api/v1`. Every response uses a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }
// failure
{ "success": false, "code": "VALIDATION_ERROR", "message": "…", "errors": [ /* ... */ ] }
```

Lists are paginated: `{ items: [...], meta: { page, pageSize, total, totalPages } }`.

| Area | Representative endpoints |
| ---- | ------------------------ |
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| HR | `GET/POST /hr/employees`, `POST /hr/attendance`, `POST /hr/leave/:id/decision` |
| Payroll | `POST /hr/payroll/runs`, `POST /hr/payroll/runs/:id/process` |
| Projects | `GET/POST /projects`, `POST /projects/:projectId/tasks` |
| Procurement | `POST /procurement/vendors/:id/status`, `POST /procurement/orders/:id/decision` |
| Inventory | `POST /inventory/items/:id/movements`, `POST /inventory/assets/:id/assign` |
| CRM / Sales | `GET/POST /crm/customers`, `PATCH /sales/deals/:id/stage` |
| Finance | `POST /finance/expenses/:id/decision`, `GET /finance/budgets` |
| Documents | `POST /documents` (multipart), `GET /documents/:id/download` |
| Notifications | `GET /notifications`, `POST /notifications/broadcast` |
| Analytics | `GET /analytics/overview` |
| Reports | `GET /reports/:type/export?format=csv\|xlsx\|pdf` |
| Settings | `GET/PUT /settings`, `GET/POST /users`, `PATCH /users/:id` |

## Security

- Passwords hashed with bcrypt (12 rounds); strong-password policy on creation
- JWT access tokens (in-memory on the client) + httpOnly, rotating refresh cookies
- `tokenVersion` invalidates sessions on logout, role change, or account disable
- Helmet security headers, CORS allow-list, request rate limiting (strict on auth)
- Zod validation on every request body, query, and route param
- Centralized error handling; production hides internal error details

## Environment Variables

### `server/.env`

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `NODE_ENV` | no | `development` | Runtime environment |
| `PORT` | no | `4000` | API port |
| `MONGODB_URI` | **yes** | — | MongoDB connection string |
| `CORS_ORIGINS` | no | `http://localhost:5173` | Comma-separated allowed origins |
| `JWT_ACCESS_SECRET` | **yes (prod)** | dev placeholder | Access-token secret |
| `JWT_REFRESH_SECRET` | **yes (prod)** | dev placeholder | Refresh-token secret |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | no | `7d` | Refresh-token lifetime |

### `web/.env`

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `VITE_API_BASE_URL` | no | `/api/v1` | Base path/URL for API requests |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for a production deployment guide.

## License

Proprietary — all rights reserved.
