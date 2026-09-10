import { CampaignCard } from "@/features/campaigns/CampaignCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getPublishedCampaigns } from "@/server/campaigns/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "کمک‌ها",
  description: "فهرست کمپین‌های فعال ONE GOOD برای مشارکت شفاف.",
  path: "/campaigns",
});

export default async function CampaignsPage() {
  let campaigns: Awaited<ReturnType<typeof getPublishedCampaigns>> = [];
  try {
    campaigns = await getPublishedCampaigns();
  } catch {
    campaigns = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        title="کمک‌های جاری و گذشته"
        subtitle="نیازها مشخص‌اند؛ پیشرفت و هزینه‌ها شفاف‌اند."
      />
      {campaigns.length === 0 ? (
        <p className="text-muted">کمپینی منتشر نشده است.</p>
      ) : (
        campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
      )}
    </div>
  );
}
