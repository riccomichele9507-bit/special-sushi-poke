import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // node-thermal-printer ha require dinamici (interfacce stampante opzionali);
  // @napi-rs/canvas è un modulo nativo (.node) usato per rendere la comanda PNG.
  // Entrambi tenuti esterni al bundle server.
  serverExternalPackages: ["node-thermal-printer", "@napi-rs/canvas"],
  images: {
    // Solo WebP (niente AVIF): dimezza le versioni generate per ogni immagine
    // → meno "cache writes" su Vercel. WebP è supportato da tutti i browser.
    formats: ["image/webp"],
    // Le foto dei piatti non cambiano quasi mai: cache 31 giorni → ogni immagine
    // viene ottimizzata UNA volta e riusata, invece di essere riscritta spesso.
    minimumCacheTTL: 2678400,
    qualities: [60, 75, 90],
    // Meno breakpoint = meno varianti per immagine (mobile-first: bastano questi).
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [48, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lbdwvgcnwvkisrjqremx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
