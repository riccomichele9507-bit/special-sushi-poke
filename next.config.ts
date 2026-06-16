import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // node-thermal-printer ha require dinamici (interfacce stampante opzionali):
  // tenuto esterno al bundle server, lo usiamo solo per generare il buffer StarLine.
  serverExternalPackages: ["node-thermal-printer"],
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
