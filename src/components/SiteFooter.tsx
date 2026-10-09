"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { NAV_LINKS, FOOTER, EMAIL } from "@/lib/content";
import { useSectionHref } from "@/lib/useSectionHref";
import { Wordmark } from "./Wordmark";

export default function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const sectionHref = useSectionHref();

  useGSAP(
    () => {
      const mark = root.current?.querySelector(".footer-mark") as HTMLElement | null;
      if (!mark || prefersReducedMotion()) return;

      /* The wordmark rises into frame as the page bottoms out */
      gsap.from(mark, {
        yPercent: 26,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: { trigger: mark, start: "top 96%", once: true },
      });

      gsap.from(root.current!.querySelectorAll(".footer-fade"), {
        opacity: 0,
        y: 18,
        duration: 0.6,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 92%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="band on-dark border-t border-inksurface pb-[clamp(26px,2.6vw,40px)]" data-od-id="footer">
      <div className="shell">
        <div className="footer-mark py-[clamp(20px,2.4vw,36px)]">
          <Wordmark className="w-full text-inkfg" />
        </div>

        <div className="footer-fade flex flex-wrap items-start justify-between gap-[clamp(26px,3vw,60px)] border-t border-inksurface pt-[clamp(26px,2.6vw,40px)]">
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={sectionHref(l.id)}
                className="border-b border-transparent pb-[2px] text-[14px] transition-colors hover:border-inkfg"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Elsewhere">
            <a
              href={`mailto:${EMAIL}`}
              className="border-b border-transparent pb-[2px] text-[14px] transition-colors hover:border-inkfg"
            >
              {EMAIL}
            </a>
            {FOOTER.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="border-b border-transparent pb-[2px] text-[14px] transition-colors hover:border-inkfg"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-fade mt-[clamp(34px,3.4vw,56px)] flex flex-wrap justify-between gap-x-[30px] gap-y-3 text-[12.5px] tracking-[0.01em] text-inkfg/62">
          <span>© {new Date().getFullYear()} Kim Joshua · KIM®</span>
          <span>{FOOTER.line}</span>
        </div>
      </div>
    </footer>
  );
}
