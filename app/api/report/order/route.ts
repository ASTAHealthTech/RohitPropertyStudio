import { recordEvent } from "../../../lib/analytics";
import { createRzpOrder, ordersTable, rzpKeys } from "../../../lib/razorpay";
import { PRICE_PAISE, shopBySlug } from "../../../lib/reportShop";

/** Step 1 of buying a report: save who is buying what, and open a Razorpay order for it. */
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ message: "Please check the form and try again." }, 400); }
  if (clean(body.website, 200)) return json({ message: "Please try again." }, 400);

  const project = shopBySlug(clean(body.projectSlug, 120));
  const name = clean(body.name, 100), email = clean(body.email, 160).toLowerCase();
  const digits = clean(body.phone, 30).replace(/[^\d+]/g, "").replace(/^(\+?91|0)/, "");
  if (!project) return json({ message: "Please choose a project from the list." }, 400);
  if (name.length < 2) return json({ message: "Please enter your name." }, 400);
  if (!/^[6-9]\d{9}$/.test(digits)) return json({ message: "Please enter a valid 10-digit mobile number." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ message: "Please enter the email address the report should go to." }, 400);
  if (body.consent !== true) return json({ message: "Please tick the box to accept the terms." }, 400);

  const keys = rzpKeys();
  if (!keys.id || !keys.secret) return json({ off: true, message: "Online payment is not switched on yet. Please use the request form below." }, 503);

  const at = body.attribution && typeof body.attribution === "object" ? (body.attribution as Record<string, unknown>) : {};
  try {
    const id = crypto.randomUUID();
    const order = await createRzpOrder(PRICE_PAISE, id.slice(0, 36), { project: project.slug, phone: `+91${digits}` });
    const db = await ordersTable();
    await db.prepare(
      `INSERT INTO report_orders (id, project_slug, project_name, name, phone, email, amount_paise, rzp_order_id, download_token, source_path, utm_source, utm_campaign, gclid, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id, project.slug, project.name, name, `+91${digits}`, email, PRICE_PAISE, order.id,
      crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, ""),
      clean(body.sourcePath, 200).startsWith("/") ? clean(body.sourcePath, 200) : "/reports",
      clean(at.utm_source, 200) || null, clean(at.utm_campaign, 200) || null, clean(at.gclid, 300) || null, new Date().toISOString(),
    ).run();
    recordEvent("report_checkout_opened", project.slug, "/reports");
    return json({ orderId: order.id, keyId: keys.id, amount: PRICE_PAISE, project: project.name, name, email, phone: `+91${digits}` }, 201);
  } catch (error) {
    console.error("Report order failed", error);
    return json({ message: "We could not start the payment just now. Please try again, or WhatsApp +91 99168 66667." }, 503);
  }
}
