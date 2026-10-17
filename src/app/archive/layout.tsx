import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, SITE } from "@/lib/site";

const description = "A searchable directory of projects: websites, AI workflow automations and client builds, with the stack used on each.";

export const metadata: Metadata = {
  title: "Project archive",
  description,
  alternates: { canonical: "/archive/" },
  openGraph: {
    type: "website",
    title: "Project archive",
    description,
    url: "/archive/",
    siteName: `${SITE.name} — ${SITE.brand}`,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Project archive — Kim Joshua",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project archive",
    description,
    images: ["/opengraph-image.png"],
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Project archive", path: "/archive/" }])} />
      {children}
    </>
  );
}
