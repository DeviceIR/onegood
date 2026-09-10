import { describe, expect, it } from "vitest";
import { MockGateway, __mockStore } from "./mock-gateway";

describe("MockGateway", () => {
  it("creates and verifies payment", async () => {
    const g = new MockGateway();
    const created = await g.createPayment({
      amountToman: 50000n,
      description: "test",
      callbackUrl: "http://localhost/donation/callback",
    });
    expect(created.authority).toMatch(/^MOCK/);
    expect(__mockStore().has(created.authority)).toBe(true);

    const first = await g.verifyPayment({
      authority: created.authority,
      amountToman: 50000n,
    });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.alreadyVerified).toBe(false);

    const second = await g.verifyPayment({
      authority: created.authority,
      amountToman: 50000n,
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.alreadyVerified).toBe(true);
  });

  it("rejects amount mismatch", async () => {
    const g = new MockGateway();
    const created = await g.createPayment({
      amountToman: 10000n,
      description: "t",
      callbackUrl: "http://localhost/x",
    });
    const bad = await g.verifyPayment({
      authority: created.authority,
      amountToman: 20000n,
    });
    expect(bad.ok).toBe(false);
  });
});
