"use client";

/**
 * The opening: "from the drawing to the door".
 *
 *   0.0s  one line draws a floor plan on dark paper, a measure counts to 100 yards
 *   1.3s  the plan lies down and a tower rises from it, floor by floor
 *   2.0s  its windows light
 *   2.6s  we move in on one lit window
 *   3.2s  the doors open onto the home page
 *
 * Plays once per browser session (sessionStorage): close the browser and it
 * plays again; move between pages or reload and it does not. Add ?intro=1 to
 * the address to force it. On phones and for ad traffic it runs as a short
 * version (plan, then doors, under two seconds). Never under reduced motion or
 * Save-Data. Everything is CSS driven by one time unit (--ou), so it starts
 * before the page's JavaScript has loaded and there is no flash of the page.
 * MotionLayer holds the hero entrance for `window.__hyHold` seconds.
 */
const decide = `(function(){try{var d=document.documentElement,c=navigator.connection,q=location.search,force=/[?&]intro=1/.test(q);if(matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData))return;if(!force&&sessionStorage.getItem('hy_opened'))return;sessionStorage.setItem('hy_opened','1');var s=matchMedia('(max-width: 820px)').matches||/[?&](utm_|gclid|fbclid)/.test(q),u=s?0.5:1;d.style.setProperty('--ou',u+'s');if(s)d.classList.add('opening-short');d.classList.add('opening-on');window.__hyHold=(s?2.1:3.3)*u;setTimeout(function(){d.classList.add('opening-out')},(s?2000:3200)*u);setTimeout(function(){d.classList.remove('opening-on','opening-out','opening-short')},(s?3100:4300)*u);}catch(e){}})();`;

type Line = { d: string; t: number; w?: number };
const delay = (t: number, extra?: React.CSSProperties) => ({ ...extra, ["--d" as string]: t }) as React.CSSProperties;

/* Ground-floor plan, drawn in a 1600 × 900 sheet. Outer walls first, then partitions, then the detail. */
const walls: Line[] = [
  { d: "M520,250 H1080 V650 H520 Z", t: 0, w: 3.2 },
  { d: "M520,430 H740", t: 0.3, w: 2.2 },
  { d: "M740,250 V376 M740,424 V540", t: 0.36, w: 2.2 },
  { d: "M740,540 H828 M876,540 H900", t: 0.46, w: 2.2 },
  { d: "M900,430 V650", t: 0.52, w: 2.2 },
  { d: "M900,430 H946 M994,430 H1080", t: 0.58, w: 2.2 },
  { d: "M900,250 V430", t: 0.62, w: 2.2 },
];
const detail: Line[] = [
  // door swings
  { d: "M740,376 A48,48 0 0 1 788,424 M740,424 H788", t: 0.72 },
  { d: "M828,540 A48,48 0 0 1 876,588 M876,540 V588", t: 0.78 },
  { d: "M946,430 A48,48 0 0 0 994,478 M994,430 V478", t: 0.84 },
  { d: "M610,650 A52,52 0 0 0 662,598 M662,650 V598", t: 0.9 },
  // windows (double line on the outer wall)
  { d: "M580,244 H690 M580,256 H690", t: 0.74 },
  { d: "M780,244 H860 M780,256 H860", t: 0.78 },
  { d: "M940,244 H1040 M940,256 H1040", t: 0.82 },
  { d: "M1074,300 V390 M1086,300 V390", t: 0.86 },
  { d: "M1074,500 V600 M1086,500 V600", t: 0.9 },
  { d: "M514,300 V390 M526,300 V390", t: 0.94 },
  // stair
  { d: "M760,560 H820 M760,575 H820 M760,590 H820 M760,605 H820 M760,620 H820 M760,635 H820 M760,560 V650 M820,560 V650", t: 0.88 },
  // kitchen counter and bed
  { d: "M920,270 H1060 V300 H950 V410 H920 Z", t: 0.96 },
  { d: "M550,280 H680 V390 H550 Z M550,310 H680", t: 1.0 },
  { d: "M930,520 H1050 V620 H930 Z M930,548 H1050", t: 1.04 },
];
const measure: Line[] = [
  { d: "M520,200 H1080 M520,188 V212 M1080,188 V212", t: 0.12 },
  { d: "M470,250 V650 M458,250 H482 M458,650 H482", t: 0.2 },
];
const labels = [
  { x: 615, y: 350, text: "BEDROOM" }, { x: 820, y: 330, text: "LIVING" }, { x: 990, y: 372, text: "KITCHEN" },
  { x: 622, y: 548, text: "STUDY" }, { x: 990, y: 596, text: "BEDROOM" }, { x: 820, y: 596, text: "UP" },
];

