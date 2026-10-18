"use client";

import { gsap } from "gsap";

/**
 * DrawSVG and MotionPath are used only by the two scroll-driven pieces — the
 * automation graph's wires, and the packets that ride them in the reel. They
 * are the heaviest plugins after ScrollTrigger, so they are kept out of the
 * first-load bundle and pulled in on the client the moment a component that
 * needs them mounts.
 *
 * `registerPlugin` is idempotent, so calling this more than once is free; the
 * promise is memoised so the import happens once.
 */
let pending: Promise<void> | null = null;

export function loadMotionPlugins(): Promise<void> {
  if (!pending) {
    pending = Promise.all([
      import("gsap/DrawSVGPlugin"),
      import("gsap/MotionPathPlugin"),
    ]).then(([draw, motion]) => {
      gsap.registerPlugin(draw.DrawSVGPlugin, motion.MotionPathPlugin);
    });
  }
  return pending;
}
