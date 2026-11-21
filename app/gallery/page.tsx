/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { gallery } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Gallery: 100 Yards clients, site visits and celebrations",
  description: "Moments with 100 Yards clients: handovers, site visits and celebrations.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const groups = gallery.groups.filter((g) => g.title === "Happy Clients" || g.title === "Testimonials");
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Gallery</p>
            <h1 data-split>The people behind the paperwork.</h1>
            <p data-enter>Moments with our clients: handovers, site visits and celebrations.</p>
          </div>
        </div>
      </section>
      {groups.map((group) => (
        <section className="section section--tight surface-dark" key={group.title}>
          <div className="shell">
            <div className="head"><div className="head__main"><p className="eyebrow">{group.title}</p></div></div>
            <div className="ggrid" data-reveal-group>
              {group.items.map((index) => (
                <span className="ggrid__item" key={index}><img src={gallery.images[index]} alt={`100 Yards, ${group.title.toLowerCase()}`} width={1000} height={1000} loading="lazy" decoding="async" /></span>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
