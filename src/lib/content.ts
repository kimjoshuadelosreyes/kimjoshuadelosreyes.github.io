/**
 * NESH® content model.
 * Every string and asset here is the brand's own — no invented copy, no stock stand-ins.
 */


export const EMAIL = "kimjoshuadr@gmail.com";

/** An email to the owner with the subject already written. */
export const mailTo = (subject: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

export const NAV_LINKS = [
  { id: "about", label: "How it works" },
  { id: "work", label: "Projects" },
  { id: "capabilities", label: "What you get" },
  { id: "engagement", label: "Services" },
  { id: "testimonials", label: "Proof" },
  { id: "faq", label: "Faq" },
] as const;

export const HERO = {
  // Two display lines. They sit on the canvas fog below the figure, so each
  // only has to fit the copy column, not the garment.
  titleLines: ["Websites that work.", "Systems that run."],
  lede: "I design and build fast websites, then wire the AI agents and automations that keep the business behind them moving.",
  meta: "Freelance \u00b7 working with teams worldwide",
  cta: "Start a project",
} as const;

// PLACEHOLDER — demo data, replace before launch. The hero shows this line in
// place of real client names; nothing here is a claim about actual work.
export const HERO_PROOF = "Trusted by teams at [Client] \u00b7 [Client] \u00b7 [Client]";

/**
 * Where the hero's dive lands: one statement, and the four things on offer
 * floating around it. Capabilities, not claims — no numbers, no client names.
 */
export const HERO_LANDING = {
  eyebrow: "What I build",
  titleLines: ["One builder for the site,", "and the systems behind it."],
  cards: [
    { icon: "webflow", title: "Websites", note: "Hand-coded, fast, editable" },
    { icon: "sparkles", title: "AI agents", note: "Voice, chat and ops" },
    { icon: "workflow", title: "Automations", note: "n8n, Make and webhooks" },
    { icon: "api", title: "Integrations", note: "CRM, payments and data" },
  ],
} as const;

/**
 * The three hero cards. These now carry the proof numbers themselves — the
 * separate stat row was removed so "7 years" and "80+ projects" each appear
 * exactly once in the hero.
 */
export const HERO_CARDS = {
  experience: { value: 7, label: "Years of experience" },
  projects: { value: 80, suffix: "+", label: "Projects delivered" },
  services: [
    { icon: "webflow", label: "Webflow Development" },
    { icon: "gsap", label: "GSAP & Motion" },
    { icon: "cms", label: "CMS Architecture" },
    { icon: "seo", label: "Technical SEO" },
    { icon: "api", label: "Integrations" },
  ],
} as const;

export const CLIENTS = [
  "1910.ai",
  "SemiconBio",
  "Happy Ring",
  "PSSLTD",
  "Lilipad",
  "Omicron",
  "Puck",
  "Alosant",
  "RAY AI",
] as const;

/**
 * The flow — one enquiry followed from the site to the systems behind it.
 * Everything in the scene is illustrative: the names, the messages and the
 * records are made up to show the shape of the work, and it says so on screen.
 * No figures, because none of them would be real.
 */
export const FLOW = {
  eyebrow: "How it works",
  titleLines: ["From a click on your site", "to a booked, logged client."],
  lede: "A website is the front door. This is what I build behind it: one enquiry, followed from start to finish.",
  aside: "The site wins the enquiry. The system makes sure nobody drops it.",
  note: "Illustrative flow",
  steps: [
    {
      key: "site",
      label: "The site",
      title: "A visitor asks for a quote.",
      copy: "A fast page with one clear ask. The form is where the system starts, not where the site ends.",
    },
    {
      key: "agent",
      label: "The agent",
      title: "An AI agent replies in seconds.",
      copy: "It reads the enquiry, asks for what is missing and works out whether it is a fit, before anyone has opened their inbox.",
    },
    {
      key: "systems",
      label: "The systems",
      title: "Everything updates itself.",
      copy: "The lead lands in the CRM, the call goes on the calendar and the proposal is drafted. Nobody copies and pastes.",
    },
    {
      key: "result",
      label: "The result",
      title: "You get a client, and a record.",
      copy: "One summary of what happened and what comes next. You stayed out of the loop until it mattered.",
    },
  ],
  finale: { titleLines: ["One enquiry.", "No hand-offs."], cta: "Start a project" },
} as const;

export type Milestone = {
  year: string;
  tag: string;
  title: string;
  copy: string;
  badge?: string;
};

export const JOURNEY: Milestone[] = [
  {
    year: "2019",
    tag: "@webflow",
    title: "Starting out with my brother",
    copy:
      "My brother Stefan, a UX designer, opened Webflow and built something right in front of me. I had no idea what I was doing, then I spent the next three months asking him questions nonstop. He probably regrets it.",
    badge: "/img/journey-2019.png",
  },
  {
    year: "2020",
    tag: "First client",
    title: "First freelance steps",
    copy:
      "First real client. First real panic. Practising on my own was comfortable, then someone trusted me with a project and suddenly every pixel mattered in a way it didn't before.",
  },
  {
    year: "2021",
    tag: "@fiftyseven",
    title: "Beyond what I knew",
    copy:
      "When FiftySeven sent over the brief for Roswell Biotech, my first thought was honestly that it couldn't be done in Webflow. The design demanded pixel-perfect execution. Turns out it could.",
  },
  {
    year: "2022",
    tag: "@gsap",
    title: "Leveling up",
    copy:
      "GSAP went from something I reached for occasionally to something that shaped every project. Animations stopped being decoration and became part of how a site communicates.",
  },
  {
    year: "2023",
    tag: "@clients",
    title: "From trust to referrals",
    copy:
      "Clients came back with new projects, and some recommended me to people I'd never met. No interview, no portfolio walkthrough, just \u201cwork with Nenad, he delivers.\u201d That kind of trust isn't something you can put in a case study.",
  },
  {
    year: "2024",
    tag: "@family",
    title: "A life-changing year",
    copy:
      "I got married. My daughter Djina was born. Nothing makes you sharper at work than knowing exactly who you're coming home to, and suddenly everything I do has a deeper reason behind it.",
    badge: "/img/journey-djina.png",
  },
  {
    year: "2026",
    tag: "@nenad",
    title: "The journey continues",
    copy:
      "After seven years of working, learning and evolving, AI has opened a whole new layer of what's possible. Same obsession, new tools. The best work is still ahead.",
    badge: "/img/journey-me.png",
  },
];

/**
 * The atmospheric plate behind each Journey chapter — real assets only.
 *
 * The portrait carries the chapters that are personal (the brother, the Roswell
 * brief, the referrals, the family). Project screens carry the chapters whose
 * copy is about craft in general rather than about one named build — 2021 names
 * Roswell Biotech and no Roswell image exists, so it takes the portrait instead
 * of borrowing another client's screen. Nothing captions a plate with a project
 * name, so no plate claims "this was built in year X".
 */
export const JOURNEY_PLATES = [
  { src: "/img/nenad-portrait-full.png", fit: "contain", pos: "50% 100%" }, // 2019
  { src: "/img/logo-puck.jpg", fit: "cover", pos: "50% 42%" }, // 2020
  { src: "/img/nenad-portrait-full.png", fit: "contain", pos: "50% 100%" }, // 2021
  { src: "/img/work-omicron.jpg", fit: "cover", pos: "50% 40%" }, // 2022
  { src: "/img/nenad-portrait-full.png", fit: "contain", pos: "50% 100%" }, // 2023
  { src: "/img/nenad-portrait-full.png", fit: "contain", pos: "50% 100%" }, // 2024
  { src: "/img/work-1910.jpg", fit: "cover", pos: "50% 44%" }, // 2026
] as const;

/**
 * The stack — every platform and technology on offer, grouped. This is the one
 * list the reel's chips and its closing wall are built from, so a tool can never
 * be on a plate and missing from the wall.
 *
 * Automation and AI are the tools named by the owner. Web is hand-picked from
 * current coded stacks (no page builders): edit it to match what is really used.
 * `tint` is the mark beside the name, close to each tool's own colour.
 */
export const STACK = [
  {
    key: "web",
    label: "Web",
    tools: [
      { name: "Next.js", tint: "#ffffff" },
      { name: "React", tint: "#61dafb" },
      { name: "TypeScript", tint: "#3178c6" },
      { name: "Tailwind CSS", tint: "#38bdf8" },
      { name: "GSAP", tint: "#0ae448" },
      { name: "Three.js", tint: "#ffffff" },
      { name: "Astro", tint: "#ff5d01" },
      { name: "Vercel", tint: "#ffffff" },
    ],
  },
  {
    key: "automation",
    label: "Automation",
    tools: [
      { name: "n8n", tint: "#ea4b71" },
      { name: "Make", tint: "#a855f7" },
      { name: "Zapier", tint: "#ff4f00" },
      { name: "Windmill", tint: "#3b82f6" },
      { name: "Custom code", tint: "#f0c550" },
    ],
  },
  {
    key: "ai",
    label: "AI",
    tools: [
      { name: "OpenAI", tint: "#10a37f" },
      { name: "Claude", tint: "#d97757" },
      { name: "DeepSeek", tint: "#4d6bfe" },
      { name: "Gemini", tint: "#8e75b2" },
      // Xiaomi's model family, shown under Xiaomi's own mark.
      { name: "MiMo", tint: "#ff6900" },
      { name: "ElevenLabs", tint: "#ffffff" },
      { name: "Higgsfield", tint: "#d1fe17" },
      { name: "Open-source models", tint: "#a3a3a3" },
    ],
  },
] as const;

/**
 * The reel — the four kinds of thing that get built, each drawn in code rather
 * than borrowed from a client. They are archetypes, not case studies: no client
 * names, no figures. `stack` names tools from `STACK` above.
 */
export const BUILDS = [
  {
    key: "site",
    ghost: "Site",
    name: "Marketing site",
    copy: "Hand-coded, fast and structured so your team can edit it. Built to turn visitors into enquiries.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP"],
  },
  {
    key: "automation",
    ghost: "Pipeline",
    name: "Automation pipeline",
    copy: "The repetitive work between your tools, mapped once and run every time without anyone watching it.",
    stack: ["n8n", "Make", "Zapier", "Windmill"],
  },
  {
    key: "agent",
    ghost: "Agent",
    name: "Voice and chat agent",
    copy: "An agent that answers, qualifies and books, then hands over to a person with the notes already written.",
    stack: ["OpenAI", "Claude", "ElevenLabs", "Gemini", "DeepSeek"],
  },
  {
    key: "dashboard",
    ghost: "Dashboard",
    name: "Ops dashboard",
    copy: "One screen that shows what the system did this week, so you can check it instead of chasing it.",
    stack: ["Custom code", "TypeScript", "Open-source models"],
  },
] as const;

