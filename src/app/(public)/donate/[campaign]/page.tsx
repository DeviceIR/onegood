import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import { DonationForm } from "@/features/donations/DonationForm";
import { DonateActionJsonLd } from "@/components/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ campaign: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campaign: slug } = await params;
  try {
    const c = await prisma.campaign.findFirst({
      where: { slug, status: { in: ["PUBLISHED", "COMPLETED"] } },
      select: { titleFa: true, summaryFa: true, slug: true },
    });
    if (!c) return { title: "کمک" };
    return buildPageMetadata({
      title: `مشارکت در ${c.titleFa}`,
      description: c.summaryFa,
      path: `/donate/${c.slug}`,
    });
  } catch {
    return { title: "کمک" };
  }
}

export default async function DonatePage({ params }: Props) {
  const { campaign: slug } = await params;
  let c = null;
  try {
    c = await prisma.campaign.findFirst({
      where: { slug, status: { in: ["PUBLISHED", "COMPLETED"] } },
    });
  } catch {
    notFound();
  }
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <DonateActionJsonLd
        name={`کمک به ${c.titleFa}`}
        url={absoluteUrl(`/donate/${c.slug}`)}
        description={c.summaryFa}
      />
      <h1 className="text-2xl font-semibold">مشارکت در {c.titleFa}</h1>
      <p className="mt-2 text-sm text-muted">{c.summaryFa}</p>
      <div className="mt-8">
        <DonationForm campaignId={c.id} campaignSlug={c.slug} />
      </div>
    </div>
  );
}
