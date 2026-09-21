import { ImageResponse } from "next/og";
import { SITE_NAME_EN, SITE_TAGLINE_EN } from "@/lib/seo";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function brandOpenGraphImage(opts?: {
  kicker?: string;
  title?: string;
  subtitle?: string;
}) {
  const kicker = opts?.kicker ?? SITE_NAME_EN;
  const title = opts?.title ?? "Keep the good things going";
  const subtitle = opts?.subtitle ?? SITE_TAGLINE_EN;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #15201c 0%, #1c3d34 48%, #0c7a62 100%)",
          color: "#f4f1ea",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.22em",
            fontWeight: 700,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            marginTop: 18,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 24,
            opacity: 0.88,
            maxWidth: 880,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