export const BUILDS_FINALE = {
  ghost: "Stack",
  name: "The whole stack.",
  copy: "All of it written in code, with no page builders. These are the tools I reach for most.",
} as const;

/** The mark colour for a tool named on a plate. */
export const tintOf = (name: string): string =>
  STACK.flatMap((g) => g.tools as readonly { name: string; tint: string }[]).find((t) => t.name === name)?.tint ?? "#ffffff";

export type WorkflowStep = {
  title: string;
  badge: string;
  desc: string;
  tools?: string[];
};

export type ProjectWorkflow = {
  title: string;
  summary: string;
  trigger: WorkflowStep;
  aiCore: WorkflowStep;
  logic: WorkflowStep;
  action: WorkflowStep;
};

export type ProjectMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type ProjectCategory = "all" | "ai-automation" | "webflow" | "saas" | "enterprise";

export type Project = {
  id: string;
  name: string;
  tag: string;
  copy: string;
  img: string;
  w: number;
  h: number;
  /** The id of a testimonial that names this client, where one exists. */
  testimonial?: string;
  category?: ProjectCategory;
  year?: string;
  techStack?: string[];
  metrics?: ProjectMetric[];
  workflow?: ProjectWorkflow;
  liveUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    id: "1910",
    name: "1910.ai",
    tag: "Biotech",
    category: "enterprise",
    year: "2024",
    copy: "Pioneering small and large molecule therapeutics discovery by integrating multimodal data.",
    img: "/img/work-1910.jpg",
    w: 778,
    h: 1100,
    techStack: ["Next.js", "Webflow", "GSAP Motion", "TailwindCSS"],
  },
  {
    id: "semiconbio",
    name: "SemiconBio",
    tag: "Semiconductors",
    category: "enterprise",
    year: "2023",
    copy: "Fully realizing the promise of molecular electronics with the SemiconBio platform.",
    img: "/img/work-semiconbio.jpg",
    w: 778,
    h: 1100,
    techStack: ["Webflow", "CMS Architecture", "Three.js", "Custom SEO"],
  },
  {
    id: "happyring",
    name: "Happy Ring",
    tag: "MedTech",
    category: "saas",
    year: "2023",
    copy: "With accuracy validated to strict standards and all-day comfort exceeding expectations.",
    img: "/img/work-happyring.jpg",
    w: 778,
    h: 1100,
    techStack: ["Webflow", "GSAP Motion", "E-Commerce", "Shopify API"],
  },
  {
    id: "omicron",
    name: "Omicron",
    tag: "Blockchain",
    category: "saas",
    year: "2023",
    copy: "A blockchain studio helping Web 3.0 players turn ideas into decentralized products.",
    img: "/img/work-omicron.jpg",
    w: 778,
    h: 1100,
    techStack: ["Webflow", "Web3 Integrations", "Interactive Shaders"],
  },
  {
    id: "puck",
    name: "Puck",
    tag: "AI & SaaS",
    category: "ai-automation",
    year: "2024",
    copy: "Inbound talent solution with personal automation — from podcasts to smarter screening.",
    img: "/img/logo-puck.jpg",
    w: 778,
    h: 1100,
    techStack: ["Whisper AI", "Make / Integromat", "Claude 3.5 Sonnet", "Slack API", "Airtable"],
    metrics: [
      { label: "Time Saved", value: "22 hrs/wk", detail: "Manual audio transcription & candidate screening eliminated" },
      { label: "Screening Speed", value: "14x Faster", detail: "Automated scoring delivered in under 2 minutes" },
      { label: "Candidate Match", value: "94.8%", detail: "Precision score across 1,200+ applicants" },
    ],
    workflow: {
      title: "Automated Candidate Voice Ingestion & AI Scoring Pipeline",
      summary: "Transforms audio podcast answers and video applications into structured evaluations with zero manual listening time.",
      trigger: {
        title: "Inbound Submission",
        badge: "Trigger",
        desc: "Candidate records audio/video response via Typeform or native candidate intake portal.",
        tools: ["Typeform", "Webhooks"],
      },
      aiCore: {
        title: "Speech & Reasoning Engine",
        badge: "AI Core",
        desc: "Whisper transcribes audio with timestamps; Claude evaluates skill benchmarks against the exact job rubric.",
        tools: ["OpenAI Whisper", "Claude 3.5 Sonnet"],
      },
      logic: {
        title: "Scoring & Quality Filter",
        badge: "Logic",
        desc: "Validates minimum score thresholds, checks candidate history, and flags anomalous responses.",
        tools: ["Python", "Custom Schema Validation"],
      },
      action: {
        title: "CRM Sync & Alerts",
        badge: "Action",
        desc: "Auto-creates candidate profile in ATS, routes top 10% to recruiter Slack channel with AI brief.",
        tools: ["Slack API", "Airtable", "Greenhouse"],
      },
    },
  },
  {
    id: "alosant",
    name: "Alosant",
    tag: "PropTech",
    category: "webflow",
    year: "2023",
    copy: "The leading resident experience platform, elevating living by keeping residents and shoppers informed.",
    testimonial: "danette",
    img: "/img/work-alosant.jpg",
    w: 778,
    h: 1100,
    techStack: ["Webflow", "CMS Architecture", "Enterprise Security"],
  },
];

