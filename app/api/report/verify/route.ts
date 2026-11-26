import { announcePaid, downloadPath } from "../../../lib/reportPaid";
import { hmacHex, markPaid, rzpKeys, sameText } from "../../../lib/razorpay";

/** Step 2: the browser returns from Razorpay. Trust nothing until the signature matches our secret. */
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const s = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ paid: false }, 400); }
  const orderId = s(body.razorpay_order_id), paymentId = s(body.razorpay_payment_id), signature = s(body.razorpay_signature);
  const { secret } = rzpKeys();
  if (!secret || !orderId || !paymentId || !signature) return json({ paid: false }, 400);
  if (!sameText(await hmacHex(secret, `${orderId}|${paymentId}`), signature)) return json({ paid: false, message: "The payment could not be confirmed." }, 400);
  try {
    const { row, first } = await markPaid(orderId, paymentId);
    if (!row) return json({ paid: false }, 404);
    if (first) await announcePaid(row, paymentId, new URL(request.url).origin);
    return json({ paid: true, project: row.project_name, email: row.email, paymentId, download: downloadPath(row) });
  } catch (error) {
    console.error("Report verify failed", error);
    // The money is confirmed by signature even if our database hiccups; the webhook records it.
    return json({ paid: true, paymentId, download: null });
  }
}
