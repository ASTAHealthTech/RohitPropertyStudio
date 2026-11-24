import { env } from "cloudflare:workers";
import { recordEvent } from "../../lib/analytics";
import { notifyLater } from "../../lib/notify";

/**
 * One endpoint for every property form. Each submission becomes one row in the
 * `leads` table with where it came from (page, ad click ids, campaign tags) and
 * a simple 0–100 intent score, so the team can sort good leads from weak ones.
 */
const kinds = new Set(["ad", "project", "visit", "snapshot", "report", "nri", "commercial", "callback"]);

type Body = Record<string, unknown>;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Keep digits and a leading +. Indian mobiles must be 10 digits starting 6–9. */
function normalisePhone(raw: string, allowInternational: boolean) {
  const digits = raw.replace(/[^\d+]/g, "");
  const indian = digits.replace(/^(\+?91|0)/, "");
  if (/^[6-9]\d{9}$/.test(indian)) return `+91${indian}`;
  if (allowInternational && /^\+\d{8,15}$/.test(digits)) return digits;
  return "";
}

/** Higher = more likely a real buyer. Shown on the desk, never to the visitor. */
function scoreLead(kind: string, answers: Record<string, string>, hasEmail: boolean) {
  let score = { ad: 40, report: 55, visit: 50, snapshot: 35, project: 30, nri: 35, commercial: 35, callback: 20 }[kind] ?? 20;
  const when = answers.timeline ?? "";
  if (when === "0-3 months") score += 25;
  else if (when === "3-6 months") score += 15;
  else if (when === "6-12 months") score += 5;
  if (answers.budget && answers.budget !== "Not sure yet") score += 10;
  if (answers.purpose) score += 5;
  if (answers.loan === "Pre-approved" || answers.loan === "Not needed") score += 5;
  if (hasEmail) score += 5;
  return Math.min(100, score);
}

async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: request.headers.get("CF-Connecting-IP") || undefined }),
  });
  if (!verification.ok) return false;
  const result = (await verification.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ message: "Please check the form and try again." }, 400);
  }

  // Honeypot: bots fill it, people never see it. Pretend success.
  if (clean(body.website, 200)) return json({ message: "Thank you. Our team will contact you shortly." }, 201);

  const kind = clean(body.kind, 20);
  const name = clean(body.name, 100);
  const email = clean(body.email, 160).toLowerCase();
  const phone = normalisePhone(clean(body.phone, 30), kind === "nri");

  if (!kinds.has(kind)) return json({ message: "Please check the form and try again." }, 400);
  if (name.length < 2) return json({ message: "Please enter your name." }, 400);
  if (!phone) {
    return json({ message: kind === "nri" ? "Please enter your number with country code, for example +971 55 123 4567." : "Please enter a valid 10-digit mobile number." }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ message: "Please enter a valid email address." }, 400);
  if (kind === "report" && !email) return json({ message: "Please add an email address so we can send the report." }, 400);
  if (body.consent !== true) return json({ message: "Please tick the consent box so we may contact you." }, 400);
  if (!(await verifyTurnstile(clean(body.turnstileToken, 2048), request))) {
    return json({ message: "The security check could not be verified. Please try again." }, 400);
  }

  const rawAnswers = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawAnswers).slice(0, 16)) {
    const v = clean(value, 300);
    if (v) answers[key.slice(0, 40)] = v;
  }
  const attribution = body.attribution && typeof body.attribution === "object" ? (body.attribution as Record<string, unknown>) : {};
  const at = (key: string, max = 200) => clean(attribution[key], max) || null;
  const sourcePath = clean(body.sourcePath, 200).startsWith("/") ? clean(body.sourcePath, 200) : "/";

  try {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await env.ACADEMY_DB.prepare(
      `INSERT INTO leads (id, kind, name, phone, email, project_slug, project_name, answers, score, source_path,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, referrer, consent_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id, kind, name, phone, email || null,
      clean(body.projectSlug, 120) || null, clean(body.projectName, 160) || null,
      JSON.stringify(answers), scoreLead(kind, answers, Boolean(email)), sourcePath,
      at("utm_source"), at("utm_medium"), at("utm_campaign"), at("utm_content"), at("utm_term"),
      at("gclid", 300), at("fbclid", 300), at("referrer", 300), now, now, now,
    ).run();

    recordEvent("lead_submitted", kind, sourcePath);
    // The lead is saved. Telling the team by email is extra and can never fail the form.
    await notifyLater({ kind, name, phone, email: email || null, project: clean(body.projectName, 160) || null, answers, sourcePath, source: at("utm_source") || at("referrer", 300), score: scoreLead(kind, answers, Boolean(email)), origin: new URL(request.url).origin });
    return json({ id, message: "Thank you. Our team will call you shortly." }, 201);
  } catch (error) {
    console.error("Lead submission failed", error);
    return json({ message: "We could not save your details just now. Please WhatsApp or call +91 99168 66667." }, 503);
  }
}
