import { test, expect, type Page } from "@playwright/test";

const CONSOLE_ALLOWLIST = [
  /favicon/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /\[HMR\]/i,
];

type ErrorBag = { pageErrors: string[]; consoleErrors: string[] };

function watchForErrors(page: Page): ErrorBag {
  const bag: ErrorBag = { pageErrors: [], consoleErrors: [] };
  page.on("pageerror", (err) => bag.pageErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (CONSOLE_ALLOWLIST.some((rx) => rx.test(text))) return;
    bag.consoleErrors.push(text);
  });
  return bag;
}

/** Lenis owns the scroller, so scroll the way a user does: with the wheel. */
async function scrollToId(page: Page, id: string) {
  for (let i = 0; i < 160; i++) {
    const top = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top : 0;
    }, `#${id}`);
    if (top <= 4) return;
    await page.mouse.wheel(0, Math.min(600, Math.max(120, top)));
    await page.waitForTimeout(45);
  }
}

/** Wheel to the bottom — `window.scrollTo` fights Lenis, the wheel doesn't. */
async function scrollToBottom(page: Page) {
  let last = -1;
  for (let i = 0; i < 240; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(45);
  }
}

/** Lenis keeps gliding after the last wheel event; wait for it to actually stop. */
async function waitForScrollSettled(page: Page) {
  // Four consecutive stable samples (~600ms), not one: Lenis plateaus briefly
  // mid-glide, and a single stable read returns while it is still moving.
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 80; i++) {
    await page.waitForTimeout(150);
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === last) {
      stable += 1;
      if (stable >= 4) return;
    } else {
      stable = 0;
    }
    last = y;
  }
}

/**
 * Wheel until the hero's scroll runway is `target` complete (0-1).
 * The hero is 3 viewports tall, so "fraction of the hero still on screen" can
 * never approach 1 — progress through the runway is the meaningful measure.
 * Each step is small and waited out so Lenis' glide has finished before the
 * next measurement; otherwise momentum carries the page past the target.
 */
async function wheelHeroProgress(page: Page, target: number) {
  for (let i = 0; i < 200; i++) {
    const progress = await page.evaluate(() => {
      const h = document.querySelector("#top") as HTMLElement;
      return Math.min(1, window.scrollY / h.getBoundingClientRect().height);
    });
    if (progress >= target) return;
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(80);
  }
}

/** Wheel the document to an absolute Y, letting each step's glide finish. */
async function wheelToY(page: Page, px: number) {
  for (let i = 0; i < 400; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= px - 6) break;
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(900);
}

/** Wheel to an absolute Y from EITHER direction, then let the scrub settle.
    `wheelToY` only ever moves forward, so a step that overshoots stays
    overshot — which matters when a test needs an exact progress. */
async function wheelToYExact(page: Page, px: number) {
  for (let i = 0; i < 500; i++) {
    const y = await page.evaluate(() => window.scrollY);
    const delta = px - y;
    if (Math.abs(delta) <= 8) {
      await page.waitForTimeout(100);
      const y2 = await page.evaluate(() => window.scrollY);
      if (Math.abs(y2 - y) <= 2 && Math.abs(px - y2) <= 12) break;
    }
    const speed = Math.abs(delta) < 200
      ? Math.sign(delta) * Math.min(50, Math.max(10, Math.abs(delta)))
      : Math.max(-300, Math.min(300, delta));
    await page.mouse.wheel(0, speed);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(800);
}

async function opacityOf(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? Number(getComputedStyle(el).opacity) : -1;
  }, selector);
}

