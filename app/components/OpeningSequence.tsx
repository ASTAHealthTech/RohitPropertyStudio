"use client";

import type { CSSProperties } from "react";

/**
 * Opening — "one line, one light, one door".
 *
 *   0.2u  one champagne line is drawn across the dark sheet ("Every home begins as a line.")
 *   1.4u  the line becomes an architect's plan: walls, doors, furniture, room names, measures
 *   3.3u  one room fills with warm light
 *   4.3u  that room opens like a doorway and the home page is seen through it
 *
 * One slow camera push runs underneath everything, start to finish — no cuts.
 * Pure CSS, driven by one time unit (--ou), armed by the inline script before first paint,
 * so it plays before the page's JavaScript arrives. Once per browser session; never under
 * reduced motion or Save-Data. Phones and ad traffic run the same film at about half length.
 * `?intro=1` forces it for review.
 *
 * SMOOTHNESS RULE: everything that moves here animates `transform` or `opacity` only, so the
 * browser's compositor runs it and it keeps moving while the page's scripts load. Walls are
 * thin boxes that grow (scaleX/scaleY); furniture, measures and labels are static drawings
 * that fade in by group; the door is four panels that slide away. Do not bring back
 * stroke-dashoffset, clip-path or filter animations — those repaint the full screen every
 * frame and stutter (Nov 2026).
 *
 * THE DOOR IS THE EXPENSIVE MOMENT: for half a second the sheet and the page are both on
 * screen. So nothing else may start then — the hero film and skyline begin after the sheet has
 * gone (AmbientBackdrop), the film grain is off until then, the headline rises once the door is
 * most of the way open, and the door panels are plain colour with the lamp as its own pieces.
 */
const decide = `(function(){try{var d=document.documentElement,c=navigator.connection,q=location.search,force=/[?&]intro=1/.test(q);if(matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData))return;if(!force&&sessionStorage.getItem('hy_opened'))return;sessionStorage.setItem('hy_opened','1');var s=matchMedia('(max-width: 820px)').matches||/[?&](utm_|gclid|fbclid)/.test(q),u=s?0.55:1;d.style.setProperty('--ou',u+'s');d.classList.add('opening-on');window.__hyHold=5.0*u;setTimeout(function(){d.classList.add('opening-out')},5050*u);setTimeout(function(){d.classList.remove('opening-on','opening-out')},5650*u);}catch(e){}})();`;

const at = (d: number, len?: number) => ({ "--d": d, ...(len ? { "--l": len } : {}) }) as CSSProperties;

/* walls: [path, start] — drawn one after another so the plan grows like a single pen stroke */
const innerWalls: Array<[string, number]> = [
  ["M700 170V260M700 320V560M700 620V730", 2.0],
  ["M900 170V240M900 300V520M900 580V730", 2.15],
  ["M350 450H700", 2.3],
  ["M700 300H760M840 300H900", 2.4],
  ["M700 600H740M860 600H900", 2.5],
  ["M900 400H1250M900 560H1250", 2.6],
];

