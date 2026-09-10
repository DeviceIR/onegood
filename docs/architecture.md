# HAFEZ Architecture

## Overview

HAFEZ (حافظ خوبی‌ها) is a Persian-first, RTL charity platform deployed on Iranian infrastructure. Guests donate without accounts; admins manage campaigns, ledger, media, and consents.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js App Router + TypeScript | One deployable unit, RSC caching for modest VPS |
| UI | Tailwind + shadcn/ui + Framer Motion (hero/impact only) | Owned primitives, RTL via logical properties |
| DB | PostgreSQL (ArvanCloud Managed) + Prisma | Typed schema, reviewable migrations, financial integrity |
| Auth | Auth.js v5 Credentials + Argon2id + TOTP (owner) | Admin-only (~10 accounts), no public signup |
| Storage | ArvanCloud S3 (`s3.ir-thr-at1.arvanstorage.ir`, path-style) | Iran-reachable object storage + CDN |
| Payments | `PaymentGateway` → ZarinPal / Mock | No client secrets; swap providers without app rewrites |
| Deploy | Docker Compose on Iranian VPS, Nginx + TLS | Stable domain for ZarinPal callbacks |

## Trust boundaries

- Public pages: Server Components + tagged cache; no secrets.
- Public writes: Zod-validated route handlers (`donations/intent`, contact, volunteer) with rate limits.
- Admin mutations: Server Actions behind `requireAdmin(role)` + origin check + `AuditLog`.
- Payments: only `src/server/payments/` talks to gateways; verify amount from DB, never from callback.
- Ledger / Audit: application DB role is `INSERT` + `SELECT` only.

## Caching

- Campaign and homepage data use `revalidateTag` on publish.
- Money aggregates are cached on `Campaign` and reconciled nightly from `LedgerEntry`.

## Environments

- `development`: MockGateway, local Postgres (Docker), local file or MinIO-compatible storage.
- `production`: ZarinPal, ArvanCloud Postgres + Object Storage + CDN, cron via host or container.

See also: [database.md](./database.md), [payments-zarinpal.md](./payments-zarinpal.md), [deployment.md](./deployment.md).
