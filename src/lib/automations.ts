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

export type GraphNode = { id: string; kind: string; service?: string; x: number; y: number };
export type GraphEdge = { from: string; to: string; out: number };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };
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
  /** "reference": written for the library and run on test data. "client": a real, sanitised build. */
  source: "reference" | "client";
  trigger: string;
  integrations: string[];
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

export const WORKFLOWS = catalog.workflows as Workflow[];
export const SYSTEMS = catalog.systems as System[];

export const LIBRARY = {
  repo: catalog.repo,
  n8n: catalog.tested.n8n,
  workflows: WORKFLOWS.length,
  systems: SYSTEMS.length,
  behaviours: WORKFLOWS.reduce((n, w) => n + w.tests.length, 0),
} as const;

export const TIER_LABELS: Record<Tier, string> = {
  flagship: "Flagship systems",
  production: "Production workflows",
  block: "Building blocks",
};

export const TRIGGER_LABELS: Record<string, string> = {
  webhook: "Webhook",
  scheduleTrigger: "Schedule",
  manualTrigger: "Manual run",
  executeWorkflowTrigger: "Called by a workflow",
  errorTrigger: "Any workflow failing",
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
  ...WORKFLOWS.filter((w) => w.tier === "production").map((w): AutomationPage => ({ id: w.id, kind: "workflow", name: w.name, line: w.summary })),
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
  lede: `An open library of ${LIBRARY.workflows} n8n workflows. Each one is run against a real n8n and tested for what goes wrong: the webhook that arrives twice, the API that is down, the model that replies with nonsense.`,
  aside: "Anyone can show the path where everything works. These show the other paths too.",
  note: "Reference build · run on test data",
  facts: [
    { value: String(LIBRARY.workflows), label: "workflows, open source" },
    { value: String(LIBRARY.behaviours), label: "tested behaviours" },
    { value: String(LIBRARY.systems), label: "complete systems" },
    { value: LIBRARY.n8n, label: "n8n version they last ran on" },
  ],
} as const;
