import { ImpactCard3D } from "@/features/home/impact-card/ImpactCard3D";
import { CampaignCard } from "@/features/campaigns/CampaignCard";
import { DonationActivityFeed } from "@/features/home/activity/DonationActivityFeed";
import {
  ImpactGalleryGrid,
  TestimonialCard,
  VideoTeaser,
} from "@/features/home/sections/HomeSections";
import { Reveal, Stagger, FadeItem } from "@/features/home/motion/Reveal";
import { HeroIntro } from "@/features/home/motion/HeroIntro";
import { HeroAtmosphere } from "@/features/home/motion/HeroAtmosphere";
import { HowItWorks } from "@/features/home/sections/HowItWorks";
import { SectionHeading } from "@/components/SectionHeading";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";
import { prisma } from "@/server/db/prisma";
import { BalanceSummary } from "@/features/transparency/LedgerViews";
import { getBalances } from "@/server/ledger";
import { getFeaturedPublishedCampaigns } from "@/server/campaigns/queries";
import { toCampaignCardData } from "@/features/campaigns/card-data";
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
        ...toCampaignCardData(c),
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
        <HeroAtmosphere />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pb-28 md:pt-12">
          <HeroIntro />
          <ImpactCard3D stats={impactStats} />
        </div>
      </section>

      {data.campaigns.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading
            title="کمک‌های فعال"
            subtitle="هر کمپین نیاز مشخص، مبلغ هدف، و مسیر شفاف دارد."
          />
          <Stagger className="grid gap-4">
            {data.campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </Stagger>
          <Reveal className="mt-6">
            <MotionLink href="/campaigns" className={motionLinkClass("ghost")}>
              همه کمک‌ها
            </MotionLink>
          </Reveal>
        </section>
      ) : null}

      {galleryItems.length > 0 ? (
        <section className="section-fade-soft py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading
              title="اثر واقعی"
              subtitle="پول تبدیل به وسیله و نتیجه می‌شود — بدون بهره‌کشی احساسی از کودکان."
            />
            <ImpactGalleryGrid items={galleryItems} />
            <Reveal className="mt-6">
              <MotionLink href="/impact" className={motionLinkClass("ghost")}>
                گالری اثر کمک‌ها
              </MotionLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      {data.donations.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading
            title="فعالیت کمک‌ها"
            subtitle="نام و مبلغ فقط با رضایت همراه نمایش داده می‌شود."
          />
          <DonationActivityFeed donations={data.donations} />
        </section>
      ) : null}

      {videoItems.length > 0 ? (
        <section className="section-fade-soft py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading
              title="ویدیوها"
              subtitle="بدون پخش خودکار با صدا؛ بارگذاری تنبل."
            />
            <VideoTeaser videos={videoItems} />
            <Reveal className="mt-6">
              <MotionLink href="/impact/videos" className={motionLinkClass("ghost")}>
                همه ویدیوها
              </MotionLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      {data.testimonials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading
            title="از زبان همراهان"
            subtitle="با حفظ کرامت و بدون سوءاستفاده از تصویر کودکان."
          />
          <Stagger className="grid gap-10 md:grid-cols-2">
            {data.testimonials.map((t) => (
              <FadeItem key={t.id}>
                <TestimonialCard
                  authorDisplayName={t.authorDisplayName}
                  authorRole={t.authorRole}
                  bodyFa={t.bodyFa}
                />
              </FadeItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      {data.balances.received > 0 ? (
        <section className="section-fade-soft py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading
              title="شفافیت مالی"
              subtitle="ببینید کمک شما به چه چیزی تبدیل شد."
            />
            <Reveal>
              <BalanceSummary {...data.balances} />
            </Reveal>
            <Reveal className="mt-6">
              <MotionLink href="/transparency" className={motionLinkClass("ghost")}>
                جزئیات شفافیت
              </MotionLink>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          title={`چگونه ${SITE_NAME_EN} کار می‌کند`}
          subtitle="مسیر ساده از مشارکت تا اثر واقعی."
        />
        <HowItWorks />
      </section>

      <section className="section-fade-soft py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="همراهی با ما"
            subtitle="اگر می‌خواهید داوطلب شوید یا پیامی بفرستید."
          />
          <Reveal className="flex flex-wrap gap-3">
            <MotionLink href="/volunteer" className={motionLinkClass("primary")}>
              ثبت همکاری
            </MotionLink>
            <MotionLink href="/contact" className={motionLinkClass("secondary")}>
              تماس با ما
            </MotionLink>
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
            <div className="mt-6">
              <MotionLink
                href="/campaigns"
                className="inline-flex h-11 items-center rounded-xl bg-card px-5 text-sm text-foreground"
              >
                مشارکت در {SITE_EXPRESSION_FA}
              </MotionLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
