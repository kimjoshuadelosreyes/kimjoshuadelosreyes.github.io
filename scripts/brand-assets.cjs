/**
 * Renders the share image and the raster icons from the site's own assets:
 * the wordmark paths, the portrait and the brand faces. Run it again whenever
 * the headline, the portrait or the mark changes:
 *
 *   node scripts/brand-assets.cjs
 *
 * Writes src/app/opengraph-image.png (1200 x 630), src/app/apple-icon.png
 * (180 x 180) and src/app/favicon.ico (16, 32 and 48). `src/app/icon.svg` is
 * hand-written and is the source for the mark.
 */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const root = path.resolve(__dirname, "..");
const file = (p) => "file://" + path.join(root, p);
const K = "M0 338V0H93.05V148.79H99.99L205.72 0H315.99L193.04 166.49L318.86 338H205.72L99.99 188.02H93.05V338Z";
const I = "M356.42 0H449.47V338H356.42Z";
const M = "M512.14 338V0H682.22L731.74 263.61H737.48L786.99 0H957.07V338H864.02L867.84 39.23H861.86L804.22 338H665L607.11 39.23H601.37L605.19 338Z";

const og = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:D;src:url("${file("public/fonts/tr3a-medium.woff2")}");font-weight:500}
@font-face{font-family:B;src:url("${file("public/fonts/ppneue-book.woff2")}");font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#f9f9f9;color:#262626;position:relative;font-family:B}
.mark{position:absolute;left:610px;top:60px;width:560px;fill:#fa5d19}
.me{position:absolute;right:30px;bottom:0;height:640px}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#f9f9f9 0 46%,rgba(249,249,249,0) 62%)}
.copy{position:absolute;left:72px;top:60px;bottom:0;display:flex;flex-direction:column;justify-content:center;width:600px}
.tag{font-size:22px;letter-spacing:.09em;text-transform:uppercase;color:#482f24}
h1{margin-top:20px;font-family:D;font-weight:500;font-size:60px;line-height:1.04;letter-spacing:-.03em;white-space:nowrap}
p{margin-top:24px;font-size:27px;line-height:1.4;color:#6b6b6b;max-width:470px}
.small{position:absolute;left:72px;top:64px;width:120px;fill:#262626}
.bar{position:absolute;left:0;bottom:0;width:100%;height:10px;background:#fa5d19}
</style>
<svg class="mark" viewBox="0 0 957 338"><path d="${K}"/><path d="${I}"/><path d="${M}"/></svg>
<img class="me" src="${file("public/img/kim-portrait-hero.webp")}">
<div class="fade"></div>
<svg class="small" viewBox="0 0 957 338"><path d="${K}"/><path d="${I}"/><path d="${M}"/></svg>
<div class="copy"><div class="tag">Kim Joshua</div><h1>Websites that work.<br>Systems that run.</h1><p>Hand-coded websites, AI agents and automation.</p></div>
<div class="bar"></div>`;

const icon = (size, radius) => `<!doctype html><meta charset="utf-8"><style>*{margin:0}body{width:${size}px;height:${size}px;background:transparent}</style>
<svg width="${size}" height="${size}" viewBox="0 0 512 512"><rect width="512" height="512" rx="${radius}" fill="#fa5d19"/><path transform="translate(126 110) scale(.864)" fill="#fff" d="${K}"/></svg>`;

(async () => {
  const tmp = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "brand-"));
  const browser = await chromium.launch();
  const shot = async (html, w, h, out, transparent = false) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const f = path.join(tmp, `${path.basename(out)}.html`);
    fs.writeFileSync(f, html);
    await page.goto("file://" + f, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: out, omitBackground: transparent });
    await page.close();
  };

  await shot(og, 1200, 630, path.join(root, "src/app/opengraph-image.png"));
  await shot(icon(180, 0), 180, 180, path.join(root, "src/app/apple-icon.png"));

  // favicon.ico: PNG images in an ICO container, which every current browser reads.
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const s of sizes) {
    const out = path.join(tmp, `i${s}.png`);
    await shot(icon(s, 112), s, s, out, true);
    pngs.push(fs.readFileSync(out));
  }
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync(path.join(root, "src/app/favicon.ico"), Buffer.concat([head, ...pngs]));

  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("wrote opengraph-image.png, apple-icon.png, favicon.ico");
})();
