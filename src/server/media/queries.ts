import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { MEDIA_TAG } from "@/server/media/tags";
import { publicMediaUrl } from "@/server/storage/s3";
import { mediaDisplayUrl } from "@/components/media/MediaImage";

export async function getPublicImpactGallery() {
  return unstable_cache(
    async () => {
      return prisma.impactRecord.findMany({
        include: {
          campaign: { select: { titleFa: true, slug: true } },
          media: {
            include: {
              media: { include: { variants: true } },
            },
          },
        },
        orderBy: { deliveredAt: "desc" },
        take: 40,
      });
    },
    ["impact-gallery"],
    { tags: [MEDIA_TAG], revalidate: 60 },
  )();
}

export async function getPublicVideos() {
  return unstable_cache(
    async () => {
      const rows = await prisma.media.findMany({
        where: { kind: "VIDEO", visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return rows.map((v) => ({
        ...v,
        src: publicMediaUrl(v.bucket, v.storageKey),
      }));
    },
    ["public-videos"],
    { tags: [MEDIA_TAG], revalidate: 60 },
  )();
}

export async function getPublicGalleryImages(take = 12) {
  return unstable_cache(
    async () => {
      const rows = await prisma.media.findMany({
        where: {
          kind: "IMAGE",
          visibility: "PUBLIC",
          // Consent-gated: beneficiary media without consent cannot be PUBLIC
          OR: [
            { depictsBeneficiary: false },
            { consent: { is: { revokedAt: null } } },
          ],
        },
        include: { variants: true, consent: true },
        orderBy: { createdAt: "desc" },
        take,
      });
      return rows
        .filter((m) => {
          if (!m.depictsBeneficiary) return true;
          if (!m.consent || m.consent.revokedAt) return false;
          if (m.consent.expiresAt && m.consent.expiresAt < new Date()) return false;
          return m.consent.scopes.includes("PHOTO");
        })
        .map((m) => ({
          id: m.id,
          altTextFa: m.altTextFa,
          blurDataUrl: m.blurDataUrl,
          url: mediaDisplayUrl(m, 800),
          width: m.width,
          height: m.height,
        }));
    },
    ["public-gallery-images", String(take)],
    { tags: [MEDIA_TAG], revalidate: 60 },
  )();
}
