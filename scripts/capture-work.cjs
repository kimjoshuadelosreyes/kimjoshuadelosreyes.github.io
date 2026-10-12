/**
 * Captures the project screens shown on the case study pages, one per device:
 *
 *   node scripts/capture-work.cjs            every project in the manifest
 *   node scripts/capture-work.cjs monno owwo only the ones named
 *   node scripts/capture-work.cjs tally=http://localhost:3005/dashboard
 *                                            one project, from another address
 *
 * Writes public/img/work/<id>/{desktop,tablet,mobile}.webp. Projects without a
 * public address are captured from a local run on demo data, which is why their
 * `url` is a localhost one. Look at every image before committing it: nothing
 * here may show a real person's name, email or figures.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");

const MANIFEST = {
  coremote: "https://coremote.io/",
  passivae: "https://www.passivae.com/",
  monno: "https://monno.io/",
  "construction-hub": "https://www.constructionhubph.com/",
  budi: "http://localhost:3106/",
  "funded-prop-traders": "https://fundedproptraders.com/",
  "ck-propfirm": "https://ckpropfirm.com/en",
  wchampfx: "https://30days.wchampfx.com/",
  trestle: "http://localhost:3101/",
  tally: "http://localhost:3102/",
  "funnel-foundry": "http://localhost:3103/",
  owwo: "http://localhost:3104/",
};

/** Overlays to click away before the shot, tried in order and ignored if absent. */
const DISMISS = {
  "funded-prop-traders": ["[role=dialog] button:has(svg)", "button[aria-label*=lose i]"],
  "ck-propfirm": ["button:has-text('Reject non-essential')"],
};

const DEVICES = [
  { name: "desktop", width: 1440, height: 900, scale: 1 },
  { name: "tablet", width: 820, height: 1180, scale: 1 },
  { name: "mobile", width: 390, height: 844, scale: 2, mobile: true },
];

(async () => {
  const jobs = {};
  const args = process.argv.slice(2);
  for (const a of args) {
    const [id, ...rest] = a.split("=");
    if (!(id in MANIFEST)) throw new Error(`Unknown project: ${id}`);
    jobs[id] = rest.length ? rest.join("=") : MANIFEST[id];
  }
  if (!args.length) Object.assign(jobs, MANIFEST);

  const browser = await chromium.launch();
  for (const [id, url] of Object.entries(jobs)) {
    const dir = path.join(root, "public/img/work", id);
    fs.mkdirSync(dir, { recursive: true });
    for (const d of DEVICES) {
      const ctx = await browser.newContext({
        viewport: { width: d.width, height: d.height },
        deviceScaleFactor: d.scale,
        isMobile: !!d.mobile,
        hasTouch: !!d.mobile,
        reducedMotion: "reduce",
      });
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(2500);
        for (const sel of DISMISS[id] || []) {
          await page.locator(sel).first().click({ timeout: 2500 }).catch(() => {});
        }
        await page.keyboard.press("Escape").catch(() => {});
        // A local run carries the framework's dev badge; it is not part of the site.
        await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});
        await page.waitForTimeout(700);
        const png = await page.screenshot({ type: "png" });
        await sharp(png).webp({ quality: 82 }).toFile(path.join(dir, `${d.name}.webp`));
        console.log(`${id} ${d.name} ok`);
      } catch (e) {
        console.log(`${id} ${d.name} FAILED: ${e.message.split("\n")[0]}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
})();
