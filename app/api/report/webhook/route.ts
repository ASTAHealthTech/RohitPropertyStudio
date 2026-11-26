import { announcePaid } from "../../../lib/reportPaid";
import { hmacHex, markPaid, rzpKeys, sameText } from "../../../lib/razorpay";

/**
 * Safety net. If the buyer pays and closes the tab before step 2 runs, Razorpay still
 * calls this address, so no paid order is ever missed. Signed with RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const { webhook } = rzpKeys();
  const raw = await request.text();
  const given = request.headers.get("x-razorpay-signature") || "";
  if (!webhook || !given || !sameText(await hmacHex(webhook, raw), given)) return new Response("bad signature", { status: 400 });
  try {
    const event = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
    const pay = event.payload?.payment?.entity;
    if ((event.event === "payment.captured" || event.event === "order.paid") && pay?.id && pay.order_id) {
      const { row, first } = await markPaid(pay.order_id, pay.id);
      if (row && first) await announcePaid(row, pay.id, new URL(request.url).origin);
    }
  } catch (error) { console.error("Report webhook failed", error); return new Response("error", { status: 500 }); }
  return new Response("ok");
}
