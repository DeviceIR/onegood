# Phase 8 — Security hardening

## Delivered

- Postgres-backed rate limits on donation intent, contact, volunteer + admin login (email + IP)
- 429 responses include `Retry-After`
- Security headers: CSP, COOP, CORP, nosniff, frame options, HSTS (production)
- Upload magic-byte sniffing + fuzz tests (PDF/HTML/ZIP/EXE polyglots rejected)
- Append-only DB grants for `hafez_app` on `LedgerEntry` / `AuditLog` (`docker/harden-grants.sql`)
- Backup + restore drill scripts (`npm run backup`, `npm run backup:drill`)
- Dependency audit script (`npm run audit:deps`)

## Acceptance

```bash
npm test
npm run typecheck
npm run audit:deps
npm run backup:drill
```

Tests prove grants block `UPDATE` on ledger for `hafez_app`, and upload fuzz rejects forged MIME types.
Restore drill compares ledger row counts and signed balances after dump/restore.

## Dependency audit notes

`npm run audit:deps` allows documented upstream issues until major bumps:

- Next 15 nested `postcss` (fixed in Next 16)
- Prisma CLI `deepmerge-ts` (CLI-only path)

`sharp` is pinned ≥ 0.35.4.

## Ops

1. After `db push` / migrate: `psql "$DATABASE_URL" -f docker/harden-grants.sql`
2. Point production `DATABASE_URL` at `hafez_app` (not table owner)
3. Nightly: `npm run backup` → upload dump to private Object Storage
4. Quarterly: `npm run backup:drill` on staging
