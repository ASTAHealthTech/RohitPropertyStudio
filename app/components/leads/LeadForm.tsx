"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { WaIcon } from "../WaIcon";

/**
 * One form component, seven forms. Each `kind` asks only what that visitor
 * expects to be asked, and every submission carries where the visitor came from
 * (campaign tags and ad click ids captured on arrival) so leads can be traced
 * back to the ad that produced them.
 */
export type LeadKind = "ad" | "project" | "visit" | "snapshot" | "report" | "nri" | "commercial" | "callback";

type FieldDef = { name: string; label: string; options?: string[]; placeholder?: string; type?: string; full?: boolean; required?: boolean };

const BUDGET = ["Under ₹75 Lakh", "₹75 Lakh – ₹1.5 Cr", "₹1.5 Cr – ₹3 Cr", "Above ₹3 Cr", "Not sure yet"];
const TIMELINE = ["0-3 months", "3-6 months", "6-12 months", "Just exploring"];
const PURPOSE = ["To live in", "Investment", "Both"];

const CONFIG: Record<LeadKind, { eyebrow: string; title: string; copy: string; submit: string; done: string; fields: FieldDef[]; email?: "required" | "optional" }> = {
  ad: {
    eyebrow: "Enquire",
    title: "Get the price sheet and floor plans.",
    copy: "Two quick questions, so the advisor who calls already knows what you need.",
    submit: "Send me the details",
    done: "An advisor will call you with the current price sheet and floor plans.",
    fields: [
      { name: "budget", label: "Budget", options: BUDGET, required: true },
      { name: "timeline", label: "Planning to buy in", options: TIMELINE, required: true },
    ],
  },
  project: {
    eyebrow: "Enquire",
    title: "Get price, plans and availability.",
    copy: "Three quick questions help us send the right details the first time.",
    submit: "Send me the details",
    done: "Our advisor will call you with the current price sheet and floor plans.",
    fields: [
      { name: "budget", label: "Budget", options: BUDGET, required: true },
      { name: "purpose", label: "Buying", options: PURPOSE, required: true },
      { name: "timeline", label: "Planning to buy in", options: TIMELINE, required: true, full: true },
    ],
  },
  visit: {
    eyebrow: "Site visit",
    title: "See it in person.",
    copy: "Pick a day. We confirm the slot by phone and can arrange a pick-up.",
    submit: "Request my site visit",
    done: "We will call to confirm your visit slot.",
    fields: [
      { name: "visitDay", label: "Preferred day", type: "date", required: true },
      { name: "pickup", label: "Pick-up needed", options: ["No", "Yes"] },
      { name: "timeline", label: "Planning to buy in", options: TIMELINE, required: true, full: true },
    ],
  },
  snapshot: {
    eyebrow: "Free snapshot",
    title: "Get the 2-page record snapshot.",
    copy: "The registration record and key facts for this project, sent to your WhatsApp. Free.",
    submit: "Send my free snapshot",
    done: "Your snapshot will reach you on WhatsApp shortly.",
    fields: [{ name: "timeline", label: "Planning to buy in", options: TIMELINE, required: true, full: true }],
  },
  report: {
    eyebrow: "Order a report",
    title: "Commission the full report.",
    copy: "Tell us the property. We confirm scope and send a payment link on WhatsApp; the signed report follows in 24–48 hours.",
    submit: "Request my report",
    done: "We will WhatsApp you a payment link and confirm the delivery time.",
    email: "required",
    fields: [
      { name: "property", label: "Project or property name", placeholder: "e.g. project name, tower, locality", full: true, required: true },
      { name: "stage", label: "Where are you in the decision", options: ["Shortlisting", "Visited the site", "About to book", "Already booked"], required: true, full: true },
    ],
  },
  nri: {
    eyebrow: "NRI desk",
    title: "Buying from abroad.",
    copy: "Share your country and a good time to call. We work across time zones.",
    submit: "Request a call",
    done: "Our NRI desk will reach you on WhatsApp at the time you chose.",
    email: "optional",
    fields: [
      { name: "country", label: "Country of residence", placeholder: "e.g. UAE", required: true },
      { name: "callTime", label: "Best time to call (your local time)", placeholder: "e.g. weekdays after 7 PM", required: true },
      { name: "budget", label: "Budget", options: BUDGET, required: true },
      { name: "timeline", label: "Planning to buy in", options: TIMELINE, required: true },
    ],
  },
  commercial: {
    eyebrow: "Commercial requirement",
    title: "Tell us what your business needs.",
    copy: "Our commercial team shortlists options that match your space, budget and location.",
    submit: "Send requirement",
    done: "Our commercial team will call you with a shortlist.",
    email: "optional",
    fields: [
      { name: "propertyType", label: "Property type", options: ["Office space", "Retail & showrooms", "Warehousing", "Commercial land"], required: true },
      { name: "deal", label: "Buy or lease", options: ["Lease", "Buy", "Investment (pre-leased)"], required: true },
      { name: "areaSqft", label: "Area needed (sq ft)", placeholder: "e.g. 5,000" },
      { name: "location", label: "Preferred location", placeholder: "e.g. Hebbal" },
    ],
  },
  callback: {
    eyebrow: "Call back",
    title: "Ask us to call you.",
    copy: "Leave your number and a good time. An advisor calls you back.",
    submit: "Request a call back",
    done: "An advisor will call you at the time you chose.",
    fields: [
      { name: "callTime", label: "Best time to call", options: ["As soon as possible", "Morning", "Afternoon", "Evening"], required: true },
      { name: "lookingFor", label: "Looking for", options: ["Apartment", "Villa", "Plot", "Commercial", "Not sure yet"], required: true },
    ],
  },
};

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id?: string) => void };
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __hyLeadLabel?: string;
  }
}

