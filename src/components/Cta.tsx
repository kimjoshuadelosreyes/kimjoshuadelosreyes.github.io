"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { CTA, EMAIL, FOOTER } from "@/lib/content";
import Icon from "./Icons";

/**
 * The close.
 *
 * One question, one address, two ways out. The headline rises out of its line
 * masks; the address is set large and is itself the control — press it and it
 * is copied, and a stamp comes down on it to say so. The move here is the
 * STAMP: a hard press with a little recoil, and nothing that glows.
 */
export default function Cta() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(0);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const title = q(".cta-title")[0] as HTMLElement | undefined;
      if (!title) return;

      /* `autoSplit` re-splits when the fonts land or the width changes, and the
         tween is built inside `onSplit` so it always animates the live lines. */
      SplitText.create(title, {
        type: "lines",
        linesClass: "split-line",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
          }),
      });
      gsap.from(q(".cta-fade"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: "top 64%", once: true },
      });
    },
    { scope: root },
  );

  /* The stamp, every time the address is copied. */
  useGSAP(
    () => {
      if (!copied || !root.current) return;
      const stamp = root.current.querySelector(".cta-stamp");
      const mail = root.current.querySelector(".cta-mail");
      if (!stamp) return;
      if (prefersReducedMotion()) {
        gsap.set(stamp, { autoAlpha: 1, scale: 1, rotation: -9 });
        return;
      }
      gsap
        .timeline()
        .fromTo(
          stamp,
          { autoAlpha: 0, scale: 2.4, rotation: -24 },
          { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.22, ease: "power4.in" },
        )
        .fromTo(mail, { y: 0 }, { y: 5, duration: 0.07, ease: "power1.out" }, 0.2)
        .to(mail, { y: 0, duration: 0.4, ease: "elastic.out(1.1, 0.4)" }, 0.27)
        .to(stamp, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, 2.2);
    },
    { scope: root, dependencies: [copied] },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied((n) => n + 1);
    } catch {
      /* No clipboard (an old browser, or permission refused): the address is
         still a link's worth of text, so open the mail client instead. */
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section ref={root} className="band on-dark cta" data-od-id="cta">
      <div className="shell">
        <p className="eyebrow">{CTA.eyebrow}</p>
        <h2 className="cta-title mt-5 font-display text-[clamp(40px,7.4vw,128px)] font-medium leading-[1] tracking-[-0.035em]">
          {CTA.titleLines.map((line) => (
            <span key={line} className="block">
              {line}{" "}
            </span>
          ))}
        </h2>

        <div className="cta-row">
          <p className="cta-fade cta-copy">{CTA.copy}</p>

          <div className="cta-fade cta-contact">
            <button type="button" className="cta-mail" onClick={copy} data-od-id="cta-mail" aria-describedby="cta-hint">
              {EMAIL}
              <span className="cta-stamp" aria-hidden="true">
                Copied
              </span>
            </button>
            <p id="cta-hint" className="cta-hint">
              Press the address to copy it.
            </p>
            <p className="sr-only" aria-live="polite">
              {copied ? "Email address copied." : ""}
            </p>

            <div className="cta-actions">
              <a href={`mailto:${EMAIL}`} className="btn btn--primary" data-od-id="cta-button">
                {CTA.cta}
                <Icon name="arrow" className="arrow-ic" />
              </a>
              {FOOTER.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="btn btn--onDark">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
