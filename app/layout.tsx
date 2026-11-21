import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Playfair_Display } from "next/font/google";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/home.css";
import "./styles/pages.css";
import "./styles/lab.css";
import "./styles/datalab.css";
import "./styles/catalog.css";
import { EventTracker } from "./components/EventTracker";
import { MotionLayer } from "./components/MotionLayer";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { StickyCta } from "./components/StickyCta";
import { Tracking } from "./components/Tracking";
import { company, organizationJsonLd } from "./lib/company";
import { personJsonLd } from "./lib/siteContent";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "100 Yards | Real estate consultants in Bangalore";
  const description = `${company.legal}: residential and commercial property advisory across Bangalore, Coimbatore, Dubai and Phuket. RERA numbers on every listing and signed property reports.`;
  return {
    title: { default: title, template: "%s | 100 Yards" },
    description,
    metadataBase: new URL(origin),
    openGraph: {
      type: "website",
      title,
      description,
      siteName: company.name,
      url: origin,
      locale: "en_IN",
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/brand/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = JSON.stringify([organizationJsonLd, personJsonLd]).replace(/</g, "\\u003c");
  return (
    <html lang="en-IN" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <MotionLayer />
        <EventTracker />
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyCta />
        <Tracking />
      </body>
    </html>
  );
}
