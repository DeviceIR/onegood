import { CampaignCard } from "@/features/campaigns/CampaignCard";
import { PageHeader } from "@/components/PageHeader";
import { Stagger } from "@/features/home/motion/Reveal";
import { getPublishedCampaigns } from "@/server/campaigns/queries";
import { toCampaignCardData } from "@/features/campaigns/card-data";
import {
  CampaignStatusTabs,
  parseCampaignListFilter,
} from "@/features/campaigns/CampaignStatusTabs";
import { buildPageMetadata } from "@/lib/seo";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";

export const metadata = buildPageMetadata({
  title: "کمک‌ها",
  description: "فهرست کمپین‌های فعال ONE GOOD برای مشارکت شفاف.",
  path: "/campaigns",
});

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusRaw } = await searchParams;
  const filter = parseCampaignListFilter(statusRaw);
  let campaigns: Awaited<ReturnType<typeof getPublishedCampaigns>> = [];
  try {
    campaigns = await getPublishedCampaigns();
  } catch {
    campaigns = [];
  }

  const active = campaigns.filter((c) => c.status === "PUBLISHED");
  const completed = campaigns.filter((c) => c.status === "COMPLETED");
  const visible =
    filter === "completed" ? completed : filter === "all" ? campaigns : active;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="کمک‌های جاری و گذشته"
        subtitle="نیازها مشخص‌اند؛ پیشرفت و هزینه‌ها شفاف‌اند."
      />
      <CampaignStatusTabs
        current={filter}
        activeCount={active.length}
        completedCount={completed.length}
      />
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-5 py-8 text-center">
          <p className="font-medium">
            {filter === "completed"
              ? "هنوز کمک تکمیل‌شده‌ای نیست"
              : filter === "all"
                ? "کمپینی منتشر نشده است."
                : "کمپین فعالی در حال حاضر نیست"}
          </p>
          {filter === "active" && completed.length > 0 ? (
            <div className="mt-4">
              <MotionLink
                href="/campaigns?status=completed"
                className={motionLinkClass("ghost")}
              >
                مشاهده کمک‌های تکمیل‌شده
              </MotionLink>
            </div>
          ) : null}
        </div>
      ) : (
        <Stagger className="grid gap-4">
          {visible.map((c) => (
            <CampaignCard key={c.id} campaign={toCampaignCardData(c)} />
          ))}
        </Stagger>
      )}
    </div>
  );
}
