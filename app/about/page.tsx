import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, BadgeCheck, ChevronRight } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { ClosingCta } from "../components/ClosingCta";
import { builders, projectsLite } from "../lib/catalog";
import { company, trustValues, whyUs } from "../lib/company";

export const metadata: Metadata = {
  title: "About 100 Yards: real estate consultancy in Bangalore, Coimbatore, Dubai and Phuket",
  description: `${company.legal} is a Karnataka RERA registered real estate consultancy led by ${company.md}, advising homebuyers, investors, NRIs and businesses.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>About 100 Yards</p>
            <h1 data-split>Trusted real estate advice, in four cities.</h1>
            <p data-enter>
              {company.legal} is a real estate consultancy serving homebuyers, investors, NRIs and
              businesses across {company.cities.join(", ")}.
            </p>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong><BadgeCheck size={14} aria-hidden="true" /> Karnataka RERA registered agent</strong>
            <p>{company.reraAgent}</p>
            <a className="text-link" href={company.reraVerifyUrl} target="_blank" rel="noreferrer">Verify on the official register <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="section surface-light">
        <div className="shell statement-block">
          <p className="eyebrow">Our story</p>
          <div className="statement-block__body">
            <h2 data-split>Founded to change how people experience real estate.</h2>
            <p>
              100 Yards began as a customer-focused consultancy and grew into a property advisory
              brand serving clients across Bangalore, Coimbatore, Dubai and Phuket. The work is the
              same in every city: connect people with the right property, and guide them through it
              with transparent advice and personal service.
            </p>
            <p>
              Today the firm lists {projectsLite.length} residential projects from {builders.length} builders,
              runs a commercial desk for offices, retail and warehousing, and supports each client
              from first shortlist to documentation and registration.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell notes__grid about__mv">
          <div data-reveal>
            <p className="eyebrow">Our mission</p>
            <p className="about__lead">To deliver transparent, customer-centric property solutions that let individuals and businesses decide with confidence: simpler transactions, expert guidance, and relationships that last.</p>
          </div>
          <div data-reveal data-reveal-delay="1">
            <p className="eyebrow">Our vision</p>
            <p className="about__lead">To become one of the most trusted real estate advisory brands, connecting clients with premium property across India and abroad, and setting the standard for integrity and service.</p>
          </div>
        </div>
      </section>

      <section className="section surface-dark" id="leadership">
        <div className="shell instructor__grid">
          <div className="instructor__portrait" data-clip>
            <div data-parallax="4">
              <Image src="/media/rohit-kumar-singh.jpg" alt={`${company.md}, ${company.mdRole}`} width={1764} height={2352} sizes="(max-width: 1000px) 92vw, 36vw" />
            </div>
          </div>
          <div className="instructor__copy">
            <p className="eyebrow">Leadership</p>
            <h2 data-split>{company.md}</h2>
            <p className="instructor__role">{company.mdRole}</p>
            <p>
              An engineering graduate in Electronics and Communication, Rohitt combines analytical
              thinking with over a decade in the real estate industry. As Managing Director he
              leads 100 Yards with a clear aim: a trusted, customer-centric, technology-driven
              real estate brand.
            </p>
            <p>
              Under his guidance 100 Yards has expanded across Bangalore, Coimbatore, Dubai and
              Phuket.
            </p>
            <div className="instructor__links">
              <a className="text-link" href="/rohitt">Rohitt&apos;s full profile <ChevronRight size={15} aria-hidden="true" /></a>
              <a className="text-link" href={company.youtube} target="_blank" rel="noreferrer" data-track="youtube_clicked">Watch on YouTube <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">Our values</p><h2 data-split>Built on T·R·U·S·T.</h2></div>
          </div>
          <ul className="trustgrid" data-reveal-group>
            {trustValues.map((value, index) => (
              <li key={index}><i aria-hidden="true">{value.letter}</i><strong>{value.title}</strong><span>{value.copy}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell boundary__grid">
          <div data-reveal>
            <p className="eyebrow">Why choose us</p>
            <h2 data-split>What clients get from 100 Yards.</h2>
          </div>
          <ul className="whylist" data-reveal-group>
            {whyUs.map((item) => <li key={item.title}><strong>{item.title}</strong><span>{item.copy}</span></li>)}
          </ul>
        </div>
      </section>

      <ClosingCta />
    </main>
  );
}
