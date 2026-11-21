import type { Metadata } from "next";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { ProjectBrowser } from "../components/catalog/ProjectBrowser";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { areas, builders, projectsLite } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Residential projects in Bangalore: apartments, villas and plots",
  description: `Browse ${projectsLite.length} residential projects in Bangalore from ${builders.length} builders. Filter by area, type and budget, with RERA numbers, prices and floor plans from 100 Yards.`,
  alternates: { canonical: "/projects" },
};

type Search = { searchParams: Promise<{ area?: string; type?: string }> };

export default async function ProjectsPage({ searchParams }: Search) {
  const query = await searchParams;
  const initialArea = areas.some((a) => a.slug === query.area) ? query.area! : "";
  const initialKind = ["Apartments", "Villas", "Plots"].includes(query.type ?? "") ? query.type! : "";
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Residential projects</p>
            <h1 data-split>Find the home. Then check the record.</h1>
            <p data-enter>
              {projectsLite.length} projects from {builders.length} builders across Bangalore&apos;s growth corridors.
              Filter by area, type and budget.
            </p>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>How to read a listing</strong>
            <p>Prices are the published starting figures. Every project page carries its RERA number and a link to the official register.</p>
          </div>
        </div>
      </section>

      <section className="section section--tight surface-dark">
        <div className="shell">
          <ProjectBrowser projects={projectsLite} areas={areas.map((a) => ({ slug: a.slug, name: a.name }))} initialArea={initialArea} initialKind={initialKind} />
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Not sure where to start</p>
            <h2 data-split>Tell us the brief. We shortlist.</h2>
            <p className="head__note" data-reveal>Budget, area and timeline are enough. An advisor calls you back with three to five projects that fit.</p>
          </div>
          <div data-reveal><LeadFormSlot kind="callback" id="callback" /></div>
        </div>
      </section>
    </main>
  );
}
