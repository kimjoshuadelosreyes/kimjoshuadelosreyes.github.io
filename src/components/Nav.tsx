"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { NAV_LINKS, EMAIL } from "@/lib/content";
import { useSectionHref } from "@/lib/useSectionHref";
import { Wordmark } from "./Wordmark";

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const sectionHref = useSectionHref();

  useGSAP(
    () => {
      gsap.from(".nav-bar", {
        yPercent: -120,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.15,
      });

      ScrollTrigger.create({
        start: 24,
        end: "max",
        onToggle: (self) => setStuck(self.isActive),
      });

      NAV_LINKS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActive(id);
          },
        });
      });
    },
    { scope: root },
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      ref={root}
      className={`fixed inset-x-0 top-0 z-[60] flex h-[76px] items-center transition-[background,border-color] duration-300 ${
        stuck
          ? "border-b border-hairline bg-canvas/92 backdrop-blur-[14px]"
          : "border-b border-transparent bg-canvas/78"
      }`}
    >
      <div className="nav-bar shell flex w-full items-center gap-[clamp(16px,2vw,34px)]">
        <a href={sectionHref("top")} className="flex shrink-0 items-center gap-[9px]" aria-label="KIM — home">
          <Wordmark className="h-[21px] w-auto text-ink" />
          <span className="text-[10px] font-medium tracking-[0.04em] text-brown -translate-y-[9px]">®</span>
        </a>

        <nav className="ml-auto hidden items-center gap-[2px] lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={sectionHref(l.id)}
              aria-current={active === l.id ? "true" : undefined}
              className={`rounded-full px-[13px] py-[9px] text-[14px] font-medium tracking-[0.01em] transition-all duration-200 border border-transparent ${
                active === l.id
                  ? "bg-electric text-white"
                  : "text-ink hover:text-electric hover:bg-surface hover:border-hairline hover:shadow-xs"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-[14px] lg:ml-0">
          <a
            href={`mailto:${EMAIL}`}
            className="hidden border-b border-hairline pb-[2px] text-[13px] tracking-[0.01em] text-brown transition-colors hover:border-brown xl:inline"
          >
            {EMAIL}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="btn btn--primary btn--sm"
            data-od-id="nav-cta"
          >
            Start a project
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-hairline lg:hidden"
          >
            {/* This span IS the middle bar; the other two hang off it. Open, the
                outer pair cross into an X, so the middle one has to go — left
                in, it drew a line straight through the X. */}
            <span
              className={`relative block h-[1.5px] w-[17px] transition-colors duration-200 ${
                open ? "bg-transparent" : "bg-ink"
              }`}
            >
              <span
                className={`absolute left-0 h-[1.5px] w-[17px] bg-ink transition-transform duration-300 ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-[17px] bg-ink transition-transform duration-300 ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          data-testid="mobile-menu"
          className="absolute inset-x-0 top-[76px] border-b border-hairline bg-canvas px-[var(--gutter)] pb-[26px] pt-[10px] lg:hidden"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={sectionHref(l.id)}
              onClick={() => setOpen(false)}
              className="block border-b border-hairline py-[15px] font-display text-[19px] font-medium tracking-[-0.01em] transition-colors hover:text-electric last:border-b-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${EMAIL}`}
            onClick={() => setOpen(false)}
            className="block border-b border-hairline py-[15px] font-display text-[19px] font-medium tracking-[-0.01em] transition-colors hover:text-electric"
          >
            {EMAIL}
          </a>
        </div>
      )}
    </header>
  );
}
