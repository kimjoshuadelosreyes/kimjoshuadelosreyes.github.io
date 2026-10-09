# NESH® — Next.js + GSAP rebuild

A full rebuild of the NESH® portfolio as a **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**
project, with the original's cinematic motion system reproduced in **GSAP 3.15**.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.5, App Router, React 19.3 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 (`@theme` tokens) + a small component layer for fluid/cinematic pieces |
| Motion | GSAP 3.15 — ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MotionPathPlugin |
| Smooth scroll | Lenis 1.3 (driven by `gsap.ticker`, feeding `ScrollTrigger.update`) |

## Run it

```bash
cd "/Users/kimjoshuadr/Porfolio Site"
npm install --include=dev   # --include=dev matters if your shell exports NODE_ENV=production
npm run dev                 # http://localhost:3000
npm run build && npm start  # production
```

> **Shell caveat:** if `NODE_ENV=production` is exported in your environment, a plain
> `npm install` prunes devDependencies and `next dev` will refuse to start. Either
> `unset NODE_ENV` for development, or keep using `--include=dev`.

## Motion map

Every easing below was read off the original's own motion bundle
(`power2.out` dominates, with `back.out(1.7/2)` for pop and `expo.out` for reveals,
and `scrub: 1` on scroll-driven work).

| Section | File | Motion |
| --- | --- | --- |
| Smooth scroll | `components/SmoothScroll.tsx` | Lenis (duration 1.1, exponential ease) → `gsap.ticker` → `ScrollTrigger.update`; refresh after `document.fonts.ready` |
| Nav | `components/Nav.tsx` | Entrance drop (`power3.out`), glass-on-scroll, ScrollTrigger-driven active link, mobile panel |
| Hero | `components/Hero.tsx` | `SplitText` line mask reveal → cards in (`back.out(1.7)`) → counters → idle float → **300svh runway with a sticky 100svh stage**, carrying a five-layer sequence: wordmark push, figure dolly, media parallax, figure dissolve, card scatter, side-text exit, line-by-line headline exit and a curtain handoff |
| Clients | `components/ClientsMarquee.tsx` | Seamless 44s loop; page-wide velocity watcher feeds `timeScale` (1→5) and a ±6° skew |
| Journey | `components/Journey.tsx` | Seven pinned chapters over a 175svh sticky hold: plates crossfade on a scroll-indexed class, the active plate pushes in over 7s, and a single text block rises on each swap |
| Work | `components/Work.tsx` | **The dolly.** Pinned dark stage where six plates hang on a receding track: scrolling advances the camera, pulling each plate into focus and letting it accelerate out past the lens. Scale, offsets, blur and opacity are all derived from one distance per plate, so the rack focus and the depth always agree. A caption column and an electric tick rail. Native swipe rail below 1024px and under reduced motion |
| Capabilities | `components/Capabilities.tsx` | **The pull-back.** The stage pins for one viewport while a stack of six full-width type lines contracts, slides into columns and drops into the 3×2 card grid; icons draw themselves as each card lands |
| Engagement | `components/Engagement.tsx` | **The long take.** A sticky stage holds while a rail carries the section title and the three plans horizontally past a fixed gate; the plate in the gate takes the raised surface and the ink rule, its neighbours keep a hairline. Native sticky plus a live rect — no ScrollTrigger, so nothing can drift. Below lg and under reduced motion the plates stack as a plain list |
| Testimonials | `components/Testimonials.tsx` | **The wall.** Eight voices plus the site's real figures as stat cards, in two rows scrolling against each other under a header that states an aggregate. Ticker-driven rather than a CSS animation, so the motion toggle works even under reduced motion |
| FAQ | `components/Faq.tsx` | **The Index.** The only keyboard-driven section: seven questions as a type index, filtered live. Non-matching questions fold away (grid rows `1fr → 0fr`, the hairline shrinking with them, staggered down the list) and relevance decides which answer opens. Results are walkable with the arrow keys. Order is never re-sorted |
| CTA | `components/Cta.tsx` | **The finale.** The only lit section: a key light that drifts on its own and follows the pointer, sitting behind the copy so it lifts the ground rather than washing the type. The headline pulls focus out of a blur as it rises, one sheen crosses the electric button, and the magnetic pull stays. Armed by an `IntersectionObserver`, not a ScrollTrigger |
| Footer | `components/SiteFooter.tsx` | Wordmark rises in; link rows stagger |

## Testing

End-to-end coverage lives in `tests/portfolio.spec.ts` and runs against a real dev server.

```bash
npm run test:e2e                      # desktop (1440×900) + mobile (Pixel 7)
npx playwright test --project=desktop
npx playwright test -g "FAQ"          # single test
```

Playwright is pinned to **1.60.0** so it reuses the Chromium builds already in
`~/Library/Caches/ms-playwright`. `playwright.config.ts` starts `next dev` on port 4321 with
`NODE_ENV=development` (Next refuses to boot in dev while `NODE_ENV=production`), and always
targets `localhost` — Next 16 blocks `/_next` dev resources on `127.0.0.1`, which silently
kills hydration.

What the suite asserts:

- zero uncaught page errors or console errors on load
- GSAP actually mounted: SplitText produced line masks, ScrollTrigger created a pin spacer for the hero, Lenis took over the scroller
- the hero counters land on their real values (`7`, `80+`)
- the nav docks on scroll and the Journey chapters hand over in place, with **exactly one** plate and **exactly one** year rendered at a time
- the work dolly keeps exactly one plate in focus at a time — the first, a middle one, and the last after its closing hold — with the plate ahead racked out and dimmed
- every work plate is presented whole: each frame carries the source ratio with `object-fit: contain`, so no screen is ever cropped
- the compact work branch strands no pin spacer — a pin built in the single frame before the media query flips is reverted, and the index follows the rail directly
- all nine projects reach the document through the index, since the dolly only features six
- every dolly plate and the caption link to the right case study, and exactly one plate is reachable at a time — the other five are stacked underneath it and must not be tab stops
- all nine index rows link to their own case study, with nine distinct destinations
- the capabilities stack is full width, flush to one left edge and copy-less at the start, and lands as a three-column two-row grid with the copy uncovered — all six capabilities present in both states
- the engagement console opens the recommended plan by default with exactly one open channel, and all three keep their name and rate visible
- selecting a channel moves the electric rule onto it and swaps the feature list
- the console is drivable by keyboard, and wraps at the ends rather than dead-ending
- the open plan's ghost CTA is a prefilled mailto carrying that plan's name as the subject, and the closed plans' CTAs are out of the tab order
- the closed channels show a feature count that the open one hides, so the comparison survives without the lists
- the console charge line is empty below the fold, part-full mid-entry and full once the section has arrived — driven from the live rect, which is the assertion that catches a stored position drifting
- every capability card renders an icon with drawable shapes — `Icon` returns `null` for a name it does not know, silently, so a count of shapes is the only thing that catches an empty card
- every project has a case study that returns 200, shows its screen at the source ratio, and never renders it wider than its own pixels
- a case study's nav and footer link back into the home page (`/#about`) rather than to dead hashes
- the hero is a 4-viewport runway whose sticky stage holds at `top: 0`, with the figure dolling in, the cards scattering, and the dissolve reaching `blur(90px)` / `opacity 0.3` exactly on the pin release
- the hero's eyebrow and lede slide entirely out of their masks between 5% and 10% of the runway, each line travelling exactly 100% of its own height
- the hero copy never dims or blurs anywhere on the runway; only the figure dissolves, and the headline leaves line by line
- the next section rises over the hero as a curtain, in frame by 60% of the runway and covering the hero exactly at the release
- the centred hero keeps its headline, supporting copy and all three cards clear of the portrait
- the FAQ accordion opens and closes with correct `aria-expanded`
- the FAQ index filters live and opens the best match, with the electric mark on the query
- two words OR rather than AND, so `site design` returns the two answers carrying one word each instead of the strict-AND empty list
- filtered rows collapse to zero height rather than leaving a 1px hairline floating in the list
- no match offers an email instead of a dead end, and clearing restores the original order with question 1 open
- every FAQ row renders at full opacity, so a reveal trigger whose stored start drifted cannot blank the section
- typing the FAQ filter character by character never leaves a row out of flow, never pushes one past the section, and never lets two visible rows intersect — sampled after every keystroke, because the earlier Flip-based reorder did all three
- the FAQ keeps its order when filtered, so the match stays where it lives instead of jumping to the top
- the FAQ results are walkable from the field: Down enters the list, Up off the first result returns to the field, Home/End jump the ends, Down holds at the last instead of wrapping, Escape clears from either side, and Down with no matches goes nowhere
- the CTA's key light sits behind the copy, tracks the pointer across the section, and the sheen finishes its single pass clear of the button
- the mobile menu opens at Pixel 7 width
- reduced motion: emulation is read, Lenis stands down, SplitText never runs

Screenshots are written to `test-results/shots/`.

### Responsive contract

The floor is **360px**. The sweep also covers 280 and 320, because they pass and a
stronger guarantee costs nothing. Above 1680px the shell keeps its cap — that is a
decision, not an oversight, so 2560 and 3440 only have to not scroll.

