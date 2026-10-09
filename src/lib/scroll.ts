import type Lenis from "lenis";

/**
 * One place to scroll the page programmatically.
 *
 * Lenis owns the scroller while motion is allowed, and it keeps its own target:
 * calling `window.scrollTo` underneath it makes the two fight over the position,
 * and `scroll-behavior: smooth` is disabled by Lenis's own stylesheet. So the
 * instance is registered here on creation and everything that needs to move the
 * page goes through it, falling back to the native API when Lenis is absent
 * (reduced motion).
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export function scrollToY(y: number) {
  if (instance) {
    instance.scrollTo(y, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: y, behavior: "smooth" });
}
