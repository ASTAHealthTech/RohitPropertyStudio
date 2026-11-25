import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdLanding } from "../../components/leads/AdLanding";
import { areaBySlug, formatLakh, priceRange, projectBySlug, projectsInArea } from "../../lib/catalog";

/**
 * Ad landing pages. /enquire/<area-slug> and /enquire/<project-slug> are built from the
 * catalogue, so every project and area has one without anyone writing a page. They are
 * kept out of search results (the full project and area pages are the ones that rank).
 */
type Params = { params: Promise<{ slug: string }> };

const clean = (text: string) => text.replace(/\*/g, "").trim();
const usable = (value: string) => Boolean(value) && !/whatsapp|confirm with|on request|verify at/i.test(value);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const area = areaBySlug(slug);
  const project = area ? undefined : projectBySlug(slug);
  if (!area && !project) return { title: "Page not found" };
  return {
    title: area ? `New homes in ${area.name}, Bangalore: prices and plans` : `${project!.name} by ${project!.dev}: price sheet and floor plans`,
    description: area
      ? `Apartments, villas and plots in ${area.name}. Get the current price sheet and floor plans from a 100 Yards advisor.`
      : `${project!.name} in ${project!.loc}. Get the current price sheet and floor plans from a 100 Yards advisor.`.slice(0, 300),
    robots: { index: false, follow: true },
    alternates: { canonical: area ? `/areas/${area.slug}` : `/projects/${project!.slug}` },
  };
}

export default async function EnquirePage({ params }: Params) {
  const { slug } = await params;
  const area = areaBySlug(slug);

  if (area) {
    const list = projectsInArea(slug);
    const range = priceRange(list);
    const devs = new Set(list.map((p) => p.dev));
    const picks = list.filter((p) => p.cover && p.priceLakh).slice(0, 6).map((p) => ({
      href: `/enquire/${p.slug}`, name: p.name, meta: [p.dev, clean(p.config)].filter(Boolean).join(" · "), price: clean(p.price), cover: p.cover,
    }));
    return (
      <AdLanding
        eyebrow={area.short}
        title={`New homes in ${area.name}`}
        intro={area.intro}
        facts={[
          ["Projects we list here", String(list.length)],
          ["Builders", String(devs.size)],
          ...(range ? [["Published starting prices", `${formatLakh(range.min)} – ${formatLakh(range.max)}`]] : []),
          ["Close to", area.reach],
        ]}
        topic={`homes in ${area.name}`}
        picks={picks}
        picksTitle={`Some of the projects in ${area.name}`}
      />
    );
  }

  const project = projectBySlug(slug);
  if (!project) notFound();
  const facts = [
    [project.reraNote ? "Indicative starting price" : "Published starting price", clean(project.price)],
    ["Homes", clean(project.config)],
    ["Sizes", clean(project.sizes)],
    ["Status", clean(project.status)],
    ["Possession", clean(project.poss)],
  ].filter(([, value]) => usable(value));
  return (
    <AdLanding
      eyebrow={`${project.dev} · ${project.kind}`}
      title={project.name}
      place={project.loc}
      intro={project.about[0]}
      facts={facts}
      cover={project.images[0] ?? null}
      coverAlt={`${project.name} by ${project.dev}`}
      rera={project.rera}
      reraNote={project.reraNote}
      topic={project.name}
      slug={project.slug}
    />
  );
}
