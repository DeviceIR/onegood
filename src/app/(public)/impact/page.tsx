import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { JalaliDate } from "@/components/JalaliDate";
import { MediaImage } from "@/components/media/MediaImage";
import { getPublicImpactGallery } from "@/server/media/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "اثر کمک‌ها",
  description: "گزارش تصویری اثر کمک‌ها با حفظ کرامت ذی‌نفعان.",
  path: "/impact",
});

export default async function ImpactPage() {
  let records: Awaited<ReturnType<typeof getPublicImpactGallery>> = [];
  try {
    records = await getPublicImpactGallery();
  } catch {
    records = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        title="اثر واقعی کمک‌ها"
        subtitle="پول تبدیل به وسیله، بسته، و لحظهٔ واقعی می‌شود — با حفظ کرامت."
      />
      <div className="mb-8">
        <Link href="/impact/videos" className="text-accent">
          ویدیوها
        </Link>
      </div>
      {records.length === 0 ? (
        <p className="text-muted">به‌زودی تصاویر و گزارش اثر اینجا می‌آید.</p>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2">
          {records.map((r) => {
            const first = r.media[0]?.media;
            return (
              <li key={r.id} className="border-b border-border pb-6">
                {first && first.visibility === "PUBLIC" ? (
                  <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-border">
                    <MediaImage
                      media={first}
                      preferredWidth={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-sm text-muted">{r.campaign.titleFa}</p>
                <h3 className="mt-1 text-lg font-medium">{r.itemsSummaryFa}</h3>
                <p className="mt-2 text-muted">{r.publicDescriptionFa}</p>
                <JalaliDate
                  date={r.deliveredAt}
                  className="mt-2 block text-sm text-muted"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
