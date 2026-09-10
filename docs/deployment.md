# Deployment (Iranian VPS) — ONE GOOD

Full walkthrough: [`docs/phase-10-deploy.md`](./phase-10-deploy.md).

## Topology

- **Dev:** `docker-compose.yml` — local Postgres + app.
- **Prod:** `docker-compose.prod.yml` — app bound to `127.0.0.1:3000` + reconcile sidecar; managed Postgres outside.
- Object storage: ArvanCloud S3 path-style + CDN for public media; private bucket for receipts/consents/backups.
- Nginx reverse proxy with TLS (`deploy/nginx.conf`).
- Health: `GET /api/health` (DB ping; 503 if degraded).

## App config

- `output: "standalone"` in Next.js (`Dockerfile`).
- Env validated by Zod at boot (`src/server/env.ts`).
- No Vercel; stable Iranian domain required for ZarinPal (Phase 11).

## Backups

- `npm run backup` / `deploy/nightly-backup.sh` (optional `BACKUP_S3_URI`).
- Restore drill: `npm run backup:drill` — see [runbook](./runbook.md).

## Monitoring

- Uptime: `deploy/uptime-check.sh` or external monitor on `/api/health`, `/`, `/donation/callback`.
- Analytics: self-hosted Umami/Matomo only (optional Nginx `/analytics/` stub).
- Logs: Docker json-file rotation; optional GlitchTip.
