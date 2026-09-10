import { notFound } from "next/navigation";
import Link from "next/link";
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
import type { Metadata } from "next";
import { DonateActionJsonLd } from "@/components/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c = await getPublishedCampaignBySlug(slug);
    if (!c) return { title: "کمپین" };
    return buildPageMetadata({
      title: c.seoTitle ?? c.titleFa,
      description: c.seoDescription ?? c.summaryFa,
      path: `/campaigns/${c.slug}`,
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <DonateActionJsonLd
        name={`کمک به ${campaign.titleFa}`}
        url={absoluteUrl(`/donate/${campaign.slug}`)}
        description={campaign.summaryFa}
      />
      <p className="text-sm text-muted">کمپین</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{campaign.titleFa}</h1>
      <p className="mt-4 text-lg text-muted">{campaign.summaryFa}</p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
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
        <Link
          href={`/donate/${campaign.slug}`}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          مشارکت در این خوبی
        </Link>
      </div>

      <section className="mt-10 whitespace-pre-line leading-relaxed">
        <h2 className="text-xl font-semibold">داستان</h2>
        <p className="mt-3 text-foreground/90">{campaign.storyFa}</p>
      </section>

      {campaign.needs.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">اقلام مورد نیاز</h2>
          <CampaignNeedsList needs={campaign.needs} />
        </section>
      ) : null}

      {campaign.updates.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">به‌روزرسانی‌ها</h2>
          <CampaignUpdateTimeline updates={campaign.updates} />
        </section>
      ) : null}

      {campaign.expenses.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">هزینه‌ها</h2>
          <CampaignExpenseSummary expenses={campaign.expenses} />
          <Link
            href={`/transparency/${campaign.slug}`}
            className="mt-4 inline-block text-sm text-accent"
          >
            شفافیت این کمپین
          </Link>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">مشارکت‌کنندگان</h2>
        <DonationActivityFeed donations={campaign.donations} />
      </section>
    </article>
  );
}
