import { env } from "cloudflare:workers";
import { recordEvent } from "../../lib/analytics";
import { notifyLater } from "../../lib/notify";

/**
 * A visitor tapped a WhatsApp button. We do not have their number (it only exists in
 * the WhatsApp chat), so this logs the tap and emails the team to look at the phone
 * and add the person to the CRM. Table is created on first use.
 */
const TABLE = `CREATE TABLE IF NOT EXISTS wa_taps (id TEXT PRIMARY KEY NOT NULL, at TEXT NOT NULL, path TEXT NOT NULL, project TEXT, utm_source TEXT, utm_campaign TEXT, gclid TEXT)`;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try { body = (await request.json()) as Record<string, unknown>; } catch { return new Response(null, { status: 204 }); }
  const path = clean(body.path, 200).startsWith("/") ? clean(body.path, 200) : "/", project = clean(body.project, 160);
  const at = new Date();
  try {
    await env.ACADEMY_DB.prepare(TABLE).run();
    await env.ACADEMY_DB.prepare(`INSERT INTO wa_taps (id, at, path, project, utm_source, utm_campaign, gclid) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), at.toISOString(), path, project || null, clean(body.utm_source, 200) || null, clean(body.utm_campaign, 200) || null, clean(body.gclid, 300) || null).run();
  } catch (error) { console.error("wa tap save failed", error); }
  recordEvent("whatsapp_tap", project || path, path);
  const ist = at.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  await notifyLater({
    kind: "whatsapp", name: "WhatsApp enquiry: check the WhatsApp phone", project: project || null, sourcePath: path, source: clean(body.utm_source, 200) || (clean(body.gclid, 10) ? "google ads" : null), score: 40, origin: new URL(request.url).origin,
    answers: { when: ist, action: "A visitor tapped WhatsApp on the website just now. Reply on the WhatsApp phone, then add their number to the CRM.", number: "Not known to the website. It is in the WhatsApp chat." },
  });
  return new Response(null, { status: 204 });
}
