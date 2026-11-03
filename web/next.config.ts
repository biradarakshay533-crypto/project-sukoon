import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lets a phone on the same Wi-Fi use the dev site. Update it if the
  // "Network:" address printed by npm run dev changes.
  allowedDevOrigins: ["192.168.29.191"],
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { hostname: "images.pexels.com", pathname: "/photos/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
