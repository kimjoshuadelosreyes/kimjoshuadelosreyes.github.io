"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import {
  CATEGORY_LABELS,
  PROOF_QUOTES,
  PROOF_STATS,
  RAIL_INDEX,
  WORK_SEQUENCE,
  caseStudyPath,
  shotsOf,
} from "@/lib/content";
import Icon from "./Icons";
import BuildReel from "./BuildReel";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Work — the dark band.
 *
 * In the order a visitor wants them: the named projects with their screens and
 * a category filter, what three of those clients said, and then the reel
 * (`BuildReel`, which owns its own pin and its own timeline) on how they are
 * built.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [category, setCategory] = useState<string>("all");

  /* One tab per category that has a project in it, so a tab is never empty. */
  const TABS = [
    { id: "all", label: "All projects", count: WORK_SEQUENCE.length },
    ...Object.entries(CATEGORY_LABELS)
      .map(([id, label]) => ({ id, label, count: WORK_SEQUENCE.filter((p) => p.category === id).length }))
      .filter((t) => t.count > 0),
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
          <div className="mb-[12px] font-display text-[13px] tracking-[0.06em] opacity-60">01</div>
          <p className="eyebrow">The work</p>
          <p className="rail-index rail-index--onDark">{RAIL_INDEX.work}</p>
        </div>
        <div>
          <h2 className="h2 text-inkfg">
            Real projects,
            <br />
            for real clients.
          </h2>
          <p className="lede mt-[clamp(14px,1.6vw,24px)] text-[clamp(15px,1.05vw,17px)] text-inkfg/82">
            {WORK_SEQUENCE.length} builds, each with a page of its own. Open any one for the screens
            and what was built.
          </p>
        </div>
      </div>

      {/* The index: where named projects live, and where every project's name
          reaches the document. */}
      <div className="shell">
        <div className="work-index rail">
          <div>
            <p className="eyebrow">The full index</p>
            <p className="work-index__note">
              {new Set(WORK_SEQUENCE.map((p) => p.tag)).size} sectors, one build process: scope it,
              structure it, then make it move.
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="work-index__shot"
                      src={shotsOf(p.id)[0].src}
                      width={shotsOf(p.id)[0].w}
                      height={shotsOf(p.id)[0].h}
                      loading="lazy"
                      alt=""
                    />
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
                Showing {filteredWork.length} of {WORK_SEQUENCE.length} featured projects ·{" "}
                {PROOF_STATS.map((st) => `${st.value} ${st.label}`).join(" · ")}
              </span>
              <Link
                href="/archive"
                className="btn btn--onDark inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-all"
              >
                <span>See every client in the archive</span>
                <Icon name="arrow" className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What three of those clients said: a role and a company, never a name. */}
      <div className="shell">
        <div className="work-quotes rail" data-od-id="proof-quotes">
          <div>
            <p className="eyebrow">In their words</p>
          </div>
          <div className="proof-quotes">
            {PROOF_QUOTES.map((qt) => (
              <figure key={qt.project} className="proof-quote">
                <blockquote>&ldquo;{qt.quote}&rdquo;</blockquote>
                <figcaption>
                  <b>{qt.name}</b>
                  <span>{qt.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="shell rail pt-[clamp(40px,5vw,80px)] pb-[clamp(24px,2.8vw,44px)]">
        <div>
          <p className="eyebrow">How they are built</p>
          <p className="mt-[18px] max-w-[22ch] text-[13px] leading-[1.55] opacity-70">
            One build process: scope it, structure it, then make it move.
          </p>
        </div>
        <div>
          <h3 className="h2 text-inkfg">
            Four kinds of build,
            <br />
            one way of working.
          </h3>
          <p className="lede mt-[clamp(14px,1.6vw,24px)] text-[clamp(15px,1.05vw,17px)] text-inkfg/82">
            Every project is different, but most are one of these four, or a few of them wired
            together.
          </p>
        </div>
      </div>

      <BuildReel />
    </section>
  );
}
