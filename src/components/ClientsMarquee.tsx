"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CLIENTS } from "@/lib/content";

/**
 * Seamless client marquee. A page-wide ScrollTrigger reads scroll velocity and
 * feeds it back into the loop's timeScale plus a small skew — the same
 * "motion reacts to how fast you scroll" behaviour as the original.
 */
export default function ClientsMarquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector(".marquee__track") as HTMLElement | null;
      if (!track) return;

      const groups = gsap.utils.toArray<HTMLElement>(".marquee__group", root.current!);
      const loop = gsap.to(track, {
        xPercent: -50,
        duration: 44,
        ease: "none",
        repeat: -1,
      });

      if (prefersReducedMotion()) {
        loop.progress(0.25).pause();
        return;
      }

      /* The names rise in the first time the strip is on screen. */
      gsap.from(root.current!.querySelectorAll(".marquee__group li"), {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.035,
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });

      const speed = { v: 1 };
      let resetTimer: number | undefined;

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          speed.v = gsap.utils.clamp(1, 5, 1 + Math.abs(velocity) / 600);
          loop.timeScale(speed.v);

          gsap.to(groups, {
            skewX: gsap.utils.clamp(-6, 6, -velocity / 420),
            duration: 0.5,
            ease: "power2.out",
            overwrite: true,
          });

          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            gsap.to(speed, {
              v: 1,
              duration: 0.9,
              ease: "power2.out",
              onUpdate: () => loop.timeScale(speed.v),
            });
          }, 140);
        },
      });

      return () => window.clearTimeout(resetTimer);
    },
    { scope: root },
  );

  const row = (
    <ul className="marquee__group">
      {CLIENTS.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  );

  return (
    <div
      ref={root}
      className="marquee border-y border-hairline py-[clamp(22px,3vw,44px)]"
      aria-label="Selected clients"
      data-od-id="client-marquee"
    >
      <div className="marquee__track">
        {row}
        <ul className="marquee__group" aria-hidden="true">
          {CLIENTS.map((c) => (
            <li key={`${c}-dup`}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
