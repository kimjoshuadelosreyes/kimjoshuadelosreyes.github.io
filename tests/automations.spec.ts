import { test, expect, type Page } from "@playwright/test";
import catalog from "../src/lib/automations.generated.json";

/**
 * The automation library on the site: the home section, the catalogue, and the
 * pages. Counts are read from the same generated file the site reads, so these
 * tests hold the pages to the library and not to a number typed here.
 */

const workflows = catalog.workflows;
const behaviours = workflows.reduce((n, w) => n + w.tests.length, 0);
/** Rebuilt from workflows that ran in production; everything else is a reference build. */
const real = workflows.filter((w) => w.source === "production");
const referenceSingles = workflows.filter((w) => w.tier === "production" && w.source !== "production");
const REAL_NOTE = "Built and run in production · rebuilt here on test data";
const REFERENCE_NOTE = "Reference build · run on test data";
const platforms = Object.entries(catalog.platforms)
  .map(([id, p]) => ({ id, ...p }))
  .filter((p) => p.workflows > 0);
const nameOf = (id: string) => platforms.find((p) => p.id === id)!.name;
/** The home page's picker shows the first eight systems. */
const shown = catalog.systems.slice(0, 8);

function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !/favicon|React DevTools|\[Fast Refresh\]|\[HMR\]/i.test(msg.text())) errors.push(msg.text());
  });
  return errors;
}

