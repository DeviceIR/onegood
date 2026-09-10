import { prisma } from "../db/prisma";
import type { LedgerDirection, LedgerType, Prisma } from "@prisma/client";

export const TRANSPARENCY_TAG = "transparency";

export async function postLedgerEntry(
  input: {
    campaignId?: string | null;
    type: LedgerType;
    direction: LedgerDirection;
    amountToman: bigint;
    descriptionFa: string;
    donationId?: string;
    expenseId?: string;
    reversesEntryId?: string;
    createdByAdminId?: string;
    occurredAt?: Date;
  },
  tx?: Prisma.TransactionClient,
) {
  if (input.amountToman <= 0n) throw new Error("Ledger amount must be positive");
  const db = tx ?? prisma;
  return db.ledgerEntry.create({
    data: {
      campaignId: input.campaignId ?? null,
      type: input.type,
      direction: input.direction,
      amountToman: input.amountToman,
      descriptionFa: input.descriptionFa,
      donationId: input.donationId,
      expenseId: input.expenseId,
      reversesEntryId: input.reversesEntryId,
      createdByAdminId: input.createdByAdminId,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });
}

/**
 * Corrections are append-only: create an opposite entry linked via reversesEntryId.
 * Never UPDATE or DELETE ledger rows.
 */
export async function reverseLedgerEntry(
  entryId: string,
  adminId: string,
  reasonFa: string,
) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.ledgerEntry.findUnique({ where: { id: entryId } });
    if (!original) throw new Error("Entry not found");

    const already = await tx.ledgerEntry.findFirst({
      where: { reversesEntryId: entryId },
    });
    if (already) throw new Error("ALREADY_REVERSED");

    const direction: LedgerDirection =
      original.direction === "IN" ? "OUT" : "IN";
    const type: LedgerType =
      original.type === "DONATION"
        ? "REFUND"
        : original.type === "EXPENSE"
          ? "OTHER"
          : "OTHER";

    return postLedgerEntry(
      {
        campaignId: original.campaignId,
        type,
        direction,
        amountToman: original.amountToman,
        descriptionFa: reasonFa,
        reversesEntryId: original.id,
        createdByAdminId: adminId,
        donationId: original.donationId ?? undefined,
        expenseId: original.expenseId ?? undefined,
      },
      tx,
    );
  });
}

export async function getBalances(campaignId?: string | null) {
  const where =
    campaignId === undefined
      ? {}
      : campaignId === null
        ? { campaignId: null }
        : { campaignId };

  const groups = await prisma.ledgerEntry.groupBy({
    by: ["direction"],
    where,
    _sum: { amountToman: true },
  });

  let received = 0n;
  let spent = 0n;
  for (const g of groups) {
    const sum = g._sum.amountToman ?? 0n;
    if (g.direction === "IN") received = sum;
    else spent = sum;
  }
  return {
    received,
    spent,
    remaining: received - spent,
  };
}

/** Net donations for campaign progress (DONATION IN − REFUND OUT). */
export async function getCollectedFromLedger(campaignId: string) {
  const groups = await prisma.ledgerEntry.groupBy({
    by: ["type", "direction"],
    where: { campaignId, type: { in: ["DONATION", "REFUND"] } },
    _sum: { amountToman: true },
  });
  let collected = 0n;
  for (const g of groups) {
    const sum = g._sum.amountToman ?? 0n;
    if (g.type === "DONATION" && g.direction === "IN") collected += sum;
    if (g.type === "REFUND" && g.direction === "OUT") collected -= sum;
  }
  return collected < 0n ? 0n : collected;
}

export async function reconcileCampaignAggregates() {
  const campaigns = await prisma.campaign.findMany({ select: { id: true } });
  const drifts: {
    id: string;
    expectedCollected: bigint;
    cachedCollected: bigint;
    expectedDonors: number;
    cachedDonors: number;
  }[] = [];

  for (const c of campaigns) {
    const [expectedCollected, donorCount, campaign] = await Promise.all([
      getCollectedFromLedger(c.id),
      prisma.donation.count({
        where: { campaignId: c.id, publicStatus: { not: "HIDDEN" } },
      }),
      prisma.campaign.findUnique({ where: { id: c.id } }),
    ]);
    if (!campaign) continue;

    const collectedDrift = campaign.collectedAmountToman !== expectedCollected;
    const donorDrift = campaign.donorCount !== donorCount;
    if (collectedDrift || donorDrift) {
      drifts.push({
        id: c.id,
        expectedCollected,
        cachedCollected: campaign.collectedAmountToman,
        expectedDonors: donorCount,
        cachedDonors: campaign.donorCount,
      });
      await prisma.campaign.update({
        where: { id: c.id },
        data: {
          collectedAmountToman: expectedCollected,
          donorCount,
          aggregatesUpdatedAt: new Date(),
        },
      });
    }
  }

  // Global stats snapshot from ledger + counts
  const global = await getBalances();
  const [studentsHelped, campaignsCompleted, contributors] = await Promise.all([
    prisma.impactRecord.count(),
    prisma.campaign.count({ where: { status: "COMPLETED" } }),
    prisma.donation.count({ where: { publicStatus: { not: "HIDDEN" } } }),
  ]);
  await prisma.statsSnapshot.create({
    data: {
      totalDonationsToman: global.received,
      studentsHelped,
      campaignsCompleted,
      contributors,
    },
  });

  return drifts;
}