The `responsive` group in `tests/portfolio.spec.ts` walks twenty viewports — including
the awkward ones (280x653, 900x700, 1440x620, 2560x1440, 3440x1200) and both sides of
every breakpoint boundary (640, 1023/1024) — scrolls to the bottom and back so the
pinned runways have mounted, then fails on any horizontal document scroll.

**A viewport sweep has a blind spot: it loads at each size, so a layout that only
breaks when the viewport *changes* looks clean.** The hero's eyebrow and lede are
SplitText line-masks, and a split line box cannot re-wrap. Loaded at 360 they split at
360 and read fine; loaded wide and then narrowed — a phone rotating, a window dragged,
a desktop-width first paint — they keep their wide line breaks, which left the lede
broken mid-sentence on a phone with "builds that" alone on a line. They now use
`autoSplit`, so GSAP re-splits whenever the viewport or the fonts change, and a resize
test narrows the viewport and demands more lines than the wide layout had. Without
`autoSplit` that assertion cannot pass.

One honest caveat: the hero's side-text scrub targets the first split's lines, so after
a re-split the new lines are correctly wrapped but no longer carry that scroll
animation. Correct wrapping is worth more than the effect, and the reveal for the
common case — no resize — is untouched. The CTA's headline is safe from this: its
three lines are real elements already, so a resize cannot orphan them.

Two more tests cover the same ground elsewhere: the menu button must stay inside the
viewport at the floor, and **all nine case studies** are checked at 360 and 1440 (a
project's own image ratio is what could push its page sideways) with the full
twenty-viewport sweep run on one of them, since the nine share a layout. The nine ids
are read from the home page's own links rather than typed, so a tenth project is
covered the day it ships.

**What the sweep found.** Exactly one defect. At ≤300px the nav could not hold the
wordmark, the CTA and the menu button at once: measured, the burger ran 18px past the
viewport, and `body { overflow-x: hidden }` clipped it — so the only way to open the
menu was gone. The nav now gives up its CTA below 360px, which costs nothing because
the CTA is already in the hero and the footer. Verified across the boundary: hidden at
359px, shown at 360px with 80px of clearance, burger inset 20px at every width.

**And the overflow is not being masked.** `body { overflow-x: hidden }` can hide a real
overflow instead of fixing it, so the sweep was re-run with that rule stripped in the
page: `scrollWidth` stayed 0 at every viewport either way. The only elements wider than
the viewport are the testimonial marquee tracks (~3,000px by design) and the services
rail, each inside its own scroller. That rule is belt and braces.

## Design tokens

NESH palette and type live in `src/app/globals.css` under `@theme`:

```
canvas #f9f9f9 · surface #ffffff · ink #262626 · muted #6b6b6b · hairline #e8e8e8
electric #fa5d19 · brown #482f24 · inksurface #2a2a2a · inkfg #ffffff
crimson #f05545 · amber #f0c550
```

**The palette is Firecrawl's, and it is a light one.** Values were read off firecrawl.dev's own
stylesheet rather than eyeballed: `#f9f9f9` is their `--background-base`, `#ffffff` their
`--accent-white`, `#262626` their black, `#e8e8e8` their rule grey, `#2a2a2a` their raised dark
surface, `#fa5d19` the signature orange — by a wide margin their most-used brand colour — and
`#f05545` / `#f0c550` their `--accent-crimson` and `--accent-honey`. Two values are derived from that
set and nothing else: `--muted` (their `#727272` nudged to clear 4.5:1 on this canvas) and `--brown`
(their orange 16% into their black, the warm detail tone for type, borders, dots and chips). Roles
are unchanged; only the values moved.

**`--brown` is darker than the orange would suggest, and that is a contrast fix rather than a taste
call.** It carries body copy at 70% opacity in two places, and at 30% into their black that variant
measured **4.05:1** on this canvas — under the gate. At 16% it lands at 4.75:1, with the solid tone
at 11.7:1. The same pass took `.take-plate.is-gated`'s state border from 45% ink (2.67:1) to 57%
(3.80:1), because a state boundary has to clear 3:1.

The pass was verified rather than assumed: walking the rendered page at 1440×900 and resolving every
text element's colour against its *composited* backdrop — ancestors folded in, colours read back
through a canvas so `color-mix` output is resolved to sRGB rather than mis-parsed. The home page's
**309 text elements check clean apart from the two orange buttons**, and all eight case-study routes
check clean apart from the same nav button, which is the deliberate miss above. The elements the
audit skips are the ones sitting on a gradient (the ink bands), where white on near-black is ~15:1
by construction.

**A first pass got this wrong, and the correction is worth recording.** That pass read
`--background-base: #0a0a0a` out of their stylesheet and built a *dark* theme on it. That token is
their dark-theme value, not their brand: loaded under either `prefers-color-scheme`, firecrawl.dev
resolves to `color-scheme: light` on a `#f9f9f9` canvas, and their page is white with orange used
strictly as the accent. The dark build also had to flip two roles to function at all — `--color-ink`
stopped being a fill, and `--color-brown` went light — and both flips are reverted here, because on
a light ground the original roles are simply the correct ones.

**The label on the orange is white, and that is a knowing exception.** White on `#fa5d19` measures
**3.16:1**. It clears the 3:1 bar for large text and UI components, but the button labels are 14–15px
— normal-size text, which wants 4.5:1. Dark ink on the same fill is 4.79:1, which is what it used
before. This is also exactly what Firecrawl's own CTA does, so it is a faithful copy and a
deliberate AA miss rather than an oversight. If AA has to hold as well as look right, deepening the
*button* fill to about `#c9400c` takes white to 5.0:1 without moving the brand orange anywhere else.
Every other pair on the site passes: the audit below reports these buttons and nothing else.

**The hero needed one addition.** The old greige canvas gave the portrait something to sit against;
`#f9f9f9` against a light garment gives it almost nothing, and the figure read as a ghost. So
`.hero-media::before` lays a soft pool of their own grey behind the figure — derived from their
hairline and their muted, no new hue — deepest at the base and gone before it reaches the wordmark.
The page itself stays `#f9f9f9`.

The real brand faces (**Tr 3 A**, **Ppneuemontreal Book**) are self-hosted from `public/fonts/`
with the declared system fallback stacks retained. The wordmark in `components/Wordmark.tsx` is
the real vector path data (viewBox 1288 × 338), not a redraw.

## Content & assets

All copy and imagery are the brand's own, localized into `public/`:
`public/img/` holds the portrait, six project cards, three "also shipped" device shots,
the journey badges and seven client avatars; `public/fonts/` holds the woff2 faces.
There are no remote image URLs and no placeholders. Because `next.config.ts` sets
`images.unoptimized`, `<img>` is used directly for these fixed-size assets.

## Notes

- `prefers-reduced-motion` is honoured throughout: Lenis and every scrub/reveal stand down,
  and the accordion switches to instant state changes.
- This project lives outside the Open Design workspace (in `/Users/kimjoshuadr/Porfolio Site`),
  so it does not appear in the Design Files panel by design.
- Verified with `tsc --noEmit`, `next build` (static prerender of `/`), a production server
  smoke test, and the Playwright suite above.
- Two bugs the browser tests caught, worth knowing about if you refactor:
  1. **Never resolve a promise inside `useGSAP` to gate an entrance animation.** With
     StrictMode the first context is reverted before `document.fonts.ready` settles, so the
     stale callback's `.from()` tweens had no owner and froze the hero mid-entrance. The
     font wait is now React state feeding `useGSAP`'s `dependencies`.
  2. **Two timelines must not write the same property on the same node.** The pinned
     scroll-out timeline renders at progress 0 and would capture whatever mid-entrance
     transform was live. It now targets dedicated nodes (`.hero-portrait`,
     `.hero-card-inner`) that the entrance never touches.
  3. **A clipping box must not be the element you translate.** `.work-rail` was both
     `overflow-x: hidden` *and* the node GSAP moved, so its own clip region travelled
     off-screen with it and only the first sliver of cards stayed visible. The clip
     (`.work-viewport`) and the moving track (`.work-rail`) are now separate elements.
  4. **`ScrollTrigger.kill()` does not revert a pin.** `compact` starts `false` so the server
     and the first client render agree, which means the desktop branch renders once on a phone
     before the media query flips it — long enough to build a pin. Killing that trigger without
     `kill(true)` left the pin spacer in the document and stranded ~5 viewports of empty band
     between the rail and the index. It only ever showed on a phone. The pin is now reverted,
     and a live media-query check stops it being built in that window at all.
  5. **A hash link is only a hash on the page it belongs to.** The nav and footer also render on
     the case study pages, where `#about` resolves to `/work/1910#about` — an anchor that does not
     exist there, so clicking it did nothing at all and looked like a broken menu. Both now go
     through `useSectionHref`, which emits `/#about` off the home page.
  6. **Swiper was removed with the carousel.** The testimonials section was its only consumer, and
     once the band replaced the drag rail the dependency, its stylesheet imports and their ambient
     type declarations all went with it. The Stack table no longer lists a carousel.
  7. **Two registered plugins are used by nothing.** `Flip` and `MotionPathPlugin` are registered in
     `lib/gsap.ts` and referenced nowhere — they ship in the bundle for the sake of matching the
     original's plugin list. (`DrawSVGPlugin`, the third of that idle set, now draws the capability
     icons.) Either put them to work or drop the imports.
  8. **Stored scroll positions drift on this page, and it is measurable.** The page mounts four
     pinned sections, each of which changes the document height as it settles. A ScrollTrigger
     created before a sibling has grown the page stores a start that can be thousands of pixels
     early, and its animation then plays while the section is still below the fold. Measured twice:
     the console's charge line was full while the section was still 1,200px off screen, and when the
     long take used a pinned trigger its range first measured as **zero** — pinning the section for no
     distance while the rail sat parked at its last stop. `ScrollTrigger.refresh()`, including one
     scheduled after every mount, moved neither. Engagement now uses a native sticky stage and a live
     rect, and trusts no stored position at all. The other three sections still use stored triggers;
     their holds are long enough that the offset reads as an early start rather than a miss, but the
     same conversion applies if it ever becomes visible.
  9. **`Icon` fails silently, and deriving an icon name from a content id hides it.** The capability
     ids are `integrations` and `motion`; the icon set calls those glyphs `api` and `gsap`. Passing
     the id straight to `Icon` returned `null` for both — no error, no missing-asset warning, just
     two blank cards out of six, which survived several rounds of review until the icons started
     animating and it became obvious. Each capability now names its icon explicitly.

