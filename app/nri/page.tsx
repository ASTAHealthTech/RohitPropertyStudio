import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { company } from "../lib/company";

export const metadata: Metadata = {
  title: "NRI desk: buy property in Bangalore from abroad",
  description: "100 Yards helps NRIs buy property in Bangalore from the UAE and elsewhere: shortlists by video, the official record of each project, and support through registration. Dubai contact available.",
  alternates: { canonical: "/nri" },
};

const points = [
  "Shortlists and site walk-throughs by video call",
  "The official record of each project, sent before you commit",
  "A Dubai number and a team that works across time zones",
  "Support through documentation and registration",
];

export default function NriPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop video="/video/keys.mp4" />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>NRI desk</p>
            <h1 data-split>Buying in Bangalore from abroad.</h1>
            <p data-enter>You cannot walk the site every weekend. We do it for you, on camera, and put the paperwork in front of you first.</p>
            <div className="page-hero__actions" data-enter><a className="button button--gold" href="#nri-form">Request a call</a></div>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>Dubai</strong>
            <p><a href={company.dubaiPhoneHref}>{company.dubaiPhoneDisplay}</a></p>
            <strong>India</strong>
            <p><a href={company.phoneHref}>{company.phoneDisplay}</a></p>
          </div>
        </div>
      </section>
      <section className="section surface-dark">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">How we work with NRIs</p>
            <h2 data-split>Distance should not mean guesswork.</h2>
            <ul className="checklist" data-reveal-group>
              {points.map((item) => <li key={item}><Check size={18} aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
            <p className="annot">Tax, repatriation and FEMA questions need a qualified professional; we do not advise on them.</p>
          </div>
          <div data-reveal><LeadFormSlot kind="nri" id="nri-form" /></div>
        </div>
      </section>
    </main>
  );
}
