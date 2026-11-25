import projectsData from "./projects.json";
import liteData from "./projects-lite.json";
import buildersData from "./builders.json";
import postsData from "./posts.json";
import reviewsData from "./reviews.json";
import galleryData from "./gallery.json";
import detailsData from "./details.json";
import articlesData from "./articles.json";

/**
 * The 100 Yards catalogue. Source: the published 100yards.in listings (Nov 2026),
 * extracted by tools/extract.py. Prices are the builders' published "onwards"
 * figures as listed by 100 Yards — never estimates. Regenerate, do not hand-edit.
 */
export type Img = { src: string; w: number; h: number };
export type Project = {
  slug: string; id: string; name: string; dev: string; devFull: string; devSlug: string;
  loc: string; corr: string; corrSlug: string; kind: string; up: boolean;
  price: string; priceLakh: number | null; status: string; config: string; sizes: string;
  land: string; units: string; poss: string; rera: string;
  about: string[]; snap: string[][] | null; pt: string[][] | null; ct: string[][] | null;
  am: string[]; la: string[][]; images: Img[];
  /** Shown in place of the RERA number when a project has none yet (e.g. pre-launch). */
  reraNote?: string;
};
export type ProjectLite = {
  slug: string; name: string; dev: string; devSlug: string; loc: string; corr: string; corrSlug: string;
  kind: string; up: boolean; price: string; priceLakh: number | null; config: string; status: string;
  cover: Img | null; rera: boolean;
};

export const projects = projectsData as unknown as Project[];
export const projectsLite = liteData as unknown as ProjectLite[];
export const posts = postsData as { slug: string; title: string; date: string; excerpt: string; minutes: number; url: string; img: string | null }[];
export const reviews = reviewsData as { quote: string; name: string; when: string }[];
export const builderLogos = buildersData as { name: string; slug: string; img: string }[];
export const gallery = galleryData as { images: string[]; groups: { title: string; items: number[] }[] };

/** Text imported from the published 100yards.in pages by tools/import-100yards. Regenerate, do not hand-edit. */
export type Block =
  | { t: "p" | "h" | "h2"; x: string }
  | { t: "list"; items: string[] }
  | { t: "table"; rows: string[][] }
  | { t: "qa"; q: string; a: string };
export type DetailSection = { title: string; kind: string; blocks: Block[] };
const details = detailsData as unknown as Record<string, { sections: DetailSection[] }>;
const articles = articlesData as unknown as Record<string, { desc: string; blocks: Block[]; words: number }>;

export function detailsFor(slug: string): DetailSection[] {
  return details[slug]?.sections ?? [];
}
/** A guide whose full text is on this site. Others are listed by title only. */
export function articleBySlug(slug: string) {
  const post = posts.find((p) => p.slug === slug);
  const body = articles[slug];
  return post && body ? { ...post, ...body } : undefined;
}
export const hasArticle = (slug: string) => Boolean(articles[slug]);

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** The corridors 100 Yards works in. Copy states only what the catalogue supports. */
export const areas = [
  {
    slug: "devanahalli",
    name: "Devanahalli",
    short: "The airport belt",
    intro: "Devanahalli sits beside Kempegowda International Airport, north of the city along NH-44. The catalogue here leans to plotted developments, villas and large township apartments.",
    reach: "Hebbal, Yelahanka, Manyata Tech Park and the airport",
    x: 62, y: 10,
  },
  {
    slug: "north-bangalore",
    name: "North Bangalore",
    short: "Hebbal to Yelahanka",
    intro: "North Bangalore runs from Hebbal through Thanisandra, Jakkur and Yelahanka along the airport road. Most projects here are apartments from established builders, with a few villa communities.",
    reach: "Manyata Tech Park, Hebbal, Hennur and the airport road",
    x: 52, y: 30,
  },
  {
    slug: "whitefield-and-east",
    name: "Whitefield & East",
    short: "The IT east",
    intro: "Whitefield and the eastern corridor cover ITPL, Hoodi, Budigere Cross and Old Madras Road. Projects here are mostly apartments close to the technology parks.",
    reach: "ITPL, Marathahalli, KR Puram and Old Madras Road",
    x: 84, y: 52,
  },
  {
    slug: "sarjapur-road",
    name: "Sarjapur Road",
    short: "The south-east corridor",
    intro: "Sarjapur Road links the Outer Ring Road technology belt to the south-east. The catalogue here mixes apartments, villas and plotted developments.",
    reach: "Bellandur, HSR Layout, Outer Ring Road and Electronic City",
    x: 72, y: 78,
  },
  {
    slug: "central-and-west",
    name: "Central & West",
    short: "The established city",
    intro: "Central and West Bengaluru covers the older, established neighbourhoods such as Yeshwanthpur, Rajajinagar and the city centre.",
    reach: "MG Road, Malleshwaram, Rajajinagar and Yeshwanthpur",
    x: 16, y: 62,
  },
  {
    slug: "coimbatore",
    name: "Coimbatore",
    short: "Tamil Nadu",
    intro: "100 Yards also advises on selected projects in Coimbatore, Tamil Nadu.",
    reach: "Coimbatore city",
    x: 18, y: 88,
  },
] as const;

export type Area = (typeof areas)[number];

export function areaBySlug(slug: string) {
  return areas.find((a) => a.slug === slug);
}
export function projectsInArea(slug: string) {
  return projectsLite.filter((p) => p.corrSlug === slug);
}

export type Builder = { slug: string; name: string; count: number; logo: string | null };

const logoFor = (name: string) => {
  const key = name.toLowerCase().split(" ")[0];
  return builderLogos.find((l) => l.name.toLowerCase().split(" ")[0] === key)?.img ?? null;
};

export const builders: Builder[] = (() => {
  const map = new Map<string, Builder>();
  for (const p of projectsLite) {
    const entry = map.get(p.devSlug) ?? { slug: p.devSlug, name: p.dev, count: 0, logo: logoFor(p.dev) };
    entry.count += 1;
    map.set(p.devSlug, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
})();

export function builderBySlug(slug: string) {
  return builders.find((b) => b.slug === slug);
}
export function projectsByBuilder(slug: string) {
  return projectsLite.filter((p) => p.devSlug === slug);
}

export function priceRange(list: ProjectLite[]) {
  const values = list.map((p) => p.priceLakh).filter((v): v is number => typeof v === "number");
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}
export function formatLakh(value: number) {
  return value >= 100 ? `₹${(value / 100).toFixed(2).replace(/\.?0+$/, "")} Cr` : `₹${value} Lakh`;
}

/** Old 100yards.in addresses that are not project or post slugs. */
export const legacyPaths: Record<string, string> = {
  "about-us": "/about",
  "contact-us": "/contact",
  "residential-properties": "/projects",
  "residential": "/projects",
  "residential-projects": "/projects",
  "upcoming-projects": "/projects",
  "commercial-properties": "/commercial",
  "career": "/contact",
  "careers": "/contact",
  "media-hub": "/rohitt#watch",
  "resource-center": "/learn",
  "privacy-policy": "/privacy",
  "terms-conditions": "/terms",
  "terms-and-conditions": "/terms",
  "newsarticle": "/blog",
  "forum": "/learn",
};
