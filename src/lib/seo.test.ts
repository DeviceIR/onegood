import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildPageMetadata,
  contrastRatio,
  siteUrl,
} from "./seo";

describe("seo helpers", () => {
  it("builds Persian metadata with canonical and OpenGraph", () => {
    process.env.AUTH_URL = "https://hafez.example.ir";
    const m = buildPageMetadata({
      title: "کمک‌ها",
      description: "فهرست کمپین",
      path: "/campaigns",
    });
    expect(m.title).toBe("کمک‌ها");
    expect(m.alternates?.canonical).toBe("https://hafez.example.ir/campaigns");
    expect(m.openGraph?.locale).toBe("fa_IR");
    expect(m.openGraph?.url).toBe("https://hafez.example.ir/campaigns");
  });

  it("absoluteUrl joins site origin", () => {
    process.env.AUTH_URL = "https://hafez.example.ir/";
    expect(siteUrl()).toBe("https://hafez.example.ir");
    expect(absoluteUrl("/donate/x")).toBe("https://hafez.example.ir/donate/x");
  });
});

describe("contrast audit (WCAG AA)", () => {
  it("body text on background meets 4.5:1", () => {
    expect(contrastRatio("#1f1d1a", "#faf7f2")).toBeGreaterThanOrEqual(4.5);
  });

  it("muted text on background meets 4.5:1", () => {
    expect(contrastRatio("#5a5550", "#faf7f2")).toBeGreaterThanOrEqual(4.5);
  });

  it("accent on accent-foreground meets 4.5:1", () => {
    expect(contrastRatio("#faf7f2", "#0e7c66")).toBeGreaterThanOrEqual(4.5);
  });
});