const details: Array<[string, number]> = [
  /* door leaves and their swings */
  ["M700 320H640M640 320A60 60 0 0 1 700 260", 2.6],
  ["M700 560H640M640 560A60 60 0 0 0 700 620", 2.68],
  ["M900 300H960M960 300A60 60 0 0 0 900 240", 2.76],
  ["M900 580H960M960 580A60 60 0 0 0 900 520", 2.84],
  /* windows on the outer wall */
  ["M430 164H620M430 176H620M430 724H620M430 736H620M1000 164H1180M1000 176H1180M344 250V380M356 250V380M1244 440V530M1256 440V530", 2.7],
  /* master bedroom: bed, pillows, side tables, wardrobe */
  ["M400 215H590V345H400ZM400 250H590M415 222H485V244H415ZM505 222H575V244H505ZM372 215H394V240H372ZM596 215H618V240H596Z", 2.8],
  ["M365 400H560V436H365ZM430 400V436M495 400V436", 2.88],
  /* second bedroom: bed, desk, chair */
  ["M400 575H570V690H400ZM400 606H570M414 582H476V600H414ZM494 582H556V600H494Z", 2.92],
  ["M610 470H684V520H610ZM632 536A14 14 0 1 0 660 536A14 14 0 1 0 632 536", 3.0],
  /* kitchen: counter, sink, hob */
  ["M930 195H1225V375H1175V245H930Z", 2.9],
  ["M960 205H1020V236H960ZM1190 270A10 10 0 1 0 1210 270A10 10 0 1 0 1190 270M1190 300A10 10 0 1 0 1210 300A10 10 0 1 0 1190 300M1190 330A10 10 0 1 0 1210 330A10 10 0 1 0 1190 330", 3.0],
  /* dining: table and six chairs */
  ["M1000 462H1160V508H1000Z", 3.0],
  ["M1016 440H1046V454H1016ZM1065 440H1095V454H1065ZM1114 440H1144V454H1114ZM1016 516H1046V530H1016ZM1065 516H1095V530H1065ZM1114 516H1144V530H1114Z", 3.08],
  /* bath: tub, basin, wc */
  ["M1140 585Q1140 578 1147 578H1218Q1225 578 1225 585V700Q1225 707 1218 707H1147Q1140 707 1140 700ZM1152 592H1213V694H1152Z", 3.05],
  ["M935 660A18 18 0 1 0 971 660A18 18 0 1 0 935 660M1010 690H1050V712H1010ZM1012 690A18 14 0 0 1 1048 690", 3.12],
  /* foyer: threshold and console · balcony: rail and planters */
  ["M760 170V150H840V170M770 160H830M715 185H745V250H715Z", 3.0],
  ["M712 612V718M724 612V718M736 612V718M748 612V718M876 612V718M864 612V718M852 612V718M770 700A12 12 0 1 0 794 700A12 12 0 1 0 770 700M806 700A12 12 0 1 0 830 700A12 12 0 1 0 806 700", 3.1],
];

const measures: Array<[string, number]> = [
  ["M350 112H1250M350 102V122M700 105V119M900 105V119M1250 102V122", 2.7],
  ["M292 170V730M282 170H302M285 450H299M282 730H302", 2.85],
  ["M1308 170V730M1298 170H1318M1301 400H1315M1301 560H1315M1298 730H1318", 2.95],
  /* compass */
  ["M1420 150A34 34 0 1 0 1420 218A34 34 0 1 0 1420 150M1420 138V230M1386 184H1454M1420 138L1411 172H1429Z", 3.0],
  /* registration marks at the sheet corners */
  ["M150 80H190M170 60V100M1410 800H1450M1430 780V820M150 800H190M170 780V820", 2.4],
];

const labels: Array<[number, number, string, number]> = [
  [525, 380, "MASTER BEDROOM", 3.2],
  [505, 550, "BEDROOM", 3.26],
  [1052, 300, "KITCHEN", 3.3],
  [1080, 548, "DINING", 3.34],
  [1040, 620, "BATH", 3.38],
  [800, 232, "FOYER", 3.3],
  [800, 664, "BALCONY", 3.42],
];

type Seg = { x: number; y: number; len: number; dir: "h" | "v"; rev: boolean };

/** Splits a path made of M/H/V/Z commands into its straight segments, in drawing order. */
function segments(d: string): Seg[] {
  const out: Seg[] = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  const line = (nx: number, ny: number) => {
    if (nx !== cx) out.push({ x: Math.min(cx, nx), y: cy, len: Math.abs(nx - cx), dir: "h", rev: nx < cx });
    else if (ny !== cy) out.push({ x: cx, y: Math.min(cy, ny), len: Math.abs(ny - cy), dir: "v", rev: ny < cy });
    cx = nx; cy = ny;
  };
  for (const [, cmd, rest] of d.matchAll(/([MHVZ])([^MHVZ]*)/g)) {
    const n = rest.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === "M") { cx = sx = n[0]; cy = sy = n[1]; }
    else if (cmd === "H") line(n[0], cy);
    else if (cmd === "V") line(cx, n[0]);
    else line(sx, sy);
  }
  return out;
}

