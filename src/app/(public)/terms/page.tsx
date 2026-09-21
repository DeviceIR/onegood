import { PageHeader } from "@/components/PageHeader";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";
import { buildPageMetadata, SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "شرایط استفاده",
  description: `شرایط استفاده از وب‌سایت و خدمات ${SITE_NAME_EN}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 leading-relaxed">
      <PageHeader
        title="شرایط استفاده"
        subtitle={`با استفاده از وب‌سایت ${SITE_NAME_FA} این شرایط را می‌پذیرید.`}
      />
      <Stagger className="space-y-5">
        <FadeItem>
          <h2 className="text-xl font-semibold">ماهیت خدمات</h2>
          <p className="mt-2">
            این سامانه امکان مشارکت در تأمین اقلام و بسته‌های حمایتی مشخص (مانند
            لوازم تحصیلی، پوشاک و تغذیه ساده) را فراهم می‌کند. قیمت‌ها برآورد بازار
            هستند و هزینه نهایی بر اساس فاکتور خرید در شفافیت مالی ثبت می‌شود.
          </p>
        </FadeItem>
        <FadeItem>
          <h2 className="text-xl font-semibold">پرداخت</h2>
          <p className="mt-2">
            پرداخت از طریق درگاه معتبر انجام می‌شود. پس از تأیید موفق، مبلغ در دفترکل
            ثبت می‌گردد. کد پیگیری را نگه دارید.
          </p>
        </FadeItem>
        <FadeItem>
          <h2 className="text-xl font-semibold">ممنوعیت‌ها</h2>
          <p className="mt-2">
            جعل هویت، سوءاستفاده از سامانه، انتشار محتوای بدون رضایت، و هرگونه اقدام
            خلاف قانون ممنوع است.
          </p>
        </FadeItem>
        <FadeItem>
          <p className="text-sm text-muted">
            جمع‌آوری عمومی کمک منوط به تأیید الزامات قانونی و فعال‌سازی درگاه است.
          </p>
        </FadeItem>
      </Stagger>
    </div>
  );
}
