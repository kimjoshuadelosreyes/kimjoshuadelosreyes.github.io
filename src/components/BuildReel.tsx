"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { BUILDS, BUILDS_FINALE, STACK, tintOf } from "@/lib/content";
import TechIcon from "./TechIcons";

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

/**
 * The reel — four kinds of build and the stack behind them, in one take.
 *
 * A pinned stage and a camera that travels INTO the screen: each plate arrives
 * from depth, turns slowly in 3D while its own scene plays, then rushes past
 * the lens as the next one arrives. The tools it is built with fly out of it
 * and dock around its edge. After the fourth plate the whole stack assembles
 * into one wall.
 *
 * Planes, back to front: film grain; a giant ghost word for the beat; speed
 * streaks that fire on each cut; the plates; the captions. Nothing glows.
 *
 * Every plate is drawn in markup. They are archetypes — a site, a pipeline, an
 * agent, a dashboard — not client screens, and none of them carries a figure.
 *
 * ---------------------------------------------------------------------------
 * Same contract as the hero and the flow: ONE timeline, registered on
 * `window.__timelines.reel`, seek-safe in both directions, scrubbed by the pin.
 * Nothing random: every scatter, height and offset is derived from an index.
 *
 *   beat k is in focus from  k * STEP  and plays its scene there;
 *   the cut to beat k+1 runs  (k+1) * STEP - CUT  ->  (k+1) * STEP.
 *   Beats 0-3 are the plates; beat 4 is the wall.
 *
 * One owner per node: `.reel-plate` owns the depth move, `.reel-tilt` the 3D
 * turn, `.reel-chip` its flight, `.reel-chip > span` the idle drift (the only
 * thing not on the timeline), and everything inside a screen its own scene.
 *
 * Below lg and under reduced motion there is no pin: the plates sit finished
 * in a native snapping rail, and the wall is a plain grouped list after it.
 * ---------------------------------------------------------------------------
 */

const STEP = 2.4;
const CUT = 0.8;
const BEATS = BUILDS.length + 1;
const END = STEP * (BEATS - 1) + 2.2;

/* Baked, index-derived shapes — nothing random, so every frame is repeatable. */
const WAVE = Array.from({ length: 22 }, (_, i) => 24 + Math.round(70 * Math.abs(Math.sin(i * 1.7 + 0.6))));
const BARS = [42, 58, 50, 72, 64, 86, 78] as const;
const TREND = "M0 78 L16.6 60 L33.3 67 L50 40 L66.6 47 L83.3 18 L100 28";
const METERS = [
  { label: "Enquiries answered", fill: 0.92 },
  { label: "Calls booked", fill: 0.64 },
  { label: "Records filed", fill: 0.8 },
] as const;
const STREAKS = Array.from({ length: 14 }, (_, i) => ({
  left: 4 + ((i * 53) % 92),
  height: 22 + ((i * 37) % 44),
  delay: ((i * 7) % 10) / 40,
}));
const scatter = (i: number) => ({
  x: (((i * 37) % 100) - 50) * 9,
  y: (((i * 61) % 100) - 50) * 6,
  rotation: ((i * 29) % 50) - 25,
});

/* The pipeline's nodes, in % of the plate; the wires are drawn in the same
   600 x 375 space, edge to edge between them. */
const NODES = [
  { label: "Webhook", x: 6, y: 30 },
  { label: "AI: classify", x: 28, y: 30, hot: true },
  { label: "Is it a fit?", x: 50, y: 30 },
  { label: "Add to CRM", x: 74, y: 12 },
  { label: "Notify team", x: 74, y: 48 },
] as const;
const WIRES = [
  "M132 135H168",
  "M264 135H300",
  "M396 135C420 135 420 67.5 444 67.5",
  "M396 135C420 135 420 202.5 444 202.5",
] as const;
const LOG = ["lead classified  ·  good fit", "CRM record created", "team notified in Slack"] as const;

