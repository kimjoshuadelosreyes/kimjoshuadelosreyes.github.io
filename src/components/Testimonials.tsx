"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { HERO, PROMISES, PROOF_FACTS, PROOF_QUOTES } from "@/lib/content";
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "./Wordmark";
import Ask from "./Ask";

/**
 * Proof — the x-ray, then the working agreement.
 *
 * There are no client quotes yet, and an invented one is the single kind of
 * fake a prospect can catch. So the section offers proof that is true today:
 *
 *   1. The x-ray. A miniature of this site's own hero with a handle across it.
 *      Left of the handle is the finished frame; right of it is the same frame
 *      taken apart — outlines, class names, and the timeline that drives it,
 *      drawn from the hero's real cue times. The move is a WIPE under the
 *      reader's own hand: drag it, or use the arrow keys.
 *   2. Placeholder quotes, labelled as placeholders, so the slot exists.
 *   3. The working agreement: four promises, each underlined in ink as it
 *      arrives, and signed. The move is HANDWRITING.
 *
 * Nothing here is pinned and nothing is scrubbed: after five held sections the
 * page lets the reader drive. So this is the one section with no entry in
 * `window.__timelines`.
 */

/* The hero's real cues, in seconds of its 3.1s intro — the same numbers as the
   timeline in Hero.tsx. If those move, move these. */
const REST = 3.1;
const TRACKS = [
  { name: ".hero-plate", from: 0, to: 2.4, note: "covers lift, then scale 1 → 15.6" },
  { name: ".hero-portrait", from: 0, to: 2.4, note: "scale 2.4 → 1" },
  { name: ".hero-title", from: 1.9, to: 2.94, note: "SplitText, 2 lines" },
  { name: ".hero-lede + actions", from: 2.25, to: 3.1, note: "opacity, y" },
] as const;

const START = 54; // where the handle rests, in % from the left

