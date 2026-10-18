"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Single registration point for the plugins every page needs.
 *
 * DrawSVGPlugin and MotionPathPlugin are NOT here: only two scroll-driven
 * pieces use them, so they load on demand through `loadMotionPlugins()` and
 * stay out of the first-load bundle. Flip is gone entirely — nothing used it.
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power2.out", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText };
