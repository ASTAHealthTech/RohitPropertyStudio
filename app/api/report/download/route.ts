import { env } from "cloudflare:workers";
import { ordersTable, type OrderRow } from "../../../lib/razorpay";
import { READY, VAULT } from "../../../lib/reportShop";

/** Hands the final PDF to a buyer whose order is paid. The link is the buyer's private token. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return new Response("Not found", { status: 404 });
  const db = await ordersTable();
  const row = await db.prepare(`SELECT * FROM report_orders WHERE download_token = ? AND status IN ('paid','delivered')`).bind(token).first<OrderRow>();
  if (!row || !READY.has(row.project_slug)) return new Response("Not found", { status: 404 });
  const file = await env.ASSETS.fetch(new URL(`/${VAULT}/${row.project_slug}.pdf`, request.url));
  if (!file.ok) return new Response("This report is being prepared. We will email it to you.", { status: 404 });
  return new Response(file.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="100-Yards-Report-${row.project_slug}.pdf"`, "Cache-Control": "private, no-store" } });
}
