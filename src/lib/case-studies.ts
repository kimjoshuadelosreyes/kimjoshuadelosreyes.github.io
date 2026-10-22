import { findWorkflow } from "./automations";

/**
 * Deep case studies for the library's flagship systems: architecture,
 * evaluation, failure handling and impact.
 *
 * Impact is stated as guarantees, not figures: these systems run on test data,
 * so there are no business numbers to report. Every guarantee quotes one of
 * the system's own tested behaviours, and `caseStudyOf` throws at build time
 * if a quoted behaviour is no longer in the catalogue, so this copy cannot
 * claim something the tests do not.
 */
export type CaseSection = {
  title: string;
  intro: string;
  items: { title: string; copy: string; test?: string }[];
};

export type CaseStudy = { sections: CaseSection[] };

const supportDesk: CaseStudy = {
  sections: [
    {
      title: "Architecture",
      intro: "One canvas, built so that each part can only do its own job.",
      items: [
        { title: "Triage, told not to answer", copy: "A triage agent reads each Zendesk ticket for topic, urgency, sentiment and language, and only routes." },
        { title: "Code overrides the model", copy: "Legal language, an angry customer, an enterprise account or another language go straight to the team, whatever the model thought.", test: "legal language goes straight to a person and no specialist is asked" },
        { title: "Four specialists, least privilege", copy: "Orders reads Shopify and Supabase. Billing reads Stripe and cannot refund. Technical and general search the knowledge base in Pinecone and must name the articles they used.", test: "an order question is looked up in Shopify, judged and answered" },
        { title: "Refunds are policy, not opinion", copy: "Under 100, not a third refund, not already refunded. Inside the policy Stripe refunds with an idempotency key; outside it a person decides.", test: "a small refund inside the policy is made in Stripe and added to the reply" },
      ],
    },
    {
      title: "Evaluation",
      intro: "The agent that wrote the answer is never the one that approves it.",
      items: [
        { title: "A judge on every answer", copy: "A different model checks every statement against the facts the specialist gathered. A rejected answer is handed over with the unsent draft.", test: "an answer the judge rejects is handed over with the unsent draft" },
        { title: "A second check in code", copy: "A promise the desk should not make is caught by a rule, even when the judge passes it.", test: "a promise is caught in code even when the judge passes it" },
        { title: "A nightly audit", copy: "Every refunded answer is graded overnight and the poor ones are named.", test: "the nightly audit grades every refunded answer and names the poor ones" },
        { title: "A weekly gap report", copy: "Monday's handovers are grouped into the questions the knowledge base cannot answer yet.", test: "Monday's gaps are grouped and posted" },
      ],
    },
    {
      title: "Failure handling",
      intro: "Built on the shared reliability kit: idempotency guard, notify and error handler.",
      items: [
        { title: "Models down", copy: "If the models are unreachable the ticket still reaches a person.", test: "with the models down, the ticket still reaches a person" },
        { title: "Delivered twice", copy: "A webhook that arrives twice is answered once.", test: "the same ticket delivered twice is answered once" },
        { title: "Over the limit", copy: "No path lets an agent refund above the policy limit.", test: "a refund over the limit is never made by the agents" },
        { title: "Quiet weeks", copy: "A week with no handovers posts an all clear without spending a model call.", test: "a week with no handovers posts an all clear without a model call" },
      ],
    },
    {
      title: "Business impact",
      intro: "What the desk is built to change, each point backed by a test that fails if it stops being true.",
      items: [
        { title: "Routine tickets are answered from facts", copy: "Technical questions are answered from the knowledge base, not from memory.", test: "a technical question is answered from the knowledge base" },
        { title: "Refund risk is bounded", copy: "Refunds follow a written policy and the agents cannot exceed it.", test: "a refund over the limit is never made by the agents" },
        { title: "People get the hard tickets, with the facts", copy: "Sensitive and uncertain tickets reach a person with the evidence attached.", test: "legal language goes straight to a person and no specialist is asked" },
        { title: "Unhappy customers are followed up", copy: "A poor survey opens a follow-up with a draft ready for a person; a good one is only recorded.", test: "an unhappy survey opens a follow-up with a draft for a person" },
      ],
    },
  ],
};

const STUDIES: Record<string, { workflow: string; study: CaseStudy }> = {
  "ai-support-desk": { workflow: "ai-support-desk", study: supportDesk },
};

/** The deep case study for a system, with every quoted test checked against the catalogue. */
export function caseStudyOf(systemId: string): CaseStudy | undefined {
  const entry = STUDIES[systemId];
  if (!entry) return undefined;
  const tests = findWorkflow(entry.workflow)?.tests ?? [];
  for (const section of entry.study.sections)
    for (const item of section.items)
      if (item.test && !tests.includes(item.test)) throw new Error(`Case study "${systemId}" quotes a behaviour that is not tested: "${item.test}"`);
  return entry.study;
}
