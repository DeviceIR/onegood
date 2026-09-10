import Link from "next/link";
import {
  DonationReference,
  PaymentStatusBanner,
} from "@/features/donations/PaymentStatus";

export default async function DonationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <PaymentStatusBanner variant="success" title="پرداخت تأیید شد">
      <p>از مشارکت شما سپاسگزاریم. کد پیگیری را نگه دارید.</p>
      {ref ? (
        <div className="mt-6">
          <DonationReference code={ref} />
        </div>
      ) : null}
      <div className="mt-8 flex justify-center gap-4 text-foreground">
        <Link href="/campaigns" className="text-accent">
          کمک‌های دیگر
        </Link>
        <Link href="/donation/track">پیگیری</Link>
      </div>
    </PaymentStatusBanner>
  );
}
