import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";
import { buildPageMetadata, SITE_EXPRESSION_FA, SITE_NAME_EN } from "@/lib/seo";
import { toPersianDigits } from "@/lib/money";

export const metadata = buildPageMetadata({
  title: "بسته‌ها و قیمت‌ها",
  description:
    "فهرست بسته‌های حمایتی ONE GOOD با اقلام مشخص و قیمت‌های واقعی بازار برای مشارکت شفاف.",
  path: "/packages",
});

/** Static catalog for ZarinPal / public review — prices aligned with seed campaigns. */
const packages = [
  {
    id: "school-kit",
    title: "بسته لوازم تحصیلی",
    brand: `یک خوبی / لوازم تحصیلی`,
    href: "/campaigns/yek-khoobi-lavazem-tahrir",
    priceToman: 1_345_000n,
    items: [
      { name: "کیف مدرسه استاندارد", price: 950_000n },
      { name: "ست دفتر ۴۰ برگ", price: 180_000n },
      { name: "مداد و خودکار", price: 120_000n },
      { name: "جامدادی و پاک‌کن و تراش", price: 95_000n },
    ],
    note: "قیمت هر بسته برای یک دانش‌آموز؛ بر اساس برآورد بازار.",
  },
  {
    id: "back-to-school",
    title: "بسته بازگشت به مدرسه",
    brand: `یک خوبی / بازگشت به مدرسه`,
    href: "/campaigns/yek-khoobi-bazgasht-be-madreseh",
    priceToman: 2_550_000n,
    items: [
      { name: "کفش ورزشی ساده", price: 1_450_000n },
      { name: "ست لباس فرم / روپوش", price: 980_000n },
      { name: "جوراب و اقلام مکمل", price: 120_000n },
    ],
    note: "برای شروع سال تحصیلی؛ بدون هزینه‌های غیرضروری.",
  },
  {
    id: "winter",
    title: "بسته پوشش زمستانی",
    brand: `یک خوبی / پوشش زمستانی`,
    href: "/campaigns/yek-khoobi-poshesh-zemestan",
    priceToman: 1_570_000n,
    items: [
      { name: "کاپشن زمستانی کودک", price: 1_350_000n },
      { name: "دستکش و کلاه", price: 220_000n },
    ],
    note: "پوشاک گرم ضروری برای فصل سرما.",
  },
  {
    id: "food",
    title: "بسته میان‌وعده مدرسه",
    brand: `یک خوبی / حمایت تغذیه`,
    href: "/campaigns/yek-khoobi-ghaza-ye-madrese",
    priceToman: 345_000n,
    items: [
      { name: "بسته میان‌وعده هفتگی", price: 280_000n },
      { name: "شیر یا آب‌میوه پاکتی", price: 65_000n },
    ],
    note: "حمایت تغذیه سبک و سالم برای یک هفته.",
  },
];

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader
        kicker={SITE_NAME_EN}
        title="بسته‌ها و قیمت‌ها"
        subtitle={`خدمات قابل ارائه ${SITE_EXPRESSION_FA} به‌صورت بسته‌های مشخص با اقلام و قیمت واقعی است. می‌توانید یک بسته کامل یا بخشی از مبلغ یک کمپین را تأمین کنید.`}
      />

      <Stagger as="ul" className="mt-2 space-y-8">
        {packages.map((pkg) => (
          <FadeItem
            key={pkg.id}
            as="li"
            className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.3)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-accent">{pkg.brand}</p>
                <h2 className="mt-1 text-xl font-semibold">{pkg.title}</h2>
                <p className="mt-2 text-sm text-muted">{pkg.note}</p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted">قیمت تقریبی هر بسته</p>
                <p className="mt-1 text-2xl font-semibold">
                  <Money amount={pkg.priceToman} />
                </p>
              </div>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 text-start font-medium">قلم</th>
                  <th className="py-2 text-end font-medium">قیمت</th>
                </tr>
              </thead>
              <tbody>
                {pkg.items.map((item) => (
                  <tr key={item.name} className="border-b border-border/70">
                    <td className="py-2.5">{item.name}</td>
                    <td className="py-2.5 text-end">
                      <Money amount={item.price} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <MotionLink href={pkg.href} className={`${motionLinkClass("primary")} mt-6`}>
              مشاهده کمپین و مشارکت
            </MotionLink>
          </FadeItem>
        ))}
      </Stagger>

      <section className="mt-12 rounded-2xl border border-border bg-surface-soft/80 p-6">
        <h2 className="text-lg font-semibold">مبالغ پیشنهادی مشارکت</h2>
        <p className="mt-2 text-sm text-muted">
          می‌توانید هر مبلغی را انتخاب کنید. این مقادیر فقط راهنما هستند:
        </p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          {[200_000, 500_000, 1_000_000, 2_000_000].map((n) => (
            <li
              key={n}
              className="rounded-full border border-border bg-card px-4 py-2"
            >
              {toPersianDigits(n.toLocaleString("en-US"))} تومان
            </li>
          ))}
        </ul>
        <MotionLink
          href="/campaigns"
          className={`${motionLinkClass("ghost")} mt-6`}
        >
          رفتن به فهرست کمپین‌ها
        </MotionLink>
      </section>
    </div>
  );
}