### Hero sequence

Borrowed from the reference, then pushed much further — and then **shortened**, because three
viewports of scroll to reach the next section was too many. The runway is now **300svh**, so the
sticky stage releases at **67%**. Every beat below is a percentage of that runway and the last one
lands *on* the release, so no stretch of the pin is inert.

| Layer | Window | What it does |
| --- | --- | --- |
| Wordmark push | `0 → 30%` | The far plane: scales 1 → 1.22, lifts 90px, fades to a 12% ghost |
| Media parallax | `0 → 67%` | The middle plane drifts up 150px against the wordmark, accelerating so the figure recedes through the handoff |
| Figure dolly / dissolve / recede | `0 → 67%` | One keyframed tween: scale 1 → 1.16 with `blur(0 → 90px)` and `opacity 1 → 0.3` by the release, then back to scale 1.04 and opacity 0.08 as the curtain covers it |
| Cards scatter | `4 → 21%` | The near plane: each tilts, flies outward, shrinks to 0.7 and clears. Capabilities first and furthest, then projects, then experience |
| Side text | `5 → 10%` | The reference's own beat, kept at its window — eyebrow and lede slide out of their masks |
| Headline exit | `22 → 33%` | Line by line, staggered, clearing before the curtain arrives |

The dolly, dissolve and recede are **one tween on one node**. Three separate tweens would have
fought over `scale`, and a separate dissolve would have fought over `opacity`.

### Hero on a phone — the desktop composition, scaled

Below `lg` there is no runway and nothing scrubs (`.hero` drops to `min-height: auto`), so the hero
is a single `100svh` stage that keeps the desktop's **layering** rather than collapsing to a
stacked column: the giant wordmark is the far plane, the figure is a bottom-anchored full-bleed
backdrop, and the copy rides a **masked canvas scrim** in ink.

**The figure is a cut-out, blended at the base.** The shot is the head-and-torso frame: the studio
ground has been lifted to alpha and the bag cropped out, and the asset carries transparent headroom
above the hair plus a bottom pad so `contain` can fit it to the stage height while the head still
clears the fixed nav. `.hero-portrait img` carries a bottom `mask-image` feather, and `.hero-fog`
paints a canvas scrim between the figure (z-10) and the cards (z-20).

**The scrim is masked to the copy's own column, not to the stage.** It began as an opaque canvas
wall across the full width, and that is what made the hero read as a floating head: it erased the
torso along with the strap it was there to hide. It is now a narrow band over the column the copy
occupies, so the shoulders, arms and coat stay at full strength either side of it, and the ramp
between the two is what lets the body read *through* the type. The scrim is still load-bearing — the
headline's first line crosses the collar and the brown strap, and at 1366x768 it also crosses the
hair — but it no longer has to be opaque to be sufficient. `--fog-min` is the floor it applies over
the copy, and the contract is that this much canvas, on its own, carries ink over a *black* garment,
so no photograph underneath can break the headline. Measured across seven viewports from 1440x700 to
1920x1080, the worst headline backdrop is 5.3:1.

The desktop band is `clamp(560px, 62%, 640px)` tall rather than a plain percentage: the copy is
bottom-anchored and near-constant in height, so on a short desktop it climbs the stage and a purely
proportional band drops behind it — which is exactly how the 1366x768 headline came to sit on dark
pixels at 2.48:1 before this pass.

The asset ships as a q90 WebP — 118 KB against 1.7 MB as an RGBA PNG, at an opaque-area RMSE of
2.4/255 — because a photographic hero has no business being a PNG.

The mobile figure uses `object-fit: cover` and the desktop one `contain`; from `lg` the clearance is
the asset's own headroom, and below `lg` the figure is also offset 72px so the head clears the fixed
nav. The copy is sized in `svh`, not `px`, and that is the
load-bearing decision — a px-sized block of fixed height outgrows the space above the figure on a
short phone. Only the two **proof cards** float on a phone — the services and roster cards are
withdrawn below `lg`, because their content cannot share a phone stage with the copy without
crowding the figure. The proof numbers still live in the cards, which is why the inline stat row
that used to duplicate them is gone. The idle float itself is deeper below `lg` (16px, and each
card tilts the opposite way) because a phone reads the desktop's 10px as static; a test holds both
amplitudes to account.

The stage is a flex column with `justify-end` below `lg`: the cards and the copy are the only
in-flow children, so both are pinned to the floor. From `lg` the same wrapper is `block` and every
plane is absolute.

`.stat-num` renders its **real** figure in the markup rather than `0`, and the counter resets it to
zero inside the tween — while the card's own entrance still has it at opacity 0. Otherwise a
reduced-motion reader, who never reaches the counter branch, saw **"0 years / 0+ projects"** on a
card that was right there on screen.

The test asserts the contract: the stage fills the viewport, the figure fills the stage and reads
≥70% of the viewport width, the head clears the nav, the copy sits at the floor of the stage, the
two cards sit between the nav and the headline without colliding, nothing scrolls sideways — and
that the copy sits inside the scrim's full-strength column and below its ramp, with the scrim's own
floor held to the 4.5:1 gate against a black garment.

### Motion on a phone

The compact branches used to stand still: every section gated its choreography on `compact` and
rendered a static stack, and the pinned sequences — the hero runway, the journey hold, the work
dolly, the take — were pulled off phones for viewport stability. The phone now carries its own
motion layer instead, built so none of it can destabilise the scroll:

| Section | On a phone |
| --- | --- |
| Hero | the figure pushes in, the wordmark lifts away and the copy drifts up as the stage passes |
| Journey | each chapter's body rises as it arrives, and its plate pushes in behind it |
| Work | the head, then the six rail cards, rise in a stagger |
| Capabilities | the cards rise in a stagger, copy and footer arriving with each |
| Engagement | the title plate and the three plans rise in a stagger |
| Clients / Testimonials | the marquee and the wall already ran on every viewport; unchanged |

None of it pins and none of it hijacks the scroll. Every effect is either a reveal (`once: true`,
and `immediateRender: false` so content is never stuck invisible if a trigger never fires) or a
scrub tied to the section's own passage. All of it sits behind the same `prefers-reduced-motion`
guard the desktop choreography uses, so the reduced-motion branch still renders a still page.

Two implementation notes worth keeping. The compact branches are chosen by a media query, so the
flip *off* the desktop branch has to **revert** it first: the effect carries `revertOnUpdate: true`,
which tears down the desktop pin (and its spacer) before the phone branch builds, instead of
layering two sets of triggers on the same nodes. And the journey plate pushes in from
`scale 1.12`, so the compact chapter is `overflow: hidden` — without it the scaled plate adds ~6%
of overflow each side and the whole document scrolls sideways, which is exactly the width sweep
the responsive test walks.

### The handoff — a curtain, not a meeting

The next section does not wait politely below the hero; it rises **over** it. That needs relative
motion, which normal flow cannot give (both sections move at the same speed), so the marquee
carries a negative top margin of exactly one stage height:

```
curtain lifts by  100svh   ->  marquee's top sits at the hero's final stage position
curtain rises     33 → 67% ->  the panel's edge crosses the pinned stage
hero covered at   67%      ->  the same instant the sticky stage releases
client band lands 200svh   ->  two viewports of scroll from the top of the page
```

The two coincide **by construction**, which is what makes the handoff tight: the hero never has a
visible tail, and the curtain does not arrive a beat late. Change the stage height and
`--curtain-lift` in `globals.css` has to change with it.

It reads because the panel covers the hero's **ghost** — a 90px-blurred figure and a 12% wordmark
— so the edge is unmistakable even though the panel is only a step lighter than the canvas.
Everything after the hero sits in one `.curtain-plane` layer, opaque and `z-40`; without it the
hero's ghost would show through the sections below, since the hero section is three viewports tall
and the marquee starts one viewport before it ends.

