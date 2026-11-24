"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Phone } from "lucide-react";
import { company, whatsappLink } from "../lib/company";
import { WaIcon } from "./WaIcon";

/**
 * The contact dock. WhatsApp and Call are always one tap away: a floating
 * stack at the bottom right on desktop, a full-width bar on phones. The third
 * button appears once the visitor has passed the first screen. On a project
 * page it jumps to that project's enquiry form; elsewhere it asks for a call back.
 */
export function StickyCta() {
  const [shown, setShown] = useState(false);
  const pathname = usePathname();
  const onProject = /^\/projects\/[^/]+/.test(pathname);
  const hidden = pathname === "/desk" || pathname === "/brandkit" || pathname.startsWith("/enquire");

  useEffect(() => {
    const onScroll = () => {
      const passedHero = window.scrollY > window.innerHeight * 0.9;
      const distanceToEnd = document.body.scrollHeight - (window.scrollY + window.innerHeight);
      // Stand down once the closing call to action and footer are on screen.
      setShown(passedHero && distanceToEnd > window.innerHeight * 1.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (hidden) return null;
  const wa = whatsappLink(
    pathname === "/"
      ? "Hi, I would like to speak to a property advisor."
      : `Hi, I would like details. I am on 100yards.in${pathname}`,
  );
  return (
    <>
      <div className="dock-space" aria-hidden="true" />
      <nav className="dock" aria-label="Contact 100 Yards">
        <a
          className={`dock__cta${shown ? " is-shown" : ""}`}
          href={onProject ? "#enquire" : "/contact#callback"}
          data-track={onProject ? "project_enquire_cta" : "callback_cta"}
          tabIndex={shown ? 0 : -1}
          aria-hidden={!shown}
        >
          {onProject ? "Get price & plans" : "Request a call back"} <ArrowUpRight size={17} aria-hidden="true" />
        </a>
        <a className="dock__btn dock__btn--wa" href={wa} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
          <WaIcon size={26} /> <span>WhatsApp</span>
        </a>
        <a className="dock__btn dock__btn--call" href={company.phoneHref} data-track="call_clicked">
          <Phone size={22} aria-hidden="true" /> <span>Call<em> {company.phoneDisplay}</em></span>
        </a>
      </nav>
    </>
  );
}
