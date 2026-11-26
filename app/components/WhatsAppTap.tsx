"use client";

import { useEffect } from "react";

/**
 * WhatsApp opens outside the site, so the site never learns the visitor's number.
 * What it can do is tell the team, the moment someone taps a WhatsApp button, that
 * an enquiry is on its way to the WhatsApp phone and from which page. The team then
 * replies there and adds the person to the CRM. Nothing is asked of the visitor.
 */
export function WhatsAppTap() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href*="wa.me"]');
      if (!link) return;
      let attribution: Record<string, string> = {};
      try { attribution = JSON.parse(sessionStorage.getItem("hy_attribution") || "{}"); } catch { /* private mode */ }
      const path = window.location.pathname, m = /^\/(?:enquire|projects)\/([^/]+)/.exec(path);
      const body = JSON.stringify({ path, project: m ? document.querySelector("h1")?.textContent?.trim() ?? "" : "", utm_source: attribution.utm_source ?? "", utm_campaign: attribution.utm_campaign ?? "", gclid: attribution.gclid ?? "" });
      try { navigator.sendBeacon("/api/wa-tap", new Blob([body], { type: "application/json" })); } catch { /* the chat must open regardless */ }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
