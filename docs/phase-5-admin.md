# Phase 5 — Admin dashboard

## Delivered

- Auth.js credentials login (Argon2) with role in session JWT
- Role hierarchy: `VIEWER` < `CAMPAIGN_MANAGER` < `ADMIN` < `OWNER`
- Role-gated sidebar (ledger/expenses/audit require `ADMIN+`)
- TOTP setup/confirm/disable for **OWNER** (secret AES-GCM encrypted with `AUTH_SECRET`)
- Admin user CRUD (OWNER): create, role change, activate/deactivate — all audited
- Change own password (audited)
- Same-origin check on mutating server actions
- Persian data tables for donations + payments (read-only) with filters
- Richer audit log (actor, action, entity, JSON snippet)
- Dashboard: stats + recent audit activity
- Ledger publish / reverse UI hidden unless `canPublishLedger`
- Every Phase 5 mutation writes `AuditLog`

## Acceptance

```bash
npm test
npm run typecheck
```

Tests prove:

- `CAMPAIGN_MANAGER` cannot publish ledger (`canPublishLedger` = false)
- Only `OWNER` manages admins
- TOTP encrypt/decrypt + code verification

## Manual smoke

1. `/admin/login` as `owner@hafez.local`
2. Settings → start TOTP → enter secret in authenticator → confirm
3. Create `CAMPAIGN_MANAGER` user; log in as them — no ledger publish button; expenses publish blocked server-side
4. Payments page: filter status — no edit controls
5. Mutate a campaign → appear in `/admin/audit`

## Seed accounts

| Email | Role | Password |
| --- | --- | --- |
| `owner@hafez.local` | OWNER | `ChangeMeOwner!234` |
| `manager@hafez.local` | CAMPAIGN_MANAGER | `ChangeMeManager!234` |
