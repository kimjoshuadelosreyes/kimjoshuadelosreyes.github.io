import { EMAIL, FAQS, STACK, WORK_SEQUENCE } from "./content";

/**
 * Everything a search engine or a link preview is told about the site, in one
 * place.
 *
 * `SITE_URL` is the ONE thing to change when the address changes. It is read
 * from `NEXT_PUBLIC_SITE_URL` at build time, so a deploy can set it without a
 * code change; the fallback is the GitHub Pages address the site is built for.
 * No trailing slash.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://kimjoshuadelosreyes.github.io").replace(/\/+$/, "");

export const SITE = {
  name: "Kim Joshua",
  brand: "KIM",
  title: "Kim Joshua | Websites & AI Automation Developer",
  /* 150-160 characters: what search results show before they cut it off. */
  description:
    "Kim Joshua hand-codes fast websites, then builds the AI agents and automations behind them. Open to consultancy, full-time roles, freelance projects and gigs.",
  role: "Web developer and AI automation consultant",
  locale: "en_US",
  linkedin: "https://www.linkedin.com/in/kimjoshuadev/",
  ogAlt: "Kim Joshua in front of the orange KIM wordmark, with the line: Websites that work. Systems that run.",
} as const;

/** An absolute URL for a path on this site. Paths end in a slash, as exported. */
export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Every indexable path, for the sitemap. */
type Route = { path: string; priority: number; changeFrequency: "monthly" | "yearly" };
export const ROUTES: Route[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/archive/", priority: 0.5, changeFrequency: "yearly" },
  ...WORK_SEQUENCE.map((p): Route => ({ path: `/work/${p.id}/`, priority: 0.6, changeFrequency: "yearly" })),
];

/* ------------------------------------------------------------------ *
 * Structured data. Each object states only what the page itself says.
 * ------------------------------------------------------------------ */
const PERSON_ID = `${SITE_URL}/#kim`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personLd = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.name,
  url: abs("/"),
  image: abs("/img/kim-portrait-hero.webp"),
  jobTitle: SITE.role,
  description: SITE.description,
  email: `mailto:${EMAIL}`,
  sameAs: [SITE.linkedin],
  knowsAbout: STACK.flatMap((g) => g.tools.map((t) => t.name)),
};

export const websiteLd = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: abs("/"),
  name: `${SITE.name} — ${SITE.brand}`,
  description: SITE.description,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

export const homeLd = {
  "@context": "https://schema.org",
  "@graph": [
    personLd,
    websiteLd,
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#page`,
      url: abs("/"),
      name: SITE.title,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
      primaryImageOfPage: abs("/opengraph-image.png"),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export const breadcrumbLd = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: abs(t.path),
  })),
});