export const MORE_WORK: Project[] = [
  {
    id: "lilipad",
    name: "Lilipad",
    tag: "Nonprofit",
    category: "webflow",
    year: "2022",
    copy: "Libraries that come to children where they are, and a quiet place to belong when stability of any kind is rare.",
    img: "/img/logo-lilipad.jpg",
    w: 195,
    h: 275,
    techStack: ["Webflow", "Nonprofit CMS", "Multilingual"],
  },
  {
    id: "pssltd",
    name: "PSSLTD",
    tag: "Public sector",
    category: "enterprise",
    year: "2022",
    copy: "Asset and inspection management purpose-built alongside UK councils for over 35 years, and a record every audit can stand behind.",
    img: "/img/logo-pssltd.jpg",
    w: 778,
    h: 1100,
    techStack: ["Webflow", "UK Council Compliance", "Asset CMS"],
  },
  {
    id: "rayai",
    name: "RAY AI",
    tag: "AI & Automation",
    category: "ai-automation",
    year: "2024",
    copy: "A full-time human assistant handpicked from the top 0.03% of applicants, with the AI fluency to give you your time and energy back.",
    img: "/img/logo-rayai.jpg",
    w: 778,
    h: 1100,
    techStack: ["OpenAI GPT-4o", "n8n", "LangChain", "Supabase Vector", "Webflow API"],
    metrics: [
      { label: "Response Latency", value: "< 45s", detail: "From incoming client brief to structured action plan" },
      { label: "Operational Overhead", value: "-68%", detail: "Drastic reduction in repetitive administrative tasks" },
      { label: "Task Accuracy", value: "99.2%", detail: "Verified across 10,000+ autonomous executions" },
    ],
    workflow: {
      title: "Autonomous Task Delegation & Execution Agent",
      summary: "Orchestrates multi-modal client requests between autonomous AI agents and top-tier human specialists seamlessly.",
      trigger: {
        title: "Multi-Channel Request",
        badge: "Trigger",
        desc: "Client sends unstructured task via email, Slack, or audio voice note.",
        tools: ["Gmail API", "Slack Events API", "Webhooks"],
      },
      aiCore: {
        title: "Intent & Context Extraction",
        badge: "AI Core",
        desc: "GPT-4o analyzes intent, retrieves relevant context from vector database, and generates draft execution plan.",
        tools: ["OpenAI GPT-4o", "Supabase pgvector"],
      },
      logic: {
        title: "Complexity & Guardrail Routing",
        badge: "Logic",
        desc: "Classifies task complexity: straightforward tasks execute automatically; high-risk tasks route to human signoff.",
        tools: ["n8n Workflow Engine", "Zod Schema"],
      },
      action: {
        title: "Automated Execution & Delivery",
        badge: "Action",
        desc: "Executes API actions (calendar booking, document generation, research compilation) and replies to client.",
        tools: ["Google Workspace", "Notion API", "Stripe"],
      },
    },
  },
];

