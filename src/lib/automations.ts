import catalog from "./automations.generated.json";

/**
 * The automation library, as the site reads it.
 *
 * Everything here comes from `automations.generated.json`, which is copied from
 * the library's own build (`scripts/sync-automations.cjs`). Nothing about a
 * workflow is typed in this repository, so the site cannot say a workflow does
 * something its tests do not.
 *
 * Import this from server components only: the catalogue is large, and a client
 * component should be handed the few fields it draws.
 */

/** `platform` is set on a node that is a platform's own n8n node. */
export type GraphNode = { id: string; kind: string; platform?: string; x: number; y: number };
/** `part` is set on the wire from a model, tool, memory or output shape up to the agent that uses it. */
export type GraphEdge = { from: string; to: string; out: number; part?: string };
/** A large canvas is laid out in titled sections. */
export type GraphSection = { title: string; note?: string; nodes: string[] };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[]; sections?: GraphSection[] };
export type StoryStep = { title: string; copy: string; nodes: string[] };

export type Tier = "flagship" | "production" | "block";

export type Workflow = {
  id: string;
  name: string;
  tier: Tier;
  system: string | null;
  category: string;
  kind: string | null;
  summary: string;
  /** "reference": written for the library. "production": rebuilt from a workflow that ran in production. Both run on test data. */
  source: "reference" | "production";
  trigger: string;
  /** Ids of the platforms this workflow has a node for, in the order it reaches them. */
  platforms: string[];
  calls: string[];
  folder: string;
  nodeCount: number;
  tests: string[];
  story: StoryStep[];
  graph: Graph;
};

export type System = {
  id: string;
  name: string;
  folder: string;
  line: string;
  problem: string;
  outcome: string;
  workflows: string[];
};

/** A platform as the site shows it: its name, what it is used for here, and its mark under /platforms. */
export type Platform = { id: string; name: string; job: string; icon: string; workflows: number };
export type PlatformMark = Pick<Platform, "id" | "name" | "icon">;

export const WORKFLOWS = catalog.workflows as Workflow[];
export const PLATFORMS: Platform[] = Object.entries(catalog.platforms as Record<string, Omit<Platform, "id">>)
  .map(([id, p]) => ({ id, ...p }))
  .filter((p) => p.workflows > 0);

/** The marks for a list of platform ids, for handing to a client component. */
export const marksOf = (ids: string[]): PlatformMark[] =>
  ids.map((id) => PLATFORMS.find((p) => p.id === id)).filter((p): p is Platform => !!p).map(({ id, name, icon }) => ({ id, name, icon }));

/** Every platform a set of workflows touches, in the catalogue's order. */
export const platformsAcross = (list: Workflow[]): PlatformMark[] => marksOf(PLATFORMS.filter((p) => list.some((w) => w.platforms.includes(p.id))).map((p) => p.id));

/** Rebuilt from a workflow that was built and run in production. */
export const isProduction = (w: Pick<Workflow, "source">) => w.source === "production";

/** How a build is labelled wherever it is shown. Never typed anywhere else. */
export const SOURCE_NOTES = {
  production: "Built and run in production · rebuilt here on test data",
  reference: "Reference build · run on test data",
} as const;
export const noteOf = (list: Pick<Workflow, "source">[]) => (list.some(isProduction) ? SOURCE_NOTES.production : SOURCE_NOTES.reference);

/** The four systems that are one large multi-agent canvas each. */
export const isAiSystem = (id: string) => id.startsWith("ai-");
export const SYSTEMS = catalog.systems as System[];

export const LIBRARY = {
  repo: catalog.repo,
  n8n: catalog.tested.n8n,
  workflows: WORKFLOWS.length,
  systems: SYSTEMS.length,
  production: WORKFLOWS.filter(isProduction).length,
  platforms: PLATFORMS.length,
  largest: Math.max(...WORKFLOWS.map((w) => w.nodeCount)),
  behaviours: WORKFLOWS.reduce((n, w) => n + w.tests.length, 0),
} as const;

export const TIER_LABELS: Record<Tier, string> = {
  flagship: "Flagship systems",
  production: "Single-purpose workflows",
  block: "Building blocks",
};

