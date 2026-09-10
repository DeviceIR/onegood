import type { Metadata } from "next";

/** Persian brand phrase — keep as primary FA identity. */
export const SITE_NAME_FA = "حافظ خوبی‌ها";
/** English primary brand. */
export const SITE_NAME_EN = "ONE GOOD";
/** Short Persian expression used in lockups and CTAs. */
export const SITE_EXPRESSION_FA = "یک خوبی";
export const SITE_TAGLINE_FA =
  "یک خوبی کوچک می‌تواند بزرگ‌تر شود — کمک شفاف برای حفظ و گسترش خوبی‌ها.";
export const SITE_TAGLINE_EN =
  "One small good thing can become something bigger.";
export const SITE_TITLE_DEFAULT = `${SITE_NAME_EN} — ${SITE_NAME_FA}`;

export function siteUrl(): string {
  return (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${p === "/" ? "" : p}` || siteUrl();
}

export function buildPageMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const description = input.description ?? SITE_TAGLINE_FA;
  const url = absoluteUrl(input.path ?? "/");
  const images = input.image
    ? [{ url: input.image, alt: input.title }]
    : undefined;

  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${input.title} | ${SITE_NAME_EN}`,
      description,
      url,
      siteName: SITE_TITLE_DEFAULT,
      locale: "fa_IR",
      type: "website",
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

/** Relative luminance helpers for contrast audit (WCAG). */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
