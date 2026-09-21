import { brandOpenGraphImage, ogContentType, ogSize } from "@/lib/og-image";
import { SITE_NAME_FA, SITE_TAGLINE_EN } from "@/lib/seo";

export const alt = `ONE GOOD — ${SITE_NAME_FA}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return brandOpenGraphImage({
    subtitle: SITE_TAGLINE_EN,
  });
}
