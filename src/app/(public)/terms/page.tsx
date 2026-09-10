import { buildPageMetadata, SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "شرایط استفاده",
  description: `شرایط استفاده از وب‌سایت و خدمات ${SITE_NAME_EN}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-12 leading-relaxed">
      <h1 className="text-3xl font-bold">شرایط استفاده</h1>
      <p className="text-muted">
        با استفاده از وب‌سایت {SITE_NAME_FA} این شرایط را می‌پذیرید.
      </p>
      <h2 className="text-xl font-semibold">ماهیت خدمات</h2>
      <p>
        این سامانه امکان مشارکت در تأمین اقلام و بسته‌های حمایتی مشخص (مانند
        لوازم تحصیلی، پوشاک و تغذیه ساده) را فراهم می‌کند. قیمت‌ها برآورد بازار
        هستند و هزینه نهایی بر اساس فاکتور خرید در شفافیت مالی ثبت می‌شود.
      </p>
      <h2 className="text-xl font-semibold">پرداخت</h2>
      <p>
        پرداخت از طریق درگاه معتبر انجام می‌شود. پس از تأیید موفق، مبلغ در دفترکل
        ثبت می‌گردد. کد پیگیری را نگه دارید.
      </p>
      <h2 className="text-xl font-semibold">ممنوعیت‌ها</h2>
      <p>
        جعل هویت، سوءاستفاده از سامانه، انتشار محتوای بدون رضایت، و هرگونه اقدام
        خلاف قانون ممنوع است.
      </p>
      <p className="text-sm text-muted">
        جمع‌آوری عمومی کمک منوط به تأیید الزامات قانونی و فعال‌سازی درگاه است.
      </p>
    </div>
  );
}
