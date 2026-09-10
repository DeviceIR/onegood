import type { Donation } from "@prisma/client";

export type PublicDonationView = {
  id: string;
  displayName: string;
  displayAmount: string | null;
  amountHidden: boolean;
  message: string | null;
  campaignTitle?: string;
  createdAt: Date;
  referenceCode?: never;
};

export function serializeDonationPublic(
  d: Pick<
    Donation,
    | "id"
    | "donorDisplayName"
    | "showName"
    | "showAmount"
    | "message"
    | "createdAt"
    | "publicStatus"
  > & { amountToman: bigint | number; campaign?: { titleFa: string } },
  formatAmount: (n: bigint | number) => string,
): PublicDonationView | null {
  if (d.publicStatus === "HIDDEN" || d.publicStatus === "PENDING_REVIEW") {
    return null;
  }
  return {
    id: d.id,
    displayName:
      d.showName && d.donorDisplayName ? d.donorDisplayName : "یک همراه",
    displayAmount: d.showAmount ? formatAmount(d.amountToman) : null,
    amountHidden: !d.showAmount,
    message: d.message,
    campaignTitle: d.campaign?.titleFa,
    createdAt: d.createdAt,
  };
}
