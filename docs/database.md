# Database Schema

Money rule: every amount is `BigInt` named `amountToman`. No floats. Payment currency gateway-facing value is `IRT`.

## Enums (summary)

- PaymentStatus: PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED, EXPIRED
- LedgerType: DONATION, EXPENSE, REFUND, TRANSFER, OTHER
- LedgerDirection: IN, OUT
- CampaignStatus: DRAFT, PUBLISHED, COMPLETED, ARCHIVED
- AdminRole: OWNER, ADMIN, CAMPAIGN_MANAGER, VIEWER
- ConsentScope: PHOTO, VIDEO, STORY, NAME
- ExpenseCategory: SUPPLIES, TRANSPORT, CLOTHING, FOOD, GATEWAY_FEE, OTHER

## Core models

### Payment
Unique: `idempotencyKey`, `gatewayAuthority`, `gatewayRefId`. Indexes: `(status, requestedAt)`, `gatewayAuthority`.

### Donation
Created only after server-side verify. Unique: `paymentId`, `referenceCode`. Privacy: `showName` / `showAmount` default false.

### LedgerEntry (append-only)
Corrections = reversing entries via `reversesEntryId`. Never UPDATE financial history.

### Campaign
Slug unique; cached `collectedAmountToman`, `donorCount`. Needs, updates, cover media.

### Beneficiary
`internalCode`, `pseudonymFa`, coarse region only. No full name / address / school columns.

### Consent
Scopes array; evidence media always private. Publish gate requires active consent for minor media.

### Admin / Session / AuditLog
Roles as above. AuditLog insert-only. TOTP secret encrypted for OWNER.

Full Prisma schema: `prisma/schema.prisma`.
