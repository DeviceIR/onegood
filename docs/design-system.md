# Design System — HAFEZ

## Brand

- Wordmark: **HAFEZ** / حافظ خوبی‌ها  
- Tagline: Keeping Goodness Alive.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `--background` | `#FAF7F2` | Warm cream page |
| `--foreground` | `#1F1D1A` | Charcoal text |
| `--accent` | `#0E7C66` | Emerald CTAs / progress |
| `--gold` | `#B08A3E` | Milestones only |
| `--card` | `#FFFFFF` | Surfaces sparingly |

No multi-stop purple gradients. No dark-mode default.

## Typography

- **Vazirmatn** self-hosted `woff2` via `next/font/local` (no Google Fonts CDN).
- `lang="fa"` `dir="rtl"` on `<html>`.
- Logical Tailwind: `ps-*`, `pe-*`, `ms-*`, `me-*`.

## Motion budget

1. Hero message crossfade (+ slight translateY / blur)
2. Impact card tilt / depth
3. Progress bar fill / entrance fades

Respect `prefers-reduced-motion`. Hero interval: `HERO_MESSAGE_INTERVAL` (3 minutes). Messages are frozen brand copy — never paraphrase.

## Layout principles

- One composition in the first viewport: brand, rotating message, short support, two CTAs.
- Cards only where interaction needs a container.
- Persian digits in display layer; normalize inputs.