/** One pen stroke: the segments grow one after another across `dur`, starting at `t`. */
function Stroke({ d, t, dur, className }: { d: string; t: number; dur: number; className?: string }) {
  const list = segments(d);
  const total = list.reduce((sum, s) => sum + s.len, 0);
  const before = list.map((_, i) => list.slice(0, i).reduce((sum, s) => sum + s.len, 0));
  return (
    <>
      {list.map((s, i) => {
        const style = { "--x": s.x, "--y": s.y, "--w": s.len, "--d": +(t + (dur * before[i]) / total).toFixed(3), "--l": +((dur * s.len) / total).toFixed(3) } as CSSProperties;
        return <i key={i} className={`o-ln o-ln--${s.dir}${s.rev ? " is-rev" : ""}${className ? ` ${className}` : ""}`} style={style} />;
      })}
    </>
  );
}

/** Groups timed items into a few layers, so each layer is one fade instead of many repaints. */
function layers<T extends { t: number }>(items: T[], step = 0.25) {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const key = Math.round(item.t / step);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([key, group]) => ({ t: +(key * step).toFixed(2), group }));
}

const detailLayers = layers(details.map(([d, t]) => ({ d, t })));
const measureLayers = layers(measures.map(([d, t]) => ({ d, t })));
const labelLayers = layers([
  ...labels.map(([x, y, text, t]) => ({ x, y, text, t, cls: "" })),
  { x: 800, y: 96, text: "100 YARDS", t: 3.1, cls: "o-dim" },
  { x: 1420, y: 128, text: "N", t: 3.2, cls: "o-dim" },
  { x: 800, y: 456, text: "LIVING", t: 3.5, cls: "o-room" },
]);

export function OpeningSequence() {
  const skip = () => document.documentElement.classList.remove("opening-on", "opening-out");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div className="opening" aria-hidden="true">
        {/* the sheet itself: four panels that part like a door, the lit room on the two middle ones */}
        <div className="opening__door">
          <i className="o-pan o-pan--t" />
          <i className="o-pan o-pan--b" />
          <i className="o-pan o-pan--l" />
          <i className="o-pan o-pan--r" />
          <i className="o-lamp o-lamp--l" />
          <i className="o-lamp o-lamp--r" />
        </div>
        <div className="opening__grid" />
        <div className="opening__cam">
          <div className="o-stage">
            <i className="o-spill" />

            {/* beat 1 — the line */}
            <div className="o-first">
              <Stroke d="M350 450H1250" t={0.2} dur={1.15} className="is-eased" />
              <i className="o-tip" />
            </div>

            {/* beat 2 — the plan: walls grow like one pen stroke */}
            <div className="o-walls">
              <Stroke d="M350 170H1250V730H350Z" t={1.4} dur={1.25} />
              <Stroke d="M359 179H1241V721H359Z" t={1.6} dur={1.25} className="is-inner" />
              {innerWalls.map(([d, t]) => <Stroke key={d} d={d} t={t} dur={0.8} />)}
            </div>
          </div>

          {/* furniture, measures and room names: drawn once, faded in by group */}
          {detailLayers.map(({ t, group }) => (
            <svg key={`d${t}`} className="o-layer o-detail" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={at(t)}>
              {group.map(({ d }) => <path key={d} d={d} />)}
            </svg>
          ))}
          {measureLayers.map(({ t, group }) => (
            <svg key={`m${t}`} className="o-layer o-measure" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={at(t)}>
              {group.map(({ d }) => <path key={d} d={d} />)}
            </svg>
          ))}
          {labelLayers.map(({ t, group }) => (
            <svg key={`l${t}`} className="o-layer o-labels" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={at(t)}>
              {group.map(({ x, y, text, cls }) => <text key={text} className={cls || undefined} x={x} y={y}>{text}</text>)}
            </svg>
          ))}
        </div>
        <div className="opening__vig" />
        <p className="opening__words"><span>Every home begins</span> <span>as a line.</span></p>
        <div className="opening__sheet">
          <span>Sheet 01 · Residence plan</span>
          <span className="opening__count"><i className="opening__num" /> yards</span>
          <span>100 Yards · Drawn for you</span>
        </div>
        <button type="button" className="opening__skip" onClick={skip}>Skip intro</button>
      </div>
    </>
  );
}
