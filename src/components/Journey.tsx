"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { JOURNEY, JOURNEY_PLATES, RAIL_INDEX } from "@/lib/content";

type Milestone = (typeof JOURNEY)[number];

/**
 * Seven steps on a warm ramp for the year numeral, so each chapter reads as its
 * own beat and the story visibly warms up from 2019 to 2026.
 *
 * Crimson → orange → amber, so the story visibly warms from 2019 to 2026. Those
 * are Firecrawl's own accents, in their order: `--accent-crimson`, the signature
 * orange, then `--accent-honey` (amber).
 *
 * Every stop is mixed back into `--ink`, and that is load-bearing rather than
 * decorative. The years are 12px type on a near-white canvas, so each one has to
 * clear 4.5:1 on its own, and every raw accent fails that badly — crimson is
 * 3.1:1, orange 2.9:1, amber 1.7:1. Mixing into ink keeps the hue travel while
 * holding the lightness down. The test measures both the contrast and that all
 * seven differ.
 */
const YEAR_ACCENTS = [
  "color-mix(in oklch, var(--color-ink) 100%, var(--color-crimson) 0%)",
  "color-mix(in oklch, var(--color-ink) 90%, var(--color-crimson) 10%)",
  "color-mix(in oklch, var(--color-ink) 82%, var(--color-crimson) 18%)",
  "color-mix(in oklch, var(--color-ink) 78%, var(--color-electric) 22%)",
  "color-mix(in oklch, var(--color-ink) 74%, var(--color-electric) 26%)",
  "color-mix(in oklch, var(--color-ink) 80%, var(--color-amber) 20%)",
  "color-mix(in oklch, var(--color-ink) 72%, var(--color-amber) 28%)",
];

/**
 * The chapter's copy. One component, used by both layouts.
 *
 * It carries `.journey-body-inner`, whose CSS rise animation plays whenever this
 * subtree is remounted — which is exactly when the active chapter changes.
 */
function ChapterBody({ m, index }: { m: Milestone; index: number }) {
  return (
    <div className="shell rail journey-body-inner relative w-full pb-[clamp(72px,7vw,104px)]">
      <div>
        <div className="text-[12px] tracking-[0.06em]" style={{ color: YEAR_ACCENTS[index] }}>
          {String(index + 1).padStart(2, "0")}
          <span className="opacity-60"> / {String(JOURNEY.length).padStart(2, "0")}</span>
        </div>
        <div
          className="journey-year mt-[10px] font-display text-[clamp(60px,8.4vw,140px)] font-medium leading-[0.88] tracking-[-0.03em]"
          style={{ color: YEAR_ACCENTS[index] }}
        >
          {m.year}
        </div>
        <div className="mt-[14px] text-[12px] uppercase tracking-[0.07em] text-brown">{m.tag}</div>
      </div>

      <div>
        <h3 className="font-display text-[clamp(26px,3.1vw,46px)] font-medium leading-[1.08] tracking-[-0.02em] text-ink">
          {m.title}
        </h3>
        <p className="mt-[clamp(14px,1.6vw,22px)] max-w-[54ch] text-[clamp(15px,1.15vw,18px)] leading-[1.6] text-ink">
          {m.copy}
        </p>
      </div>
    </div>
  );
}

