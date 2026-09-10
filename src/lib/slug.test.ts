import { describe, expect, it } from "vitest";
import { slugifyFa } from "@/lib/slug";

describe("slugifyFa", () => {
  it("keeps latin slugs", () => {
    expect(slugifyFa("lavazem-tahrir")).toBe("lavazem-tahrir");
  });

  it("collapses spaces", () => {
    expect(slugifyFa("hello world")).toBe("hello-world");
  });
});
