import { env } from "cloudflare:workers";
import { sendToCrm, sysbiPayload } from "../../lib/crm";

/**
 * The private lead desk API. Every call must carry the team key
 * (Worker secret DESK_KEY) in the `x-desk-key` header. With no secret set the
 * desk is closed — it never falls open.
 *
 *   GET  /api/desk            → latest leads as JSON
 *   GET  /api/desk?format=csv → the same as a spreadsheet download
 *   POST /api/desk            → { id, status?, note? } updates one lead
 *   GET  /api/desk?crm=preview → shows what a lead looks like when sent to the Sysbi CRM (sends nothing)
 *   GET  /api/desk?crm=test    → sends ONE clearly-marked test lead to the CRM and returns its reply
 */
const statuses = new Set(["new", "junk", "not-now", "qualified", "visit-booked", "visit-done", "booked"]);

function authorised(request: Request) {
  const secret = process.env.DESK_KEY;
  if (!secret) return { ok: false as const, response: Response.json({ message: "The lead desk is not switched on yet. Add the DESK_KEY secret in Cloudflare." }, { status: 503 }) };
  const given = request.headers.get("x-desk-key") ?? "";
  if (given.length !== secret.length) return { ok: false as const, response: Response.json({ message: "Wrong key." }, { status: 401 }) };
  let diff = 0;
  for (let i = 0; i < secret.length; i += 1) diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
  if (diff !== 0) return { ok: false as const, response: Response.json({ message: "Wrong key." }, { status: 401 }) };
  return { ok: true as const };
}

const columns = ["created_at", "status", "score", "kind", "name", "phone", "email", "project_name", "answers", "note", "source_path", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "referrer", "id"] as const;

function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);
  // Stop spreadsheet apps from running a cell that starts like a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const auth = authorised(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const crm = url.searchParams.get("crm");
  if (crm === "preview" || crm === "test") {
    const sample = { kind: "ad", name: "WEBSITE TEST - please ignore", phone: "+919000000001", email: null, projectSlug: null, projectName: "homes in Devanahalli", answers: { budget: "Not sure yet", timeline: "Just exploring" }, sourcePath: "/enquire/devanahalli", score: 0, attribution: { utm_source: "website-test" } };
    if (crm === "preview") return Response.json({ switchedOn: Boolean(process.env.SYSBI_KEY), wouldSend: sysbiPayload(sample) }, { headers: { "Cache-Control": "no-store" } });
    return Response.json(await sendToCrm(sample), { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const { results } = await env.ACADEMY_DB.prepare(`SELECT ${columns.join(", ")} FROM leads ORDER BY created_at DESC LIMIT 2000`).all<Record<string, unknown>>();
    if (url.searchParams.get("format") === "csv") {
      const lines = [columns.join(","), ...results.map((row) => columns.map((c) => csvCell(row[c])).join(","))];
      return new Response(lines.join("\r\n"), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="100yards-leads-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
      });
    }
    return Response.json({ leads: results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Desk read failed", error);
    return Response.json({ message: "The lead table could not be read. Has migration 0002 been applied?" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = authorised(request);
  if (!auth.ok) return auth.response;
  let body: { id?: unknown; status?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Bad request." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" && statuses.has(body.status) ? body.status : null;
  const note = typeof body.note === "string" ? body.note.slice(0, 1000) : null;
  if (!id || (status === null && note === null)) return Response.json({ message: "Nothing to update." }, { status: 400 });
  try {
    await env.ACADEMY_DB.prepare("UPDATE leads SET status = COALESCE(?, status), note = COALESCE(?, note), updated_at = ? WHERE id = ?")
      .bind(status, note, new Date().toISOString(), id).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Desk update failed", error);
    return Response.json({ message: "Could not save." }, { status: 503 });
  }
}
