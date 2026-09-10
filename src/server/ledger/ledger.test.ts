import { describe, expect, it, beforeAll } from "vitest";
import { prisma } from "@/server/db/prisma";
import {
  getBalances,
  getCollectedFromLedger,
  postLedgerEntry,
  reconcileCampaignAggregates,
  reverseLedgerEntry,
} from "./index";

describe("ledger transparency (append-only)", () => {
  let campaignId: string;
  let adminId: string;

  beforeAll(async () => {
    const admin = await prisma.admin.upsert({
      where: { email: "ledger-test@hafez.local" },
      update: {},
      create: {
        email: "ledger-test@hafez.local",
        name: "Ledger Tester",
        passwordHash: "x",
        role: "ADMIN",
      },
    });
    adminId = admin.id;

    const campaign = await prisma.campaign.upsert({
      where: { slug: "phase6-ledger-test" },
      update: {
        collectedAmountToman: 0n,
        donorCount: 0,
      },
      create: {
        slug: "phase6-ledger-test",
        titleFa: "کمپین تست دفترکل",
        summaryFa: "تست",
        storyFa: "داستان",
        targetAmountToman: 10_000_000n,
        status: "PUBLISHED",
        publishedAt: new Date(),
        collectedAmountToman: 0n,
        donorCount: 0,
      },
    });
    campaignId = campaign.id;

    await prisma.ledgerEntry.deleteMany({ where: { campaignId } });
  });

  it("public balances equal the ledger to the toman", async () => {
    await postLedgerEntry({
      campaignId,
      type: "DONATION",
      direction: "IN",
      amountToman: 100_000n,
      descriptionFa: "کمک تست",
    });
    await postLedgerEntry({
      campaignId,
      type: "EXPENSE",
      direction: "OUT",
      amountToman: 40_000n,
      descriptionFa: "هزینه تست",
      createdByAdminId: adminId,
    });

    const bal = await getBalances(campaignId);
    const rows = await prisma.ledgerEntry.findMany({ where: { campaignId } });
    let received = 0n;
    let spent = 0n;
    for (const r of rows) {
      if (r.direction === "IN") received += r.amountToman;
      else spent += r.amountToman;
    }
    expect(bal.received).toBe(received);
    expect(bal.spent).toBe(spent);
    expect(bal.remaining).toBe(received - spent);
    expect(bal.remaining).toBe(60_000n);
  });

  it("corrections are only reversing entries (no in-place edit)", async () => {
    const donation = await postLedgerEntry({
      campaignId,
      type: "DONATION",
      direction: "IN",
      amountToman: 25_000n,
      descriptionFa: "کمک قابل اصلاح",
    });

    const before = await getBalances(campaignId);
    const reversal = await reverseLedgerEntry(
      donation.id,
      adminId,
      "اصلاح اشتباه ثبت",
    );

    expect(reversal.reversesEntryId).toBe(donation.id);
    expect(reversal.direction).toBe("OUT");
    expect(reversal.type).toBe("REFUND");
    expect(reversal.amountToman).toBe(25_000n);

    const untouched = await prisma.ledgerEntry.findUnique({
      where: { id: donation.id },
    });
    expect(untouched?.amountToman).toBe(25_000n);
    expect(untouched?.descriptionFa).toBe("کمک قابل اصلاح");

    const after = await getBalances(campaignId);
    expect(after.remaining).toBe(before.remaining - 25_000n);

    await expect(
      reverseLedgerEntry(donation.id, adminId, "دوباره"),
    ).rejects.toThrow("ALREADY_REVERSED");
  });

  it("reconcile syncs campaign cache from ledger", async () => {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { collectedAmountToman: 1n, donorCount: 99 },
    });

    const expected = await getCollectedFromLedger(campaignId);
    const drifts = await reconcileCampaignAggregates();
    const mine = drifts.find((d) => d.id === campaignId);
    expect(mine?.expectedCollected).toBe(expected);

    const c = await prisma.campaign.findUnique({ where: { id: campaignId } });
    expect(c?.collectedAmountToman).toBe(expected);
  });
});
