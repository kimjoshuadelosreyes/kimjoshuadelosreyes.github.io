"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PlatformMark } from "@/lib/automations";
import Icon from "./Icons";
import PlatformMarks from "./PlatformMarks";

export type CatalogueRow = {
  id: string;
  name: string;
  tier: string;
  category: string;
  summary: string;
  trigger: string;
  platforms: PlatformMark[];
  nodes: number;
  behaviours: number;
  /** A page on this site, where the workflow has one. */
  href: string | null;
  source: string;
};

/**
 * The whole library as a list that can be searched and narrowed. Every row
 * links to the workflow's source; the ones with a walkthrough link to it too.
 */
export default function AutomationCatalogue({
  rows,
  tiers,
  platforms,
}: {
  rows: CatalogueRow[];
  /** Every platform in the library, for the filter. */
  platforms: (PlatformMark & { workflows: number })[];
  tiers: { id: string; label: string; note: string }[];
}) {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");

  const categories = useMemo(() => [...new Set(rows.map((r) => r.category))], [rows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter(
      (r) =>
        (tier === "all" || r.tier === tier) &&
        (category === "all" || r.category === category) &&
        (platform === "all" || r.platforms.some((p) => p.id === platform)) &&
        (!q || [r.name, r.summary, r.category, r.trigger, ...r.platforms.map((p) => p.name)].some((t) => t.toLowerCase().includes(q))),
    );
  }, [rows, search, tier, category, platform]);

  const pill = (active: boolean) =>
    `inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[13px] font-medium tracking-[0.01em] transition-all cursor-pointer ${
      active ? "bg-electric text-white shadow-xs" : "bg-surface text-ink hover:text-electric border border-hairline"
    }`;

  return (
    <div data-od-id="automation-catalogue">
      <div className="flex flex-col gap-5 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tier">
          {[{ id: "all", label: "Everything" }, ...tiers].map((t) => (
            <button key={t.id} type="button" aria-pressed={tier === t.id} onClick={() => setTier(t.id)} className={pill(tier === t.id)}>
              <span>{t.label}</span>
              <span className={`text-[11px] ${tier === t.id ? "text-white/85" : "text-muted"}`}>
                {t.id === "all" ? rows.length : rows.filter((r) => r.tier === t.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-[320px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-brown/60">
            <Icon name="search" className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search: refund, Shopify, agent..."
            aria-label="Search the workflows"
            className="w-full rounded-full border border-hairline bg-surface py-2.5 pl-10 pr-4 text-[14px] text-ink placeholder:text-muted/70 focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric transition-colors"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]" role="group" aria-label="Filter by area">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={`min-h-[32px] cursor-pointer border-b pb-[2px] transition-colors ${
              category === c ? "border-electric text-electric" : "border-transparent text-brown hover:text-electric"
            }`}
          >
            {c === "all" ? "All areas" : c}
          </button>
        ))}
      </div>

      <p className="eyebrow mt-[26px]">The {platforms.length} platforms</p>
      <div className="autos-platforms" role="group" aria-label="Filter by platform" data-od-id="automation-platforms">
        <button type="button" aria-pressed={platform === "all"} onClick={() => setPlatform("all")} className="autos-platform">
          All platforms
        </button>
        {platforms.map((p) => (
          <button key={p.id} type="button" aria-pressed={platform === p.id} onClick={() => setPlatform(platform === p.id ? "all" : p.id)} className="autos-platform">
            <img src={`/platforms/${p.icon}`} alt="" width={16} height={16} loading="lazy" decoding="async" />
            {p.name}
            <span>{p.workflows}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-muted" aria-live="polite">
        Showing {filtered.length} of {rows.length} workflows
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-hairline bg-surface/50 p-12 text-center">
          <p className="font-display text-[18px] text-ink">Nothing matches that</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setTier("all");
              setCategory("all");
              setPlatform("all");
            }}
            className="mt-4 min-h-[40px] cursor-pointer rounded-full border border-hairline bg-surface px-4 text-[13px] font-medium text-ink hover:text-electric"
          >
            Reset filters
          </button>
        </div>
      ) : (
        tiers
          .filter((t) => filtered.some((r) => r.tier === t.id))
          .map((t) => (
            <section key={t.id} aria-label={t.label}>
              <h2 className="autos-group">{t.label}</h2>
              <p>{t.note}</p>
              <ul className="autos-list">
                {filtered
                  .filter((r) => r.tier === t.id)
                  .map((r) => (
                    <li key={r.id} className="autos-row" data-od-id={`automation-row-${r.id}`}>
                      <div>
                        <h3>{r.href ? <Link href={r.href}>{r.name}</Link> : r.name}</h3>
                        <div className="autos-tags">
                          <span className="autos-tag">{r.trigger}</span>
                          <span className="autos-tag">{r.nodes} nodes</span>
                          <span className="autos-tag">{r.behaviours} tested</span>
                        </div>
                      </div>
                      <div>
                        <p>{r.summary}</p>
                        <div className="mt-[10px]">
                          {r.platforms.length > 0 ? <PlatformMarks marks={r.platforms} label={`Platforms ${r.name} connects to`} /> : <span className="autos-tag">Logic only, no platform</span>}
                        </div>
                      </div>
                      <div className="autos-links">
                        {r.href && (
                          <Link href={r.href}>
                            Walkthrough
                            <Icon name="arrow" />
                          </Link>
                        )}
                        <a href={r.source} target="_blank" rel="noopener noreferrer" aria-label={`${r.name}: source on GitHub`}>
                          Source
                          <Icon name="arrow" />
                        </a>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))
      )}
    </div>
  );
}
