/**
 * 100 Yards — the company facts the whole site reads from.
 * Everything here was published on 100yards.in (Nov 2026) and confirmed by the owner.
 * Do not add a number here that is not on the public record.
 */
export const company = {
  name: "100 Yards",
  legal: "Hundred Yards Realtor Private Limited",
  line: "Real estate advisory across Bangalore, Coimbatore, Dubai and Phuket.",
  md: "Rohitt Kumar Singh",
  mdRole: "Managing Director",
  phoneDisplay: "+91 99168 66667",
  phoneHref: "tel:+919916866667",
  dubaiPhoneDisplay: "+971 55 482 6069",
  dubaiPhoneHref: "tel:+971554826069",
  email: "sales@100yards.in",
  whatsapp: "https://wa.me/919916866667",
  address: "430, Uniworks Pro, 4th floor, 5th A Cross Rd, HRBR Layout, 2nd Block, Kalyan Nagar, Bengaluru 560043",
  hours: "Every day, 9 AM – 8 PM",
  reraAgent: "PRM/KA/RERA/1251/310/AG/231030/004229",
  reraVerifyUrl: "https://rera.karnataka.gov.in/",
  cities: ["Bangalore", "Coimbatore", "Dubai", "Phuket"],
  youtube: "https://www.youtube.com/@RealtorRohitSingh",
  reportPrice: 1000,
} as const;

export function whatsappLink(text: string) {
  return `${company.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const mainNav = [
  { label: "Projects", href: "/projects" },
  { label: "Areas", href: "/areas" },
  { label: "Builders", href: "/builders" },
  { label: "Reports", href: "/reports" },
  { label: "Learn", href: "/learn" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  { label: "Residential projects", href: "/projects" },
  { label: "Commercial", href: "/commercial" },
  { label: "NRI desk", href: "/nri" },
  { label: "Property reports", href: "/reports" },
  { label: "Datalab", href: "/datalab" },
  { label: "Property Lab", href: "/lab" },
  { label: "Course", href: "/course" },
  { label: "Guides", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Client stories", href: "/stories" },
  { label: "Rohitt Kumar Singh", href: "/rohitt" },
  { label: "Contact", href: "/contact" },
] as const;

export const trustValues = [
  { letter: "T", title: "Transparency", copy: "We conduct every transaction with honesty, clear communication, and complete openness at every stage." },
  { letter: "R", title: "Reliability", copy: "Clients across Bangalore, Coimbatore, Dubai, and Phuket count on us for consistent, dependable service at every step." },
  { letter: "U", title: "Understanding", copy: "Our clients' goals, aspirations, and satisfaction are at the center of every decision we make." },
  { letter: "S", title: "Service excellence", copy: "We uphold the highest standards of expertise, conduct, and accountability in every client interaction." },
  { letter: "T", title: "Timely execution", copy: "We ensure every transaction moves forward without unnecessary delays, respecting our clients' time and goals." },
] as const;

export const services = [
  { title: "Buying", copy: "We start with your preferences and budget, then shortlist, arrange site visits, negotiate and stay with you through registration." },
  { title: "Selling", copy: "Marketing and negotiation aimed at the best possible value for your home or investment." },
  { title: "Investing", copy: "New or experienced, our advisors help you weigh opportunities across the city's growth corridors." },
  { title: "Market research", copy: "Up-to-date market analysis so the decision you make is an informed one." },
] as const;

export const whyUs = [
  { title: "Client-first", copy: "Your needs and goals come before the sale." },
  { title: "Experienced team", copy: "Advisors who know the local market and its builders." },
  { title: "Transparency", copy: "Open, honest communication at every step." },
  { title: "Tailored solutions", copy: "No two buyers are alike; neither are our shortlists." },
  { title: "End-to-end support", copy: "From first conversation to documentation and registration." },
  { title: "Proven results", copy: "Completed transactions and clients who speak for us." },
] as const;

export const commercialTypes = [
  { title: "Office space", copy: "Grade-A offices, IT parks and managed workspaces" },
  { title: "Retail & showrooms", copy: "High-street shops, mall units and showrooms" },
  { title: "Warehousing", copy: "Warehouses, logistics and industrial sheds" },
  { title: "Commercial land", copy: "Land parcels for commercial development" },
] as const;

/**
 * Ad and analytics IDs. Leave empty until the accounts are ready — the tags
 * are simply not rendered while a value is blank.
 */
export const tracking = {
  metaPixelId: "",
  googleTagId: "", // e.g. "AW-123456789" or "G-XXXXXXX"
  googleLeadLabel: "", // conversion label for a submitted lead, e.g. "AbCdEfGh"
} as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: company.name,
  legalName: company.legal,
  description: company.line,
  telephone: company.phoneDisplay,
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "430, Uniworks Pro, 4th floor, 5th A Cross Rd, HRBR Layout, 2nd Block, Kalyan Nagar",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560043",
    addressCountry: "IN",
  },
  openingHours: "Mo-Su 09:00-20:00",
  areaServed: ["Bengaluru", "Coimbatore", "Dubai", "Phuket"],
  founder: { "@type": "Person", name: company.md, jobTitle: company.mdRole },
  sameAs: [company.youtube],
};