const CODE: ReadonlyArray<ReadonlyArray<readonly [string, string?]>> = [
  [["export default function ", "k"], ["Hero", "f"], ["() {"]],
  [["  return ", "k"], ["("]],
  [["    <"], ["section ", "t"], ["className", "a"], ["="], ['"hero"', "s"], [">"]],
  [["      <"], ["h1", "t"], [">Bookings, on autopilot.</"], ["h1", "t"], [">"]],
  [["      <"], ["Button ", "t"], ["onClick", "a"], ["={"], ["quote", "f"], ["}>"]],
  [["        Get a quote"]],
  [["      </"], ["Button", "t"], [">"]],
  [["    </"], ["section", "t"], [">"]],
  [["  );"]],
  [["}"]],
];

/* Where a plate's tool chips dock, clockwise from top-left. `side` is which
   way the chip's stem points back at the plate. */
const SEATS = [
  { side: "l", style: { right: "calc(100% + 2.4em)", top: "14%" } },
  { side: "r", style: { left: "calc(100% + 2.4em)", top: "8%" } },
  { side: "l", style: { right: "calc(100% + 2.4em)", top: "62%" } },
  { side: "r", style: { left: "calc(100% + 2.4em)", top: "44%" } },
  { side: "r", style: { left: "calc(100% + 2.4em)", top: "78%" } },
] as const;

function SitePlate() {
  return (
    <div className="reel-screen reel-site">
      <div className="reel-code">
        <div className="reel-code-tabs">
          <b>page.tsx</b>
          <span>hero.css</span>
        </div>
        <pre>
          {CODE.map((line, i) => (
            <span key={i} className="reel-code-line">
              <i>{String(i + 1).padStart(2, " ")}</i>
              {line.map(([text, tone], j) => (
                <span key={j} className={tone ? `reel-tok-${tone}` : undefined}>
                  {text}
                </span>
              ))}
            </span>
          ))}
        </pre>
      </div>
      <div className="reel-preview">
        <div className="reel-preview-nav">
          <b />
          <i />
          <i />
          <span />
        </div>
        <p className="reel-preview-h">Bookings, on autopilot.</p>
        <div className="reel-bar" />
        <div className="reel-bar reel-bar--short" />
        <div className="reel-preview-cta">
          Get a quote
          <span className="reel-ripple" />
          <svg className="reel-cursor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 3l14 8-6.2 1.6L10 19z" fill="#fff" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="reel-preview-art" />
      </div>
      <span className="reel-sheen" />
    </div>
  );
}

