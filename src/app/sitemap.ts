import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = [
    "",
    "/campaigns",
    "/packages",
    "/impact",
    "/impact/videos",
    "/transparency",
    "/about",
    "/contact",
    "/volunteer",
    "/privacy",
    "/terms",
    "/donation/track",
  ].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      select: { slug: true, updatedAt: true },
    });
    const campaignUrls = campaigns.flatMap((c) => [
      {
        url: `${base}/campaigns/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${base}/donate/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
      {
        url: `${base}/transparency/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ]);
    return [...staticRoutes, ...campaignUrls];
  } catch {
    return staticRoutes;
  }
}