function MiniHero({ xray = false }: { xray?: boolean }) {
  return (
    <div className={`xray-mini${xray ? " xray-mini--wire" : ""}`}>
      {/* The scene: the same three things in the same places on both layers. */}
      <div className="xray-scene">
        <svg className="xray-mark" viewBox={`0 0 ${WORDMARK_VIEWBOX.w} ${WORDMARK_VIEWBOX.h}`} aria-hidden="true" focusable="false">
          {WORDMARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>

        {xray ? (
          <div className="xray-figure">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M0 0L100 100M100 0L0 100" />
            </svg>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="xray-figure" src="/img/kim-portrait-hero.webp" alt="" loading="lazy" />
        )}

        <div className="xray-copy">
          {HERO.titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <i />
        </div>

        {xray && (
          <>
            <span className="xray-tag xray-tag--mark">.hero-wordmark</span>
            <span className="xray-tag xray-tag--figure">.hero-portrait</span>
            <span className="xray-tag xray-tag--copy">.hero-title</span>
          </>
        )}
      </div>

      {/* Under the scene: what it is, or what drives it. */}
      {xray ? (
        <div className="xray-tracks">
          <p>
            <b>__timelines.hero</b>
            <span>0s → {REST}s</span>
          </p>
          {TRACKS.map((t) => (
            <div key={t.name} className="xray-track">
              {/* Bar first: the wipe comes from the left, so the names sit on
                  the side that is revealed first. */}
              <div>
                <i style={{ left: `${(t.from / REST) * 100}%`, width: `${((t.to - t.from) / REST) * 100}%` }} />
              </div>
              <span>{t.name}</span>
              <em>{t.note}</em>
            </div>
          ))}
        </div>
      ) : (
        <p className="xray-note">The hero, as you saw it at the top of this page.</p>
      )}
    </div>
  );
}

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);

  /* One writer for the handle: a CSS variable on the frame. The wipe, the
     handle and the range input all read it. */
  const setX = (pct: number) => {
    const v = Math.max(0, Math.min(100, pct));
    frame.current?.style.setProperty("--x", `${v}%`);
    if (range.current) range.current.value = String(Math.round(v));
  };

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointerdown") {
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.held = "";
    }
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect();
    setX(((e.clientX - r.left) / r.width) * 100);
  };

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q(".proof-head > * > *"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });

      /* The frame arrives finished, then takes itself apart once so the reader
         sees what the handle does before they touch it. */
      /* An observer rather than a ScrollTrigger: the sections above change
         height as they settle, and a trigger position stored at mount fired
         this early on a phone, before the frame was anywhere near the screen. */
      const sweep = { x: 100 };
      let swept: gsap.core.Tween | null = null;
      /* Closed from the start, so the sweep opens it rather than snapping it
         shut first. Without motion it simply stays at its resting split. */
      setX(100);
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          /* Already moved by hand or by key: there is nothing to demonstrate. */
          if (!frame.current || "held" in frame.current.dataset) return;
          swept = gsap.to(sweep, {
            x: START,
            duration: 1.4,
            ease: "power3.inOut",
            onComplete: () => {
              if (frame.current) frame.current.dataset.swept = "";
            },
            /* Once the reader has taken the handle, it is theirs. */
            onUpdate: () => {
              if (frame.current && "held" in frame.current.dataset) swept?.kill();
              else setX(sweep.x);
            },
          });
        },
        { threshold: 0.55 },
      );
      if (frame.current) io.observe(frame.current);
      gsap.from(q(".xray-fact"), {
        opacity: 0,
        x: 24,
        duration: 0.6,
        stagger: 0.09,
        scrollTrigger: { trigger: frame.current, start: "top 68%", once: true },
      });
      gsap.from(q(".proof-quote"), {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.09,
        scrollTrigger: { trigger: q(".proof-quotes")[0], start: "top 84%", once: true },
      });

      /* The agreement: each promise rises, then its underline is drawn. */
      (q(".pact-item") as HTMLElement[]).forEach((item) => {
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 82%", once: true } })
          .from(item.querySelectorAll(".pact-no, .pact-title, .pact-copy"), {
            opacity: 0,
            y: 22,
            duration: 0.55,
            stagger: 0.07,
          })
          .fromTo(
            item.querySelector(".pact-ink path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
            0.25,
          );
      });

      /* The signature, stroke by stroke, at writing speed. */
      const strokes = q(".pact-sign path");
      gsap.set(strokes, { strokeDashoffset: 1 });
      gsap.to(strokes, {
        strokeDashoffset: 0,
        duration: (i: number) => [0.28, 0.45, 0.22, 0.08, 0.8, 0.5][i] ?? 0.3,
        ease: "power1.inOut",
        stagger: { each: 0.26 },
        scrollTrigger: { trigger: q(".pact-sign")[0], start: "top 86%", once: true },
      });

      return () => {
        io.disconnect();
        swept?.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="testimonials" data-od-id="testimonials">
      <div className="shell rail proof-head pt-[clamp(64px,9vw,148px)] pb-[clamp(28px,3.4vw,56px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">05</div>
          <p className="eyebrow">Proof</p>
          <p className="rail-index">{PROOF_FACTS.length} facts · {PROMISES.length} promises</p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">
            This site is the reference. Take it apart.
          </p>
        </div>
        <div>
          <h2 className="h2">
            Don&apos;t take anyone&apos;s
            <br />
            word for it.
          </h2>
        </div>
      </div>

      {/* 1 — the x-ray */}
      <div className="xray shell" data-od-id="xray">
        <div
          ref={frame}
          className="xray-frame"
          style={{ "--x": `${START}%` } as React.CSSProperties}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
          data-od-id="xray-frame"
        >
          <div className="xray-a" aria-hidden="true">
            <MiniHero />
          </div>
          <div className="xray-b" aria-hidden="true">
            <MiniHero xray />
          </div>
          <span className="xray-handle" aria-hidden="true">
            <i />
          </span>
          <span className="xray-label xray-label--a" aria-hidden="true">
            Finished
          </span>
          <span className="xray-label xray-label--b" aria-hidden="true">
            Taken apart
          </span>
          {/* The same control for the keyboard and for assistive tech. */}
          <input
            ref={range}
            className="xray-range"
            type="range"
            min={0}
            max={100}
            defaultValue={START}
            aria-label="Drag to take this site's hero apart"
            onInput={(e) => {
              if (frame.current) frame.current.dataset.held = "";
              setX(Number(e.currentTarget.value));
            }}
          />
        </div>

        <ul className="xray-facts">
          {PROOF_FACTS.map((f) => (
            <li key={f.title} className="xray-fact">
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </li>
          ))}
          <li className="xray-fact xray-fact--hint">
            <p>
              On a desktop, open the console and type <code>__timelines</code>. They are all there.
            </p>
          </li>
        </ul>
      </div>

      {/* 2 — the quote slots, labelled for what they are */}
      <div className="proof-quotes shell" data-od-id="proof-quotes">
        {PROOF_QUOTES.map((qt, i) => (
          <figure key={i} className="proof-quote">
            {qt.placeholder && <span className="proof-quote-flag">Placeholder</span>}
            <blockquote>{qt.quote}</blockquote>
            <figcaption>
              <b>{qt.name}</b>
              <span>{qt.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 3 — the working agreement */}
      <div className="pact shell" data-od-id="pact">
        <div className="pact-intro">
          <p className="eyebrow">The working agreement</p>
          <h3 className="pact-heading">Until there are quotes, here is what I put in writing.</h3>
        </div>

        <ol className="pact-list">
          {PROMISES.map((p, i) => (
            <li key={p.title} className="pact-item">
              <span className="pact-no">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h4 className="pact-title">
                  {p.title}
                  <svg className="pact-ink" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path d="M2 7C40 2 78 10 118 6S196 3 236 7s44 2 62-1" pathLength={1} />
                  </svg>
                </h4>
                <p className="pact-copy">{p.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="pact-signed">
          <span>Signed,</span>
          <svg className="pact-sign" viewBox="0 0 280 124" role="img" aria-label="Kim">
            <path d="M34 18C32 50 29 78 27 104" pathLength={1} />
            <path d="M76 20C56 44 42 56 30 64C48 66 62 84 82 104" pathLength={1} />
            <path d="M100 64C97 80 96 94 101 102C106 107 113 100 117 92" pathLength={1} />
            <path d="M102 44L103.5 45.5" pathLength={1} />
            <path d="M117 92C119 78 123 66 129 64C137 62 135 86 135 102C137 82 145 64 153 64C161 64 159 86 159 102C161 82 169 64 177 64C185 64 183 88 187 100C191 108 206 102 238 84" pathLength={1} />
            <path d="M18 116C92 107 184 107 266 114" pathLength={1} />
          </svg>
        </div>

        <div className="section-ask pact-ask">
          <p>Those four go in the scope, in writing.</p>
          <Ask as="button" subject="Hold you to it: a project" id="proof-cta">
            Hold me to it
          </Ask>
        </div>
      </div>
    </section>
  );
}
