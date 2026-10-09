import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./globals.css";
import { WordmarkSprite } from "@/components/Wordmark";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: `${SITE.name} — ${SITE.brand}`,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${SITE.name} — ${SITE.brand}`,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
    // The image itself comes from app/opengraph-image.png and its .alt.txt.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Phone numbers and addresses in the copy are not links; stop iOS guessing.
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#f9f9f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /* The two faces the hero is set in. Preloaded so the headline does not wait
     for the stylesheet to be parsed before its font is even requested. */
  preload("/fonts/tr3a-medium.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/ppneue-book.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang="en">
      {/* `suppressHydrationWarning` is here for browser extensions, not for us.
          ColorZilla injects `cz-shortcut-listen` onto <body> before React
          hydrates, and React reports that as a hydration mismatch even though the
          server output was correct — its own error text lists "a browser
          extension installed which messes with the HTML" as a cause. The prop
          silences mismatches on THIS element's own attributes only, so a genuine
          mismatch anywhere in the tree still reports. */}
      <body className="bg-canvas font-body text-ink antialiased" suppressHydrationWarning>
        <WordmarkSprite />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
