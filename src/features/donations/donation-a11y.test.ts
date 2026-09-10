import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

describe("donation keyboard a11y structure", () => {
  const formSrc = readFileSync(
    path.join(process.cwd(), "src/features/donations/DonationForm.tsx"),
    "utf8",
  );
  const layoutSrc = readFileSync(
    path.join(process.cwd(), "src/app/(public)/layout.tsx"),
    "utf8",
  );

  it("exposes skip link to main content", () => {
    expect(layoutSrc).toContain("SkipToContent");
    expect(layoutSrc).toContain('id="main-content"');
  });

  it("donation form is keyboard-completable (labels, live status, presets)", () => {
    expect(formSrc).toContain("aria-live");
    expect(formSrc).toContain("aria-pressed");
    expect(formSrc).toContain("htmlFor");
    expect(formSrc).toContain('type="submit"');
    expect(formSrc).toContain("focus-visible:ring-2");
    expect(formSrc).toContain("role=\"alert\"");
  });
});