export const TRIGGER_LABELS: Record<string, string> = {
  webhook: "Webhook",
  formTrigger: "Form",
  telegramTrigger: "Telegram message",
  rssFeedReadTrigger: "RSS feed",
  scheduleTrigger: "Schedule",
  manualTrigger: "Manual run",
  executeWorkflowTrigger: "Called by a workflow",
  errorTrigger: "Any workflow failing",
  typeformTrigger: "Typeform response",
  stripeTrigger: "Stripe event",
  shopifyTrigger: "Shopify event",
  calendlyTrigger: "Calendly booking",
  gmailTrigger: "Gmail message",
  zendeskTrigger: "Zendesk ticket",
  slackTrigger: "Slack message",
  discordTrigger: "Discord event",
  chatTrigger: "Chat message",
};

/** "Lead intake · Capture and qualify" is shown as "Capture and qualify" under its system. */
export const shortName = (w: Pick<Workflow, "name">) => w.name.split(" · ").slice(1).join(" · ") || w.name;

export const findWorkflow = (id: string) => WORKFLOWS.find((w) => w.id === id);
export const findSystem = (id: string) => SYSTEMS.find((s) => s.id === id);
export const workflowsOf = (system: System) => system.workflows.map((id) => findWorkflow(id)!).filter(Boolean);

export const sourceUrl = (folder: string) => `${LIBRARY.repo}/tree/main/${folder}`;
export const fileUrl = (w: Pick<Workflow, "folder" | "id">) => `${LIBRARY.repo}/blob/main/${w.folder}/${w.id}.json`;

/**
 * The pages under /automations: one per flagship system, one per production
 * workflow. Building blocks are rows in the catalogue that link to their source.
 * One list, so a card can never point at a page that was not built.
 */
export type AutomationPage = { id: string; kind: "system" | "workflow"; name: string; line: string };
export const AUTOMATION_PAGES: AutomationPage[] = [
  ...SYSTEMS.map((s): AutomationPage => ({ id: s.id, kind: "system", name: s.name, line: s.line })),
  // Work that ran in production comes before the reference builds, here as everywhere.
  ...[...WORKFLOWS.filter((w) => w.tier === "production" && isProduction(w)), ...WORKFLOWS.filter((w) => w.tier === "production" && !isProduction(w))].map((w): AutomationPage => ({ id: w.id, kind: "workflow", name: w.name, line: w.summary })),
];

export const automationPath = (id: string) => `/automations/${id}`;

/** Where a workflow is shown on this site, if it is. */
export function pageOf(w: Workflow): string | null {
  if (w.tier === "production") return automationPath(w.id);
  if (w.system) return `${automationPath(w.system)}#${w.id}`;
  return null;
}

export function neighboursOfPage(id: string) {
  const i = AUTOMATION_PAGES.findIndex((p) => p.id === id);
  if (i < 0) return { prev: undefined, next: undefined };
  const n = AUTOMATION_PAGES.length;
  return { prev: AUTOMATION_PAGES[(i - 1 + n) % n], next: AUTOMATION_PAGES[(i + 1) % n] };
}

/** The section's copy. Counts are worked out from the catalogue, never typed. */
export const AUTOMATIONS = {
  eyebrow: "The automations",
  titleLines: ["Built for the day", "something breaks."],
  lede: `An open library of ${LIBRARY.workflows} n8n workflows on ${LIBRARY.platforms} named platforms. It opens with ${LIBRARY.production} that were built and run in production, rebuilt here so the logic can be read, and goes on to reference builds from single blocks to multi-agent AI systems of ${LIBRARY.largest} nodes. Each one is run against a real n8n and tested for what goes wrong: the webhook that arrives twice, the API that is down, the model that replies with nonsense.`,
  aside: "Anyone can show the path where everything works. These show the other paths too.",
  note: SOURCE_NOTES.reference,
  facts: [
    { value: String(LIBRARY.production), label: "built and run in production" },
    { value: String(LIBRARY.workflows), label: "workflows, open source" },
    { value: String(LIBRARY.behaviours), label: "tested behaviours" },
    { value: String(LIBRARY.platforms), label: "platforms, each with its own node" },
  ],
} as const;
