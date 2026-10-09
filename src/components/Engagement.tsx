"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { BRIEF_NEEDS, EMAIL, ENGAGEMENTS } from "@/lib/content";
import Icon from "./Icons";
import Ask from "./Ask";
import SkipPin from "./SkipPin";

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

/**
 * Ways to work — the shape of the engagement, then the brief.
 *
 * There are no packages and no prices, so the section does not pretend to have
 * tiers. Instead one calendar redraws itself for each arrangement: a rhythm of
 * marks for consultancy, one unbroken line for a full-time role, a bar with a
 * finish line for a project, a short thick block for a gig. The move here is a
 * MORPH — twelve marks changing length and weight in a wave, left to right.
 *
 * It closes on something to do rather than something to read: tick what you
 * need, pick how you would like to work, and a brief prints out line by line
 * with a button that opens the email already written.
 *
 * ---------------------------------------------------------------------------
 * The calendar follows the same contract as every held section: ONE timeline,
 * registered on `window.__timelines.shape`, seek-safe, scrubbed by the pin.
 *
 *   arrangement k is set from  k * STEP ;  the morph to it runs
 *   k * STEP - MORPH  ->  k * STEP .
 *
 * The brief is the one piece of the page driven by the reader instead of the
 * scroll, so it is plain state and CSS, not a timeline.
 *
 * Below lg and under reduced motion there is no pin: each arrangement is a
 * card with its calendar already drawn in its own shape.
 * ---------------------------------------------------------------------------
 */

type Shape = (typeof ENGAGEMENTS)[number]["shape"];
const WEEKS = 12;
const N = ENGAGEMENTS.length;
const STEP = 2;
const MORPH = 0.85;
const END = STEP * (N - 1) + 1.6;
const pad = (n: number) => String(n).padStart(2, "0");

/* What one week's mark looks like in each shape. `sx` past 1 closes the gap to
   the next week, which is what turns twelve marks into one line. */
const MARK: Record<Shape, (i: number) => { scaleX: number; scaleY: number; opacity: number }> = {
  rhythm: () => ({ scaleX: 0.3, scaleY: 1, opacity: 1 }),
  line: () => ({ scaleX: 1.16, scaleY: 0.5, opacity: 1 }),
  bar: (i) => (i < 6 ? { scaleX: 1.16, scaleY: 1.7, opacity: 1 } : { scaleX: 0, scaleY: 1.7, opacity: 0 }),
  block: (i) => (i < 2 ? { scaleX: 1.16, scaleY: 3.4, opacity: 1 } : { scaleX: 0, scaleY: 3.4, opacity: 0 }),
};
/* How far along the calendar each shape reaches — where the playhead stops. */
const REACH: Record<Shape, number> = { rhythm: 1, line: 1, bar: 0.5, block: 2 / 12 };

const markStyle = (shape: Shape, i: number) => {
  const m = MARK[shape](i);
  return { transform: `scale(${m.scaleX}, ${m.scaleY})`, opacity: m.opacity };
};

