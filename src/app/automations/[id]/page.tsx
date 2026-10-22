import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icons";
import Ask from "@/components/Ask";
import AutomationGraph from "@/components/AutomationGraph";
import PlatformMarks from "@/components/PlatformMarks";
import { breadcrumbLd, SITE } from "@/lib/site";
import {
  AUTOMATION_PAGES,
  LIBRARY,
  TRIGGER_LABELS,
  type Workflow,
  automationPath,
  fileUrl,
  findSystem,
  findWorkflow,
  isAiSystem,
  isProduction,
  noteOf,
  marksOf,
  neighboursOfPage,
  platformsAcross,
  shortName,
  sourceUrl,
  workflowsOf,
} from "@/lib/automations";
import { caseStudyOf } from "@/lib/case-studies";

/**
 * A page per flagship system, and a page per production workflow.
 *
 * A system page walks through its lead workflow with the scroll, then shows
 * each of the others playing on its own. An AI system is one canvas, so its
 * page is that canvas walked through section by section. Everything on it comes from the
 * library's catalogue: the steps, the diagram and the list of tested
 * behaviours are the library's own.
 */

export function generateStaticParams() {
  return AUTOMATION_PAGES.map((p) => ({ id: p.id }));
}

// A static export can only serve the pages it was built with.
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = AUTOMATION_PAGES.find((p) => p.id === id);
  if (!page) return {};
  const title = `${page.name} — n8n automation`;
  const path = `/automations/${page.id}/`;
  return {
    title,
    description: page.line,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description: page.line,
      url: path,
      siteName: `${SITE.name} — ${SITE.brand}`,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: `${page.name} automation architecture`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.line,
      images: ["/opengraph-image.png"],
    },
  };
}

function Facts({ w }: { w: Workflow }) {
  return (
    <dl className="autos-facts-list">
      <dt>Starts from</dt>
      <dd>{TRIGGER_LABELS[w.trigger] ?? w.trigger}</dd>
      <dt>Platforms</dt>
      <dd>{w.platforms.length ? <PlatformMarks marks={marksOf(w.platforms)} label={`Platforms ${w.name} connects to`} /> : "None: logic only"}</dd>
      {w.calls.length > 0 && (
        <>
          <dt>Leans on</dt>
          <dd>{w.calls.map((c) => shortName(findWorkflow(c) ?? { name: c })).join(", ")}</dd>
        </>
      )}
      <dt>Size</dt>
      <dd>
        {w.nodeCount} nodes · {w.tests.length} tested behaviours
      </dd>
    </dl>
  );
}

function Tested({ w }: { w: Workflow }) {
  return (
    <div>
      <p className="eyebrow mb-[14px]">Tested behaviour</p>
      <ul className="autos-tests">
        {w.tests.map((t) => (
          <li key={t}>{t[0].toUpperCase() + t.slice(1)}</li>
        ))}
      </ul>
      <a href={fileUrl(w)} target="_blank" rel="noopener noreferrer" className="ask-cta mt-[22px] inline-flex">
        Workflow source on GitHub
        <Icon name="arrow" className="arrow-ic" />
      </a>
    </div>
  );
}

