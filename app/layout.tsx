import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { restaurant } from "@/data/restaurant";
import { getMenu } from "@/lib/data/queries";
import { MenuRegistryProvider } from "@/components/menu-registry-provider";
import { CustomerLayoutShell } from "@/components/customer-layout-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://specialsushipokebari.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${restaurant.name} — ${restaurant.tagline}`,
    template: `%s — ${restaurant.name}`,
  },
  description: `Sushi e Poke a Bari, ${restaurant.address.fullAddress}. Consegna gratuita a domicilio.`,
  keywords: ["sushi Bari", "poke Bari", "sushi delivery Bari", "poke delivery Bari", "Special Sushi Poke", "Via Petroni"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    title: `${restaurant.name} — ${restaurant.tagline}`,
    description: `Sushi e Poke a Bari. Menu navigabile, consegna gratuita.`,
    siteName: restaurant.name,
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: `${restaurant.name} — ${restaurant.tagline}`,
      },
    ],
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  image: `${siteUrl}/og/og-default.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: restaurant.address.street,
    addressLocality: restaurant.address.city,
    postalCode: restaurant.address.postalCode,
    addressCountry: restaurant.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: restaurant.coords.lat,
    longitude: restaurant.coords.lng,
  },
  telephone: restaurant.phone,
  url: siteUrl,
  servesCuisine: restaurant.cuisine,
  priceRange: restaurant.priceRange,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetcha il menu dal DB Supabase per idratare il cart-store registry.
  // Fallback automatico a data/menu.ts se il DB non risponde (zero downtime).
  let menu;
  try {
    menu = await getMenu();
  } catch {
    const { menu: staticMenu } = await import("@/data/menu");
    menu = staticMenu;
  }

  return (
    <html
      lang="it"
      className={`${inter.variable} ${notoSerifJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink">
        <MenuRegistryProvider initialMenu={menu}>
          <CustomerLayoutShell>{children}</CustomerLayoutShell>
        </MenuRegistryProvider>
        <Toaster
          position="top-center"
          theme="light"
          richColors
          toastOptions={{
            classNames: {
              toast: "!bg-paper !text-ink !border !border-bamboo/30 !backdrop-blur-xl",
            },
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </body>
    </html>
  );
}
