import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NeedSeed = {
  titleFa: string;
  quantity: number;
  unitPriceEstimateToman: bigint;
  note?: string;
};

type CampaignSeed = {
  slug: string;
  titleFa: string;
  summaryFa: string;
  storyFa: string;
  targetAmountToman: bigint;
  isFeatured: boolean;
  sortOrder: number;
  needs: NeedSeed[];
};

/** Catalog only — no fake collected amounts, donors, or completed history. */
const campaigns: CampaignSeed[] = [
  {
    slug: "yek-khoobi-lavazem-tahrir",
    titleFa: "یک خوبی / لوازم تحصیلی",
    summaryFa:
      "تهیه بسته لوازم‌التحریر واقعی برای دانش‌آموزانی که امکان خرید لوازم ابتدایی مدرسه را ندارند.",
    storyFa: `این کمک از یک نیاز واقعی شروع شد: دو دانش‌آموز ابتدایی بدون کیف و دفتر مانده بودند.
هدف ما تأمین اقلام ضروری با قیمت‌های واقعی بازار است — نه شعار.

هر بسته شامل کیف، دفتر، خودکار، مداد و لوازم پایه است.
هویت کودکان در سایت منتشر نمی‌شود؛ فقط اثر کمک دیده می‌شود.`,
    targetAmountToman: 24_000_000n,
    isFeatured: true,
    sortOrder: 1,
    needs: [
      {
        titleFa: "کیف مدرسه استاندارد",
        quantity: 12,
        unitPriceEstimateToman: 950_000n,
        note: "قیمت تقریبی بازار",
      },
      {
        titleFa: "ست دفتر ۴۰ برگ (۵ عددی)",
        quantity: 12,
        unitPriceEstimateToman: 180_000n,
      },
      {
        titleFa: "بسته مداد و خودکار",
        quantity: 12,
        unitPriceEstimateToman: 120_000n,
      },
      {
        titleFa: "جامدادی و پاک‌کن و تراش",
        quantity: 12,
        unitPriceEstimateToman: 95_000n,
      },
      {
        titleFa: "هزینه بسته‌بندی و تحویل محلی",
        quantity: 1,
        unitPriceEstimateToman: 1_260_000n,
      },
    ],
  },
  {
    slug: "yek-khoobi-bazgasht-be-madreseh",
    titleFa: "یک خوبی / بازگشت به مدرسه",
    summaryFa:
      "پشتیبانی شروع سال تحصیلی: لباس فرم ساده، کفش مناسب و لوازم پایه برای چند دانش‌آموز.",
    storyFa: `شروع سال تحصیلی برای بعضی خانواده‌ها سنگین است.
در این کمک، فقط اقلام ضروری با قیمت مشخص خریداری می‌شود.

ما اقلام را با فاکتور خرید می‌کنیم و اثر را بدون نمایش چهره یا نام کامل کودکان منتشر می‌کنیم.`,
    targetAmountToman: 36_000_000n,
    isFeatured: true,
    sortOrder: 2,
    needs: [
      {
        titleFa: "کفش ورزشی ساده",
        quantity: 10,
        unitPriceEstimateToman: 1_450_000n,
      },
      {
        titleFa: "ست لباس فرم / روپوش",
        quantity: 10,
        unitPriceEstimateToman: 980_000n,
      },
      {
        titleFa: "جوراب و اقلام مکمل",
        quantity: 10,
        unitPriceEstimateToman: 120_000n,
      },
      {
        titleFa: "هزینه خرید و تحویل",
        quantity: 1,
        unitPriceEstimateToman: 1_500_000n,
      },
    ],
  },
  {
    slug: "yek-khoobi-poshesh-zemestan",
    titleFa: "یک خوبی / پوشش زمستانی",
    summaryFa:
      "کاپشن یا پالتوی گرم و لباس زیر گرم برای دانش‌آموزان در فصل سرما.",
    storyFa: `سرما نباید مانع مدرسه رفتن باشد.
این کمک فقط برای خرید پوشاک گرم ضروری است؛ قیمت‌ها بر اساس فروشگاه‌های محلی و فاکتور واقعی تنظیم شده‌اند.`,
    targetAmountToman: 28_500_000n,
    isFeatured: true,
    sortOrder: 3,
    needs: [
      {
        titleFa: "کاپشن زمستانی کودک",
        quantity: 15,
        unitPriceEstimateToman: 1_350_000n,
      },
      {
        titleFa: "دستکش و کلاه",
        quantity: 15,
        unitPriceEstimateToman: 220_000n,
      },
      {
        titleFa: "هزینه خرید و تحویل",
        quantity: 1,
        unitPriceEstimateToman: 1_050_000n,
      },
    ],
  },
  {
    slug: "yek-khoobi-ghaza-ye-madrese",
    titleFa: "یک خوبی / حمایت تغذیه مدرسه",
    summaryFa:
      "تهیه بسته خوراکی ساده و سالم برای وعده‌های سبک دانش‌آموزان نیازمند.",
    storyFa: `گاهی یک میان‌وعده ساده، تمرکز و حضور در کلاس را ممکن می‌کند.
اقلام این کمک خوراکی‌های پایه و قابل نگهداری هستند و قیمت‌ها از فروشگاه‌های محلی گرفته شده‌اند.`,
    targetAmountToman: 15_000_000n,
    isFeatured: true,
    sortOrder: 4,
    needs: [
      {
        titleFa: "بسته میان‌وعده هفتگی",
        quantity: 40,
        unitPriceEstimateToman: 280_000n,
      },
      {
        titleFa: "آب‌میوه یا شیر پاکتی",
        quantity: 40,
        unitPriceEstimateToman: 65_000n,
      },
      {
        titleFa: "هزینه توزیع",
        quantity: 1,
        unitPriceEstimateToman: 1_200_000n,
      },
    ],
  },
];

