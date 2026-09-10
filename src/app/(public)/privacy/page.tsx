import { buildPageMetadata, SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "حریم خصوصی",
  description: `سیاست حریم خصوصی اهداکنندگان و ذی‌نفعان در ${SITE_NAME_EN}.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-12 leading-relaxed">
      <h1 className="text-3xl font-bold">حریم خصوصی</h1>
      <p className="text-muted">
        {SITE_NAME_FA} ({SITE_NAME_EN}) اطلاعات شما را فقط برای ارائه خدمات کمک،
        شفافیت و پشتیبانی استفاده می‌کند.
      </p>
      <h2 className="text-xl font-semibold">اطلاعات اهداکننده</h2>
      <p>
        نمایش نام و مبلغ کمک فقط با رضایت صریح شما انجام می‌شود. در غیر این صورت
        به‌صورت «یک همراه» و در صورت مخفی بودن مبلغ، «مبلغ نامشخص» نمایش داده
        می‌شود.
      </p>
      <h2 className="text-xl font-semibold">اطلاعات کودکان و ذی‌نفعان</h2>
      <p>
        نام کامل، آدرس، شماره تماس و شناسه مدرسه در بخش عمومی منتشر نمی‌شود.
        تصویر یا ویدیوی کودکان فقط با رضایت معتبر قیم و ثبت در سامانه منتشر
        می‌شود.
      </p>
      <h2 className="text-xl font-semibold">نگهداری و حذف</h2>
      <p>
        اطلاعات تماس برای پیگیری و پاسخ‌گویی نگهداری می‌شود و برای تبلیغات ثالث
        فروخته نمی‌شود. برای درخواست اصلاح یا حذف داده از صفحه تماس پیام بفرستید.
      </p>
    </div>
  );
}