test.describe("automations on the home page", () => {
  test("the section states what the library holds, from the catalogue", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/");
    const section = page.locator("#automations");
    await expect(section.locator("h2")).toContainText("something breaks");
    const facts = section.locator(".autos-fact dt");
    await expect(facts).toHaveText([String(real.length), String(workflows.length), String(behaviours), String(platforms.length)]);
    await expect(section.locator(".autos-tab")).toHaveCount(shown.length);
    expect(errors).toEqual([]);
  });

  test("the graph renders the branch that suits the viewport", async ({ page, isMobile }) => {
    await page.goto("/");
    const graph = page.locator("#automations [data-od-id='automation-graph']");
    const lead = workflows.find((w) => w.id === catalog.systems[0].workflows[0])!;
    if (isMobile) {
      await expect(graph).toHaveClass(/auto--compact/);
      // The home page shows the first three steps and a way to the rest.
      await expect(graph.locator(".auto-step")).toHaveCount(3);
      await expect(graph.locator("a.ask-cta")).toHaveAttribute("href", new RegExp(`/automations/${shown[0].id}`));
    } else {
      await expect(graph).toHaveClass(/auto--auto/);
      await expect(graph.locator(".auto-node")).toHaveCount(lead.graph.nodes.length);
      await expect(graph.locator(".auto-wire")).toHaveCount(lead.graph.edges.length);
      await expect(graph.locator(".auto-dot")).toHaveCount(lead.story.length + 1);
      // Every node that is a platform's own wears that platform's mark.
      await expect(graph.locator(".auto-node-glyph--mark")).toHaveCount(lead.graph.nodes.filter((n) => "platform" in n && n.platform).length);
    }
  });

  test("the selected system names the platforms it runs on", async ({ page }) => {
    await page.goto("/");
    const system = shown[0];
    const across = platforms.filter((p) => system.workflows.some((id) => workflows.find((w) => w.id === id)!.platforms.includes(p.id)));
    const marks = page.locator("#automations .autos-runs .mark");
    await expect(marks).toHaveText(across.map((p) => p.name));
    // The marks load lazily, so bring them on screen before asking whether each one arrived.
    await marks.first().scrollIntoViewIfNeeded();
    for (const img of await marks.locator("img").all()) {
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  test("choosing another system swaps the workflow", async ({ page, isMobile }) => {
    await page.goto("/");
    const system = shown[shown.length - 1];
    const lead = workflows.find((w) => w.id === system.workflows[0])!;
    const tab = page.locator("#automations .autos-tab", { hasText: system.name });
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const graph = page.locator("#automations [data-od-id='automation-graph']");
    if (isMobile) await expect(graph.locator(".auto-caption-title").first()).toHaveText(lead.story[0].title);
    else await expect(graph.locator(".auto-caption-no em").first()).toHaveText(lead.name);
  });

  test("the systems that ran in production lead the picker, labelled as such", async ({ page, isMobile }) => {
    await page.goto("/");
    const first = workflows.find((w) => w.id === shown[0].workflows[0])!;
    expect(first.source).toBe("production");
    // Every real system comes before the first reference one.
    const kinds = shown.map((s) => workflows.find((w) => w.id === s.workflows[0])!.source);
    expect(kinds.lastIndexOf("production")).toBeLessThan(kinds.indexOf("reference"));
    const graph = page.locator("#automations [data-od-id='automation-graph']");
    await expect(graph.getByText(REAL_NOTE).first()).toBeVisible();
    // A reference system says what it is when it is chosen.
    const reference = shown[kinds.indexOf("reference")];
    const tab = page.locator("#automations .autos-tab", { hasText: reference.name });
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(graph.getByText(REFERENCE_NOTE).first()).toBeVisible();
    if (!isMobile) await expect(graph.getByText(REAL_NOTE)).toHaveCount(0);
  });

  test("the nav reaches the section", async ({ page, isMobile }) => {
    test.skip(isMobile, "the desktop nav is hidden on a phone");
    await page.goto("/");
    await expect(page.locator("nav[aria-label='Primary'] a", { hasText: "Automations" })).toHaveAttribute("href", "#automations");
  });
});

test.describe("the automation catalogue", () => {
  test("lists every workflow and narrows by tier, area and search", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/automations");
    const rows = page.locator(".autos-row");
    await expect(rows).toHaveCount(workflows.length);

    await page.getByRole("button", { name: /Reference workflows/ }).click();
    await expect(rows).toHaveCount(referenceSingles.length);

    await page.getByRole("button", { name: "Everything" }).click();
    await page.getByLabel("Search the workflows").fill("refund");
    const refund = workflows.filter((w) => [w.name, w.summary, w.category, ...w.platforms.map(nameOf)].some((t) => t.toLowerCase().includes("refund")));
    await expect(rows).toHaveCount(refund.length);
    expect(refund.length).toBeGreaterThan(0);

    await page.getByLabel("Search the workflows").fill("zzzz-nothing");
    await expect(page.getByText("Nothing matches that")).toBeVisible();
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(rows).toHaveCount(workflows.length);
    expect(errors).toEqual([]);
  });

  test("what was built in production is its own group, and comes first", async ({ page }) => {
    await page.goto("/automations");
    const groups = page.locator(".autos-group");
    await expect(groups).toHaveText(["Built in production", "Reference systems", "Reference workflows", "Building blocks"]);
    const firstGroup = page.locator("section[aria-label='Built in production'] .autos-row");
    await expect(firstGroup).toHaveCount(real.length);
    await page.getByRole("button", { name: /Built in production/ }).click();
    await expect(page.locator(".autos-row")).toHaveCount(real.length);
    // A real workflow names the platforms it ran on, the same way a reference one does.
    const w = workflows.find((x) => x.id === "social-content-engine")!;
    await expect(page.locator("[data-od-id='automation-row-social-content-engine'] .mark")).toHaveText(w.platforms.map(nameOf));
    await expect(page.locator("[data-od-id='automation-row-social-content-engine'] a", { hasText: "Walkthrough" })).toHaveAttribute("href", "/automations/social-content-engine/");
  });

  test("narrows to the workflows on one platform, and every row names its platforms", async ({ page }) => {
    await page.goto("/automations");
    const rows = page.locator(".autos-row");
    // One button per platform, and one for all of them.
    await expect(page.locator("[data-od-id='automation-platforms'] button")).toHaveCount(platforms.length + 1);

    const shopify = workflows.filter((w) => w.platforms.includes("shopify"));
    expect(shopify.length).toBeGreaterThan(0);
    const button = page.getByRole("group", { name: "Filter by platform" }).getByRole("button", { name: /Shopify/ });
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(rows).toHaveCount(shopify.length);
    await button.click();
    await expect(rows).toHaveCount(workflows.length);

    const w = workflows.find((x) => x.id === "refund-approval")!;
    await expect(page.locator("[data-od-id='automation-row-refund-approval'] .mark")).toHaveText(w.platforms.map(nameOf));
    await expect(page.locator("[data-od-id='automation-row-block-dedupe']")).toContainText("Logic only");
  });

  test("every row links to its source, and to a walkthrough where one exists", async ({ page }) => {
    await page.goto("/automations");
    const block = page.locator("[data-od-id='automation-row-block-dedupe']");
    await expect(block.locator("a")).toHaveCount(1);
    await expect(block.locator("a")).toHaveAttribute("href", /github\.com\/kimjoshuadr\/n8n-workflows\/blob\/main\/blocks\/lists\/block-dedupe\.json/);
    const flagship = page.locator("[data-od-id='automation-row-payment-reconcile']");
    await expect(flagship.locator("a", { hasText: "Walkthrough" })).toHaveAttribute("href", "/automations/payments/#payment-reconcile");
  });
});

test.describe("automation pages", () => {
  test("a system page shows every workflow with its steps and tested behaviours", async ({ page, isMobile }) => {
    const errors = watchForErrors(page);
    await page.goto("/automations/payments");
    const system = catalog.systems.find((s) => s.id === "payments")!;
    await expect(page.locator("h1")).toHaveText("Payments");
    await expect(page.locator(".autos-wf")).toHaveCount(system.workflows.length);
    for (const id of system.workflows) {
      const w = workflows.find((x) => x.id === id)!;
      const section = page.locator(`#${id}`);
      await expect(section.locator(".autos-tests li")).toHaveCount(w.tests.length);
      await expect(section.locator(".autos-steps li")).toHaveCount(w.story.length);
    }
    // One graph per workflow: the lead scrubbed, the rest playing in place.
    await expect(page.locator("[data-od-id='automation-graph']")).toHaveCount(system.workflows.length);
    if (!isMobile) {
      await expect(page.locator(".auto--scrub")).toHaveCount(1);
      await expect(page.locator(".auto--auto")).toHaveCount(system.workflows.length - 1);
    }
    await expect(page.getByText(REFERENCE_NOTE).first()).toBeVisible();
    await expect(page.getByText(REAL_NOTE)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("an AI system is one canvas: its agents, their parts and its sections", async ({ page, isMobile }) => {
    const errors = watchForErrors(page);
    const system = catalog.systems.find((s) => s.id === "ai-sales-team")!;
    const w = workflows.find((x) => x.id === system.workflows[0])!;
    expect(system.workflows).toHaveLength(1);
    expect(w.nodeCount).toBeGreaterThanOrEqual(100);
    await page.goto("/automations/ai-sales-team");
    await expect(page.locator("h1")).toHaveText(system.name);
    await expect(page.locator("[data-od-id='automation-runs-on'] .mark")).toHaveText(platforms.filter((p) => w.platforms.includes(p.id)).map((p) => p.name));
    await expect(page.locator(".autos-sections li")).toHaveCount(w.graph.sections.length);
    await expect(page.locator(".autos-steps li")).toHaveCount(w.story.length);
    if (!isMobile) {
      const frame = page.locator(".auto--scrub .auto-frame");
      await expect(frame.locator(".auto-node")).toHaveCount(w.graph.nodes.length);
      await expect(frame.locator(".auto-node--agent")).toHaveCount(w.graph.nodes.filter((n) => n.kind === "agent").length);
      await expect(frame.locator(".auto-wire--part")).toHaveCount(w.graph.edges.filter((e) => "part" in e && e.part).length);
      await expect(frame.locator(".auto-band")).toHaveCount(w.graph.sections.length);
    }
    expect(errors).toEqual([]);
  });

  test("a system that ran in production says so, and shows its canvas in the original's sections", async ({ page, isMobile }) => {
    const errors = watchForErrors(page);
    const system = catalog.systems.find((s) => s.id === "newsletter-drafting")!;
    const w = workflows.find((x) => x.id === system.workflows[0])!;
    await page.goto("/automations/newsletter-drafting");
    await expect(page.locator("h1")).toHaveText(system.name);
    await expect(page.locator("header .eyebrow")).toHaveText("Built in production");
    await expect(page.locator("header .rail-index")).toHaveText(REAL_NOTE);
    await expect(page.getByText(REFERENCE_NOTE)).toHaveCount(0);
    await expect(page.locator("[data-od-id='automation-runs-on'] .mark")).toHaveText(platforms.filter((p) => w.platforms.includes(p.id)).map((p) => p.name));
    await expect(page.locator(".autos-sections li")).toHaveCount(w.graph.sections.length);
    await expect(page.locator(".autos-steps li")).toHaveCount(w.story.length);
    if (!isMobile) {
      const frame = page.locator(".auto--scrub .auto-frame");
      await expect(frame.locator(".auto-node")).toHaveCount(w.graph.nodes.length);
      await expect(frame.locator(".auto-band")).toHaveCount(w.graph.sections.length);
    }
    expect(errors).toEqual([]);
  });

  test("a single workflow that ran in production has a page with the same label", async ({ page }) => {
    await page.goto("/automations/unified-event-api");
    const w = workflows.find((x) => x.id === "unified-event-api")!;
    await expect(page.locator("h1")).toHaveText("Unified event API");
    await expect(page.locator("header .rail-index")).toHaveText(REAL_NOTE);
    await expect(page.locator(".autos-tests li")).toHaveCount(w.tests.length);
    await expect(page.locator("a", { hasText: "Workflow source on GitHub" })).toHaveAttribute("href", /production\/operations\/unified-event-api\.json$/);
  });

  test("the scroll walks the lead workflow from its first step to the whole graph", async ({ page, isMobile }) => {
    test.skip(isMobile, "the phone has no pinned walkthrough");
    await page.goto("/automations/lead-intake");
    const frame = page.locator(".auto--scrub .auto-frame");
    const captions = frame.locator(".auto-caption");
    await expect(captions.first()).toBeVisible();
    const nodes = frame.locator(".auto-node");
    const lit = () => nodes.evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) > 0.9).length);
    const total = await nodes.count();
    expect(await lit()).toBeLessThan(total);

    // Wheel through the whole runway; Lenis owns the scroller.
    const runway = page.locator(".auto-run");
    for (let i = 0; i < 400; i++) {
      const left = await runway.evaluate((el) => el.getBoundingClientRect().bottom - window.innerHeight);
      if (left <= 4) break;
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(1500);
    expect(await lit()).toBe(total);
    await expect(frame.locator(".auto-finale")).toBeVisible();
    await expect(captions.first()).toBeHidden();
  });

  test("a production workflow has a page of its own", async ({ page }) => {
    await page.goto("/automations/refund-approval");
    const w = workflows.find((x) => x.id === "refund-approval")!;
    await expect(page.locator("h1")).toHaveText("Refund requests");
    await expect(page.locator(".autos-tests li")).toHaveCount(w.tests.length);
    await expect(page.locator("a", { hasText: "Workflow source on GitHub" })).toHaveAttribute("href", /refund-approval\.json$/);
  });

  test("with motion reduced, every step is shown still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/automations/lead-intake");
    const lead = workflows.find((w) => w.id === "lead-capture")!;
    const graph = page.locator("[data-od-id='automation-graph']").first();
    await expect(graph).toHaveClass(/auto--compact/);
    await expect(graph.locator(".auto-step")).toHaveCount(lead.story.length);
    await expect(page.locator(".auto-run")).toHaveCount(0);
    for (const step of await graph.locator(".auto-step").all()) await expect(step).toHaveCSS("opacity", "1");
  });

  test("an unknown automation is a 404", async ({ page }) => {
    const res = await page.goto("/automations/not-a-real-one");
    expect(res?.status()).toBe(404);
  });
});