test.describe("page boots", () => {
  test("renders the hero with no runtime errors", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });

    // Two display lines.
    await expect(page.locator("h1")).toContainText("Websites that work.");
    await expect(page.locator("h1")).toContainText("Systems that run.");
    // ...and the split lines must still read as a sentence
    await expect(page.locator("h1")).toHaveAttribute("aria-label", /Websites that work\. Systems that run\./);
    await expect(page.getByRole("link", { name: "Start a project" }).first()).toBeVisible();
    // The client strip lives in the hero's landing now: behind the stage until
    // the dive arrives on desktop, the next block on a phone.
    await expect(page.locator('[data-od-id="client-marquee"] li').first()).toBeAttached();

    expect(errors.pageErrors, `uncaught page errors:\n${errors.pageErrors.join("\n")}`).toEqual([]);
    expect(
      errors.consoleErrors,
      `console errors:\n${errors.consoleErrors.join("\n")}`,
    ).toEqual([]);
  });

  test("GSAP mounts: SplitText splits, Lenis binds, and the held sections register", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });

    // SplitText runs after document.fonts.ready, so give it a beat.
    await expect
      .poll(async () => page.locator(".hero-title .split-line").count(), { timeout: 20_000 })
      .toBeGreaterThan(0);

    /* Every held section is a CSS sticky stage inside its own runway now, and
       its timeline is registered by name. Nothing uses a ScrollTrigger pin, so
       there must be no pin-spacer to strand. */
    if (!isMobile) {
      await expect
        .poll(
          async () =>
            page.evaluate(() =>
              Object.keys((window as unknown as { __timelines?: object }).__timelines ?? {}).sort().join(","),
            ),
          { timeout: 20_000 },
        )
        .toBe("dial,flow,hero,reel,shape");
    }
    await expect(page.locator(".pin-spacer")).toHaveCount(0);

    // Lenis only activates when motion is allowed
    await expect.poll(async () => page.locator("html.lenis").count()).toBe(1);
  });

  test("the figure fills the stage and the copy rides the masked canvas scrim", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    // The intro runs ~3.1s and moves the figure; measure the resting hero.
    await page.waitForTimeout(4500);

    const vh = await page.evaluate(() => window.innerHeight);

    /* The scrim is deliberately translucent — the whole point of it is that the
       body reads through — so the 4.5:1 gate can no longer be checked against the
       canvas token. What can be guaranteed is the scrim's FLOOR: `--fog-min` of
       canvas over the worst case there is, a black garment, must still carry ink.
       If that holds, no photograph underneath can break the headline. The check
       also confirms the copy actually sits inside the band and the column where
       that floor applies, because outside them the scrim is weaker by design. */
    const scrimCheck = () =>
      page.evaluate(() => {
        const lin = (v: number) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const lum = (rgb: number[]) =>
          0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
        const rgb = (c: string) => c.match(/\d+/g)!.slice(0, 3).map(Number);

        const title = document.querySelector(".hero-title") as HTMLElement;
        const fog = document.querySelector(".hero-fog") as HTMLElement;
        const cs = getComputedStyle(fog);
        const pct = (n: string) => parseFloat(cs.getPropertyValue(n)) / 100;

        const alpha = pct("--fog-min");
        const ramp = 1 - pct("--fog-solid"); // how far the ramp eats into the top
        const colStart = pct("--fog-col-start");
        const colEnd = pct("--fog-col-end");
        const f = fog.getBoundingClientRect();

        const copy = [
          title,
          document.querySelector(".hero-lede"),
          ...document.querySelectorAll(".hero-meta"),
        ].filter(Boolean) as HTMLElement[];

        /* The scrim LIGHTENS the ground — the page is near-white and the ink is
           near-black — so its floor has to carry ink over the darkest thing that
           can sit underneath it, a black garment. Anything lighter is easier. */
        const canvas = [249, 249, 249]; // --color-canvas
        const over = canvas.map((c) => c * alpha);
        const floor = lum(over);
        const ink = lum(rgb(getComputedStyle(title).color));
        const bandTop = f.top + ramp * f.height;

        return {
          color: getComputedStyle(title).color,
          masked: cs.getPropertyValue("mask-image") !== "none",
          ratio: (Math.max(floor, ink) + 0.05) / (Math.min(floor, ink) + 0.05),
          belowRamp: copy.every(
            (el) => el.getBoundingClientRect().top >= bandTop - 0.5,
          ),
          inColumn: copy.every((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.left >= f.left + colStart * f.width - 0.5 &&
              r.right <= f.left + colEnd * f.width + 0.5
            );
          }),
        };
      });

    if (!isMobile) {
      // The reference's `.hero-profile-img` is 100vw x 100vh, bottom-anchored.
      const imgH = await page.evaluate(
        () => (document.querySelector(".hero-portrait img") as HTMLElement).getBoundingClientRect().height,
      );
      expect(imgH, "the figure must fill the stage height").toBeGreaterThanOrEqual(vh - 2);
    }

    if (isMobile) {
      /* The desktop composition, scaled down: the wordmark stands behind, the
         figure is a bottom-anchored full-bleed backdrop, and the copy rides
         the scrim at the floor of the stage. */
      await expect(page.locator(".hero-wordmark")).toBeVisible();

      const measure = () =>
        page.evaluate(() => {
          const rect = (el: Element | null) => {
            const r = (el as Element).getBoundingClientRect();
            return { l: r.left, t: r.top, r: r.right, b: r.bottom };
          };
          const stage = document.querySelector("#top > div") as HTMLElement;
          return {
            stage: rect(stage),
            band: rect(document.querySelector(".hero-media")),
            img: rect(document.querySelector(".hero-portrait img")),
            copy: rect(document.querySelector(".hero-copy")),
            title: rect(document.querySelector(".hero-title")),
            vh: window.innerHeight,
            /* The stage is `min-h-svh`, and on an emulated phone the small
               viewport is not `innerHeight` — Pixel 7 reports a 915px screen,
               an 890px layout viewport and a 839px visual viewport, and
               `100svh` matches the last. Compare the stage to the same unit the
               design uses, or the assertion measures the emulator, not the css. */
            svh: window.visualViewport?.height ?? window.innerHeight,
            vw: window.innerWidth,
            scrollW: document.documentElement.scrollWidth,
          };
        });

      /* The device's own viewport AND a short 390x653 phone. The short case is
         where a px-sized copy would outgrow the garment; it is sized in `svh`
         precisely so it cannot. */
      for (const size of [null, { width: 390, height: 653 }]) {
        if (size) {
          await page.setViewportSize(size);
          await page.waitForTimeout(500);
        }
        const geo = await measure();
        const where = size ? `${size.width}x${size.height}` : "device";

        // The stage fills the (small) viewport it is sized against.
        expect(
          geo.stage.b - geo.stage.t,
          `[${where}] the hero stage must fill the viewport`,
        ).toBeGreaterThanOrEqual(geo.svh - 1);
        // The head clears the fixed nav rather than hiding behind it.
        expect(geo.band.t, `[${where}] the figure must clear the nav`).toBeGreaterThanOrEqual(70);
        // The figure fills the stage, bottom-anchored, and reads large.
        expect(geo.img.b, `[${where}] the figure must sit on the stage floor`).toBeCloseTo(
          geo.stage.b,
          0,
        );
        expect(
          geo.img.b - geo.img.t,
          `[${where}] the figure must fill the stage height`,
        ).toBeGreaterThanOrEqual(geo.band.b - geo.band.t - 2);
        expect(
          geo.img.r - geo.img.l,
          `[${where}] the figure must read large on a phone`,
        ).toBeGreaterThanOrEqual(geo.vw * 0.7);

        // The copy rides the garment, at the floor of the stage, never clipped.
        expect(
          geo.copy.b,
          `[${where}] the copy must not spill past the stage`,
        ).toBeLessThanOrEqual(geo.stage.b + 1);
        expect(geo.copy.t, `[${where}] the copy must start on the figure`).toBeGreaterThanOrEqual(
          geo.band.t - 1,
        );
        // Nothing introduced a horizontal scroll.
        expect(geo.scrollW, `[${where}] the hero must not scroll sideways`).toBeLessThanOrEqual(
          geo.vw,
        );
      }

      const scrim = await scrimCheck();
      expect(scrim.masked, "the scrim must be a masked layer").toBe(true);
      expect(scrim.color, "the headline must be ink").toBe("rgb(38, 38, 38)");
      expect(scrim.belowRamp, "the copy must sit below the scrim's ramp").toBe(true);
      expect(
        scrim.inColumn,
        "the copy must sit inside the scrim's full-strength column",
      ).toBe(true);
      expect(
        scrim.ratio,
        "the scrim's floor must carry ink over a black garment",
      ).toBeGreaterThan(4.5);
      return;
    }

    const scrim = await scrimCheck();
    expect(scrim.masked, "the scrim must be a masked layer").toBe(true);
    expect(scrim.color, "the headline must be ink").toBe("rgb(38, 38, 38)");
    expect(scrim.belowRamp, "the copy must sit below the scrim's ramp").toBe(true);
    expect(
      scrim.inColumn,
      "the copy must sit inside the scrim's full-strength column",
    ).toBe(true);
    expect(
      scrim.ratio,
      "the scrim's floor must carry ink over a black garment",
    ).toBeGreaterThan(4.5);
  });

  test("the flow renders the branch that suits the viewport", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    await expect(page.locator("#about h2")).toContainText("From a click on your site");
    // Four stations either way, and never both branches at once.
    await expect(page.locator("#about .sys-station")).toHaveCount(4);
    await expect(page.locator("#about .sys-caption")).toHaveCount(4);
    // It says on screen that the scene is made up.
    await expect(page.locator("#about .sys-note")).toContainText(/illustrative/i);

    if (isMobile) {
      /* Stacked: each station under its own caption, finished, no camera. */
      await expect(page.locator(".sys--compact .sys-step")).toHaveCount(4);
      await expect(page.locator(".sys-stage")).toHaveCount(0);
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll(".sys-station")].map((el) => {
          const r = el.getBoundingClientRect();
          return r.left >= 0 && r.right <= window.innerWidth;
        }),
      );
      expect(overflow.every(Boolean), "a station overflows the phone").toBe(true);
    } else {
      await expect(page.locator(".sys--compact")).toHaveCount(0);
      await expect(page.locator(".sys-stage")).toHaveCount(1);
    }
  });

  test("the work section renders the branch that suits the viewport", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    await expect(page.locator("#work h2")).toContainText("Four kinds of build");
    await expect(page.locator(".work-index__name")).toHaveText([
      "1910.ai",
      "SemiconBio",
      "Happy Ring",
      "Omicron",
      "Puck",
      "Alosant",
      "Lilipad",
      "PSSLTD",
      "RAY AI",
    ]);

    // Four plates and four captions either way, and never both branches at once.
    await expect(page.locator("#work .reel-plate")).toHaveCount(4);
    // ...plus a fifth caption for the stack wall that closes the take.
    await expect(page.locator("#work .reel-caption")).toHaveCount(5);
    /* Every tool is on the wall, in its group, on both branches. */
    const wall = page.locator('#work [data-od-id="reel-stack"]');
    await expect(wall.locator(".reel-wall-group")).toHaveCount(3);
    await expect(wall.locator(".reel-wall-chip")).toHaveCount(21);
    for (const tool of ["Next.js", "TypeScript", "n8n", "Windmill", "OpenAI", "Claude", "Gemini", "Higgsfield", "MiMo"]) {
      await expect(wall.locator(".reel-wall-chip", { hasText: tool }).first()).toBeAttached();
    }
    // Hand-coded only: no page builder is named anywhere in the reel.
    await expect(page.locator("#work .reel")).not.toContainText(/webflow|framer|wordpress/i);
    // The dashboard is the one plate with data-looking marks; it says they are not real.
    await expect(page.locator("#work .reel-dash-head span")).toHaveText(/example/i);

    if (isMobile) {
      // Below lg the reel is a native snapping rail, not a pin.
      await expect(page.locator(".reel--compact .reel-card")).toHaveCount(4);
      await expect(page.locator(".reel-stage")).toHaveCount(0);
    } else {
      await expect(page.locator(".reel--compact")).toHaveCount(0);
      await expect(page.locator(".reel-stage")).toHaveCount(1);
      await expect(page.locator(".reel-tick")).toHaveCount(5);
      // Each plate carries its own tools as docked chips: 5 + 4 + 5 + 3.
      await expect(page.locator(".reel-track .reel-chip")).toHaveCount(17);
    }
  });

  test("every reel plate is presented whole, never cropped", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    /* A plate is a 16:10 screen drawn in markup and scaled as one object, so
       the check is on its own box: the right shape, and nothing inside it
       spilling past its edges. */
    /* The plates turn in 3D on the stage, which foreshortens their boxes, so
       the turn and the depth move are taken off before measuring. */
    await page.addStyleTag({ content: ".reel-plate, .reel-tilt { transform: none !important; }" });
    const plates = await page.evaluate(() =>
      [...document.querySelectorAll("#work .reel-screen")].map((el) => {
        const r = el.getBoundingClientRect();
        /* The sheen, the cursor and the wire pulses are meant to travel
           through and past the glass, which clips them. */
        const spill = [...el.querySelectorAll("*:not(.reel-sheen):not(.reel-cursor):not(.reel-cursor *):not(.reel-pulse):not(.reel-ripple)")].some((c) => {
          const b = c.getBoundingClientRect();
          return b.width > 0 && (b.left < r.left - 2 || b.right > r.right + 2);
        });
        return { ratio: r.width / r.height, w: r.width, spill };
      }),
    );
    expect(plates.length).toBe(4);
    for (const pl of plates) {
      expect(pl.ratio, "a plate is 16:10").toBeCloseTo(1.6, 1);
      expect(pl.spill, "something spills out of a plate").toBe(false);
      if (isMobile) expect(pl.w, "a plate is wider than the phone").toBeLessThanOrEqual(page.viewportSize()!.width);
    }
  });

  test("the work section strands no pinned space on a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "only the compact branch can strand a desktop pin");

    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2000);

    /* The desktop branch renders once before the media query flips the section
       to its compact form, so a pin IS built in that window. Killing a pinned
       trigger without reverting it leaves the spacer behind — which put ~5
       viewports of empty band between the rail and the index. */
    await expect(page.locator(".pin-spacer")).toHaveCount(0);

    const gap = await page.evaluate(() => {
      const rail = document.querySelector(".reel")!.getBoundingClientRect();
      const index = document.querySelector(".work-index")!.getBoundingClientRect();
      return Math.round(index.top - rail.bottom);
    });
    // The rail has no runway on a phone, so nothing but its own padding sits
    // between it and the index.
    expect(gap, "the index must follow the rail directly").toBeLessThanOrEqual(8);
    const railH = await page.evaluate(() => document.querySelector(".reel")!.getBoundingClientRect().height);
    // Rail plus the stack list is a screen and a bit; the runway is 3.2 screens.
    const vh = await page.evaluate(() => window.innerHeight);
    expect(railH, "the rail must not carry the desktop runway").toBeLessThan(vh * 2);
  });

  test("every work index row links to its case study", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    const rows = await page
      .locator(".work-index__link")
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).getAttribute("href")));

    expect(rows).toEqual([
      "/work/1910",
      "/work/semiconbio",
      "/work/happyring",
      "/work/omicron",
      "/work/puck",
      "/work/alosant",
      "/work/lilipad",
      "/work/pssltd",
      "/work/rayai",
    ]);
    // One destination each — nothing in the list points at a page that
    // `generateStaticParams` does not build.
    expect(new Set(rows).size).toBe(9);
  });

  test("the capabilities render the branch that suits the viewport", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    await expect(page.locator("#capabilities h2")).toContainText("Six things");
    // Hand-coded only: no page builder is offered here.
    await expect(page.locator("#capabilities")).not.toContainText(/webflow|framer|wordpress/i);

    if (isMobile) {
      await expect(page.locator(".dial-list .dial-card")).toHaveCount(6);
      await expect(page.locator(".dial-stage")).toHaveCount(0);
      await expect(page.locator(".dial-card .dial-points li")).toHaveCount(18);
    } else {
      await expect(page.locator(".dial-list")).toHaveCount(0);
      await expect(page.locator(".dial-stage")).toHaveCount(1);
      await expect(page.locator(".dial-node")).toHaveCount(6);
      await expect(page.locator(".dial-title")).toHaveCount(6);
      await expect(page.locator(".dial-body .dial-points li")).toHaveCount(18);
    }
  });

  test("every capability draws an icon", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    /* `Icon` returns null for a name it does not know, and it fails silently —
       no error, no missing-asset warning, just an empty circle. A count of
       drawable shapes is the only thing that catches that. */
    const icons = await page.evaluate(() =>
      [...document.querySelectorAll(".dial-node-in, .dial-card-icon")].map((el) => {
        const svg = el.querySelector(".dial-icon");
        const box = el.getBoundingClientRect();
        const r = svg?.getBoundingClientRect();
        return {
          hasSvg: !!svg,
          shapes: svg ? svg.querySelectorAll("path, rect, circle, ellipse, line, polyline").length : 0,
          // centred in its circle, not parked in a corner of it
          off: r ? Math.hypot(r.left + r.width / 2 - (box.left + box.width / 2), r.top + r.height / 2 - (box.top + box.height / 2)) : 99,
        };
      }),
    );

    expect(icons).toHaveLength(6);
    icons.forEach((ic, i) => {
      expect(ic.hasSvg, `capability ${i + 1} has an icon`).toBe(true);
      expect(ic.shapes, `capability ${i + 1} icon has drawable shapes`).toBeGreaterThan(0);
      expect(ic.off, `capability ${i + 1} icon is centred`).toBeLessThan(3);
    });
  });

  test("the capability cards reflow from two columns to one on a phone", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    for (const c of [
      { w: 390, h: 844, cols: 1 },
      { w: 768, h: 900, cols: 2 },
    ]) {
      await page.setViewportSize({ width: c.w, height: c.h });
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".dial-card")].map((el) => el.getBoundingClientRect());
        return {
          cols: new Set(cards.map((r) => Math.round(r.left))).size,
          inside: cards.every((r) => r.left >= 0 && r.right <= window.innerWidth),
          vw: window.innerWidth,
          scrollW: document.documentElement.scrollWidth,
        };
      });
      expect(m.cols, `[${c.w}px] the cards must use ${c.cols} column(s)`).toBe(c.cols);
      expect(m.inside, `[${c.w}px] a card overflows`).toBe(true);
      expect(m.scrollW, `[${c.w}px] the page must not scroll sideways`).toBeLessThanOrEqual(m.vw);
    }
  });

  test("ways to work renders the branch that suits the viewport", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    await expect(page.locator("#engagement h2")).toContainText("Four ways");
    // No packages and no prices: nothing here may look like one.
    await expect(page.locator("#engagement")).not.toContainText(/[$€£]\s?\d|per month|\/mo\b|webflow/i);

    // Consultancy and full-time lead, as asked.
    const names = isMobile ? page.locator(".shape-card .shape-name") : page.locator(".shape-panel .shape-name");
    await expect(names).toHaveText(["Ongoing consultancy", "Full-time role", "Freelance project", "Short gig"]);
    // Every arrangement says how it starts, in place of a price.
    await expect(page.locator("#engagement .shape-facts dt", { hasText: "How it starts" })).toHaveCount(4);

    if (isMobile) {
      await expect(page.locator(".shape-list .shape-card")).toHaveCount(4);
      await expect(page.locator(".shape-stage")).toHaveCount(0);
      /* Stacked, there is no timeline, so each calendar must already be drawn
         in its own shape: twelve marks for the rhythm and the line, six for the
         project, two for the gig. */
      const drawn = await page.evaluate(() =>
        [...document.querySelectorAll(".shape-card")].map(
          (card) => [...card.querySelectorAll(".shape-mark")].filter((m) => Number(getComputedStyle(m).opacity) > 0.5).length,
        ),
      );
      expect(drawn).toEqual([12, 12, 6, 2]);
    } else {
      await expect(page.locator(".shape-list")).toHaveCount(0);
      await expect(page.locator(".shape-stage")).toHaveCount(1);
      await expect(page.locator(".shape-stage .shape-mark")).toHaveCount(12);
    }
  });

  test("the calendar morphs into each arrangement's shape", async ({ page, isMobile }) => {
    test.skip(isMobile, "the morph only runs on the pinned branch");
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2500);

    const geo = await page.evaluate(() => {
      const j = document.querySelector(".shape") as HTMLElement;
      return (j.getBoundingClientRect().height - window.innerHeight) / window.innerHeight;
    });
    expect(geo, "four arrangements on one pin").toBeGreaterThan(0.9);
    expect(geo).toBeLessThan(1.1);

    /* Arrangement k is set from k * 2s. The frames are asked for directly and
       out of order, which is the contract every held section is built to. */
    const at = (t: number) =>
      page.evaluate((time) => {
        const tl = (window as unknown as { __timelines: Record<string, { time(t: number): unknown }> })
          .__timelines.shape;
        tl.time(time);
        const vis = (el: Element) =>
          getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.9;
        const marks = [...document.querySelectorAll(".shape-stage .shape-mark")].map((el) => {
          const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
          return { on: Number(getComputedStyle(el).opacity) > 0.5, sx: +m.a.toFixed(2), sy: +m.d.toFixed(2) };
        });
        return {
          on: marks.filter((m) => m.on).length,
          sx: marks[0].sx,
          sy: marks[0].sy,
          panel: [...document.querySelectorAll(".shape-panel")].map(vis).indexOf(true),
          panels: [...document.querySelectorAll(".shape-panel")].filter(vis).length,
          span: ([...document.querySelectorAll(".shape-spans .shape-span")] as HTMLElement[])
            .filter(vis)
            .map((el) => el.textContent)
            .join("|"),
          playhead: Math.round(new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".shape-playhead")!).transform).e),
          track: (document.querySelector(".shape-track") as HTMLElement).offsetWidth,
        };
      }, t);

    const gig = await at(7.4);
    const rhythm = await at(1.0);
    const line = await at(3.0);
    const bar = await at(5.0);
    const rhythmAgain = await at(1.0);

    expect(rhythm.panel).toBe(0);
    expect(rhythm.on, "consultancy is a mark every week").toBe(12);
    expect(rhythm.sx, "…a short one").toBeLessThan(0.5);
    expect(rhythm.span).toBe("Rolling");

    expect(line.panel).toBe(1);
    expect(line.on, "full-time runs the whole calendar").toBe(12);
    expect(line.sx, "…with no gaps between weeks").toBeGreaterThan(1);
    expect(line.span).toBe("Open-ended");

    expect(bar.panel).toBe(2);
    expect(bar.on, "a project is six weeks of bar").toBe(6);
    expect(bar.sy, "…heavier than the line").toBeGreaterThan(line.sy);
    expect(bar.span).toBe("Weeks");

    expect(gig.panel).toBe(3);
    expect(gig.on, "a gig is two weeks at most").toBe(2);
    expect(gig.sy, "…and the heaviest mark of all").toBeGreaterThan(bar.sy);
    expect(gig.span).toBe("Days");
    expect(gig.playhead, "the playhead stops where the gig does").toBeLessThanOrEqual(Math.round(gig.track / 6) + 2);

    for (const f of [rhythm, line, bar, gig]) expect(f.panels, "exactly one panel is up").toBe(1);
    expect(rhythmAgain, "seeking back gives the identical frame").toEqual(rhythm);
  });

  test("the brief prints what is ticked and writes the email", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    const brief = page.locator('[data-od-id="brief"]');
    await brief.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(1200);
    const paper = page.locator('[data-od-id="brief-paper"]');
    const send = page.locator('[data-od-id="brief-send"]');
    const mail = async () => decodeURIComponent((await send.getAttribute("href")) ?? "");

    // Before anything is ticked it is still a usable email, to the right inbox.
    await expect(paper).toContainText("Nothing ticked yet.");
    expect(await mail()).toMatch(/^mailto:kimjoshuadr@gmail\.com\?subject=Brief: Ongoing consultancy&body=Hi Kim,/);

    // Tick two needs, pick an arrangement: both reach the paper and the email.
    await brief.getByRole("button", { name: "A new website" }).click();
    await brief.getByRole("button", { name: "An AI agent" }).click();
    await brief.getByRole("radio", { name: "Short gig" }).click();
    await expect(paper.locator(".brief-line")).toHaveCount(2);
    await expect(paper).toContainText("02 items");
    await expect(paper).toContainText("Short gig");
    await expect(paper).not.toContainText("Nothing ticked yet.");
    await expect(brief.getByRole("button", { name: "A new website" })).toHaveAttribute("aria-pressed", "true");
    await expect(brief.getByRole("radio", { name: "Short gig" })).toHaveAttribute("aria-checked", "true");
    await expect(brief.getByRole("radio", { name: "Ongoing consultancy" })).toHaveAttribute("aria-checked", "false");
    let body = await mail();
    expect(body).toContain("- A new website");
    expect(body).toContain("- An AI agent");
    expect(body).toContain("How I'd like to work: Short gig");
    expect(body).toContain("subject=Brief: Short gig");

    // Untick one: it leaves both.
    await brief.getByRole("button", { name: "A new website" }).click();
    await expect(paper.locator(".brief-line")).toHaveCount(1);
    body = await mail();
    expect(body).not.toContain("- A new website");
    expect(body).toContain("- An AI agent");

    // The chips are real targets on a phone.
    const sizes = await brief.locator(".brief-chip").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    for (const h of sizes) expect(h, "a chip is too small to tap").toBeGreaterThanOrEqual(44);
  });

  test("proof: the x-ray takes the hero apart under the reader's hand", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("#testimonials h2")).toContainText("word for it");
    const frame = page.locator('[data-od-id="xray-frame"]');
    const x = () => frame.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--x")));
    /* Through the wheel, not `scrollIntoView`: Lenis owns the scroll position
       and puts a native jump straight back. */
    const centre = async () =>
      frame.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY - (window.innerHeight - r.height) / 2;
      });
    await wheelToYExact(page, await centre());
    await wheelToYExact(page, await centre());

    // It arrives finished and takes itself apart once, to show what the handle does.
    await expect(frame).toHaveAttribute("data-swept", "", { timeout: 12_000 });
    expect(await x()).toBeCloseTo(54, 0);

    /* The wipe is the handle: the wireframe layer is clipped from the left by
       exactly `--x`, and the handle sits on that edge. */
    const read = () =>
      frame.evaluate((el) => {
        const f = el.getBoundingClientRect();
        const h = el.querySelector(".xray-handle")!.getBoundingClientRect();
        return {
          clip: getComputedStyle(el.querySelector(".xray-b")!).clipPath,
          handle: ((h.left + h.width / 2 - f.left) / f.width) * 100,
        };
      });
    let s = await read();
    expect(s.clip).toMatch(/inset\(0(px)? 0(px)? 0(px)? 54%\)/);
    expect(s.handle).toBeCloseTo(54, 0);

    // The keyboard reaches it: the range input is the same control.
    const range = frame.locator(".xray-range");
    await range.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowLeft");
    await expect.poll(x).toBe(48);
    s = await read();
    expect(s.handle).toBeCloseTo(48, 0);

    if (!isMobile) {
      // …and so does a drag.
      const box = (await frame.boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.48, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 6 });
      await page.mouse.up();
      expect(await x()).toBeCloseTo(20, 0);
      // Letting go leaves it where it was put.
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
      expect(await x()).toBeCloseTo(20, 0);
    }

    /* The two layers are the same scene: the wordmark and the headline land in
       the same place on both, or the wipe would tear. */
    const register = await frame.evaluate((el) => {
      const pair = (sel: string) =>
        [...el.querySelectorAll(sel)].map((n) => {
          const r = n.getBoundingClientRect();
          return [Math.round(r.left), Math.round(r.top), Math.round(r.width)];
        });
      return { mark: pair(".xray-mark"), copy: pair(".xray-copy span:first-child") };
    });
    expect(register.mark[0], "the wordmark is in register").toEqual(register.mark[1]);
    expect(Math.abs(register.copy[0][1] - register.copy[1][1]), "the headline is in register").toBeLessThanOrEqual(2);

    // The timeline drawn in the x-ray names the real one.
    await expect(frame.locator(".xray-tracks")).toContainText("__timelines.hero");
    await expect(frame.locator(".xray-track")).toHaveCount(4);
    await expect(page.locator(".xray-fact h3")).toHaveText([
      "Hand-coded",
      "Five scroll sequences",
      "Works with motion off",
      "Tested like software",
    ]);
  });

  test("proof: quote slots are labelled placeholders and the agreement is signed", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    // No invented people: every quote card says what it is.
    const quotes = page.locator(".proof-quote");
    await expect(quotes).toHaveCount(3);
    await expect(page.locator(".proof-quote .proof-quote-flag")).toHaveCount(3);
    await expect(page.locator("#testimonials")).not.toContainText(/Nenad|Danette|Chrissy|Petar|Klemen|Johana|Bart|Marko/);

    await expect(page.locator(".pact-title")).toHaveText([
      "You own everything.",
      "No lock-in.",
      "A reply within a working day.",
      "Scope in writing first.",
    ]);

    // The ink is drawn when each promise arrives, and the signature after.
    const sign = page.locator(".pact-sign");
    /* Through the wheel, not `scrollIntoView`: Lenis owns the scroll position
       and puts a native jump straight back. Measured twice, because the
       sections above settle their heights after load. */
    const centre = () =>
      sign.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2);
    await wheelToYExact(page, await centre());
    await wheelToYExact(page, await centre());
    const drawn = (sel: string) =>
      page.evaluate(
        (s) => [...document.querySelectorAll(s)].map((el) => parseFloat(getComputedStyle(el).strokeDashoffset)),
        sel,
      );
    await expect.poll(async () => Math.max(...(await drawn(".pact-sign path"))), { timeout: 10_000 }).toBeLessThan(0.02);
    await expect.poll(async () => Math.max(...(await drawn(".pact-ink path"))), { timeout: 10_000 }).toBeLessThan(0.02);
    await expect(sign).toHaveAttribute("aria-label", "Kim");
    expect((await drawn(".pact-sign path")).length).toBe(6);
  });

});

