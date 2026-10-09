"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CAPABILITIES, RAIL_INDEX } from "@/lib/content";
import Icon from "./Icons";

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

/**
 * Capabilities — the dial.
 *
 * A combination dial with the six things every build comes with set around its
 * rim. Scrolling turns it one notch at a time: the next one clicks round to the
 * pointer, the numeral in the hub rolls over, the progress arc advances, and on
 * the left the title rolls up like a counter while what you actually receive
 * ticks in underneath.
 *
 * The move here is ROTATION. The hero dives, the flow pans along a line, the
 * reel travels in depth; this is the one thing on the page that turns.
 *
 * ---------------------------------------------------------------------------
 * Same contract as the rest: ONE timeline, registered on
 * `window.__timelines.dial`, seek-safe in both directions, scrubbed by the pin.
 *
 *   notch k is set from  k * STEP ;  the turn to it runs
 *   k * STEP - TURN  ->  k * STEP .
 *
 * Every turn moves four things by the same ease and duration, which is what
 * keeps them in register: `.dial-rim` turns -60 degrees, each `.dial-node-in`
 * turns +60 so its icon stays upright, the inner ring counter-turns at half
 * speed, and the hub and title strips advance one line.
 *
 * Below lg and under reduced motion there is no dial: six cards in a grid.
 * ---------------------------------------------------------------------------
 */

const N = CAPABILITIES.length;
const NOTCH = 360 / N;
const STEP = 1.6;
const TURN = 0.75;
const END = STEP * (N - 1) + 1.4;
const pad = (n: number) => String(n).padStart(2, "0");

/* The rim's engraving: 120 marks, a long one at every notch. */
const MARKS = Array.from({ length: 120 }, (_, i) => ({
  a: i * 3,
  r: i % 20 === 0 ? 82 : i % 5 === 0 ? 88 : 90.5,
}));

