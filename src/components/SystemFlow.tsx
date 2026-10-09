"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { EMAIL, FLOW, RAIL_INDEX } from "@/lib/content";
import Icon from "./Icons";

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

/**
 * System flow — one enquiry, followed from the site to the systems behind it.
 *
 * A dark frame pinned for one beat. Inside it a wide world of four stations
 * (site, agent, systems, result) joined by one line, and a virtual camera that
 * travels the line station to station, then pulls back to show all four as a
 * single machine. Every picture in it is built from markup: no photos.
 *
 * ---------------------------------------------------------------------------
 * Same contract as the hero: ONE timeline, registered on
 * `window.__timelines.flow`, every frame a pure function of its time —
 * `fromTo` with explicit from-states, transforms / opacity / clip only, nothing
 * random, finite repeats. The scroll scrubs it across the pin.
 *
 *   0.0   site     the form fills, the cursor lands, the button is pressed
 *   1.5   -> pan, the line draws to the agent
 *   2.0   agent    the enquiry arrives, it thinks, the verdict tags pop
 *   4.1   -> pan
 *   4.7   systems  three records, ticked off one after another
 *   6.7   -> pan
 *   7.3   result   the summary writes itself, the seal lands
 *   8.7   pull back: the whole line in one frame, and the closing statement
 *
 * The camera is one transform on `.sys-world` — `x` then `scale` about the
 * world's own left edge — so a station at world-x `c` sits on screen at
 * `x + scale * c`, and centring it is `x = -scale * c`.
 *
 * Below lg and under reduced motion there is no pin and no camera: the four
 * stations are stacked, each under its own caption, in their finished state.
 * That branch is chosen in JS, so nothing is duplicated in the DOM.
 * ---------------------------------------------------------------------------
 */

const T = {
  pan1: 1.5,
  agent: 2.0,
  pan2: 4.1,
  systems: 4.7,
  pan3: 6.7,
  result: 7.3,
  pull: 8.7,
  end: 10.4,
} as const;
const PAN = 0.9;