test.describe("scroll-driven motion", () => {
  test.skip(({ isMobile }) => isMobile, "desktop-only choreography");

  test("the dial turns one notch at a time and keeps its icons upright", async ({ page }, testInfo) => {
    testInfo.setTimeout(300_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2000);

    const range = () =>
      page.evaluate(() => {
        const j = document.querySelector(".dial") as HTMLElement;
        const r = j.getBoundingClientRect();
        return { top: r.top + window.scrollY, hold: r.height - window.innerHeight, vh: window.innerHeight };
      });
    const deg = (el: string) =>
      `(() => { const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector("${el}")).transform); return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI); })()`;
    const read = () =>
      page.evaluate(() => {
        const vis = (el: Element) =>
          getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.9;
        const wheel = (document.querySelector(".dial-wheel") as HTMLElement).getBoundingClientRect();
        const nodes = [...document.querySelectorAll(".dial-node-in")] as HTMLElement[];
        // which node sits at nine o'clock, under the pointer
        const atPointer = nodes
          .map((el, i) => {
            const r = el.getBoundingClientRect();
            return { i, x: r.left + r.width / 2, y: Math.abs(r.top + r.height / 2 - (wheel.top + wheel.height / 2)) };
          })
          .sort((a, b) => a.x - b.x)[0];
        const window_ = (document.querySelector(".dial-titles") as HTMLElement).getBoundingClientRect();
        const titles = ([...document.querySelectorAll(".dial-title")] as HTMLElement[]).filter((el) => {
          const r = el.getBoundingClientRect();
          return Math.abs(r.top - window_.top) < 3;
        });
        return {
          stageTop: Math.round((document.querySelector(".dial-stage") as HTMLElement).getBoundingClientRect().top),
          pointer: atPointer.i,
          level: atPointer.y,
          lit: nodes.map((el) => getComputedStyle(el).backgroundColor === "rgb(250, 93, 25)"),
          upright: nodes.map((el) => {
            const svg = el.querySelector("svg")!.getBoundingClientRect();
            return Math.abs(svg.width - svg.height) < 1.5;
          }),
          title: titles.map((el) => el.textContent).join("|"),
          bodies: [...document.querySelectorAll(".dial-body")].map(vis),
          hub: (() => {
            const mask = (document.querySelector(".dial-hub-mask") as HTMLElement).getBoundingClientRect();
            return ([...document.querySelectorAll(".dial-hub-strip span")] as HTMLElement[])
              .filter((el) => Math.abs(el.getBoundingClientRect().top - mask.top) < 3)
              .map((el) => el.textContent)
              .join("|");
          })(),
        };
      });
    void deg;

    const first = await range();
    expect(first.hold / first.vh).toBeGreaterThan(1.05);
    expect(first.hold / first.vh).toBeLessThan(1.25);

    /* Notch k is set from k * 1.6s of a 9.4s take, and the turn to the next
       starts 0.75s before it, so these land in the holds. */
    const stops = [
      { at: 0.04, i: 0, title: "Hand-coded Websites", hub: "01" },
      { at: 0.22, i: 1, title: "AI Agents", hub: "02" },
      { at: 0.56, i: 3, title: "Integrations & APIs", hub: "04" },
      { at: 0.97, i: 5, title: "Handover & Support", hub: "06" },
    ];
    for (const stop of stops) {
      const g = await range();
      await wheelToYExact(page, g.top + g.hold * stop.at);
      await page.waitForTimeout(1500);
      const s = await read();
      expect(s.stageTop, `pinned at ${stop.at}`).toBe(0);
      expect(s.pointer, `node ${stop.i} is under the pointer at ${stop.at}`).toBe(stop.i);
      expect(s.level, "…and level with it").toBeLessThan(4);
      expect(s.lit, "only the node under the pointer is lit").toEqual([0, 1, 2, 3, 4, 5].map((k) => k === stop.i));
      expect(s.title, "the title in the window agrees").toBe(stop.title);
      expect(s.hub, "the hub numeral agrees").toBe(stop.hub);
      expect(s.bodies, "exactly one body is up").toEqual([0, 1, 2, 3, 4, 5].map((k) => k === stop.i));
    }

    // Seek-safe, and the rim and its nodes always cancel out.
    const at = (t: number) =>
      page.evaluate((time) => {
        const tl = (window as unknown as { __timelines: Record<string, { time(t: number): unknown }> })
          .__timelines.dial;
        tl.time(time);
        const rot = (el: Element) => {
          const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
          return (Math.atan2(m.b, m.a) * 180) / Math.PI;
        };
        const rim = rot(document.querySelector(".dial-rim")!);
        // the node's own transform carries a scale when lit, so compare angles only
        const node = rot(document.querySelector(".dial-node-in:last-child") ?? document.querySelectorAll(".dial-node-in")[5]);
        return { rim: +rim.toFixed(1), sum: +(rim + node).toFixed(1) };
      }, t);
    const mid = await at(2.0); // mid-turn, between notches 1 and 2
    const set = await at(3.3);
    const midAgain = await at(2.0);
    expect(Math.abs(mid.sum), "icons stay upright mid-turn").toBeLessThan(0.2);
    expect(set.rim, "two notches round at 3.3s").toBeCloseTo(-120, 0);
    expect(midAgain, "seeking back gives the identical frame").toEqual(mid);
  });

  test("every section offers a way to get in touch, with the subject written", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2000);

    /* A reader convinced half-way down should not have to reach the bottom to
       act on it. Every section carries at least one link straight to the
       inbox, and the in-section ones say what the reader was looking at. */
    for (const id of ["top", "about", "work", "capabilities", "engagement", "testimonials", "faq"]) {
      const links = page.locator(`#${id} a[href^="mailto:kimjoshuadr@gmail.com"]`);
      expect(await links.count(), `#${id} has no way to get in touch`).toBeGreaterThanOrEqual(1);
    }
    await expect(page.locator(".cta a[href^='mailto:kimjoshuadr@gmail.com']")).not.toHaveCount(0);

    const asks = await page.locator("[data-ask]").evaluateAll((els) =>
      els.map((el) => ({ href: decodeURIComponent(el.getAttribute("href") ?? ""), text: (el.textContent ?? "").trim() })),
    );
    // 1 flow + 5 reel + 6 dial + 4 ways to work + 1 proof + 2 FAQ.
    expect(asks.length).toBe(19);
    for (const a of asks) {
      expect(a.href, `"${a.text}" has no subject`).toMatch(/^mailto:kimjoshuadr@gmail\.com\?subject=.{4,}/);
      expect(a.text.length, "an ask has no label").toBeGreaterThan(3);
    }
    // The subject names the thing: a build, a capability, an arrangement, a question.
    const subjects = asks.map((a) => a.href.split("subject=")[1]);
    for (const expected of [
      "I need: Automation pipeline",
      "I need: AI Agents",
      "Brief: Ongoing consultancy",
      "Following up: Do you use Webflow or other page builders?",
    ]) {
      expect(subjects, `no ask with the subject "${expected}"`).toContain(expected);
    }
  });

  test("every held sequence can be skipped, and lands on what comes next", async ({ page }, testInfo) => {
    testInfo.setTimeout(300_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4800);

    /* Five pins, five ways past them. Pressing one carries the page to the end
       of that runway — the pin has let go and the next thing is under the nav. */
    const pins = [
      { runway: ".hero", next: "#about" },
      { runway: ".sys", next: "#work" },
      { runway: ".reel", next: ".work-index" },
      { runway: ".dial", next: "#engagement" },
      { runway: ".shape", next: ".brief" },
    ];
    await expect(page.locator('[data-od-id="pin-skip"]')).toHaveCount(pins.length);

    // The whole page's held scroll: about five and a half screens, down from eight.
    const held = await page.evaluate(
      (sels) =>
        sels.reduce((sum, s) => {
          const el = document.querySelector(s) as HTMLElement;
          return sum + (el.getBoundingClientRect().height - window.innerHeight) / window.innerHeight;
        }, 0),
      pins.map((p) => p.runway),
    );
    expect(held, "total pinned scroll, in screens").toBeLessThan(6);

    for (const pin of pins) {
      const top = await page.evaluate(
        (s) => (document.querySelector(s) as HTMLElement).getBoundingClientRect().top + window.scrollY,
        pin.runway,
      );
      await wheelToYExact(page, top + 40);
      const skip = page.locator(`${pin.runway} [data-od-id="pin-skip"]`);
      await expect(skip, `${pin.runway} has a visible skip`).toBeVisible();
      await skip.click();
      // Lenis carries the page there; wait for it to arrive and stop.
      await expect
        .poll(
          async () =>
            page.evaluate(
              ([r, n]) => {
                const end = (document.querySelector(r) as HTMLElement).getBoundingClientRect().bottom;
                const next = (document.querySelector(n) as HTMLElement).getBoundingClientRect().top;
                return Math.abs(end - 76) < 6 && next > 0 && next < window.innerHeight * 0.6;
              },
              [pin.runway, pin.next],
            ),
          { timeout: 8000, message: `${pin.runway} skip did not land on ${pin.next}` },
        )
        .toBe(true);
    }
  });

  test("nothing blinks on the way down or back up", async ({ page }, testInfo) => {
    testInfo.setTimeout(300_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4800);

    /* The defect this guards: a scroll-in reveal that leaves its element
       showing, then snaps it to nothing when its trigger fires, then fades it
       in. From the reader's side that is a blink before every animation. So:
       watch every reveal target on every frame, and count any that is on screen
       and opaque, then gone, then back. */
    await page.evaluate(() => {
      const SEL =
        ".sys-head > * > *, .work-head, .cap-head > * > *, .eng-head > * > *, .proof-head > * > *, .faq-head > * > *, " +
        ".xray-fact, .proof-quote, .pact-title, .ask-q, .cta-fade, .footer-fade, .footer-mark, .brief-ask > *, .brief-printer, " +
        ".marquee__group li, .hero-landing-title, .hero-card, .reel-wall-chip, .dial-card, .shape-card, .reel-card, .sys-step > *";
      const seen = new Map<Element, { max: number; dipped: boolean }>();
      const w = window as unknown as { __blinks: Record<string, number> };
      w.__blinks = {};
      const tick = () => {
        document.querySelectorAll(SEL).forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight * 0.98 || r.width === 0) return;
          let o = 1;
          for (let a: Element | null = el; a; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (cs.visibility === "hidden") {
              o = 0;
              break;
            }
            o *= Number(cs.opacity);
          }
          const s = seen.get(el) ?? { max: 0, dipped: false };
          if (o > 0.9 && !s.dipped) s.max = o;
          if (s.max > 0.9 && o < 0.15) s.dipped = true;
          if (s.dipped && o > 0.9) {
            const k = el.className.toString().split(" ")[0] || el.tagName;
            w.__blinks[k] = (w.__blinks[k] ?? 0) + 1;
            s.dipped = false;
            s.max = 0;
          }
          seen.set(el, s);
        });
        requestAnimationFrame(tick);
      };
      tick();
    });

    const vp = page.viewportSize()!;
    await page.mouse.move(vp.width / 2, vp.height / 2);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const blinks = () => page.evaluate(() => (window as unknown as { __blinks: Record<string, number> }).__blinks);

    for (let y = 0; y < max + 400; y += 110) {
      await page.mouse.wheel(0, 110);
      await page.waitForTimeout(24);
    }
    await page.waitForTimeout(1500);
    expect(await blinks(), "elements that blinked on the way down").toEqual({});

    for (let y = 0; y < max + 400; y += 110) {
      await page.mouse.wheel(0, -110);
      await page.waitForTimeout(24);
    }
    await page.waitForTimeout(1500);
    expect(await blinks(), "elements that blinked on the way back up").toEqual({});
    // …and the page is back where it began, with the hero at rest.
    expect(await page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(2);
  });

  test("the reel pulls one plate into focus at a time and holds the last", async ({ page }, testInfo) => {
    testInfo.setTimeout(300_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2000);

    /* The pin start moves when the webfonts land and the sections above settle,
       so the range is re-measured before every jump. */
    const range = () =>
      page.evaluate(() => {
        const j = document.querySelector(".reel") as HTMLElement;
        const r = j.getBoundingClientRect();
        return { top: r.top + window.scrollY, hold: r.height - window.innerHeight, vh: window.innerHeight };
      });
    const read = () =>
      page.evaluate(() => {
        const vis = (el: Element) =>
          getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.9;
        const plates = [...document.querySelectorAll(".reel-track .reel-plate")] as HTMLElement[];
        return {
          stageTop: Math.round((document.querySelector(".reel-stage") as HTMLElement).getBoundingClientRect().top),
          plates: plates.map(vis),
          sharp: plates.map((el) => /blur\(0px\)|none/.test(getComputedStyle(el).filter)),
          captions: [...document.querySelectorAll(".reel-captions .reel-caption")].map(vis),
          name: ([...document.querySelectorAll(".reel-captions .reel-caption")] as HTMLElement[])
            .filter(vis)
            .map((el) => el.querySelector("h3")?.textContent ?? "")
            .join("|"),
        };
      });

    const first = await range();
    // Five beats on one pin: a screen and a half.
    expect(first.hold / first.vh).toBeGreaterThan(1.4);
    expect(first.hold / first.vh).toBeLessThan(1.6);

    /* Mid-hold of each plate. A plate is in focus from k * 2.4s of an 11.8s
       take and the cut to the next starts 0.8s before it, so these land in the
       holds. */
    const stops = [
      { at: 0.07, i: 0, name: "Marketing site" },
      { at: 0.27, i: 1, name: "Automation pipeline" },
      { at: 0.47, i: 2, name: "Voice and chat agent" },
      { at: 0.68, i: 3, name: "Ops dashboard" },
    ];
    for (const stop of stops) {
      const g = await range();
      await wheelToYExact(page, g.top + g.hold * stop.at);
      await page.waitForTimeout(1500);
      const s = await read();
      expect(s.stageTop, `pinned at ${stop.at}`).toBe(0);
      expect(s.plates, `exactly plate ${stop.i} is up at ${stop.at}`).toEqual(
        [0, 1, 2, 3].map((k) => k === stop.i),
      );
      expect(s.sharp[stop.i], "the plate in focus is sharp").toBe(true);
      expect(s.name, "the caption agrees with the plate").toBe(stop.name);
    }

    // The last beat: every plate is gone and the whole stack is on the wall.
    {
      const g = await range();
      await wheelToYExact(page, g.top + g.hold * 0.97);
      await page.waitForTimeout(1500);
      const s = await read();
      expect(s.plates, "no plate is left at the end").toEqual([false, false, false, false]);
      expect(s.name).toBe("The whole stack.");
      const wall = await page.evaluate(() => {
        const stage = (document.querySelector(".reel-stage") as HTMLElement).getBoundingClientRect();
        return [...document.querySelectorAll(".reel-track .reel-wall-chip")].map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return (
            cs.visibility === "visible" &&
            Number(cs.opacity) > 0.95 &&
            r.left >= stage.left &&
            r.right <= stage.right &&
            r.top >= stage.top &&
            r.bottom <= stage.bottom
          );
        });
      });
      expect(wall.length).toBe(21);
      expect(wall.every(Boolean), "every tool is on screen, landed, at the end").toBe(true);
    }

    // Seek-safe: any frame, in any order, and back again.
    const at = (t: number) =>
      page.evaluate((time) => {
        const tl = (window as unknown as { __timelines: Record<string, { time(t: number): unknown }> })
          .__timelines.reel;
        tl.time(time);
        const sc = (el: Element) => +new DOMMatrixReadOnly(getComputedStyle(el).transform).a.toFixed(3);
        return {
          plates: [...document.querySelectorAll(".reel-track .reel-plate")].map(sc),
          wires: [...document.querySelectorAll(".reel-wire")].map(
            (el) => +parseFloat(getComputedStyle(el).strokeDashoffset).toFixed(2),
          ),
        };
      }, t);
    const late = await at(3.8);
    const early = await at(0.2);
    const lateAgain = await at(3.8);
    expect(early.wires, "no wire drawn before its plate").toEqual([1, 1, 1, 1]);
    expect(late.wires, "every wire drawn once the pipeline is up").toEqual([0, 0, 0, 0]);
    expect(late.plates[1], "the pipeline is in focus at 3.8s").toBeCloseTo(1, 2);
    expect(lateAgain, "seeking back gives the identical frame").toEqual(late);
  });

  test("nav docks and the flow plays through its four stations on one pin", async ({ page }, testInfo) => {
    testInfo.setTimeout(300_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    const navBefore = await page.locator("header").first().getAttribute("class");
    expect(navBefore).toContain("border-transparent");

    await scrollToId(page, "about");
    await expect
      .poll(async () => page.locator("header").first().getAttribute("class"))
      .toContain("border-hairline");

    /* The pin start moves when the webfonts land and everything above it
       settles, so the range is re-measured until two reads agree. */
    const range = async () => {
      let last = { top: -1, hold: -1 };
      for (let i = 0; i < 8; i++) {
        const now = await page.evaluate(() => {
          const j = document.querySelector(".sys") as HTMLElement;
          const r = j.getBoundingClientRect();
          return { top: Math.round(r.top + window.scrollY), hold: Math.round(r.height - window.innerHeight) };
        });
        if (now.top === last.top && now.hold === last.hold) return now;
        last = now;
        await page.waitForTimeout(250);
      }
      return last;
    };
    const geo = await range();
    // One pinned beat: the frame holds for a little over one screen.
    const vh = await page.evaluate(() => window.innerHeight);
    expect(geo.hold / vh).toBeGreaterThan(0.8);
    expect(geo.hold / vh).toBeLessThan(1.0);

    const read = () =>
      page.evaluate(() => {
        const g = (sel: string) => document.querySelector(sel) as HTMLElement;
        const frame = g(".sys-frame").getBoundingClientRect();
        const mid = frame.left + frame.width / 2;
        const stations = [...document.querySelectorAll(".sys-station")].map((el) => {
          const r = el.getBoundingClientRect();
          return Math.round(r.left + r.width / 2 - mid);
        });
        const captions = [...document.querySelectorAll(".sys-captions .sys-caption")].map(
          (el) => getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.9,
        );
        return {
          stageTop: Math.round(g(".sys-stage").getBoundingClientRect().top),
          stations,
          captions,
          finale: getComputedStyle(g(".sys-finale")).visibility,
          scale: +new DOMMatrixReadOnly(getComputedStyle(g(".sys-world")).transform).a.toFixed(3),
        };
      });

    // Top of the pin: the site is centred under its own caption.
    await wheelToYExact(page, geo.top + geo.hold * 0.04);
    await page.waitForTimeout(1200);
    let s = await read();
    expect(s.stageTop, "the frame is pinned").toBe(0);
    expect(Math.abs(s.stations[0]), "the site is centred first").toBeLessThan(12);
    expect(s.captions).toEqual([true, false, false, false]);
    expect(s.finale).toBe("hidden");

    // Mid-way through the third station's window.
    await wheelToYExact(page, geo.top + geo.hold * 0.58);
    await page.waitForTimeout(1200);
    s = await read();
    expect(s.stageTop, "still pinned").toBe(0);
    expect(Math.abs(s.stations[2]), "the systems are centred at 58%").toBeLessThan(12);
    expect(s.captions).toEqual([false, false, true, false]);

    // The end: pulled back, all four on screen, captions gone, finale up.
    await wheelToYExact(page, geo.top + geo.hold * 0.99);
    await page.waitForTimeout(1400);
    s = await read();
    expect(s.scale, "the camera pulls back").toBeLessThan(0.9);
    expect(s.captions).toEqual([false, false, false, false]);
    expect(s.finale).toBe("visible");
    const half = await page.evaluate(() => (document.querySelector(".sys-frame") as HTMLElement).clientWidth / 2);
    for (const c of s.stations) expect(Math.abs(c), "every station is in frame at the end").toBeLessThan(half);
    await expect(page.locator('[data-od-id="flow-cta"]')).toBeVisible();

    // Seek-safe: any frame can be asked for directly, in any order.
    const at = (t: number) =>
      page.evaluate((time) => {
        const tl = (window as unknown as { __timelines: Record<string, { time(t: number): unknown }> })
          .__timelines.flow;
        tl.time(time);
        const g = (sel: string) => document.querySelector(sel) as HTMLElement;
        return {
          x: Math.round(new DOMMatrixReadOnly(getComputedStyle(g(".sys-world")).transform).e),
          line: +new DOMMatrixReadOnly(getComputedStyle(g(".sys-line")).transform).a.toFixed(3),
          checks: [...document.querySelectorAll(".sys-check")].map(
            (el) => +new DOMMatrixReadOnly(getComputedStyle(el).transform).a.toFixed(2),
          ),
        };
      }, t);
    const late = await at(6.5);
    const early = await at(0.5);
    const lateAgain = await at(6.5);
    expect(early.line, "no line drawn at the start").toBe(0);
    expect(early.checks, "nothing ticked at the start").toEqual([0, 0, 0]);
    expect(late.checks, "all three records ticked by 6.5s").toEqual([1, 1, 1]);
    expect(late.line).toBeCloseTo(2 / 3, 2);
    expect(lateAgain, "seeking back gives the identical frame").toEqual(late);
  });

  test("the hero sequence plays as designed across its runway", async ({ page }) => {
    // The describe block above already skips this whole suite on mobile.
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    // Let the intro run out: the scroll only owns the timeline past its rest.
    await page.waitForTimeout(4500);

    const { heroH, vh } = await page.evaluate(() => ({
      heroH: (document.querySelector("#top") as HTMLElement).getBoundingClientRect().height,
      vh: window.innerHeight,
    }));

    // 205svh runway with a 100svh sticky panel: the stage holds for 105svh.
    expect(heroH / vh).toBeGreaterThanOrEqual(2.0);
    expect(heroH / vh).toBeLessThanOrEqual(2.1);

    const read = () =>
      page.evaluate(() => {
        const sticky = document.querySelector("#top > div") as HTMLElement;
        const port = document.querySelector(".hero-portrait") as HTMLElement;
        const media = document.querySelector(".hero-media") as HTMLElement;
        const world = document.querySelector(".hero-world") as HTMLElement;
        const plate = document.querySelector(".hero-plate") as HTMLElement;
        const blur = /blur\(([\d.]+)px\)/.exec(getComputedStyle(port).filter);
        const scale = (el: HTMLElement) => +new DOMMatrixReadOnly(getComputedStyle(el).transform).a.toFixed(3);
        return {
          stickyTop: Math.round(sticky.getBoundingClientRect().top),
          blur: blur ? Number(blur[1]) : 0,
          figure: getComputedStyle(media).visibility,
          plate: getComputedStyle(plate).visibility,
          dive: scale(world),
          copy: Number(getComputedStyle(document.querySelector(".hero-lede") as HTMLElement).opacity),
        };
      });

    let s = await read();
    expect(s.stickyTop, "the stage starts pinned").toBe(0);
    expect(s.plate, "the intro plate is gone at rest").toBe("hidden");
    expect(s.blur, "the figure rests crisp").toBeLessThan(1);
    expect(s.dive, "the camera rests at 1").toBeCloseTo(1, 2);
    expect(s.copy, "the copy rests fully in").toBeGreaterThan(0.99);

    // A fifth of the way down the pin: the copy has left, the dive has begun,
    // and the figure is still in the frame.
    await wheelToY(page, vh * 1.05 * 0.2);
    s = await read();
    expect(s.stickyTop, "still pinned at 20%").toBe(0);
    expect(s.copy, "the copy should have left by 20%").toBeLessThan(0.05);
    expect(s.dive, "the dive should be under way by 20%").toBeGreaterThan(1.5);
    expect(s.figure, "the figure should still be in frame at 20%").toBe("visible");

    // Four fifths: the camera is through the notch and the figure is gone.
    await wheelToY(page, vh * 1.05 * 0.8);
    s = await read();
    expect(s.stickyTop, "still pinned at 80%").toBe(0);
    expect(s.figure, "the figure should have sunk away by 80%").toBe("hidden");
    expect(s.dive, "the camera should be through the notch by 80%").toBeGreaterThan(10);

    // ...and all of it reverses: back at the top the hero is at rest again.
    await wheelToYExact(page, 0);
    await page.waitForTimeout(600);
    s = await read();
    expect(s.dive, "the camera should return to 1").toBeCloseTo(1, 2);
    expect(s.figure).toBe("visible");
    expect(s.copy).toBeGreaterThan(0.99);
  });

  test("every frame of the hero timeline stands on its own when seeked", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4500);

    /* The timeline is authored to be a pure function of its time, so any frame
       can be asked for directly, in any order — which is the whole contract. */
    const at = (t: number) =>
      page.evaluate((time) => {
        const tl = (window as unknown as { __timelines: Record<string, { time(t: number): unknown }> })
          .__timelines.hero;
        tl.time(time);
        const g = (sel: string) => document.querySelector(sel) as HTMLElement;
        const scale = (el: HTMLElement) => +new DOMMatrixReadOnly(getComputedStyle(el).transform).a.toFixed(3);
        const line = g(".hero-title .split-line");
        return {
          plate: getComputedStyle(g(".hero-plate")).visibility,
          plateScale: scale(g(".hero-plate")),
          push: scale(g(".hero-portrait")),
          dive: scale(g(".hero-world")),
          // how far the first headline line sits out of its mask, in line heights
          line: new DOMMatrixReadOnly(getComputedStyle(line).transform).f / line.offsetHeight,
          lede: Number(getComputedStyle(g(".hero-lede")).opacity),
          figure: getComputedStyle(g(".hero-media")).visibility,
        };
      }, t);

    const rest = 3.1;
    // Out of order on purpose.
    const end = await at(rest + 2);
    const open = await at(0);
    const mid = await at(1.75);
    const settled = await at(rest);
    const again = await at(0);

    expect(open.plate, "frame 0 is the closed plate").toBe("visible");
    expect(open.plateScale).toBeCloseTo(1, 2);
    expect(open.push, "the portrait opens pushed in").toBeGreaterThan(1.5);
    expect(open.line, "the headline opens below its mask").toBeGreaterThan(1);
    expect(open.lede).toBeLessThan(0.01);
    expect(again, "seeking back gives the identical frame").toEqual(open);

    expect(mid.plateScale, "the plate is opening at 1.75s").toBeGreaterThan(1.5);
    expect(mid.push, "the portrait is pulling back at 1.75s").toBeLessThan(open.push);

    expect(settled.plate, "the plate is gone at rest").toBe("hidden");
    expect(settled.push).toBeCloseTo(1, 2);
    expect(settled.dive).toBeCloseTo(1, 2);
    expect(Math.abs(settled.line)).toBeLessThan(0.01);
    expect(settled.lede).toBeGreaterThan(0.99);
    expect(settled.figure).toBe("visible");

    expect(end.dive, "the exit ends through the notch").toBeGreaterThan(10);
    expect(end.figure).toBe("hidden");
    expect(end.lede).toBeLessThan(0.01);
    expect(end.line, "the headline ends above its mask").toBeLessThan(-1);
  });

  test("the dive arrives in the landing, which scrolls away with no seam", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4500);

    const vh = await page.evaluate(() => window.innerHeight);

    const read = () =>
      page.evaluate(() => {
        const g = (sel: string) => document.querySelector(sel) as HTMLElement;
        const box = (sel: string) => {
          const r = g(sel).getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
        };
        const line = g(".hero-landing-title .split-line");
        return {
          landing: getComputedStyle(g(".hero-landing")).visibility,
          stage: box(".hero-stage"),
          land: box(".hero-landing"),
          next: box("#about"),
          cards: [...document.querySelectorAll(".hero-card")].map((el) => {
            const r = el.getBoundingClientRect();
            return {
              opacity: Number(getComputedStyle(el).opacity),
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
            };
          }),
          line: line ? new DOMMatrixReadOnly(getComputedStyle(line).transform).f / line.offsetHeight : 9,
          title: (() => {
            const r = g(".hero-landing-title").getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          })(),
          vw: window.innerWidth,
        };
      });

    // At rest the landing is pinned directly behind the stage, and hidden.
    let s = await read();
    expect(s.landing, "the landing waits hidden behind the stage").toBe("hidden");
    expect(s.land, "the landing is pinned under the stage").toEqual(s.stage);

    // Late in the pin the camera is through and the landing has resolved.
    await wheelToYExact(page, vh * 1.05 * 0.93);
    s = await read();
    expect(s.stage.top, "still pinned at 93%").toBe(0);
    expect(s.landing, "the landing should be up by 93%").toBe("visible");
    expect(Math.abs(s.line), "the statement should have risen into place").toBeLessThan(0.05);
    expect(s.cards.length, "four floating cards").toBe(4);
    for (const c of s.cards) {
      expect(c.opacity, "every card should have landed").toBeGreaterThan(0.99);
      expect(c.left, "a card is off the stage").toBeGreaterThanOrEqual(0);
      expect(c.right, "a card is off the stage").toBeLessThanOrEqual(s.vw);
      const overTitle =
        c.left < s.title.right - 1 && s.title.left < c.right - 1 && c.top < s.title.bottom - 1 && s.title.top < c.bottom - 1;
      expect(overTitle, "a card sits on the statement").toBe(false);
    }

    // Past the release the landing leaves as ordinary page, with the next
    // section butted against it — nothing rises over anything.
    await wheelToY(page, vh * 1.05 + vh * 0.35);
    s = await read();
    expect(s.land.top, "the landing should be scrolling away").toBeLessThan(0);
    expect(s.land, "the stage leaves with it").toEqual(s.stage);
    expect(Math.abs(s.next.top - s.land.bottom), "the next section must follow with no gap").toBeLessThanOrEqual(1);
  });

  test("captures section screenshots", async ({ page }, testInfo) => {
    testInfo.setTimeout(180_000);
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2500);

    const shots: Array<[string, () => Promise<string | void>]> = [
      ["01-hero", async () => {}],
      [
        "01b-hero-scatter",
        async () => {
          // ~16%: the three cards are tilting outward and clearing.
          await wheelHeroProgress(page, 0.16);
          await page.waitForTimeout(700);
        },
      ],
      [
        "01c-hero-dolly",
        async () => {
          // ~42%: the figure has dollied in and the dissolve is starting.
          await wheelHeroProgress(page, 0.42);
          await page.waitForTimeout(700);
        },
      ],
      [
        "01e-hero-curtain",
        async () => {
          // ~62%: the curtain's edge is crossing the pinned stage while the
          // hero's ghost is still behind it.
          await wheelHeroProgress(page, 0.62);
          await page.waitForTimeout(700);
        },
      ],
      [
        "01d-hero-headline",
        async () => {
          // ~64%: the headline is leaving line by line, the figure is deep in
          // its dissolve, the wordmark has pushed off.
          await wheelHeroProgress(page, 0.64);
          await page.waitForTimeout(700);
        },
      ],
      [
        "02-flow",
        async () => {
          // Mid-hold, so the frame catches a station rather than the intro.
          const geo = await page.evaluate(() => {
            const j = document.querySelector(".sys") as HTMLElement;
            const r = j.getBoundingClientRect();
            return { top: r.top + window.scrollY, hold: r.height - window.innerHeight };
          });
          await wheelToYExact(page, geo.top + geo.hold * 0.5);
          await page.waitForTimeout(1800);
          await page.screenshot({ path: "test-results/shots/02-flow.png" });
          return "captured";
        },
      ],
      ["03-work", async () => scrollToId(page, "work")],
      ["04-capabilities", async () => scrollToId(page, "capabilities")],
      ["05-engagement", async () => scrollToId(page, "engagement")],
      ["06-testimonials", async () => scrollToId(page, "testimonials")],
      ["07-faq", async () => scrollToId(page, "faq")],
      ["08-footer", async () => scrollToBottom(page)],
    ];

    for (const [name, action] of shots) {
      const took = await action();
      if (took === "captured") continue;
      // Lenis glides on well after the last wheel event. Without settling here
      // the screenshot lands wherever the glide happened to be.
      await waitForScrollSettled(page);
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `test-results/shots/${name}.png` });
    }
  });
});

