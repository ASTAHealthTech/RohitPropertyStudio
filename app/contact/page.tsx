import type { Metadata } from "next";
import { Mail, MessageCircle, Phone, MonitorPlay } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { EarlyAccessForm } from "../components/EarlyAccessForm";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { company, whatsappLink } from "../lib/company";

export const metadata: Metadata = {
  title: "Contact 100 Yards: call, WhatsApp or visit the Kalyan Nagar office",
  description: `Talk to a 100 Yards property advisor. ${company.address}. ${company.hours}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop video="/video/keys.mp4" />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Contact</p>
            <h1 data-split>Our property experts are one step away.</h1>
            <p data-enter>Ask for a call back, message us on WhatsApp, or walk into the office. {company.hours}.</p>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>Office</strong>
            <p>{company.address}</p>
          </div>
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell contact__grid">
          <div><LeadFormSlot kind="callback" id="callback" /></div>
          <aside className="contact-aside">
            <p className="eyebrow">Direct channels</p>
            <h2 data-split>Prefer to speak directly?</h2>
            <div className="channels">
              <a href={whatsappLink("Hi, I would like to speak to a property advisor.")} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
                <span><MessageCircle size={16} aria-hidden="true" />WhatsApp</span><strong>{company.phoneDisplay}</strong>
              </a>
              <a href={company.phoneHref} data-track="call_clicked"><span><Phone size={16} aria-hidden="true" />Call (India)</span><strong>{company.phoneDisplay}</strong></a>
              <a href={company.dubaiPhoneHref} data-track="call_clicked"><span><Phone size={16} aria-hidden="true" />Call (Dubai)</span><strong>{company.dubaiPhoneDisplay}</strong></a>
              <a href={`mailto:${company.email}`}><span><Mail size={16} aria-hidden="true" />Email</span><strong>{company.email}</strong></a>
              <a href={company.youtube} target="_blank" rel="noreferrer" data-track="youtube_clicked"><span><MonitorPlay size={16} aria-hidden="true" />YouTube</span><strong>@RealtorRohitSingh</strong></a>
            </div>
            <div className="contact-note">
              <strong>What happens next</strong>
              <p>One advisor calls you at the time you chose. Submitting the form does not create a purchase or a brokerage agreement.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section surface-dark" id="course-list">
        <div className="shell contact__grid">
          <div><EarlyAccessForm siteKey={turnstileSiteKey} /></div>
          <aside className="contact-aside">
            <p className="eyebrow">100 Yards Academy</p>
            <h2 data-split>Here for the course instead?</h2>
            <p>The Basics of Real Estate course is opening soon. This list records interest only; it does not create an order or collect payment.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