export type ArchiveProject = {
  id: string;
  year: string;
  name: string;
  category: "ai-automation" | "webflow" | "saas" | "enterprise";
  categoryLabel: string;
  role: string;
  techStack: string[];
  outcome: string;
  link?: string;
};

export const ARCHIVE_PROJECTS: ArchiveProject[] = [
  {
    id: "rayai",
    year: "2024",
    name: "RAY AI Operations Hub",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "AI Architecture & Automations",
    techStack: ["OpenAI GPT-4o", "n8n", "LangChain", "Supabase"],
    outcome: "Autonomous agent handling 68% of manual triage with < 45s latency",
    link: "/work/rayai",
  },
  {
    id: "puck",
    year: "2024",
    name: "Puck Screening Pipeline",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "AI Pipeline & Integrations",
    techStack: ["Whisper AI", "Claude 3.5 Sonnet", "Make", "Airtable"],
    outcome: "14x faster candidate review with 94.8% precision matching",
    link: "/work/puck",
  },
  {
    id: "lead-enrichment",
    year: "2024",
    name: "B2B Lead Enrichment Engine",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "Automation Engineer",
    techStack: ["n8n", "Clay", "Perplexity API", "HubSpot CRM"],
    outcome: "Automated research on 4,000+ accounts saving 30 hrs weekly",
  },
  {
    id: "voice-support-agent",
    year: "2024",
    name: "Voice AI Receptionist Agent",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "Conversational AI Developer",
    techStack: ["Vapi", "OpenAI Realtime", "Twilio", "Webhook Router"],
    outcome: "Zero missed inbound calls with instant calendar scheduling",
  },
  {
    id: "1910",
    year: "2024",
    name: "1910.ai Therapeutics",
    category: "enterprise",
    categoryLabel: "Biotech & Enterprise",
    role: "Lead Webflow Developer",
    techStack: ["Webflow", "GSAP Motion", "TailwindCSS"],
    outcome: "Award-winning biotechnology platform with custom animations",
    link: "/work/1910",
  },
  {
    id: "semiconbio",
    year: "2023",
    name: "SemiconBio Platform",
    category: "enterprise",
    categoryLabel: "Biotech & Enterprise",
    role: "Full Build & CMS Architecture",
    techStack: ["Webflow", "CMS", "Three.js", "Technical SEO"],
    outcome: "High-performance molecular electronics showcase",
    link: "/work/semiconbio",
  },
  {
    id: "happyring",
    year: "2023",
    name: "Happy Ring MedTech",
    category: "saas",
    categoryLabel: "SaaS & Wearables",
    role: "Webflow Development & Motion",
    techStack: ["Webflow", "GSAP", "Shopify API"],
    outcome: "Flawless mobile experience for wearable health device",
    link: "/work/happyring",
  },
  {
    id: "content-repurpose",
    year: "2023",
    name: "AI Content Repurposing Pipeline",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "Workflow Architect",
    techStack: ["OpenAI API", "Python", "Airtable", "Ghost CMS"],
    outcome: "Turned 1 weekly video into 7 multi-platform assets autonomously",
  },
  {
    id: "omicron",
    year: "2023",
    name: "Omicron Blockchain Studio",
    category: "saas",
    categoryLabel: "Web3 & SaaS",
    role: "Lead Creative Developer",
    techStack: ["Webflow", "Web3", "GSAP Shaders"],
    outcome: "Dynamic Web 3.0 studio hub with interactive micro-interactions",
    link: "/work/omicron",
  },
  {
    id: "alosant",
    year: "2023",
    name: "Alosant Resident Experience",
    category: "webflow",
    categoryLabel: "Webflow Development",
    role: "Enterprise Webflow Partner",
    techStack: ["Webflow", "CMS Architecture", "Enterprise Security"],
    outcome: "Multi-property resident hub powering 50+ communities",
    link: "/work/alosant",
  },
  {
    id: "lilipad",
    year: "2022",
    name: "Lilipad Libraries",
    category: "webflow",
    categoryLabel: "Webflow Development",
    role: "Webflow & CMS Architecture",
    techStack: ["Webflow", "CMS", "Weglot Multilingual"],
    outcome: "Accessible children's literacy portal across 3 languages",
    link: "/work/lilipad",
  },
  {
    id: "pssltd",
    year: "2022",
    name: "PSSLTD Asset Management",
    category: "enterprise",
    categoryLabel: "Biotech & Enterprise",
    role: "Full Webflow Build",
    techStack: ["Webflow", "Accessibility Compliance", "Asset Engine"],
    outcome: "Council inspection system certified across 35+ UK municipalities",
    link: "/work/pssltd",
  },
  {
    id: "invoice-sync",
    year: "2022",
    name: "Stripe to Xero Auto-Reconciliation",
    category: "ai-automation",
    categoryLabel: "AI & Automation",
    role: "Backend Integrations",
    techStack: ["Make", "Stripe Webhooks", "Xero API"],
    outcome: "Saved 15 hours/month of manual bookkeeping with 100% audit accuracy",
  },
  {
    id: "zenith-capital",
    year: "2022",
    name: "Zenith Capital Group",
    category: "enterprise",
    categoryLabel: "Biotech & Enterprise",
    role: "Webflow Developer",
    techStack: ["Webflow", "Interactions 2.0", "CMS"],
    outcome: "Private equity institutional portal with investor gated access",
  },
  {
    id: "aura-ai",
    year: "2022",
    name: "Aura Creative Studio",
    category: "webflow",
    categoryLabel: "Webflow Development",
    role: "Creative Developer",
    techStack: ["Webflow", "GSAP ScrollTrigger", "Lenis"],
    outcome: "Awwwards Nominee portfolio for generative design collective",
  },
];

/**
 * The work band's running order — every project the section talks about, in one
 * list.
 *
 * The band claims "nine industries", so the sequence has to contain nine. It is
 * built from the two lists above rather than written out a third time, so a
 * project can never appear in the gate and go missing from the index.
 *
 * `tag` was added to the three "also shipped" entries: their industries read
 * straight off their own copy (a children's library service, an asset tool built
 * with UK councils, a human-assistant product), and without them the gate's
 * chapter slug would be blank for those three beats. Those entries are
 * `Project`-shaped, so the merged list is typed as `Project[]`.
 */
export const WORK_SEQUENCE: Project[] = [...PROJECTS, ...MORE_WORK];

/**
 * Every project in the index has a page at `/work/<id>`.
 *
 * There is one helper rather than a `href` field so a project can never carry a
 * link to a page that does not exist, and `generateStaticParams` cannot drift
 * away from what the cards actually point at.
 */
export const caseStudyPath = (id: string) => `/work/${id}`;

export const findProject = (id: string): Project | undefined =>
  WORK_SEQUENCE.find((p) => p.id === id);

/** The project on either side of this one, for the case study's footer nav. */
export function neighboursOf(id: string) {
  const i = WORK_SEQUENCE.findIndex((p) => p.id === id);
  if (i < 0) return { prev: undefined, next: undefined };
  const n = WORK_SEQUENCE.length;
  return {
    prev: WORK_SEQUENCE[(i - 1 + n) % n],
    next: WORK_SEQUENCE[(i + 1) % n],
  };
}

export type Capability = {
  id: string;
  /**
   * Which monoline icon from `Icons.tsx` this capability uses.
   *
   * Explicit, and NOT the same as `id`. `Icon` falls through to `null` for a name
   * it does not know, so deriving it from the id silently rendered two of these
   * six cards with no icon at all — the ids are `integrations` and `motion`, and
   * the icon set calls those glyphs `api` and `gsap`.
   */
  icon: string;
  title: string;
  copy: string;
  /**
   * The projects this capability is known to have been used on.
   *
   * Only entries the site's own content supports are listed — today that is one.
   * The testimonials name Alosant as an ongoing relationship, so "Ongoing
   * Support" points there and nothing else claims a pairing it cannot back up.
   * An empty list is not a gap in the code; it is the honest state of the
   * record. Fill these in and the cards pick them up with no other change.
   */
  projects: string[];
  /** The three things a client actually receives under this heading. */
  points: string[];
};

