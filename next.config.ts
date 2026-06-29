import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // node-thermal-printer ha require dinamici (interfacce stampante opzionali);
  // @napi-rs/canvas è un modulo nativo (.node) usato per rendere la comanda PNG.
  // Entrambi tenuti esterni al bundle server.
  serverExternalPackages: ["node-thermal-printer", "@napi-rs/canvas", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
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
