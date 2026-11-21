"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProjectLite } from "../../lib/catalog";
import { ProjectCard } from "./ProjectCard";

const BUDGETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under ₹75 Lakh", min: 0, max: 75 },
  { label: "₹75 Lakh – ₹1.5 Cr", min: 75, max: 150 },
  { label: "₹1.5 Cr – ₹3 Cr", min: 150, max: 300 },
  { label: "Above ₹3 Cr", min: 300, max: Infinity },
];

/**
 * Every project is in the server-rendered HTML (search engines read all of
 * them); filtering then happens in the browser with no further requests.
 */
export function ProjectBrowser({ projects, areas, initialArea = "", initialKind = "" }: {
  projects: ProjectLite[]; areas: { slug: string; name: string }[]; initialArea?: string; initialKind?: string;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState(initialArea);
  const [kind, setKind] = useState(initialKind);
  const [budget, setBudget] = useState(0);
  const [shown, setShown] = useState(24);

  const kinds = useMemo(() => [...new Set(projects.map((p) => p.kind))].sort(), [projects]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const band = BUDGETS[budget];
    return projects.filter((p) => {
      if (area && p.corrSlug !== area) return false;
      if (kind && p.kind !== kind) return false;
      if (budget > 0 && (p.priceLakh === null || p.priceLakh < band.min || p.priceLakh >= band.max)) return false;
      if (q && !`${p.name} ${p.dev} ${p.loc} ${p.config}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, query, area, kind, budget]);

  const reset = () => { setQuery(""); setArea(""); setKind(""); setBudget(0); setShown(24); };
  const active = Boolean(query || area || kind || budget);

  return (
    <div className="browser">
      <div className="browser__bar" role="search">
        <label className="browser__search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search by project, builder or locality</span>
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setShown(24); }} placeholder="Project, builder or locality" />
        </label>
        {areas.length > 0 && (
          <label className="browser__select"><span>Area</span>
            <select value={area} onChange={(e) => { setArea(e.target.value); setShown(24); }}>
              <option value="">All areas</option>
              {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </label>
        )}
        <label className="browser__select"><span>Type</span>
          <select value={kind} onChange={(e) => { setKind(e.target.value); setShown(24); }}>
            <option value="">All types</option>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label className="browser__select"><span>Budget</span>
          <select value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setShown(24); }}>
            {BUDGETS.map((b, i) => <option key={b.label} value={i}>{b.label}</option>)}
          </select>
        </label>
      </div>

      <p className="browser__count" aria-live="polite">
        <strong>{filtered.length}</strong> {filtered.length === 1 ? "project" : "projects"}
        {active && <button type="button" className="text-link" onClick={reset}>Clear filters</button>}
      </p>

      {filtered.length ? (
        <div className="pgrid">
          {filtered.slice(0, shown).map((p, i) => <ProjectCard key={p.slug} project={p} eager={i < 3} />)}
        </div>
      ) : (
        <p className="browser__empty">No project matches those filters. Clear them, or <a href="/contact">tell us what you need</a> and we will shortlist for you.</p>
      )}

      {/* Projects beyond the first screenful stay in the HTML as plain links, so they are crawlable before "show more" is pressed. */}
      {filtered.length > shown && (
        <>
          <div className="browser__more">
            <button type="button" className="button button--outline" onClick={() => setShown((n) => n + 24)}>Show more projects</button>
          </div>
          <ul className="browser__rest">
            {filtered.slice(shown).map((p) => <li key={p.slug}><a href={`/projects/${p.slug}`}>{p.name}, {p.loc}</a></li>)}
          </ul>
        </>
      )}
    </div>
  );
}
