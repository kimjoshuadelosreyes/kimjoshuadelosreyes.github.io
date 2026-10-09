"use client";

import { scrollToY } from "@/lib/scroll";

/**
 * The way past a held sequence. Each pinned section keeps the page still while
 * it plays, which is the point of it and also the cost: a reader who came to
 * hire rather than to watch should be able to leave. This carries the page to
 * the end of the section's runway — exactly where the pin lets go.
 *
 * `runway` is the selector of the tall element the stage is pinned inside.
 */
export default function SkipPin({ runway, className = "" }: { runway: string; className?: string }) {
  return (
    <button
      type="button"
      className={`pin-skip ${className}`}
      data-od-id="pin-skip"
      onClick={(e) => {
        const el = e.currentTarget.closest(runway);
        if (!el) return;
        const r = el.getBoundingClientRect();
        // The runway's own end, less the fixed nav, so the next heading is not under it.
        scrollToY(r.bottom + window.scrollY - 76);
      }}
    >
      Skip<span className="sr-only"> this section</span>
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d="M6 1.5v8M2.5 6.5L6 10l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
