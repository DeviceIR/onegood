import Link from "next/link";
import { PaymentStatusBanner } from "@/features/donations/PaymentStatus";

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
      <Link
        href="/campaigns"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-accent px-5 text-accent-foreground"
      >
        بازگشت به کمک‌ها
      </Link>
    </PaymentStatusBanner>
  );
}