function Steps({ w }: { w: Workflow }) {
  return (
    <ol className="autos-steps">
      {w.story.map((s) => (
        <li key={s.title}>
          <b>{s.title}</b>
          <span>{s.copy}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function AutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = AUTOMATION_PAGES.find((p) => p.id === id);
  if (!page) notFound();

  const system = page.kind === "system" ? findSystem(page.id) : undefined;
  const single = page.kind === "workflow" ? findWorkflow(page.id) : undefined;
  const list = system ? workflowsOf(system) : single ? [single] : [];
  if (!list.length) notFound();
  const lead = list[0];
  const { prev, next } = neighboursOfPage(page.id);
  const behaviours = list.reduce((n, w) => n + w.tests.length, 0);
  const ai = !!system && isAiSystem(system.id);
  const real = list.some(isProduction);
  const note = noteOf(list);
  const study = caseStudyOf(page.id);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Automation library", path: "/automations/" },
          { name: page.name, path: `/automations/${page.id}/` },
        ])}
      />
      <Nav />
      <main className="pt-[76px]">
        <article data-od-id={`automation-${page.id}`}>
          <header className="shell rail pt-[clamp(44px,6vw,88px)] pb-[clamp(30px,4vw,60px)]">
            <div>
              <Link href="/automations" className="case-back">
                <span aria-hidden="true">←</span> All automations
              </Link>
              <p className="eyebrow mt-[20px]">{real ? "Built in production" : ai ? "Multi-agent AI system" : system ? "Flagship system" : lead.category}</p>
              <p className="rail-index">{note}</p>
            </div>
            <div>
              <h1 className="h2">{system ? system.name : shortName(lead)}</h1>
              <p className="lede mt-[clamp(16px,2vw,26px)]">{system ? system.line : lead.summary}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={sourceUrl(lead.folder)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                  Source and tests on GitHub
                  <Icon name="arrow" className="arrow-ic" />
                </a>
                <span className="text-[13.5px] text-muted">
                  {list.length > 1 ? `${list.length} workflows · ` : `${lead.nodeCount} nodes · `}
                  {behaviours} tested behaviours · n8n {LIBRARY.n8n}
                </span>
              </div>
            </div>
          </header>

          <section className="shell rail pb-[clamp(30px,3.6vw,54px)]" data-od-id="automation-runs-on">
            <div>
              <p className="eyebrow">Runs on</p>
            </div>
            <PlatformMarks marks={platformsAcross(list)} label={`Platforms ${page.name} runs on`} />
          </section>

          {system && (
            <section className="shell rail pb-[clamp(36px,4.6vw,70px)]">
              <div>
                <p className="eyebrow">Why it exists</p>
              </div>
              <ul className="case-parts">
                <li className="case-part">
                  <h3>The problem</h3>
                  <p>{system.problem}</p>
                </li>
                <li className="case-part">
                  <h3>What this does about it</h3>
                  <p>{system.outcome}</p>
                </li>
              </ul>
            </section>
          )}

          {study && (
            <div data-od-id="case-study">
              {study.sections.map((sec) => (
                <section key={sec.title} className="shell rail pb-[clamp(30px,3.6vw,54px)]">
                  <div>
                    <p className="eyebrow">{sec.title}</p>
                  </div>
                  <div>
                    <p className="lede mb-[clamp(16px,2vw,26px)]">{sec.intro}</p>
                    <ul className="case-parts">
                      {sec.items.map((it) => (
                        <li key={it.title} className="case-part">
                          <h3>{it.title}</h3>
                          <p>{it.copy}</p>
                          {it.test && <p className="case-evidence">Tested: {it.test}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* The lead workflow, walked through. On a system page the scroll
              drives it; a single workflow plays where it stands. */}
          <AutomationGraph
            mode={system ? "scrub" : "auto"}
            graph={lead.graph}
            story={lead.story}
            platforms={marksOf(lead.platforms)}
            title={lead.name}
            note={note}
          />

          <div className="shell">
            {list.map((w, i) => (
              <section key={w.id} id={w.id} className="autos-wf rail" data-od-id={`workflow-${w.id}`} style={i === 0 ? { borderTop: 0 } : undefined}>
                <div>
                  <p className="eyebrow">{system && list.length > 1 ? `Workflow ${i + 1} of ${list.length}` : system ? "The canvas" : "The workflow"}</p>
                </div>
                <div className="grid gap-[clamp(26px,3vw,44px)]">
                  <div>
                    <h2>{system ? shortName(w) : "How it runs"}</h2>
                    {system && <p className="lede mt-[14px]">{w.summary}</p>}
                    {system && (w.graph.sections?.length ?? 0) > 0 && (
                      <ol className="autos-sections">
                        {(w.graph.sections ?? []).map((sec) => (
                          <li key={sec.title}>
                            <b>{sec.title}</b>
                            <span>{sec.nodes.length} nodes</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                  <Facts w={w} />
                  <Steps w={w} />
                  <Tested w={w} />
                </div>
                {i > 0 && (
                  <div className="lg:col-span-2 -mx-[var(--gutter)] mt-[clamp(20px,2.4vw,36px)]">
                    <AutomationGraph mode="auto" graph={w.graph} story={w.story} platforms={marksOf(w.platforms)} title={w.name} note={note} />
                  </div>
                )}
              </section>
            ))}

            <div className="section-ask mb-[clamp(48px,6vw,90px)]">
              <p>Want this running behind your business?</p>
              <Ask as="button" subject={`I want something like your ${page.name.toLowerCase()} automation`} id="automation-cta">
                Start a project
              </Ask>
            </div>
          </div>

          <nav className="shell rail case-nav" aria-label="More automations">
            <div>
              <p className="eyebrow">Keep going</p>
            </div>
            <div className="case-nav__row">
              {prev && (
                <Link href={automationPath(prev.id)} className="case-nav__link">
                  <span className="case-nav__dir">Previous</span>
                  <span className="case-nav__name">{prev.name}</span>
                </Link>
              )}
              {next && (
                <Link href={automationPath(next.id)} className="case-nav__link case-nav__link--next">
                  <span className="case-nav__dir">Next</span>
                  <span className="case-nav__name">{next.name}</span>
                </Link>
              )}
            </div>
          </nav>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
