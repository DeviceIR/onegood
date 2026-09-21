import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db/prisma";

export const CAMPAIGNS_TAG = "campaigns";
export const campaignTag = (slug: string) => `campaign:${slug}`;

const coverMediaInclude = {
  coverMedia: { include: { variants: true } },
} as const;

export async function getPublishedCampaigns() {
  return unstable_cache(
    async () =>
      prisma.campaign.findMany({
        where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
        include: coverMediaInclude,
        orderBy: [{ status: "asc" }, { isFeatured: "desc" }, { sortOrder: "asc" }],
      }),
    ["campaigns-list"],
    { tags: [CAMPAIGNS_TAG], revalidate: 60 },
  )();
}

export async function getPublishedCampaignBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.campaign.findFirst({
        where: { slug, status: { in: ["PUBLISHED", "COMPLETED"] } },
        include: {
          ...coverMediaInclude,
          needs: { orderBy: { sortOrder: "asc" } },
          updates: {
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
          },
          donations: {
            where: { publicStatus: "APPROVED" },
            include: { campaign: { select: { titleFa: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          expenses: {
            where: { status: "PUBLISHED" },
            orderBy: { occurredAt: "desc" },
          },
        },
      }),
    [`campaign-detail-${slug}`],
    { tags: [CAMPAIGNS_TAG, campaignTag(slug)], revalidate: 60 },
  )();
}

export async function getFeaturedPublishedCampaigns(take = 6) {
  return unstable_cache(
    async () =>
      prisma.campaign.findMany({
        where: { status: "PUBLISHED" },
        include: coverMediaInclude,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take,
      }),
    [`campaigns-featured-${take}`],
    { tags: [CAMPAIGNS_TAG], revalidate: 60 },
  )();
}
