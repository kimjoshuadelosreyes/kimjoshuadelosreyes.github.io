import { RESULTS } from "@/lib/content";
import { LIBRARY } from "@/lib/automations";

/**
 * Results — one strip of figures straight under the hero.
 *
 * The first three are totals from client work and are not credited to a
 * client. The last three are counted from the automation catalogue, so they
 * cannot drift from the library they describe.
 */
export default function Results() {
  const figures = [
    ...RESULTS,
    { value: String(LIBRARY.workflows), label: "workflows" },
    { value: String(LIBRARY.production), label: "in production" },
    { value: String(LIBRARY.behaviours), label: "tested behaviours" },
  ];
  return (
    <section id="results" data-od-id="results" aria-label="Results" className="shell pt-[clamp(40px,5vw,72px)] pb-[clamp(8px,2vw,28px)]">
      <dl className="results">
        {figures.map((f) => (
          <div key={f.label} className="results__item">
            <dt>{f.value}</dt>
            <dd>{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
