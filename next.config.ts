import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // GitHub Pages serves files, not a server: `next build` writes the whole site
  // to `out/`. Trailing slashes make every route a folder with an index.html,
  // which is the shape a static host resolves without any rewrite rules.
  // Only for the real build: under `next dev`, export mode turns an unknown
  // /work/<id> into a 500 instead of the 404 page.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
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
