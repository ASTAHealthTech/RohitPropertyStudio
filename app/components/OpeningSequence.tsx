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
 */
const decide = `(function(){try{var d=document.documentElement,c=navigator.connection,q=location.search,force=/[?&]intro=1/.test(q);if(matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData))return;if(!force&&sessionStorage.getItem('hy_opened'))return;sessionStorage.setItem('hy_opened','1');var s=matchMedia('(max-width: 820px)').matches||/[?&](utm_|gclid|fbclid)/.test(q),u=s?0.55:1;d.style.setProperty('--ou',u+'s');d.classList.add('opening-on');window.__hyHold=4.55*u;setTimeout(function(){d.classList.add('opening-out')},4300*u);setTimeout(function(){d.classList.remove('opening-on','opening-out')},5650*u);}catch(e){}})();`;

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

export function OpeningSequence() {
  const skip = () => document.documentElement.classList.remove("opening-on", "opening-out");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div className="opening" aria-hidden="true">
        <div className="opening__grid" />
        <div className="opening__cam">
          <svg className="opening__plan" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="o-lamp" cx="50%" cy="46%" r="62%">
                <stop offset="0" stopColor="#fff3d6" />
                <stop offset=".45" stopColor="#f0cf94" />
                <stop offset="1" stopColor="#b98a4a" stopOpacity=".55" />
              </radialGradient>
              <radialGradient id="o-spill" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#f0cf94" stopOpacity=".34" />
                <stop offset="1" stopColor="#f0cf94" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="o-tip" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#fff7e6" />
                <stop offset=".25" stopColor="#f0cf94" stopOpacity=".7" />
                <stop offset="1" stopColor="#f0cf94" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* beat 1 — the line */}
            <g className="o-first">
              <path pathLength={1} d="M350 450H1250" />
              <circle className="o-tip" cx="350" cy="450" r="26" fill="url(#o-tip)" />
            </g>

            {/* beat 2 — the plan */}
            <ellipse className="o-spill" cx="800" cy="450" rx="430" ry="360" fill="url(#o-spill)" />
            <rect className="o-lamp" x="703" y="303" width="194" height="294" fill="url(#o-lamp)" />
            <g className="o-walls">
              <path pathLength={1} style={at(1.4, 1.25)} d="M350 170H1250V730H350Z" />
              <path className="is-inner" pathLength={1} style={at(1.6, 1.25)} d="M359 179H1241V721H359Z" />
              {innerWalls.map(([d, t]) => <path key={d} pathLength={1} style={at(t, 0.8)} d={d} />)}
            </g>
            <g className="o-detail">
              {details.map(([d, t]) => <path key={d} pathLength={1} style={at(t, 0.8)} d={d} />)}
            </g>
            <g className="o-measure">
              {measures.map(([d, t]) => <path key={d} pathLength={1} style={at(t, 0.7)} d={d} />)}
            </g>
            <g className="o-labels">
              {labels.map(([x, y, text, t]) => <text key={text} x={x} y={y} style={at(t)}>{text}</text>)}
              <text className="o-dim" x="800" y="96" style={at(3.1)}>100 YARDS</text>
              <text className="o-dim" x="1420" y="128" style={at(3.2)}>N</text>
              <text className="o-room" x="800" y="456" style={at(3.5)}>LIVING</text>
            </g>
          </svg>
        </div>
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
