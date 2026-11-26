import type { Metadata } from "next";
import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { ReportCheckout } from "../components/leads/ReportCheckout";
import { shopProjects } from "../lib/reportShop";
import { company } from "../lib/company";

const price = `₹${company.reportPrice.toLocaleString("en-IN")}`;

export const metadata: Metadata = {
  title: `Property Intelligence Report for Bangalore projects, ${price}`,
  description:
    "A 15 to 17 page report on one Bengaluru project: why it is worth a look, the full price list, what you really pay, EMIs, what is coming to the area, how prices have moved, and what to ask before you book. Instant download.",
  alternates: { canonical: "/reports" },
};

const SAMPLE_URL = "/reports/sobha-parq-city-report-preview.pdf";

const sections = [
  ["01", "Why this project", "The reasons it is on our shortlist, each with the fact behind it, and the project in numbers."],
  ["02", "The price, in full", "Every home size and its starting price, drawn as charts, then stamp duty and registration worked out on top."],
  ["03", "The monthly payment", "Sample EMIs, how the loan comes down over 20 years, and how much of your own money you need."],
  ["04", "The area, now and next", "What is nearby today, the metro and road projects on the way, where each one stands and when it is due."],
  ["05", "The price story", "How asking prices in the area have moved, where this project sits against them, and what can lift or slow values."],
  ["06", "Before you book", "What to weigh, the questions to ask the builder, and how to check the RERA registration yourself."],
] as const;

const steps = [
  ["Choose the project", "Pick it from the list of projects on sale. A project not on the list can be requested below."],
  ["Pay online", `${price}, by UPI, card or net banking, in Razorpay's secure window. That is the full price.`],
  ["Download at once", "Your report opens for download the moment the payment is confirmed. Keep it, print it, share it with family."],
  ["Talk to us", "Call or WhatsApp with the report in hand. We arrange the site visit and the current price sheet at no charge."],
] as const;

export default function ReportsPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Property Intelligence Reports</p>
            <h1 data-split>Know the project before you visit it.</h1>
            <p data-enter>
              One project, 15 to 17 pages: the price worked out in full, the metro and roads on
              the way, how prices nearby have moved, and what to ask before you book. Charts, not
              jargon.
            </p>
            <div className="hero__actions" data-enter>
              <a className="button button--gold" href="#order" data-track="report_order_cta">
                Get a report, {price} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a className="button button--outline" href={SAMPLE_URL} target="_blank" rel="noreferrer" data-track="report_sample_opened">
                See sample pages
              </a>
            </div>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>{price} per project</strong>
            <p>
              One fixed price, nothing added at payment. Instant download for our {shopProjects.length} newest
              projects.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface-dark" id="inside">
        <div className="shell">
          <div className="head">
            <div className="head__main">
              <p className="eyebrow">Inside the report</p>
              <h2 data-split>Six parts. Every number drawn.</h2>
            </div>
            <p className="head__note" data-reveal>Each figure is the developer&apos;s published number or a named, dated public source. Nothing is invented.</p>
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
            <p className="eyebrow">Sample pages</p>
            <h2 data-split>Look inside before you pay.</h2>
          </div>
          <div className="rp-sample__copy" data-reveal>
            <p>
              Five pages from the Sobha Parq City report: the cover, the reasons, the project in
              numbers, the price chart and the area price story. The full report has seventeen.
            </p>
            <ul className="rp-specimens">
              <li>
                <a href={SAMPLE_URL} target="_blank" rel="noreferrer" data-track="report_sample_opened">
                  <FileText size={16} aria-hidden="true" /><span><strong>Sample pages</strong>Sobha Parq City, Hennur–Bagalur Road</span>
                </a>
              </li>
            </ul>
            <p className="annot">Free to open. No sign-up.</p>
          </div>
        </div>
      </section>

      <section className="section surface-dark" id="how">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">How it works</p><h2 data-split>From choosing to reading, in two minutes.</h2></div>
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
            <h2 data-split>Researched, sourced, and honest about risk.</h2>
          </div>
          <div className="rp-method__copy" data-reveal>
            <p>
              Project facts, prices and plans come from the developer&apos;s published material.
              Area facts and price trends come from public sources named beside each item, with
              the date they were read. Government charges use published Karnataka rates.
            </p>
            <p className="rp-method__sign">
              <ShieldCheck size={16} aria-hidden="true" />
              Prepared by Hundred Yards Realtor Pvt Ltd, a Karnataka RERA registered agent. The
              report is our analysis to help you shortlist. It is not legal, tax or investment
              advice and never promises a return.
            </p>
          </div>
        </div>
      </section>

      <section className="section surface-deep" id="order">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Order</p>
            <h2 data-split>{`Order a report for ${price}.`}</h2>
            <p className="head__note" data-reveal>
              Reports are on sale for our {shopProjects.length} newest projects. Pay here and
              download your report the moment the payment is confirmed.
            </p>
          </div>
          <div data-reveal><ReportCheckout projects={shopProjects} price={price} /></div>
        </div>
      </section>

      <section className="section surface-dark" id="request">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Any other project</p>
            <h2 data-split>Not on the list? Ask for it.</h2>
            <p className="head__note" data-reveal>
              Tell us the property. The team confirms whether a report can be prepared and by
              when. No money is taken for a request.
            </p>
          </div>
          <div data-reveal><LeadFormSlot kind="report" id="request-form" /></div>
        </div>
      </section>
    </main>
  );
}
