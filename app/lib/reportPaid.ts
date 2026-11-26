import { recordEvent } from "./analytics";
import { crmLater } from "./crm";
import { notifyLater } from "./notify";
import type { OrderRow } from "./razorpay";
import { READY } from "./reportShop";

/** Runs once per paid order: tells the team by email and puts the buyer in the CRM. */
export async function announcePaid(row: OrderRow, paymentId: string, origin: string) {
  recordEvent("report_paid", row.project_slug, row.source_path);
  const answers = {
    payment: `PAID ₹${(row.amount_paise / 100).toLocaleString("en-IN")} · Razorpay ${paymentId}`,
    delivery: READY.has(row.project_slug) ? "Buyer has the instant download link" : "TO DO: email the signed report to the buyer",
    property: row.project_name,
  };
  await notifyLater({ kind: "report", name: row.name, phone: row.phone, email: row.email, project: row.project_name, answers, sourcePath: row.source_path, source: row.utm_source, score: 90, origin });
  await crmLater({ kind: "report", name: row.name, phone: row.phone, email: row.email, projectSlug: row.project_slug, projectName: row.project_name, answers, sourcePath: row.source_path, score: 90, attribution: { utm_source: row.utm_source, utm_campaign: row.utm_campaign, utm_term: null, gclid: row.gclid, fbclid: null, referrer: null } });
}

export const downloadPath = (row: OrderRow) => (READY.has(row.project_slug) ? `/api/report/download?t=${row.download_token}` : null);
