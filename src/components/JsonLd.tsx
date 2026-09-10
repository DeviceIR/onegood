import {
  SITE_NAME_EN,
  SITE_NAME_FA,
  SITE_TAGLINE_EN,
  SITE_TAGLINE_FA,
  siteUrl,
} from "@/lib/seo";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE_NAME_FA,
    alternateName: SITE_NAME_EN,
    url: siteUrl(),
    description: `${SITE_TAGLINE_FA} ${SITE_TAGLINE_EN}`,
    areaServed: {
      "@type": "Country",
      name: "Iran",
    },
    inLanguage: "fa",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function DonateActionJsonLd({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name,
    description: description ?? SITE_TAGLINE_FA,
    target: {
      "@type": "EntryPoint",
      urlTemplate: url,
      inLanguage: "fa",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    recipient: {
      "@type": "NGO",
      name: SITE_NAME_FA,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME_FA,
    alternateName: SITE_NAME_EN,
    url: siteUrl(),
    inLanguage: "fa",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/campaigns`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
