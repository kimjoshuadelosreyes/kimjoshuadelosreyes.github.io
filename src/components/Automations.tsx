import Link from "next/link";
import { AUTOMATIONS, FEATURED, LIBRARY, automationPath, marksOf, noteOf, platformsAcross, workflowsOf } from "@/lib/automations";
import AutomationShowcase from "./AutomationShowcase";
import Ask from "./Ask";
import Icon from "./Icons";

/**
 * Automations — the library, on the home page.
 *
 * One flagship system at a time, its lead workflow walked through by the
 * camera, with the others a click away. The picker shows the eight strongest
 * systems, production builds and reference builds mixed, each labelled with
 * which it is. Eight keeps it to one column; the rest are in the
 * catalogue. The counts under it are worked out
 * from the catalogue, and every one can be checked in the public repository.
 *
 * This is a server component: it reads the whole catalogue and hands the
 * client only the graphs it draws.
 */
export default function Automations() {
  const systems = FEATURED.map((s) => {
    const list = workflowsOf(s);
    const lead = list[0];
    return {
      id: s.id,
      name: s.name,
      line: s.line,
      href: automationPath(s.id),
      size: list.length === 1 ? `${lead.nodeCount} nodes on one canvas` : `${list.length} workflows`,
      behaviours: list.reduce((n, w) => n + w.tests.length, 0),
      platforms: platformsAcross(list),
      note: noteOf(list),
      lead: { name: lead.name, graph: lead.graph, story: lead.story, platforms: marksOf(lead.platforms) },
    };
  });

  return (
    <section id="automations" data-od-id="automations">
      <div className="shell rail pt-[clamp(64px,9vw,148px)] pb-[clamp(30px,3.6vw,56px)]">
        <div>
          <div className="mb-[14px] font-display text-[13px] tracking-[0.06em] text-brown">03</div>
          <p className="eyebrow">{AUTOMATIONS.eyebrow}</p>
          <p className="rail-index">
            {LIBRARY.production} from production · {LIBRARY.workflows} in all
          </p>
          <p className="mt-[22px] max-w-[22ch] text-[13px] leading-[1.55] text-brown">{AUTOMATIONS.aside}</p>
        </div>
        <div>
          <h2 className="h2">
            {AUTOMATIONS.titleLines.map((line) => (
              <span key={line} className="lg:block">
                {line}{" "}
              </span>
            ))}
          </h2>
          <p className="lede mt-[clamp(20px,2.4vw,34px)]">{AUTOMATIONS.lede}</p>
        </div>
      </div>

      <AutomationShowcase systems={systems} />

      <div className="shell pt-[clamp(36px,4.4vw,70px)] pb-[clamp(56px,7vw,110px)]">
        <dl className="autos-facts" data-od-id="automation-facts">
          {AUTOMATIONS.facts.map((f) => (
            <div key={f.label} className="autos-fact">
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
        <div className="section-ask mt-[clamp(28px,3.4vw,52px)]">
          <p>Want one of these running in your business?</p>
          <div className="autos-more">
            <Link href="/automations" className="btn btn--ghost" data-od-id="automations-all">
              Browse all {LIBRARY.workflows}
              <Icon name="arrow" className="arrow-ic" />
            </Link>
            <a href={LIBRARY.repo} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              Read the source
              <Icon name="arrow" className="arrow-ic" />
            </a>
            <Ask as="button" subject="I want an automation like yours" id="automations-cta">
              Start a project
            </Ask>
          </div>
        </div>
      </div>
    </section>
  );
}
