# ZarinPal Integration

## Abstraction

```ts
interface PaymentGateway {
  createPayment(input): Promise<CreatePaymentResult>;
  verifyPayment(input): Promise<VerifyPaymentResult>;
  refundPayment(input): Promise<RefundPaymentResult>;
}
```

Implementations: `ZarinPalGateway`, `MockGateway`. Credentials never leave the server.

## Documented flow (re-confirm at go-live)

1. **Request** — `POST /pg/v4/payment/request.json`  
   Body: `merchant_id`, `amount`, `currency` (`IRT`), `callback_url`, `description`, optional `metadata` (`mobile`, `email`, `auto_verify`).  
   Success: `data.code === 100`, `data.authority`.

2. **Redirect** — StartPay URL with `authority`.

3. **Callback** — Query `Authority`, `Status` (`OK` | `NOK`). Not signed; treat as hint only.

4. **Verify** — `POST /pg/v4/payment/verify.json` with `merchant_id`, `amount` (from DB), `authority`.  
   - Code `100`: verified  
   - Code `101`: already verified (treat as success)  
   Returns `ref_id`, masked `card_pan`, `card_hash`, fee fields.

## Idempotency

- One `Payment` per attempt; never reuse `authority`.
- Verify under row lock; double callback / refresh / cron cannot double-count.
- Reconciliation cron re-verifies stale PENDING and expires past gateway window.

## Must verify from official docs / panel before Phase 11

- [ ] Canonical API host (`payment.zarinpal.com` vs `api.zarinpal.com`)
- [ ] Full error code table
- [ ] Sandbox / test terminal availability for our account type
- [ ] Unverified-transactions listing for reconciliation
- [ ] Terminal `auto_verify` setting
- [ ] Whether refunds are payment API, GraphQL, or panel-only
- [ ] Merchant category / charity licensing requirements
- [ ] Domain registration for callback URL
- [ ] Bank account ownership (organization, not personal)

If refunds are not programmatic: `refundPayment` throws `NotSupportedError`; record manual `REFUND` ledger entries with audit trail.

Official refs: https://www.zarinpal.com/docs/ and https://next.zarinpal.com/paymentGateway/guide/