test.describe("interaction", () => {
  test("FAQ: picking a question types its answer back", async ({ page, isMobile }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("#faq h2")).toContainText("obvious ones");
    await expect(page.locator(".ask-q")).toHaveCount(8);
    // No page builder is offered, and the first question says so.
    await expect(page.locator(".ask-q").first()).toContainText("Webflow");

    const ask = page.locator('[data-od-id="ask"]');
    const centre = () => ask.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 140);
    await wheelToYExact(page, await centre());
    await wheelToYExact(page, await centre());

    // One conversation, wherever it sits.
    const thread = page.locator('[data-od-id="ask-thread"]');
    await expect(thread).toHaveCount(1);
    const typed = thread.locator(".ask-typed");
    const full = thread.locator('[data-od-id="ask-answer"]');

    // The first answer types itself on arrival and finishes whole.
    await expect(typed).toHaveText(/^No\. Everything is hand-coded.*calling me\.$/, { timeout: 10_000 });

    // Pick another: it is sent as the reader's message…
    const fifth = page.locator('[data-od-id="ask-q-5"]');
    await fifth.click();
    await expect(fifth).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-od-id="ask-q-1"]')).toHaveAttribute("aria-pressed", "false");
    await expect(thread.locator(".ask-you")).toContainText("What do you charge?");
    // …the whole answer is announced at once, for anyone not watching…
    await expect(full).toHaveText(/^There is no price list\..*before anything starts\.$/);
    await expect(full).toHaveAttribute("aria-live", "polite");
    // …and the visible one is typed: partial first, then complete.
    const lengths: number[] = [];
    for (let i = 0; i < 12; i++) {
      lengths.push(((await typed.textContent()) ?? "").length);
      await page.waitForTimeout(90);
    }
    const whole = ((await full.textContent()) ?? "").length;
    expect(Math.min(...lengths), "the answer should start short of whole").toBeLessThan(whole);
    expect([...lengths].sort((x, y) => x - y), "it only ever grows").toEqual(lengths);
    await expect(typed).toHaveText(/before anything starts\.$/, { timeout: 6000 });
    // The caret stops when the typing does.
    await expect(thread.locator(".ask-me")).not.toHaveAttribute("data-typing", "");

    if (isMobile) {
      // On a phone the conversation opens under the question that was tapped.
      const under = await page.evaluate(() => {
        const q = document.querySelector('[data-od-id="ask-q-5"]')!.getBoundingClientRect();
        const t = document.querySelector('[data-od-id="ask-thread"]')!.getBoundingClientRect();
        return { gap: t.top - q.bottom, sameItem: !!document.querySelector('[data-od-id="ask-q-5"]')!.parentElement!.querySelector(".ask-thread") };
      });
      expect(under.sameItem).toBe(true);
      expect(under.gap).toBeGreaterThanOrEqual(0);
      expect(under.gap).toBeLessThan(24);
    }
  });

  test("FAQ: every question is reachable and operable from the keyboard", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    const third = page.locator('[data-od-id="ask-q-3"]');
    await third.focus();
    await page.keyboard.press("Enter");
    await expect(third).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-od-id="ask-answer"]')).toContainText("OpenAI, Claude, Gemini");
    /* The next question is the next stop, except on a phone, where the
       conversation opens under the question just picked and its own
       "ask me this for real" link comes first. */
    await page.keyboard.press("Tab");
    if (await page.locator('[data-od-id="ask-thread"] [data-ask]').evaluate((el) => el === document.activeElement)) {
      await page.keyboard.press("Tab");
    }
    await expect(page.locator('[data-od-id="ask-q-4"]')).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator('[data-od-id="ask-answer"]')).toContainText("open to a full-time role");

    // Every row is a real target.
    const heights = await page.locator(".ask-q").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    for (const h of heights) expect(h, "a question row is too small to tap").toBeGreaterThanOrEqual(44);
  });

  test("the close copies the address and stamps it, with nothing that glows", async ({ browser, isMobile }) => {
    test.skip(isMobile, "makes its own context for clipboard access; runs once");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1500);

    // The lit ground, the magnet and the sheen are gone.
    await expect(page.locator(".cta__light, .cta-sheen, .cta-magnet")).toHaveCount(0);
    // No booking link anywhere: the template's calendar is not this person's.
    await expect(page.locator('a[href*="cal.com"]')).toHaveCount(0);
    await expect(page.locator('[data-od-id="cta-button"]')).toHaveAttribute("href", "mailto:kimjoshuadr@gmail.com");
    await expect(page.locator('[data-od-id="nav-cta"]')).toHaveAttribute("href", "mailto:kimjoshuadr@gmail.com");

    const mail = page.locator('[data-od-id="cta-mail"]');
    const y = () => mail.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2);
    await wheelToYExact(page, await y());
    await wheelToYExact(page, await y());

    const stamp = page.locator(".cta-stamp");
    await expect(stamp).toBeHidden();
    await mail.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("kimjoshuadr@gmail.com");
    // The stamp lands square: full size, tilted, and visible.
    await expect
      .poll(async () =>
        stamp.evaluate((el) => {
          const cs = getComputedStyle(el);
          const m = new DOMMatrixReadOnly(cs.transform);
          return cs.visibility === "visible" && Number(cs.opacity) > 0.95 && Math.abs(Math.hypot(m.a, m.b) - 1) < 0.02;
        }),
      )
      .toBe(true);
    await expect(page.locator(".cta [aria-live]")).toHaveText("Email address copied.");
    // …and lifts off again by itself.
    await expect(stamp).toBeHidden({ timeout: 6000 });
    await context.close();
  });

  test("mobile menu opens the panel", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only");
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });

    const burger = page.getByRole("button", { name: "Menu" });
    await expect(burger).toBeVisible();
    await expect(burger).toHaveAttribute("aria-expanded", "false");

    await burger.click();
    await expect(burger).toHaveAttribute("aria-expanded", "true");

    const panel = page.getByTestId("mobile-menu");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "Services", exact: true })).toBeVisible();

    await page.screenshot({ path: "test-results/shots/09-mobile-menu.png" });
  });
});