export const CAPABILITIES: Capability[] = [
  {
    id: "webflow",
    icon: "webflow",
    title: "Hand-coded Websites",
    copy: "Fast, structured sites written in code, with a content model your team can actually edit.",
    points: ["Built in Next.js, not a page builder", "Content you can edit yourself", "Launch-ready speed and SEO"],
    projects: ["1910", "semiconbio", "happyring", "omicron", "alosant", "lilipad"],
  },
  {
    id: "ai-workflows",
    icon: "sparkles",
    title: "AI Agents",
    copy: "Voice and chat agents that answer, qualify and book, on the models that suit the job.",
    points: ["Answers enquiries around the clock", "Qualifies and books for you", "Hands over with the notes written"],
    projects: ["rayai", "puck"],
  },
  {
    id: "automation",
    icon: "workflow",
    title: "Workflow Automation",
    copy: "The repetitive work between your tools, mapped once and left to run.",
    points: ["n8n, Make, Zapier or Windmill", "Retries and alerts when something fails", "Runs without anyone watching"],
    projects: ["puck", "rayai"],
  },
  {
    id: "integrations",
    icon: "api",
    title: "Integrations & APIs",
    copy: "Your site, CRM, calendar and payments talking to each other instead of to you.",
    points: ["Custom code where no connector exists", "One source of truth for your data", "Documented endpoints and webhooks"],
    projects: ["semiconbio", "pssltd"],
  },
  {
    id: "motion",
    icon: "gsap",
    title: "Motion & Interaction",
    copy: "Movement that explains the product, built so it stays smooth on a real laptop.",
    points: ["Scroll-driven sequences like this one", "GSAP and WebGL where they earn it", "Respects reduced-motion settings"],
    projects: ["1910", "happyring"],
  },
  {
    id: "support",
    icon: "support",
    title: "Handover & Support",
    copy: "You own everything that gets built, and you are not left alone with it.",
    points: ["Documented and yours to keep", "A walkthrough for your team", "Monthly hours when you need them"],
    projects: ["alosant"],
  },
];

/**
 * Ways to work — there are no packages and no prices, so each arrangement says
 * what it is good for, what you get, and the first concrete step. Listed in the
 * order they are wanted: consultancy and full-time first.
 *
 * `shape` is how the arrangement looks on a calendar; `flags` are the moments
 * marked on it, as [week, label].
 */
export const ENGAGEMENTS = [
  {
    key: "consultancy",
    name: "Ongoing consultancy",
    line: "A standing seat at your table: advising first, then building what we decide.",
    goodFor: "Teams that keep finding new things worth automating.",
    starts: "A call, then a first month scoped on a single page.",
    get: "A set rhythm of days each month and one running priority list.",
    span: "Rolling",
    shape: "rhythm",
    flags: [[1, "Kick-off"], [5, "Review"], [9, "Review"]],
  },
  {
    key: "fulltime",
    name: "Full-time role",
    line: "Joining your team to own the site and the systems behind it.",
    goodFor: "Companies that want this capability in-house.",
    starts: "A conversation about the role, then your usual hiring process.",
    get: "One person across web, automation and AI, every working day.",
    span: "Open-ended",
    shape: "line",
    flags: [[1, "Day one"], [5, "Owning a system"], [10, "Part of the team"]],
  },
  {
    key: "project",
    name: "Freelance project",
    line: "A defined build, taken from scope to launch.",
    goodFor: "A new site, an agent or a pipeline with a clear finish line.",
    starts: "A call, then a written scope you can say yes or no to.",
    get: "The build, the handover and the documentation.",
    span: "Weeks",
    shape: "bar",
    flags: [[1, "Scope"], [3, "Build"], [6, "Launch"]],
  },
  {
    key: "gig",
    name: "Short gig",
    line: "One problem, fixed fast.",
    goodFor: "A broken automation, an audit, or a single feature.",
    starts: "A message describing the problem. You get a yes, a no, or a question back.",
    get: "The fix, and a short note on what was wrong.",
    span: "Days",
    shape: "block",
    flags: [[1, "Brief"], [2, "Shipped"]],
  },
] as const;

/** What a visitor can tick in the brief builder. */
export const BRIEF_NEEDS = [
  "A new website",
  "Less manual admin",
  "An AI agent",
  "My tools connected",
  "A senior hand on the team",
  "Not sure yet",
] as const;

/**
 * Proof — what stands in for testimonials until there are real ones.
 *
 * `PROOF_FACTS` are statements about THIS site, each one checkable by anyone
 * who opens it. `PROOF_QUOTES` are placeholders and are labelled as such on the
 * page: replace the text and drop the `placeholder` flag when a client has said
 * something. `PROMISES` are commitments, written only because they are kept.
 */
export const PROOF_FACTS = [
  { title: "Hand-coded", copy: "Next.js and TypeScript, written line by line. No page builder touched this." },
  { title: "Five scroll sequences", copy: "Each one is a single timeline you can scrub to any frame, forwards or back." },
  { title: "Works with motion off", copy: "Turn on reduced motion and every section has a still version that says the same thing." },
  { title: "Tested like software", copy: "More than a hundred automated checks run against it on desktop and phone." },
] as const;

export const PROOF_QUOTES = [
  { placeholder: true, quote: "A sentence from a client goes here, once one has said it.", name: "[Client name]", role: "[Role, company]" },
  { placeholder: true, quote: "Something specific about what changed after the build.", name: "[Client name]", role: "[Role, company]" },
  { placeholder: true, quote: "And one about what it was like to work together.", name: "[Client name]", role: "[Role, company]" },
] as const;

export const PROMISES = [
  { title: "You own everything.", copy: "Code, accounts, automations and documentation are yours, handed over in full." },
  { title: "No lock-in.", copy: "Nothing is built so that only I can run it. Take it in-house whenever you like." },
  { title: "A reply within a working day.", copy: "Every message gets an answer within one working day." },
  { title: "Scope in writing first.", copy: "Nothing starts until what we are doing is written down and agreed." },
] as const;