function PipelinePlate() {
  return (
    <div className="reel-screen reel-pipe">
      <svg viewBox="0 0 600 375" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {WIRES.map((d) => (
          <path key={d} d={d} className="reel-wire" pathLength={1} />
        ))}
        {WIRES.map((d) => (
          <circle key={d} className="reel-pulse" r="4" />
        ))}
      </svg>
      {NODES.map((n) => (
        <div
          key={n.label}
          className={`reel-node${"hot" in n && n.hot ? " reel-node--hot" : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <i />
          {n.label}
        </div>
      ))}
      <div className="reel-log">
        <p className="reel-log-head">
          <b />
          Execution log
        </p>
        {LOG.map((l) => (
          <p key={l} className="reel-log-line">
            <i>200</i>
            {l}
          </p>
        ))}
      </div>
      <span className="reel-sheen" />
    </div>
  );
}

function AgentPlate() {
  return (
    <div className="reel-screen reel-call">
      <div className="reel-call-main">
        <div className="reel-call-head">
          <span className="reel-call-ring">
            <i />
          </span>
          <span>
            <b>Front desk agent</b>
            <em>On a call</em>
          </span>
        </div>
        <div className="reel-wave" aria-hidden="true">
          {WAVE.map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="reel-line reel-line--them">Do you have anything on Thursday morning?</p>
        <p className="reel-line reel-line--us">I can do ten o&apos;clock. Shall I book it?</p>
      </div>
      <div className="reel-tools">
        <p className="reel-tools-head">Tool calls</p>
        {["check_calendar()", "book_slot()", "send_summary()"].map((t) => (
          <p key={t} className="reel-tool">
            <code>{t}</code>
            <i />
          </p>
        ))}
        <span className="reel-chipnote">Appointment booked</span>
      </div>
      <span className="reel-sheen" />
    </div>
  );
}

function DashboardPlate() {
  return (
    <div className="reel-screen reel-dash">
      <div className="reel-dash-head">
        <b>This week</b>
        <span>Example data</span>
      </div>
      <div className="reel-dash-body">
        <div className="reel-meters">
          {METERS.map((m) => (
            <div key={m.label} className="reel-meter">
              <span>{m.label}</span>
              <div>
                <i style={{ width: `${m.fill * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="reel-chart" aria-hidden="true">
          {BARS.map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d={TREND} className="reel-trend" pathLength={1} />
          </svg>
        </div>
      </div>
      <span className="reel-sheen" />
    </div>
  );
}

const PLATES = [SitePlate, PipelinePlate, AgentPlate, DashboardPlate] as const;
const pad = (n: number) => String(n).padStart(2, "0");

function Tool({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`reel-tool-chip ${className}`}>
      <TechIcon name={name} color={tintOf(name)} />
      {name}
    </span>
  );
}

function Caption({ index }: { index: number }) {
  const b = index < BUILDS.length ? BUILDS[index] : BUILDS_FINALE;
  return (
    <div className="reel-caption">
      <p className="reel-caption-no">
        {pad(index + 1)} <span>/ {pad(BEATS)}</span>
      </p>
      <h3 className="reel-caption-name">{b.name}</h3>
      <p className="reel-caption-copy">{b.copy}</p>
      {"stack" in b && (
        <ul className="reel-stack">
          {b.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Wall() {
  return (
    <div className="reel-wall" data-od-id="reel-stack">
      {STACK.map((g) => (
        <div key={g.key} className="reel-wall-group">
          <p className="reel-wall-label">{g.label}</p>
          <ul>
            {g.tools.map((t) => (
              <li key={t.name} className="reel-wall-chip">
                <Tool name={t.name} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function BuildReel() {
  const root = useRef<HTMLDivElement>(null);
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

      if (compact) {
        gsap.from(q(".reel-card"), {
          opacity: 0,
          y: 44,
          duration: 0.85,
          stagger: 0.09,
          scrollTrigger: { trigger: root.current, start: "top 76%", once: true },
        });
        gsap.from(q(".reel-wall-chip"), {
          opacity: 0,
          y: 18,
          duration: 0.5,
          stagger: 0.025,
          scrollTrigger: { trigger: q(".reel-wall")[0], start: "top 84%", once: true },
        });
        return;
      }

      const plates = q(".reel-plate") as HTMLElement[];
      const captions = q(".reel-caption") as HTMLElement[];
      const ghosts = q(".reel-ghost") as HTMLElement[];
      const ticks = q(".reel-tick i") as HTMLElement[];
      const wall = q(".reel-wall")[0] as HTMLElement | undefined;
      if (plates.length !== BUILDS.length || !wall) return;
      const pl = (i: number, sel: string) => plates[i].querySelectorAll(sel);

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* ---- the take ---- */
      const FAR = { scale: 0.5, yPercent: 30, autoAlpha: 0, filter: "blur(12px)" };
      const FOCUS = { scale: 1, yPercent: 0, autoAlpha: 1, filter: "blur(0px)" };
      const PAST = { scale: 2.1, yPercent: -40, autoAlpha: 0, filter: "blur(16px)" };
      const tickFor = (k: number) => (k === BEATS - 1 ? END - k * STEP - 0.4 : STEP - CUT);

      tl.fromTo(plates[0], FOCUS, { ...FOCUS, duration: 0.01 }, 0)
        .fromTo(ticks[0], { scaleX: 0 }, { scaleX: 1, duration: tickFor(0), ease: "none" }, 0)
        .fromTo(ghosts[0], { autoAlpha: 1, xPercent: 6 }, { autoAlpha: 1, xPercent: -6, duration: STEP - CUT, ease: "none" }, 0);

      for (let k = 1; k < BEATS; k++) {
        const at = k * STEP - CUT;
        const incoming = k < plates.length ? plates[k] : wall;

        tl.fromTo(plates[k - 1], FOCUS, { ...PAST, duration: CUT, ease: "power2.in", immediateRender: false }, at);
        if (k < plates.length) {
          tl.fromTo(incoming, FAR, { ...FOCUS, duration: CUT, ease: "power3.out" }, at + 0.12);
        } else {
          tl.fromTo(wall, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at + 0.3);
        }

        /* caption, tick, ghost word */
        tl.fromTo(
          captions[k - 1],
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -16, duration: 0.3, ease: "power1.in", immediateRender: false },
          at,
        )
          .fromTo(captions[k], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.4)
          .fromTo(ticks[k], { scaleX: 0 }, { scaleX: 1, duration: tickFor(k), ease: "none" }, k * STEP)
          .fromTo(
            ghosts[k - 1],
            { autoAlpha: 1, xPercent: -6, scale: 1 },
            { autoAlpha: 0, xPercent: -20, scale: 1.25, duration: CUT * 0.7, ease: "power2.in", immediateRender: false },
            at,
          )
          .fromTo(
            ghosts[k],
            { autoAlpha: 0, xPercent: 22, scale: 0.86 },
            { autoAlpha: 1, xPercent: 6, scale: 1, duration: CUT, ease: "power3.out" },
            at + 0.15,
          )
          .fromTo(
            ghosts[k],
            { xPercent: 6 },
            { xPercent: -6, duration: (k === BEATS - 1 ? END : (k + 1) * STEP - CUT) - k * STEP - 0.15, ease: "none", immediateRender: false },
            k * STEP + 0.15,
          );

        /* speed streaks: the container owns the flash, each line its travel */
        tl.fromTo(
          q(".reel-streaks"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: CUT * 0.3, ease: "none", immediateRender: k === 1 },
          at,
        )
          .fromTo(
            q(".reel-streaks"),
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: CUT * 0.45, ease: "none", immediateRender: false },
            at + CUT * 0.55,
          )
          .fromTo(
            q(".reel-streaks i"),
            { yPercent: 160 },
            {
              yPercent: -260,
              duration: CUT * 0.8,
              ease: "power1.in",
              stagger: (i: number) => STREAKS[i].delay,
              immediateRender: false,
            },
            at,
          );
      }

      /* ---- per plate: the 3D turn, the sheen, the chips docking ---- */
      plates.forEach((plate, k) => {
        const t = k * STEP;
        const from = k === 0 ? 0 : t - CUT;
        tl.fromTo(
          plate.querySelector(".reel-tilt"),
          { rotationY: -11, rotationX: 5 },
          { rotationY: 9, rotationX: -3, duration: (k + 1) * STEP - from, ease: "none" },
          from,
        ).fromTo(
          plate.querySelector(".reel-sheen"),
          { xPercent: -140 },
          { xPercent: 260, duration: 0.9, ease: "power2.inOut" },
          t + (k === 0 ? 0.15 : -0.1),
        );

        /* Each chip leaves from the middle of the plate. Seats are CSS, so the
           vector back to the centre is measured once here. */
        const tilt = plate.querySelector(".reel-tilt") as HTMLElement;
        const chips = Array.from(plate.querySelectorAll<HTMLElement>(".reel-chip"));
        const home = chips.map((c) => ({
          x: tilt.offsetWidth / 2 - (c.offsetLeft + c.offsetWidth / 2),
          y: tilt.offsetHeight / 2 - (c.offsetTop + c.offsetHeight / 2),
        }));
        tl.fromTo(
          chips,
          { autoAlpha: 0, scale: 0.3, x: (i: number) => home[i].x, y: (i: number) => home[i].y },
          { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: "back.out(1.5)", stagger: 0.07 },
          t + (k === 0 ? 0.5 : 0.1),
        ).fromTo(
          plate.querySelectorAll(".reel-chip em"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.25, ease: "none", stagger: 0.07 },
          t + (k === 0 ? 1.0 : 0.6),
        );
      });

      /* ---- 1: typed, then built ---- */
      tl.fromTo(
        pl(0, ".reel-code-line"),
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.16, ease: "none", stagger: 0.1 },
        0.05,
      )
        .fromTo(pl(0, ".reel-preview-nav"), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.25)
        .fromTo(
          pl(0, ".reel-preview-h"),
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.4, ease: "power2.inOut" },
          0.45,
        )
        .fromTo(
          pl(0, ".reel-preview .reel-bar"),
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "power3.out", stagger: 0.08 },
          0.6,
        )
        .fromTo(pl(0, ".reel-preview-cta"), { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(2.4)" }, 0.75)
        .fromTo(
          pl(0, ".reel-preview-art"),
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "power3.inOut" },
          0.7,
        )
        .fromTo(
          pl(0, ".reel-cursor"),
          { x: "12em", y: "9em" },
          { x: 0, y: 0, duration: 0.5, ease: "power2.inOut", immediateRender: false },
          1.1,
        )
        .fromTo(
          pl(0, ".reel-ripple"),
          { scale: 0.3, opacity: 0.7 },
          { scale: 2.4, opacity: 0, duration: 0.4, ease: "power1.out" },
          1.6,
        );

      /* ---- 2: wired, then run ---- */
      const t1 = STEP;
      const wires = Array.from(pl(1, ".reel-wire")) as SVGPathElement[];
      tl.fromTo(
        pl(1, ".reel-node"),
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.12 },
        t1 - 0.3,
      ).fromTo(
        wires,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.25, ease: "none", stagger: 0.12 },
        t1 - 0.1,
      );
      Array.from(pl(1, ".reel-pulse")).forEach((dot, i) => {
        const at = t1 + 0.55 + Math.min(i, 2) * 0.22;
        tl.fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at)
          .to(
            dot,
            {
              motionPath: { path: wires[i], align: wires[i], alignOrigin: [0.5, 0.5], start: 0, end: 1 },
              duration: 0.22,
              ease: "none",
              immediateRender: false,
            },
            at,
          )
          .fromTo(dot, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01, immediateRender: false }, at + 0.22);
      });
      tl.fromTo(
        pl(1, ".reel-node i"),
        { backgroundColor: "#6b6b6b" },
        { backgroundColor: "#fa5d19", duration: 0.12, stagger: 0.2 },
        t1 + 0.5,
      )
        .fromTo(pl(1, ".reel-log"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35 }, t1 + 0.35)
        .fromTo(
          pl(1, ".reel-log-line"),
          { autoAlpha: 0, x: -12 },
          { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.22 },
          t1 + 0.75,
        );

      /* ---- 3: the call ---- */
      const t2 = STEP * 2;
      tl.fromTo(
        pl(2, ".reel-call-ring i"),
        { scale: 0.6, opacity: 0.7 },
        { scale: 1.9, opacity: 0, duration: 0.5, ease: "power1.out", repeat: 2 },
        t2 - 0.2,
      )
        .fromTo(
          pl(2, ".reel-wave i"),
          { scaleY: 0.12 },
          { scaleY: 1, duration: 0.2, ease: "sine.inOut", stagger: { each: 0.03, repeat: 4, yoyo: true } },
          t2 - 0.25,
        )
        .fromTo(
          pl(2, ".reel-line"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.35 },
          t2 + 0.1,
        )
        .fromTo(
          pl(2, ".reel-tool"),
          { autoAlpha: 0, x: 30 },
          { autoAlpha: 1, x: 0, duration: 0.3, ease: "power3.out", stagger: 0.25 },
          t2 + 0.3,
        )
        .fromTo(
          pl(2, ".reel-tool i"),
          { scale: 0 },
          { scale: 1, duration: 0.25, ease: "back.out(3)", stagger: 0.25 },
          t2 + 0.5,
        )
        .fromTo(
          pl(2, ".reel-chipnote"),
          { autoAlpha: 0, scale: 0 },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" },
          t2 + 1.15,
        );

      /* ---- 4: the week fills in ---- */
      const t3 = STEP * 3;
      tl.fromTo(
        pl(3, ".reel-meter"),
        { autoAlpha: 0, x: -24 },
        { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.1 },
        t3 - 0.3,
      )
        .fromTo(
          pl(3, ".reel-meter i"),
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6, ease: "power3.out", stagger: 0.12 },
          t3 - 0.1,
        )
        .fromTo(
          pl(3, ".reel-chart i"),
          { scaleY: 0 },
          { scaleY: 1, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(1.6)", stagger: 0.06 },
          t3 - 0.1,
        )
        .fromTo(
          pl(3, ".reel-trend"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
          t3 + 0.45,
        );

      /* ---- 5: the wall assembles out of depth ---- */
      const t4 = STEP * 4;
      tl.fromTo(
        q(".reel-wall-label"),
        { autoAlpha: 0, x: -20 },
        { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.12 },
        t4 - 0.35,
      )
        .fromTo(
          q(".reel-wall-chip"),
          {
            autoAlpha: 0,
            scale: 0.3,
            x: (i: number) => scatter(i).x,
            y: (i: number) => scatter(i).y,
            rotation: (i: number) => scatter(i).rotation,
          },
          { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 },
          t4 - 0.4,
        )
        .fromTo(
          q(".reel-wall-chip svg"),
          { scale: 1 },
          { scale: 1.45, duration: 0.18, ease: "sine.inOut", stagger: { each: 0.03, repeat: 1, yoyo: true } },
          t4 + 0.75,
        )
        .to({}, { duration: 0.01 }, END);

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        animation: tl,
      });

      /* The chips' idle drift, on the inner span — never on the timeline. */
      (q(".reel-chip > span") as HTMLElement[]).forEach((el, i) =>
        gsap.to(el, {
          y: i % 2 ? 7 : -7,
          duration: 2.6 + (i % 5) * 0.35,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: (i % 4) * 0.3,
        }),
      );

      (window.__timelines ??= {}).reel = tl;
      return () => {
        if (window.__timelines?.reel === tl) delete window.__timelines.reel;
      };
    },
    { scope: root, dependencies: [compact], revertOnUpdate: true },
  );

  if (compact) {
    /* Phone, and reduced motion: a native snapping rail, every plate finished,
       then the stack as a plain grouped list. */
    return (
      <div ref={root} className="reel reel--compact" data-od-id="work-reel">
        <div className="reel-rail">
          {BUILDS.map((b, i) => {
            const Plate = PLATES[i];
            return (
              <article key={b.key} className="reel-card" data-od-id={`reel-${b.key}`}>
                <div className="reel-plate">
                  <Plate />
                </div>
                <Caption index={i} />
              </article>
            );
          })}
        </div>
        <div className="reel-finale shell">
          <Caption index={BUILDS.length} />
          <Wall />
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className="reel" data-od-id="work-reel">
      <div className="reel-stage">
        <div className="reel-atmos" aria-hidden="true">
          <div className="reel-ghosts">
            {[...BUILDS, BUILDS_FINALE].map((b) => (
              <span key={b.ghost} className="reel-ghost">
                {b.ghost}
              </span>
            ))}
          </div>
          <div className="reel-streaks">
            {STREAKS.map((s, i) => (
              <i key={i} style={{ left: `${s.left}%`, height: `${s.height}svh` }} />
            ))}
          </div>
          <span className="reel-grain" />
        </div>

        <div className="reel-captions">
          {Array.from({ length: BEATS }, (_, i) => (
            <Caption key={i} index={i} />
          ))}
        </div>

        <div className="reel-track">
          {BUILDS.map((b, i) => {
            const Plate = PLATES[i];
            return (
              <div key={b.key} className="reel-plate" data-od-id={`reel-${b.key}`}>
                <div className="reel-tilt">
                  <Plate />
                  <div className="reel-orbit" aria-hidden="true">
                    {b.stack.map((name, j) => (
                      <div key={name} className={`reel-chip reel-chip--${SEATS[j].side}`} style={SEATS[j].style}>
                        <span>
                          <Tool name={name} />
                        </span>
                        <em />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <Wall />
        </div>

        <div className="reel-ticks" aria-hidden="true">
          {Array.from({ length: BEATS }, (_, i) => (
            <span key={i} className="reel-tick">
              <i />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
