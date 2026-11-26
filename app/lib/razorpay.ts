import { env } from "cloudflare:workers";

/**
 * Razorpay, kept to the three things the report shop needs: create an order,
 * check a signature, and record the result. Keys are Worker secrets
 * (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) and never in Git.
 * With no keys set the shop reports "off" and the page falls back to the request form.
 */
export const rzpKeys = () => ({ id: process.env.RAZORPAY_KEY_ID || "", secret: process.env.RAZORPAY_KEY_SECRET || "", webhook: process.env.RAZORPAY_WEBHOOK_SECRET || "" });

export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compare without leaking where the strings differ. */
export function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createRzpOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  const { id, secret } = rzpKeys();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST", signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Basic ${btoa(`${id}:${secret}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as { id: string };
}

const TABLE = `CREATE TABLE IF NOT EXISTS report_orders (
  id TEXT PRIMARY KEY NOT NULL, project_slug TEXT NOT NULL, project_name TEXT NOT NULL, name TEXT NOT NULL,
  phone TEXT NOT NULL, email TEXT NOT NULL, amount_paise INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'created',
  rzp_order_id TEXT NOT NULL UNIQUE, rzp_payment_id TEXT, download_token TEXT NOT NULL,
  source_path TEXT NOT NULL DEFAULT '/reports', utm_source TEXT, utm_campaign TEXT, gclid TEXT,
  created_at TEXT NOT NULL, paid_at TEXT)`;
let tableReady = false;
/** Same shape as migrations/0003_report_orders.sql, so a missed migration can never block a payment. */
export async function ordersTable() {
  if (!tableReady) { await env.ACADEMY_DB.prepare(TABLE).run(); tableReady = true; }
  return env.ACADEMY_DB;
}

export type OrderRow = { id: string; project_slug: string; project_name: string; name: string; phone: string; email: string; amount_paise: number; status: string; rzp_order_id: string; download_token: string; source_path: string; utm_source: string | null; utm_campaign: string | null; gclid: string | null };

/** Marks an order paid exactly once. Returns the row only on the first call, so the team is told once. */
export async function markPaid(rzpOrderId: string, paymentId: string): Promise<{ row: OrderRow | null; first: boolean }> {
  const db = await ordersTable();
  const done = await db.prepare(`UPDATE report_orders SET status = 'paid', rzp_payment_id = ?, paid_at = ? WHERE rzp_order_id = ? AND status = 'created'`)
    .bind(paymentId, new Date().toISOString(), rzpOrderId).run();
  const row = await db.prepare(`SELECT * FROM report_orders WHERE rzp_order_id = ?`).bind(rzpOrderId).first<OrderRow>();
  return { row: row ?? null, first: (done.meta?.changes ?? 0) > 0 };
}