const ATTR_KEY = "hy_attribution";
const ATTR_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

/** Read campaign tags off the landing URL once and keep them for the visit. */
function readAttribution(): Record<string, string> {
  let stored: Record<string, string> = {};
  try { stored = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}"); } catch { /* storage blocked */ }
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const key of ATTR_FIELDS) {
    const value = params.get(key);
    if (value) { stored[key] = value.slice(0, 300); changed = true; }
  }
  if (!stored.referrer && document.referrer && !document.referrer.includes(window.location.host)) {
    stored.referrer = document.referrer.slice(0, 300); changed = true;
  }
  if (changed) { try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(stored)); } catch { /* storage blocked */ } }
  return stored;
}

export function LeadForm({ kind, projectSlug, projectName, siteKey, id, compact = false }: {
  kind: LeadKind; projectSlug?: string; projectName?: string; siteKey?: string; id?: string; compact?: boolean;
}) {
  const cfg = CONFIG[kind];
  const uid = id ?? `lead-${kind}`;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [armed, setArmed] = useState(false);
  const slot = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(() => { readAttribution(); }, []);

  // The security widget loads only once someone starts typing, so it costs nothing on page load.
  useEffect(() => {
    if (!siteKey || !armed || !slot.current) return;
    const render = () => {
      if (!window.turnstile || !slot.current || widget.current) return;
      widget.current = window.turnstile.render(slot.current, {
        sitekey: siteKey, theme: "dark", size: "flexible", action: `lead_${kind}`,
        callback: (t: string) => setToken(t), "expired-callback": () => setToken(""), "error-callback": () => setToken(""),
      });
    };
    let script = document.querySelector<HTMLScriptElement>("script[data-academy-turnstile]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true; script.defer = true; script.dataset.academyTurnstile = "true";
      document.head.appendChild(script);
    }
    if (window.turnstile) render(); else script.addEventListener("load", render, { once: true });
    return () => {
      script?.removeEventListener("load", render);
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, armed, kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (siteKey && !token) { setStatus("error"); setMessage("Please complete the security check."); return; }
    const form = new FormData(event.currentTarget);
    const answers: Record<string, string> = {};
    for (const field of cfg.fields) {
      const value = form.get(field.name);
      if (typeof value === "string" && value) answers[field.name] = value;
    }
    setStatus("submitting"); setMessage("");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind, name: form.get("name"), phone: form.get("phone"), email: form.get("email") ?? "",
          projectSlug, projectName, answers, consent: form.get("consent") === "on", website: form.get("website"),
          sourcePath: window.location.pathname, attribution: readAttribution(), turnstileToken: token,
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "The form could not be submitted.");
      setStatus("success");
      window.dispatchEvent(new CustomEvent("academy:track", { detail: { event: `lead_${kind}` } }));
      // Tell the ad platforms a lead happened (only if their tags are installed).
      try { window.fbq?.("track", "Lead", { content_category: kind, content_name: projectName }); } catch { /* tag blocked */ }
      try { if (window.__hyLeadLabel) window.gtag?.("event", "conversion", { send_to: window.__hyLeadLabel }); window.gtag?.("event", "generate_lead", { form: kind }); } catch { /* tag blocked */ }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The form could not be submitted.");
      if (widget.current) window.turnstile?.reset(widget.current);
      setToken("");
    }
  }

  if (status === "success") {
    const text = projectName ? `Hi, I just enquired about ${projectName} on 100yards.in.` : "Hi, I just sent an enquiry on 100yards.in.";
    return (
      <div className="form__success lead-form__done" role="status" id={uid}>
        <CheckCircle2 size={34} aria-hidden="true" />
        <p className="eyebrow">Received</p>
        <h3>Thank you. We have your details.</h3>
        <p>{cfg.done}</p>
        <div className="lead-form__next">
          <a className="button button--gold" href="tel:+919916866667" data-track="call_clicked">
            <Phone size={21} aria-hidden="true" /> Call +91 99168 66667
          </a>
          <a className="button button--wa" href={`https://wa.me/919916866667?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
            <WaIcon size={24} /> Continue on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className={`form lead-form${compact ? " lead-form--compact" : ""}`} onSubmit={submit} id={uid} onFocus={() => setArmed(true)}>
      <div className="form__heading">
        <p className="eyebrow">{cfg.eyebrow}</p>
        <h2>{cfg.title}</h2>
        <p>{projectName && kind !== "report" && kind !== "ad" ? `${projectName}. ` : ""}{cfg.copy}</p>
      </div>
      <div className="field">
        <label htmlFor={`${uid}-name`}>Full name</label>
        <input id={`${uid}-name`} name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required placeholder="Your name" />
      </div>
      <div className="field">
        <label htmlFor={`${uid}-phone`}>{kind === "nri" ? "WhatsApp number with country code" : "Mobile number"}</label>
        <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} required placeholder={kind === "nri" ? "+971 …" : "10-digit mobile"} />
      </div>
      {cfg.email && (
        <div className="field field--full">
          <label htmlFor={`${uid}-email`}>Email{cfg.email === "optional" ? " (optional)" : ""}</label>
          <input id={`${uid}-email`} name="email" type="email" autoComplete="email" maxLength={160} required={cfg.email === "required"} placeholder="you@example.com" />
        </div>
      )}
      {cfg.fields.map((field) => (
        <div className={`field${field.full ? " field--full" : ""}`} key={field.name}>
          <label htmlFor={`${uid}-${field.name}`}>{field.label}</label>
          {field.options ? (
            <select id={`${uid}-${field.name}`} name={field.name} required={field.required} defaultValue="">
              <option value="" disabled>Select</option>
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input id={`${uid}-${field.name}`} name={field.name} type={field.type ?? "text"} required={field.required} maxLength={200} placeholder={field.placeholder} />
          )}
        </div>
      ))}
      <div className="form__honeypot" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="form__consent">
        <input name="consent" type="checkbox" required />
        <span>I agree that 100 Yards may call or WhatsApp me about this enquiry. See the <a href="/privacy">privacy notice</a>.</span>
      </label>
      {siteKey && armed && <div className="turnstile-slot" ref={slot} />}
      <div className="form__submit">
        <button className="button button--gold" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : cfg.submit} <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p>{kind === "report" ? "No payment is taken on this page." : "No spam. One advisor, one call."}</p>
      </div>
      {status === "error" && <p className="form__message form__message--error" role="alert">{message}</p>}
    </form>
  );
}
