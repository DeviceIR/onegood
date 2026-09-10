# Phase 1 foundation checklist

- [x] Next.js App Router + TypeScript (`src/app`)
- [x] Tailwind CSS v4 + RTL (`lang=fa` `dir=rtl`)
- [x] Vazirmatn self-hosted in `public/fonts`
- [x] shadcn-style UI primitives under `src/components/ui`
- [x] Prisma schema + client generate
- [x] Docker Compose Postgres + Dockerfile
- [x] Zod env schema (`src/server/env.ts`)
- [x] CI workflow (`.github/workflows/ci.yml`)
- [x] `npm run typecheck` / `lint` / `test` scripts

Local verify:

```bash
docker compose up -d postgres
npx prisma db push
npm run db:seed
npm run typecheck && npm run lint && npm test
npm run dev
```

Open http://localhost:3000 — Persian RTL shell should render.
