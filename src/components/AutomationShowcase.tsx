"use client";

import { useState } from "react";
import Link from "next/link";
import type { Graph, PlatformMark, StoryStep } from "@/lib/automations";
import AutomationGraph from "./AutomationGraph";
import Icon from "./Icons";
import PlatformMarks from "./PlatformMarks";

type ShownSystem = {
  id: string;
  name: string;
  line: string;
  href: string;
  /** "104 nodes on one canvas" or "3 workflows". */
  size: string;
  behaviours: number;
  /** Every platform the system touches. */
  platforms: PlatformMark[];
  /** How the build is labelled: from production, or a reference build. */
  note: string;
  lead: { name: string; graph: Graph; story: StoryStep[]; platforms: PlatformMark[] };
};

/**
 * The picker on the home page: the systems down the side, and the selected
 * one's lead workflow playing in the frame, over the platforms it runs on. Choosing another system
 * swaps the graph for a fresh one, which plays from the start.
 */
export default function AutomationShowcase({ systems }: { systems: ShownSystem[] }) {
  const [selected, setSelected] = useState(systems[0].id);
  const system = systems.find((s) => s.id === selected) ?? systems[0];

  return (
    <div className="autos-pick" data-od-id="automation-showcase">
      <ul className="autos-tabs" role="tablist" aria-label="Flagship systems">
        {systems.map((s) => (
          <li key={s.id} role="presentation">
            <button
              type="button"
              role="tab"
              id={`autos-tab-${s.id}`}
              aria-selected={s.id === selected}
              aria-controls="autos-panel"
              className="autos-tab"
              onClick={() => setSelected(s.id)}
            >
              <b>{s.name}</b>
              <span>
                {s.line} {s.size}, {s.behaviours} tested behaviours.
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div id="autos-panel" role="tabpanel" aria-labelledby={`autos-tab-${system.id}`}>
        <AutomationGraph
          key={system.id}
          mode="auto"
          graph={system.lead.graph}
          story={system.lead.story}
          platforms={system.lead.platforms}
          title={system.lead.name}
          note={system.note}
          compactLimit={3}
          more={
            <Link href={system.href} className="ask-cta">
              See all of {system.name}
              <Icon name="arrow" className="arrow-ic" />
            </Link>
          }
        />
        <div className="autos-runs">
          <p className="eyebrow">Runs on</p>
          <PlatformMarks marks={system.platforms} label={`Platforms ${system.name} runs on`} />
        </div>
        <p className="autos-open hidden lg:block">
          <Link href={system.href} className="ask-cta" data-od-id="automation-open">
            Open {system.name}: {system.size}, step by step
            <Icon name="arrow" className="arrow-ic" />
          </Link>
        </p>
      </div>
    </div>
  );
}
