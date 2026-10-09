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

    // Check filter tab buttons
    const allTab = workSection.getByRole("button", { name: /All Projects/i });
    const aiTab = workSection.getByRole("button", { name: /AI & Automations/i });
    const webflowTab = workSection.getByRole("button", { name: /Webflow/i });
    const enterpriseTab = workSection.getByRole("button", { name: /Biotech & Enterprise/i });
    const saasTab = workSection.getByRole("button", { name: /SaaS & Web3/i });

    await expect(allTab).toBeVisible();
    await expect(aiTab).toBeVisible();
    await expect(webflowTab).toBeVisible();
    await expect(enterpriseTab).toBeVisible();
    await expect(saasTab).toBeVisible();

    // Default: All 9 projects active
    await expect(allTab).toHaveClass(/bg-electric/);
    const initialItems = workSection.locator(".work-index__item");
    const initialCount = await initialItems.count();
    expect(initialCount).toBe(9);

    // Filter by AI & Automations (Puck, RAY AI = 2)
    await aiTab.click();
    await expect(aiTab).toHaveClass(/bg-electric/);
    await expect(allTab).not.toHaveClass(/bg-electric/);
    
    const aiItems = workSection.locator(".work-index__item");
    await expect(aiItems).toHaveCount(2);
    await expect(workSection.locator(".work-index__item", { hasText: "Puck" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "RAY AI" })).toBeVisible();

    // Filter by Biotech & Enterprise (1910.ai, SemiconBio, PSSLTD = 3)
    await enterpriseTab.click();
    await expect(enterpriseTab).toHaveClass(/bg-electric/);
    const entItems = workSection.locator(".work-index__item");
    await expect(entItems).toHaveCount(3);
    await expect(workSection.locator(".work-index__item", { hasText: "1910.ai" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "SemiconBio" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "PSSLTD" })).toBeVisible();

    // Filter by Webflow (Alosant, Lilipad = 2)
    await webflowTab.click();
    await expect(webflowTab).toHaveClass(/bg-electric/);
    const webflowItems = workSection.locator(".work-index__item");
    await expect(webflowItems).toHaveCount(2);
    await expect(workSection.locator(".work-index__item", { hasText: "Alosant" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "Lilipad" })).toBeVisible();

    // Filter by SaaS & Web3 (Happy Ring, Omicron = 2)
    await saasTab.click();
    await expect(saasTab).toHaveClass(/bg-electric/);
    const saasItems = workSection.locator(".work-index__item");
    await expect(saasItems).toHaveCount(2);
    await expect(workSection.locator(".work-index__item", { hasText: "Happy Ring" })).toBeVisible();
    await expect(workSection.locator(".work-index__item", { hasText: "Omicron" })).toBeVisible();

    // Return to All Projects
    await allTab.click();
    await expect(allTab).toHaveClass(/bg-electric/);
    await expect(workSection.locator(".work-index__item")).toHaveCount(9);

    // Verify "Explore Full Project Archive" button links to /archive
    const archiveLink = workSection.locator("a[href='/archive/']");
    await expect(archiveLink).toBeVisible();
    await expect(archiveLink).toHaveText(/Explore Full Project Archive/i);

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
    await expect(searchInput).toHaveAttribute("placeholder", /Search by client, stack/i);

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

    // 1. Search for specific tech stack keyword "n8n"
    await searchInput.fill("n8n");
    await page.waitForTimeout(200);

    const n8nRows = page.locator("tbody tr");
    const n8nCount = await n8nRows.count();
    expect(n8nCount).toBeGreaterThanOrEqual(2);
    // Both RAY AI and Lead Enrichment use n8n
    await expect(page.locator("tbody tr", { hasText: "RAY AI Operations Hub" })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "B2B Lead Enrichment Engine" })).toBeVisible();

    // Clear button appears when text is present
    const clearButton = page.getByRole("button", { name: /Clear/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await expect(searchInput).toHaveValue("");

    // 2. Case-insensitive search "PUCK"
    await searchInput.fill("PUCK");
    await page.waitForTimeout(200);
    const puckRows = page.locator("tbody tr");
    await expect(puckRows).toHaveCount(1);
    await expect(puckRows.first()).toContainText("Puck");

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

    const aiFilterBtn = page.getByRole("button", { name: /^AI & Automations/i });
    await aiFilterBtn.click();
    await expect(aiFilterBtn).toHaveClass(/bg-electric/);

    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Verify that known AI projects are displayed
    await expect(page.locator("tbody tr", { hasText: "RAY AI Operations Hub" })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "Puck Screening Pipeline" })).toBeVisible();
    await expect(page.locator("tbody tr", { hasText: "B2B Lead Enrichment Engine" })).toBeVisible();

    // Verify non-AI projects are not present
    await expect(page.locator("tbody tr", { hasText: "1910.ai Therapeutics" })).toHaveCount(0);
    await expect(page.locator("tbody tr", { hasText: "SemiconBio Platform" })).toHaveCount(0);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("archive table links navigate to case studies or open external links safely", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/archive");
    await page.waitForLoadState("domcontentloaded");

    // Ray AI has a case study link
    const rayCaseStudyLink = page.locator("a[href='/work/rayai/']").first();
    await expect(rayCaseStudyLink).toBeVisible();

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

test.describe("QAQC: AI & Automation Showcase (/work/[id])", () => {
  test("case study with AI workflow (/work/rayai) renders 4-stage pipeline diagram and ROI metrics", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/work/rayai");
    await page.waitForLoadState("domcontentloaded");

    // 1. Workflow Architecture Diagram
    const workflowSection = page.locator("[data-od-id='case-workflow']");
    await expect(workflowSection).toBeVisible();
    await expect(workflowSection.getByText(/Workflow Architecture/i)).toBeVisible();

    // 4 stages (01, 02, 03, 04)
    await expect(workflowSection.getByText("01")).toBeVisible();
    await expect(workflowSection.getByText("02")).toBeVisible();
    await expect(workflowSection.getByText("03")).toBeVisible();
    await expect(workflowSection.getByText("04")).toBeVisible();

    // Stage titles
    await expect(workflowSection.getByText(/Multi-Channel Request/i)).toBeVisible();
    await expect(workflowSection.getByText(/Intent & Context Extraction/i)).toBeVisible();
    await expect(workflowSection.getByText(/Complexity & Guardrail Routing/i)).toBeVisible();
    await expect(workflowSection.getByText(/Automated Execution & Delivery/i)).toBeVisible();

    // Tool chips (e.g. OpenAI GPT-4o, n8n Workflow Engine)
    await expect(workflowSection.getByText("OpenAI GPT-4o").first()).toBeVisible();
    await expect(workflowSection.getByText("n8n Workflow Engine").first()).toBeVisible();

    // 2. Quantifiable ROI / Metrics Grid
    const impactEyebrow = page.getByText(/Impact & Proof/i);
    await expect(impactEyebrow).toBeVisible();

    await expect(page.getByText("< 45s")).toBeVisible();
    await expect(page.getByText("Response Latency")).toBeVisible();
    await expect(page.getByText("-68%")).toBeVisible();
    await expect(page.getByText("Operational Overhead")).toBeVisible();
    await expect(page.getByText("99.2%")).toBeVisible();
    await expect(page.getByText("Task Accuracy")).toBeVisible();

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("case study with AI workflow (/work/puck) renders workflow and metrics", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/work/puck");
    await page.waitForLoadState("domcontentloaded");

    const workflowSection = page.locator("[data-od-id='case-workflow']");
    await expect(workflowSection).toBeVisible();

    // Metrics for Puck
    await expect(page.getByText("22 hrs/wk")).toBeVisible();
    await expect(page.getByText("Time Saved")).toBeVisible();
    await expect(page.getByText("14x Faster")).toBeVisible();
    await expect(page.getByText("Screening Speed")).toBeVisible();
    await expect(page.getByText("94.8%")).toBeVisible();
    await expect(page.getByText("Candidate Match")).toBeVisible();

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
  });

  test("standard case study without AI workflow (/work/1910) renders gracefully without workflow diagram", async ({ page }) => {
    const bag = watchForErrors(page);
    await page.goto("/work/1910");
    await page.waitForLoadState("domcontentloaded");

    // Standard elements exist
    await expect(page.locator("h1")).toContainText("1910.ai");
    await expect(page.getByRole("link", { name: /All work/i })).toBeVisible();
    await expect(page.locator(".case-plate img")).toBeVisible();
    await expect(page.getByText(/Keep going/i)).toBeVisible();

    // Workflow section should NOT be present
    const workflowSection = page.locator("[data-od-id='case-workflow']");
    await expect(workflowSection).toHaveCount(0);

    // No ROI metrics grid
    await expect(page.getByText(/Impact & Proof/i)).toHaveCount(0);

    expect(bag.pageErrors).toEqual([]);
    expect(bag.consoleErrors).toEqual([]);
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

    test(`no horizontal scroll blowout on AI case study (/work/rayai) at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/work/rayai");
      await page.waitForLoadState("domcontentloaded");

      const hasBlowout = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasBlowout).toBe(false);
    });
  }

  test("workflow diagram cards stack cleanly without horizontal overflow at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/work/rayai");
    await page.waitForLoadState("domcontentloaded");

    const workflowSection = page.locator("[data-od-id='case-workflow']");
    await expect(workflowSection).toBeVisible();

    // Check each step card fits inside viewport width
    const stepCards = workflowSection.locator(".relative.flex.flex-col");
    const count = await stepCards.count();
    expect(count).toBe(4);

    for (let i = 0; i < count; i++) {
      const box = await stepCards.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(360 + 2);
      }
    }
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

