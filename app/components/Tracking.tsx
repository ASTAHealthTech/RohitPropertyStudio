import { tracking } from "../lib/company";

/**
 * Ad platform tags (Meta Pixel, Google tag). Nothing is rendered until an ID is
 * filled in `tracking` in app/lib/company.ts, so the site ships clean today
 * and switches tracking on with a one-line change. LeadForm fires the "Lead"
 * events these tags listen for.
 */
export function Tracking() {
  const { metaPixelId, googleTagId, googleLeadLabel, googleCallLabel } = tracking;
  if (!metaPixelId && !googleTagId) return null;
  const meta = metaPixelId
    ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixelId)});fbq('track','PageView');`
    : "";
  const google = googleTagId
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(googleTagId)});${googleLeadLabel ? `window.__hyLeadLabel=${JSON.stringify(`${googleTagId}/${googleLeadLabel}`)};` : ""}${googleCallLabel ? `document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href^="tel:"]');if(a)gtag('event','conversion',{send_to:${JSON.stringify(`${googleTagId}/${googleCallLabel}`)}});});` : ""}`
    : "";
  return (
    <>
      {googleTagId && <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagId)}`} />}
      {google && <script dangerouslySetInnerHTML={{ __html: google }} />}
      {meta && <script dangerouslySetInnerHTML={{ __html: meta }} />}
    </>
  );
}
