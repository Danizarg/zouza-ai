import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack infers the workspace root from the nearest lockfile, and a
    // stray ~/package-lock.json made it pick the home directory. Pin it here.
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage (the `listing-photos` bucket): public, signed and
        // transformed object URLs all live under /storage/v1/.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
};

export default nextConfig;
