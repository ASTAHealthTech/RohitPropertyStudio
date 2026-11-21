import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { ClosingCta } from "../components/ClosingCta";
import { MarketContext } from "../components/MarketContext";
import { posts } from "../lib/catalog";
import datalabRegistry from "../lib/datalab/projects.json";

export const metadata: Metadata = {
  title: "Learn: free property tools, register data and buyer guides",
  description: "The 100 Yards Academy: the Bengaluru Datalab, the Property Lab cost simulators, a foundational real estate course, an AI glossary guide and buyer guides.",
  alternates: { canonical: "/learn" },
};

const items = [
  { tag: "Register explorer", title: "Bengaluru Datalab", copy: `${datalabRegistry.projects.length} RERA-registered projects with their public record, a published Record Grade and a link to the official register.`, href: "/datalab", cta: "Open the Datalab" },
  { tag: "Simulators", title: "Property Lab", copy: "True cost, EMI and rent-versus-buy in one live instrument, plus a payment-plan visual and a property quiz.", href: "/lab", cta: "Enter the Lab" },
  { tag: "Course", title: "Basics of Real Estate", copy: "A 49-slide visual foundation in the language of property: types, approvals, area terms, charges and payment plans.", href: "/course", cta: "See the course" },
  { tag: "Glossary & AI guide", title: "Resources", copy: "A plain-language glossary, an area visualizer, site-visit questions and an AI guide that explains terms and never advises.", href: "/resources", cta: "Open resources" },
  { tag: "Guides", title: "Buyer guides", copy: `${posts.length} explainers on deeds, charges, khata, power of attorney and the paperwork of buying.`, href: "/blog", cta: "Read the guides" },
  { tag: "Reports", title: "Property Intelligence Reports", copy: "A signed, source-cited report on one property's complete public record.", href: "/reports", cta: "See the report" },
] as const;

export default function LearnPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>100 Yards Academy</p>
            <h1 data-split>Understand it before you sign it.</h1>
            <p data-enter>Free tools, public-record data and plain-English guides, built by the 100 Yards team so buyers walk in informed.</p>
          </div>
        </div>
      </section>
      <section className="section section--tight surface-dark">
        <div className="shell grid grid--3" data-reveal-group>
          {items.map((item) => (
            <a className="card card--link" href={item.href} key={item.href}>
              <span className="card__index">{item.tag}</span>
              <h3>{item.title}</h3>
              <p className="card__body">{item.copy}</p>
              <span className="card__cta">{item.cta} <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </section>
      <MarketContext />
      <ClosingCta />
    </main>
  );
}
