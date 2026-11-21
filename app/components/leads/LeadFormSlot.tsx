import { LeadForm, type LeadKind } from "./LeadForm";

/** Server wrapper: hands the public Turnstile key to the form, when one is configured. */
export function LeadFormSlot(props: { kind: LeadKind; projectSlug?: string; projectName?: string; id?: string; compact?: boolean }) {
  return <LeadForm {...props} siteKey={process.env.TURNSTILE_SITE_KEY || undefined} />;
}