/** Remove demo / fake progress so the public site starts at zero. */
async function clearDemoProgress() {
  await prisma.gatewayCallbackLog.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.impactRecordMedia.deleteMany();
  await prisma.impactRecord.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.statsSnapshot.deleteMany();
  await prisma.beneficiary.deleteMany();
}

async function upsertCampaign(seed: CampaignSeed) {
  const campaign = await prisma.campaign.upsert({
    where: { slug: seed.slug },
    update: {
      titleFa: seed.titleFa,
      summaryFa: seed.summaryFa,
      storyFa: seed.storyFa,
      targetAmountToman: seed.targetAmountToman,
      collectedAmountToman: 0n,
      donorCount: 0,
      status: "PUBLISHED",
      publishedAt: new Date(),
      completedAt: null,
      isFeatured: seed.isFeatured,
      sortOrder: seed.sortOrder,
      seoTitle: `${seed.titleFa} | ONE GOOD`,
      seoDescription: seed.summaryFa,
    },
    create: {
      slug: seed.slug,
      titleFa: seed.titleFa,
      summaryFa: seed.summaryFa,
      storyFa: seed.storyFa,
      targetAmountToman: seed.targetAmountToman,
      collectedAmountToman: 0n,
      donorCount: 0,
      status: "PUBLISHED",
      publishedAt: new Date(),
      isFeatured: seed.isFeatured,
      sortOrder: seed.sortOrder,
      seoTitle: `${seed.titleFa} | ONE GOOD`,
      seoDescription: seed.summaryFa,
    },
  });

  await prisma.campaignNeedItem.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.campaignNeedItem.createMany({
    data: seed.needs.map((n) => ({
      campaignId: campaign.id,
      titleFa: n.titleFa,
      quantity: n.quantity,
      unitPriceEstimateToman: n.unitPriceEstimateToman,
      note: n.note ?? null,
    })),
  });

  return campaign;
}

async function main() {
  await clearDemoProgress();

  // Zero any leftover campaigns not in catalog
  await prisma.campaign.updateMany({
    data: {
      collectedAmountToman: 0n,
      donorCount: 0,
      completedAt: null,
    },
  });

  const passwordHash = await argon2.hash("ChangeMeOwner!234");
  const owner = await prisma.admin.upsert({
    where: { email: "owner@hafez.local" },
    update: {},
    create: {
      email: "owner@hafez.local",
      name: "مدیر ONE GOOD",
      passwordHash,
      role: "OWNER",
      totpEnabled: false,
    },
  });

  const managerHash = await argon2.hash("ChangeMeManager!234");
  await prisma.admin.upsert({
    where: { email: "manager@hafez.local" },
    update: {},
    create: {
      email: "manager@hafez.local",
      name: "مدیر کمپین",
      passwordHash: managerHash,
      role: "CAMPAIGN_MANAGER",
      totpEnabled: false,
    },
  });

  for (const c of campaigns) {
    await upsertCampaign(c);
  }

  // Legacy slug → same zero campaign
  const main = campaigns[0]!;
  await prisma.campaign.upsert({
    where: { slug: "lavazem-tahrir" },
    update: {
      titleFa: main.titleFa,
      summaryFa: main.summaryFa,
      storyFa: main.storyFa,
      targetAmountToman: main.targetAmountToman,
      collectedAmountToman: 0n,
      donorCount: 0,
      status: "PUBLISHED",
      publishedAt: new Date(),
      completedAt: null,
      isFeatured: false,
      sortOrder: 99,
    },
    create: {
      slug: "lavazem-tahrir",
      titleFa: main.titleFa,
      summaryFa: main.summaryFa,
      storyFa: main.storyFa,
      targetAmountToman: main.targetAmountToman,
      collectedAmountToman: 0n,
      donorCount: 0,
      status: "PUBLISHED",
      publishedAt: new Date(),
      isFeatured: false,
      sortOrder: 99,
    },
  });

  console.log("Seeded clean ONE GOOD start:");
  console.log("- campaigns with prices (0 collected, 0 donors)");
  console.log("- cleared donations, expenses, ledger, impact, testimonials, stats");
  console.log("- owner:", owner.email, "/ ChangeMeOwner!234");
  console.log("Change admin passwords immediately on production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
