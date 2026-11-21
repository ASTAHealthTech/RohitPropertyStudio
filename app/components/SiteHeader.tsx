"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { company, mainNav } from "../lib/company";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.classList.add("is-locked");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("is-locked");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header className={`site-header${stuck ? " is-stuck" : ""}`}>
      <a className="site-brand" href="/" aria-label={`${company.name}, home`}>
        <span className="site-brand__mark" aria-hidden="true">100</span>
        <span className="site-brand__text">
          <strong>100 Yards</strong>
          <small>Real estate advisory</small>
        </span>
      </a>

      <nav className="desktop-nav" aria-label="Primary">
        {mainNav.map((item) => (
          <a key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="button button--gold button--sm header-cta" href={company.phoneHref} data-track="call_clicked">
        <Phone size={15} aria-hidden="true" /> {company.phoneDisplay}
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <div id="mobile-navigation" className={`mobile-nav${open ? " is-open" : ""}`} hidden={!open}>
        {mainNav.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
        ))}
        <a className="button button--gold" href="/contact#callback" onClick={() => setOpen(false)} data-track="callback_cta">
          Request a call back <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
