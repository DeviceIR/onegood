import { describe, expect, it, beforeAll } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  createDonationIntent,
  verifyAndCommitPayment,
} from "./donation-service";
import { MockGateway } from "./mock/mock-gateway";
import { generateIdempotencyKey } from "@/lib/crypto-helpers";

describe("donation flow (mock gateway + DB)", () => {
  let campaignId: string;

  beforeAll(async () => {
    process.env.PAYMENT_GATEWAY = "mock";
    const campaign = await prisma.campaign.upsert({
      where: { slug: "phase4-test-campaign" },
      update: { status: "PUBLISHED" },
      create: {
        slug: "phase4-test-campaign",
        titleFa: "کمپین تست پرداخت",
        summaryFa: "تست",
        storyFa: "داستان تست",
        targetAmountToman: 5_000_000n,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    campaignId = campaign.id;
  });

  it("completes a donation end-to-end", async () => {
    const key = generateIdempotencyKey();
    const intent = await createDonationIntent({
      campaignId,
      amountToman: 50_000n,
      showName: false,
      showAmount: false,
      idempotencyKey: key,
      callbackUrl: "http://localhost:3000/donation/callback",
      donorDisplayName: "تست",
    });

    expect(intent.authority).toBeTruthy();
    expect(intent.redirectUrl).toContain("Authority=");

    const first = await verifyAndCommitPayment(intent.authority, "OK");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.already).toBe(false);
    expect(first.referenceCode).toMatch(/^HFZ-/);

    const donations = await prisma.donation.findMany({
      where: { paymentId: first.paymentId },
    });
    expect(donations).toHaveLength(1);
    expect(donations[0]!.showName).toBe(false);
    expect(donations[0]!.amountToman).toBe(50_000n);

    const payment = await prisma.payment.findUnique({
      where: { id: first.paymentId },
    });
    expect(payment?.status).toBe("SUCCESS");
  });

  it("replays callback without creating a second donation", async () => {
    const key = generateIdempotencyKey();
    const intent = await createDonationIntent({
      campaignId,
      amountToman: 25_000n,
      showName: true,
      showAmount: true,
      idempotencyKey: key,
      callbackUrl: "http://localhost:3000/donation/callback",
      donorDisplayName: "خیر تست",
    });

    const first = await verifyAndCommitPayment(intent.authority, "OK");
    expect(first.ok).toBe(true);

    const second = await verifyAndCommitPayment(intent.authority, "OK");
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.already).toBe(true);
      expect(second.referenceCode).toBe(
        first.ok ? first.referenceCode : undefined,
      );
    }

    const count = await prisma.donation.count({
      where: { paymentId: first.ok ? first.paymentId : "" },
    });
    expect(count).toBe(1);

    const ledgerCount = await prisma.ledgerEntry.count({
      where: {
        donationId: (
          await prisma.donation.findUnique({
            where: { paymentId: first.ok ? first.paymentId : "" },
          })
        )?.id,
      },
    });
    expect(ledgerCount).toBe(1);
  });

  it("rejects amount mismatch at gateway verify", async () => {
    const g = new MockGateway();
    const created = await g.createPayment({
      amountToman: 40_000n,
      description: "x",
      callbackUrl: "http://localhost/donation/callback",
    });
    const bad = await g.verifyPayment({
      authority: created.authority,
      amountToman: 99_000n,
    });
    expect(bad.ok).toBe(false);
  });

  it("returns same pending redirect for identical idempotency key", async () => {
    const key = generateIdempotencyKey();
    const a = await createDonationIntent({
      campaignId,
      amountToman: 15_000n,
      showName: false,
      showAmount: false,
      idempotencyKey: key,
      callbackUrl: "http://localhost:3000/donation/callback",
    });
    const b = await createDonationIntent({
      campaignId,
      amountToman: 15_000n,
      showName: false,
      showAmount: false,
      idempotencyKey: key,
      callbackUrl: "http://localhost:3000/donation/callback",
    });
    expect(a.paymentId).toBe(b.paymentId);
    expect(a.authority).toBe(b.authority);
  });

  it("marks cancelled on NOK without donation", async () => {
    const key = generateIdempotencyKey();
    const intent = await createDonationIntent({
      campaignId,
      amountToman: 12_000n,
      showName: false,
      showAmount: false,
      idempotencyKey: key,
      callbackUrl: "http://localhost:3000/donation/callback",
    });
    const result = await verifyAndCommitPayment(intent.authority, "NOK");
    expect(result.ok).toBe(false);
    const payment = await prisma.payment.findUnique({
      where: { gatewayAuthority: intent.authority },
    });
    expect(payment?.status).toBe("CANCELLED");
    const donations = await prisma.donation.count({
      where: { paymentId: payment!.id },
    });
    expect(donations).toBe(0);
  });
});
