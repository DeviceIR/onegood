import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "تماس",
  description: "ارتباط با تیم ONE GOOD — حافظ خوبی‌ها.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