Both handoff partners animate: the marquee names rise in as the panel clears the ghost, and the
About section's head staggers up behind them.

### Journey — pinned chapters

Seven chapters across a **275svh** runway: a 100svh sticky stage that holds for 175svh. The scroll
trigger's range is `top top → bottom bottom`, which on a sticky stage *is* the hold, so the
chapter index falls straight out of `progress × 7` with no arithmetic to drift.

**Only the plates are stacked and crossfaded.** The text is a **single** block whose content is
swapped by the scroll index. That is not a style choice — it fixes two real defects:

- Seven stacked text blocks crossfaded, so the years superimposed. Mid-swap the frame showed
  **"2023" over "2024" reading as "2025"** — a false year. The test now asserts exactly one year
  is ever rendered.
- The same stacked blocks would not paint at all: every computed value (opacity, visibility,
  colour, geometry) read correct while the column rendered blank. One block renders reliably.

Each chapter's plate is a **real photograph, not a watermark**. It used to sit at `opacity: .42`
with a heavy desaturate, which washed it into a ghost; it is now fully opaque. Blending is
done by the scrim in front of it — solid canvas over the lower third where the text sits, easing to
clear at the top — rather than by the plate's own alpha, so the image is solid everywhere it is
seen and the text bed is guaranteed rather than hoped for. The scrim is sampled through eleven
stops to approximate an ease: CSS interpolates linearly between stops, and the corner a two-stop
gradient leaves becomes a visible band edge across the image the moment the plate is solid. The
active plate still pushes in over 7s on a linear transition, so it reads as a camera move.

The plate blends through the scrim rather than `mix-blend-mode: multiply`, which composited
unpredictably here.

Below 1024px and under reduced motion the runway is dropped and a **stacked** layout is rendered
instead. That branch is chosen in JS from a `matchMedia` listener, not hidden in CSS, so no
chapter is ever unreachable and no copy is duplicated in the DOM.

**Each year carries its own accent.** The seven years run crimson → orange → amber, so the story
visibly warms from 2019 to 2026 and each chapter reads as its own beat. Those are Firecrawl's own
accents in their order: `--accent-crimson` (`#f05545`), the signature orange, then `--accent-honey`
(`#f0c550`, shipped here as `--amber`).

**Every stop is mixed back into `--ink`, and that is load-bearing.** The years are 12px type on a
near-white canvas, so each one has to clear 4.5:1 on its own — and every raw accent fails that
badly: crimson is 3.1:1, orange 2.9:1, amber 1.7:1. Mixing into ink holds the lightness down while
keeping the hue travel, which runs 29° → 40° → 89° in `oklch`. The amber stops need a *higher*
percentage than the crimson ones to land at the same lightness, which is exactly the kind of thing
the test catches: an earlier pass used 14% and 22% there, and the ramp went non-monotonic — the last
two years came out darker than the fifth.

The gate is 4.5:1, not 3:1, because the year is body-size type rather than display. A test measures
all seven in the browser — contrast **and** distinctness — rather than trusting the mix percentages.
As built, the steps run 14.4 / 12.7 / 11.4 / 10.5 / 9.9 / 9.4 / 7.8:1 on light.

The plates are real assets: the portrait carries the personal chapters, project screens carry the
craft ones. 2021 names Roswell Biotech and no Roswell image exists, so it takes the portrait
rather than borrowing another client's screen, and no plate is captioned with a project name — no
plate claims "this was built in year X".

### Hero layout contract

A centred composition: eyebrow and headline directly above the portrait, supporting copy
directly below, three cards flanking him left and right. Four rules keep it honest, and each
is enforced by a Playwright assertion rather than by eye:

- **Cards are `.nesh-card`, never translucent glass.** The original's glass works because it
  sits on a dark photographic backdrop. On the light canvas a translucent panel let the
  labels cross the portrait's light-to-dark edge, so half of each line was illegible. The
  cards are now opaque surfaces with a hairline and a soft shadow.
- **No layer overlaps the portrait.** Centred type plus a centred cut-out is a collision
  waiting to happen, so the type sizes are `svh`-capped and the vertical rhythm is tuned until
  the headline's box bottom sits at or above the portrait's top at every tested viewport
  (1920×1080 down to 1440×700).
- **The headline is not layered *over* the face.** The cut-out's baked headroom lifts the hair
  clear of the headline box; the ink lines land on the shoulder and the canvas fog, never on the
  face.
- **One fact, one home.** The cards now carry `7 years` and `80+ projects` and the separate
  stat row was removed, so each number appears exactly once in the hero. (The cards are kept
  deliberately: that was an explicit call.)

Below 1024px the portrait becomes a full-bleed backdrop like the desktop's, and the cards and copy
are bottom-anchored in flex, so they can never bury the figure.

The exit is a **late** fade: `start: "88% top"`, `end: "bottom top"`. Nothing dims while the
hero is still substantially on screen, and there is no blur filter — the previous `blur(90px)`
turned the headline into an unreadable smear for a whole viewport of scrolling.

### Work — the dolly

Six plates hang on a track that recedes away from the camera. Scrolling advances the camera along
it: the plate in focus is whole, centred and sharp, the next waits below and out of focus, and the
one just passed accelerates up and out past the lens. A caption column carries the index, industry,
name and copy; an electric tick rail runs along the bottom.

It computes its own projection. A plate sitting square to the camera under CSS `perspective` is
just a uniform scale, so `perspective` would buy nothing here — and it would cost something,
because a `filter` on a child of a `preserve-3d` context flattens that child, and the rack focus
depends on the blur. Instead one `d` (the plate's distance from the camera in track units) feeds
every depth cue — scale, the offsets, the blur, the opacity — in a single pass, so they can never
disagree about where a plate is.

Three things worth knowing before touching it:

- **The transition is sequenced, not crossfaded.** A plate arriving at full strength while the last
  one is still half-visible is a double exposure of two unrelated screens, and it reads as a smear,
  not a focus pull. The outgoing plate now clears by `d = −0.4` and the arrival ramp only starts
  once it has; the brief dip between them is the cut. The next plate stays faintly present at rest
  (a ghost at ~0.22) so the track still reads as a track.
- **The plates are never cropped, and there is a test for it.** Every frame carries the source
  ratio (778/1100, true of all six) and `object-fit: contain`, so the screen fills it exactly. This
  is the one property of a portfolio section that is not negotiable, so it is asserted from the
  declared image attributes rather than trusted.
- **The compact branch is a real branch, not a media query hiding things.** The dolly needs a pin
  and a long hold, and neither belongs on a phone. Below 1024px, and under reduced motion, the same
  six plates appear in a native snapping rail — chosen in JS, so nothing is unreachable.

The index below lists all nine projects. The dolly features the six with real screens; the other
three exist only as small logos, which do not survive being blown up to plate size.

### Capabilities — the pull-back

The section arrives as a stack: six capability names as full-width, hairline-separated lines, flush
to the section's left rail. Scrolling unfolds them into the 3×2 grid of cards, and each card's copy
is uncovered by the card's own growth rather than by a fade.

**It holds for one viewport — and that is a correction, not the original design.** The first cut had
no pin at all, on the theory that *not* stopping the reader was what would distinguish it from the
two sections above. It read the other way in practice: a transformation spread over half a viewport
of scrolling is over before the eye arrives, and the reader only ever sees the finished grid. The
stage now pins for a little over one viewport, which is what makes the unfold watchable. It is still
by far the shortest hold on the page — Journey is 1.75 viewports, Work is 4.6 — and the grammar is
still nothing like theirs: one continuous transformation rather than a sequence of items.

Each icon draws itself with DrawSVG as its card lands, and each card ends with a link. Where the
site's own content supports a pairing the project is named (`Ongoing Support` → Alosant, from the
testimonial that calls him "an essential part of our team"); everywhere else it points at the work
rather than inventing a client engagement. The project ids live on the capability in `content.ts`.

**Below `lg` the pull-back does not run — the section renders the finished grid, and the grid
reflows.** A card that is 453px in the 3-up desktop grid collapses to ~107px if the column count is
left at three, which wraps every title to four or five lines; the grid steps to two columns below
1024px and one below 640px. The "Used on" footer wraps for the same reason: Webflow Development
lists nine projects, and without wrapping the card's own `overflow: hidden` silently dropped the
last names.

**Crossing the breakpoint is a teardown, not a hide.** Dropping below 1024px has to *revert* the
pinned timeline, because its built state leaves the cards absolutely positioned at the desktop
grid's coordinates over a wrap held at the desktop height. `useGSAP`'s `revertOnUpdate` was off, so
the pin survived the switch and the section rendered as a faded heading over misplaced cards —
exactly how it was reported. It is now on, and a test resizes through the breakpoint to hold it.

**The order of the three phases is the whole trick.** The rows contract in place, then slide into
their columns, and only then merge into two rows and grow. Any other order puts six still-wide boxes
through the same space at once: interpolate width and x together and every row passes through a
state where it is still most of the viewport wide while already sliding sideways, and let three rows
converge on one `y` while still tall and the frame reads as a broken layout rather than a camera
move. The padding travels with the drop phase for the same reason — grow it early and the content
area is still one line tall while the type is already wrapping to two, so every name is clipped
through a sliver mid-scrub.

