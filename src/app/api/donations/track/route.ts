import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim();
  if (!ref) return NextResponse.json({ error: "کد لازم است" }, { status: 400 });

  const donation = await prisma.donation.findUnique({
    where: { referenceCode: ref },
    include: { campaign: { select: { titleFa: true } } },
  });
  if (!donation) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  return NextResponse.json({
    campaignTitle: donation.campaign.titleFa,
    amountToman: donation.amountToman.toString(),
    verifiedAt: donation.verifiedAt,
    createdAt: donation.createdAt,
  });
}