function Calendar({ index, live = false }: { index: number; live?: boolean }) {
  const e = ENGAGEMENTS[index];
  return (
    <div className="shape-cal">
      <div className="shape-cal-head">
        <span>Weeks</span>
        {live ? (
          <span className="shape-spans">
            {ENGAGEMENTS.map((x) => (
              <b key={x.key} className="shape-span">
                {x.span}
              </b>
            ))}
          </span>
        ) : (
          <b className="shape-span">{e.span}</b>
        )}
      </div>

      <div className="shape-scale" aria-hidden="true">
        {Array.from({ length: WEEKS }, (_, i) => (
          <span key={i}>{pad(i + 1)}</span>
        ))}
      </div>

      <div className="shape-track">
        <div className="shape-cells" aria-hidden="true">
          {Array.from({ length: WEEKS }, (_, i) => (
            <span key={i} className="shape-cell">
              {/* No timeline on the stacked branch, so the shape is drawn here. */}
              <i className="shape-mark" style={live ? undefined : markStyle(e.shape, i)} />
            </span>
          ))}
        </div>
        {live && <span className="shape-playhead" aria-hidden="true" />}

        {(live ? ENGAGEMENTS : [e]).map((x) => (
          <div key={x.key} className="shape-flags" aria-hidden="true">
            {x.flags.map(([week, label]) => (
              <span key={label + week} className="shape-flag" style={{ left: `${((week - 1) / WEEKS) * 100}%` }}>
                <i />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Facts({ index }: { index: number }) {
  const e = ENGAGEMENTS[index];
  return (
    <dl className="shape-facts">
      <div>
        <dt>Good for</dt>
        <dd>{e.goodFor}</dd>
      </div>
      <div>
        <dt>How it starts</dt>
        <dd>{e.starts}</dd>
      </div>
      <div>
        <dt>You get</dt>
        <dd>{e.get}</dd>
      </div>
      <div className="shape-ask">
        <dt className="sr-only">Next</dt>
        <dd>
          <Ask subject={`Brief: ${e.name}`}>Start this way</Ask>
        </dd>
      </div>
    </dl>
  );
}

/* ------------------------------------------------------------------ *
 * The brief
 * ------------------------------------------------------------------ */
function Brief() {
  const [needs, setNeeds] = useState<string[]>([]);
  const [way, setWay] = useState<string>(ENGAGEMENTS[0].key);
  const chosen = ENGAGEMENTS.find((e) => e.key === way) ?? ENGAGEMENTS[0];

  const toggle = (n: string) =>
    setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  const body = [
    "Hi Kim,",
    "",
    "What I need:",
    ...(needs.length ? needs.map((n) => `- ${n}`) : ["- (not sure yet)"]),
    "",
    `How I'd like to work: ${chosen.name}`,
    "",
    "A bit more about it:",
    "",
  ].join("\n");
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Brief: ${chosen.name}`)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="brief shell" data-od-id="brief">
      <div className="brief-ask">
        <p className="eyebrow">Or skip the reading</p>
        <h3 className="brief-title">Tick what you need. The brief writes itself.</h3>

        <fieldset className="brief-set">
          <legend>What do you need?</legend>
          <div className="brief-chips">
            {BRIEF_NEEDS.map((n) => (
              <button
                key={n}
                type="button"
                className="brief-chip"
                aria-pressed={needs.includes(n)}
                onClick={() => toggle(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="brief-set">
          <legend>How would you like to work?</legend>
          <div className="brief-chips" role="radiogroup" aria-label="How would you like to work?">
            {ENGAGEMENTS.map((e) => (
              <button
                key={e.key}
                type="button"
                role="radio"
                className="brief-chip"
                aria-checked={way === e.key}
                onClick={() => setWay(e.key)}
              >
                {e.name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="brief-printer">
        <span className="brief-slot" aria-hidden="true" />
        <div className="brief-paper" aria-live="polite" data-od-id="brief-paper">
          <p className="brief-paper-head">
            <b>Brief</b>
            <span>
              {pad(needs.length)} item{needs.length === 1 ? "" : "s"}
            </span>
          </p>

          <ul className="brief-lines">
            {needs.length === 0 && <li className="brief-empty">Nothing ticked yet.</li>}
            {needs.map((n, i) => (
              <li key={n} className="brief-line">
                <i>{pad(i + 1)}</i>
                <span>{n}</span>
              </li>
            ))}
          </ul>

          {/* Keyed so the two lines reprint when the arrangement changes. */}
          <div key={chosen.key} className="brief-way">
            <p>
              <i>Working as</i>
              <span>{chosen.name}</span>
            </p>
            <p>
              <i>Next step</i>
              <span>{chosen.starts}</span>
            </p>
          </div>

          <a className="btn btn--primary brief-send" href={href} data-od-id="brief-send">
            Email this brief
            <Icon name="arrow" className="arrow-ic" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Engagement() {
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

  /* The playhead's travel is measured from the track, so a resize rebuilds. */
  useEffect(() => {
    let width = window.innerWidth;
    let timer = 0;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
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
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q(".eng-head > * > *"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
      gsap.from(q(".brief-ask > *, .brief-printer"), {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.08,
        scrollTrigger: { trigger: q(".brief")[0], start: "top 80%", once: true },
      });

      if (compact) {
        (q(".shape-card") as HTMLElement[]).forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 34,
            duration: 0.7,
            scrollTrigger: { trigger: card, start: "top 84%", once: true },
          });
        });
        return;
      }

      const marks = q(".shape-mark") as HTMLElement[];
      const panels = q(".shape-panel") as HTMLElement[];
      const flags = q(".shape-flags") as HTMLElement[];
      const spans = q(".shape-span") as HTMLElement[];
      const track = q(".shape-track")[0] as HTMLElement | undefined;
      const playhead = q(".shape-playhead")[0];
      if (marks.length !== WEEKS || panels.length !== N || !track || !playhead) return;

      const travel = track.offsetWidth;
      const shapeOf = (k: number) => MARK[ENGAGEMENTS[k].shape];
      const reach = (k: number) => travel * REACH[ENGAGEMENTS[k].shape];
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      /* arrangement 0, as found: the marks draw in, then time starts passing */
      tl.fromTo(
        marks,
        { scaleX: 0, scaleY: 1, opacity: 1 },
        { ...shapeOf(0)(0), duration: 0.4, ease: "back.out(2)", stagger: 0.035 },
        0,
      )
        .fromTo(
          flags[0].children,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 },
          0.3,
        )
        .fromTo(playhead, { x: 0 }, { x: reach(0), duration: STEP - MORPH - 0.2, ease: "none" }, 0.2)
        .fromTo(q(".shape-count-strip"), { yPercent: 0 }, { yPercent: 0, duration: 0.01 }, 0);

      for (let k = 1; k < N; k++) {
        const at = k * STEP - MORPH;
        const a = shapeOf(k - 1);
        const b = shapeOf(k);

        /* the morph: every mark changes length and weight, in a wave */
        tl.fromTo(
          marks,
          {
            scaleX: (i: number) => a(i).scaleX,
            scaleY: (i: number) => a(i).scaleY,
            opacity: (i: number) => a(i).opacity,
          },
          {
            scaleX: (i: number) => b(i).scaleX,
            scaleY: (i: number) => b(i).scaleY,
            opacity: (i: number) => b(i).opacity,
            duration: 0.5,
            ease: "back.inOut(1.6)",
            stagger: 0.03,
            immediateRender: false,
          },
          at,
        );

        /* the playhead rewinds during the morph, then runs this shape's length */
        tl.fromTo(
          playhead,
          { x: reach(k - 1) },
          { x: 0, duration: MORPH * 0.7, ease: "power2.inOut", immediateRender: false },
          at,
        ).fromTo(
          playhead,
          { x: 0 },
          {
            x: reach(k),
            duration: (k === N - 1 ? END : (k + 1) * STEP - MORPH) - k * STEP - 0.1,
            ease: "none",
            immediateRender: false,
          },
          k * STEP,
        );

        /* flags, the span readout, the counter */
        tl.fromTo(
          flags[k - 1].children,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -10, duration: 0.2, ease: "power1.in", immediateRender: false },
          at,
        )
          .fromTo(
            flags[k].children,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 },
            at + MORPH - 0.2,
          )
          .fromTo(
            spans[k - 1],
            { autoAlpha: 1, yPercent: 0 },
            { autoAlpha: 0, yPercent: -60, duration: 0.25, ease: "power1.in", immediateRender: false },
            at,
          )
          .fromTo(spans[k], { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.35 }, at + 0.3)
          .fromTo(
            q(".shape-count-strip"),
            { yPercent: (-(k - 1) * 100) / N },
            { yPercent: (-k * 100) / N, duration: 0.5, ease: "power3.inOut", immediateRender: false },
            at + 0.1,
          );

        /* the words: the old panel is wiped off from the top, the new one on */
        tl.fromTo(
          panels[k - 1],
          { autoAlpha: 1, clipPath: "inset(0% 0 0% 0)" },
          { autoAlpha: 0, clipPath: "inset(0% 0 100% 0)", duration: 0.35, ease: "power2.in", immediateRender: false },
          at,
        )
          .fromTo(
            panels[k],
            { autoAlpha: 0, clipPath: "inset(100% 0 0% 0)" },
            { autoAlpha: 1, clipPath: "inset(0% 0 0% 0)", duration: 0.5, ease: "power3.out" },
            at + 0.35,
          )
          .fromTo(
            panels[k].querySelectorAll(".shape-facts > div"),
            { autoAlpha: 0, x: -16 },
            { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.08 },
            at + 0.55,
          );
      }
      tl.to({}, { duration: 0.01 }, END);

      ScrollTrigger.create({
        trigger: q(".shape")[0],
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        animation: tl,
      });

      (window.__timelines ??= {}).shape = tl;
      return () => {
        if (window.__timelines?.shape === tl) delete window.__timelines.shape;
      };
    },
    { scope: root, dependencies: [compact, layoutKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="engagement" data-od-id="engagement">
      <div className="shell rail eng-head pt-[clamp(64px,9vw,148px)] pb-[clamp(28px,3.4vw,56px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">04</div>
          <p className="eyebrow">Ways to work</p>
          <p className="rail-index">
            {N} arrangements · no packages
          </p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">
            Pick the shape that fits. The scope comes after a conversation, not off a price list.
          </p>
        </div>
        <div>
          <h2 className="h2">
            Four ways
            <br />
            to work together.
          </h2>
        </div>
      </div>

      {compact ? (
        /* Phone, and reduced motion: one card per arrangement, shape drawn. */
        <div className="shape-list shell" data-od-id="shape">
          {ENGAGEMENTS.map((e, i) => (
            <article key={e.key} className="shape-card" data-od-id={`way-${e.key}`}>
              <p className="shape-count">
                {pad(i + 1)} <span>/ {pad(N)}</span>
              </p>
              <h3 className="shape-name">{e.name}</h3>
              <p className="shape-line">{e.line}</p>
              <Calendar index={i} />
              <Facts index={i} />
            </article>
          ))}
        </div>
      ) : (
        <div className="shape" data-od-id="shape">
          <div className="shape-stage shell">
            <div className="shape-read">
              <p className="shape-count" aria-hidden="true">
                <span className="shape-count-mask">
                  <span className="shape-count-strip">
                    {ENGAGEMENTS.map((e, i) => (
                      <span key={e.key}>{pad(i + 1)}</span>
                    ))}
                  </span>
                </span>
                <span>/ {pad(N)}</span>
              </p>
              <div className="shape-panels">
                {ENGAGEMENTS.map((e, i) => (
                  <article key={e.key} className="shape-panel" data-od-id={`way-${e.key}`}>
                    <h3 className="shape-name">{e.name}</h3>
                    <p className="shape-line">{e.line}</p>
                    <Facts index={i} />
                  </article>
                ))}
              </div>
            </div>

            <Calendar index={0} live />
            <SkipPin runway=".shape" />
          </div>
        </div>
      )}

      <Brief />
    </section>
  );
}
