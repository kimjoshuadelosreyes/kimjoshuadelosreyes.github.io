import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/site";

const description = "A searchable directory of projects: websites, AI workflow automations and client builds, with the stack used on each.";

export const metadata: Metadata = {
  title: "Project archive",
  description,
  alternates: { canonical: "/archive/" },
  openGraph: { title: "Project archive", description, url: "/archive/" },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Project archive", path: "/archive/" }])} />
      {children}
    </>
  );
}
