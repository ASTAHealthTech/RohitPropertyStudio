"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Download, Lock } from "lucide-react";
import { WaIcon } from "../WaIcon";

/**
 * Buy a report online. The buyer picks one of the projects on sale, pays in
 * Razorpay's own window (cards and UPI never touch this site), and the server
 * confirms the payment before anything is promised. If payments are switched
 * off, the request form below the shop still works.
 */
type ShopProject = { slug: string; name: string; loc: string; instant: boolean };
type RzpReply = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Rzp = new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };

function loadCheckout(): Promise<Rzp> {
  const w = window as unknown as { Razorpay?: Rzp };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("blocked")));
    script.onerror = () => reject(new Error("blocked"));
    document.head.appendChild(script);
  });
}

function attribution() {
  try { return JSON.parse(sessionStorage.getItem("hy_attribution") || "{}") as Record<string, string>; } catch { return {}; }
}

export function ReportCheckout({ projects, price, preset }: { projects: ShopProject[]; price: string; preset?: string }) {
  const [status, setStatus] = useState<"idle" | "busy" | "paid" | "error">("idle");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<{ project: string; email: string; paymentId: string; download: string | null } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("busy"); setMessage("");
    try {
      const res = await fetch("/api/report/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug: form.get("project"), name: form.get("name"), phone: form.get("phone"), email: form.get("email"),
          consent: form.get("consent") === "on", website: form.get("website"), sourcePath: window.location.pathname, attribution: attribution(),
        }),
      });
      const order = (await res.json()) as { orderId?: string; keyId?: string; amount?: number; project?: string; name?: string; email?: string; phone?: string; message?: string };
      if (!res.ok || !order.orderId) throw new Error(order.message || "We could not start the payment.");
      const Razorpay = await loadCheckout().catch(() => { throw new Error("The payment window was blocked by your browser. Please switch off the ad blocker for this page, or use the request form below."); });
      window.dispatchEvent(new CustomEvent("academy:track", { detail: { event: "report_checkout_opened" } }));
      const checkout = new Razorpay({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: "INR",
        name: "100 Yards", description: `Property Intelligence Report: ${order.project}`,
        prefill: { name: order.name, email: order.email, contact: order.phone },
        theme: { color: "#101a2e" },
        modal: { ondismiss: () => { setStatus("idle"); setMessage("Payment window closed. Nothing was charged."); } },
        handler: async (reply: RzpReply) => {
          setStatus("busy"); setMessage("Confirming your payment…");
          try {
            const check = await fetch("/api/report/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reply) });
            const result = (await check.json()) as { paid?: boolean; project?: string; email?: string; paymentId?: string; download?: string | null };
            if (!result.paid) throw new Error("unconfirmed");
            setDone({ project: result.project ?? order.project ?? "", email: result.email ?? order.email ?? "", paymentId: result.paymentId ?? reply.razorpay_payment_id, download: result.download ?? null });
            setStatus("paid");
            window.dispatchEvent(new CustomEvent("academy:track", { detail: { event: "report_paid" } }));
            try { window.gtag?.("event", "purchase", { transaction_id: reply.razorpay_payment_id, value: (order.amount ?? 0) / 100, currency: "INR" }); } catch { /* tag blocked */ }
          } catch {
            setStatus("error");
            setMessage(`Your payment went through (reference ${reply.razorpay_payment_id}) but this page could not confirm it. You do not need to pay again: we have the record and will email your report. WhatsApp +91 99168 66667 with the reference if you need help.`);
          }
        },
      });
      checkout.on("payment.failed", () => { setStatus("error"); setMessage("The payment did not go through and nothing was charged. Please try again."); });
      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not start the payment.");
    }
  }

  if (status === "paid" && done) {
    const wa = `Hi, I paid for the ${done.project} report on 100yards.in. Payment reference ${done.paymentId}.`;
    return (
      <div className="form__success lead-form__done" role="status" id="order-form">
        <CheckCircle2 size={34} aria-hidden="true" />
        <p className="eyebrow">Payment received</p>
        <h3>Thank you. Your report for {done.project} is confirmed.</h3>
        <p>
          {done.download
            ? "Your report is ready. Download it now; we have also noted your email for a copy."
            : `Rohitt reviews and signs each report before it leaves. Yours reaches ${done.email} within 24–48 hours.`}
        </p>
        <p className="annot">Payment reference: {done.paymentId}</p>
        <div className="lead-form__next">
          {done.download && (
            <a className="button button--gold" href={done.download} data-track="report_downloaded"><Download size={20} aria-hidden="true" /> Download the report</a>
          )}
          <a className="button button--wa" href={`https://wa.me/919916866667?text=${encodeURIComponent(wa)}`} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
            <WaIcon size={24} /> Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="form lead-form" onSubmit={submit} id="order-form">
      <div className="form__heading">
        <p className="eyebrow">Order online</p>
        <h2>Choose the project and pay {price}.</h2>
        <p>One report per project, written from its current record. {price} is the full price; nothing is added at payment.</p>
      </div>
      <div className="field field--full">
        <label htmlFor="rc-project">Project</label>
        <select id="rc-project" name="project" required defaultValue={preset && projects.some((p) => p.slug === preset) ? preset : ""}>
          <option value="" disabled>Select a project</option>
          {projects.map((p) => <option key={p.slug} value={p.slug}>{p.name}{p.loc ? `, ${p.loc.split(",")[0]}` : ""}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="rc-name">Full name</label>
        <input id="rc-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required placeholder="Your name" />
      </div>
      <div className="field">
        <label htmlFor="rc-phone">Mobile number</label>
        <input id="rc-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} required placeholder="10-digit mobile" />
      </div>
      <div className="field field--full">
        <label htmlFor="rc-email">Email the report should go to</label>
        <input id="rc-email" name="email" type="email" autoComplete="email" maxLength={160} required placeholder="you@example.com" />
      </div>
      <div className="form__honeypot" aria-hidden="true">
        <label htmlFor="rc-website">Website</label>
        <input id="rc-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="form__consent">
        <input name="consent" type="checkbox" required />
        <span>I accept the <a href="/terms">terms</a> and the <a href="/refund">refund policy</a>, and agree that 100 Yards may contact me about this order.</span>
      </label>
      <div className="form__submit">
        <button className="button button--gold" type="submit" disabled={status === "busy"}>
          {status === "busy" ? "Please wait…" : `Pay ${price} securely`} <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p><Lock size={13} aria-hidden="true" /> Paid in Razorpay&apos;s window by UPI, card or net banking. This site never sees your card.</p>
      </div>
      {message && <p className={`form__message${status === "error" ? " form__message--error" : ""}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
