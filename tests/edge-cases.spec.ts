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

test.describe("QAQC: High-Volume Projects & Category Filtering (Home /#work)", () => {
  test("category filter tabs are present with counts and toggle work items correctly", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/#work");
    await page.waitForLoadState("domcontentloaded");

    const workSection = page.locator("#work");
    await expect(workSection).toBeVisible();

    // One tab per category that has a project in it.
    const allTab = workSection.getByRole("button", { name: /All projects/i });
    const saasTab = workSection.getByRole("button", { name: /SaaS & platforms/i });
    const sitesTab = workSection.getByRole("button", { name: /Websites/i });

    await expect(allTab).toBeVisible();
    await expect(saasTab).toBeVisible();
    await expect(sitesTab).toBeVisible();
    // No project with a page is in these, so they get no tab.
    await expect(workSection.getByRole("button", { name: /E-commerce|Community/i })).toHaveCount(0);

    await expect(allTab).toHaveClass(/bg-electric/);
    const items = workSection.locator(".work-index__item");
    await expect(items).toHaveCount(12);

    await saasTab.click();
    await expect(saasTab).toHaveClass(/bg-electric/);
    await expect(allTab).not.toHaveClass(/bg-electric/);
    await expect(items).toHaveCount(7);
    await expect(workSection.locator(".work-index__item", { hasText: "Passivae" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "Trestle" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "OWWO Chicken" })).toHaveCount(0);

    await sitesTab.click();
    await expect(sitesTab).toHaveClass(/bg-electric/);
    await expect(items).toHaveCount(5);
    await expect(workSection.locator(".work-index__item", { hasText: "CoRemote" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "OWWO Chicken" })).toBeVisible();

    await allTab.click();
    await expect(allTab).toHaveClass(/bg-electric/);
    await expect(items).toHaveCount(12);

    const archiveLink = workSection.locator("a[href='/archive/']");
    await expect(archiveLink).toBeVisible();
    await expect(archiveLink).toHaveText(/See every client in the archive/i);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });
});

test.describe("QAQC: Full Project Archive Page (/archive)", () => {
  test("archive page boots cleanly with header, count, search bar and data table", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    // Check title and headings
    await expect(page.locator("h1")).toHaveText(/Project Directory/i);
    await expect(page.getByText(/The Full Archive/i)).toBeVisible();

    // Verify Search input
    const searchInput = page.locator("input[type='text']");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", /Search by client, sector/i);

    // Verify Table rows exist
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Verify Back to Overview navigation
    const backLink = page.getByRole("link", { name: /Back to Overview/i });
    await expect(backLink).toBeVisible();

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("archive search filters correctly, handles case-insensitivity and tech stack keywords", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("input[type='text']");

    // 1. Search by the kind of work
    await searchInput.fill("shopify");
    await page.waitForTimeout(200);
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("tbody tr", { hasText: "Maison Luna" })).toBeVisible();

    // Clear button appears when text is present
    const clearButton = page.getByRole("button", { name: /Clear/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await expect(searchInput).toHaveValue("");

    // 2. Case-insensitive search
    await searchInput.fill("PASSIVAE");
    await page.waitForTimeout(200);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Passivae");

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("archive search handles zero-result edge case and resets cleanly", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("input[type='text']");

    // Search query with zero results
    await searchInput.fill("nonexistent_edgecase_project_xyz");
    await page.waitForTimeout(200);

    // Zero table rows
    await expect(page.locator("tbody tr")).toHaveCount(0);

    // Empty state container rendered
    const emptyState = page.getByText("No matching projects found");
    await expect(emptyState).toBeVisible();

    const resetButton = page.getByRole("button", { name: /Reset filters/i });
    await expect(resetButton).toBeVisible();

    // Click reset button
    await resetButton.click();
    await page.waitForTimeout(200);

    // Verify search is cleared and rows are restored
    await expect(searchInput).toHaveValue("");
    const restoredRows = page.locator("tbody tr");
    expect(await restoredRows.count()).toBeGreaterThanOrEqual(10);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("archive category filter pills toggle table accurately", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    const shopBtn = page.getByRole("button", { name: /^E-commerce/i });
    await shopBtn.click();
    await expect(shopBtn).toHaveClass(/bg-electric/);

    await expect(page.locator("tbody tr")).toHaveCount(2);
    await expect(page.locator("tbody tr", { hasText: "The Flowershop PH" })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "Maison Luna" })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "Passivae" })).toHaveCount(0);

    const communityBtn = page.getByRole("button", { name: /^Community & marketing/i });
    await communityBtn.click();
    await expect(page.locator("tbody tr")).toHaveCount(20);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("archive table links navigate to case studies or open external links safely", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    // A project with a page links to it; one without has no link.
    await expect(page.locator("a[href='/work/passivae/']").first()).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "Maison Luna" }).locator("a")).toHaveCount(0);

    // External links have rel="noopener noreferrer" and target="_blank"
    const externalLinks = page.locator("table a[target='_blank']");
    const extCount = await externalLinks.count();
    if (extCount > 0) {
      for (let i = 0; i < extCount; i++) {
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      }
    }

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });
});

