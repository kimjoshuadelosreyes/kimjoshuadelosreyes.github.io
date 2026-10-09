import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/site";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import WorkflowDiagram from "@/components/WorkflowDiagram";
import {
  TESTIMONIALS,
  WORK_SEQUENCE,
  caseStudyPath,
  findProject,
  neighboursOf,
} from "@/lib/content";

/**
 * A page per project, so the dolly's plates and its caption have somewhere real
 * to point.
 */

export function generateStaticParams() {
  return WORK_SEQUENCE.map((p) => ({ id: p.id }));
}

// A static export can only serve the pages it was built with.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = findProject(id);
  if (!project) return {};
  const path = `/work/${project.id}/`;
  return {
    title: `${project.name} — ${project.tag}`,
    description: project.copy,
    alternates: { canonical: path },
    openGraph: { type: "article", title: `${project.name} — ${project.tag}`, description: project.copy, url: path },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = findProject(id);
  if (!project) notFound();

  const { prev, next } = neighboursOf(project.id);
  const quote = project.testimonial
    ? TESTIMONIALS.find((t) => t.id === project.testimonial)
    : undefined;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/#work" },
          { name: project.name, path: `/work/${project.id}/` },
        ])}
      />
      <Nav />
      <main className="pt-[76px]">
        <article data-od-id={`case-${project.id}`}>
          <header className="shell rail pt-[clamp(44px,6vw,88px)] pb-[clamp(26px,3.5vw,52px)]">
            <div>
              <Link href="/#work" className="case-back">
                <span aria-hidden="true">←</span> All work
              </Link>
              <p className="eyebrow mt-[20px]">{project.tag}</p>
            </div>
            <div>
              <h1 className="h2">{project.name}</h1>
              <p className="lede mt-[clamp(16px,2vw,26px)]">{project.copy}</p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] uppercase tracking-[0.06em] text-brown mr-1">Stack:</span>
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-ink border border-hairline"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="shell">
            <figure
              className="case-plate"
              /* The padding is viewport-relative, so the panel has to allow for
                 it to end up exactly as wide as the screen it wraps. */
              style={{ maxWidth: `calc(${project.w}px + 2 * clamp(16px, 2.2vw, 44px))` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.img}
                width={project.w}
                height={project.h}
                alt={`${project.name} — project screen`}
                /* Capped at its own width: three of these sources are small
                   logos, and blowing them up would only make them soft. */
                style={{ maxWidth: project.w }}
              />
            </figure>
          </div>

          {/* Quantifiable ROI / Metrics Grid for AI & Impactful Projects */}
          {project.metrics && project.metrics.length > 0 && (
            <section className="shell rail py-[clamp(40px,5vw,72px)] border-t border-hairline">
              <div>
                <p className="eyebrow text-electric">Impact & Proof</p>
                <p className="mt-2 text-[13px] leading-[1.5] text-brown max-w-[20ch]">
                  Quantifiable performance gains and operational efficiencies delivered.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-hairline bg-surface/90 p-5 shadow-xs"
                  >
                    <div className="font-display text-[clamp(28px,3vw,38px)] font-bold leading-none text-ink">
                      {m.value}
                    </div>
                    <div className="mt-2 text-[13px] font-semibold text-ink">
                      {m.label}
                    </div>
                    {m.detail && (
                      <div className="mt-1 text-[12px] leading-[1.4] text-muted">
                        {m.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workflow Architecture Pipeline */}
          {project.workflow && (
            <WorkflowDiagram workflow={project.workflow} />
          )}

          {quote && (
            <section className="shell rail py-[clamp(48px,7vw,104px)]">
              <div>
                <p className="eyebrow">Client</p>
              </div>
              <figure className="case-quote">
                <blockquote>&ldquo;{quote.quote}&rdquo;</blockquote>
                <figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={quote.face} alt="" width={44} height={44} />
                  <span>
                    <span className="case-quote__name">{quote.name}</span>
                    <span className="case-quote__role">{quote.role}</span>
                  </span>
                </figcaption>
              </figure>
            </section>
          )}

          <nav className="shell rail case-nav" aria-label="More work">
            <div>
              <p className="eyebrow">Keep going</p>
            </div>
            <div className="case-nav__row">
              {prev && (
                <Link href={caseStudyPath(prev.id)} className="case-nav__link">
                  <span className="case-nav__dir">Previous</span>
                  <span className="case-nav__name">{prev.name}</span>
                </Link>
              )}
              {next && (
                <Link
                  href={caseStudyPath(next.id)}
                  className="case-nav__link case-nav__link--next"
                >
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