The two states are measured and interpolated by hand rather than with GSAP's Flip plugin.
`Flip.from` is built for one-shot transitions: its absolute mode leaves the elements out of flow, so
a scrubbed timeline the reader can reverse and abandon mid-way has no reliable resting state.
Measuring both sets of rects and tweening between them is shorter and reversible, and every value
comes from one `fromTo` per property, so nothing can disagree about where a card is at any progress.

The wrap is held at the taller of the two states, so the page never reflows during the scrub — a
section whose height changes mid-animation moves the trigger's own end and feeds back into the
scroll.

### Engagement — the console

"Three ways to work together" is the only section on the page that is a choice rather than a story —
the others ask the reader to scroll through a narrative, this one asks them to compare three options
and pick. So it is the one section driven by the reader instead of the scroll: no pin, no scrub, no
choreography to sit through.

Three channels sit side by side with their badge, name and rate permanently legible, so the
comparison never collapses; selecting one opens its feature list and a single electric rule travels
to it. The rule's own width is a column and it translates by `(100% + gap)` per step, so it lands
exactly on the next track without measuring anything.

- **The open channel is `aria-expanded`, not a tab.** An accordion is what this is — three headers,
  three panels, one open — and it needs no roving tabindex to be reachable. Arrow keys move the
  selection as a convenience on top of that.
- **Hidden panels stay in flow on desktop.** `opacity: 0`, not `display: none`, so every channel
  reserves the height of its own list and the row is always as tall as the tallest; switching never
  moves the page under the reader's cursor. Stacked below 1024px that same reserved space is a
  screenful of dead scroll, so there the closed channels drop out of flow.

**"Recommended" used to be a second dark panel.** The brand reserves the dark ground for the work
band, and it made one plan look like a different kind of object rather than the recommended one.
Prominence is now carried by the word itself, by ink-weight type, and by the electric rule.

### Engagement — the long take

The three ways to work together ride a rail past a fixed gate. The section holds on a sticky stage
while the rail travels left, and each plan passes through the frame in turn: the plate inside the
gate takes the raised surface and the ink rule, the ones either side keep a hairline, so the
comparison survives the movement. The section's own title is the first plate on the rail — the take
opens on the title card and then pans to its subjects, which is also what keeps the frame full at
the start instead of leaving a third of it empty.

**The axis is the point.** Everything else on this page moves vertically or in Z. The previous
version of this section moved content *relative to the frame* as a parallax, and that is motion
without meaning — it reads as misalignment or cropping, because nothing about it tells you anything.
Lateral travel through a fixed frame is a camera move, and the gate gives the movement something to
mean.

**The accent is the gate's four corners, and nowhere else.** Electric used to draw a one-column rule
and a dot at the end of a fill here, and both read as clipped because both were partial. Four corner
marks cannot be partial. The frame's own hairline stays neutral and the surface does the focusing, so
the accent marks the gate rather than decorating the plates.

**Each plate has a small parallax against the gate.** The one furthest from the frame lags the rail by
up to 34px, sits 4.5% smaller and takes up to 3.2px of blur; the one arriving is at exactly zero
offset, scale 1 and no blur. Because every one of those is zero *at the frame*, the composition at
each stop is untouched — the depth only shows in what is passing.

**The gate closes on the plate that arrives.** Its frame `scale`s between 1.035 (relaxed, while a
plate is travelling past) and 1 (tight), and its hairline brightens from hairline toward ink as the plate
settles. The shade is written from JS but only when the integer percentage actually changes, so it is
a handful of writes across the whole pan rather than one per frame.

**The frame counter is a control, and it lives outside the gate.** Its three ticks are buttons — 24px
hit targets with the visible rule drawn as a centred pseudo-element — and clicking one scrolls the
rail to that plate. It is outside the gate because the gate is `aria-hidden` decoration, and a
focusable control inside an `aria-hidden` subtree is unreachable by everybody.

**The counter is always visible, names its plates on hover, and steps with the arrows.** It was tied
to the gate's fade, which made it hidden at the title frame — and a hidden button cannot be clicked, so
the jump affordance was unavailable from exactly the frame a reader is most likely to want it. It sits
below the headline rather than over it, so there was never a reason to hide it. Hovering or focusing a
tick shows that plan's name, and the arrow keys step between frames — scoped to the counter, so the
page's own arrow scrolling is untouched.

**A passing plate also fades slightly** — to 82% at the far end — so the depth still reads on a device
where the blur is cheapened or dropped. Ink at 82% over the canvas is about 7:1, so it costs nothing in
legibility.

Programmatic scrolling goes through `lib/scroll.ts`. Lenis owns the scroller while motion is allowed
and keeps its own target, so calling `window.scrollTo` underneath it makes the two fight over the
position — and Lenis's own stylesheet disables `scroll-behavior: smooth`. The instance is registered
there on creation and everything that needs to move the page goes through it, falling back to the
native API under reduced motion.

**No ScrollTrigger.** The hold is a native `position: sticky` stage inside a 300svh runway, and the
pan is computed from the runway's live rect every frame. ScrollTrigger was the obvious tool and it
was wrong twice here: its stored start drifts (note 8), so the scrub range first measured as zero —
pinning the section for no distance while the rail sat parked at its last stop — and when a range did
exist the pan ran a third of the way through before the section was on screen. A sticky element
cannot be positioned wrongly, and a rect read each frame cannot be stale. The rail's `transform` is
the only thing this section animates, and the tick is its only writer.

Each plate eases into its stop with a smoothstep inside the segment, so the rail decelerates into a
frame and dwells there. That dwell is the reading time; a constant-rate pan would run the three plans
past like a filmstrip.

**Stacked below lg, the plates are a plain vertical list.** They were a horizontal snapping strip, and
a horizontally scrollable container nested inside a smooth-scrolled page is a great deal of machinery
for a phone: it left the page reporting an unstable viewport and broke two unrelated mobile tests
(the FAQ accordion and the menu button both stopped being clickable). Stacked plates are duller and
they work.

### Testimonials — the wall

Eight voices plus the site's real figures as stat cards, in two rows that scroll against each other.
The header states an aggregate; each card carries its own attribution and — where the site has one — a
link to that client's case study.

**What the reference actually does.** FundedNext's reviews section is client-rendered, so it never
appears in the served HTML — but its props do, and the structure is worth recording:

```json
header { title, ratingText: "4.5 based on", reviewCountText: "73k+ reviews",
         ctaLabel: "Read All Reviews on Trustpilot" }
card   { variant, body, authorName, authorInitial, country, rating,
         ctaLabel: "View on Trustpilot", ctaHref }
mixed  { variant: "graph-card", value: "4", unit: "hours",
         caption: "Avg. processing time", chartImageSrc }
```

The good part is the structure: a wall of *unlike* cards — reviews, Reddit posts and small charts —
each carrying its own attribution and a link out to its source, under a header that states an
aggregate. Variety plus attribution is what makes it read as evidence rather than as marketing.

**Two things could not be copied, and have not been faked.** There is no rating, because these clients
are not reviewing Nenad on a platform — so there is no average and no count, and a painted-on row of
stars would be the least defensible thing on the page. The quote mark occupies that slot. And there is
no review platform to link out to, so each card links to what does exist: that client's case study,
where the site has one.

**The aggregate is real** — seven years, eighty-plus projects, nine clients — read from the same
constants the hero uses, so the two cannot disagree. The stat cards between the quotes are this page's
equivalent of the reference's chart cards, filled with those same figures.

**Three tones, one per kind of voice.** The reference colours its cards by source, and colour is the
one thing copied outright here — except that this palette is the brand, so the tones are its own
tokens rather than new hues:

| kind | who | card | relative luminance |
| --- | --- | --- | --- |
| `client` | the companies he built for | `--ink` | 0.02 |
| `stat` | — the figures, not a voice | brown 38% over `--canvas` | 0.42 |
| `collaborator` | peers he worked alongside | brown 20% over `--surface` | 0.68 |
| `studio` | the agencies and studios that hired him | `--surface` | 1.00 |

**The tones have to be mixed, not switched.** The first attempt used `--surface` for studios and
`--canvas` for collaborators, and those two tokens differ by a hair — two of the three cards read as
the same card against the wall behind them. Mixing brown into the surface gives four steps far enough
apart to be told apart at a glance, measured rather than judged by eye.

**The industry group gets colour in the chip.** Each card carries its client's industry as a pill toned
by group — Agency, Design, PropTech — because the card's fill can only carry one axis and the
relationship is the one complete for all eight voices. The groups are few on purpose: nine industries
cannot have nine tones in a nine-token palette before type contrast breaks, so industries are grouped
and anything unlisted takes the neutral chip. Bart-Jan's is not recorded anywhere on the site, so his
card carries no chip rather than a guess.

Each card also *names* its relationship kind, so the fill is a rhythm rather than a code to be
deciphered — and tone is not available to a screen reader, which is the other reason the label stays. The dark one is a card, not a band: the brand reserves the dark ground for the work
section, and a single card is not a ground. The `kind` field is an inference from the role text each
person supplied — correct any of them in `content.ts` and the tone and chip follow.

