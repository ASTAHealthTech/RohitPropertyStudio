"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type Corridor = {
  slug: string; name: string; short: string; intro: string; count: number; from: string | null;
  x: number; y: number; sample: { slug: string; name: string }[];
};

/**
 * The homepage signature: a schematic of the city that lights up corridor by
 * corridor as the list beside it scrolls past. The map is sticky (CSS), the
 * active corridor comes from an IntersectionObserver — no scroll hijacking, and
 * with JavaScript off it is simply a map beside a list of links.
 */
export function CorridorMap({ corridors }: { corridors: Corridor[] }) {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, []);

  const centre = { x: 46, y: 58 };
  return (
    <div className="corridors">
      <div className="corridors__map" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <circle className="corridors__ring" cx={centre.x} cy={centre.y} r="17" />
          <circle className="corridors__ring corridors__ring--outer" cx={centre.x} cy={centre.y} r="31" />
          <text className="corridors__city" x={centre.x} y={centre.y + 0.8}>BENGALURU</text>
          {corridors.map((c, i) => (
            <g key={c.slug} className={`corridors__node${i === active ? " is-active" : ""}`}>
              <line x1={centre.x} y1={centre.y} x2={c.x} y2={c.y} pathLength={1} />
              <circle className="corridors__pulse" cx={c.x} cy={c.y} r="5" />
              <circle className="corridors__dot" cx={c.x} cy={c.y} r="1.9" />
              <text x={c.x} y={c.y - 4.2}>{c.name}</text>
            </g>
          ))}
        </svg>
        <p className="annot">a schematic of the corridors, not to scale</p>
      </div>
      <ol className="corridors__list">
        {corridors.map((c, i) => (
          <li key={c.slug} data-index={i} ref={(el) => { rows.current[i] = el; }} className={`corridors__row${i === active ? " is-active" : ""}`}>
            <p className="corridors__short">{c.short}</p>
            <h3><a href={`/areas/${c.slug}`}>{c.name}</a></h3>
            <p className="corridors__intro">{c.intro}</p>
            <p className="corridors__meta">
              <strong>{c.count}</strong> {c.count === 1 ? "project" : "projects"}
              {c.from && <> · published prices from <strong>{c.from}</strong></>}
            </p>
            <ul className="corridors__sample">
              {c.sample.map((p) => <li key={p.slug}><a href={`/projects/${p.slug}`}>{p.name}</a></li>)}
            </ul>
            <a className="text-link" href={`/areas/${c.slug}`}>See all in {c.name} <ArrowUpRight size={14} aria-hidden="true" /></a>
          </li>
        ))}
      </ol>
    </div>
  );
}
