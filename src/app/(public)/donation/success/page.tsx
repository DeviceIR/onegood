import {
  DonationReference,
  PaymentStatusBanner,
} from "@/features/donations/PaymentStatus";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";
import { ShareActions } from "@/components/ShareActions";
import { absoluteUrl } from "@/lib/seo";

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
      <div className="mt-8 flex justify-center">
        <ShareActions
          url={absoluteUrl("/campaigns")}
          title="من در ONE GOOD در یک خوبی مشارکت کردم"
        />
      </div>
      <div className="mt-8 flex justify-center gap-4 text-foreground">
        <MotionLink href="/campaigns" className={motionLinkClass("ghost")}>
          کمک‌های دیگر
        </MotionLink>
        <MotionLink href="/donation/track" className={motionLinkClass("ghost")}>
          پیگیری
        </MotionLink>
      </div>
    </PaymentStatusBanner>
  );
}
