import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow the dev server to be reached over 127.0.0.1 as well as localhost.
  // Without this, Next 16 blocks /_next dev resources cross-origin and client
  // hydration silently never happens.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // The portfolio ships its own localized assets; no remote loaders needed.
    unoptimized: true,
  },
};

export default nextConfig;
