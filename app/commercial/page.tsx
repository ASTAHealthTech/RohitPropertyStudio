import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { commercialTypes } from "../lib/company";

export const metadata: Metadata = {
  title: "Commercial property in Bangalore: offices, retail, warehouses and land",
  description: "Buy or lease office space, retail shops and showrooms, warehouses and commercial land in Bangalore, with advisory from shortlist to registration.",
  alternates: { canonical: "/commercial" },
};

export default function CommercialPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop video="/video/site.mp4" />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Commercial properties</p>
            <h1 data-split>Space for the business you are building.</h1>
            <p data-enter>Office spaces, retail shops and showrooms, warehouses and commercial land in Bangalore, to buy or lease.</p>
            <div className="page-hero__actions" data-enter><a className="button button--gold" href="#requirement">Share your requirement</a></div>
          </div>
        </div>
      </section>
      <section className="section section--tight surface-dark">
        <div className="shell grid grid--4" data-reveal-group>
          {commercialTypes.map((type) => (
            <article className="card" key={type.title}><h3>{type.title}</h3><p className="card__body">{type.copy}</p></article>
          ))}
        </div>
      </section>
      <section className="section surface-dark" id="requirement">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Share your requirement</p>
            <h2 data-split>Tell us what the business needs.</h2>
            <ul className="checklist" data-reveal-group>
              {["Grade-A offices and managed workspaces", "High-street retail and showrooms", "Warehousing and logistics parks", "Pre-leased commercial investments"].map((item) => (
                <li key={item}><Check size={18} aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div data-reveal><LeadFormSlot kind="commercial" id="commercial-form" /></div>
        </div>
      </section>
    </main>
  );
}