export const PLANS = [
  {
    id: "starter",
    badge: "New sites & migrations",
    name: "Starter Build",
    rate: "Launch in one to two weeks",
    copy:
      "A clean Webflow site ready to launch in one to two weeks. Perfect for brands that need a solid online presence without the complexity.",
    features: [
      "Mid-level animations and interactions",
      "Launch within one to two weeks",
      "Webflow Editor training after launch",
    ],
    lead: false,
  },
  {
    id: "partnership",
    badge: "Recommended",
    name: "Ongoing Partnership",
    rate: "30 hours a month · 3 month minimum",
    copy:
      "Your dedicated Webflow developer. Whatever your site needs, handled — built for brands that need continuous growth and long-term collaboration.",
    features: [
      "New pages, sections, and features",
      "Campaign-driven updates, modules and content blocks",
      "Maintenance, bug fixes and content updates",
      "Technical SEO and performance optimization",
      "Unused hours roll over (up to 3 months)",
    ],
    lead: true,
  },
  {
    id: "custom",
    badge: "Complex, tailored builds",
    name: "Custom Project",
    rate: "Scoped per project",
    copy:
      "High-end Webflow development for complex projects. Every scope is different, so every project starts with a conversation.",
    features: [
      "Advanced interaction and animation systems",
      "Scalable CMS architecture with multi-collection setups",
      "Complex layouts, modular components and dynamic content",
      "Integration-ready structure for APIs and external tools",
      "14 days post-launch support included",
    ],
    lead: false,
  },
] as const;

/**
 * Who the voice belongs to, read off the role text each one supplied.
 *
 *   client        — the company he built for            (a VP or CEO of the brand)
 *   studio        — an agency or studio he developed for (they sell the work on)
 *   collaborator  — a peer he worked alongside
 *
 * This is an inference, not a record — the roles say "Moat Agency" and "Povio",
 * not "agency engagement" — so correct any of them here and the wall's colour and
 * chip follow. It is worth having because the split is a selling point in itself:
 * he is hired directly by brands *and* trusted by the studios those brands hire.
 */
export type TestimonialKind = "client" | "studio" | "collaborator";

/**
 * The industry group a testimonial's chip is toned by.
 *
 * Groups rather than one tone per industry: nine industries cannot have nine
 * tones in a nine-token palette before the type contrast breaks. Only the groups
 * that actually occur are listed; anything else takes the neutral chip.
 */
export type IndustryGroup = "proptech" | "agency" | "design";

export type Testimonial = {
  id: string;
  kind: TestimonialKind;
  /**
   * The client's industry, where it is knowable. Alosant's is real, read from the
   * work band's own tag; the rest are read off each role — "Moat Agency" and
   * "Povio" are agencies, "Product / Web Designer" is a designer. Bart-Jan's is
   * not recorded anywhere, so his card carries no chip rather than a guess.
   */
  industry?: string;
  headline: string;
  quote: string;
  name: string;
  role: string;
  face: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "danette",
    industry: "PropTech",
    kind: "client",
    headline: "Trusted long-term collaborator.",
    quote:
      "Nenad has been a fantastic partner to work with and continues to be an essential part of our team. He communicates clearly and promptly, and his work consistently exceeds expectations. He resolves technical challenges quickly and efficiently, always demonstrating skill, reliability, and a strong commitment to quality.",
    name: "Danette Beal",
    role: "VP of Marketing, Alosant",
    face: "/img/face-danette.png",
  },
  {
    id: "petar",
    industry: "Agency",
    kind: "studio",
    headline: "Thinks through the entire experience.",
    quote:
      "Nenad doesn't just code Webflow — he thinks through the experience. Motion, pacing, narrative flow: all aligned with technical excellence. The result is sites that feel cohesive, intentional, complete. A true partner in execution. No gaps, no compromises.",
    name: "Petar Stojakovic",
    role: "Founder, fiftyseven.co",
    face: "/img/face-petar.jpeg",
  },
  {
    id: "klemen",
    industry: "Agency",
    kind: "studio",
    headline: "Reliable, skilled, and easy to work with.",
    quote:
      "Nenad was great to work with. He delivered our websites on time, gave our design team helpful guidance, and suggested smarter solutions that really improved the final results. Super reliable and easy to collaborate with — highly recommend.",
    name: "Klemen Vute",
    role: "PM from Povio",
    face: "/img/face-klemen.png",
  },
  {
    id: "johanna",
    industry: "Agency",
    kind: "studio",
    headline: "The details that set him apart.",
    quote:
      "I've worked with Nenad for many years, and he still surprises me with the speed and quality of his work. His attention to the small details, the ones most engineers overlook, makes all the difference for great websites. As long as he wants to work with us, we'll keep building together.",
    name: "Johanna Dahlroos",
    role: "Co-Founder & Creative Director, Moat Agency",
    face: "/img/face-johana.png",
  },
  {
    id: "marko-ivanovic",
    industry: "Agency",
    kind: "studio",
    headline: "Design-focused, reliable development.",
    quote:
      "We've hired Nenad for several projects, and working with him has always been effortless thanks to his good understanding of design. He's dedicated to perfecting each delivery for our clients, ensuring a smooth and engaging web experience.",
    name: "Marko Ivanovic",
    role: "Legacy Agency",
    face: "/img/face-marko-ivanovic.png",
  },
  {
    id: "chrissy",
    industry: "Design",
    kind: "collaborator",
    headline: "A developer with a true product mindset.",
    quote:
      "Nenad is a rare blend of speed, quality, and collaboration. He actively contributes ideas that improve how designs translate into development, and he approaches every build with a product mindset. He's reliable, detail-oriented, and consistently delivers high-quality work on tight timelines.",
    name: "Chrissy Cowdrey",
    role: "Product / Web Designer",
    face: "/img/face-chrissy.png",
  },
  {
    id: "marko-ilic",
    industry: "Agency",
    kind: "studio",
    headline: "A proven expert you trust.",
    quote:
      "I've been working with Nenad for years and have always been impressed by his work ethic, fast turnaround, and attention to detail. He clearly knows his craft, takes a thoughtful and disciplined approach, and consistently delivers results that meet a high professional standard.",
    name: "Marko Ilic",
    role: "Founder, see.design",
    face: "/img/face-marko-ilic.png",
  },
  {
    id: "bart",
    kind: "client",
    headline: "Exceptional leadership and technical ownership.",
    quote:
      "We loved working with Nenad on the Autorank website. He showed exceptional leadership throughout the project, taking full ownership of the website infrastructure and guiding key technical decisions. His structured approach and attention to quality ensured a reliable and scalable outcome.",
    name: "Bart-Jan Leyts",
    role: "CEO, Autorank.com",
    face: "/img/face-bart.png",
  },
];

