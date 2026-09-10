# Phase 7 — Media system

## Delivered

- Image pipeline: sharp re-encode (EXIF strip), variants 400/800/1200, checksum, local or S3
- Video store with mime validation; public page uses `LazyVideo` (no autoplay, preload none)
- `depictsBeneficiary` on Media + consent gate on upload / visibility / impact attach
- Revoking consent unpublishes linked public media
- Admin: media, beneficiaries, consents, impact record + gallery link
- Public `/impact` gallery + `/impact/videos`

## Acceptance

```bash
npm test
npm run typecheck
```

Publishing media of a minor/beneficiary without active PHOTO/VIDEO consent throws `CONSENT_REQUIRED` (UI redirects with error; direct gate call fails in tests).

## Manual smoke

1. Admin → ذی‌نفعان → add S-002
2. رضایت‌ها → PHOTO consent for that beneficiary
3. رسانه → upload image with «ذی‌نفع» + PUBLIC **without** consent → error
4. Same with consent → succeeds; appears on `/impact` after گزارش اثر
5. Upload video PUBLIC → `/impact/videos` loads only after click (no autoplay sound)
