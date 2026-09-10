import { describe, expect, it } from "vitest";
import { serializeDonationPublic } from "./donation-serializer";
import { formatToman } from "@/lib/money";

describe("donation serializer", () => {
  it("hides name and amount by default flags", () => {
    const view = serializeDonationPublic(
      {
        id: "1",
        donorDisplayName: "علی",
        amountToman: 100000n,
        showName: false,
        showAmount: false,
        message: null,
        createdAt: new Date(),
        publicStatus: "APPROVED",
      },
      (n) => formatToman(n),
    );
    expect(view?.displayName).toBe("یک همراه");
    expect(view?.amountHidden).toBe(true);
    expect(view?.displayAmount).toBeNull();
  });
});
