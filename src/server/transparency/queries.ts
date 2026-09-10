import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { getBalances, TRANSPARENCY_TAG } from "@/server/ledger";
import { publicMediaUrl } from "@/server/storage/s3";

export type PublicReceipt = {
  id: string;
  note: string | null;
  url: string;
  altTextFa: string | null;
};

export type PublicExpense = {
  id: string;
  descriptionFa: string;
  category: string;
  vendor: string | null;
  amountToman: bigint;
  occurredAt: Date;
  receipts: PublicReceipt[];
};

function mapReceipt(r: {
  id: string;
  note: string | null;
  redactedMedia: {
    bucket: string;
    storageKey: string;
    altTextFa: string | null;
    visibility: string;
  } | null;
  media: {
    bucket: string;
    storageKey: string;
    altTextFa: string | null;
    visibility: string;
  };
}): PublicReceipt | null {
  const media = r.redactedMedia ?? r.media;
  if (media.visibility !== "PUBLIC") return null;
  return {
    id: r.id,
    note: r.note,
    url: publicMediaUrl(media.bucket, media.storageKey),
    altTextFa: media.altTextFa,
  };
}

async function loadTransparencyOverview() {
  const [balances, entries, expenses, campaigns] = await Promise.all([
    getBalances(),
    prisma.ledgerEntry.findMany({
      orderBy: { occurredAt: "desc" },
      take: 50,
    }),
    prisma.expense.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { occurredAt: "desc" },
      take: 30,
      include: {
        receipts: {
          include: {
            media: true,
            redactedMedia: true,
          },
        },
      },
    }),
    prisma.campaign.findMany({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      select: { slug: true, titleFa: true },
      orderBy: { titleFa: "asc" },
    }),
  ]);

  const publicExpenses: PublicExpense[] = expenses.map((e) => ({
    id: e.id,
    descriptionFa: e.descriptionFa,
    category: e.category,
    vendor: e.vendor,
    amountToman: e.amountToman,
    occurredAt: e.occurredAt,
    receipts: e.receipts
      .map(mapReceipt)
      .filter((x): x is PublicReceipt => x !== null),
  }));

  return { balances, entries, expenses: publicExpenses, campaigns };
}

export function getTransparencyOverview() {
  return unstable_cache(loadTransparencyOverview, ["transparency-overview"], {
    tags: [TRANSPARENCY_TAG],
    revalidate: 60,
  })();
}

async function loadCampaignTransparency(slug: string) {
  const c = await prisma.campaign.findUnique({ where: { slug } });
  if (!c) return null;

  const [balances, entries, expenses] = await Promise.all([
    getBalances(c.id),
    prisma.ledgerEntry.findMany({
      where: { campaignId: c.id },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { campaignId: c.id, status: "PUBLISHED" },
      orderBy: { occurredAt: "desc" },
      include: {
        receipts: { include: { media: true, redactedMedia: true } },
      },
    }),
  ]);

  return {
    campaign: c,
    balances,
    entries,
    expenses: expenses.map((e) => ({
      id: e.id,
      descriptionFa: e.descriptionFa,
      category: e.category,
      vendor: e.vendor,
      amountToman: e.amountToman,
      occurredAt: e.occurredAt,
      receipts: e.receipts
        .map(mapReceipt)
        .filter((x): x is PublicReceipt => x !== null),
    })),
  };
}

export function getCampaignTransparency(slug: string) {
  return unstable_cache(
    () => loadCampaignTransparency(slug),
    ["transparency-campaign", slug],
    { tags: [TRANSPARENCY_TAG, `transparency:${slug}`], revalidate: 60 },
  )();
}