**The two rows drift vertically against each other** as the section passes, so the wall reads as two
layers rather than one block. It is written on the *row* while the track keeps its own `x`, so the two
never share a node, and it is driven from the section's live rect rather than a stored position.

**Fluidity, in four parts.** The cards dissolve at both edges through a multi-stop mask rather than
being cut by the viewport — sampled through several stops because a two-stop mask interpolates
linearly and its corner reads as a band across a wall of cards. Each row's speed and each card's skew
react to how fast the page is scrolled, the same behaviour as the client marquee. Hovering *eases* the
rows down over half a second rather than freezing them. And the header's figures count up as the
section arrives — from the same constants the hero uses, so the two cannot disagree.

**The motion is ticker-driven, not a CSS animation, and that is not a style preference.** This
stylesheet forces `animation-duration: 0.001ms !important` on everything under reduced motion, so a CSS
marquee cannot be restored from script without fighting `!important` — and the reader's motion toggle
would then be inoperative for exactly the person who needs it. Writing the transform directly is
unaffected by that rule. It also means nothing here is time-dependent for its content: every card is
in the document and readable whether the wall is moving or not. The stat cards' figures count up on
the same single tween as the header's, because those cards — and so their counters — exist twice in
the looped track, and two triggers would let the copies show different numbers.

**A tween that merely *has* a ScrollTrigger renders its start value at creation.** The header counters
were built that way, and it wrote "0 years" over the real figure — then left it there on a viewport
where the trigger never fired. They now create their tween from the trigger's `onEnter`, so nothing
touches the text until the section is actually reached. The suite caught this on mobile, where the
section starts below the fold.

### FAQ — the Index

The FAQ was the last plain section: an accordion with a height tween, and the
only motion on the page that could not honestly be called cinematic. Rather than
dress an accordion up, this pass changed the *driver*. Every other section is
driven by scroll, the pointer or time; this one is driven by the keyboard.

Seven questions sit as a typographic index. Typing folds away the questions that
do not match, opens the one that matches best, and leaves the rest where they
were. Clearing hands control straight back to the accordion.

**Terms OR, they do not AND.** "site design" matches no single answer, and a
strict AND returned an empty list — someone typing two words wants the two
answers carrying one word each. Matching more terms always outranks matching one,
and a hit in the question (20, plus an early-position bonus, plus length)
outweighs a hit in the answer (3). Every occurrence in the question takes an
electric `<mark>`: the accent carries type here and nowhere else, and it has to be a fill rather
than the colour of the type. Ink on `#fa5d19` is 4.8:1; the accent itself as type on the near-white
canvas is 2.9:1 and would fail.
The filter is reader-driven, so it survives reduced motion intact — the fold just
stops transitioning.

**Order is never re-sorted, on purpose.** An earlier pass promoted the survivors
to the top with Flip, and it was wrong twice over. A reorder makes rows cross, so
two answers were briefly painted over each other mid-keystroke — text over text
reads as broken, not as motion — and `Flip`'s `absolute: true` put rows out of
flow inside a list that had already collapsed to 1px, so intermediates painted
over the section *below*. That was the report: "typing characters makes results
overlap and clip over to the next section." Relevance still decides which answer
opens; it just doesn't move the furniture. It also keeps the results still while
someone walks them with the arrow keys, which is the thing a keyboard reader
wants most. With the rows in flow, containment is structural: the list's height
*is* the sum of its rows, and each clip has `overflow: hidden`.

The answers were also cut from ~570 words to ~320, so the index reads tight
enough to scan while a query is open.

**The hover surface bleeds; the text does not move.** The row's background is
painted on a box that runs `clamp(12px, 1.25vw, 20px)` past the text on both
sides and is pulled back with a negative inline margin, so the highlight has air
around it while the row numbers keep exactly the same left alignment line as the
heading above them. Insetting the text with plain padding would have been the
obvious fix and would have broken that alignment. The bleed is always smaller
than the shell's own inline padding, so it can never reach the viewport edge or
add a horizontal scrollbar.

**Three nodes per row, one animated property each** — this is what keeps the
fold, the reveal and the accordion from writing over one another:

| Node | Property | Owner |
| --- | --- | --- |
| `.faq-row__clip` | `grid-template-rows`, opacity | the fold (CSS) |
| `.faq-row__inner` | opacity, y | the ScrollTrigger reveal |
| `.faq-panel` | height | the accordion |

The clip's `overflow: hidden` does double duty: it folds the row and masks the
reveal, so a row rises from out of its own hairline. That row rule lives in the
components layer rather than as a `border-b` utility, because a utility lands in a
later layer and wins on any amount of specificity.

**Keyboard.** Down from the field steps into the results; Up off the first result
returns to the field; Home and End jump the ends; Down holds at the last result
instead of wrapping back to the top; Escape clears and hands focus back from
either side; and with no matches, Down goes nowhere rather than nowhere-adjacent.

**Two bugs this pass turned up, both worth remembering.** The panel was driven by
its position in the DOM, so any change to the order opened the wrong answer — it
is keyed by `data-faq-index` now. And the reveal needed `immediateRender: false`:
a `from` tween paints its start value at creation, and four sections above this
one change the document height on mount, so a trigger storing a start thousands of
px off left every row stuck at `opacity: 0` rather than merely unrevealed. A
missed trigger now degrades to "no reveal" instead of "no content".

### CTA — the finale

The last band before the footer, and the only lit place on the site. A key light
drifts across the dark ground on its own, so the section is alive when nobody is
touching it, and the pointer takes the light over the moment someone moves, then
hands it back to the drift after a pause. It sits *behind* the copy, on its own
layer, so it lifts the ground the type stands on instead of washing the type.

**The light's peak is 16%, and that ceiling is arithmetic, not taste.** The
smallest copy in the column is set at `inkfg/78`. At a 16% lift over `#2f2f2f` the
ground lands near luminance 0.081 and that copy still clears 5:1; push the light
higher and it drops under 4.5:1 wherever the light happens to be, and the light
moves. That note was at `/62` before this pass — fine on an unlit ground, and the
reason the light could not be made stronger. Ink on electric is still the only
place the accent carries type.

The entrance is optical rather than positional: the title pulls focus out of a
`blur(16px)` as its lines rise through their masks, and a single sheen crosses the
electric button once the section has settled.

**Its entrance is armed by an `IntersectionObserver`, not a ScrollTrigger.** Four
sections above change the document height on mount, so a trigger created here can
store a start thousands of px off, which is exactly what was happening: the sheen
was caught mid-pass because its trigger fired on its own schedule, and nothing
else in the section could be trusted to fire at all. An observer measures
intersection live. Every reveal tween is also *created* at play time rather than up
front, so a section that somehow never arms stays fully readable instead of sitting
at a start value of opacity 0.

**And one trap worth writing down:** GSAP parses an existing CSS `transform` into
its own `x`/`y` and then *adds* `xPercent` on top rather than replacing it. The
sheen had a resting `translateX(-260%)`, so its travel was doubled and it came to
rest on top of the button instead of clear of it. The resting state is now
`opacity: 0`, and GSAP owns the transform outright.

### Proof cards — filling the hero from real material only

The hero was asked to carry more, and the honest constraint is the one written at
the top of `content.ts`: *every string and asset here is the brand's own.* So
nothing on this pass was invented. What was added is material the site already
owned but never showed in the hero:

- **A client roster card**, placed under the services card. Faces and names, both
  derived: the faces come from `TESTIMONIALS`, the roster from `CLIENTS`. It sits
  in the one genuinely empty region of the stage — `right-[13vw] top-[62%]`, which
  was measured before it was used. The card overlaps nothing: the figure ends at
  x1250 and the roster starts at x1017 vertically clear of every other card, the
  headline, the lede, the actions and the meta.
- **The recognition line** — Awwwards Honorable Mention · CSS Design Awards —
  promoted from the footer to a second meta line under the hero's own meta, so
  the first viewport states its proof rather than burying it.

**There is no logo wall, deliberately.** Only four marks exist for nine clients
(Puck, Lilipad, PSSLTD, RAY AI), and they are JPEGs sitting on their own
backgrounds rather than cut-out marks, so a wall of them would read as pasted
squares. The roster states all nine as type instead. Send the missing marks as
transparent PNG or SVG and a wall becomes worth building.

**The hero now carries four cards, and that is close to its ceiling.** The stage
is a giant wordmark, a full-height portrait, three proof cards, a two-line display
headline, a lede, two CTAs and two meta lines. Further cards would start crossing
the figure or the headline, which is the one thing this composition cannot absorb.

### Capabilities — what the mapping can and cannot say

`CAPABILITIES[].projects` is the hook that fills the capability cards with the
work that proves them, and it was empty except for `support → alosant`, which is
documented by Danette Beal's own quote.

One mapping was added: **Webflow Development → all nine projects.** It is
defensible because every project in the work band is one of his Webflow builds,
which is the whole premise of the site.

**The other four stay empty on purpose, and the reason matters.** The obvious move
is to keyword-match each project's `copy`, but that copy describes what the
*client* does — "pioneering small and large molecule therapeutics", "a blockchain
studio helping Web 3.0 players" — not what was built for them. Matching
"integrating multimodal data" to the Custom Integrations capability would produce a
confident-looking claim with nothing behind it. Relevance on a real portfolio is
not worth a guess, so the four await the mapping only Nenad has.

