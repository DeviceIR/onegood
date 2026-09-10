# Phase 9 — SEO & accessibility

## Delivered

- Persian metadata helper (`buildPageMetadata`) with canonical, OpenGraph (`fa_IR`), Twitter
- Expanded `sitemap.xml` (campaigns, donate, transparency per campaign)
- `robots.txt` disallows admin/api/callback
- JSON-LD: `NGO` Organization, `WebSite`, `DonateAction` on campaign/donate
- Skip link → `#main-content`
- Donation form: labeled fields, preset `aria-pressed`, live status, alerts
- Focus rings on nav/CTA; muted color contrast ≥ 4.5:1

## Acceptance

```bash
npm test
npm run typecheck
```

Keyboard donation path:

1. Tab → «پرش به محتوای اصلی»
2. Open `/donate/lavazem-tahrir`
3. Tab through presets / amount / privacy / «ادامه و پرداخت»

## Contrast

| Pair | Target |
| --- | --- |
| `#1f1d1a` on `#faf7f2` | ≥ 4.5 |
| `#5a5550` on `#faf7f2` | ≥ 4.5 |
| `#faf7f2` on `#0e7c66` | ≥ 4.5 |
