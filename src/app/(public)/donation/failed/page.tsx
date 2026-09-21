import { PaymentStatusBanner } from "@/features/donations/PaymentStatus";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";

export default async function DonationFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <PaymentStatusBanner variant="failed" title="پرداخت کامل نشد">
      <p>
        ممکن است پرداخت لغو شده باشد یا تأیید نشده باشد. می‌توانید دوباره تلاش
        کنید — هر تلاش یک پرداخت جدید می‌سازد و authority قبلی دوباره استفاده
        نمی‌شود.
      </p>
      {reason ? <p className="mt-2 text-xs">کد: {reason}</p> : null}
      <MotionLink
        href="/campaigns"
        className={`${motionLinkClass("primary")} mt-8`}
      >
        بازگشت به کمک‌ها
      </MotionLink>
    </PaymentStatusBanner>
  );
}
