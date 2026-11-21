import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AmbientBackdrop } from "../../components/AmbientBackdrop";
import { ProjectBrowser } from "../../components/catalog/ProjectBrowser";
import { LeadFormSlot } from "../../components/leads/LeadFormSlot";
import { areaBySlug, areas, formatLakh, priceRange, projectsInArea } from "../../lib/catalog";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area) return { title: "Area not found" };
  const list = projectsInArea(slug);
  return {
    title: `Projects in ${area.name}, Bangalore: apartments, villas and plots`,
    description: `${list.length} residential projects in ${area.name} with prices, RERA numbers and floor plans. ${area.intro}`.slice(0, 300),
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area) notFound();
  const list = projectsInArea(slug);
  const range = priceRange(list);
  const kinds = [...new Set(list.map((p) => p.kind))];
  const devs = [...new Set(list.map((p) => p.dev))];
  const faq = [
    { q: `How many projects does 100 Yards list in ${area.name}?`, a: `${list.length} residential ${list.length === 1 ? "project" : "projects"} from ${devs.length} ${devs.length === 1 ? "builder" : "builders"}: ${kinds.join(", ").toLowerCase()}.` },
    ...(range ? [{ q: `What do homes in ${area.name} start at?`, a: `Published starting prices in our ${area.name} listings run from ${formatLakh(range.min)} to ${formatLakh(range.max)}. These are the builders' starting figures on the date listed; ask us for the current price sheet.` }] : []),
    { q: `Which builders have projects in ${area.name}?`, a: `${devs.slice(0, 12).join(", ")}${devs.length > 12 ? " and others" : ""}.` },
    { q: "How do I check a project is RERA registered?", a: "Each project page shows the registration number listed for it. Search that number on rera.karnataka.gov.in to see the official record." },
  ];
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  }).replace(/</g, "\\u003c");

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell">
          <nav className="crumbs" aria-label="Breadcrumb" data-enter>
            <a href="/areas">Areas</a><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{area.name}</span>
          </nav>
          <div className="page-hero__grid">
            <div className="page-hero__copy">
              <p className="eyebrow" data-enter>{area.short}</p>
              <h1 data-split>Projects in {area.name}</h1>
              <p data-enter>{area.intro}</p>
            </div>
            <dl className="pfacts pfacts--stack" data-enter>
              <div><dt>Projects listed</dt><dd>{list.length}</dd></div>
              <div><dt>Builders</dt><dd>{devs.length}</dd></div>
              {range && <div><dt>Published starting prices</dt><dd>{formatLakh(range.min)} – {formatLakh(range.max)}</dd></div>}
              <div><dt>Close to</dt><dd>{area.reach}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section section--tight surface-dark">
        <div className="shell">
          <ProjectBrowser projects={list} areas={[]} />
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell faq__grid">
          <div className="faq__intro">
            <p className="eyebrow">{area.name}, answered</p>
            <h2 data-split>Common questions.</h2>
            <p>Figures come from our own listings and say so. Nothing here is a forecast.</p>
          </div>
          <div className="accordion" data-reveal-group>
            {faq.map((item) => (
              <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Shortlist for {area.name}</p>
            <h2 data-split>Three projects that fit, not thirty.</h2>
            <p className="head__note" data-reveal>Tell us your budget and timeline. An advisor who works this corridor calls you back.</p>
            <ul className="arealinks">
              {areas.filter((a) => a.slug !== area.slug).map((a) => <li key={a.slug}><a className="text-link" href={`/areas/${a.slug}`}>{a.name}</a></li>)}
            </ul>
          </div>
          <div data-reveal><LeadFormSlot kind="callback" id="callback" /></div>
        </div>
      </section>
    </main>
  );
}
