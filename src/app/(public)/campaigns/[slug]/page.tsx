import { notFound } from "next/navigation";
import { Money } from "@/components/Money";
import { CampaignProgress } from "@/features/campaigns/CampaignProgress";
import {
  CampaignExpenseSummary,
  CampaignNeedsList,
  CampaignUpdateTimeline,
} from "@/features/campaigns/CampaignExtras";
import { JalaliDate } from "@/components/JalaliDate";
import { DonationActivityFeed } from "@/features/home/activity/DonationActivityFeed";
import { getPublishedCampaignBySlug } from "@/server/campaigns/queries";
import { campaignCoverUrl } from "@/features/campaigns/card-data";
import type { Metadata } from "next";
import { DonateActionJsonLd } from "@/components/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";
import { Reveal } from "@/features/home/motion/Reveal";
import { ShareActions } from "@/components/ShareActions";
import { toMoneyNumber } from "@/lib/money";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c = await getPublishedCampaignBySlug(slug);
    if (!c) return { title: "کمپین" };
    const image = campaignCoverUrl(c.coverMedia);
    return buildPageMetadata({
      title: c.seoTitle ?? c.titleFa,
      description: c.seoDescription ?? c.summaryFa,
      path: `/campaigns/${c.slug}`,
      image: image ?? undefined,
    });
  } catch {
    return { title: "کمپین" };
  }
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  let campaign = null;
  try {
    campaign = await getPublishedCampaignBySlug(slug);
  } catch {
    notFound();
  }
  if (!campaign) notFound();

  const target = campaign.targetAmountToman;
  const collected = campaign.collectedAmountToman;
  const pct = target > 0n ? Math.min(100, Number((collected * 100n) / target)) : 0;
  const coverUrl = campaignCoverUrl(campaign.coverMedia);
  const pageUrl = absoluteUrl(`/campaigns/${campaign.slug}`);
  const completed = campaign.status === "COMPLETED";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <DonateActionJsonLd
        name={`کمک به ${campaign.titleFa}`}
        url={absoluteUrl(`/donate/${campaign.slug}`)}
        description={campaign.summaryFa}
      />
      <PageHeader
        kicker={completed ? "کمک تکمیل‌شده" : "کمپین"}
        title={campaign.titleFa}
        subtitle={campaign.summaryFa}
      />

      {coverUrl ? (
        <Reveal className="mt-8 overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={campaign.coverMedia?.altTextFa ?? campaign.titleFa}
            className="aspect-[16/9] w-full object-cover"
          />
        </Reveal>
      ) : null}

      <Reveal className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex justify-between text-sm">
          <Money amount={collected} />
          <span className="text-muted">
            هدف: <Money amount={target} />
          </span>
        </div>
        <div className="mt-3">
          <CampaignProgress percent={pct} />
        </div>
        {campaign.deadline ? (
          <p className="mt-3 text-sm text-muted">
            مهلت: <JalaliDate date={campaign.deadline} />
          </p>
        ) : null}
        {!completed ? (
          <div className="mt-6">
            <MotionLink
              href={`/donate/${campaign.slug}`}
              full
              className={`${motionLinkClass("primary")} h-12 w-full`}
            >
              مشارکت در این خوبی
            </MotionLink>
          </div>
        ) : null}
        <div className="mt-6">
          <ShareActions url={pageUrl} title={campaign.titleFa} />
        </div>
      </Reveal>

      <section className="mt-10 whitespace-pre-line leading-relaxed">
        <Reveal>
          <h2 className="text-xl font-semibold">داستان</h2>
        </Reveal>
        <p className="mt-3 text-foreground/90">{campaign.storyFa}</p>
      </section>

      {campaign.needs.length > 0 ? (
        <section className="mt-10">
          <Reveal>
            <h2 className="mb-4 text-xl font-semibold">اقلام مورد نیاز</h2>
          </Reveal>
          <CampaignNeedsList needs={campaign.needs} />
        </section>
      ) : null}

      {campaign.updates.length > 0 ? (
        <section className="mt-10">
          <Reveal>
            <h2 className="mb-4 text-xl font-semibold">به‌روزرسانی‌ها</h2>
          </Reveal>
          <CampaignUpdateTimeline updates={campaign.updates} />
        </section>
      ) : null}

      {campaign.expenses.length > 0 ? (
        <section className="mt-10">
          <Reveal>
            <h2 className="mb-4 text-xl font-semibold">هزینه‌ها</h2>
          </Reveal>
          <CampaignExpenseSummary expenses={campaign.expenses} />
          <MotionLink
            href={`/transparency/${campaign.slug}`}
            className={`${motionLinkClass("ghost")} mt-4`}
          >
            شفافیت این کمپین
          </MotionLink>
        </section>
      ) : null}

      {campaign.donations.length > 0 ? (
        <section className="mt-10">
          <Reveal>
            <h2 className="mb-4 text-xl font-semibold">مشارکت‌کنندگان</h2>
          </Reveal>
          <DonationActivityFeed
            donations={campaign.donations.map((d) => ({
              ...d,
              amountToman: toMoneyNumber(d.amountToman),
            }))}
          />
        </section>
      ) : null}
    </article>
  );
}
