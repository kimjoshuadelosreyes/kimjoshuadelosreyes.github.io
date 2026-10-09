"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FAQS, RAIL_INDEX } from "@/lib/content";
import Ask from "./Ask";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * FAQ — ask it.
 *
 * A list of questions and one conversation. Pick a question and it is sent as
 * your message; the answer is typed back, character by character, with a caret.
 * The move here is TYPING, and it is the reader who starts it.
 *
 * From lg up the conversation sits beside the list and stays in view. Below lg
 * it opens directly under the question that was tapped, so the answer is always
 * where the thumb already is.
 *
 * The typing is decoration, so it never carries the content: the visible typed
 * text is hidden from assistive tech and the full answer is announced from a
 * live region the moment a question is picked. The server render holds the
 * first answer in full, so with no JavaScript there is still something to read,
 * and under reduced motion answers simply appear.
 */

function Thread({ index, armed }: { index: number; armed: boolean }) {
  const item = FAQS[index];
  const typed = useRef<HTMLSpanElement>(null);
  const bubble = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = typed.current;
      if (!el) return;
      /* Motion off: the whole answer, as rendered. */
      if (prefersReducedMotion()) {
        el.textContent = item.a;
        bubble.current?.removeAttribute("data-typing");
        return;
      }
      /* Not armed yet (the section is still off screen): wait empty. Showing
         the answer whole and then wiping it to type it reads as a blink. */
      if (!armed) {
        el.textContent = "";
        return;
      }

      const count = { n: 0 };
      el.textContent = "";
      bubble.current?.setAttribute("data-typing", "");
      gsap.fromTo(
        bubble.current!.parentElement!.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.12, ease: "power2.out" },
      );
      gsap.to(count, {
        n: item.a.length,
        /* A steady hand: about 90 characters a second, never longer than 2s. */
        duration: Math.min(2, item.a.length / 90),
        delay: 0.35,
        ease: "none",
        onUpdate: () => {
          el.textContent = item.a.slice(0, Math.round(count.n));
        },
        onComplete: () => bubble.current?.removeAttribute("data-typing"),
      });
    },
    { dependencies: [index, armed], revertOnUpdate: true },
  );

  return (
    <div className="ask-thread" data-od-id="ask-thread">
      <p className="ask-you">
        <span>You</span>
        {item.q}
      </p>
      <div ref={bubble} className="ask-me">
        <span>Kim</span>
        <p aria-hidden="true">
          <span ref={typed} className="ask-typed">
            {item.a}
          </span>
          <i className="ask-caret" />
        </p>
      </div>
      <p className="ask-follow">
        <Ask subject={`Following up: ${item.q}`}>Ask me this for real</Ask>
      </p>
      {/* The answer, whole, for anyone not watching it being typed. */}
      <p className="sr-only" aria-live="polite" data-od-id="ask-answer">
        {item.a}
      </p>
    </div>
  );
}

export default function Faq() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* The first answer types itself when the section arrives — once. */
  useEffect(() => {
    const el = root.current?.querySelector(".ask");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setArmed(true);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q(".faq-head > * > *"), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
      gsap.from(q(".ask-q"), {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.05,
        scrollTrigger: { trigger: q(".ask")[0], start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  const pick = (i: number) => {
    setArmed(true);
    setActive(i);
  };

  return (
    <section ref={root} id="faq" data-od-id="faq">
      <div className="shell rail faq-head pt-[clamp(64px,9vw,148px)] pb-[clamp(28px,3.4vw,56px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">06</div>
          <p className="eyebrow">FAQ</p>
          <p className="rail-index">{RAIL_INDEX.faq}</p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">
            Pick one and it gets answered. If yours is not here, ask it for real.
          </p>
        </div>
        <div>
          <h2 className="h2">
            Ask the
            <br />
            obvious ones.
          </h2>
        </div>
      </div>

      <div className="ask shell" data-od-id="ask">
        <ol className="ask-list">
          {FAQS.map((f, i) => (
            <li key={f.q}>
              <button
                type="button"
                className="ask-q"
                aria-pressed={active === i}
                onClick={() => pick(i)}
                data-od-id={`ask-q-${i + 1}`}
              >
                <i>{pad(i + 1)}</i>
                <span>{f.q}</span>
                <b aria-hidden="true" />
              </button>
              {/* On a phone the conversation opens under the question tapped. */}
              {compact && active === i && <Thread index={i} armed={armed} />}
            </li>
          ))}
        </ol>

        {!compact && (
          <div className="ask-side">
            <Thread index={active} armed={armed} />
          </div>
        )}

        <div className="section-ask ask-own">
          <p>Yours is not on the list?</p>
          <Ask as="button" subject="A question" id="faq-cta">
            Ask it directly
          </Ask>
        </div>
      </div>
    </section>
  );
}