test.describe("reduced motion", () => {
  test("content stays visible and no scrubs are armed", async ({ page }) => {
    const errors = watchForErrors(page);
    // Emulate before the first paint so the effects read it on mount.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1200);

    const emulated = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(emulated, "Playwright must be emulating reduced motion").toBe(true);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".hero-lede")).toBeVisible();
    await expect(page.locator(".hero-copy")).toHaveCSS("opacity", "1");

    // Lenis must stand down
    expect(await page.locator("html.lenis").count()).toBe(0);
    // SplitText must not have run
    expect(await page.locator(".hero-title .split-line").count()).toBe(0);

    expect(errors.pageErrors).toEqual([]);
  });
});

test.describe("case studies", () => {
  const CASES = [
    { id: "1910", name: "1910.ai" },
    { id: "semiconbio", name: "SemiconBio" },
    { id: "happyring", name: "Happy Ring" },
    { id: "omicron", name: "Omicron" },
    { id: "puck", name: "Puck" },
    { id: "alosant", name: "Alosant" },
    { id: "lilipad", name: "Lilipad" },
    { id: "pssltd", name: "PSSLTD" },
    { id: "rayai", name: "RAY AI" },
  ];

  test("every project has a page that shows its screen whole and un-upscaled", async ({ page }) => {
    test.setTimeout(180_000);

    for (const c of CASES) {
      const res = await page.goto(`/work/${c.id}`, { waitUntil: "load", timeout: 60_000 });
      expect(res?.status(), `/work/${c.id} should exist`).toBe(200);
      await expect(page.locator("h1"), `/work/${c.id} heading`).toHaveText(c.name);

      const plate = await page.locator(".case-plate img").evaluate((el) => {
        const img = el as HTMLImageElement;
        const box = img.getBoundingClientRect();
        return {
          box: +(box.width / box.height).toFixed(3),
          declared: +(
            Number(img.getAttribute("width")) / Number(img.getAttribute("height"))
          ).toFixed(3),
          width: Math.round(box.width),
          natural: img.naturalWidth,
        };
      });

      expect(plate.box, `/work/${c.id} plate ratio`).toBeCloseTo(plate.declared, 2);
      /* Three of the nine sources are small logos. Presenting them at plate size
         would only make them soft, so each is capped at its own width — this is
         the assertion that keeps that honest. */
      expect(plate.width, `/work/${c.id} must not be blown past its own pixels`).toBeLessThanOrEqual(
        plate.natural + 1,
      );
    }
  });

  test("a case study links back into the home page, not to dead hashes", async ({ page }) => {
    await page.goto("/work/alosant", { waitUntil: "load", timeout: 120_000 });

    // Alosant is the one client a testimonial actually names.
    await expect(page.locator(".case-quote blockquote")).toContainText("fantastic partner");

    // Bare `#about` would resolve to /work/alosant#about, which does not exist.
    await expect(page.locator("header nav a").first()).toHaveAttribute("href", "/#about");
    await expect(page.locator('footer a[href="/#work"]')).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Start a project" }).first()).toBeVisible();
  });
});

