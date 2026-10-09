"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/**
 * Single registration point for every GSAP plugin the site uses.
 * The original build loads ScrollTrigger, SplitText, Flip, DrawSVGPlugin and
 * MotionPathPlugin; these are the same five, registered once on the client.
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MotionPathPlugin);
  gsap.defaults({ ease: "power2.out", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MotionPathPlugin };
