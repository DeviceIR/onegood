import { mediaDisplayUrl } from "@/components/media/MediaImage";
import { toMoneyNumber } from "@/lib/money";
import type { CampaignCardData } from "@/features/campaigns/CampaignCard";

type CoverMedia = {
  visibility: string;
  bucket: string;
  storageKey: string;
  variants?: { width: number; storageKey: string; format: string }[];
} | null;

export function campaignCoverUrl(coverMedia?: CoverMedia): string | null {
  if (!coverMedia || coverMedia.visibility !== "PUBLIC") return null;
  return mediaDisplayUrl(coverMedia, 800);
}

export function toCampaignCardData(campaign: {
  slug: string;
  titleFa: string;
  summaryFa: string;
  targetAmountToman: bigint | number;
  collectedAmountToman: bigint | number;
  donorCount: number;
  deadline?: Date | null;
  status: CampaignCardData["status"];
  coverMedia?: CoverMedia;
}): CampaignCardData {
  return {
    slug: campaign.slug,
    titleFa: campaign.titleFa,
    summaryFa: campaign.summaryFa,
    targetAmountToman: toMoneyNumber(campaign.targetAmountToman),
    collectedAmountToman: toMoneyNumber(campaign.collectedAmountToman),
    donorCount: campaign.donorCount,
    deadline: campaign.deadline,
    status: campaign.status,
    coverImageUrl: campaignCoverUrl(campaign.coverMedia),
  };
}
