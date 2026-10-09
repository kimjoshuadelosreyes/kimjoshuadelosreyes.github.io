import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WordmarkSprite } from "@/components/Wordmark";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Kim Joshua \u2014 KIM\u00ae \u00b7 Websites & AI Automation",
  description:
    "Kim Joshua designs and builds fast websites, then wires the AI agents and automations that keep the business behind them moving.",
};

export const viewport: Viewport = {
  themeColor: "#f9f9f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
