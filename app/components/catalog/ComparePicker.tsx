"use client";

import { useState } from "react";

type Option = { slug: string; name: string; dev: string; corr: string };

/** Three pickers. Choosing reloads /compare with the chosen projects in the address, so a comparison can be shared as a link. */
export function ComparePicker({ options, chosen }: { options: Option[]; chosen: string[] }) {
  const [picks, setPicks] = useState<string[]>([chosen[0] ?? "", chosen[1] ?? "", chosen[2] ?? ""]);
  const groups = Array.from(new Set(options.map((o) => o.corr))).sort();
  const go = (next: string[]) => {
    setPicks(next);
    const list = next.filter(Boolean).filter((s, i, a) => a.indexOf(s) === i);
    window.location.assign(list.length ? `/compare?p=${list.join(",")}` : "/compare");
  };
  return (
    <div className="cmp__pick">
      {[0, 1, 2].map((i) => (
        <label className="browser__select" key={i}><span>{["First", "Second", "Third"][i]} project{i === 2 ? " (optional)" : ""}</span>
          <select value={picks[i]} onChange={(e) => go(picks.map((p, j) => (j === i ? e.target.value : p)))} data-track="compare_pick">
            <option value="">{i === 2 ? "None" : "Choose a project"}</option>
            {groups.map((g) => <optgroup key={g} label={g}>{options.filter((o) => o.corr === g).map((o) => <option key={o.slug} value={o.slug} disabled={picks.includes(o.slug) && picks[i] !== o.slug}>{o.name} · {o.dev}</option>)}</optgroup>)}
          </select>
        </label>
      ))}
    </div>
  );
}
