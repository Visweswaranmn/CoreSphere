# Deployment Guide

This guide covers deploying CoreSphere ERP to production. The app is a monorepo with
two deployable artifacts: the **API** (`server/`) and the **web SPA** (`web/`).

## 1. Prerequisites

- Node.js ≥ 20 on the API host (or a container runtime)
- A production MongoDB (MongoDB Atlas recommended)
- A static host or CDN for the web build (Netlify, Vercel, S3+CloudFront, Nginx, …)

## 2. Prepare the database

Create a MongoDB Atlas cluster (or provision managed MongoDB):

1. Create a database user and password.
2. Allow-list your API host's IP (or `0.0.0.0/0` behind a private network).
3. Copy the SRV connection string into `MONGODB_URI`.

## 3. Configure environment

Generate strong JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Set the following on the **API** host (never commit these):

```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/coresphere_erp
CORS_ORIGINS=https://app.your-domain.com
JWT_ACCESS_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_DAYS=7
```

> In production the server refuses to start unless the JWT secrets are strong
> (≥ 32 chars) and not the dev placeholder.

For the **web** build, set `VITE_API_BASE_URL` to the public API URL, e.g.
`https://api.your-domain.com/api/v1`.

## 4. Build

From the repo root:

```bash
npm ci
npm run build          # builds server (dist/) and web (dist/)
```

- `server/dist/server.js` — the bundled API entry point
- `web/dist/` — static assets to serve

## 5. Run the API

```bash
cd server
NODE_ENV=production node dist/server.js
```

Run it under a process manager (pm2, systemd) or in a container. Behind a reverse
proxy, ensure `X-Forwarded-*` headers are passed (the app sets `trust proxy`). Persist
the `server/uploads/` directory (or swap disk storage for object storage) so uploaded
documents survive restarts.

### Docker (API)

A minimal production image:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY server ./server
RUN npm ci && npm run build -w server
WORKDIR /app/server
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

Mount a volume at `/app/server/uploads` for document persistence.

## 6. Serve the web build

Upload `web/dist/` to your static host. Because the app uses client-side routing,
configure a SPA fallback so unknown paths serve `index.html`:

- **Netlify:** add `/* /index.html 200` to `_redirects`
- **Nginx:** `try_files $uri /index.html;`

Point the web host's API base URL at the deployed API (via `VITE_API_BASE_URL` at
build time, or a proxy rule). Ensure the API's `CORS_ORIGINS` includes the web origin,
and that both are served over HTTPS so the `secure` refresh cookie is honored.

## 7. Seed the first admin

Run once against the production database to create the initial Super Admin:

```bash
SEED_ADMIN_EMAIL=admin@your-domain.com SEED_ADMIN_PASSWORD='<strong-password>' \
  npm run seed -w server
```

Then sign in and use **Settings → Users** to provision the rest of your team.

## 8. Post-deploy checks

- `GET /api/v1/health` returns `200` with `"database": "connected"`
- Login works and the refresh cookie is set (`Secure`, `HttpOnly`, `SameSite`)
- A report export downloads successfully
- Rate-limit headers (`RateLimit-*`) are present on API responses
