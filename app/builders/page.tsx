/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { builders } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Builders in Bangalore: projects by developer",
  description: `Projects from ${builders.length} builders including Prestige, Brigade, Sobha, Godrej, Embassy and Puravankara, listed by 100 Yards.`,
  alternates: { canonical: "/builders" },
};

export default function BuildersPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Developer partners</p>
            <h1 data-split>Browse by builder.</h1>
            <p data-enter>{builders.length} builders in the catalogue. Pick one to see every project of theirs we list.</p>
          </div>
        </div>
      </section>
      <section className="section section--tight surface-dark">
        <div className="shell bgrid" data-reveal-group>
          {builders.map((b) => (
            <a className="bgrid__item" href={`/builders/${b.slug}`} key={b.slug}>
              {b.logo ? <span className="bgrid__logo"><img src={b.logo} alt="" loading="lazy" /></span> : <span className="bgrid__logo bgrid__logo--text" aria-hidden="true">{b.name.slice(0, 1)}</span>}
              <strong>{b.name}</strong>
              <span>{b.count} {b.count === 1 ? "project" : "projects"}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
