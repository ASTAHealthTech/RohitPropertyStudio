import { Mail, MessageCircle, Phone, MonitorPlay } from "lucide-react";
import { areas } from "../lib/catalog";
import { company, footerNav, whatsappLink } from "../lib/company";

/** The closing CTA already asks for the call back, so the footer carries the direct channels and the map of the site. */
export function SiteFooter() {
  return (
    <footer className="site-footer surface-deep">
      <div className="site-footer__main shell">
        <div data-reveal>
          <p className="eyebrow">100 Yards</p>
          <h2>The last hundred yards,<br />walked with you.</h2>
          <p className="site-footer__addr">{company.legal}<br />{company.address}<br />{company.hours}</p>
        </div>
        <div className="site-footer__channels" data-reveal data-reveal-delay="1">
          <a href={whatsappLink("Hi, I would like to speak to a property advisor.")} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp <strong>{company.phoneDisplay}</strong>
          </a>
          <a href={company.phoneHref} data-track="call_clicked"><Phone size={16} aria-hidden="true" /> India <strong>{company.phoneDisplay}</strong></a>
          <a href={company.dubaiPhoneHref} data-track="call_clicked"><Phone size={16} aria-hidden="true" /> Dubai <strong>{company.dubaiPhoneDisplay}</strong></a>
          <a href={`mailto:${company.email}`}><Mail size={16} aria-hidden="true" /> Email <strong>{company.email}</strong></a>
          <a href={company.youtube} target="_blank" rel="noreferrer" data-track="youtube_clicked"><MonitorPlay size={16} aria-hidden="true" /> YouTube <strong>@RealtorRohitSingh</strong></a>
        </div>
      </div>

      <nav className="site-footer__nav shell" aria-label="Footer">
        {footerNav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
      </nav>
      <nav className="site-footer__nav site-footer__nav--areas shell" aria-label="Areas">
        {areas.map((area) => <a href={`/areas/${area.slug}`} key={area.slug}>Projects in {area.name}</a>)}
      </nav>

      <div className="site-footer__bottom shell">
        <p>© {new Date().getFullYear()} {company.legal} · Karnataka RERA Agent Reg. No. {company.reraAgent}</p>
        <nav aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund">Refund status</a>
          <a href="/disclaimer">Disclaimer</a>
        </nav>
      </div>
    </footer>
  );
}