export const FAQS = [
  {
    q: "Do you use Webflow or other page builders?",
    a: "No. Everything is hand-coded, mostly in Next.js and TypeScript. Your team still gets a content model they can edit without calling me.",
  },
  {
    q: "What kinds of automation do you build?",
    a: "Whatever is repetitive between your tools: lead handling, booking, invoicing, reporting, content. I build in n8n, Make, Zapier or Windmill, and write custom code where no connector exists.",
  },
  {
    q: "Which AI models do you work with?",
    a: "OpenAI, Claude, Gemini, DeepSeek, MiMo and open-source models, with ElevenLabs for voice. I choose per job, not per brand.",
  },
  {
    q: "Are you available full-time, or only as a contractor?",
    a: "Both. I work as a consultant today and I am open to a full-time role, ongoing consultancy, a freelance project or a short gig.",
  },
  {
    q: "What do you charge?",
    a: "There is no price list. It depends on the arrangement and the scope, so you get a number in writing after the first conversation, before anything starts.",
  },
  {
    q: "How do we start?",
    a: "With a conversation about what you need. Then I write the scope down, and nothing begins until you have agreed to it.",
  },
  {
    q: "Who owns what you build?",
    a: "You do. Code, accounts, automations and documentation are handed over in full, and nothing is built so that only I can run it.",
  },
  {
    q: "Do you work under NDA?",
    a: "Yes. I am happy to sign one before we talk about the details.",
  },
] as const;

/**
 * The rail index line for each editorial section. Every value is counted from the
 * data above rather than typed, so a new project or chapter updates the rail by
 * itself and the two can never disagree.
 */
export const RAIL_INDEX = {
  about: `${FLOW.steps.length} steps · one enquiry`,
  work: `${BUILDS.length} kinds of build · ${WORK_SEQUENCE.length} in the index`,
  capabilities: `${CAPABILITIES.length} things · every build`,
  clients: `${TESTIMONIALS.length} voices · ${new Set(WORK_SEQUENCE.map((w) => w.tag)).size} industries`,
  faq: `${FAQS.length} questions · straight answers`,
} as const;

export const CTA = {
  eyebrow: "Have something in mind?",
  titleLines: ["A site, a system,", "or a seat on", "your team."],
  copy: "Tell me what you are working on and how you would like to work. I will tell you honestly whether I am the right person for it.",
  cta: "Start a project",
} as const;

export const FOOTER = {
  socials: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/kimjoshuadev/" }],
  line: "Websites that work. Systems that run.",
} as const;

/**
 * What is actually known about each voice, derived rather than re-typed.
 *
 * A testimonial's industry is knowable only when the client also appears in the
 * work band — Alosant does, seven of the eight do not, and several are agencies
 * whose own industry is not the industry they hired him for. The service side is
 * the same: a capability names its projects, and only one does so far.
 *
 * So these return nothing for most cards, on purpose. Filling the gaps means
 * either tagging the missing clients in the work band or naming their industries
 * and the work he did for them here.
 */
export const industryOf = (t: Testimonial): string | undefined =>
  t.industry ?? WORK_SEQUENCE.find((p) => t.role.includes(p.name))?.tag;

/** Which tone the industry chip takes. */
export const GROUP_OF: Record<string, IndustryGroup> = {
  PropTech: "proptech",
  Agency: "agency",
  Design: "design",
};

/** The capabilities delivered for a project — derived from CAPABILITIES[].projects. */
export const servicesForProject = (id: string): string[] =>
  CAPABILITIES.filter((c) => c.projects.includes(id)).map((c) => c.title);

/** The client who spoke about this project, where one did. */
export const voiceForProject = (project: Project): Testimonial | undefined =>
  TESTIMONIALS.find((t) => t.id === project.testimonial);

export const servicesOf = (t: Testimonial): string[] => {
  /* A capability names its PROJECTS, not its testimonials — so the client has to
     be resolved to their project first. Comparing against the testimonial's own id
     silently matched nothing. */
  const project = WORK_SEQUENCE.find((p) => t.role.includes(p.name));
  if (!project) return [];
  return CAPABILITIES.filter((c) => c.projects.includes(project.id)).map((c) => c.title);
};
