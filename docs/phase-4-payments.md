# Phase 4 — Donations & payments

## Delivered

- `PaymentGateway` interface + `MockGateway` + `ZarinPalGateway`
- Donation form: amount presets, privacy toggles (default off), optional name/message
- `POST /api/donations/intent` — rate limited, Zod validated, idempotency key
- `/donation/callback` — server-side verify; amount from DB only
- Success / failed / track pages
- `POST /api/cron/reconcile` with `x-cron-secret`
- Row lock (`FOR UPDATE`) + replay-safe commit
- Campaign cache bust after successful donation

## Acceptance tests

```bash
npm test
```

Includes:

- End-to-end mock donation → Donation + LedgerEntry
- Replay callback → still one donation
- Gateway amount mismatch rejected
- Idempotent intent
- NOK → CANCELLED, no donation

## Manual smoke (mock)

1. Ensure `PAYMENT_GATEWAY=mock` in `.env`
2. Open `/donate/lavazem-tahrir`
3. Donate ≥ ۱۰٬۰۰۰ تومان
4. Mock redirects to callback → success page with `HFZ-…` reference
5. Refresh callback URL → still one donation in admin