/* ------------------------------------------------------------------ *
 * Responsive
 * The brief's floor is 360px; the sweep also covers 280/320 because they pass
 * and a stronger guarantee costs nothing. Ultrawide is capped at 1680 by the
 * shell, which is the agreed behaviour, so 2560 and 3440 only have to not
 * scroll. Each viewport gets its own context, so this runs once rather than
 * once per project.
 * ------------------------------------------------------------------ */
test.describe("responsive", () => {
  /* Breakpoint boundaries (640, 1023/1024) and the awkward ones (280, 900x700,
     1440x620, 2560, 3440) are in here deliberately: those are where layouts
     break, and a sweep that only tests comfortable sizes finds nothing. */
  const SIZES: [number, number][] = [
      [280, 653],
      [320, 568],
      [360, 740],
      [390, 844],
      [430, 932],
      [540, 960],
      [600, 960],
      [640, 900],
      [768, 1024],
      [820, 1180],
      [900, 700],
      [1023, 800],
      [1024, 800],
      [1280, 800],
      [1366, 768],
      [1440, 900],
      [1440, 620],
      [1920, 1080],
      [2560, 1440],
      [3440, 1200],
  ];

  test("no viewport scrolls sideways, from 280 up to 3440", async ({ browser, isMobile }) => {
    test.skip(isMobile, "makes its own viewports; runs once");
    /* A fresh context per size across twenty widths, each with a load, a settle
       and a full-document walk. The page now carries a scroll reveal on every
       compact section, so the sweep needs more than the default budget — the
       same reason the case-study sweep below sets its own. */
    test.setTimeout(300_000);

    for (const [w, h] of SIZES) {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await context.newPage();
      const thrown: string[] = [];
      page.on("pageerror", (e) => thrown.push(e.message.slice(0, 120)));
      await page.goto("/", { waitUntil: "load", timeout: 120_000 });
      await page.waitForTimeout(2200);
      /* Walk the whole document before measuring: four sections change height on
         mount and the pinned runways only exist once they have. */
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
      await page.waitForTimeout(1500);
      const r = await page.evaluate(() => {
        const d = document.documentElement;
        return { over: d.scrollWidth - d.clientWidth, vw: d.clientWidth, pageH: d.scrollHeight };
      });
      expect(r.over, `${w}x${h} scrolls sideways by ${r.over}px`).toBeLessThanOrEqual(1);
      expect(r.pageH, `${w}x${h} rendered an implausibly short page`).toBeGreaterThan(3000);
      expect(thrown, `${w}x${h} threw`).toHaveLength(0);
      await context.close();
    }
  });

  test("every case study page holds up, floor to ultrawide", async ({ browser, isMobile }) => {
    test.skip(isMobile, "makes its own viewports; runs once");
    /* Thirty-eight navigations: nine pages at two widths plus the full sweep on
       one of them. The default 120s budget does not fit that, and a timeout here
       reads as a layout failure. */
    test.setTimeout(420_000);

    /* The nine ids come from the home page's own links rather than a typed list,
       so a tenth project is covered the day it ships. */
    const home = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const homePage = await home.newPage();
    await homePage.goto("/", { waitUntil: "load", timeout: 120_000 });
    await homePage.waitForTimeout(2000);
    const paths = [
      ...new Set(
        await homePage.evaluate(() =>
          [...document.querySelectorAll('a[href^="/work/"]')].map((a) => a.getAttribute("href")),
        ),
      ),
    ];
    await home.close();
    expect(paths.length, "the home page should link every case study").toBe(9);

    /* All nine at the floor and at the default width: a project's own image ratio
       is the thing that could push its page sideways. */
    for (const path of paths) {
      for (const [w, h] of [
        [360, 740],
        [1440, 900],
      ]) {
        const context = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await context.newPage();
        const thrown: string[] = [];
        page.on("pageerror", (e) => thrown.push(e.message.slice(0, 120)));
        await page.goto(path!, { waitUntil: "load", timeout: 120_000 });
        await page.waitForTimeout(2400);
        await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
        await page.waitForTimeout(1400);
        const r = await page.evaluate(() => {
          const d = document.documentElement;
          return { over: d.scrollWidth - d.clientWidth, pageH: d.scrollHeight };
        });
        expect(r.over, `${path} at ${w}x${h} scrolls sideways by ${r.over}px`).toBeLessThanOrEqual(1);
        expect(r.pageH, `${path} at ${w}x${h} rendered an implausibly short page`).toBeGreaterThan(800);
        expect(thrown, `${path} at ${w}x${h} threw`).toHaveLength(0);
        await context.close();
      }
    }

    /* And the full sweep on one of them, since all nine share a layout. */
    for (const [w, h] of SIZES) {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await context.newPage();
      await page.goto(paths[0]!, { waitUntil: "load", timeout: 120_000 });
      await page.waitForTimeout(1400);
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
      await page.waitForTimeout(800);
      const over = await page.evaluate(() => {
        const d = document.documentElement;
        return d.scrollWidth - d.clientWidth;
      });
      expect(over, `${paths[0]} at ${w}x${h} scrolls sideways by ${over}px`).toBeLessThanOrEqual(1);
      await context.close();
    }
  });

  test("text re-wraps after a resize instead of freezing", async ({ browser, isMobile }) => {
    test.skip(isMobile, "makes its own viewports; runs once");
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4500);
    const lines = () =>
      page.evaluate(() => ({
        lede: document.querySelectorAll(".hero-lede .split-line").length,
        title: [...document.querySelectorAll(".hero-title .split-line")].map((el) => {
          const r = el.getBoundingClientRect();
          return { left: Math.round(r.left), right: Math.round(r.right) };
        }),
        vw: window.innerWidth,
      }));
    const wide = await lines();
    expect(wide.title.length, "the headline should be split into lines").toBeGreaterThan(0);
    /* The lede is no longer split at all, so it has no line boxes and nothing
       that can freeze — it re-wraps as ordinary text. */
    expect(wide.lede, "the lede is plain text, not split lines").toBe(0);

    /* A viewport sweep cannot see this: loading at 360 splits at 360 and looks
       right. The bug lives in the resize, because a SplitText line box cannot
       re-wrap. The headline is the split text now, and the hero rebuilds its
       timeline — and the split with it — when the width changes. So: narrow the
       viewport and demand lines that were cut for THIS width. */
    await page.setViewportSize({ width: 360, height: 740 });
    await page.waitForTimeout(1400);
    const narrow = await lines();
    const text = await page.evaluate(() =>
      (document.querySelector(".hero-lede")?.textContent ?? "").trim(),
    );
    expect(text.length, "the lede should still be on the page at 360px").toBeGreaterThan(40);
    expect(narrow.title.length, "the headline should be re-split at 360px").toBeGreaterThan(0);
    for (const l of narrow.title) {
      expect(l.left, "a headline line is cut off on the left at 360px — its breaks are frozen").toBeGreaterThanOrEqual(0);
      expect(l.right, "a headline line overflows at 360px — its breaks are frozen").toBeLessThanOrEqual(narrow.vw);
    }
    await context.close();
  });

  test("the menu button stays inside the viewport at the 360px floor", async ({ browser, isMobile }) => {
    test.skip(isMobile, "makes its own viewports; runs once");
    for (const w of [360, 390, 430]) {
      const context = await browser.newContext({ viewport: { width: w, height: 760 } });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "load", timeout: 120_000 });
      await page.waitForTimeout(2000);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const btn = [...document.querySelectorAll("button")].find(
          (b) => b.getAttribute("aria-expanded") !== null && getComputedStyle(b).display !== "none",
        );
        return { vw, right: btn ? Math.round(btn.getBoundingClientRect().right) : null };
      });
      expect(r.right, `${w}px has no visible menu button`).not.toBeNull();
      expect(r.right!, `${w}px pushes the menu button ${r.right! - r.vw}px past the edge`).toBeLessThanOrEqual(r.vw);
      await context.close();
    }
  });
});
