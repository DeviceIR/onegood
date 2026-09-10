import { buildPageMetadata, SITE_EXPRESSION_FA, SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildPageMetadata({
  title: "درباره ما",
  description: `معرفی ${SITE_NAME_EN} (${SITE_NAME_FA}): حفظ و گسترش خوبی‌های کوچک با شفافیت، قیمت واقعی و کرامت.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 leading-relaxed">
      <h1 className="text-3xl font-bold">درباره {SITE_NAME_FA}</h1>
      <p className="mt-2 text-sm tracking-[0.18em] text-muted" dir="ltr">
        {SITE_NAME_EN} · {SITE_EXPRESSION_FA}
      </p>

      <p className="mt-6 text-muted">
        {SITE_NAME_EN} از یک کمک واقعی شروع شد: مادر و فرزندی خواستند برای دو
        دانش‌آموز ابتدایی که لوازم ساده مدرسه نداشتند، کیف و دفتر و مداد بخرند.
        بعد دوستان دیگری هم خواستند کمک کنند — و سؤال ساده‌ای پیش آمد:
      </p>
      <p className="mt-4 font-medium">
        اگر یک خوبی کوچک منظم شود، می‌تواند به خیلی‌ها برسد؟
      </p>

      <h2 className="mt-10 text-xl font-semibold">چه می‌کنیم؟</h2>
      <ul className="mt-4 list-disc space-y-2 ps-5 text-muted">
        <li>کمپین‌های مشخص با اقلام و قیمت واقعی بازار</li>
        <li>خرید و تحویل وسایل ضروری (لوازم تحصیلی، پوشاک، تغذیه ساده)</li>
        <li>ثبت شفاف هزینه‌ها و اثر کمک‌ها</li>
        <li>حفظ حریم خصوصی کودکان و خانواده‌ها</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">چه نمی‌کنیم؟</h2>
      <ul className="mt-4 list-disc space-y-2 ps-5 text-muted">
        <li>بهره‌کشی احساسی از تصویر کودکان</li>
        <li>انتشار نام کامل، آدرس یا مدرسه در بخش عمومی</li>
        <li>وعده حل همه مشکلات جهان</li>
      </ul>

      <p className="mt-8">
        فلسفه ما: نمی‌توان همه بدی‌ها را از بین برد؛ اما می‌توان خوبی‌ها را حفظ
        کرد — حتی اگر سهم ما فقط یک کیف، یک مداد، یا یک لبخند باشد.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/packages"
          className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-accent-foreground"
        >
          مشاهده بسته‌ها و قیمت‌ها
        </Link>
        <Link
          href="/campaigns"
          className="inline-flex h-11 items-center rounded-xl border border-border px-5"
        >
          کمپین‌های فعال
        </Link>
      </div>
    </div>
  );
}
