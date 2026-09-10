# Phase 2 — Public shell & homepage

## Delivered

- Sticky header + mobile menu
- Hero: HAFEZ / حافظ خوبی‌ها, rotating verbatim brand messages, dual CTAs
- Zero layout-shift reserved height for hero messages; `prefers-reduced-motion`
- `HERO_MESSAGE_INTERVAL` single constant (3 minutes)
- Impact card with subtle 3D tilt + animated counters
- Homepage sections in plan order: campaigns → impact gallery → activity → videos → testimonials → transparency → closing CTA
- Empty-state friendly copy when media/gallery empty

## Verify locally

```bash
npm run db:seed
npm run dev
```

Open http://localhost:3000

Optional Lighthouse (Chrome required):

```bash
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility --form-factor=mobile --quiet
```

Target: performance & accessibility ≥ 90.
