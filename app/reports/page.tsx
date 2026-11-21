import type { Metadata } from "next";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { company } from "../lib/company";

const price = `₹${company.reportPrice.toLocaleString("en-IN")}`;

export const metadata: Metadata = {
  title: `Property Intelligence Report for any Bangalore project, ${price}`,
  description:
    "A ten-page, source-cited report on any Bengaluru project: registration record, Record Grade, builder profile, ownership trail, statutory costs and site documentation, reviewed and signed before delivery.",
  alternates: { canonical: "/reports" },
};

const SAMPLE_URL = "/reports/lodha-beaumont-estate-specimen.pdf";

const specimens = [
  ["An apartment", "Lodha Beaumont Estate, North Bengaluru", "/reports/lodha-beaumont-estate-specimen.pdf"],
  ["A plot", "The Woodland Forest, Devanahalli", "/reports/woodland-forest-bangalore-specimen.pdf"],
  ["A villa", "Embassy Knowledge Park Villas, North Bengaluru", "/reports/embassy-knowledge-park-villas-north-bangalore-specimen.pdf"],
] as const;

const sections = [
  ["01–04", "Is it legal?", "RERA registration and its validity, plan approvals, complaints and cases on record, and the land's encumbrance trail."],
  ["05–08", "Who is behind it?", "The legal promoter behind the brand, its other registrations, whether earlier projects finished on time, and who runs the company."],
  ["09–12", "What will it really cost?", "Stamp duty, registration, cess, surcharge and GST on the quoted price; the guidance value; the payment schedule; the running costs."],
  ["13–14", "What am I actually buying?", "Changes with the property. An apartment: carpet area and land share. A plot: layout approval, conversion and khata. A villa: land ownership and specification."],
  ["15–16", "What is it like to live there?", "The amenities promised in writing, and what is nearby with honest travel times."],
  ["17–18", "What could go wrong?", "What happens if possession is late, and what must be true before each payment."],
] as const;

const steps = [
  ["You name the property", "Project, tower or plot, and where you are in the decision."],
  ["We confirm and send a payment link", `${price}, by UPI or card, on WhatsApp. Nothing is charged on this website.`],
  ["We pull the official records", "RERA, Kaveri and company records, read on the date shown in the report."],
  ["Rohitt reviews and signs", "The report reaches you as a PDF within 24–48 hours of payment."],
] as const;

export default function ReportsPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Property Intelligence Reports</p>
            <h1 data-split>Eighteen questions. Answered before you sign.</h1>
            <p data-enter>
              One buyer question to a page, about two dozen pages, written for one property. Each
              answer names its official source and date. Information, never investment advice.
            </p>
            <div className="hero__actions" data-enter>
              <a className="button button--gold" href="#order" data-track="report_order_cta">
                Order a report, {price} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a className="button button--outline" href={SAMPLE_URL} target="_blank" rel="noreferrer" data-track="report_sample_opened">
                Read the sample report
              </a>
            </div>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>{price} per property</strong>
            <p>
              One fixed price. Delivered as a signed PDF within 24–48 hours of payment. A free
              two-page snapshot is available on every project page.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface-dark" id="inside">
        <div className="shell">
          <div className="head">
            <div className="head__main">
              <p className="eyebrow">Inside the report</p>
              <h2 data-split>Six parts. One question to a page.</h2>
            </div>
            <p className="head__note" data-reveal>Each page gives a short answer, what the record shows, why it matters, what to ask the builder, and how to check it yourself.</p>
          </div>
          <div className="rp-sections" data-reveal-group>
            {sections.map(([num, title, copy]) => (
              <article className="rp-section" key={num}>
                <span className="rp-section__num">{num}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section surface-light" id="sample">
        <div className="shell rp-sample__grid">
          <div>
            <p className="eyebrow">The specimen</p>
            <h2 data-split>Read three before you order one.</h2>
          </div>
          <div className="rp-sample__copy" data-reveal>
            <p>
              The report is different for every property. These three specimens show the same
              eighteen questions asked of an apartment, a plot and a villa. Lines that need a
              per-order official pull are marked <em>pending</em> rather than filled with guesses;
              a commissioned report completes them.
            </p>
            <ul className="rp-specimens">
              {specimens.map(([kind, name, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noreferrer" data-track="report_sample_opened">
                    <FileText size={16} aria-hidden="true" /><span><strong>{kind}</strong>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="annot">Watermarked specimens. Free to read, share and verify.</p>
          </div>
        </div>
      </section>

      <section className="section surface-dark" id="how">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">How it works</p><h2 data-split>From your message to a signed report.</h2></div>
          </div>
          <ol className="rp-steps" data-reveal-group>
            {steps.map(([title, copy], index) => (
              <li key={title}><span className="rp-steps__num">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section surface-dark" id="method">
        <div className="shell rp-method__grid">
          <div>
            <p className="eyebrow">How a report is made</p>
            <h2 data-split>Read from the record. Verified. Signed.</h2>
          </div>
          <div className="rp-method__copy" data-reveal>
            <p>
              Facts are read from the named public source on the date shown and kept verbatim:
              the Karnataka RERA register, Kaveri (guidance values and the Encumbrance
              Certificate), MCA corporate records, RBI and NHB series. Where a record cannot be
              obtained, the line says so; nothing is estimated or generated.
            </p>
            <p className="rp-method__sign">
              <ShieldCheck size={16} aria-hidden="true" />
              Every commissioned report is reviewed and signed by Rohitt Kumar Singh, MD, Hundred
              Yards Realtor Pvt Ltd, before delivery, and never says buy or don&apos;t buy.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface-deep" id="order">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Order</p>
            <h2 data-split>Commission a report for {price}.</h2>
            <p className="head__note" data-reveal>
              Send the request here. We confirm the property on WhatsApp and share a payment link.
              No money is taken on this page.
            </p>
          </div>
          <div data-reveal><LeadFormSlot kind="report" id="order-form" /></div>
        </div>
      </section>
    </main>
  );
}
