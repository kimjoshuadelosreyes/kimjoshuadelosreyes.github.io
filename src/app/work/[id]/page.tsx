import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/site";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icons";
import {
  WORK_SEQUENCE,
  caseStudyPath,
  findProject,
  neighboursOf,
  quoteForProject,
  shotsOf,
} from "@/lib/content";

/**
 * A page per project: what it is, what was built, the screens, and what the
 * client said where they said something.
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
  const quote = quoteForProject(project.id);

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

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost mt-6 inline-flex min-h-[44px] items-center gap-2 px-5 text-[14px]"
                >
                  <span>Visit {new URL(project.liveUrl).hostname.replace(/^www\./, "")}</span>
                  <Icon name="arrow" className="arrow-ic" />
                </a>
              )}
            </div>
          </header>

          <div className="shell">
            <div className="case-shots">
              {shotsOf(project.id).map((s) => (
                <figure key={s.device} className={`case-shot case-shot--${s.device.toLowerCase()}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    width={s.w}
                    height={s.h}
                    loading={s.device === "Desktop" ? "eager" : "lazy"}
                    alt={`${project.name} on a ${s.device.toLowerCase()} screen`}
                  />
                  <figcaption>{s.device}</figcaption>
                </figure>
              ))}
            </div>
            {project.local && (
              <p className="case-shots__note">
                This project has no public address yet, so these screens are from a local build.
              </p>
            )}
          </div>

          <section className="shell rail py-[clamp(40px,5vw,72px)]">
            <div>
              <p className="eyebrow">The project</p>
            </div>
            <div className="case-about">
              {project.about.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </section>

          <section className="shell rail pb-[clamp(40px,5vw,72px)]">
            <div>
              <p className="eyebrow">What I built</p>
            </div>
            <ul className="case-parts">
              {project.built.map((b) => (
                <li key={b.title} className="case-part">
                  <h3>{b.title}</h3>
                  <p>{b.copy}</p>
                </li>
              ))}
            </ul>
          </section>

          {project.notes && project.notes.length > 0 && (
            <section className="shell rail pb-[clamp(40px,5vw,72px)]">
              <div>
                <p className="eyebrow">What made it different</p>
              </div>
              <ul className="case-parts">
                {project.notes.map((n) => (
                  <li key={n.title} className="case-part">
                    <h3>{n.title}</h3>
                    <p>{n.copy}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {quote && (
            <section className="shell rail py-[clamp(48px,7vw,104px)]">
              <div>
                <p className="eyebrow">Client</p>
              </div>
              <figure className="case-quote">
                <blockquote>&ldquo;{quote.quote}&rdquo;</blockquote>
                <figcaption>
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
