/**
 * Emails the sales team when an enquiry arrives. The enquiry is ALREADY saved in the database before
 * this runs, so email is a convenience, never the record: with no key set, or if the mail service is
 * down, nothing breaks and the lead is still on the lead desk.
 *
 * Switched on by three Worker secrets (set in Cloudflare, never in Git):
 *   RESEND_API_KEY    key from resend.com
 *   LEAD_NOTIFY_TO    where enquiries go; several addresses separated by commas
 *   LEAD_NOTIFY_FROM  optional sender, e.g. "100 Yards website <enquiries@100yards.in>".
 *                     Needs the domain verified in Resend; until then the default below is used.
 */
export type LeadNote = { kind: string; name: string; phone?: string | null; email?: string | null; project?: string | null; answers?: Record<string, string>; sourcePath?: string | null; source?: string | null; score?: number | null; origin: string };

const KIND: Record<string, string> = { callback: "Call back", visit: "Site visit", report: "Property report", nri: "NRI desk", brochure: "Brochure", commercial: "Commercial", "course-launch": "Course launch", "team-training": "Team training", "property-enquiry": "Property enquiry", general: "General" };

export async function notifyLead(lead: LeadNote): Promise<"sent" | "off" | "failed"> {
  const key = process.env.RESEND_API_KEY, to = (process.env.LEAD_NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!key || to.length === 0) return "off";
  const label = KIND[lead.kind] ?? lead.kind;
  const lines = [
    `Type: ${label}`, `Name: ${lead.name}`,
    lead.phone ? `Phone: ${lead.phone}` : "", lead.email ? `Email: ${lead.email}` : "", lead.project ? `Project: ${lead.project}` : "",
    ...Object.entries(lead.answers ?? {}).map(([k, v]) => `${k}: ${v}`),
    lead.score != null ? `Lead score: ${lead.score}` : "", lead.sourcePath ? `Page: ${lead.origin}${lead.sourcePath}` : "", lead.source ? `Came from: ${lead.source}` : "",
    "", `Open the lead desk: ${lead.origin}/desk`,
    lead.phone ? `WhatsApp them: https://wa.me/${lead.phone.replace(/[^\d]/g, "")}` : "",
  ].filter((l, i, a) => l !== "" || (i > 0 && a[i - 1] !== ""));
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(6000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM || "100 Yards website <onboarding@resend.dev>", to,
        subject: `New enquiry: ${label} · ${lead.name}${lead.project ? ` · ${lead.project}` : ""}`,
        text: lines.join("\n"), ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    });
    if (!res.ok) { console.error("Lead email failed", res.status, (await res.text()).slice(0, 300)); return "failed"; }
    return "sent";
  } catch (error) { console.error("Lead email failed", error); return "failed"; }
}

/** Sends after the visitor already has their answer, so a slow mail service never slows the form. */
export async function notifyLater(lead: LeadNote) {
  try { const { waitUntil } = await import("cloudflare:workers"); waitUntil(notifyLead(lead)); }
  catch { await notifyLead(lead); }
}
