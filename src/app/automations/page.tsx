import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icons";
import Ask from "@/components/Ask";
import AutomationCatalogue, { type CatalogueRow } from "@/components/AutomationCatalogue";
import { breadcrumbLd } from "@/lib/site";
import { LIBRARY, PLATFORMS, SOURCE_NOTES, TRIGGER_LABELS, WORKFLOWS, fileUrl, isProduction, marksOf, pageOf } from "@/lib/automations";

/**
 * The automation library: every workflow, searchable.
 */

const description = `${LIBRARY.workflows} open-source n8n workflows on ${LIBRARY.platforms} named platforms: ${LIBRARY.production} built and run in production, then reference systems, workflows and building blocks, each run and tested against a real n8n.`;

export const metadata: Metadata = {
  title: "Automation library",
  description,
  alternates: { canonical: "/automations/" },
  openGraph: { title: "Automation library", description, url: "/automations/" },
};

/** The groups the list is shown in. Work that ran in production is its own group, and comes first. */
const TIERS = [
  { id: "real", label: "Built in production", note: "Workflows I built and ran in production, rebuilt here so the logic can be read. Node names, order, branches and loops follow the original canvases. What is inside each node was written again, every business name is a placeholder, and they run here on test data." },
  { id: "flagship", label: "Reference systems", note: "Written for this library. Each runs one part of a business: four multi-agent AI systems built as one large canvas each, and eight systems of several workflows. Each has a step-by-step walkthrough." },
  { id: "production", label: "Reference workflows", note: "Written for this library. One job each, hardened the same way. Each has a walkthrough." },
  { id: "block", label: "Building blocks", note: "Written for this library. One idea each, meant to be called from another workflow or copied into one. These link straight to their source." },
];

export default function AutomationsPage() {
  const rows: CatalogueRow[] = [...WORKFLOWS.filter(isProduction), ...WORKFLOWS.filter((w) => !isProduction(w))].map((w) => ({
    id: w.id,
    name: w.name,
    tier: isProduction(w) ? "real" : w.tier,
    category: w.category,
    summary: w.summary,
    trigger: TRIGGER_LABELS[w.trigger] ?? w.trigger,
    platforms: marksOf(w.platforms),
    nodes: w.nodeCount,
    behaviours: w.tests.length,
    href: pageOf(w),
    source: fileUrl(w),
  }));

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Automation library", path: "/automations/" }])} />
      <Nav />
      <main className="min-h-screen bg-canvas pt-[76px]">
        <header className="shell rail pt-[clamp(44px,6vw,88px)] pb-[clamp(26px,3.5vw,52px)]">
          <div>
            <Link href="/#automations" className="case-back">
              <span aria-hidden="true">←</span> Overview
            </Link>
            <p className="eyebrow mt-[20px]">The automation library</p>
            <p className="rail-index">{LIBRARY.production} from production · {LIBRARY.workflows - LIBRARY.production} reference builds</p>
          </div>
          <div>
            <h1 className="h2">
              {LIBRARY.workflows} workflows,
              <br />
              {LIBRARY.behaviours} tested behaviours.
            </h1>
            <p className="lede mt-[clamp(16px,2vw,26px)]">
              Every workflow here is open source, written as code, and built from each platform&rsquo;s own n8n node.
              Each is run against n8n {LIBRARY.n8n} with a stand-in answering for every platform, and the tests cover
              what goes wrong as well as what goes right.
            </p>
            <p className="mt-4 max-w-[62ch] text-[14.5px] leading-[1.6] text-muted">
              The first {LIBRARY.production} were built and run in production. They are rebuilt here from the original
              canvases, with no client names or data, and are labelled &ldquo;{SOURCE_NOTES.production}&rdquo;. The
              rest are reference builds, written for this library to show how I build. Any of them can be adapted to
              your tools.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={LIBRARY.repo} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                Open the repository
                <Icon name="arrow" className="arrow-ic" />
              </a>
              <Ask as="button" subject="I want an automation like the ones in your library" id="catalogue-cta">
                Start a project
              </Ask>
            </div>
          </div>
        </header>

        <section className="shell pb-[clamp(60px,8vw,120px)]">
          <AutomationCatalogue rows={rows} tiers={TIERS} platforms={PLATFORMS.map(({ id, name, icon, workflows }) => ({ id, name, icon, workflows }))} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
