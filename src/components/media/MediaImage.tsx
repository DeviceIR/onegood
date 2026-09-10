import { publicMediaUrl } from "@/server/storage/s3";

type Variant = { width: number; storageKey: string; format: string };

export function mediaDisplayUrl(
  media: {
    bucket: string;
    storageKey: string;
    variants?: Variant[];
  },
  preferredWidth = 800,
) {
  const variants = media.variants ?? [];
  const sorted = [...variants].sort(
    (a, b) =>
      Math.abs(a.width - preferredWidth) - Math.abs(b.width - preferredWidth),
  );
  const pick = sorted[0];
  if (pick) return publicMediaUrl(media.bucket, pick.storageKey);
  return publicMediaUrl(media.bucket, media.storageKey);
}

export function MediaImage({
  media,
  alt,
  preferredWidth = 800,
  className,
}: {
  media: {
    bucket: string;
    storageKey: string;
    altTextFa?: string | null;
    blurDataUrl?: string | null;
    width?: number | null;
    height?: number | null;
    variants?: Variant[];
  };
  alt?: string;
  preferredWidth?: number;
  className?: string;
}) {
  const src = mediaDisplayUrl(media, preferredWidth);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? media.altTextFa ?? ""}
      loading="lazy"
      decoding="async"
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      className={className}
      style={
        media.blurDataUrl
          ? { backgroundImage: `url(${media.blurDataUrl})`, backgroundSize: "cover" }
          : undefined
      }
    />
  );
}
