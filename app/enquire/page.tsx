import type { Metadata } from "next";
import { AdLanding } from "../components/leads/AdLanding";
import { areas, builders, projectsInArea, projectsLite } from "../lib/catalog";

export const metadata: Metadata = {
  title: "New homes in Bangalore: prices and plans",
  description: "Apartments, villas and plots across Bangalore. Get the current price sheet and floor plans from a 100 Yards advisor.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/projects" },
};

/** The general ad landing page, for ads that are not about one area or one project. */
export default function EnquireHome() {
  const city = areas.filter((a) => a.slug !== "coimbatore");
  return (
    <AdLanding
      eyebrow="Bengaluru"
      title="New homes in Bangalore"
      intro="Tell us your budget and when you plan to buy. An advisor shortlists three to five homes that fit, from the builders we work with, and sends you the current price sheets."
      facts={[
        ["Projects we list", String(projectsLite.length)],
        ["Builders", String(builders.length)],
        ["Areas", city.map((a) => a.name).join(", ")],
      ]}
      topic="homes in Bangalore"
      picks={city.map((a) => ({ href: `/enquire/${a.slug}`, name: a.name, meta: a.short, price: `${projectsInArea(a.slug).length} projects`, cover: null }))}
      picksTitle="Choose an area"
    />
  );
}
