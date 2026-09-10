import { NextRequest, NextResponse } from "next/server";
import { reconcilePendingPayments } from "@/server/payments/donation-service";
import { reconcileCampaignAggregates } from "@/server/ledger";
import { getEnv } from "@/server/env";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== getEnv().CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const payments = await reconcilePendingPayments();
  const drifts = await reconcileCampaignAggregates();
  return NextResponse.json({
    payments,
    drifts: drifts.map((d) => ({
      id: d.id,
      expectedCollected: d.expectedCollected.toString(),
      cachedCollected: d.cachedCollected.toString(),
      expectedDonors: d.expectedDonors,
      cachedDonors: d.cachedDonors,
    })),
  });
}
