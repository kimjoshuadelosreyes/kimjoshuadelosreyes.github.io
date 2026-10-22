import { LIBRARY } from "@/lib/automations";
import Icon from "./Icons";

/**
 * How I test — what separates this library from a folder of exports.
 *
 * Every workflow is imported into a real n8n and sent the bad day: the
 * webhook that arrives twice, the API that is down, the schedule that silently
 * stops. The figures are counted from the catalogue; each column links to the
 * file in the public repository that does the job.
 */
const blob = (path: string) => `${LIBRARY.repo}/blob/main/${path}`;

export default function Testing() {
  const columns = [
    {
      title: `${LIBRARY.behaviours} behaviours, on a real n8n`,
      copy: `Each workflow is imported into n8n ${LIBRARY.n8n}, sent input, and checked on what it actually did. CI rebuilds the library, fails if the committed files are stale, and runs every case.`,
      links: [
        { label: "The CI run", href: blob(".github/workflows/test.yml") },
        { label: "Latest results", href: blob("test-results.json") },
      ],
    },
    {
      title: "Retry, then fall back",
      copy: "The one place alerts leave from retries Slack, then falls back to email when Slack is down, so an outage cannot hide its own alert.",
      links: [{ label: "Notify", href: blob("shared/notify.workflow.ts") }],
    },
    {
      title: "Dead letter and replay",
      copy: "A failure that survives its retries is parked with its payload instead of lost, and replayed once the cause is fixed.",
      links: [
        { label: "Dead letter", href: blob("shared/dead-letter.workflow.ts") },
        { label: "Replay", href: blob("shared/dead-letter-replay.workflow.ts") },
      ],
    },
    {
      title: "Alert once, notice silence",
      copy: "A failing loop is one Slack message an hour, not a thousand. A heartbeat monitor alerts when a schedule has stopped running at all.",
      links: [
        { label: "Error handler", href: blob("shared/error-handler.workflow.ts") },
        { label: "Heartbeat monitor", href: blob("shared/heartbeat-monitor.workflow.ts") },
      ],
    },
  ];
  return (
    <section id="testing" data-od-id="testing">
      <div className="shell rail pt-[clamp(56px,8vw,128px)] pb-[clamp(24px,3vw,48px)]">
        <div>
          <p className="eyebrow">How I test</p>
          <p className="rail-index">{LIBRARY.behaviours} behaviours · n8n {LIBRARY.n8n}</p>
        </div>
        <div>
          <h2 className="h2">Built for the days when it does not work.</h2>
          <p className="lede mt-[clamp(16px,2vw,28px)]">
            Most workflow collections show the path where everything works. These are tested against the other days, with retries, a dead letter queue and alerting written as workflows of their own.
          </p>
        </div>
      </div>
      <div className="shell pb-[clamp(48px,6vw,96px)]">
        <ul className="test-grid">
          {columns.map((c) => (
            <li key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.copy}</p>
              {c.links.map((l) => (
                <span key={l.href} className="mr-4 inline-block">
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="test-link">
                    {l.label}
                    <Icon name="arrow" className="arrow-ic" />
                  </a>
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
