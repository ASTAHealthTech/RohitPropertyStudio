import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { areas, formatLakh, priceRange, projectsInArea } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Bangalore property by area: Devanahalli, North Bangalore, Whitefield, Sarjapur Road",
  description: "Residential projects grouped by Bangalore's growth corridors, with project counts and published starting prices for each area.",
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Explore by area</p>
            <h1 data-split>Where Bangalore is growing.</h1>
            <p data-enter>Start with the corridor that fits your commute and budget, then compare the projects inside it.</p>
          </div>
        </div>
      </section>
      <section className="section section--tight surface-dark">
        <div className="shell arealist" data-reveal-group>
          {areas.map((area) => {
            const list = projectsInArea(area.slug);
            const range = priceRange(list);
            return (
              <a className="arealist__row" href={`/areas/${area.slug}`} key={area.slug}>
                <span className="arealist__count">{list.length}</span>
                <span className="arealist__main">
                  <strong>{area.name}</strong>
                  <span>{area.intro}</span>
                </span>
                <span className="arealist__meta">
                  {range ? <>From {formatLakh(range.min)}</> : <>Price on request</>}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
