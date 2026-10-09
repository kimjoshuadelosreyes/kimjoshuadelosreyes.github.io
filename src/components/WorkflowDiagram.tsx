import { ProjectWorkflow } from "@/lib/content";
import Icon from "./Icons";

export default function WorkflowDiagram({ workflow }: { workflow: ProjectWorkflow }) {
  const steps = [
    { num: "01", icon: "workflow", data: workflow.trigger, accent: "border-brown/30 bg-surface/60" },
    { num: "02", icon: "sparkles", data: workflow.aiCore, accent: "border-electric/50 bg-electric/5 shadow-xs" },
    { num: "03", icon: "api", data: workflow.logic, accent: "border-brown/30 bg-surface/60" },
    { num: "04", icon: "arrow", data: workflow.action, accent: "border-brown/30 bg-surface/60" },
  ];

  return (
    <section className="shell rail py-[clamp(40px,5vw,72px)] border-t border-hairline" data-od-id="case-workflow">
      <div>
        <p className="eyebrow flex items-center gap-2 text-electric">
          <Icon name="workflow" className="h-3.5 w-3.5" />
          <span>Workflow Architecture</span>
        </p>
        <p className="mt-3 text-[13px] leading-[1.55] text-brown max-w-[24ch]">
          Automated logic pipeline mapping triggers, AI reasoning, and external integrations.
        </p>
      </div>

      <div>
        <div className="mb-6">
          <h2 className="font-display text-[clamp(20px,2vw,28px)] font-medium leading-[1.15] text-ink">
            {workflow.title}
          </h2>
          <p className="mt-2 text-[14.5px] leading-[1.6] text-muted max-w-[65ch]">
            {workflow.summary}
          </p>
        </div>

        {/* 4-Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${s.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-[12px] font-bold tracking-[0.06em] text-brown/70">
                    {s.num}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink border border-hairline">
                    <Icon name={s.icon} className="h-2.5 w-2.5 text-electric" />
                    <span>{s.data.badge}</span>
                  </span>
                </div>

                <h3 className="font-display text-[16px] font-medium leading-[1.25] text-ink mb-2">
                  {s.data.title}
                </h3>
                <p className="text-[13px] leading-[1.5] text-muted">
                  {s.data.desc}
                </p>
              </div>

              {s.data.tools && s.data.tools.length > 0 && (
                <div className="mt-4 pt-3 border-t border-hairline/80 flex flex-wrap gap-1.5">
                  {s.data.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-md bg-canvas/80 px-2 py-0.5 text-[11px] font-medium text-ink border border-hairline"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
