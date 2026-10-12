"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/scroll";

/**
 * Lenis drives the page; GSAP's ticker drives Lenis, and ScrollTrigger listens
 * to Lenis' scroll events. This is the same smoothing model the original uses
 * (Lenis 1.x + ScrollTrigger) rather than ScrollSmoother, so the native scroll
 * position stays authoritative for pinning.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  /* This component lives in the layout, so Lenis outlives a page change and so
     does the scroll target it keeps. Next puts a new page at its top, Lenis then
     carries it back to where the last page was, and on a shorter page that is
     the footer. So each new path starts Lenis again from where the page should
     open: the top, or the section named in the address. */
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const lenis = getLenis();
    if (!lenis) return;
    const land = () => {
      const hash = window.location.hash;
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      lenis.resize();
      lenis.scrollTo(target ?? 0, { immediate: true, force: true });
      ScrollTrigger.refresh();
    };
    land();
    /* And again once the new page has settled: sections above a named one swap
       to their stacked layout just after mount, which moves it. */
    const id = window.requestAnimationFrame(land);
    const late = window.location.hash.length > 1 ? window.setTimeout(land, 450) : 0;
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(late);
    };
  }, [pathname]);

  /* Several sections swap to a shorter stacked layout just after mount, and a
     reader can change the page's height later too (the FAQ, the brief). Scroll
     triggers store their positions when they are built, so one made before
     that settles fires in the wrong place — on a phone the signature at the
     foot of the page never drew. Re-measure whenever the document's height
     actually changes. */
  useEffect(() => {
    let height = document.documentElement.scrollHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      const now = document.documentElement.scrollHeight;
      if (now === height) return;
      height = now;
      window.clearTimeout(timer);
      /* `true` waits for the scroll to end: an immediate refresh rewinds every
         scrubbed timeline for a frame, which shows as a flicker mid-scroll. */
      timer = window.setTimeout(() => ScrollTrigger.refresh(true), 200);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      /* A little under 1:1. The held sequences are read by scrolling, and at
         full wheel speed one flick carried the page straight through them. */
      wheelMultiplier: 0.8,
      touchMultiplier: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    setLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Webfonts change line boxes; re-measure once they land so pins stay honest.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      setLenis(null);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
