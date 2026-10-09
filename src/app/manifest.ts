import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Written once at build time: the site is a static export.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.brand}`,
    short_name: SITE.brand,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f9",
    theme_color: "#fa5d19",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