### The density switch — comparing fill against tight

`?density=tight` tags the document element, and one labelled CSS block does the
rest. It exists because the two treatments were asked to be compared side by side,
and because a comparison should not require a code change.

Measured, at 1440px:

| | Fill (default) | Tight (`?density=tight`) |
| --- | --- | --- |
| Editorial rail | `273.6px` | `187.2px` |
| Section tail | `129.6px` | `74.9px` |
| Content left edge | `x351` | `x265` |
| Page height | `19570px` | `19475px` |

**The page height barely moves, and that is the finding.** Tightening reclaims
86px of rail in every railed section and 55px of tail in every section, but the
whole document gets just 95px shorter — because four sections are pinned runways
of one to four viewports, and those are the bulk of the page. The air is not
padding that can be trimmed; it is scroll distance the pinned sections spend
showing one plate or one set of cards at a time.

Consequences, stated plainly:

- The rail narrowing is the part that actually reads as denser, because it is
  horizontal and every railed section gets it at once.
- The section tail is the part that matters least, because the sections that ship
  `pt-0` take their top space from their neighbour's tail — halving one paddings
  both sides of the join.
- Shortening the four runways would change what those sections *do*, not just how
  they look, so the switch deliberately does not touch them.

The switch renders nothing and has no interface — it is a way to judge two
treatments, not a control the product should ship. Delete `Density.tsx` and the
labelled CSS block once one is chosen.

### Services — the rail snaps, and the section breathes

Two changes to the take, plus one correction to what was actually wrong with it.

**The rail now lands on a plan.** It is a scrub, so it could rest between two
plans and a reader had to time a scroll to stop on one. Once the scroll comes to
rest, the nearest frame is measured from the *live* rect — the same numbers the
render loop just used — and the scroller is carried there through Lenis. Because
the take is native sticky rather than a ScrollTrigger, there is no stored start
to drift, and it can never snap from off screen: the runway has to still be
covering the viewport. Verified by measuring: scrolling to three positions across
the runway ends with the framed plan **exactly 0px off centre** every time, with
the plans a consistent 705px apart.

**Only the reader's own scroll arms it.** A wheel, a touch or a key arms the snap for
the next two seconds; a programmatic jump does not. A tick in the counter and a
`scrollToY` from anywhere in the app already land on a stop, so hijacking them
would only fight whatever asked for them. That is also why this needed no test
changes: the suite drives the rail programmatically, so it still sees the exact
positions it asks for, while a real gesture gets the snap.

**A bug worth recording.** The settle detector lives inside the render loop, so
the first version re-armed its timer on every frame — clearing it at 60fps and
never letting it fire. The snap simply never happened. It now re-arms only when
the scroll position actually *changes*, which fires 170ms after the last
movement. That is the difference between "a timer in a loop" and "the scroll has
stopped".

**Passive motion, since the section was called boring.** The plates were already
carrying seven elements each — index, badge, feature count, name, rate, copy,
five features and a CTA — so more furniture was not the problem. What the section
lacked was any motion that happened without the reader scrolling:

- **A drift on every plan plate**, a 5px amplitude on a ~10s period, staggered
  per plate. It registers as breathing rather than as movement, and it rides the
  transform the render loop *already owns*, so there is still one writer per
  property.
- **A chase around the frame.** The four corner ticks of the gate fade one after
  another, forever — the corner that is bright moves around the frame. It is a
  GSAP tween rather than a CSS animation, following the client wall's precedent:
  the reduced-motion stylesheet forces `animation-duration: 0.001ms` on
  everything, so a CSS loop could not run even if it were wanted. This whole
  effect stands down in compact mode, which is what reduced motion selects, so
  the chase is already off under that preference.

### The floating card straddles the plate

One card sits **mostly beside the project screen**, overlapping its edge: 116px of its
154px hangs off the frame, so roughly three quarters of it is off the image and its
right third crosses over. Tilted −3.2°, drifting and rolling. Where the client gave a quote a second joins it
at +2.6° (Alosant, so far). Measured on the rendered page: the card overhangs the
plate's left edge by **116px** and its right third crosses over it. This is the hero's
move: its cards live off the portrait and just touch it, rather than sitting on it.

**It has to live inside the plate.** The plate owns the dolly's transform, so a
sibling would sit still while the screen travelled past it. The card is not
interactive, so a `div` inside the anchor is fine; a link inside a link would not be.

**The plate had to stop clipping.** Overflow was hidden, which is what rounded the
image's corners — so the rounding moved onto the image itself and the plate was set
to `overflow: visible`, letting the card hang over the edge. Without that the card
was simply cut off at the frame.

**The first version was still on the image.** It straddled the edge by 34px, which
reads as a card sitting on the screen rather than one beside it. "Outside, overlapping"
means most of the card is off the frame — the offset is 112px, not 30.

**Its glass is built from the dark surface, not the hero's.** `.hero-glass` mixes
from the light surface: right over the light canvas, a dark sheet with invisible ink
labels on the ink band. The card is 94% opaque, which is why it carries no
`backdrop-filter` — twelve of those over six travelling plates is real cost for no
visible gain.

**The drift lives in the render loop.** As a standalone GSAP tween it silently
animated nothing: it captured its targets while the cards were still in the caption.
The per-frame pass that already positions the plates now writes the wrappers too —
one writer per property, impossible to desynchronise. The tilt is static on the card
and the roll is live on the wrapper, so no node gets `transform` written twice.

**And the reason a correct rule had no effect.** The first straddling version set
`left: -30px` and measured a card sitting 20px *inside* the frame. The stylesheet had
**two** `.work-proof` blocks — earlier passes had appended rather than replaced — and
the later block's `left: 18px` was winning while the corrected value sat dead above
it. Editing a stylesheet in place, patch after patch, accumulates contradictions that
read as bugs in the code you just wrote. The duplicate selectors were collapsed to
one block each before the value took effect.

### The dolly steps, and lands on a plate

The dolly used to be a pure scrub with a faint neighbour always in frame: the
next plate waited below and slightly out of focus, which was the point of the
track. Two things about that made it hard to read.

**The travel is now a full viewport per step** (`Y_PER_DEPTH` went from `0.14` to
`0.9`). A framed plate is the only plate on screen: the one behind has left the
top edge, the one ahead is still below the bottom one. The blur and scale curves
are untouched, so a plate still arrives out of focus and sharpens — there is just
no half-visible neighbour sitting in the frame making the section feel like a
scroll position rather than a screen.

**And the scroll now lands on a plate.** The camera is a scrub, so the page could
rest between two plates and a reader had to time a scroll to stop on one. The
ScrollTrigger's `onUpdate` watches for the scroll going still; after 170ms of
quiet it measures the nearest plate from the trigger's *live* range and carries
the scroller there.

Two deliberate choices in that snap:

- It goes through `scrollToY` from `lib/scroll.ts`, never `window.scrollTo`.
  Lenis owns the scroller and keeps its own target, so a native call would leave
  the two fighting over the position — the exact failure `scroll.ts` exists to
  prevent. `ScrollTrigger.snap` was not used for the same reason: it animates the
  window underneath Lenis.
- It only fires while `self.isActive`, so a scroll that lands in the work *head*
  is never yanked into the runway.

Verified by measuring, not by eye: scrolling to four positions across the runway
and letting each settle ends with **exactly one plate on screen** every time, at
`opacity 1.00` and `blur(0px)`, each framed at the same 92px of headroom.

### The Work head — trimming the slack without cropping the shot

"Built in Webflow, Made to Perform" sat above a gap that read as a void: the
head's own padding, then the dolly stage's centring, then the first plate. Three
changes, and one refusal:

- The head's padding came down (`148px → 110px` top, `72px → 44px` bottom).
- The dolly track is lifted 34px. Grid centring splits padding, so 68px of bottom
  padding raises the plate by half that, leaving 92px of headroom instead of 126.
- The rail's empty column now carries the nine industries as a wrapped line —
  the prose above it *claims* nine, so the line evidences the claim. It is the
  same `WORK_SEQUENCE` tags the plates carry, read from one source.

Measured at 1440px: the head went `430px → 375px`, the gap between the lede and
the plate went `191px → ~102px`, and the page got 55px shorter rather than longer.

**One thing was deliberately not done.** The rest of that gap is the dolly
itself. The plate is centred in a 100svh stage because the plate behind it has to
have somewhere to wait before it comes forward, and the one just passed has to
have room to blow up past the lens. Cropping the stage to close the gap would
crop the effect.

**And a failed first attempt worth recording.** The industries went in as a
stacked list first, nine lines deep. That made the left column taller than the
headline beside it, so the head simply grew by 90px — the slack moved rather than
disappeared, and the page got *longer* on a turn that was already trying to
shorten it. A wrapped line keeps the two rail columns within ~35px of each other,
which is what actually removes the void.

### The editorial rails — a counted line each

Every railed section's left column held a number, a label and a paragraph, and
then nothing for the rest of the viewport. Each now carries a derived index line
between the label and the paragraph:

