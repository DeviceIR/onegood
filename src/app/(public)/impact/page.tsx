import { PageHeader } from "@/components/PageHeader";
import { JalaliDate } from "@/components/JalaliDate";
import { MediaImage } from "@/components/media/MediaImage";
import { getPublicImpactGallery } from "@/server/media/queries";
import { buildPageMetadata } from "@/lib/seo";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";

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
      <PageHeader
        title="اثر واقعی کمک‌ها"
        subtitle="پول تبدیل به وسیله، بسته، و لحظهٔ واقعی می‌شود — با حفظ کرامت."
      />
      <div className="mb-8">
        <MotionLink href="/impact/videos" className={motionLinkClass("ghost")}>
          ویدیوها
        </MotionLink>
      </div>
      {records.length === 0 ? (
        <p className="text-muted">به‌زودی تصاویر و گزارش اثر اینجا می‌آید.</p>
      ) : (
        <Stagger as="ul" className="grid gap-8 md:grid-cols-2">
          {records.map((r) => {
            const first = r.media[0]?.media;
            return (
              <FadeItem
                key={r.id}
                as="li"
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 pb-0 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.3)]"
              >
                {first && first.visibility === "PUBLIC" ? (
                  <div className="aspect-[4/3] overflow-hidden bg-border">
                    <MediaImage
                      media={first}
                      preferredWidth={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="text-sm text-muted">{r.campaign.titleFa}</p>
                  <h3 className="mt-1 text-lg font-medium">{r.itemsSummaryFa}</h3>
                  <p className="mt-2 text-muted">{r.publicDescriptionFa}</p>
                  <JalaliDate
                    date={r.deliveredAt}
                    className="mt-2 block text-sm text-muted"
                  />
                </div>
              </FadeItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