test.describe("QAQC: Case studies (/work/[id])", () => {
  test("a live project shows three screens, the work, a link out and the client's quote", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/work/passivae");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText("Passivae");
    await expect(page.getByRole("link", { name: /All work/i })).toBeVisible();
    await expect(page.locator(".case-shot img")).toHaveCount(3);
    await expect(page.locator(".case-shot--desktop img")).toBeVisible();
    await expect(page.locator(".case-part")).toHaveCount(6);

    const out = page.getByRole("link", { name: /Visit passivae\.com/i });
    await expect(out).toHaveAttribute("target", "_blank");
    await expect(out).toHaveAttribute("rel", /noopener/);

    // The quote is attributed to a role and a company, never a person.
    const quote = page.locator(".case-quote");
    await expect(quote).toContainText("No mystery config");
    await expect(quote).toContainText("CEO");
    await expect(quote.locator("img")).toHaveCount(0);

    await expect(page.locator(".case-shots__note")).toHaveCount(0);
    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("a link from far down the home page opens the next page at its top, not its footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2000);

    const link = page.locator('.work-index__link[href="/work/passivae/"]');
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await link.click();
    await page.waitForURL("**/work/passivae/");
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("h1")).toBeInViewport();

    // And from one case study to the next.
    await page.locator(".case-nav__link--next").click();
    await page.waitForURL("**/work/trestle/");
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // "All work" goes back to the section it names.
    await page.locator(".case-back").click();
    await page.waitForURL("**/#work");
    await page.waitForTimeout(2500);
    await expect(page.locator("#work h2")).toBeInViewport();
  });

  test("a project with no public address says its screens are from a local build", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/work/trestle");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText("Trestle");
    await expect(page.locator(".case-shot img")).toHaveCount(3);
    await expect(page.locator(".case-shots__note")).toContainText(/local build/i);
    await expect(page.getByRole("link", { name: /^Visit /i })).toHaveCount(0);
    await expect(page.locator(".case-quote")).toHaveCount(0);
    await expect(page.getByText(/Keep going/i)).toBeVisible();

    // Nothing invented: no metrics grid, no workflow diagram.
    await expect(page.getByText(/Impact & Proof/i)).toHaveCount(0);
    await expect(page.locator("[data-od-id='case-workflow']")).toHaveCount(0);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("every project's three screens exist", async ({ page, request }) => {
    await page.goto("/archive");
    const ids = await page.locator("tbody a[href^='/work/']").evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")!.split("/")[2]),
    );
    expect(ids.length).toBe(12);
    for (const id of ids) {
      for (const d of ["desktop", "tablet", "mobile"]) {
        const res = await request.get(`/img/work/${id}/${d}.webp`);
        expect(res.status(), `${id}/${d}`).toBe(200);
      }
    }
  });
});

