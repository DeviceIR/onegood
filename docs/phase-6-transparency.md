# Phase 6 — Transparency

## Delivered

- Append-only `LedgerEntry` posting + **reverse-only** corrections (`reversesEntryId` unique)
- `getBalances` via SQL `groupBy` — public remaining = received − spent to the toman
- `getCollectedFromLedger` for campaign progress (DONATION IN − REFUND OUT)
- Expense publish → ledger OUT; receipt attach (public when expense published)
- Public `/transparency` and `/transparency/[campaign]` with balances, ledger, expenses + receipts
- Tagged cache (`transparency`) busted on donation / expense / reverse
- Cron `POST /api/cron/reconcile` also syncs campaign aggregates + writes `StatsSnapshot`

## Acceptance

```bash
npm test
npm run typecheck
```

Tests prove:

- Public balances equal ledger sum to the toman
- Correction is a reversing entry; original row unchanged; double-reverse rejected
- Aggregate reconcile repairs drifted `collectedAmountToman`

## Manual smoke

1. Admin → هزینه → پیش‌نویس → پیوست رسید → انتشار + ثبت دفترکل
2. Open `/transparency` — مانده و هزینه با دفترکل یکی است
3. Admin ledger → سند معکوس روی یک ردیف → مانده کم/زیاد می‌شود؛ ردیف اصلی دست‌نخورده
4. `curl -X POST -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/reconcile`
