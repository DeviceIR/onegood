import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SkipToContent } from "@/components/SkipToContent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="pt-[4.75rem]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
