import type { CampaignStatus } from "@prisma/client";

export const CAMPAIGN_STATUS_FA: Record<CampaignStatus, string> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
  COMPLETED: "تکمیل‌شده",
  ARCHIVED: "بایگانی",
};

export const CAMPAIGN_STATUSES = Object.keys(CAMPAIGN_STATUS_FA) as CampaignStatus[];

export function campaignStatusFa(status: string): string {
  return CAMPAIGN_STATUS_FA[status as CampaignStatus] ?? status;
}

export function isCampaignStatus(value: string): value is CampaignStatus {
  return CAMPAIGN_STATUSES.includes(value as CampaignStatus);
}
