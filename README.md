# Affiliate Boss — Monorepo

A lightweight npm workspace layout for the Affiliate Boss application. The repo has been reorganized into package-level workspaces for clearer separation between backend and frontend.

Quick start (PowerShell)


```powershell
# from repository root
npm install
npm run dev
```

What this does

- Starts the backend (Express + Prisma) on `http://localhost:3002`
- Starts the frontend (Vite) on `http://localhost:3000`

Run parts independently

```powershell
# Backend only
npm --workspace=@affiliateboss/backend run dev

# Frontend only
npm --workspace=@affiliateboss/frontend run dev
```

Prisma / database

Prisma schema and migrations live under `packages/backend/prisma`. Common DB commands:

```powershell
npm --workspace=@affiliateboss/backend run db:generate
npm --workspace=@affiliateboss/backend run db:migrate
npm --workspace=@affiliateboss/backend run db:seed
```

Environment

- Use root `.env` / `.env.local` for shared env variables.
- `packages/backend` expects `DATABASE_URL` and may use `API_PORT` (optional). Add provider keys for Twilio/OpenAI/Shopify as needed.

Repository layout (important parts)

- `packages/backend/` — Express API, `server/`, `api/`, `lib/`, `prisma/`, and DB scripts
- `packages/frontend/` — Vite app, `public/`, and `vite.config.js`
- `start.js` — convenience launcher that runs the workspace dev script
- `package.json` (root) — workspace root with workspace-aware scripts
