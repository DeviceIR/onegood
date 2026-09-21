import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import {
  SITE_EXPRESSION_FA,
  SITE_NAME_EN,
  SITE_NAME_FA,
  SITE_TAGLINE_EN,
  SITE_TAGLINE_FA,
  SITE_TITLE_DEFAULT,
  siteUrl,
} from "@/lib/seo";
import "@/lib/bigint-json";
import "@/styles/globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: `%s | ${SITE_NAME_EN}`,
  },
  description: SITE_TAGLINE_FA,
  applicationName: SITE_NAME_EN,
  keywords: [
    "خیریه",
    "کمک مالی",
    "شفافیت",
    "دانش‌آموز",
    SITE_NAME_FA,
    SITE_EXPRESSION_FA,
    SITE_NAME_EN,
  ],
  authors: [{ name: SITE_NAME_FA }],
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: `${SITE_TAGLINE_FA} ${SITE_TAGLINE_EN}`,
    locale: "fa_IR",
    type: "website",
    siteName: SITE_TITLE_DEFAULT,
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_TAGLINE_FA,
  },
  alternates: {
    canonical: siteUrl(),
    languages: { "fa-IR": siteUrl() },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
