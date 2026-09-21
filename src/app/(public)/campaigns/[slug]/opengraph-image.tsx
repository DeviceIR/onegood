import { brandOpenGraphImage, ogContentType, ogSize } from "@/lib/og-image";
import { getPublishedCampaignBySlug } from "@/server/campaigns/queries";
import { SITE_NAME_EN } from "@/lib/seo";

export const alt = "ONE GOOD campaign";
export const size = ogSize;
export const contentType = ogContentType;

export default async function CampaignOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let title = SITE_NAME_EN;
  let subtitle = "A transparent campaign";
  try {
    const campaign = await getPublishedCampaignBySlug(slug);
    if (campaign) {
      title = campaign.slug.replace(/-/g, " ");
      subtitle = "A transparent ONE GOOD campaign";
    }
  } catch {
    /* fallback brand card */
  }
  return brandOpenGraphImage({ title, subtitle });
}
