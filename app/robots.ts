import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://specialsushipokebari.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Aree private/transazionali: fuori dall'indice + niente spreco crawl budget.
        disallow: [
          "/checkout",
          "/account",
          "/admin",
          "/login",
          "/signup",
          "/auth",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
