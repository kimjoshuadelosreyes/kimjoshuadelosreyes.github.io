import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Exported as 404.html, which is what GitHub Pages serves for a missing path. */
export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="shell flex min-h-[70svh] flex-col items-start justify-center pt-[76px]">
        <p className="eyebrow">404</p>
        <h1 className="h2 mt-4">That page is not here.</h1>
        <p className="lede mt-5">It may have moved, or the link may be wrong.</p>
        <Link href="/" className="btn btn--primary mt-8">
          Back to the start
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
