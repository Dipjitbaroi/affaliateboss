@affiliateboss/backend

This package contains the backend (Express + Prisma).

Useful scripts (run from repo root):

```powershell
# Run backend only
npm --workspace=@affiliateboss/backend run dev

# Generate Prisma client
npm --workspace=@affiliateboss/backend run db:generate

# Run migrations
npm --workspace=@affiliateboss/backend run db:migrate

# Seed DB
npm --workspace=@affiliateboss/backend run db:seed
```

Notes
- Prisma schema is under `prisma/schema.prisma`.
- Local dev port: 3002 (API_PORT environment variable may override)