| Section | Line |
| --- | --- |
| About | `7 milestones · 2019–2026` |
| Work | `9 projects · 6 in the dolly` |
| Capabilities | `6 services · 9 projects` |
| Clients | `8 voices · 9 industries` |
| Faq | `7 questions · searchable` |

They live in one `RAIL_INDEX` object and every value is **counted from the data**,
never typed: add a project and the rail updates itself, and the rail can never
disagree with the section under it. The Clients line's industry count is the same
derivation the work band uses, which is why it agrees with the "Nine industries"
line already sitting in the Work rail.

**There are five editorial rails, not six.** An earlier note here said six;
Engagement rides its own horizontal rail rather than the `.shell.rail` column, so
it never had an empty left column to fill.

### The runways — what tightening the four pinned sections actually bought

Each pinned section's runway was shortened by roughly a quarter. Every one of them
is progress-driven, so the animation's internal proportions are untouched and only
the distance it is spread over changes — which reads as a brisker page, not a
different one.

| Section | Before | After | Change |
| --- | --- | --- | --- |
| About (Journey) | `275svh` | `230svh` | −543px |
| Work (the dolly) | `4.6` viewports | `3.3` viewports | −1450px |
| Capabilities | `1.15` viewports | `0.85` viewports | −333px |
| Services (the take) | `300svh` | `225svh` | −825px |
| **Whole page** | `19570px` | `17052px` | **−2518px (−12.9%)** |

**And the honest arithmetic that came out of it.** The pinned sections were 75% of
this page and are now 68%. A quarter off every runway moves that ratio by seven
points, not thirty, because each runway is spending its distance showing something
real — six plates, seven chapters, three plans, six capabilities. The only way
past roughly two-thirds is to show fewer things per runway: the dolly featuring
three plates instead of six, with the other three left to the index, would take
another ~1,500px off. That is a content decision, not a spacing one, so it was not
made here.

The Hero still runs a 3-viewport runway. It was not one of the four named, and it
is the one place a long hold is doing real work — the figure dolls, dissolves and
scatters across it — so it was left alone deliberately.

### A note on the running dev server

This pass was verified against the dev server already running on port 4321 with
`tsc --noEmit` and the full end-to-end suite, and **no production build was run**.
`next build` and `next dev` share the `.next` directory, so building while the dev
server is up can clobber the chunks it is serving. On a turn that asks for the
server to stay up, the suite is the meaningful check and the build is the one that
has to wait.

### Case study pages### FAQ — the Index

The FAQ was the last plain section: an accordion with a height tween, and the
only motion on the page that could not honestly be called cinematic. Rather than
dress an accordion up, this pass changed the *driver*. Every other section is
driven by scroll, the pointer or time; this one is driven by the keyboard.

Seven questions sit as a typographic index. Typing dissolves the questions that
do not match, re-sorts the ones that do to the top, and opens the top hit under
the field. Clearing hands control straight back to the accordion.

**Terms OR, they do not AND.** "site design" matches no single answer, and a
strict AND returned an empty list — someone typing two words wants the two
answers carrying one word each. Matching more terms always outranks matching one,
and a hit in the question (20, plus an early-position bonus, plus length)
outweighs a hit in the answer (3). Every occurrence in the question takes an
electric `<mark>`: the accent carries type here and nowhere else, and it has to be a fill rather
than the colour of the type. Ink on `#fa5d19` is 4.8:1; the accent itself as type on the near-white
canvas is 2.9:1 and would fail.
The filter is the only place on the page where the reader's own input drives the
motion, so it survives reduced motion intact — the dissolve just stops
transitioning.

**Flip earns its place.** Collapsing a row cannot reorder a list, so the
survivors' reorder is a real Flip: measured in the change handler, before React
commits, and played from a layout effect after. With no query the order is
untouched, which is why the shipped accordion behaves exactly as it did.

**Four nodes per row, one property each** — this is what keeps Flip, the
collapse, the reveal and the accordion from writing over one another:

| Node | Property | Owner |
| --- | --- | --- |
| `.faq-row` | transform | Flip |
| `.faq-row__clip` | `grid-template-rows`, opacity | the CSS dissolve |
| `.faq-row__inner` | opacity, y | the ScrollTrigger reveal |
| `.faq-panel` | height | the accordion |

The clip's `overflow: hidden` does double duty: it collapses the row and masks the
reveal, so a row rises from out of its own hairline. That row rule lives in the
components layer rather than as a `border-b` utility, because a utility lands in a
later layer and wins on any amount of specificity.

**Two bugs this pass turned up, both worth remembering.** The panel was driven by
its position in the DOM; once Flip reorders the list, DOM position stops matching
question order, so the open answer landed on the wrong row — it is keyed by
`data-faq-index` now. And the reveal needed `immediateRender: false`: a `from`
tween paints its start value at creation, and four sections above this one change
the document height on mount, so a trigger storing a start thousands of px off
left every row stuck at `opacity: 0` rather than merely unrevealed. A missed
trigger now degrades to "no reveal" instead of "no content".

### Case study pages### FAQ — the Index

The FAQ was the last plain section: an accordion with a height tween, and the
only motion on the page that could not honestly be called cinematic. Rather than
dress an accordion up, this pass changed the *driver*. Every other section is
driven by scroll, the pointer or time; this one is driven by the keyboard.

Seven questions sit as a typographic index. Typing dissolves the questions that
do not match, re-sorts the ones that do to the top, and opens the top hit under
the field. Clearing hands control straight back to the accordion.

**Terms OR, they do not AND.** "site design" matches no single answer, and a
strict AND returned an empty list — someone typing two words wants the two
answers carrying one word each. Matching more terms always outranks matching one,
and a hit in the question (20, plus an early-position bonus, plus length)
outweighs a hit in the answer (3). Every occurrence in the question takes an
electric `<mark>`: the accent carries type here and nowhere else, and it has to be a fill rather
than the colour of the type. Ink on `#fa5d19` is 4.8:1; the accent itself as type on the near-white
canvas is 2.9:1 and would fail.
The filter is the only place on the page where the reader's own input drives the
motion, so it survives reduced motion intact — the dissolve just stops
transitioning.

**Flip earns its place.** Collapsing a row cannot reorder a list, so the
survivors' reorder is a real Flip: measured in the change handler, before React
commits, and played from a layout effect after. With no query the order is
untouched, which is why the shipped accordion behaves exactly as it did.

**Four nodes per row, one property each** — this is what keeps Flip, the
collapse, the reveal and the accordion from writing over one another:

| Node | Property | Owner |
| --- | --- | --- |
| `.faq-row` | transform | Flip |
| `.faq-row__clip` | `grid-template-rows`, opacity | the CSS dissolve |
| `.faq-row__inner` | opacity, y | the ScrollTrigger reveal |
| `.faq-panel` | height | the accordion |

The clip's `overflow: hidden` does double duty: it collapses the row and masks the
reveal, so a row rises from out of its own hairline. That row rule lives in the
components layer rather than as a `border-b` utility, because a utility lands in a
later layer and wins on any amount of specificity.

**Two bugs this pass turned up, both worth remembering.** The panel was driven by
its position in the DOM; once Flip reorders the list, DOM position stops matching
question order, so the open answer landed on the wrong row — it is keyed by
`data-faq-index` now. And the reveal needed `immediateRender: false`: a `from`
tween paints its start value at creation, and four sections above this one change
the document height on mount, so a trigger storing a start thousands of px off
left every row stuck at `opacity: 0` rather than merely unrevealed. A missed
trigger now degrades to "no reveal" instead of "no content".

### Case study pages

Every project in the index has a page at `/work/<id>`, prerendered by `generateStaticParams`. That
is where the dolly's plates, its caption and every row of the index point. There is a
`caseStudyPath()` helper rather than a `href` field on each project, so a card can never link to a
page that does not exist and `generateStaticParams` cannot drift away from what the cards point at.

The index row's grid lives on the anchor rather than the `<li>`, so the whole row is the hit area
instead of just the name, and the anchor bleeds outward by its own padding so the hover surface
reads as a panel while the text stays aligned with the column heading above it.

**These pages are deliberately thin, and that is the honest state of the content.** The only case
study material that exists is what the work band already shows: the industry, the name, one sentence
of copy, the screen, and — for Alosant alone — a client testimonial that names them. Nothing here
invents a role, a timeline or an outcome, because a portfolio that fabricates a client result is
worse than one with a short page. Everything renders from `content.ts`; fill in more there and these
grow.

The plate is capped at its own pixel width. Three of the nine sources are small logos, and blowing
them up to a shared size would only make them soft — a test asserts no plate is ever rendered wider
than its own resolution.

## Deploying (GitHub Pages)

The site is a static export. `npm run build` writes it to `out/`, and
`.github/workflows/deploy.yml` builds and publishes that folder to GitHub Pages
on every push to `main`.

- The address the build writes into canonical links, the sitemap and share
  images is `SITE_URL` in `src/lib/site.ts`. Override it without a code change
  by setting the repository variable `SITE_URL`.
- `npm run brand-assets` regenerates the share image, the app icon and the
  favicon from the wordmark, the portrait and the brand fonts.
- `npm start` serves the last export locally.

