/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { AmbientBackdrop } from "../../components/AmbientBackdrop";
import { ProjectCard } from "../../components/catalog/ProjectCard";
import { LeadFormSlot } from "../../components/leads/LeadFormSlot";
import { builderBySlug, formatLakh, priceRange, projectsByBuilder } from "../../lib/catalog";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const builder = builderBySlug(slug);
  if (!builder) return { title: "Builder not found" };
  return {
    title: `${builder.name} projects in Bangalore: prices, plans and RERA numbers`,
    description: `${builder.count} ${builder.name} ${builder.count === 1 ? "project" : "projects"} listed by 100 Yards, with published prices, configurations and RERA registration numbers.`,
    alternates: { canonical: `/builders/${builder.slug}` },
  };
}

export default async function BuilderPage({ params }: Params) {
  const { slug } = await params;
  const builder = builderBySlug(slug);
  if (!builder) notFound();
  const list = projectsByBuilder(slug);
  const range = priceRange(list);
  const corridors = [...new Set(list.map((p) => p.corr))];

  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell">
          <nav className="crumbs" aria-label="Breadcrumb" data-enter>
            <a href="/builders">Builders</a><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{builder.name}</span>
          </nav>
          <div className="page-hero__grid">
            <div className="page-hero__copy">
              <p className="eyebrow" data-enter>Builder</p>
              <h1 data-split>{builder.name} projects</h1>
              <p data-enter>
                {builder.count} {builder.count === 1 ? "project" : "projects"} from {builder.name} in the 100 Yards catalogue, across {corridors.join(", ")}.
              </p>
              <div className="page-hero__actions" data-enter>
                <a className="button button--outline" href="/datalab">Check a builder&apos;s register record <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
            <dl className="pfacts pfacts--stack" data-enter>
              {builder.logo && <div className="pfacts__logo"><img src={builder.logo} alt={`${builder.name} logo`} loading="lazy" /></div>}
              <div><dt>Projects listed</dt><dd>{builder.count}</dd></div>
              {range && <div><dt>Published starting prices</dt><dd>{formatLakh(range.min)} – {formatLakh(range.max)}</dd></div>}
            </dl>
          </div>
        </div>
      </section>

      <section className="section section--tight surface-dark">
        <div className="shell">
          <div className="pgrid" data-reveal-group>
            {list.map((p, i) => <ProjectCard key={p.slug} project={p} eager={i < 3} />)}
          </div>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Ask about {builder.name}</p>
            <h2 data-split>Current offers, straight from the desk.</h2>
            <p className="head__note" data-reveal>Launch prices, available inventory and payment plans change weekly. Ask for today&apos;s position.</p>
          </div>
          <div data-reveal><LeadFormSlot kind="callback" id="callback" /></div>
        </div>
      </section>
    </main>
  );
}
