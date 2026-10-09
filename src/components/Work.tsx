"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { RAIL_INDEX, WORK_SEQUENCE, caseStudyPath } from "@/lib/content";
import Icon from "./Icons";
import BuildReel from "./BuildReel";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Work — the dark band.
 *
 * Three parts: the head, the reel (`BuildReel`, which owns its own pin and its
 * own timeline), and the index of named projects with its category filter.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [category, setCategory] = useState<string>("all");

  const counts = {
    all: WORK_SEQUENCE.length,
    "ai-automation": WORK_SEQUENCE.filter((p) => p.category === "ai-automation").length,
    webflow: WORK_SEQUENCE.filter((p) => p.category === "webflow").length,
    enterprise: WORK_SEQUENCE.filter((p) => p.category === "enterprise").length,
    saas: WORK_SEQUENCE.filter((p) => p.category === "saas").length,
  };

  const TABS = [
    { id: "all", label: "All Projects", count: counts.all },
    { id: "ai-automation", label: "AI & Automations", count: counts["ai-automation"] },
    { id: "webflow", label: "Webflow", count: counts.webflow },
    { id: "enterprise", label: "Biotech & Enterprise", count: counts.enterprise },
    { id: "saas", label: "SaaS & Web3", count: counts.saas },
  ];

  const filteredWork = category === "all"
    ? WORK_SEQUENCE
    : WORK_SEQUENCE.filter((p) => p.category === category);

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

      /* The section head reveals when it arrives, on both branches. It starts
         hidden — a reveal that lets the head show first and then snaps it away
         to fade it in reads as a blink. Trigger positions stay honest because
         SmoothScroll re-measures whenever the document's height changes. */
      gsap.from(root.current!.querySelectorAll(".work-head"), {
        opacity: 0,
        y: 26,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current!, start: "top 78%", once: true },
      });
    },
    /* `revertOnUpdate` so the compact flip reverts the previous branch's tween
       instead of layering the two on top of each other. */
    { scope: root, dependencies: [compact], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="work" className="band on-dark" data-od-id="work">
      <div className="shell rail work-head pt-[clamp(56px,6.6vw,110px)] pb-[clamp(24px,2.8vw,44px)]">
        <div>
          <div className="mb-[12px] font-display text-[13px] tracking-[0.06em] opacity-60">02</div>
          <p className="eyebrow">The work</p>
          <p className="rail-index rail-index--onDark">{RAIL_INDEX.work}</p>
          <p className="mt-[18px] max-w-[22ch] text-[13px] leading-[1.55] opacity-70">
            One build process: scope it, structure it, then make it move.
          </p>
        </div>
        <div>
          <h2 className="h2 text-inkfg">
            Four kinds of build,
            <br />
            one way of working.
          </h2>
          <p className="lede mt-[clamp(14px,1.6vw,24px)] text-[clamp(15px,1.05vw,17px)] text-inkfg/82">
            Every project is different, but most are one of these four, or a few of them wired
            together.
          </p>
        </div>
      </div>

      <BuildReel />

      {/* The index. The reel shows kinds of build; this is where named projects
          live, and where every project's name reaches the document. */}
      <div className="shell">
        <div className="work-index rail">
          <div>
            <p className="eyebrow">The full index</p>
            <p className="work-index__note">
              Nine industries, one build process: scope it, structure it, then make it move.
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium tracking-[0.01em] transition-all cursor-pointer ${
                    category === tab.id
                      ? "bg-electric text-white shadow-xs"
                      : "bg-inksurface text-inkfg/70 hover:text-inkfg hover:bg-inksurface/80 border border-white/8"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] ${category === tab.id ? "text-white/85" : "text-inkfg/40"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <ul className="work-index__list">
              {filteredWork.map((p, i) => (
                <li key={p.id} className="work-index__item" data-od-id={`work-index-${p.id}`}>
                  {/* The whole row is the target. The grid moves onto the anchor so
                      the hit area is the row, not just the name. */}
                  <Link
                    href={caseStudyPath(p.id)}
                    className="work-index__link group"
                    aria-label={`${p.name} — read the case study`}
                  >
                    <span className="work-index__num" aria-hidden="true">
                      {pad(i + 1)}
                    </span>
                    <span className="work-index__tag" aria-hidden="true">
                      {p.tag}
                    </span>
                    <span className="work-index__name">
                      {p.name}
                      <Icon name="arrow" className="work-index__arrow" />
                    </span>
                    <span className="work-index__copy">{p.copy}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-inksurface pt-6">
              <span className="text-[13px] text-inkfg/60">
                Showing {filteredWork.length} of {WORK_SEQUENCE.length} featured projects · Over 80+ delivered across 7 years
              </span>
              <Link
                href="/archive"
                className="btn btn--onDark inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-all"
              >
                <span>Explore Full Project Archive (80+)</span>
                <Icon name="arrow" className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
