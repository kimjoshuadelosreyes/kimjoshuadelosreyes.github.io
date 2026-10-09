"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/Icons";
import { ARCHIVE_PROJECTS, ArchiveProject } from "@/lib/content";

export default function ArchivePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "ai-automation", label: "AI & Automations" },
    { id: "webflow", label: "Webflow Development" },
    { id: "enterprise", label: "Biotech & Enterprise" },
    { id: "saas", label: "SaaS & Web3" },
  ];

  const filtered = useMemo(() => {
    return ARCHIVE_PROJECTS.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.outcome.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <>
      <Nav />
      <main className="pt-[76px] min-h-screen bg-canvas">
        <header className="shell pt-[clamp(44px,6vw,84px)] pb-[clamp(28px,4vw,48px)]">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-brown transition-colors hover:text-electric mb-6"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Overview</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-electric">The Full Archive</p>
              <h1 className="h2 mt-2 font-display text-ink">Project Directory</h1>
              <p className="mt-3 text-[15px] leading-[1.6] text-muted max-w-[55ch]">
                A comprehensive record of 80+ custom Webflow builds, AI workflow automations, and enterprise client engagements.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-[320px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-brown/60">
                <Icon name="search" className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, stack (e.g. n8n)..."
                className="w-full rounded-full border border-hairline bg-surface py-2.5 pl-10 pr-4 text-[13.5px] text-ink placeholder:text-muted/60 focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[12px] text-muted hover:text-ink cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-hairline pb-6">
            {categories.map((c) => {
              const count =
                c.id === "all"
                  ? ARCHIVE_PROJECTS.length
                  : ARCHIVE_PROJECTS.filter((p) => p.category === c.id).length;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-electric text-white shadow-xs"
                      : "bg-surface text-ink hover:text-electric hover:border-brown/40 border border-hairline"
                  }`}
                >
                  <span>{c.label}</span>
                  <span
                    className={`text-[11px] ${
                      selectedCategory === c.id ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Directory Table */}
        <section className="shell pb-[clamp(60px,8vw,120px)]">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-surface/50 p-12 text-center">
              <p className="font-display text-[18px] text-ink">No matching projects found</p>
              <p className="mt-2 text-[14px] text-muted">
                Try searching for a different keyword or resetting your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-4 rounded-full bg-surface border border-hairline px-4 py-1.5 text-[13px] font-medium text-ink hover:text-electric cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-hairline text-[11.5px] font-semibold uppercase tracking-[0.06em] text-brown">
                    <th className="py-4 pr-6">Year</th>
                    <th className="py-4 pr-6">Project & Role</th>
                    <th className="py-4 pr-6 hidden sm:table-cell">Category</th>
                    <th className="py-4 pr-6 hidden md:table-cell">Tech Stack</th>
                    <th className="py-4 pr-4">Outcome</th>
                    <th className="py-4 pl-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filtered.map((item: ArchiveProject) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-surface/80"
                    >
                      <td className="py-4 pr-6 font-display text-[13px] text-muted whitespace-nowrap align-top">
                        {item.year}
                      </td>

                      <td className="py-4 pr-6 align-top">
                        <div className="font-display text-[16px] font-medium text-ink group-hover:text-electric transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[12.5px] text-muted mt-0.5">
                          {item.role}
                        </div>
                      </td>

                      <td className="py-4 pr-6 hidden sm:table-cell align-top whitespace-nowrap">
                        <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-[11.5px] font-medium text-brown border border-hairline">
                          {item.categoryLabel}
                        </span>
                      </td>

                      <td className="py-4 pr-6 hidden md:table-cell align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                          {item.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink border border-hairline/80"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top text-[13.5px] text-muted leading-[1.5] max-w-[360px]">
                        {item.outcome}
                      </td>

                      <td className="py-4 pl-4 text-right align-top whitespace-nowrap">
                        {item.link ? (
                          <Link
                            href={item.link}
                            className="inline-flex items-center gap-1 font-medium text-[13px] text-electric hover:underline"
                          >
                            <span>Case Study</span>
                            <Icon name="arrow" className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-[12px] text-muted/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
