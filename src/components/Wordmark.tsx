/**
 * The real NESH® wordmark — path data lifted from the live brand SVG
 * (viewBox 957 × 338, currentColor). Never redrawn.
 *
 * One source for every use: the sprite, the inline mark, and the hero's intro
 * plate, whose knocked-out letters have to land exactly on the mark behind it.
 */
export const WORDMARK_VIEWBOX = { w: 957, h: 338 } as const;

export const WORDMARK_PATHS = [
  // K
  "M0 338V0H93.05V148.79H99.99L205.72 0H315.99L193.04 166.49L318.86 338H205.72L99.99 188.02H93.05V338Z",
  // I
  "M356.42 0H449.47V338H356.42Z",
  // M
  "M512.14 338V0H682.22L731.74 263.61H737.48L786.99 0H957.07V338H864.02L867.84 39.23H861.86L804.22 338H665L607.11 39.23H601.37L605.19 338Z",
] as const;

const VIEWBOX = `0 0 ${WORDMARK_VIEWBOX.w} ${WORDMARK_VIEWBOX.h}`;

export function WordmarkSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="nesh-wordmark" viewBox={VIEWBOX}>
        {WORDMARK_PATHS.map((d) => (
          <path key={d} d={d} fill="currentColor" />
        ))}
      </symbol>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={VIEWBOX}
      className={className}
      role="img"
      aria-label="KIM"
      fill="currentColor"
    >
      {WORDMARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
