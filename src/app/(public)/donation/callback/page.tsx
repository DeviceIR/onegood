import { redirect } from "next/navigation";
import { verifyAndCommitPayment } from "@/server/payments/donation-service";

export default async function DonationCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ Authority?: string; Status?: string }>;
}) {
  const sp = await searchParams;
  const authority = sp.Authority ?? "";
  const status = sp.Status ?? "NOK";

  if (!authority) {
    redirect("/donation/failed?reason=missing");
  }

  const result = await verifyAndCommitPayment(authority, status);
  if (result.ok && result.referenceCode) {
    redirect(`/donation/success?ref=${encodeURIComponent(result.referenceCode)}`);
  }
  const reason = result.ok ? "missing_ref" : result.reason;
  redirect(`/donation/failed?reason=${encodeURIComponent(reason)}`);
}
