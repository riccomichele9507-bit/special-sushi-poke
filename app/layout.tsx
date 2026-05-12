import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { restaurant } from "@/data/restaurant";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif-jp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://special-sushi-poke.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${restaurant.name} — ${restaurant.tagline}`,
    template: `%s — ${restaurant.name}`,
  },
  description: `Sushi e Poke d'asporto a Bari, ${restaurant.address.fullAddress}. Ordina online il tuo asporto: poke bowls, special rolls, sashimi e uramaki.`,
  keywords: ["sushi Bari", "poke Bari", "sushi asporto Bari", "poke asporto Bari", "Special Sushi Poke", "Via Petroni"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    title: `${restaurant.name} — ${restaurant.tagline}`,
    description: `Sushi e Poke d'asporto a Bari. Menu navigabile, ordina e ritira in 30 minuti.`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${notoSerifJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-ink text-paper">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          toastOptions={{
            classNames: {
              toast: "!bg-ink !text-paper !border !border-gold/20 !backdrop-blur-xl",
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
