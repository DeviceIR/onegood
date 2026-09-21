import { PageHeader } from "@/components/PageHeader";
import { LazyVideo } from "@/components/media/LazyVideo";
import { getPublicVideos } from "@/server/media/queries";
import { buildPageMetadata } from "@/lib/seo";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";

export const metadata = buildPageMetadata({
  title: "ویدیوها",
  description: "ویدیوهای فعالیت بدون پخش خودکار صدا و با بارگذاری تنبل.",
  path: "/impact/videos",
});

export default async function VideosPage() {
  let videos: Awaited<ReturnType<typeof getPublicVideos>> = [];
  try {
    videos = await getPublicVideos();
  } catch {
    videos = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="ویدیوهای فعالیت"
        subtitle="پخش خودکار با صدا نداریم؛ بارگذاری تنبل با کلیک کاربر."
      />
      {videos.length === 0 ? (
        <p className="text-muted">ویدیویی منتشر نشده است.</p>
      ) : (
        <Stagger as="ul" className="grid gap-8 md:grid-cols-2">
          {videos.map((v) => (
            <FadeItem key={v.id} as="li">
              <LazyVideo
                src={v.src}
                mimeType={v.mimeType}
                title={v.altTextFa}
                poster={v.blurDataUrl}
              />
              <p className="mt-3 font-medium">{v.altTextFa ?? "ویدیو"}</p>
            </FadeItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
