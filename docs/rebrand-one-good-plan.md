# ONE GOOD rebrand — implementation plan

**Status:** applied for user-facing branding (titles, chrome, CTAs, SEO, impact card). Infra names (`hafez` DB/package) unchanged.  
**Scope note:** `حافظ خوبی‌ها` stays as the Persian brand phrase. English primary brand becomes **ONE GOOD** (not HAFEZ). Persian expression **یک خوبی** appears in lockup/CTAs.

---

## 1. Files / components that need changes

| Area | Paths |
| --- | --- |
| Brand constants / SEO | `src/lib/seo.ts`, `src/app/layout.tsx`, `src/components/JsonLd.tsx` |
| Chrome | `src/components/SiteChrome.tsx` (header lockup, CTAs, footer) |
| Homepage | `src/app/(public)/page.tsx` — lockup, CTAs, “How ONE GOOD Works”, section copy |
| Hero | `src/features/home/hero/*` — already has correct messages + `HERO_MESSAGE_INTERVAL`; tweak aria/label only |
| Impact card | `src/features/home/impact-card/*` — label “ONE GOOD” |
| Donations | `src/features/donations/DonationForm.tsx`, `src/server/privacy/donation-serializer.ts` — «یک همراه» (not «یک خیر») |
| Campaigns | titles/display: optional `یک خوبی / …` prefix in UI, seed titles |
| Admin | `src/app/(admin)/admin/(dashboard)/layout.tsx` — «پنل ONE GOOD» |
| Auth TOTP issuer | `src/server/auth/totp.ts` → `ONE GOOD` |
| About / legal / contact copy | `(public)/about`, `privacy`, `terms`, layouts |
| Docs / design | `docs/design-system.md`, architecture, phase notes, README |
| Tests | serializer + seo + hero tests for new strings |

---

## 2. Reuse as-is

- `RotatingHeroMessage` + `HERO_MESSAGES` + `HERO_MESSAGE_INTERVAL` (already matches MESSAGE 01/02 and 3‑minute interval)
- ImpactCard3D, CampaignCard, DonationForm structure, transparency/ledger stack
- Auth, payments, Prisma schema, rate limits, CSP
- Vazirmatn + RTL/`lang="fa"`
- Color tokens already warm cream / charcoal / emerald / gold (align with ONE GOOD; minor token polish only)

---

## 3. Redesign (not full rewrite)

- Hero lockup: **ONE GOOD** → **یک خوبی** / **حافظ خوبی‌ها** hierarchy
- Primary CTA → **مشارکت در یک خوبی**; secondary → **مشاهده اثر کمک‌ها**
- Footer mission + nav labels per brief
- Optional subtle “one” motif (single accent mark) — sparse
- Homepage section: “How ONE GOOD Works” (CONTRIBUTION → ACTION → IMPACT)
- Campaign naming helper for display: `یک خوبی / {title}` where it strengthens brand

---

## 4. Brand / token changes

- `SITE_NAME_EN = "ONE GOOD"`; keep `SITE_NAME_FA = "حافظ خوبی‌ها"`
- Add `SITE_EXPRESSION_FA = "یک خوبی"`
- Tagline EN: philosophy short form, not “Keeping Goodness Alive.”
- Tokens: keep palette; verify contrast (already audited Phase 9)
- Optional: single-dot / single-line CSS motif in hero only

---

## 5. Typography

- Keep **Vazirmatn**; no new font dependency
- Ensure English “ONE GOOD” uses same stack with `dir="ltr"` on Latin spans where needed

---

## 6. Hero changes

- Replace HAFEZ wordmark with ONE GOOD lockup
- Keep rotating messages verbatim (already correct)
- CTAs: مشارکت در یک خوبی / مشاهده اثر کمک‌ها
- Remove “Keeping Goodness Alive.” as primary support line (or demote)

---

## 7. Animation changes

- Keep current crossfade + small `y` (already subtle)
- Soften/remove blur if it feels flashy
- No interval duplication — keep single `HERO_MESSAGE_INTERVAL`

---

## 8. SEO / metadata

- Titles: `ONE GOOD — حافظ خوبی‌ها`
- OG/Twitter/JSON-LD NGO + WebSite name updates
- Keywords: ONE GOOD, یک خوبی, حافظ خوبی‌ها
- Canonicals unchanged structurally

---

## 9. Accessibility

- Preserve skip link, focus rings, donation keyboard path
- `aria-label` on hero → ONE GOOD / حافظ خوبی‌ها
- Latin brand in LTR spans; don’t reverse Persian strings

---

## 10. Technical risks — do **not** rename blindly

| Keep (infra) | Why |
| --- | --- |
| Package name `hafez`, DB `hafez`, role `hafez_app` | Breaks Docker, grants, CI, backups |
| Emails `*@hafez.local` | Seed/dev only; optional later |
| S3 defaults `hafez-public` / `hafez-private` | Env already set in prod |
| Repo folder `keeperofthegoods` | Outside app; rename is git/remote risk |
| Table/model names | No brand coupling needed |

**User-facing** strings and display constants: change freely after approval.  
**Env vars / DB / Docker role names:** document migration path; change only with explicit ops approval.

---

## Suggested rollout (after approval)

1. Constants + SEO + serializer (“یک همراه”)
2. Header / footer / hero / CTAs
3. Homepage sections + about/legal
4. Campaign display naming + seed polish
5. Admin chrome + TOTP issuer
6. Docs/README design-system
7. Visual QA RTL + keyboard smoke

**No large rebrand edits until you approve this plan.**