/* The tower that rises from the plan. Front face x 680–920, side face to 1000. */
const TOP = 150, BASE = 610, FLOORS = 12;
const floorY = (i: number) => BASE - ((BASE - TOP) / FLOORS) * i;
const tower: Line[] = [
  { d: `M680,${BASE} V${TOP + 20} M920,${BASE} V${TOP + 20} M1000,${BASE - 36} V${TOP}`, t: 1.45, w: 2.4 },
  { d: `M680,${TOP + 20} H920 L1000,${TOP} H760 Z`, t: 2.0, w: 2.4 },
  { d: `M680,${BASE} H920 L1000,${BASE - 36}`, t: 1.4, w: 2.4 },
];
const floors = Array.from({ length: FLOORS - 1 }, (_, i) => ({ d: `M680,${floorY(i + 1) + 20 * ((i + 1) / FLOORS)} H920 l80,${-20 - 16 * (1 - (i + 1) / FLOORS)}`, t: 1.55 + i * 0.04 }));
const windowsLit = Array.from({ length: 11 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
  const y0 = floorY(row + 1) + 20 * ((row + 1) / FLOORS) + 9;
  return { x: 696 + col * 46, y: y0, t: 2.0 + ((row * 7 + col * 13) % 11) * 0.045, key: `${row}-${col}`, hero: row === 5 && col === 2 };
})).flat();

export function OpeningSequence() {
  const skip = () => document.documentElement.classList.remove("opening-on", "opening-out", "opening-short");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div className="opening" role="presentation">
        <span className="opening__leaf opening__leaf--l" aria-hidden="true" />
        <span className="opening__leaf opening__leaf--r" aria-hidden="true" />
        <span className="opening__seam" aria-hidden="true" />

        <div className="opening__stage" aria-hidden="true">
          <div className="opening__plan">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
              <g className="o-measure">{measure.map((l) => <path key={l.d} d={l.d} pathLength={1} style={delay(l.t)} />)}</g>
              <g className="o-walls">{walls.map((l) => <path key={l.d} d={l.d} pathLength={1} style={delay(l.t, { strokeWidth: l.w })} />)}</g>
              <g className="o-detail">{detail.map((l) => <path key={l.d} d={l.d} pathLength={1} style={delay(l.t)} />)}</g>
              <g className="o-labels">{labels.map((l, i) => <text key={i} x={l.x} y={l.y} style={delay(1.0 + i * 0.04)}>{l.text}</text>)}</g>
              <text className="o-dim" x="800" y="182" style={delay(0.5)}>100 YARDS</text>
            </svg>
          </div>
          <div className="opening__tower">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
              <g className="o-floors">{floors.map((l) => <path key={l.d} d={l.d} pathLength={1} style={delay(l.t)} />)}</g>
              <g className="o-windows">{windowsLit.map((w) => <rect key={w.key} x={w.x} y={w.y} width="30" height="20" className={w.hero ? "is-hero" : undefined} style={delay(w.t)} />)}</g>
              <g className="o-tower">{tower.map((l) => <path key={l.d} d={l.d} pathLength={1} style={delay(l.t, { strokeWidth: l.w })} />)}</g>
            </svg>
          </div>
        </div>

        <div className="opening__sheet" aria-hidden="true">
          <span>Sheet 01 · Ground floor plan</span>
          <span className="opening__count"><i className="opening__num" /> yards</span>
          <span>100 Yards · Drawn for you</span>
        </div>
        <button type="button" className="opening__skip" onClick={skip}>Skip intro</button>
      </div>
    </>
  );
}
