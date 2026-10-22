"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { HERO, HERO_LANDING, HERO_PROOF, HIRE, EMAIL, mailTo } from "@/lib/content";
import Icon from "./Icons";
import ClientsMarquee from "./ClientsMarquee";
import SkipPin from "./SkipPin";
import { Wordmark, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "./Wordmark";

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

/**
 * Hero — the face through the letters.
 *
 * Planes, back to front:
 *
 *   .hero-landing    where the dive arrives: a statement, four floating cards,
 *                    the client strip. A second sticky panel directly BEHIND
 *                    the stage, seen through it once the stage has emptied.
 *   .hero-world      the camera. Holds the electric wordmark and the figure,
 *                    and is only ever moved by the exit dive.
 *   .hero-fog        the canvas scrim the ink copy rides on.
 *   .hero-plate      a canvas-coloured sheet with KIM knocked out of it, laid in
 *                    the wordmark's exact box so each hole lands on its letter.
 *   .hero-copy       headline, lede, actions, meta.
 *
 * The page opens on the plate: the only thing visible is what shows through
 * the letters — the orange mark, and the portrait pushed in tight behind it.
 * The plate then opens from the I, the figure pulls back to its seat in front
 * of the mark, and the copy lands. On scroll the camera dives through the M's
 * notch and comes out in the landing, which was behind the letters all along:
 * the orange legs sweep off it as it resolves, its cards fly out of the notch
 * to their seats, and when the pin lets go it scrolls away as ordinary page.
 *
 * ---------------------------------------------------------------------------
 * Authored to the HyperFrames animation contract, mounted live instead of
 * rendered: ONE paused master timeline, registered on `window.__timelines.hero`,
 * whose every frame is a pure function of its time. `fromTo` with explicit
 * from-states, absolute values, transforms / opacity / filter only, nothing
 * random. So `__timelines.hero.time(t)` is correct for any `t`, in any order.
 *
 *   segment   time            driver
 *   intro     0    -> REST    played once on load
 *   exit      REST -> END     scroll, lg and up (the pinned runway)
 *
 *   intro     0.00  covers lift off the letters, K then I then M
 *             0.00  portrait drifts in behind them        (slow push)
 *             1.10  plate opens from the I; portrait pulls back to rest
 *             1.90  headline rises out of its line masks
 *             2.25  lede, actions, meta
 *   exit      0.00  copy leaves, fog clears
 *             0.00  camera dives into the M notch          (0 -> 75%)
 *             0.00  figure sinks under the camera, softening (0 -> 35%)
 *             0.55  landing resolves behind the letters      (28 -> 68%)
 *             0.80  cards fly out of the notch, statement rises
 *             1.75  held                                    (88 -> 100%)
 *
 * One property per node per segment. `.hero-portrait` owns the intro push
 * (transform) and the exit rack (filter); `.hero-media` owns the exit sink —
 * he leaves the frame opaque, because a figure fading out over the letters
 * reads as an x-ray; `.hero-world` owns the dive. Every exit tween is `immediateRender: false`,
 * or its from-state would stamp over the intro's at build time.
 *
 * Below lg there is no runway: the intro plays in full and the scroll only
 * drifts the planes against each other.
 * ---------------------------------------------------------------------------
 */

const REST = 3.1;
const EXIT = 2;
const END = REST + EXIT;

/* Points on the artwork, as fractions — measured off the assets once, so the
   camera is aimed by the composition and not by whatever the layout reports
   mid-tween. */
const PORTRAIT = { w: 1303, h: 1434, eyeX: 0.491, eyeY: 0.293, headW: 0.178 } as const;
const I_STEM = { cx: 402.95, w: 93.05 } as const;
/* The notch is the wedge of canvas between the M's diagonals: 105 units wide
   at the cap line, closing to a point 263.6 units down. The dive is aimed a
   little way into it. */
const M_NOTCH = { cx: 734.6, y: 70, halfTop: 52.4, apex: 263.6 } as const;

const PLATE_PATH = `M-40000 -40000H40000V40000H-40000Z ${WORDMARK_PATHS.join(" ")}`;
/* The covers that hold the letters shut before the intro: K, I, M. Each lifts
   on its own cue — the stagger lives here so the CSS keyframes stay generic. */
const PLATE_COVERS = [
  { left: "-0.5%", width: "34.4%", animationDelay: "0s" },
  { left: "36.7%", width: "10.8%", animationDelay: "0.07s" },
  { left: "53%", width: "47.5%", animationDelay: "0.14s" },
] as const;

/* The wordmark's box, shared verbatim by the plate so the two cannot drift. */
const MARK_BOX =
  "absolute inset-x-0 mx-auto top-[clamp(76px,12svh,130px)] w-[98vw] max-w-[1240px] sm:w-[94vw] lg:top-[90px] lg:w-[82vw]";

/* Where each landing card sits from lg up — the four quadrants around the
   statement. Below lg they are a plain two-up grid. */
const CARD_SEATS = [
  "lg:left-[5vw] lg:top-[21%] xl:left-[9vw]",
  "lg:right-[5vw] lg:top-[25%] xl:right-[8vw]",
  "lg:left-[8vw] lg:bottom-[15%] xl:left-[13vw]",
  "lg:right-[7vw] lg:bottom-[18%] xl:right-[12vw]",
] as const;

const CARD_LINKS = ["#work", "#automations", "#automations", "#capabilities"] as const;

/* Runs as the HTML is parsed, after the stage exists and before first paint.
   The intro itself is CSS now, so it starts at first paint instead of waiting
   for the bundle to hydrate — which is what used to leave the page as a blank
   canvas sheet while the JS arrived. CSS cannot know three things without a
   browser: where the eye sits in the artwork, how far the figure must be
   pushed in for the face to read across the letters, and how far the plate
   must open for the I's hole to swallow the stage. So this measures them,
   writes them as custom properties, and tags the section `data-intro` so the
   keyframes run; `data-live` switches on the pinned runway and tucks the
   landing behind the stage. Skipped for reduced motion; and if the GSAP
   timeline never arrives to take the exit over, it stands the runway back
   down and leaves the resting hero. */
const INTRO_SETUP = `(function(){try{
var s=document.currentScript.parentElement;if(!s)return;
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var stage=s.querySelector(".hero-stage"),mark=s.querySelector(".hero-wordmark"),
portrait=s.querySelector(".hero-portrait"),img=s.querySelector(".hero-portrait img");
if(!stage||!mark||!portrait||!img)return;
var sr=stage.getBoundingClientRect(),mr=mark.getBoundingClientRect(),
pr=portrait.getBoundingClientRect(),ir=img.getBoundingClientRect();
var unit=mr.width/${WORDMARK_VIEWBOX.w};
var fit=getComputedStyle(img).objectFit==="contain"?Math.min:Math.max;
var k=fit(ir.width/${PORTRAIT.w},ir.height/${PORTRAIT.h});
var artLeft=ir.left+(ir.width-${PORTRAIT.w}*k)/2,artTop=ir.bottom-${PORTRAIT.h}*k;
var eyeX=artLeft+${PORTRAIT.w}*k*${PORTRAIT.eyeX},eyeY=artTop+${PORTRAIT.h}*k*${PORTRAIT.eyeY};
var push=Math.max(1.6,Math.min(2.4,(mr.width*0.44)/(${PORTRAIT.w}*k*${PORTRAIT.headW})));
var pushX=mr.left+mr.width/2-eyeX,pushY=mr.top+mr.height/2-eyeY;
var stemX=mr.left-sr.left+${I_STEM.cx}*unit,stemY=mr.top-sr.top+mr.height/2;
var open=1.1*Math.max(Math.max(stemX,sr.width-stemX)/(${I_STEM.w}*unit/2),Math.max(stemY,sr.height-stemY)/(mr.height/2));
var st=s.style;
st.setProperty("--hero-plate-open",String(open));
st.setProperty("--hero-eye-x",(eyeX-pr.left)+"px");
st.setProperty("--hero-eye-y",(eyeY-pr.top)+"px");
st.setProperty("--hero-push",String(push));
st.setProperty("--hero-push-x",pushX+"px");
st.setProperty("--hero-push-y",pushY+"px");
s.setAttribute("data-live","");s.setAttribute("data-intro","");
setTimeout(function(){if(!(window.__timelines&&window.__timelines.hero)){s.removeAttribute("data-intro");s.removeAttribute("data-live")}},2600);
}catch(e){}})()`;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  /* Wait for the faces (line boxes) and the portrait (the thing the intro
     reveals) — but never for long. */
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) setReady(true);
    };
    const img = root.current?.querySelector<HTMLImageElement>(".hero-portrait img");
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const decoded = img && !img.complete ? img.decode().catch(() => undefined) : Promise.resolve();
    Promise.all([fonts, decoded]).then(done, done);
    const cap = window.setTimeout(done, 2500);
    return () => {
      alive = false;
      window.clearTimeout(cap);
    };
  }, []);

  /* The camera is aimed from measurements taken at build time, so a change of
     width rebuilds the timeline rather than leaving it aimed at the old layout.
     Height-only changes are a phone's URL bar and are ignored. */
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
      const section = root.current;
      if (!ready || !section) return;

      const q = gsap.utils.selector(root);
      const release = () => {
        delete section.dataset.intro;
      };
      /* No timeline, no runway: the landing goes back to being the next block. */
      const standDown = () => {
        release();
        delete section.dataset.live;
      };

      if (prefersReducedMotion()) {
        standDown();
        return;
      }
      section.dataset.live = "";

      const stage = q(".hero-stage")[0] as HTMLElement | undefined;
      const mark = q(".hero-wordmark")[0] as HTMLElement | undefined;
      const plate = q(".hero-plate")[0] as HTMLElement | undefined;
      const world = q(".hero-world")[0] as HTMLElement | undefined;
      const portrait = q(".hero-portrait")[0] as HTMLElement | undefined;
      const img = q(".hero-portrait img")[0] as HTMLImageElement | undefined;
      const title = q(".hero-title")[0] as HTMLElement | undefined;
      const landing = q(".hero-landing")[0] as HTMLElement | undefined;
      const landingTitle = q(".hero-landing-title")[0] as HTMLElement | undefined;
      if (!stage || !mark || !plate || !world || !portrait || !img || !title || !landing || !landingTitle) {
        standDown();
        return;
      }

      /* ---- Measure once, with nothing transformed yet. ---- */
      const sr = stage.getBoundingClientRect();
      const mr = mark.getBoundingClientRect();
      const unit = mr.width / WORDMARK_VIEWBOX.w; // px per wordmark unit

      /* How far the camera must dive for the M's notch to do the same. A stage
         corner is clear once it maps to a point above the cap line (open
         canvas) or inside the wedge. */
      const notchX = mr.left - sr.left + M_NOTCH.cx * unit;
      const notchY = mr.top - sr.top + M_NOTCH.y * unit;
      const clears = (s: number) =>
        [0, sr.width].every((cx) =>
          [0, sr.height].every((cy) => {
            const uy = M_NOTCH.y + (cy - notchY) / s / unit;
            if (uy <= 0) return true;
            const ux = Math.abs((cx - notchX) / s / unit);
            return uy < M_NOTCH.apex && ux <= M_NOTCH.halfTop * (1 - uy / M_NOTCH.apex);
          }),
        );
      let dive = 6;
      while (dive < 90 && !clears(dive)) dive += 1;
      dive *= 1.12;

      /* ---- Fixed state for the run. ---- */
      /* The plate and the figure's push are CSS now, so the one thing GSAP has
         to aim is the camera: the world scales about the notch it dives through. */
      gsap.set(world, { transformOrigin: `${notchX}px ${notchY}px` });

      /* SplitText still splits the headline — not for the intro, which the CSS
         keyframes carry, but because the exit lifts it out a line at a time. */
      const split = new SplitText(title, { type: "lines", linesClass: "split-line", mask: "lines" });
      const rest = q(".hero-hire, .hero-lede, .hero-actions, .hero-meta, .hero-skip");

      /* The landing. Its cards leave from the notch the camera came through,
         so each one's start is the vector from its seat back to that point. */
      const landingSplit = new SplitText(landingTitle, {
        type: "lines",
        linesClass: "split-line",
        mask: "lines",
      });
      const cards = q(".hero-card") as HTMLElement[];
      const fromNotch = cards.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: (sr.left + notchX - (r.left + r.width / 2)) * 0.7,
          y: (sr.top + notchY - (r.top + r.height / 2)) * 0.7,
        };
      });
      gsap.set(q(".hero-landing-scene"), { transformOrigin: `${notchX}px ${notchY}px` });

      /* ---- The one timeline: the exit, and the landing it arrives in. ----
         The intro has no segment here any more: it is pure CSS, played at
         first paint. What is left is everything the scroll drives, which is
         the part that has to be a seekable function of time. */
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

      /* exit */
      tl.fromTo(
        split.lines,
        { y: 0 },
        {
          y: (_i: number, el: Element) => -(el as HTMLElement).offsetHeight * 1.25,
          duration: 0.5,
          ease: "power2.in",
          stagger: 0.08,
          immediateRender: false,
        },
        REST,
      )
        .fromTo(
          rest,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -16, duration: 0.35, ease: "power1.in", stagger: 0.04, immediateRender: false },
          REST,
        )
        .fromTo(
          q(".hero-fog"),
          { opacity: 1 },
          { opacity: 0, duration: 0.5, ease: "none", immediateRender: false },
          REST + 0.1,
        )
        .fromTo(
          world,
          { scale: 1 },
          { scale: dive, duration: 1.35, ease: "power2.in", immediateRender: false },
          REST,
        )
        .fromTo(
          q(".hero-media"),
          { yPercent: 0 },
          { yPercent: 60, duration: 0.7, ease: "power2.in", immediateRender: false },
          REST,
        )
        .fromTo(
          portrait,
          { filter: "blur(0px)" },
          { filter: "blur(8px)", duration: 0.7, ease: "power2.in", immediateRender: false },
          REST,
        )
        .fromTo(
          q(".hero-media"),
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.2, ease: "none", immediateRender: false },
          REST + 0.6,
        );

      /* arrival — the landing's own entrance. Only built where the landing is
         pinned behind the stage: these tweens put their from-states on the
         nodes straight away (so a card is never seen sitting in its seat
         before it flies in), and below lg, where the timeline never reaches
         them, that would leave the landing hidden for good. */
      if (window.matchMedia("(min-width: 1024px)").matches) {
          tl.fromTo(
            landing,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.4, ease: "power1.out"},
            REST + 0.55,
          )
          .fromTo(
            q(".hero-landing-scene"),
            { scale: 0.8 },
            { scale: 1, duration: 0.9, ease: "power3.out"},
            REST + 0.55,
          )
          .fromTo(
            cards,
            {
              autoAlpha: 0,
              scale: 0.4,
              x: (i: number) => fromNotch[i].x,
              y: (i: number) => fromNotch[i].y,
              rotation: (i: number) => (i % 2 ? 10 : -10),
            },
            {
              autoAlpha: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.07,
            },
            REST + 0.8,
          )
          .fromTo(
            q(".hero-landing-eyebrow"),
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.35},
            REST + 0.9,
          )
          .fromTo(
            landingSplit.lines,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.08},
            REST + 0.95,
          )
          .fromTo(
            q(".hero-landing .marquee"),
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.45},
            REST + 1.25,
          );
      }

      tl.addLabel("rest", REST)
        .addLabel("end", END);

      (window.__timelines ??= {}).hero = tl;

      /* The reveal is CSS and runs on its own clock from first paint; the
         timeline rides at rest until the scroll takes the playhead over. */
      tl.time(REST);

      /* ---- Drivers. ---- */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            gsap.to(tl, {
              time: REST + self.progress * EXIT,
              duration: 0.45,
              ease: "power3.out",
              overwrite: true,
            });
          },
        });
        /* Loaded part-way down the runway: start where the scroll already is. */
        if (st.progress > 0) tl.time(REST + st.progress * EXIT);
      });

      mm.add("(max-width: 1023px)", () => {
        const scrub = () => ({
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true as const,
        });
        gsap.fromTo(q(".hero-media"), { scale: 1 }, { scale: 1.08, ease: "none", scrollTrigger: scrub() });
        gsap.fromTo(q(".hero-wordmark"), { y: 0 }, { y: -20, ease: "none", scrollTrigger: scrub() });
        gsap.fromTo(q(".hero-copy"), { y: 0 }, { y: -30, ease: "none", scrollTrigger: scrub() });
        /* The landing is the next block here, so it arrives the ordinary way. */
        gsap.from(q(".hero-landing-eyebrow, .hero-landing-title, .hero-card"), {
          y: 26,
          opacity: 0,
          duration: 0.7,
          stagger: 0.07,
          scrollTrigger: { trigger: landing, start: "top 78%", once: true },
        });
      });

      /* The cards' idle drift, on its own wrapper so it never meets the
         timeline's transform on the card itself. */
      (q(".hero-card-float") as HTMLElement[]).forEach((el, i) =>
        gsap.to(el, {
          y: i % 2 ? 9 : -9,
          rotation: i % 2 ? -1 : 1,
          duration: 3.2 + i * 0.45,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.3,
        }),
      );

      /* Idle breathe on the artwork itself — a node the timeline never touches. */
      gsap.to(img, {
        scale: 1.012,
        transformOrigin: "50% 100%",
        duration: 3.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: REST,
      });

      return () => {
        if (window.__timelines?.hero === tl) delete window.__timelines.hero;
      };
    },
    { scope: root, dependencies: [ready, layoutKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="top" className="hero relative" data-od-id="hero" suppressHydrationWarning>
      {/* One stage on every viewport. Below lg it is a bottom-anchored flex
          column over the absolute planes; from lg it is the sticky pinned panel
          and every plane is absolute. */}
      <div className="hero-stage relative flex min-h-svh flex-col justify-end overflow-hidden lg:sticky lg:top-0 lg:block lg:h-svh">
        {/* 1 — the camera: the wordmark, and the figure standing in front of it. */}
        <div className="hero-world pointer-events-none absolute inset-0">
          <div className={`hero-wordmark ${MARK_BOX}`} aria-hidden="true">
            <Wordmark className="w-full" />
          </div>

          {/* Below lg the figure is shifted down 72px so the head clears the
              nav; from lg the asset's own transparent headroom does that job
              and `contain` fits it to the stage height exactly. Below lg
              `cover` scales by height (a phone is narrower than the crop), so
              the whole figure stays and the arms crop. */}
          <div className="hero-media absolute inset-x-0 bottom-0 top-[72px] z-10 flex items-end justify-center lg:top-0 lg:h-svh">
            <div className="hero-portrait flex h-full w-full items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/kim-portrait-hero.webp"
                width={PORTRAIT.w}
                height={PORTRAIT.h}
                alt="Kim Joshua, automation and web developer"
                fetchPriority="high"
                className="h-full w-full object-cover object-[50%_100%] lg:object-contain"
              />
            </div>
          </div>
        </div>

        {/* 2 — the canvas fog: the figure's lower half dissolves into the
               canvas, and the ink copy gets a guaranteed light ground. */}
        <div className="hero-fog" aria-hidden="true" />

        {/* 3 — the intro plate, in the wordmark's own box. */}
        <div className={`hero-plate ${MARK_BOX}`} aria-hidden="true">
          <svg
            viewBox={`0 0 ${WORDMARK_VIEWBOX.w} ${WORDMARK_VIEWBOX.h}`}
            className="block w-full overflow-visible"
            focusable="false"
          >
            <path d={PLATE_PATH} fillRule="evenodd" fill="currentColor" />
          </svg>
          {PLATE_COVERS.map((c) => (
            <span key={c.left} className="hero-plate-cover" style={c} />
          ))}
        </div>

        {/* The way past the hold. Only where there is one, and it leaves with
            the copy: once the dive is under way there is nothing left to skip. */}
        <SkipPin runway=".hero" className="hero-skip" />

        {/* 4 — the copy. Ink on the fog, sized in `svh` below lg so it can
               never outgrow the figure behind it. */}
        <div className="shell hero-copy relative z-30 flex flex-col items-center pb-[clamp(16px,3svh,34px)] pt-[6px] text-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:pt-0 lg:pb-[clamp(24px,3vw,44px)]">
          <p className="hero-hire mb-[clamp(8px,1.4svh,14px)] inline-flex max-w-full flex-wrap items-center justify-center gap-x-[10px] gap-y-[2px] rounded-[20px] border border-brown/30 bg-canvas/70 px-[14px] py-[5px] text-[clamp(10.5px,1.45svh,13px)] leading-[1.35] text-ink lg:mb-[16px] lg:text-[13px]">
            <span className="inline-flex items-baseline gap-[8px]">
              <span className="hero-hire__dot" aria-hidden="true" />
              <span>{HIRE.text}</span>
            </span>
            <span className="inline-flex gap-[10px]">
              <a href={mailTo(HIRE.cv.subject)} className="underline underline-offset-2 transition-colors hover:text-electric">
                {HIRE.cv.label}
              </a>
              <a href={HIRE.github.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-electric">
                {HIRE.github.label}
              </a>
            </span>
          </p>

          <h1 className="hero-title font-display text-[clamp(26px,3.9svh,40px)] font-medium leading-[1.05] tracking-[-0.025em] text-ink lg:text-[clamp(34px,4.5vw,66px)] lg:leading-[1.02]">
            {HERO.titleLines.map((line) => (
              // The trailing space keeps SplitText's generated aria-label from
              // gluing the lines into "work.Systems".
              <span key={line} className="block">
                {line}{" "}
              </span>
            ))}
          </h1>

          <p className="hero-lede mt-[clamp(9px,1.5svh,16px)] max-w-[46ch] text-[clamp(12.5px,1.7svh,16px)] leading-[1.5] text-ink/80 lg:mt-[16px] lg:text-[clamp(15px,1.1vw,17px)] lg:leading-[1.55]">
            {HERO.lede}
          </p>

          <div className="hero-actions mt-[clamp(12px,2svh,22px)] flex flex-wrap items-center justify-center gap-[clamp(8px,1.2svh,18px)]">
            <a
              href={`mailto:${EMAIL}`}
              className="btn btn--primary min-h-[44px] px-4 text-[14px] max-[340px]:px-3 max-[340px]:text-[13px] lg:min-h-[48px] lg:px-6 lg:text-[15px]"
              data-od-id="hero-cta"
            >
              {HERO.cta}
              <Icon name="arrow" className="arrow-ic" />
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="btn btn--ghost min-h-[44px] border-brown/45 px-4 text-[14px] text-ink max-[340px]:px-3 max-[340px]:text-[13px] hover:border-brown hover:bg-surface lg:min-h-[48px] lg:px-6 lg:text-[15px]"
            >
              {EMAIL}
            </a>
          </div>

          <p className="hero-meta mt-[clamp(9px,1.7svh,18px)] text-[clamp(10.5px,1.45svh,13px)] tracking-[0.01em] text-brown lg:mt-[18px] lg:text-[13px]">
            {HERO.meta}
          </p>

          <p className="hero-meta mt-[clamp(4px,1svh,7px)] text-[clamp(9.5px,1.2svh,11.5px)] uppercase tracking-[0.07em] text-brown/70 lg:mt-[7px] lg:text-[11.5px]">
            Built for{" "}
            <Link href="/work/passivae" className="underline underline-offset-2 hover:text-electric transition-colors">
              Passivae
            </Link>{" "}
            ·{" "}
            <Link href="/work/monno" className="underline underline-offset-2 hover:text-electric transition-colors">
              monno
            </Link>{" "}
            ·{" "}
            <Link href="/work/trestle" className="underline underline-offset-2 hover:text-electric transition-colors">
              Trestle
            </Link>{" "}
            ·{" "}
            <Link href="/work/owwo" className="underline underline-offset-2 hover:text-electric transition-colors">
              OWWO Chicken
            </Link>
          </p>
        </div>
      </div>

      {/* Pre-paint: measures the intro's unknowns and starts the CSS reveal.
          It sits after the stage because it has to read the stage. */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_SETUP }} />

      {/* 5 — the landing. Markup-wise the block after the stage, which is all it
             is below lg and without motion; live, CSS pins it behind the stage. */}
      <div className="hero-landing flex flex-col bg-canvas">
        <div className="hero-landing-scene shell relative flex flex-1 flex-col items-center justify-center py-[clamp(56px,9svh,96px)] text-center lg:py-0">
          <p className="eyebrow eyebrow--bare hero-landing-eyebrow justify-center">{HERO_LANDING.eyebrow}</p>
          <h2 className="hero-landing-title mt-[14px] max-w-[19ch] font-display text-[clamp(30px,7.4vw,44px)] font-medium leading-[1.04] tracking-[-0.025em] text-ink lg:mt-[18px] lg:max-w-none lg:text-[clamp(40px,4.3vw,72px)]">
            {HERO_LANDING.titleLines.map((line) => (
              <span key={line} className="lg:block">
                {line}{" "}
              </span>
            ))}
          </h2>

          <div className="mt-[clamp(26px,5svh,44px)] grid w-full max-w-[520px] grid-cols-2 gap-[10px] sm:gap-[14px] lg:contents">
            {HERO_LANDING.cards.map((card, i) => (
              <div key={card.title} className={`hero-card lg:absolute lg:w-[clamp(190px,16vw,244px)] ${CARD_SEATS[i]}`}>
                <div className="hero-card-float h-full">
                  <a
                    href={CARD_LINKS[i]}
                    className="hero-glass flex h-full flex-col items-start gap-[10px] p-[14px] text-left transition-transform duration-200 hover:scale-[1.03] hover:border-electric/40 lg:gap-[14px] lg:p-[18px]"
                  >
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-electric text-white lg:h-[40px] lg:w-[40px]">
                      <Icon name={card.icon} className="h-[16px] w-[16px] lg:h-[18px] lg:w-[18px]" />
                    </span>
                    <span>
                      <span className="block font-display text-[17px] font-medium leading-[1.1] tracking-[-0.01em] text-ink lg:text-[21px]">
                        {card.title}
                      </span>
                      <span className="mt-[5px] block text-[11.5px] leading-[1.35] text-brown lg:text-[13px]">
                        {card.note}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ClientsMarquee />
      </div>
    </section>
  );
}
