import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "داوطلبی",
  description: "ثبت‌نام برای همکاری داوطلبانه با ONE GOOD — حافظ خوبی‌ها.",
  path: "/volunteer",
});

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
