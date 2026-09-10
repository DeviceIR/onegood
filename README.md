# ONE GOOD / حافظ خوبی‌ها

Persian-first charity platform: campaigns, guest donations (ZarinPal abstraction), append-only transparency ledger, consent-gated media, admin panel.

Brand: **ONE GOOD** · **یک خوبی** · **حافظ خوبی‌ها**

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin/login — `owner@hafez.local` / `ChangeMeOwner!234`
- Health: http://localhost:3000/api/health

## Production

See [`docs/phase-10-deploy.md`](./docs/phase-10-deploy.md) and [`docs/cpanel-deploy.md`](./docs/cpanel-deploy.md).

Prefer Iranian **VPS** for Next.js + Postgres. Shared cPanel alone is usually not enough unless Node.js + PostgreSQL are enabled.

```bash
npm run db:seed   # real Persian campaigns + prices for ZarinPal review
docker compose -f docker-compose.prod.yml up -d --build
```

## Docs

See [`docs/`](./docs/) for architecture, schema, ZarinPal checklist, legal, privacy, design, deployment, and runbook.

## Scripts

- `npm run typecheck` / `lint` / `test` / `build`
- Cron reconcile: `POST /api/cron/reconcile` with header `x-cron-secret`
- `npm run backup` / `backup:drill` / `audit:deps`

## Fonts

Place Vazirmatn woff2 files in `public/fonts/` (see `public/fonts/README.md`).