const Tick = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SiteStation() {
  return (
    <div className="sys-card sys-site">
      <div className="sys-chrome">
        <i />
        <i />
        <i />
        <span className="sys-url">yourbusiness.com</span>
      </div>
      <div className="sys-site-body">
        <div className="sys-bar sys-bar--h" />
        <div className="sys-bar sys-bar--h sys-bar--short" />
        <div className="sys-bar sys-bar--p" />
        <div className="sys-form">
          <div className="sys-input">
            <span className="sys-input-fill">maria@northclinic.co</span>
          </div>
          <div className="sys-input">
            <span className="sys-input-fill">New site + online booking</span>
          </div>
          <div className="sys-btn">
            <span className="sys-btn-b">Sent</span>
            <span className="sys-btn-a">Get a quote</span>
            <span className="sys-ripple" />
          </div>
        </div>
      </div>
      <svg className="sys-cursor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 3l14 8-6.2 1.6L10 19z" fill="#fff" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AgentStation() {
  return (
    <div className="sys-card sys-agent">
      <div className="sys-agent-head">
        <span className="sys-avatar">
          <Icon name="sparkles" />
        </span>
        <span className="sys-agent-name">Enquiry agent</span>
        <span className="sys-status">
          <span className="sys-status-b">Qualified</span>
          <span className="sys-status-a">
            Reading
            <span className="sys-dots">
              <i />
              <i />
              <i />
            </span>
          </span>
        </span>
      </div>
      <p className="sys-bubble sys-bubble--in">
        Hi, we run three clinics and need a new site with online booking before spring.
      </p>
      <p className="sys-bubble sys-bubble--out">
        Thanks Maria. Two quick questions, then I can book you a call.
      </p>
      <div className="sys-tags">
        <span className="sys-tag">Budget confirmed</span>
        <span className="sys-tag">Timeline fits</span>
        <span className="sys-tag sys-tag--hot">Good fit</span>
      </div>
    </div>
  );
}

const RECORDS = [
  { app: "CRM", line: "Lead added", detail: "Maria R. · North Clinic" },
  { app: "Calendar", line: "Intro call booked", detail: "Thursday · 10:00" },
  { app: "Docs", line: "Proposal drafted", detail: "Site + booking · ready to review" },
] as const;

function SystemsStation() {
  return (
    <div className="sys-records">
      {RECORDS.map((r) => (
        <div key={r.app} className="sys-card sys-record">
          <span className="sys-app">{r.app}</span>
          <span className="sys-record-text">
            <b>{r.line}</b>
            <span>{r.detail}</span>
          </span>
          <span className="sys-check">
            <Tick />
          </span>
        </div>
      ))}
    </div>
  );
}

const OUTCOMES = ["Replied in seconds", "Call booked without an email", "Logged, drafted and filed"] as const;

function ResultStation() {
  return (
    <div className="sys-card sys-result">
      <div className="sys-result-head">
        <span>Summary</span>
        <span className="sys-seal">
          <Tick />
        </span>
      </div>
      <p className="sys-result-title">New client: North Clinic</p>
      <ul>
        {OUTCOMES.map((o) => (
          <li key={o} className="sys-outcome">
            <i>
              <Tick />
            </i>
            {o}
          </li>
        ))}
      </ul>
      <p className="sys-result-foot">Sent to you · just now</p>
    </div>
  );
}

const STATIONS = [SiteStation, AgentStation, SystemsStation, ResultStation] as const;

function Caption({ index, className = "" }: { index: number; className?: string }) {
  const step = FLOW.steps[index];
  return (
    <div className={`sys-caption ${className}`}>
      <p className="sys-caption-no">
        {String(index + 1).padStart(2, "0")}
        <span> / {String(FLOW.steps.length).padStart(2, "0")}</span>
        <em>{step.label}</em>
      </p>
      <h3 className="sys-caption-title">{step.title}</h3>
      <p className="sys-caption-copy">{step.copy}</p>
    </div>
  );
}

export default function SystemFlow() {
  const root = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px), (prefers-reduced-motion: reduce)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* The camera's stops are measured at build time, so a resize rebuilds. */
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLayoutKey((k) => k + 1), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      const section = root.current;
      if (!section || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q(".sys-head > * > *"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: q(".sys-head")[0], start: "top 88%", once: true },
      });

      if (compact) {
        (q(".sys-step") as HTMLElement[]).forEach((step) => {
          gsap.from(step.children, {
            opacity: 0,
            y: 34,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: { trigger: step, start: "top 80%", once: true },
          });
        });
        return;
      }

      const frame = q(".sys-frame")[0] as HTMLElement | undefined;
      const world = q(".sys-world")[0] as HTMLElement | undefined;
      const stations = q(".sys-station") as HTMLElement[];
      if (!frame || !world || stations.length !== 4) return;

      /* ---- Measure once. offsetLeft/Width ignore transforms. ---- */
      const centre = stations.map((s) => s.offsetLeft + s.offsetWidth / 2);
      const span = centre[3] - centre[0];
      const worldW = stations[3].offsetLeft + stations[3].offsetWidth;
      const fit = Math.min(1, (frame.clientWidth * 0.92) / worldW);
      const camAt = (i: number) => ({ x: -centre[i], scale: 1 });
      const wide = { x: -(worldW / 2) * fit, scale: fit };

      const st = (i: number, sel: string) => stations[i].querySelectorAll(sel);
      const captions = q(".sys-caption") as HTMLElement[];
      const line = q(".sys-line")[0];
      const pulse = q(".sys-pulse")[0];
      const grid = q(".sys-grid")[0];

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* A leg of the journey: the camera travels, the line draws ahead of it
         and the far grid drifts at a third of the speed. */
      const pan = (to: number, at: number) => {
        tl.fromTo(
          world,
          camAt(to - 1),
          { ...camAt(to), duration: PAN, ease: "power3.inOut", immediateRender: false },
          at,
        )
          .fromTo(
            line,
            { scaleX: (to - 1) / 3 },
            { scaleX: to / 3, duration: PAN * 0.8, ease: "power2.inOut", immediateRender: false },
            at,
          )
          .fromTo(
            pulse,
            { x: (span * (to - 1)) / 3 },
            { x: (span * to) / 3, duration: PAN * 0.8, ease: "power2.inOut", immediateRender: false },
            at,
          )
          .fromTo(
            grid,
            { x: -(to - 1) * 90 },
            { x: -to * 90, duration: PAN, ease: "power3.inOut", immediateRender: false },
            at,
          );
      };
      const captionSwap = (from: number, to: number, at: number) => {
        tl.fromTo(
          captions[from],
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -14, duration: 0.3, ease: "power1.in", immediateRender: false },
          at,
        ).fromTo(captions[to], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.55);
      };

      /* frame furniture, fixed start states */
      tl.fromTo(world, camAt(0), { ...camAt(0), duration: 0.01 }, 0)
        .fromTo(line, { scaleX: 0 }, { scaleX: 0, duration: 0.01 }, 0)
        .fromTo(pulse, { x: 0 }, { x: 0, duration: 0.01 }, 0)
        .fromTo(q(".sys-progress i"), { scaleX: 0 }, { scaleX: 1, duration: T.end - 0.8, ease: "none" }, 0);

      /* 1 — the site */
      tl.fromTo(
        st(0, ".sys-input-fill"),
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "none", stagger: 0.3 },
        0.1,
      )
        .fromTo(
          st(0, ".sys-cursor"),
          { x: "9em", y: "5em" },
          { x: 0, y: 0, duration: 0.7, ease: "power2.inOut" },
          0.25,
        )
        .fromTo(st(0, ".sys-btn"), { scale: 1 }, { scale: 0.93, duration: 0.1, ease: "none" }, 0.98)
        .fromTo(
          st(0, ".sys-btn"),
          { scale: 0.93 },
          { scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: false },
          1.08,
        )
        .fromTo(
          st(0, ".sys-ripple"),
          { scale: 0.2, opacity: 0.55 },
          { scale: 2.6, opacity: 0, duration: 0.55, ease: "power1.out", immediateRender: false },
          1.0,
        )
        .fromTo(st(0, ".sys-btn-a"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 }, 1.08)
        .fromTo(st(0, ".sys-btn-b"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 1.08);

      /* 2 — the agent */
      pan(1, T.pan1);
      captionSwap(0, 1, T.pan1);
      tl.fromTo(
        st(1, ".sys-card"),
        { autoAlpha: 0, y: 34, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        T.agent,
      )
        .fromTo(
          st(1, ".sys-bubble--in"),
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, transformOrigin: "0% 100%", duration: 0.4, ease: "back.out(1.8)" },
          T.agent + 0.45,
        )
        .fromTo(
          st(1, ".sys-dots i"),
          { opacity: 0.25 },
          { opacity: 1, duration: 0.16, ease: "none", stagger: 0.1, repeat: 3, yoyo: true },
          T.agent + 0.7,
        )
        .fromTo(
          st(1, ".sys-bubble--out"),
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, transformOrigin: "100% 100%", duration: 0.4, ease: "back.out(1.8)" },
          T.agent + 1.05,
        )
        .fromTo(
          st(1, ".sys-tag"),
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.2)", stagger: 0.12 },
          T.agent + 1.4,
        )
        .fromTo(st(1, ".sys-status-a"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 }, T.agent + 1.8)
        .fromTo(st(1, ".sys-status-b"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, T.agent + 1.8);

      /* 3 — the systems */
      pan(2, T.pan2);
      captionSwap(1, 2, T.pan2);
      tl.fromTo(
        st(2, ".sys-record"),
        { autoAlpha: 0, x: 60 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out", stagger: 0.12 },
        T.systems,
      ).fromTo(
        st(2, ".sys-check"),
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: "back.out(2.6)", stagger: 0.3 },
        T.systems + 0.8,
      );

      /* 4 — the result */
      pan(3, T.pan3);
      captionSwap(2, 3, T.pan3);
      tl.fromTo(
        st(3, ".sys-card"),
        { autoAlpha: 0, y: 34, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        T.result,
      )
        .fromTo(
          st(3, ".sys-outcome"),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.14 },
          T.result + 0.45,
        )
        .fromTo(
          st(3, ".sys-seal"),
          { scale: 0, rotation: -40 },
          { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.4)" },
          T.result + 0.95,
        );

      /* pull back — the whole line in one frame */
      tl.fromTo(
        world,
        { ...camAt(3), yPercent: 0 },
        { ...wide, yPercent: 4, duration: 1.1, ease: "power3.inOut", immediateRender: false },
        T.pull,
      )
        .fromTo(
          captions[3],
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -14, duration: 0.3, ease: "power1.in", immediateRender: false },
          T.pull,
        )
        .fromTo(pulse, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T.pull)
        .fromTo(
          q(".sys-finale"),
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
          T.pull + 0.75,
        )
        .to({}, { duration: 0.01 }, T.end);

      ScrollTrigger.create({
        trigger: q(".sys")[0],
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        animation: tl,
      });

      (window.__timelines ??= {}).flow = tl;
      return () => {
        if (window.__timelines?.flow === tl) delete window.__timelines.flow;
      };
    },
    { scope: root, dependencies: [compact, layoutKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="about" data-od-id="about">
      {/* Intro band — the section's own heading, before the frame */}
      <div className="shell rail sys-head pt-[clamp(64px,9vw,148px)] pb-[clamp(36px,4.4vw,72px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">01</div>
          <p className="eyebrow">{FLOW.eyebrow}</p>
          <p className="rail-index">{RAIL_INDEX.about}</p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">{FLOW.aside}</p>
        </div>
        <div>
          <h2 className="h2">
            {FLOW.titleLines.map((line) => (
              <span key={line} className="lg:block">
                {line}{" "}
              </span>
            ))}
          </h2>
          <p className="lede mt-[clamp(20px,2.4vw,34px)]">{FLOW.lede}</p>
        </div>
      </div>

      {compact ? (
        /* Stacked — phone, and reduced motion. Finished states, no camera. */
        <div className="sys sys--compact shell" data-od-id="flow">
          {FLOW.steps.map((step, i) => {
            const Station = STATIONS[i];
            return (
              <article key={step.key} className="sys-step" data-od-id={`flow-${step.key}`}>
                <Caption index={i} />
                <div className="sys-panel">
                  <div className="sys-station">
                    <Station />
                  </div>
                </div>
              </article>
            );
          })}
          <p className="sys-note sys-note--flow">{FLOW.note} · names and details are made up</p>
        </div>
      ) : (
        /* Pinned — one frame, one camera */
        <div className="sys" data-od-id="flow">
          <div className="sys-stage">
            <div className="sys-frame">
              <div className="sys-grid" aria-hidden="true" />

              <div className="sys-world">
                <span className="sys-line" aria-hidden="true" />
                <span className="sys-pulse" aria-hidden="true" />
                {FLOW.steps.map((step, i) => {
                  const Station = STATIONS[i];
                  return (
                    <div key={step.key} className="sys-station" data-od-id={`flow-${step.key}`}>
                      <Station />
                    </div>
                  );
                })}
              </div>

              <div className="sys-top">
                <p className="sys-note">
                  <b />
                  {FLOW.note} · names and details are made up
                </p>
                <span className="sys-progress" aria-hidden="true">
                  <i />
                </span>
              </div>

              <div className="sys-captions">
                {FLOW.steps.map((step, i) => (
                  <Caption key={step.key} index={i} />
                ))}
              </div>

              <div className="sys-finale">
                <p className="sys-finale-title">
                  {FLOW.finale.titleLines.map((line) => (
                    <span key={line}>{line} </span>
                  ))}
                </p>
                <a href={`mailto:${EMAIL}`} className="btn btn--primary" data-od-id="flow-cta">
                  {FLOW.finale.cta}
                  <Icon name="arrow" className="arrow-ic" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
