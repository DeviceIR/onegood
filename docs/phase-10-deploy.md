# Phase 10 — Production deploy (ONE GOOD)

**Status:** artifacts ready. Live HTTPS requires your VPS + domain (cannot be verified from this repo alone).

Public brand in UI may still show transitional naming until the [rebrand plan](./rebrand-one-good-plan.md) is approved; **deploy configs** use ONE GOOD / `one-good` naming where user-facing.

## Acceptance checklist

| Item | In repo | On your VPS |
| --- | --- | --- |
| Standalone Docker image | `Dockerfile` | build & run |
| Prod compose (app + reconcile sidecar) | `docker-compose.prod.yml` | `up -d --build` |
| Nginx + TLS template | `deploy/nginx.conf` | certbot + reload |
| Health endpoint | `GET /api/health` | uptime monitor |
| Nightly backup script | `deploy/nightly-backup.sh` | cron 02:00 |
| Uptime probe script | `deploy/uptime-check.sh` | second host / cron |
| Managed Postgres | docs | Arvan (or equiv.) |
| Object storage + CDN | env | Arvan S3 |
| Analytics | docs below | Umami/Matomo optional |
| Logging | compose json-file | optional GlitchTip |

## Topology

```
Internet → Nginx (443 TLS) → 127.0.0.1:3000 (Next.js standalone)
                ↓
         Managed PostgreSQL (firewall allowlist VPS IP)
                ↓
         Arvan Object Storage (public CDN + private backups/receipts)
```

Do **not** expose Postgres or the app port publicly. Only Nginx listens on 80/443.

## Step-by-step

### 1. Provision

1. Iranian VPS (2 vCPU / 4 GB RAM minimum recommended).
2. Domain (`.ir` preferred for ZarinPal) → A record to VPS.
3. Arvan Managed Postgres; allowlist VPS IP only.
4. Public + private buckets; CDN base URL for public media.

### 2. Secrets (`.env`)

Copy `.env.example` → `.env` on the VPS. Production minimums:

```env
NODE_ENV=production
DATABASE_URL=postgresql://hafez_app:STRONG@HOST:5432/hafez?schema=public&sslmode=require
AUTH_SECRET=<openssl rand -base64 48>
AUTH_URL=https://one-good.example.ir
PAYMENT_GATEWAY=mock
CRON_SECRET=<openssl rand -hex 32>
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_BUCKET=...
S3_PRIVATE_BUCKET=...
CDN_BASE_URL=https://cdn.example.ir
BACKUP_S3_URI=s3://hafez-private/backups/
```

Keep `PAYMENT_GATEWAY=mock` until Phase 11 (legal + real ZarinPal).

Technical DB role/user names (`hafez`, `hafez_app`) stay as-is unless you plan a controlled migration — see rebrand plan.

### 3. First deploy

```bash
cd /opt/one-good   # or /opt/hafez if you keep the path
git pull
cp .env.example .env   # edit secrets
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
# optional first-time only:
# docker compose -f docker-compose.prod.yml exec app npm run db:seed
psql "$DATABASE_URL_ADMIN" -f docker/harden-grants.sql
```

Then switch app `DATABASE_URL` to the locked-down `hafez_app` role and recreate the app container.

### 4. Nginx + TLS

1. Install Nginx + certbot.
2. Adapt `deploy/nginx.conf` (`server_name`, certificate paths).
3. Obtain cert: `certbot certonly --webroot -w /var/www/certbot -d one-good.example.ir`
4. `nginx -t && systemctl reload nginx`

### 5. Health & monitoring

- App: `https://DOMAIN/api/health` → `{ "status": "ok", "db": "ok", ... }`
- Compose healthcheck probes the same URL inside the container.
- From another host: `DOMAIN=https://DOMAIN ./deploy/uptime-check.sh`
- Wire UptimeRobot / Better Stack / Iranian equivalent to `/api/health` every 1–5 minutes.

### 6. Cron & backups

Compose includes a `cron` sidecar that POSTs `/api/cron/reconcile` every 15 minutes.

Host crontab for backups:

```cron
0 2 * * * cd /opt/one-good && set -a && . ./.env && set +a && bash deploy/nightly-backup.sh >> /var/log/one-good-backup.log 2>&1
```

Quarterly: `npm run backup:drill` (see [runbook](./runbook.md)).

### 7. Analytics (optional)

Self-host Umami or Matomo on the VPS (or a second container). Prefer privacy-friendly, no third-party ad trackers. Uncomment the `/analytics/` block in `deploy/nginx.conf` if you reverse-proxy Umami.

Do not put GA4 or foreign SaaS analytics if Iranian accessibility / privacy policy forbids it.

### 8. Logging

- Docker `json-file` rotation is set in `docker-compose.prod.yml`.
- Optional: GlitchTip / Sentry-compatible self-host for error tracking (no PII in client breadcrumbs).

## Verify before calling Phase 10 “live”

1. `curl -fsS https://DOMAIN/api/health` → 200, `db: ok`
2. Homepage + `/donation/callback` over HTTPS
3. Admin login works
4. Mock donation intent → callback → ledger row
5. Nightly backup dump appears in private storage
6. Uptime alert fires on deliberate stop (then restore)

## Out of scope (Phase 11)

- Real ZarinPal merchant + sandbox off
- Callback URL registration on merchant panel
- Small real-money E2E
- Legal checklist sign-off

See [phase-11-activation.md](./phase-11-activation.md) and [legal-checklist.md](./legal-checklist.md).