const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.5 8.4l3 3 6-6.6" pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Points({ points }: { points: readonly string[] }) {
  return (
    <ul className="dial-points">
      {points.map((p) => (
        <li key={p}>
          <i>
            <Tick />
          </i>
          {p}
        </li>
      ))}
    </ul>
  );
}

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
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
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q(".cap-head > * > *"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });

      if (compact) {
        gsap.from(q(".dial-card"), {
          opacity: 0,
          y: 34,
          duration: 0.7,
          stagger: 0.08,
          scrollTrigger: { trigger: q(".dial-list")[0], start: "top 82%", once: true },
        });
        return;
      }

      const nodes = q(".dial-node-in") as HTMLElement[];
      const bodies = q(".dial-body") as HTMLElement[];
      if (nodes.length !== N || bodies.length !== N) return;

      const ON = { scale: 1.28, backgroundColor: "#fa5d19", color: "#ffffff", borderColor: "#fa5d19" };
      const OFF = { scale: 1, backgroundColor: "#ffffff", color: "#262626", borderColor: "#e8e8e8" };
      const line = (k: number) => -(k * 100) / N;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* notch 0, as found */
      tl.fromTo(nodes[0], ON, { ...ON, duration: 0.01 }, 0)
        .fromTo(q(".dial-arc"), { strokeDashoffset: 1 }, { strokeDashoffset: 1 - 1 / N, duration: 0.6, ease: "power3.out" }, 0.05)
        .fromTo(
          bodies[0].querySelectorAll("li"),
          { autoAlpha: 0, x: -18 },
          { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.1 },
          0.1,
        )
        .fromTo(
          bodies[0].querySelectorAll("li path"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.25, ease: "none", stagger: 0.1 },
          0.25,
        );

      for (let k = 1; k < N; k++) {
        const at = k * STEP - TURN;
        const turn = { duration: TURN, ease: "back.inOut(1.3)" };

        /* the turn — four things, one ease */
        tl.fromTo(q(".dial-rim"), { rotation: -NOTCH * (k - 1) }, { rotation: -NOTCH * k, ...turn, immediateRender: k === 1 }, at)
          .fromTo(nodes, { rotation: NOTCH * (k - 1) }, { rotation: NOTCH * k, ...turn, immediateRender: k === 1 }, at)
          .fromTo(
            q(".dial-inner"),
            { rotation: (NOTCH / 2) * (k - 1) },
            { rotation: (NOTCH / 2) * k, ...turn, immediateRender: k === 1 },
            at,
          )
          .fromTo(q(".dial-hub-strip"), { yPercent: line(k - 1) }, { yPercent: line(k), ...turn, immediateRender: k === 1 }, at)
          .fromTo(q(".dial-title-strip"), { yPercent: line(k - 1) }, { yPercent: line(k), ...turn, immediateRender: k === 1 }, at)
          .fromTo(q(".dial-count-strip"), { yPercent: line(k - 1) }, { yPercent: line(k), ...turn, immediateRender: k === 1 }, at)
          .fromTo(
            q(".dial-arc"),
            { strokeDashoffset: 1 - k / N },
            { strokeDashoffset: 1 - (k + 1) / N, duration: TURN, ease: "power2.inOut", immediateRender: false },
            at,
          )
          /* the pointer kicks as the notch seats */
          .fromTo(q(".dial-pointer"), { x: 0 }, { x: -10, duration: 0.12, ease: "power1.out", immediateRender: false }, at + TURN - 0.16)
          .fromTo(q(".dial-pointer"), { x: -10 }, { x: 0, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + TURN - 0.04);

        /* the node that leaves the pointer, the node that arrives */
        tl.fromTo(nodes[k - 1], ON, { ...OFF, duration: 0.3, immediateRender: false }, at)
          .fromTo(nodes[k], OFF, { ...ON, duration: 0.35, ease: "back.out(2)" }, at + TURN - 0.25);

        /* what you get */
        tl.fromTo(
          bodies[k - 1],
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -14, duration: 0.25, ease: "power1.in", immediateRender: false },
          at,
        )
          .fromTo(bodies[k], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + TURN - 0.3)
          .fromTo(
            bodies[k].querySelectorAll("li"),
            { autoAlpha: 0, x: -18 },
            { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.09 },
            at + TURN - 0.15,
          )
          .fromTo(
            bodies[k].querySelectorAll("li path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.22, ease: "none", stagger: 0.09 },
            at + TURN,
          );
      }
      tl.to({}, { duration: 0.01 }, END);

      ScrollTrigger.create({
        trigger: q(".dial")[0],
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,
      });

      (window.__timelines ??= {}).dial = tl;
      return () => {
        if (window.__timelines?.dial === tl) delete window.__timelines.dial;
      };
    },
    { scope: root, dependencies: [compact], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="capabilities" data-od-id="capabilities">
      <div className="shell rail cap-head pt-[clamp(64px,9vw,148px)] pb-[clamp(28px,3.4vw,56px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">03</div>
          <p className="eyebrow">What you get</p>
          <p className="rail-index">{RAIL_INDEX.capabilities}</p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">
            Whatever the project is, these come with it.
          </p>
        </div>
        <div>
          <h2 className="h2">
            Six things,
            <br />
            on every build.
          </h2>
        </div>
      </div>

      {compact ? (
        /* Phone, and reduced motion: the six as cards. */
        <div className="dial-list shell" data-od-id="dial">
          {CAPABILITIES.map((c, i) => (
            <article key={c.id} className="dial-card" data-od-id={`cap-${c.id}`}>
              <div className="dial-card-top">
                <span className="dial-card-icon">
                  <Icon name={c.icon} className="dial-icon" />
                </span>
                <span className="dial-card-no">{pad(i + 1)}</span>
              </div>
              <h3 className="dial-card-title">{c.title}</h3>
              <p className="dial-copy">{c.copy}</p>
              <Points points={c.points} />
            </article>
          ))}
        </div>
      ) : (
        <div className="dial" data-od-id="dial">
          <div className="dial-stage shell">
            <div className="dial-read">
              <p className="dial-count" aria-hidden="true">
                <span className="dial-count-mask">
                  <span className="dial-count-strip">
                    {CAPABILITIES.map((c, i) => (
                      <span key={c.id}>{pad(i + 1)}</span>
                    ))}
                  </span>
                </span>
                <span className="dial-count-of">/ {pad(N)}</span>
              </p>

              {/* The titles are one strip behind a two-line window. */}
              <div className="dial-titles">
                <div className="dial-title-strip">
                  {CAPABILITIES.map((c) => (
                    <h3 key={c.id} className="dial-title">
                      <span>{c.title}</span>
                    </h3>
                  ))}
                </div>
              </div>

              <div className="dial-bodies">
                {CAPABILITIES.map((c) => (
                  <div key={c.id} className="dial-body" data-od-id={`cap-${c.id}`}>
                    <p className="dial-copy">{c.copy}</p>
                    <Points points={c.points} />
                  </div>
                ))}
              </div>
            </div>

            <div className="dial-wheel" aria-hidden="true">
              <div className="dial-rim">
                <svg viewBox="-100 -100 200 200">
                  <circle r="94" className="dial-rim-line" />
                  {MARKS.map((m) => (
                    <line key={m.a} x1={m.r} x2="94" y1="0" y2="0" transform={`rotate(${m.a})`} className="dial-mark" />
                  ))}
                </svg>
                {CAPABILITIES.map((c, i) => (
                  <div key={c.id} className="dial-node" style={{ "--a": `${180 + i * NOTCH}deg` } as React.CSSProperties}>
                    <div className="dial-node-in">
                      <Icon name={c.icon} className="dial-icon" />
                    </div>
                  </div>
                ))}
              </div>

              <svg viewBox="-100 -100 200 200" className="dial-inner">
                <circle r="52" className="dial-inner-dash" />
                {Array.from({ length: N }, (_, i) => (
                  <circle key={i} r="1.6" cx="52" className="dial-inner-dot" transform={`rotate(${i * NOTCH})`} />
                ))}
              </svg>
              <svg viewBox="-100 -100 200 200" className="dial-progress">
                <circle r="60" className="dial-arc-track" />
                <circle r="60" className="dial-arc" pathLength={1} transform="rotate(180)" />
              </svg>

              <div className="dial-hub">
                <span className="dial-hub-mask">
                  <span className="dial-hub-strip">
                    {CAPABILITIES.map((c, i) => (
                      <span key={c.id}>{pad(i + 1)}</span>
                    ))}
                  </span>
                </span>
              </div>

              <span className="dial-pointer" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
