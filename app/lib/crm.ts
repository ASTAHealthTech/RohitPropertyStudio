/**
 * Sends each property enquiry into the Sysbi CRM (bos.sysbi.com), where the sales team is
 * assigned leads and records follow-ups. Like the email alert, this runs AFTER the enquiry is
 * saved in our own database, so the CRM being slow or down never loses a lead or slows the form.
 *
 * Switched on by one Worker secret (set in Cloudflare, never in Git):
 *   SYSBI_KEY   the Integration Key from Sysbi's "Website Marketing Lead Integration" document.
 *               It is the last part of the endpoint address. Anyone holding it can add leads
 *               to the CRM, so it must never be committed or pasted into chat.
 *
 * Who gets each lead (for example, only people who are clocked in) is decided inside Sysbi by
 * its assignment rules; this API only delivers the lead.
 */
import { areaBySlug, areas, projectBySlug } from "./catalog";

export type CrmLead = {
  kind: string; name: string; phone: string; email?: string | null;
  projectSlug?: string | null; projectName?: string | null;
  answers?: Record<string, string>; sourcePath?: string | null; score?: number | null;
  attribution?: Record<string, string | null | undefined>;
};

/** Enquiry types the sales team follows up. Course sign-ups and report orders stay out of the CRM. */
const CRM_KINDS = new Set(["ad", "project", "visit", "snapshot", "callback", "nri", "commercial"]);
const KIND: Record<string, string> = { ad: "Ad page enquiry", project: "Project enquiry", visit: "Site visit request", snapshot: "Free snapshot request", callback: "Call back request", nri: "NRI desk", commercial: "Commercial requirement" };
const LABEL: Record<string, string> = { budget: "Budget", timeline: "Planning to buy in", purpose: "Buying", visitDay: "Visit day", pickup: "Pick-up needed", callTime: "Best time to call", lookingFor: "Looking for", country: "Country", propertyType: "Property type", deal: "Buy or lease", areaSqft: "Area needed (sq ft)", location: "Preferred location" };

const base = () => (process.env.SYSBI_URL || "https://bi.sysbi.com/api").replace(/\/$/, "");

function cameFrom(a: CrmLead["attribution"] = {}) {
  if (a.gclid || /google/i.test(a.utm_source ?? "")) return "Google Ads";
  if (a.fbclid || /facebook|instagram|meta/i.test(a.utm_source ?? "")) return "Meta Ads";
  if (a.utm_source) return a.utm_source;
  if (a.referrer) return `Website (from ${a.referrer.replace(/^https?:\/\//, "").split("/")[0]})`;
  return "Website (direct)";
}

/** The exact body Sysbi's document asks for. Every "required" field is always filled. */
export function sysbiPayload(lead: CrmLead, repeat?: string) {
  const project = lead.projectSlug ? projectBySlug(lead.projectSlug) : undefined;
  const pathArea = (lead.sourcePath ?? "").match(/^\/(?:enquire|areas)\/([a-z0-9-]+)/)?.[1];
  const area = project ? areaBySlug(project.corrSlug) : pathArea ? areaBySlug(pathArea) : areas.find((a) => (lead.projectName ?? "").includes(a.name));
  const digits = lead.phone.replace(/\D/g, "");
  const indian = /^91[6-9]\d{9}$/.test(digits) || /^[6-9]\d{9}$/.test(digits);
  const a = lead.attribution ?? {};
  const lines = [
    repeat ?? "",
    KIND[lead.kind] ?? lead.kind,
    ...Object.entries(lead.answers ?? {}).map(([k, v]) => `${LABEL[k] ?? k}: ${v}`),
    indian ? "" : `Full number: ${lead.phone}`,
    `Source: ${cameFrom(a)}`,
    a.utm_campaign ? `Campaign: ${a.utm_campaign}` : "",
    a.utm_term ? `Search term: ${a.utm_term}` : "",
    lead.sourcePath ? `Page: ${lead.sourcePath}` : "",
    lead.score != null ? `Website lead score: ${lead.score}/100` : "",
  ].filter(Boolean);
  return {
    name: lead.name,
    mobile: indian ? digits.slice(-10) : digits,
    email: lead.email ?? "",
    city_name: area?.slug === "coimbatore" ? "Coimbatore" : "Bangalore",
    subcity_name: area && area.slug !== "coimbatore" ? area.name : area ? "Coimbatore" : "Bangalore",
    project: project?.name ?? (area ? `General enquiry - ${area.name}` : lead.kind === "commercial" ? "Commercial requirement" : "General enquiry"),
    property_status: lead.answers?.deal === "Lease" ? "rent" : "fresh",
    pid: project?.slug ?? (area ? `area-${area.slug}` : `web-${lead.kind}`),
    message: lines.join(" | ").slice(0, 900),
  };
}

async function post(path: string, body: object) {
  const key = process.env.SYSBI_KEY;
  const res = await fetch(`${base()}/${path}/${key}`, { method: "POST", signal: AbortSignal.timeout(7000), headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = (await res.text()).slice(0, 400);
  return { ok: res.ok, status: res.status, text };
}

/** Is this phone number already in the CRM? Returns a short note for the sales team, or nothing. */
async function repeatNote(mobile: string) {
  try {
    const found = await post("SearchLead", { search_key: mobile });
    if (!found.ok) return undefined;
    const data = JSON.parse(found.text) as { success?: boolean; data?: { leads_id?: number; pipeline_status?: string; created_at?: string }[] };
    const first = data.success ? data.data?.[0] : undefined;
    return first ? `REPEAT ENQUIRY: already in CRM as #${first.leads_id ?? "?"} (${first.pipeline_status ?? "status unknown"}, first seen ${String(first.created_at ?? "").slice(0, 10)})` : undefined;
  } catch { return undefined; }
}

export async function sendToCrm(lead: CrmLead): Promise<{ result: "sent" | "off" | "skipped" | "failed"; detail?: string }> {
  if (!process.env.SYSBI_KEY) return { result: "off" };
  if (!CRM_KINDS.has(lead.kind)) return { result: "skipped" };
  try {
    const first = sysbiPayload(lead);
    const body = sysbiPayload(lead, await repeatNote(first.mobile));
    const res = await post("Integration/Website", body);
    if (!res.ok) { console.error("CRM lead failed", res.status, res.text); return { result: "failed", detail: `${res.status} ${res.text}` }; }
    // The CRM answers 200 even when it refuses a lead, so read its own verdict.
    let accepted = true;
    try { accepted = (JSON.parse(res.text) as { success?: boolean }).success !== false; } catch { /* not JSON: trust the status */ }
    if (!accepted) {
      // A same-day repeat is already in the CRM; that is not a lost lead.
      if (/already exists/i.test(res.text)) return { result: "skipped", detail: res.text };
      console.error("CRM lead refused", res.text);
      return { result: "failed", detail: res.text };
    }
    return { result: "sent", detail: res.text };
  } catch (error) {
    console.error("CRM lead failed", error);
    return { result: "failed", detail: error instanceof Error ? error.message : "unknown error" };
  }
}

/** Sends after the visitor already has their answer. */
export async function crmLater(lead: CrmLead) {
  try { const { waitUntil } = await import("cloudflare:workers"); waitUntil(sendToCrm(lead)); }
  catch { await sendToCrm(lead); }
}