function Plate({ index, active }: { index: number; active: boolean }) {
  const plate = JOURNEY_PLATES[index];
  return (
    <div className={`journey-plate${active ? " is-active" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={plate.src}
        alt=""
        loading={index === 0 ? "eager" : "lazy"}
        style={{ objectFit: plate.fit, objectPosition: plate.pos }}
      />
    </div>
  );
}

/**
 * Journey — pinned chapters.
 *
 * Seven plates crossfade across a 175svh sticky hold (`.journey` is 275svh with
 * a 100svh stage). The text is a SINGLE block whose content is swapped by the
 * scroll index — see the note in globals.css: stacking seven text blocks and
 * crossfading them stacked the years, and "2023" over "2024" read as "2025".
 *
 * Below 1024px and under reduced motion the runway is dropped and a stacked
 * layout is rendered instead. That branch is chosen in JS rather than hidden in
 * CSS, so no chapter is ever unreachable and no copy is duplicated in the DOM.
 */
export default function Journey() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (prefers-reduced-motion: reduce)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const head = root.current!.querySelector(".journey-head");
      if (head) {
        gsap.from(head.children, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
          immediateRender: false, scrollTrigger: { trigger: head, start: "top 88%", once: true },
        });
      }

      if (compact) {
        /* Phone: no hold, so the depth comes from the scroll itself — each
           chapter's body rises as it arrives, and its plate pushes in behind it.
           Written per chapter so the reveal belongs to the plate the reader is
           actually looking at, not to one section-wide trigger. */
        gsap.utils
          .toArray<HTMLElement>(".journey--compact .journey-chapter", root.current!)
          .forEach((ch) => {
            const body = ch.querySelector(".journey-body");
            const plate = ch.querySelector(".journey-plate");
            if (body) {
              gsap.from(body, {
                opacity: 0,
                y: 38,
                duration: 0.9,
                ease: "power2.out",
                immediateRender: false,
                scrollTrigger: { trigger: ch, start: "top 78%", once: true },
              });
            }
            if (plate) {
              gsap.fromTo(
                plate,
                { scale: 1.12 },
                {
                  scale: 1,
                  ease: "none",
                  scrollTrigger: { trigger: ch, start: "top bottom", end: "center center", scrub: true },
                },
              );
            }
          });
        return;
      }

      /* The whole sequence is index-driven: one ScrollTrigger over the sticky
         hold, and the active chapter changes as it advances. */
      ScrollTrigger.create({
        trigger: root.current!.querySelector(".journey"),
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const i = Math.min(
            JOURNEY.length - 1,
            Math.max(0, Math.floor(self.progress * JOURNEY.length + 0.1)),
          );
          setActive((prev) => (prev === i ? prev : i));
        },
      });

      /* The range is measured from a sticky element whose section sits below a
         font-dependent intro band, so re-measure once the layout has settled. */
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    /* `revertOnUpdate` so the compact flip reverts the previous branch's tweens
       and triggers instead of layering the two on top of each other. */
    { scope: root, dependencies: [compact], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="about" data-od-id="about">
      {/* Intro band — the section's own heading, before the chapters begin */}
      <div className="shell rail journey-head pt-[clamp(64px,9vw,148px)] pb-[clamp(40px,5vw,80px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">01</div>
          <p className="eyebrow">About me</p>
          <p className="rail-index">{RAIL_INDEX.about}</p>
          <p className="mt-[22px] max-w-[20ch] text-[13px] leading-[1.55] text-brown">
            Seven years in. Still obsessed. Now figuring out how AI fits into what I do.
          </p>
        </div>
        <div>
          <h2 className="h2">
            About Me (&amp;)
            <br />
            My Journey
          </h2>
          <p className="lede mt-[clamp(20px,2.4vw,34px)]">
            Seven years ago I opened Webflow for the first time. What happened after that is easier to
            show than explain.
          </p>
        </div>
      </div>

      {compact ? (
        /* Stacked layout — phone, and reduced motion */
        <div className="journey journey--compact" data-od-id="journey-chapters">
          {JOURNEY.map((m, i) => (
            <article key={m.year} className="journey-chapter" data-od-id={`journey-${m.year}`}>
              <Plate index={i} active />
              <div className="journey-scrim" aria-hidden="true" />
              <div className="journey-body">
                <ChapterBody m={m} index={i} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Pinned chapters — plates crossfade, one text block swaps */
        <div className="journey" data-od-id="journey-chapters">
          <div className="journey-stage">
            {JOURNEY.map((m, i) => (
              <div key={m.year} className="journey-chapter">
                <Plate index={i} active={i === active} />
              </div>
            ))}

            <div className="journey-scrim" aria-hidden="true" />

            <div className="journey-body">
              {/* Keying on the index remounts the block, replaying its rise */}
              <ChapterBody key={active} m={JOURNEY[active]} index={active} />
            </div>

            <div className="journey-ticks" aria-hidden="true">
              {JOURNEY.map((m, i) => (
                <span
                  key={m.year}
                  className={`h-[2px] rounded-full transition-all duration-500 ${
                    i === active ? "w-[38px] bg-electric" : "w-[18px] bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
