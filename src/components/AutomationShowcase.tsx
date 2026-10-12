"use client";

import { useState } from "react";
import Link from "next/link";
import type { Graph, StoryStep } from "@/lib/automations";
import AutomationGraph from "./AutomationGraph";
import Icon from "./Icons";

type ShownSystem = {
  id: string;
  name: string;
  line: string;
  href: string;
  workflows: number;
  behaviours: number;
  lead: { name: string; graph: Graph; story: StoryStep[] };
};

/**
 * The picker on the home page: the eight systems down the side, and the
 * selected one's lead workflow playing in the frame. Choosing another system
 * swaps the graph for a fresh one, which plays from the start.
 */
export default function AutomationShowcase({ systems, note }: { systems: ShownSystem[]; note: string }) {
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
                {s.line} {s.workflows} workflows, {s.behaviours} tested behaviours.
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
          title={system.lead.name}
          note={note}
          compactLimit={3}
          more={
            <Link href={system.href} className="ask-cta">
              See all of {system.name.toLowerCase()}
              <Icon name="arrow" className="arrow-ic" />
            </Link>
          }
        />
        <p className="autos-open hidden lg:block">
          <Link href={system.href} className="ask-cta" data-od-id="automation-open">
            Open {system.name.toLowerCase()}: {system.workflows} workflows, step by step
            <Icon name="arrow" className="arrow-ic" />
          </Link>
        </p>
      </div>
    </div>
  );
}
