/* eslint-disable @next/next/no-img-element */
import { BadgeCheck, MapPin, Phone } from "lucide-react";
import { AmbientBackdrop } from "../AmbientBackdrop";
import { LeadFormSlot } from "./LeadFormSlot";
import { assurances, company, whatsappLink } from "../../lib/company";
import { WaIcon } from "../WaIcon";
import type { Img } from "../../lib/catalog";

/**
 * The page an ad lands on. One job: the visitor reads the facts and enquires or calls.
 * No site menu, no footer map. Every fact comes from the catalogue; nothing is written here
 * that the listing does not already state.
 */
export type AdLandingProps = {
  eyebrow: string;
  title: string;
  place?: string;
  intro?: string;
  facts: string[][];
  cover?: Img | null;
  coverAlt?: string;
  rera?: string;
  /** What the enquiry is about, as it should read in "I just enquired about …". */
  topic: string;
  slug?: string;
  picks?: { href: string; name: string; meta: string; price: string; cover: Img | null }[];
  picksTitle?: string;
};

const steps = [
  { title: "An advisor calls you", copy: `We call the number you leave, during office hours (${company.hours.toLowerCase()}).` },
  { title: "You get the current price sheet", copy: "Today's price, the floor plans and what is still available, sent to your WhatsApp." },
  { title: "You visit, if you want to", copy: "We walk the site with you. There is no charge and no pressure to book." },
];

export function AdLanding({ eyebrow, title, place, intro, facts, cover, coverAlt, rera, topic, slug, picks, picksTitle }: AdLandingProps) {
  const wa = whatsappLink(`Hi, I would like details of ${topic}.`);
  return (
    <main id="main-content" className="adpage">
      <header className="adbar">
        <div className="site-brand" aria-label={company.name}>
          <img className="site-brand__logo" src="/brand/logo.png" alt="100 Yards" width={416} height={259} />
        </div>
        <a className="button button--gold button--sm" href={company.phoneHref} data-track="call_clicked">
          <Phone size={15} aria-hidden="true" /> <span className="adbar__num">{company.phoneDisplay}</span><span className="adbar__short">Call</span>
        </a>
      </header>

      <section className="adhero">
        <AmbientBackdrop />
        <div className="shell adhero__grid">
          <div className="adhero__copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1 data-split>{title}</h1>
            {place && <p className="adhero__loc"><MapPin size={17} aria-hidden="true" /> {place}</p>}
            {facts.length > 0 && (
              <dl className="pfacts adhero__facts adhero__facts--top">
                {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            )}
          </div>

          <div className="adhero__form" id="enquire">
            <LeadFormSlot kind="ad" id="ad-enquiry" projectSlug={slug} projectName={topic} compact />
            <p className="adhero__or">
              Prefer to talk now? <a href={company.phoneHref} data-track="call_clicked">Call {company.phoneDisplay}</a> or <a href={wa} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">WhatsApp us</a>.
            </p>
          </div>

          <div className="adhero__more">
            {cover && (
              <figure className="adhero__media">
                <span className="frame frame--corner">
                  <img src={cover.src} alt={coverAlt ?? title} width={cover.w} height={cover.h} fetchPriority="high" />
                </span>
              </figure>
            )}
            {facts.length > 2 && (
              <dl className="pfacts adhero__facts adhero__facts--rest">
                {facts.slice(2).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            )}
            {intro && <p className="adhero__intro">{intro}</p>}
            {rera !== undefined && (
              <p className="adhero__rera">
                <BadgeCheck size={16} aria-hidden="true" />
                {rera
                  ? <span>RERA registration listed for this project: <strong>{rera}</strong>. Check it on <a href={company.reraVerifyUrl} target="_blank" rel="noreferrer">rera.karnataka.gov.in</a> before you decide.</span>
                  : <span>The RERA registration number is not on our listing yet. Ask us for it, and check it on <a href={company.reraVerifyUrl} target="_blank" rel="noreferrer">rera.karnataka.gov.in</a> before you decide.</span>}
              </p>
            )}
          </div>
        </div>
      </section>

      {picks && picks.length > 0 && (
        <section className="section section--tight surface-dark">
          <div className="shell">
            <p className="eyebrow">{picksTitle}</p>
            <ul className="adpicks" data-reveal-group>
              {picks.map((p) => (
                <li key={p.href}>
                  <a href={p.href}>
                    {p.cover && <img src={p.cover.src} alt="" width={p.cover.w} height={p.cover.h} loading="lazy" />}
                    <span className="adpicks__name">{p.name}</span>
                    <span className="adpicks__meta">{p.meta}</span>
                    <span className="adpicks__price">{p.price}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section section--tight surface-dark">
        <div className="shell adnext">
          <div>
            <p className="eyebrow">After you enquire</p>
            <ol className="adsteps" data-reveal-group>
              {steps.map((s, i) => (
                <li key={s.title}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><div><h3>{s.title}</h3><p>{s.copy}</p></div></li>
              ))}
            </ol>
          </div>
          <div>
            <p className="eyebrow">What we hold ourselves to</p>
            <ul className="adpromises" data-reveal-group>
              {assurances.map((a) => <li key={a.key}><h3>{a.title}</h3><p>{a.copy}</p></li>)}
            </ul>
          </div>
        </div>
      </section>

      <footer className="adfoot">
        <div className="shell">
          <p><strong>{company.legal}</strong> · RERA agent registration {company.reraAgent}</p>
          <p>{company.address}</p>
          <p>Prices shown are the builder&apos;s published starting figures on the date listed, not a quote. Ask us for the current price sheet. Nothing on this page is legal, tax or investment advice.</p>
          <p><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/disclaimer">Disclaimer</a></p>
        </div>
      </footer>

      <nav className="adbarb" aria-label="Contact">
        <a href={company.phoneHref} data-track="call_clicked"><Phone size={21} aria-hidden="true" /> Call</a>
        <a className="adbarb__wa" href={wa} target="_blank" rel="noreferrer" data-track="whatsapp_clicked"><WaIcon size={24} /> WhatsApp</a>
        <a className="adbarb__main" href="#enquire">Get price</a>
      </nav>
    </main>
  );
}