test.describe("QAQC: Contrast, Brand Rebrand & Visual Hierarchy", () => {
  test("site wordmark renders KIM and stays positioned below top header", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Nav aria-label brand
    const homeLink = page.locator("a[aria-label='KIM — home']");
    await expect(homeLink).toBeVisible();

    // Hero wordmark element position
    const heroWordmark = page.locator(".hero-wordmark");
    await expect(heroWordmark).toBeVisible();
    
    const wordmarkBox = await heroWordmark.boundingBox();
    expect(wordmarkBox).not.toBeNull();
    if (wordmarkBox) {
      // Must be positioned at or below top 76px header (it is styled with top-[86px] / lg:top-[90px])
      expect(wordmarkBox.y).toBeGreaterThanOrEqual(75);
    }

    // Check footer copyright
    const footer = page.locator("footer");
    await expect(footer).toContainText(/Kim Joshua/i);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("navigation items have visible hover transition styles", async ({ page, isMobile }) => {
    if (isMobile) return;
    const bag = watchForErrors(page);
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const navLinks = page.locator("nav[aria-label='Primary'] a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveClass(/hover:text-electric/);
    }

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("footer and nav render updated email and LinkedIn, and X is removed", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Email verification across page
    const emailLinks = page.locator("a[href='mailto:kimjoshuadr@gmail.com']");
    expect(await emailLinks.count()).toBeGreaterThanOrEqual(1);

    // Old email should not exist
    const oldEmailLinks = page.locator("a[href*='nenad@popadic.co']");
    await expect(oldEmailLinks).toHaveCount(0);

    // LinkedIn link verification
    // In the footer; the close links to it as well.
    const linkedinLink = page.locator("footer a[href='https://www.linkedin.com/in/kimjoshuadev/']");
    await expect(linkedinLink).toBeVisible();

    // Verify X / Twitter link is completely removed
    const xLinks = page.locator("footer nav[aria-label='Elsewhere'] a", { hasText: /^X$/ });
    await expect(xLinks).toHaveCount(0);
    const twitterLinks = page.locator("a[href*='x.com'], a[href*='twitter.com']");
    await expect(twitterLinks).toHaveCount(0);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });
});

test.describe("QAQC: Responsive Viewports & Edge Case Boundaries", () => {
  const narrowViewports = [
    { width: 320, height: 600, label: "320px (iPhone SE min floor)" },
    { width: 360, height: 740, label: "360px (Standard mobile compact)" },
    { width: 390, height: 844, label: "390px (iPhone 14/15)" },
  ];

  for (const vp of narrowViewports) {
    test(`no horizontal scroll blowout on home (/) at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const hasBlowout = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasBlowout).toBe(false);
    });

    test(`no horizontal scroll blowout on archive (/archive) at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/archive");
      await page.waitForLoadState("domcontentloaded");

      const hasBlowout = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasBlowout).toBe(false);
    });

    test(`no horizontal scroll blowout on a case study (/work/passivae) at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/work/passivae");
      await page.waitForLoadState("domcontentloaded");

      const hasBlowout = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasBlowout).toBe(false);
    });
  }

  test("case study screens fit without horizontal overflow at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/work/owwo");
    await page.waitForLoadState("domcontentloaded");

    const shots = page.locator(".case-shot img");
    await expect(shots).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const box = await shots.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(360 + 2);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(362);
  });

  test("non-existent work item id renders 404 gracefully", async ({ page }) => {
    const bag = watchForErrors(page);
    const response = await page.goto("/work/non-existent-case-study-slug");
    await page.waitForLoadState("domcontentloaded");

    // Next.js returns 404
    expect(response?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();

    // No uncaught application crash
    expect(bag.pageErrors).toEqual([]);
  });
});

test.describe("QAQC: Multi-Device Matrix & Viewport Coverage (Mobile, Tablet, Fold, Landscape)", () => {
  const deviceMatrix = [
    { name: "Galaxy Fold (Folded)", width: 280, height: 653 },
    { name: "iPhone SE (1st gen)", width: 320, height: 568 },
    { name: "iPhone SE (2nd/3rd gen)", width: 375, height: 667 },
    { name: "iPhone 14 / 15", width: 390, height: 844 },
    { name: "Pixel 7", width: 412, height: 915 },
    { name: "iPhone 14 Pro Max", width: 430, height: 932 },
    { name: "Surface Duo (Single Screen)", width: 540, height: 720 },
    { name: "iPhone SE (Landscape)", width: 667, height: 375 },
    { name: "iPhone 14 (Landscape)", width: 844, height: 390 },
    { name: "iPad Mini (Portrait)", width: 768, height: 1024 },
    { name: "iPad Air (Portrait)", width: 820, height: 1180 },
    { name: "iPad Pro 11-inch (Portrait)", width: 834, height: 1194 },
    { name: "Surface Pro 7 (Portrait)", width: 912, height: 1368 },
    { name: "iPad Pro 12.9-inch (Portrait)", width: 1024, height: 1366 },
    { name: "MacBook Air / Laptop 13", width: 1280, height: 800 },
    { name: "Desktop 1440p / Common Laptop", width: 1440, height: 900 },
    { name: "Full HD Display", width: 1920, height: 1080 },
  ];

  for (const dev of deviceMatrix) {
    test(`hero wordmark and layout bounds at ${dev.name} (${dev.width}x${dev.height})`, async ({ page }) => {
      await page.setViewportSize({ width: dev.width, height: dev.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // 1. Hero wordmark visibility and geometry
      const wordmark = page.locator(".hero-wordmark");
      await expect(wordmark).toBeVisible();

      // Wordmark paths rendered directly in SVG
      const paths = page.locator(".hero-wordmark svg path");
      expect(await paths.count()).toBeGreaterThanOrEqual(3);

      const wordmarkBox = await wordmark.boundingBox();
      expect(wordmarkBox).not.toBeNull();
      if (wordmarkBox) {
        expect(wordmarkBox.width).toBeGreaterThan(0);
        expect(wordmarkBox.height).toBeGreaterThan(0);
        expect(wordmarkBox.y).toBeGreaterThanOrEqual(65);
      }

      // 2. No horizontal overflow on the root document
      const hasBlowout = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasBlowout).toBe(false);
    });
  }

  test("mobile wordmark remains visible behind portrait upon scrolling (not flung offscreen)", async ({ page }) => {
    // Test on representative phone viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const wordmark = page.locator(".hero-wordmark");
    await expect(wordmark).toBeVisible();

    // Scroll down 120px
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.waitForTimeout(300);

    // Wordmark must still be rendered within visible top area (y + height > 0)
    const box = await wordmark.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y + box.height).toBeGreaterThan(0);
    }
  });
});

