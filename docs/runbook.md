# Operations runbook — ONE GOOD

Detailed first deploy: [`phase-10-deploy.md`](./phase-10-deploy.md).

## Deploy

1. Provision Iranian VPS + TLS domain (`.ir` preferred for ZarinPal).
2. Create ArvanCloud Managed Postgres; allowlist VPS IP.
3. Create public/private Object Storage buckets + CDN.
4. Copy `.env.example` → production `.env`; set secrets (`AUTH_URL=https://…`).
5. `docker compose -f docker-compose.prod.yml up -d --build`
6. `docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy` (seed owner only on fresh envs).
7. Apply append-only grants: `psql "$DATABASE_URL" -f docker/harden-grants.sql`
8. Point app `DATABASE_URL` at the `hafez_app` role (INSERT/SELECT on ledger & audit).
9. Install Nginx from `deploy/nginx.conf`; obtain Let's Encrypt cert; reload.
10. Confirm `https://DOMAIN/api/health` → `status: ok`.

Dev shortcut (local Postgres): `docker compose up -d` then `npm run dev`.

## Health

```bash
curl -fsS https://DOMAIN/api/health
# {"status":"ok","service":"one-good","db":"ok",...}
```

External probe:

```bash
DOMAIN=https://DOMAIN bash deploy/uptime-check.sh
```

## Backups

```bash
npm run backup
# → backups/hafez-<timestamp>.dump

# production nightly (uploads if BACKUP_S3_URI set)
bash deploy/nightly-backup.sh
```

### Restore drill (quarterly)

```bash
npm run backup:drill
```

Expects `pg_dump`, `pg_restore`, and `psql` on PATH. Creates `hafez_drill`, restores, compares `LedgerEntry` count and signed balance, then drops the drill DB.

Manual restore to staging:

```bash
pg_restore -d hafez_staging --clean --if-exists backups/hafez-YYYY-MM-DD.dump
npm run typecheck
# spot-check /transparency balances vs admin ledger
```

## Cron

Compose prod sidecar hits reconcile every 15 minutes. Host crontab alternative:

```cron
*/15 * * * * curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://DOMAIN/api/cron/reconcile
0 2 * * * cd /opt/one-good && set -a && . ./.env && set +a && bash deploy/nightly-backup.sh
```

## Incident: double donation

Payments are unique on `gatewayAuthority` / `gatewayRefId`; donation unique on `paymentId`. If UI looks wrong, reconcile aggregates via cron; never UPDATE ledger rows — post reversing entry.

## Incident: rate limit flood

429 on `/api/donations/intent`, contact, volunteer. Login attempts throttled per IP and email in Auth.js authorize. Check `RateLimitBucket` if false positives.

## Incident: health degraded

`/api/health` returns 503 with `db: error` → check Postgres allowlist, connection string, disk, and container logs (`docker compose -f docker-compose.prod.yml logs app`).

## Launch gate

Public fundraising requires legal checklist (`docs/legal-checklist.md`) and Phase 11 ZarinPal activation (`docs/phase-11-activation.md`).
