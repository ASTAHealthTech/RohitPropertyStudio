import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "../lib/company";

export function ClosingCta({
  eyebrow = "Talk to 100 Yards",
  title = "The right property starts with the right conversation.",
  copy = "Tell us your budget, area and timeline. One advisor calls you back with a shortlist, and the record of each project on it.",
}: {
  eyebrow?: string;
  title?: string;
  copy?: string;
}) {
  return (
    <section className="section surface-gold">
      <div className="shell closing__grid">
        <div className="head__main" data-reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="closing__action" data-reveal data-reveal-delay="1">
          <p>{copy}</p>
          <div className="closing__buttons">
            <a className="button button--gold" href="/contact#callback" data-track="callback_cta">
              Request a call back <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a className="text-link" href={whatsappLink("Hi, I would like to speak to a property advisor.")} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
