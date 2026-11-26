import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";
import { company } from "../lib/company";

const price = `₹${company.reportPrice.toLocaleString("en-IN")}`;

export const metadata: Metadata = { title: "Refund and cancellation policy", alternates: { canonical: "/refund" } };
export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Payments"
      updated="26 November 2026"
      title="Refund and cancellation policy"
      intro={`This policy covers the one thing sold on this website: the Property Intelligence Report, ${price} per project.`}
      sections={[
        { title: "What you pay for", paragraphs: [`A Property Intelligence Report is a PDF document about one project, sold by ${company.legal} for ${price}, all taxes included. Payment is taken online through Razorpay. No property booking, token or advance is ever collected on this website.`] },
        { title: "Delivery", paragraphs: ["The report is sent to the email address given at payment within 48 hours. Where a download is offered on the confirmation screen, the report is delivered at that moment."] },
        { title: "When you get a full refund", bullets: ["The report has not been delivered within 48 hours of payment and you ask for your money back.", "You were charged more than once for the same order.", "You cancel before the report has been sent or downloaded."] },
        { title: "When a refund is not given", paragraphs: ["Once the report has been emailed or downloaded it is a delivered digital document and cannot be returned, so the payment is not refunded. If something in a delivered report is wrong, tell us and we correct and re-issue it at no charge."] },
        { title: "How to ask", paragraphs: [`Email ${company.email} or WhatsApp +91 99168 66667 with your payment reference. Approved refunds are sent back to the original payment method within 5 to 7 working days.`] },
      ]}
    />
  );
}
