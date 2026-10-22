/**
 * The site's content model.
 * Everything about a client here is already public: no invented copy, no
 * invented figures, and no individual named.
 */


export const EMAIL = "kimjoshuadr@gmail.com";

/** The one place the LinkedIn address is written: the footer and the structured data both read it. */
export const LINKEDIN = "https://www.linkedin.com/in/kimjoshua-ai/";

/** An email to the owner with the subject already written. */
export const mailTo = (subject: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

export const NAV_LINKS = [
  { id: "work", label: "Projects" },
  { id: "about", label: "How it works" },
  { id: "automations", label: "Automations" },
  { id: "testing", label: "How I test" },
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

/**
 * The full-time line above the hero's title. The CV is sent on request rather
 * than hosted, because it is kept current per application.
 */
export const HIRE = {
  text: "Open to full-time AI / Automation Engineer roles. Remote, worldwide.",
  cv: { label: "CV on request", subject: "Full-time role: CV request" },
  github: { label: "GitHub", href: "https://github.com/kimjoshuadr" },
} as const;

/**
 * Results from client work. Deliberately not credited to a client: they are
 * totals across engagements. The library figures beside them on the page are
 * counted from the catalogue in `Results.tsx`, not typed here.
 */
export const RESULTS = [
  { value: "20,000+", label: "deals routed" },
  { value: "30%+", label: "time saved" },
  { value: "$200k+", label: "gross profit" },
] as const;

/** The line under the hero's buttons: four of the companies in the index. */
export const HERO_PROOF = "Built for Passivae \u00b7 monno \u00b7 Trestle \u00b7 OWWO Chicken";

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

/**
 * The stack — every platform and technology the owner has built with, grouped.
 * This is the one list the reel's chips and its closing wall are built from, so
 * a tool can never be on a plate and missing from the wall.
 *
 * Every name here was either named by the owner or is in one of their projects
 * or production workflows: add nothing that has not been used. `tint` is the
 * mark beside the name, close to each tool's own colour (white where the
 * tool's own is too dark for the wall).
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
      { name: "Vite", tint: "#9135ff" },
      { name: "Vue 3", tint: "#4fc08d" },
      { name: "Framer Motion", tint: "#ffffff" },
      { name: "Lenis", tint: "#a3a3a3" },
      { name: "Hono", tint: "#e36002" },
      { name: "tRPC", tint: "#2596be" },
      { name: "next-intl", tint: "#a3a3a3" },
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
      { name: "Apify", tint: "#a3a3a3" },
      { name: "Firecrawl", tint: "#a3a3a3" },
      { name: "SerpAPI", tint: "#a3a3a3" },
      { name: "RSS", tint: "#ffa500" },
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
      { name: "Groq", tint: "#a3a3a3" },
      { name: "ElevenLabs", tint: "#ffffff" },
      { name: "Higgsfield", tint: "#d1fe17" },
      { name: "Open-source models", tint: "#a3a3a3" },
    ],
  },
  {
    key: "data",
    label: "Data and backend",
    tools: [
      { name: "Supabase", tint: "#3fcf8e" },
      { name: "PostgreSQL", tint: "#4169e1" },
      { name: "MongoDB", tint: "#47a248" },
      { name: "Drizzle", tint: "#c5f74f" },
      { name: "Bubble", tint: "#a3a3a3" },
      { name: "Airtable", tint: "#18bfff" },
      { name: "Google Sheets", tint: "#34a853" },
      { name: "Google Drive", tint: "#4285f4" },
      { name: "Tableau", tint: "#e97627" },
      { name: "PostHog", tint: "#ffffff" },
      { name: "Umami", tint: "#ffffff" },
      { name: "Docker", tint: "#2496ed" },
      { name: "Coolify", tint: "#ffffff" },
      { name: "AWS", tint: "#ff9900" },
      { name: "Google Cloud", tint: "#4285f4" },
      { name: "Cloudflare", tint: "#f38020" },
    ],
  },
  {
    key: "business",
    label: "CRM and business tools",
    tools: [
      { name: "HubSpot", tint: "#ff7a59" },
      { name: "GoHighLevel", tint: "#a3a3a3" },
      { name: "Twenty", tint: "#ffffff" },
      { name: "SuiteCRM", tint: "#a3a3a3" },
      { name: "Vtiger", tint: "#a3a3a3" },
      { name: "Odoo", tint: "#ffffff" },
      { name: "ERPNext", tint: "#0089ff" },
      { name: "Open Mercato", tint: "#a3a3a3" },
      { name: "Shopify", tint: "#7ab55c" },
      { name: "Stripe", tint: "#635bff" },
      { name: "Wix", tint: "#0c6efc" },
      { name: "Strapi", tint: "#4945ff" },
      { name: "Cal.com", tint: "#ffffff" },
      { name: "Documenso", tint: "#a3a3a3" },
      { name: "Google Workspace", tint: "#4285f4" },
      { name: "Notion", tint: "#ffffff" },
      { name: "ClickUp", tint: "#7b68ee" },
      { name: "Jira", tint: "#ffffff" },
      { name: "Plane", tint: "#ffffff" },
    ],
  },
  {
    key: "messaging",
    label: "Messaging and community",
    tools: [
      { name: "Slack", tint: "#a3a3a3" },
      { name: "Discord", tint: "#5865f2" },
      { name: "Telegram", tint: "#26a5e4" },
      { name: "WhatsApp Business", tint: "#25d366" },
      { name: "Twilio", tint: "#a3a3a3" },
      { name: "Gmail", tint: "#ea4335" },
      { name: "SendGrid", tint: "#a3a3a3" },
      { name: "Mailchimp", tint: "#ffe01b" },
      { name: "Kit", tint: "#ffffff" },
      { name: "Listmonk", tint: "#ffffff" },
      { name: "Mautic", tint: "#4e5e9e" },
      { name: "Postiz", tint: "#ffffff" },
      { name: "Zendesk", tint: "#ffffff" },
      { name: "Intercom", tint: "#6afdef" },
      { name: "Chatwoot", tint: "#1f93ff" },
      { name: "Mattermost", tint: "#ffffff" },
      { name: "Skool", tint: "#a3a3a3" },
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
  copy: "Sites are written in code. Around them, these are the tools I have built with and connected, open source and enterprise alike.",
} as const;

/** The mark colour for a tool named on a plate. */
export const tintOf = (name: string): string =>
  STACK.flatMap((g) => g.tools as readonly { name: string; tint: string }[]).find((t) => t.name === name)?.tint ?? "#ffffff";

export type ProjectCategory = "saas" | "websites" | "ecommerce" | "community";

/** The filter labels, in the order the tabs are shown. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  saas: "SaaS & platforms",
  websites: "Websites",
  ecommerce: "E-commerce",
  community: "Community & marketing",
};

/** One piece of the work on a project: what it was, and what it involved. */
export type ProjectPart = { title: string; copy: string };

/**
 * A project with a page of its own.
 *
 * Every fact here is already public, on the client's own site or in the
 * published case study. There are no figures, because none are published, and
 * no person is named: a quote is attributed to a role and a company.
 * `techStack` is read from the project's own dependencies and left out where
 * they could not be read.
 */
export type Project = {
  id: string;
  name: string;
  /** The sector, as one short label. */
  tag: string;
  category: ProjectCategory;
  /** One sentence: the row in the index and the page's description. */
  copy: string;
  about: string[];
  built: ProjectPart[];
  notes?: ProjectPart[];
  techStack?: string[];
  /** The public address, where there is one. */
  liveUrl?: string;
  /**
   * Set when the screens were captured from a local build because the project
   * has no public address. The page says so.
   */
  local?: boolean;
  /** Whether the project is currently in progress / in build. */
  inProgress?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "coremote",
    name: "CoRemote",
    tag: "Agency website",
    category: "websites",
    copy: "The site for a remote-first studio in the Philippines that builds and runs the systems behind marketing, product and revenue.",
    about: [
      "CoRemote is a remote-first studio in the Philippines. It builds and runs the systems behind a company's marketing, product and revenue: integrations, automation and AI, wired into one layer.",
      "The site had to carry a wide offer without losing anyone: four groups of services, the case studies, and a set of tools a visitor can use before they ever book a call.",
    ],
    built: [
      { title: "Marketing site", copy: "The public site: services, the case studies, how the work runs, and the company pages." },
      { title: "Case study library", copy: "Every case study follows one structure, so a new one is content rather than a new page design." },
      { title: "Visitor tools", copy: "A free website audit, a project cost estimator and a stack recommender, each ending in a way to start a conversation." },
    ],
    techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "GSAP", "Lenis"],
    liveUrl: "https://coremote.io/",
  },
  {
    id: "passivae",
    name: "Passivae",
    tag: "Recruitment platform",
    category: "saas",
    copy: "A recruitment network where recruiters run their own talent communities, with the hiring pipeline built in.",
    about: [
      "Passivae sits somewhere between a professional network and a freelance marketplace. Recruiters run their own communities and invite talent to join them, then send talent proposals to the jobs companies post. The recruitment pipelines and the applicant tracking are built into the platform.",
      "Before Passivae, recruiters did this by hand. Candidates were tracked in spreadsheets, communities were scattered across chat groups, and nothing connected a proposal to the job it was written for.",
    ],
    built: [
      { title: "Product build", copy: "The platform itself: recruiter communities, talent proposals against company job posts, and the pipelines and applicant tracking behind them." },
      { title: "Design and brand", copy: "The product design and the brand it carries." },
      { title: "Campaigns and marketing", copy: "The marketing for the platform, with the automation behind it." },
      { title: "Automation", copy: "Onboarding, notifications, reporting and deploys run on their own, so operations keep moving without someone remembering to push them." },
    ],
    notes: [
      { title: "One pipeline, two sides", copy: "The hardest part was the built-in pipeline and applicant tracking. Its stages and hand-offs had to make sense to a recruiter managing talent and to a company comparing proposals, at the same time." },
      { title: "Community before job board", copy: "Each recruiter owns a community and invites talent into it, so a candidate arrives through a person rather than a listing." },
    ],
    liveUrl: "https://www.passivae.com/",
  },
  {
    id: "trestle",
    name: "Trestle",
    tag: "Construction software",
    category: "saas",
    copy: "An operating system for construction companies, where the estimate becomes the budget without being retyped.",
    about: [
      "Trestle is an operating system for construction companies. Estimating, budgeting, procurement, field work and finance sit in one connected system, so a number is entered once and carried everywhere it is needed.",
      "The idea came out of market research, and one gap stood out. A builder prepares the estimate in one sheet, retypes it into the budget, and from that day the two drift apart. Trestle is in build and not yet public.",
    ],
    built: [
      { title: "Product build", copy: "The application: estimating, budgeting, procurement, field and finance as parts of one system rather than separate tools." },
      { title: "Design and brand", copy: "The product interface and the Trestle brand, including the mark." },
      { title: "Marketing website", copy: "The public site that explains the system to builders." },
      { title: "Campaigns and marketing", copy: "The campaigns that will take Trestle to market." },
    ],
    notes: [
      { title: "Estimating comes first", copy: "It is where every other number in a project starts, so it is where the system starts too." },
      { title: "Typed once", copy: "The estimate becomes the budget without being retyped. That one hand-off is the reason the product exists." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "Framer Motion", "Lenis"],
    liveUrl: "https://trestle.so/",
  },
  {
    id: "tally",
    name: "Tally",
    tag: "Tax and compliance",
    category: "saas",
    copy: "Tax compliance for Philippine sellers: marketplace orders in, compliant e-invoices out, with an AI agent to explain the rules.",
    about: [
      "Tally started as an AI compliance copilot for Philippine businesses: a seller uploads orders from Shopee, TikTok Shop or Lazada, and Tally prepares BIR-compliant e-invoices and explains the rules in plain language.",
      "Tally has since pivoted toward a service model, where compliance is handled for the business rather than left to software alone. It is in build and not yet public, and it is meant for sellers of every size, from one person with a shop to a team with a bookkeeper.",
    ],
    built: [
      { title: "Product build", copy: "The application, including the invoice studio that turns uploaded orders into compliant e-invoices." },
      { title: "AI and automation", copy: "The AI agent that answers compliance questions, and the order handling for the marketplaces." },
      { title: "Design and brand", copy: "The product and the Tally brand, mascot included." },
      { title: "Marketing site and campaigns", copy: "The public site and the campaigns around it." },
    ],
    notes: [
      { title: "Why a pixel-art eagle", copy: "Tax is a subject people avoid, and a friendly character lowers the guard. It is a Philippine eagle, for a product made for the Philippines. And every other compliance tool looks like a bank." },
      { title: "A pivot, mid-build", copy: "The product changed direction while it was being built, from software a seller operates to a service that does the work. The brand and the groundwork carried over." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://tally.com.ph/",
  },
  {
    id: "monno",
    name: "monno",
    tag: "Events platform",
    category: "saas",
    copy: "An events platform where organisers publish events, take registrations and build a following.",
    about: [
      "monno is an events platform. An organiser publishes an event page, takes registrations and keeps every guest informed, and guests find events and calendars worth showing up for.",
      "monno came out of producing events. Running them showed what the usual tools get wrong: they treat an event as a form to fill in, and the organiser starts from zero every time. monno is live and in its early days.",
    ],
    built: [
      { title: "Product build", copy: "The platform: event pages, registrations, calendars and discovery." },
      { title: "Design and brand", copy: "The product and the monno brand, including the mark and wordmark." },
      { title: "Marketing site and campaigns", copy: "The public site and the campaigns around it." },
      { title: "Automation and integrations", copy: "The services the platform depends on, including the messages that keep guests in the loop." },
    ],
    notes: [
      { title: "Organisers build a following", copy: "People subscribe to an organiser's calendar, so the next event starts with an audience instead of an empty list." },
      { title: "Made for every kind of host", copy: "Tech and Web3 meetups, local organisers and community hosts all use the same platform." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "GSAP", "Three.js", "Lenis"],
    liveUrl: "https://monno.io/",
  },
  {
    id: "funnel-foundry",
    name: "Funnel Foundry",
    tag: "Marketing SaaS",
    category: "saas",
    copy: "An all-in-one marketing suite: CRM, email, automation and pages, with lead scraping and copy analysis built in.",
    about: [
      "Funnel Foundry is an all-in-one marketing suite: CRM, email, automation and pages in one place, for agencies, small businesses and people selling courses alike.",
      "It was built around the question every campaign starts with and most tools skip: where do I get my leads, and how do I reach them? So alongside the usual suite it has lead scraping and copy analysis built in.",
    ],
    built: [
      { title: "Product build", copy: "The product, built on Open Mercato, an open-source foundation, and the site around it." },
      { title: "Design and brand", copy: "The interface and the brand." },
      { title: "Campaigns and marketing", copy: "The campaigns that bring people to the product." },
      { title: "Automation and AI", copy: "The automated workflows behind the product and its marketing." },
    ],
    notes: [
      { title: "Lead scraping, built in", copy: "Finding who to talk to is part of the product, not a separate subscription." },
      { title: "Copy analysis", copy: "The message is looked at before it goes out." },
    ],
    techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "GSAP", "Three.js", "Open Mercato"],
    liveUrl: "https://funnelffoundry.net/",
  },
  {
    id: "owwo",
    name: "OWWO Chicken",
    tag: "Food brand",
    category: "websites",
    copy: "A site for a boneless Korean fried chicken brand, built to win franchisees rather than sell a meal.",
    about: [
      "OWWO Chicken is a boneless Korean fried chicken brand.",
      "Before this, OWWO's enquiries lived in Messenger, a spreadsheet and Instagram. The site was not built to sell a meal. It was built for the people who might open an OWWO or invest in one.",
    ],
    built: [
      { title: "Website", copy: "The OWWO site for franchise and investor enquiries, built fast." },
      { title: "Design and brand", copy: "Design for the brand across the site." },
      { title: "CRM integration", copy: "Forms on the site feed Vtiger through n8n, so every enquiry lands in the CRM without anyone copying it over." },
    ],
    notes: [
      { title: "A restaurant site with a different customer", copy: "Most food sites chase orders. This one speaks to franchisees and investors, which changes what the pages have to say." },
      { title: "From three places to one", copy: "Messenger, a sheet and Instagram became a single record in the CRM." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Supabase", "n8n", "Vtiger"],
    liveUrl: "https://owwochicken.com.ph/",
  },
  {
    id: "construction-hub",
    name: "Construction Hub PH",
    tag: "Training and LMS",
    category: "saas",
    copy: "A website and a learning platform that train estimators and remote construction professionals for global firms.",
    about: [
      "Construction Hub PH trains aspiring estimators and remote construction professionals in the tools and workflows global firms are hiring for.",
      "It needed two things that work as one: a site the industry could lean on, and a learning platform people would actually open.",
    ],
    built: [
      { title: "Website", copy: "The public site: the training programmes, the blog, and the way in." },
      { title: "LMS", copy: "The learning platform where the courses are taken, with enrolment and payment." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MongoDB", "Stripe"],
    liveUrl: "https://www.constructionhubph.com/",
  },
  {
    id: "budi",
    name: "Budi",
    tag: "Performance drink",
    category: "websites",
    copy: "The pre-launch site and operations for a performance drink brand with a friendly face.",
    about: [
      "Budi is a performance drink brand. It is not on sale yet.",
      "Performance drinks tend to shout. Budi is the friendly sidekick instead, which is why there is a smile inside the logo.",
    ],
    built: [
      { title: "Website and product build", copy: "The Budi site and product, ahead of launch." },
      { title: "Design and brand", copy: "The brand, including the mark with the face in it." },
      { title: "Campaigns and marketing", copy: "Budi's campaigns in the run-up to launch." },
      { title: "Automation and AI", copy: "Automation runs the social content, handles customer chat, manages the community and tracks orders and stock." },
    ],
    notes: [
      { title: "A sidekick, not a hype man", copy: "The personality is warm and helpful. Every piece of the brand is checked against that." },
      { title: "Operations ready before day one", copy: "Content, chat, community and stock tracking are in place before the first drink is sold." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "Framer Motion"],
    local: true,
    inProgress: true,
  },
  {
    id: "funded-prop-traders",
    name: "Funded Prop Traders",
    tag: "Prop firm review site",
    category: "websites",
    copy: "A review site that helps traders compare prop firms, kept current by automation and backed by payout proof.",
    about: [
      "Funded Prop Traders is a review site for proprietary trading firms. Traders use it to compare firms before they pay for a challenge.",
      "A review site is only worth reading if it is current and backed by proof. So the build leaned on automation to keep content fresh and on evidence that firms actually pay.",
    ],
    built: [
      { title: "Website and product build", copy: "The review site." },
      { title: "Design and brand", copy: "The brand and the interface." },
      { title: "Automation and AI", copy: "AI drafts the blog, payout proofs are collected and published, and a recommender suggests which challenge fits a trader." },
      { title: "Community", copy: "A Discord for traders: set up, questions answered inside it, announcements and events run." },
    ],
    notes: [
      { title: "Which challenge fits you", copy: "The AI suggests which challenge fits a trader, so the site gives a recommendation as well as a comparison." },
      { title: "Payout proofs", copy: "Proof that a firm paid is the thing traders most want to see, so the site collects and shows it." },
    ],
    techStack: ["React", "Vite", "TypeScript", "Tailwind CSS", "Hono", "tRPC", "Drizzle", "Better Auth", "Supabase", "GSAP", "Three.js"],
    liveUrl: "https://fundedproptraders.com/",
  },
  {
    id: "ck-propfirm",
    name: "CK Propfirm",
    tag: "Prop trading firm",
    category: "saas",
    copy: "A prop firm's whole path for a trader: website, checkout, onboarding and dashboard, carried through a rebrand.",
    about: [
      "CK Propfirm is a proprietary trading firm. It was called CK Capital before it rebranded.",
      "A prop firm's product is a path: a trader buys a challenge, gets set up, and then watches their progress. This build is that path, and then the firm's change of name.",
    ],
    built: [
      { title: "Website, checkout and dashboard", copy: "The public website, the checkout and onboarding, and the dashboard traders use." },
      { title: "Rebrand rollout", copy: "The firm chose its new name. It was rolled out across the site and its channels." },
      { title: "Campaigns and marketing", copy: "Campaigns covered challenge sales, community growth, and affiliates and partners." },
      { title: "Automation and AI", copy: "Emails and CRM run automatically, and AI helps produce the firm's content." },
    ],
    notes: [
      { title: "One path for the trader", copy: "Site, checkout, onboarding and dashboard were built together, so a trader does not feel the joins." },
      { title: "A rename without a restart", copy: "CK Capital became CK Propfirm across every surface while the business kept running." },
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "Framer Motion", "next-intl", "Vue 3"],
    liveUrl: "https://ckpropfirm.com/",
  },
  {
    id: "wchampfx",
    name: "WChampFX",
    tag: "Trading course",
    category: "websites",
    copy: "A trading course's platform, checkout and student community, with campaigns that give value before they ask for a sale.",
    about: [
      "WChampFX is a trading course: recorded lessons, live sessions and a student community.",
      "Course marketing usually leads with the price. WChampFX leads with free value, and the course follows for the people who want more.",
    ],
    built: [
      { title: "Course platform", copy: "The platform where students log in and learn." },
      { title: "Checkout and access", copy: "Payment unlocks the course and the community." },
      { title: "Student community", copy: "The community where students learn together, set up and run." },
      { title: "Campaigns and follow-up", copy: "Campaigns give value first, and automated follow-up stays with the people who have not joined yet." },
    ],
    notes: [
      { title: "Free value first", copy: "The campaigns teach something before they sell anything." },
      { title: "Follow-up that does not drop", copy: "Interested leads are followed up automatically, so nobody is forgotten after a first look." },
    ],
    liveUrl: "https://30days.wchampfx.com/",
  },
];

/** The three screens every project page shows, at the sizes they were captured. */
export const shotsOf = (id: string) =>
  [
    { device: "Desktop", src: `/img/work/${id}/desktop.webp`, w: 1440, h: 900 },
    { device: "Tablet", src: `/img/work/${id}/tablet.webp`, w: 820, h: 1180 },
    { device: "Phone", src: `/img/work/${id}/mobile.webp`, w: 780, h: 1688 },
  ] as const;

/**
 * A row in the archive: a client, their sector, and the work done for them.
 * Projects with a page are added from `PROJECTS`; these are the rest.
 */
export type ArchiveProject = {
  id: string;
  name: string;
  sector: string;
  category: ProjectCategory;
  work: string[];
  link?: string;
};

const COMMUNITY = ["Community management", "Moderation", "Campaign management", "Marketing"];

const ARCHIVE_ONLY: ArchiveProject[] = [
  { id: "the-flowershop", name: "The Flowershop PH", sector: "Online flower shop", category: "ecommerce", work: ["Online store build", "Payments and integrations", "Automation and operations"] },
  { id: "maison-luna", name: "Maison Luna", sector: "Bag label", category: "ecommerce", work: ["Shopify store", "Design and brand", "Automation and operations"] },
  { id: "gn-club", name: "GN Club", sector: "Event production", category: "websites", work: ["Website build", "Design and brand", "Campaign management", "Automation and operations"] },
  { id: "mazal", name: "Mazal", sector: "Trading community", category: "websites", work: ["Website build", "Campaign management", "Community management", "Moderation"] },
  { id: "samurai-warlords", name: "Samurai Warlords", sector: "Blockchain strategy game", category: "community", work: COMMUNITY },
  { id: "kingdom-of-ants", name: "Kingdom of Ants", sector: "NFT collection and game", category: "community", work: COMMUNITY },
  { id: "rtistiq", name: "RtistiQ", sector: "Art marketplace", category: "community", work: ["Community management", "Discord tech", "Campaign management", "Moderation"] },
  { id: "vitreus", name: "Vitreus", sector: "Layer-0 blockchain", category: "community", work: COMMUNITY },
  { id: "vyvo", name: "Vyvo", sector: "AI wellness technology", category: "community", work: COMMUNITY },
  { id: "termmax", name: "Term Structure", sector: "DeFi lending", category: "community", work: COMMUNITY },
  { id: "amazewallet", name: "AmazeWallet", sector: "Crypto wallet", category: "community", work: COMMUNITY },
  { id: "exolo", name: "Exolo", sector: "Crypto exchange", category: "community", work: COMMUNITY },
  { id: "metagaia", name: "MetaGaia", sector: "Immersive online world", category: "community", work: COMMUNITY },
  { id: "galactics", name: "Galactics", sector: "Web3 community brand", category: "community", work: COMMUNITY },
  { id: "eternal", name: "Eternal", sector: "NFT collection", category: "community", work: COMMUNITY },
  { id: "bit4win", name: "Bit4Win", sector: "Crypto gaming", category: "community", work: COMMUNITY },
  { id: "soteria", name: "Soteria", sector: "Crypto security", category: "community", work: COMMUNITY },
  { id: "crazy-crypto-football", name: "Crazy Crypto Football", sector: "Blockchain football game", category: "community", work: COMMUNITY },
  { id: "polyverse", name: "Polyverse", sector: "Action RPG shooter", category: "community", work: COMMUNITY },
  { id: "coins-and-skins", name: "Coins & Skins", sector: "Web3 game", category: "community", work: COMMUNITY },
  { id: "flight-of-primes", name: "Flight of Primes", sector: "NFT comic series", category: "community", work: COMMUNITY },
  { id: "ricy", name: "ricy", sector: "Digital collectibles", category: "community", work: ["Community management", "Moderation"] },
  { id: "cryptofaxreport", name: "CryptoFaxReport", sector: "Crypto market reports", category: "community", work: ["Community management", "Moderation"] },
  { id: "redefi-capital", name: "reDeFi Capital", sector: "Crypto asset manager", category: "community", work: ["Campaign management", "Marketing"] },
];

/** The whole record: the projects with a page first, then everything else. */
export const ARCHIVE_PROJECTS: ArchiveProject[] = [
  ...PROJECTS.map((p): ArchiveProject => ({
    id: p.id,
    name: p.name,
    sector: p.tag,
    category: p.category,
    work: p.built.map((b) => b.title),
    link: `/work/${p.id}`,
  })),
  ...ARCHIVE_ONLY,
];

/** Every company in the record, for the marquee. Derived, so it cannot drift. */
export const CLIENTS: string[] = ARCHIVE_PROJECTS.map((p) => p.name);

/**
 * The work band's running order: every project with a page. One list, so a
 * project can never appear in the index and go missing from the sitemap.
 */
export const WORK_SEQUENCE: Project[] = PROJECTS;

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
  /** The projects this was part of, by id, read off each project's own record. */
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
    projects: ["coremote", "owwo", "budi", "funded-prop-traders", "wchampfx"],
  },
  {
    id: "ai-workflows",
    icon: "sparkles",
    title: "AI Agents",
    copy: "Voice and chat agents that answer, qualify and book, on the models that suit the job.",
    points: ["Answers enquiries around the clock", "Qualifies and books for you", "Hands over with the notes written"],
    projects: ["tally", "funded-prop-traders", "budi"],
  },
  {
    id: "automation",
    icon: "workflow",
    title: "Workflow Automation",
    copy: "The repetitive work between your tools, mapped once and left to run.",
    points: ["n8n, Make, Zapier or Windmill", "Retries and alerts when something fails", "Runs without anyone watching"],
    projects: ["passivae", "owwo", "ck-propfirm", "wchampfx"],
  },
  {
    id: "integrations",
    icon: "api",
    title: "Integrations & APIs",
    copy: "Your site, CRM, calendar and payments talking to each other instead of to you.",
    points: ["Custom code where no connector exists", "One source of truth for your data", "Documented endpoints and webhooks"],
    projects: ["owwo", "monno", "construction-hub"],
  },
  {
    id: "motion",
    icon: "gsap",
    title: "Motion & Interaction",
    copy: "Movement that explains the product, built so it stays smooth on a real laptop.",
    points: ["Scroll-driven sequences like this one", "GSAP and WebGL where they earn it", "Respects reduced-motion settings"],
    projects: ["trestle", "monno", "funnel-foundry", "ck-propfirm"],
  },
  {
    id: "support",
    icon: "support",
    title: "Handover & Support",
    copy: "You own everything that gets built, and you are not left alone with it.",
    points: ["Documented and yours to keep", "A walkthrough for your team", "Monthly hours when you need them"],
    projects: ["passivae", "monno", "trestle"],
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
 * Proof.
 *
 * `PROOF_FACTS` are statements about THIS site, each one checkable by anyone
 * who opens it. `PROOF_STATS` and `PROOF_QUOTES` are the published record. A
 * quote is attributed to a role and a company, never to a named person.
 * `PROMISES` are commitments, written only because they are kept.
 */
export const PROOF_STATS = [
  { value: "20+", label: "projects delivered" },
  { value: "15+", label: "client teams" },
  { value: "8+", label: "systems in production" },
] as const;

export const PROOF_FACTS = [
  { title: "Hand-coded", copy: "Next.js and TypeScript, written line by line. No page builder touched this." },
  { title: "Five scroll sequences", copy: "Each one is a single timeline you can scrub to any frame, forwards or back." },
  { title: "Works with motion off", copy: "Turn on reduced motion and every section has a still version that says the same thing." },
  { title: "Tested like software", copy: "More than a hundred automated checks run against it on desktop and phone." },
] as const;

export const PROOF_QUOTES = [
  {
    project: "owwo",
    quote: "Our funnel used to live in three apps and guilt. The chickens are still unimpressed. I sleep better anyway.",
    name: "CEO",
    role: "OWWO Chicken",
  },
  {
    project: "passivae",
    quote: "Full stack, automation, agent workflows, and infra in one loop. No hero deploys. No mystery config. If something breaks at 2 a.m., we know exactly which repo to open.",
    name: "CEO",
    role: "Passivae",
  },
  {
    project: "construction-hub",
    quote: "We needed a site our industry could lean on and an LMS crews would open without groaning. Quiet handoffs. No fog about who owns what. That kind of win does not show up on a slide.",
    name: "CEO",
    role: "Construction Hub PH",
  },
] as const;

/** What a client said about this project, where one did. */
export const quoteForProject = (id: string) => PROOF_QUOTES.find((q) => q.project === id);

export const PROMISES = [
  { title: "You own everything.", copy: "Code, accounts, automations and documentation are yours, handed over in full." },
  { title: "No lock-in.", copy: "Nothing is built so that only I can run it. Take it in-house whenever you like." },
  { title: "A reply within a working day.", copy: "Every message gets an answer within one working day." },
  { title: "Scope in writing first.", copy: "Nothing starts until what we are doing is written down and agreed." },
] as const;

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
  clients: `${PROOF_QUOTES.length} voices · ${new Set(WORK_SEQUENCE.map((w) => w.tag)).size} sectors`,
  faq: `${FAQS.length} questions · straight answers`,
} as const;

export const CTA = {
  eyebrow: "Have something in mind?",
  titleLines: ["A site, a system,", "or a seat on", "your team."],
  copy: "Tell me what you are working on and how you would like to work. I will tell you honestly whether I am the right person for it.",
  cta: "Start a project",
} as const;

export const FOOTER = {
  socials: [{ label: "LinkedIn", href: LINKEDIN }],
  line: "Websites that work. Systems that run.",
} as const;

/** The capabilities delivered for a project — derived from CAPABILITIES[].projects. */
export const servicesForProject = (id: string): string[] =>
  CAPABILITIES.filter((c) => c.projects.includes(id)).map((c) => c.title);
