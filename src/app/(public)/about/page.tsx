import { buildPageMetadata, SITE_EXPRESSION_FA, SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";

export const metadata = buildPageMetadata({
  title: "درباره ما",
  description: `معرفی ${SITE_NAME_EN} (${SITE_NAME_FA}): حفظ و گسترش خوبی‌های کوچک با شفافیت، قیمت واقعی و کرامت.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 leading-relaxed">
      <PageHeader
        kicker={`${SITE_NAME_EN} · ${SITE_EXPRESSION_FA}`}
        title={`درباره ${SITE_NAME_FA}`}
      />

      <Stagger className="space-y-4">
        <FadeItem>
          <p className="text-muted">
            {SITE_NAME_EN} از یک کمک واقعی شروع شد: مادر و فرزندی خواستند برای دو
            دانش‌آموز ابتدایی که لوازم ساده مدرسه نداشتند، کیف و دفتر و مداد بخرند.
            بعد دوستان دیگری هم خواستند کمک کنند — و سؤال ساده‌ای پیش آمد:
          </p>
        </FadeItem>
        <FadeItem>
          <p className="font-medium">
            اگر یک خوبی کوچک منظم شود، می‌تواند به خیلی‌ها برسد؟
          </p>
        </FadeItem>
        <FadeItem>
          <h2 className="mt-6 text-xl font-semibold">چه می‌کنیم؟</h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-muted">
            <li>کمپین‌های مشخص با اقلام و قیمت واقعی بازار</li>
            <li>خرید و تحویل وسایل ضروری (لوازم تحصیلی، پوشاک، تغذیه ساده)</li>
            <li>ثبت شفاف هزینه‌ها و اثر کمک‌ها</li>
            <li>حفظ حریم خصوصی کودکان و خانواده‌ها</li>
          </ul>
        </FadeItem>
        <FadeItem>
          <h2 className="mt-6 text-xl font-semibold">چه نمی‌کنیم؟</h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-muted">
            <li>بهره‌کشی احساسی از تصویر کودکان</li>
            <li>انتشار نام کامل، آدرس یا مدرسه در بخش عمومی</li>
            <li>وعده حل همه مشکلات جهان</li>
          </ul>
        </FadeItem>
        <FadeItem>
          <p>
            فلسفه ما: نمی‌توان همه بدی‌ها را از بین برد؛ اما می‌توان خوبی‌ها را حفظ
            کرد — حتی اگر سهم ما فقط یک کیف، یک مداد، یا یک لبخند باشد.
          </p>
        </FadeItem>
        <FadeItem className="flex flex-wrap gap-3 pt-4">
          <MotionLink href="/packages" className={motionLinkClass("primary")}>
            مشاهده بسته‌ها و قیمت‌ها
          </MotionLink>
          <MotionLink href="/campaigns" className={motionLinkClass("secondary")}>
            کمپین‌های فعال
          </MotionLink>
        </FadeItem>
      </Stagger>
    </div>
  );
}
