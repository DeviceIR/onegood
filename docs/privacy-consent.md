# Privacy & Child-Safety Model

## Donors

- `showName` and `showAmount` default **false**.
- Single server serializer (`donation-serializer`) enforces public display: hidden name → «یک خیر»; hidden amount → «مبلغ نامشخص».
- Phone / email never public; optional for receipt only (encrypted / hashed as designed).

## Beneficiaries

- Public: `pseudonymFa`, `internalCode`, coarse region, age range / grade — never full name, address, or school name in schema.
- Stories describe the need with dignity; no exploitative imagery.

## Media of minors

- Publish rejected unless active `Consent` covers required scope(s), `revokedAt` null, `expiresAt` not passed.
- Revoking consent unpublishes media.
- Consent evidence files stay in private bucket (signed URLs for admins only).

## Receipts

- Original uploads private; only admin-reviewed redacted copies may be public.

## Retention

- Document retention windows in `SiteSetting` / ops runbook.
- Deletion requests: donor contact purge + anonymize donation display fields where legally required; financial ledger rows retained as audit trail with PII stripped where possible.
