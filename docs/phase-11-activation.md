# Phase 11 — Payment activation (blocked on legal)

## Prerequisites

- [ ] Legal checklist signed off (`docs/legal-checklist.md`)
- [ ] Organization bank account + ZarinPal merchant approved
- [ ] Production domain registered on ZarinPal terminal
- [ ] TLS live; callback `https://DOMAIN/donation/callback` reachable from Iran

## Steps

1. Set `PAYMENT_GATEWAY=zarinpal`, `ZARINPAL_MERCHANT_ID=…`, `ZARINPAL_SANDBOX=false`.
2. Re-confirm API hosts and error codes from official docs (`docs/payments-zarinpal.md`).
3. Small real-money test donation to a draft/internal campaign.
4. Confirm: Payment SUCCESS, Donation row, LedgerEntry IN, privacy flags respected, reference code on success page.
5. Confirm admin payments UI is read-only; audit log shows gateway/system events.
6. Only then announce public campaigns.

## Rollback

Set `PAYMENT_GATEWAY=mock` and disable public CTAs if gateway misbehaves; do not delete financial rows.
