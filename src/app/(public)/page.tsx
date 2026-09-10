import Link from "next/link";
import { ImpactCard3D } from "@/features/home/impact-card/ImpactCard3D";
import { CampaignCard } from "@/features/campaigns/CampaignCard";
import { DonationActivityFeed } from "@/features/home/activity/DonationActivityFeed";
import {
  ImpactGalleryGrid,
  TestimonialCard,
  VideoTeaser,
} from "@/features/home/sections/HomeSections";
import { Reveal } from "@/features/home/motion/Reveal";
import { HeroIntro } from "@/features/home/motion/HeroIntro";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/server/db/prisma";
import { BalanceSummary } from "@/features/transparency/LedgerViews";
import { getBalances } from "@/server/ledger";
import { getFeaturedPublishedCampaigns } from "@/server/campaigns/queries";
import { mediaDisplayUrl } from "@/components/media/MediaImage";
import { SITE_EXPRESSION_FA, SITE_NAME_EN } from "@/lib/seo";
import { toMoneyNumber } from "@/lib/money";

async function getHomeData() {
  try {
    const [
      campaigns,
      donations,
      snapshot,
      balances,
      testimonials,
      impactRecords,
      completedCount,
      donorCount,
      videos,
    ] = await Promise.all([
      getFeaturedPublishedCampaigns(6),
      prisma.donation.findMany({
        where: { publicStatus: "APPROVED" },
        include: { campaign: { select: { titleFa: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.statsSnapshot.findFirst({ orderBy: { capturedAt: "desc" } }),
      getBalances(),
      prisma.testimonial.findMany({
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),
      prisma.impactRecord.findMany({
        include: {
          campaign: { select: { titleFa: true } },
          media: {
            include: { media: { include: { variants: true } } },
            take: 1,
          },
        },
        orderBy: { deliveredAt: "desc" },
        take: 4,
      }),
      prisma.campaign.count({ where: { status: "COMPLETED" } }),
      prisma.donation.count({ where: { publicStatus: "APPROVED" } }),
      prisma.media.findMany({
        where: { kind: "VIDEO", visibility: "PUBLIC" },
        take: 2,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // BigInt cannot cross the RSC → client boundary (e.g. ImpactCard3D).
    return {
      campaigns: campaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        titleFa: c.titleFa,
        summaryFa: c.summaryFa,
        targetAmountToman: toMoneyNumber(c.targetAmountToman),
        collectedAmountToman: toMoneyNumber(c.collectedAmountToman),
        donorCount: c.donorCount,
        deadline: c.deadline,
      })),
      donations: donations.map((d) => ({
        ...d,
        amountToman: toMoneyNumber(d.amountToman),
      })),
      snapshot: snapshot
        ? {
            ...snapshot,
            totalDonationsToman: toMoneyNumber(snapshot.totalDonationsToman),
          }
        : null,
      balances: {
        received: toMoneyNumber(balances.received),
        spent: toMoneyNumber(balances.spent),
        remaining: toMoneyNumber(balances.remaining),
      },
      testimonials,
      impactRecords,
      completedCount,
      donorCount,
      videos,
    };
  } catch {
    return {
      campaigns: [],
      donations: [],
      snapshot: null,
      balances: { received: 0, spent: 0, remaining: 0 },
      testimonials: [],
      impactRecords: [],
      completedCount: 0,
      donorCount: 0,
      videos: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const impactStats = {
    totalDonationsToman:
      data.snapshot?.totalDonationsToman ?? data.balances.received,
    studentsHelped: data.snapshot?.studentsHelped ?? 0,
    campaignsCompleted:
      data.snapshot?.campaignsCompleted ?? data.completedCount,
    contributors: data.snapshot?.contributors ?? data.donorCount,
  };

  const galleryItems = data.impactRecords.map((r) => {
    const img = r.media[0]?.media;
    return {
      id: r.id,
      itemsSummaryFa: r.itemsSummaryFa,
      publicDescriptionFa: r.publicDescriptionFa,
      deliveredAt: r.deliveredAt,
      campaignTitle: r.campaign.titleFa,
      imageUrl:
        img && img.visibility === "PUBLIC" ? mediaDisplayUrl(img, 800) : null,
      imageAlt: img?.altTextFa ?? null,
    };
  });

  const videoItems = data.videos.map((v) => ({
    id: v.id,
    title: v.altTextFa ?? "ویدیو",
    href: "/impact/videos",
  }));

  return (
    <>
      <section className="relative -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at 78% 8%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 52%), radial-gradient(ellipse at 12% 70%, color-mix(in srgb, var(--color-gold) 10%, transparent), transparent 48%), linear-gradient(180deg, var(--color-hero) 0%, color-mix(in srgb, var(--color-hero) 70%, var(--color-surface)) 62%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pb-28 md:pt-12">
          <HeroIntro />
          <ImpactCard3D stats={impactStats} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading
            title="کمک‌های فعال"
            subtitle="هر کمپین نیاز مشخص، مبلغ هدف، و مسیر شفاف دارد."
          />
          <div>
            {data.campaigns.length === 0 ? (
              <p className="text-muted">
                به‌زودی کمپین‌ها اینجا نمایش داده می‌شوند.
              </p>
            ) : (
              data.campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))
            )}
          </div>
          <Link
            href="/campaigns"
            className="mt-6 inline-block text-accent hover:underline"
          >
            همه کمک‌ها
          </Link>
        </Reveal>
      </section>

      <section className="section-fade-soft py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading
              title="اثر واقعی"
              subtitle="پول تبدیل به وسیله و نتیجه می‌شود — بدون بهره‌کشی احساسی از کودکان."
            />
            <ImpactGalleryGrid items={galleryItems} />
            <Link
              href="/impact"
              className="mt-6 inline-block text-accent hover:underline"
            >
              گالری اثر کمک‌ها
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading
            title="فعالیت کمک‌ها"
            subtitle="نام و مبلغ فقط با رضایت همراه نمایش داده می‌شود."
          />
          <DonationActivityFeed donations={data.donations} />
        </Reveal>
      </section>

      <section className="section-fade-soft py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading
              title="ویدیوها"
              subtitle="بدون پخش خودکار با صدا؛ بارگذاری تنبل."
            />
            <VideoTeaser videos={videoItems} />
            <Link
              href="/impact/videos"
              className="mt-6 inline-block text-accent hover:underline"
            >
              همه ویدیوها
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading
            title="از زبان همراهان"
            subtitle="با حفظ کرامت و بدون سوءاستفاده از تصویر کودکان."
          />
          {data.testimonials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-5 py-8 text-center">
              <p className="font-medium">هنوز نظری منتشر نشده است</p>
              <p className="mt-2 text-sm text-muted">
                حرف‌های واقعی همراهان، بعد از ثبت و تأیید اینجا می‌آید.
              </p>
            </div>
          ) : (
            <ul className="grid gap-10 md:grid-cols-2">
              {data.testimonials.map((t) => (
                <li key={t.id}>
                  <TestimonialCard
                    authorDisplayName={t.authorDisplayName}
                    authorRole={t.authorRole}
                    bodyFa={t.bodyFa}
                  />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>

      <section className="section-fade-soft py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading
              title="شفافیت مالی"
              subtitle="ببینید کمک شما به چه چیزی تبدیل شد."
            />
            <BalanceSummary {...data.balances} />
            <Link
              href="/transparency"
              className="mt-6 inline-block text-accent hover:underline"
            >
              جزئیات شفافیت
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading
            title={`چگونه ${SITE_NAME_EN} کار می‌کند`}
            subtitle="مسیر ساده از مشارکت تا اثر واقعی."
          />
          <ol className="mt-2 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "۱",
                title: "مشارکت",
                body: "یک مبلغ کوچک برای یک نیاز مشخص.",
              },
              {
                step: "۲",
                title: "اقدام",
                body: "خرید و تحویل وسیله‌های واقعی — با سند و شفافیت.",
              },
              {
                step: "۳",
                title: "اثر",
                body: "یک دانش‌آموز حمایت می‌شود؛ یک خوبی ادامه پیدا می‌کند.",
              },
            ].map((item, i) => (
              <li key={item.step} className="relative">
                <Reveal delay={0.08 * (i + 1)} y={12}>
                  <p className="text-sm text-accent">{item.step}</p>
                  <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="section-fade-soft py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading
              title="همراهی با ما"
              subtitle="اگر می‌خواهید داوطلب شوید یا پیامی بفرستید."
            />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/volunteer"
                className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-accent-foreground"
              >
                ثبت همکاری
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5"
              >
                تماس با ما
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 pb-20">
        <Reveal>
          <div className="rounded-3xl bg-accent px-6 py-10 text-accent-foreground shadow-[0_24px_60px_-28px_rgba(12,122,98,0.55)] md:px-10">
            <h2 className="text-2xl font-semibold md:text-3xl">
              یک خوبی کوچک می‌تواند واقعی باشد.
            </h2>
            <p className="mt-2 max-w-xl opacity-90">
              از یک کیف و یک مداد تا لبخند یک دانش‌آموز — خوبی‌ها را حفظ کنیم.
            </p>
            <Link
              href="/campaigns"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-card px-5 text-foreground"
            >
              مشارکت در {SITE_EXPRESSION_FA}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
