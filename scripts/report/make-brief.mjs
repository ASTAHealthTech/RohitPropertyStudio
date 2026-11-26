/**
 * The Buyer's Report — the edition that is sold online.
 *
 *   node scripts/report/make-brief.mjs <catalogue-slug>
 *
 * Built from three things only:
 *   1. the project's own catalogue entry (app/lib/catalog/projects.json + details.json)
 *   2. a research file, scripts/report/research/<slug>.json, where every line names its source
 *   3. statutory rates (mirror app/lib/labData.ts)
 *
 * It is written to make the case for the project, but every number in it is either
 * the developer's published figure or a named, dated source. It never promises a
 * return and never invents a figure. A project with no research file is refused,
 * because without research this is just the web page printed.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/report/make-brief.mjs <catalogue-slug>"); process.exit(1); }
const P = JSON.parse(readFileSync(path.join(ROOT, "app/lib/catalog/projects.json"), "utf8")).find((p) => p.slug === slug);
if (!P) { console.error(`No catalogue project "${slug}"`); process.exit(1); }
const researchPath = path.join(ROOT, "scripts/report/research", `${slug}.json`);
if (!existsSync(researchPath)) { console.error(`No research file for "${slug}". Write scripts/report/research/${slug}.json first.`); process.exit(1); }
const R = JSON.parse(readFileSync(researchPath, "utf8"));
const D = (JSON.parse(readFileSync(path.join(ROOT, "app/lib/catalog/details.json"), "utf8"))[slug]?.sections) ?? [];

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (v) => String(v ?? "").replace(/\*/g, "").trim();
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const lakh = (n) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : `₹${(n / 1e5).toFixed(1)} Lakh`);
const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const reportNo = `HY-BR-${new Date().getFullYear()}-${String(Math.abs([...slug].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 10000).padStart(4, "0")}`;
const imgDir = path.join(ROOT, "scripts/report/out/img");
mkdirSync(imgDir, { recursive: true });
const sharp = (await import("sharp")).default;
const IMG = [];
for (const [i, im] of (P.images ?? []).slice(0, 6).entries()) {
  const out = path.join(imgDir, `${slug}-${i}.jpg`);
  try { await sharp(path.join(ROOT, "public", im.src)).resize({ width: 1500, withoutEnlargement: true }).jpeg({ quality: 74 }).toFile(out); IMG[i] = out; } catch { IMG[i] = ""; }
}
const img = (i) => (IMG[i] ? `file://${IMG[i]}` : "");
const secs = (kind, re) => D.filter((s) => s.kind === kind && (!re || re.test(s.title)));
const listsIn = (ss) => ss.flatMap((s) => s.blocks.filter((b) => b.t === "list").flatMap((b) => b.items));
const tablesIn = (ss) => ss.flatMap((s) => s.blocks.filter((b) => b.t === "table").map((b) => b.rows));
const named = (re) => { const ss = secs("nearby", re); const l = listsIn(ss); return (l.length ? l : tablesIn(ss).flatMap((t) => t.slice(1).map((r) => r[0]))).map(clean).filter(Boolean); };
const nearbyBy = (re) => { const out = named(re); if (out.length) return out; const all = secs("nearby").flatMap((s) => s.blocks); const i = all.findIndex((b) => b.t === "h" && re.test(b.x ?? "")); return i >= 0 && all[i + 1]?.t === "list" ? all[i + 1].items.map(clean) : []; };
const faq = D.filter((s) => s.kind === "faq").flatMap((s) => s.blocks.filter((b) => b.t === "qa"));

const toRupees = (text) => { const m = /([\d.]+)\s*(cr|lakh|lac)/i.exec(String(text).replace(/,/g, "")); return m ? Number(m[1]) * (/cr/i.test(m[2]) ? 1e7 : 1e5) : null; };
/* statutory rates: mirror app/lib/labData.ts */
const RATES = { slabs: [[2e6, 0.02], [4.5e6, 0.03], [Infinity, 0.05]], registration: 0.02, cess: 0.10, surcharge: 0.02, source: "Karnataka Dept. of Stamps & Registration; registration revised Aug 2025", asOf: "Rates as of 2026. Confirm the current rates before you register." };
function costs(price) {
  const duty = price * RATES.slabs.find(([upTo]) => price <= upTo)[1];
  const cess = duty * RATES.cess, sur = duty * RATES.surcharge, reg = price * RATES.registration;
  return { duty, cess, sur, reg, total: price + duty + cess + sur + reg, extra: duty + cess + sur + reg };
}
const emi = (loan, ratePct, years) => { const r = ratePct / 1200, n = years * 12; return (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1); };

const isPrice = (c) => /cr|lakh|lac/i.test(c ?? "") && !/sq/i.test(c ?? "") && toRupees(c);
const PT = (P.pt && P.pt.length > 1) ? P.pt : (tablesIn(secs("pricing")).find((t) => t.length > 2 && t.slice(1).filter((r) => r.some(isPrice)).length >= 2) ?? []);
const priceRows = PT.slice(1).filter((r) => r.length >= 2);
const pcount = PT.length ? PT[0].map((_, c) => priceRows.filter((r) => isPrice(r[c])).length) : [];
const PC = pcount.length ? pcount.indexOf(Math.max(...pcount)) : -1;
const priced = priceRows.map((r) => ({ type: clean(r[0]), size: clean(r.slice(1).find((c) => /sq\.?\s*ft/i.test(c) && !/₹|rs/i.test(c)) ?? ""), text: clean(r[PC]), value: isPrice(r[PC]) ? toRupees(r[PC]) : null })).filter((r) => r.value).sort((a, b) => a.value - b.value);
const ABOUT = ((P.about ?? []).length ? P.about : secs("about").flatMap((s) => s.blocks.filter((b) => b.t === "p").map((b) => b.x))).map(clean).filter(Boolean).slice(0, 2);
const PLOT = /plot/i.test(P.kind);
const startPrice = priced[0]?.value ?? (P.priceLakh ? P.priceLakh * 1e5 : null);
const picks = priced.length > 3 ? [priced[0], priced[Math.floor(priced.length / 2)], priced[priced.length - 1]] : priced.length ? priced : (startPrice ? [{ type: "Starting home", size: "", text: clean(P.price), value: startPrice }] : []);
const AM = ((P.am ?? []).length ? P.am : listsIn(secs("amenities"))).map(clean).filter(Boolean);
const LA = ((P.la ?? []).length ? P.la : tablesIn(secs("location")).flatMap((t) => t.slice(1)).filter((r) => r.length >= 2).map((r) => [r[0], r[r.length - 1]])).slice(0, 8);
const prosSec = secs("pros"), prosT = tablesIn(prosSec)[0], prosL = prosSec.flatMap((s) => s.blocks.filter((b) => b.t === "list").map((b) => b.items));
const STRENGTHS = (prosT ? prosT.slice(1).map((r) => r[0]) : (prosL[0] ?? listsIn(secs("why")))).map(clean).filter((t) => t && t.length < 150).slice(0, 6);
const CAUTIONS = (prosT ? prosT.slice(1).map((r) => r[1]) : (prosL[1] ?? [])).map(clean).filter((t) => t && t.length < 190).slice(0, 5);
const WEIGH = [...(R.weigh ?? []), ...CAUTIONS].slice(0, 6);
const snapT = P.snap ?? tablesIn(secs("snapshot"))[0] ?? [];
const snapGet = (re) => clean((snapT.find((r) => re.test(r[0] ?? "")) ?? [])[1] ?? "");
const LAND = clean(P.land) || snapGet(/area|land|acre/i), UNITS = clean(P.units) || snapGet(/units|homes|apartments/i), POSS = clean(P.poss) || snapGet(/possession/i);
const RERA_OK = /\d{6}/.test(P.rera ?? "") && /RERA|PRM/i.test(P.rera ?? "");
const short = (t, n = 26) => (clean(t).length > n ? clean(t).slice(0, n - 1).replace(/[\s,(]+$/, "") + "…" : clean(t));
const NUMBERS = R.numbers ?? [[short(LAND, 16), "of land"], [short(UNITS.replace(/\s*(apartments|units|homes).*$/i, ""), 14), "homes"], [clean(P.config).replace(/\s*apartments?/i, ""), "home types"], [short(P.sizes, 20), "home sizes"], [AM.length ? `${AM.length}+` : "", "amenities listed"], [clean(P.price).replace(/\s*onwards\*?/i, ""), "starting price"]].filter(([v]) => v && v.length <= 16 && !/request|confirm|verify|,.*,/i.test(v)).slice(0, 6).map(([value, label]) => ({ value, label }));

const fontFace = (() => {
  const dir = path.join(ROOT, ".vinext/fonts");
  try {
    return readdirSync(dir).map((sub) => {
      const cssPath = path.join(dir, sub, "style.css");
      if (!existsSync(cssPath)) return "";
      return readFileSync(cssPath, "utf8").replace(/url\(([^)]*?[/\\]fonts[/\\])([^)]+)\)/g, (_m, _p, rest) => `url(file://${path.join(dir, rest)})`);
    }).join("\n");
  } catch { return ""; }
})();

const css = `
${fontFace}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Manrope',system-ui,sans-serif;color:#1b2334;font-size:11.8pt;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:19mm 18mm 20mm;position:relative;overflow:hidden;page-break-after:always;background:#f6f3ec}
.pg.navy{background:#101a2e;color:#f1ede2}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif;font-weight:500;line-height:1.14;letter-spacing:-.01em}
h1{font-size:36pt} h2{font-size:25pt;margin-bottom:5mm;max-width:150mm} h3{font-size:13.5pt;margin-bottom:1.5mm}
.kick{font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:#a8823a;font-weight:700;margin-bottom:4mm}
.navy .kick{color:#d4ad63}
.lead{font-size:13.4pt;line-height:1.5;max-width:164mm;margin-bottom:9mm;color:#3a4459}
.navy .lead{color:#cfc9b8}
.foot{position:absolute;left:18mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;font-size:7.4pt;letter-spacing:.12em;text-transform:uppercase;color:#8d8778;border-top:.3mm solid #d9d3c2;padding-top:2.5mm}
.navy .foot{border-color:#2a3650;color:#8792a8}
.src{font-size:8.2pt;color:#8d8778;margin-top:1.2mm;line-height:1.35}
.navy .src{color:#8792a8}
.cover{padding:0}
.cover__img{position:absolute;inset:0 0 118mm 0;background-size:cover;background-position:center}
.cover__img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(16,26,46,.15),rgba(16,26,46,.0) 45%,#101a2e)}
.cover__body{position:absolute;left:18mm;right:18mm;bottom:22mm}
.cover__body h1{color:#f1ede2;margin:3mm 0 4mm}
.cover__loc{color:#cfc9b8;font-size:11.5pt;margin-bottom:8mm}
.cover__line{font-family:'Playfair Display',serif;font-size:16pt;color:#d4ad63;max-width:150mm;line-height:1.3;margin-bottom:11mm}
.cover__meta{display:grid;grid-template-columns:24mm 30mm 44mm 1fr;gap:6mm;border-top:.3mm solid #2a3650;padding-top:4mm;font-size:8.6pt;color:#aeb6c7}
.cover__meta b{display:block;color:#f1ede2;font-size:8.6pt;margin-top:.8mm;font-weight:600}
.cover__brand{position:absolute;top:14mm;left:18mm;height:17mm;z-index:2}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:9mm 10mm}
.reason{border-top:.35mm solid #a8823a;padding-top:4mm}
.reason p{font-size:11.2pt;color:#3a4459}
.facts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:.3mm solid #d9d3c2;margin-bottom:7mm}
.facts div{padding:3.4mm 3mm 3.4mm 0;border-bottom:.3mm solid #d9d3c2}
.facts small{display:block;font-size:7.6pt;letter-spacing:.14em;text-transform:uppercase;color:#8d8778;margin-bottom:.8mm}
.facts b{font-family:'Playfair Display',serif;font-weight:500;font-size:13pt}
table{width:100%;border-collapse:collapse;font-size:11pt}
th{text-align:left;font-size:7.6pt;letter-spacing:.14em;text-transform:uppercase;color:#8d8778;font-weight:700;padding:2.4mm 2mm 2.4mm 0;border-bottom:.4mm solid #1b2334}
td{padding:3.6mm 2mm 3.6mm 0;border-bottom:.3mm solid #d9d3c2;vertical-align:top}
td.n,th.n{text-align:right;padding-right:0;white-space:nowrap}
td b{font-weight:700}
.photo{width:100%;border-radius:1mm;object-fit:cover;display:block}
.band{background:#101a2e;color:#f1ede2;padding:7mm 8mm;border-radius:1mm;margin-top:9mm;font-size:12pt}
.band b{color:#d4ad63}
.cols{columns:2;column-gap:9mm}
.cols li,.plain li{list-style:none;padding:2.6mm 0 2.6mm 5mm;position:relative;border-bottom:.3mm solid #e2dccc;break-inside:avoid;font-size:11.2pt}
.cols li::before,.plain li::before{content:"";position:absolute;left:0;top:5.6mm;width:2mm;height:.35mm;background:#a8823a}
.item{border-top:.3mm solid #d9d3c2;padding:5mm 0;display:grid;grid-template-columns:52mm 1fr;gap:6mm;break-inside:avoid}
.item h3{font-size:14pt;margin:0}
.item p{font-size:11.2pt;color:#3a4459}
.item p b{color:#1b2334}
.stat{display:grid;grid-template-columns:repeat(4,1fr);gap:5mm;margin-bottom:7mm}
.stat div{border-top:.35mm solid #a8823a;padding-top:2.6mm}
.stat b{font-family:'Playfair Display',serif;font-weight:500;font-size:19pt;display:block;line-height:1.1}
.stat small{font-size:9.6pt;color:#3a4459;display:block;margin-top:1.2mm}
.two{display:grid;grid-template-columns:1fr 1fr;gap:9mm}
.q{border-top:.3mm solid #d9d3c2;padding:4.2mm 0;display:grid;grid-template-columns:9mm 1fr;break-inside:avoid;font-size:11.2pt}
.q span{font-family:'Playfair Display',serif;color:#a8823a;font-size:12pt}
.cta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6mm;margin-top:9mm}
.cta div{border-top:.35mm solid #d4ad63;padding-top:3mm}
.cta small{font-size:7.6pt;letter-spacing:.14em;text-transform:uppercase;color:#8792a8;display:block;margin-bottom:1mm}
.cta b{font-size:12pt;color:#f1ede2}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:.35mm solid #a8823a;margin-bottom:8mm}
.tiles div{padding:5mm 4mm 5mm 0;border-bottom:.3mm solid #d9d3c2}
.tiles b{font-family:'Playfair Display',serif;font-weight:500;font-size:27pt;line-height:1;display:block}
.tiles small{font-size:9.6pt;color:#3a4459;display:block;margin-top:1.6mm}
.chart{margin:3mm 0 2mm}
.chart h3{margin-bottom:3.5mm}
.note{font-size:8.2pt;line-height:1.5;color:#6f6a5d}
.note p{margin-bottom:2.2mm}
`;

/* ---------- charts: inline SVG, print only. Blue + gold pair passes scripts/validate_palette.js on the ivory surface. ---------- */
const BLUE = "#2f5fa8", GOLD = "#b8893a", INK = "#1b2334", MUTE = "#6f6a5d", GRID = "#ddd6c4", SURF = "#f6f3ec";
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;font-family:'Manrope',sans-serif">${body}</svg>`;
const rbar = (x, y, w, h, fill) => `<path d="M${x},${y}h${Math.max(0, w - 4)}a4,4 0 0 1 4,4v${h - 8}a4,4 0 0 1 -4,4h-${Math.max(0, w - 4)}z" fill="${fill}"/>`;
const rcol = (x, y, w, h, fill) => `<path d="M${x},${y + h}v-${Math.max(0, h - 4)}a4,4 0 0 1 4,-4h${w - 8}a4,4 0 0 1 4,4v${Math.max(0, h - 4)}z" fill="${fill}"/>`;
/** Horizontal bars: label on the left, value at the tip. */
function hbars(rows, { labelW = 190, rowH = 34 } = {}) {
  const W = 660, max = Math.max(...rows.map((r) => r.value)) * 1.0, plot = W - labelW - 110;
  return svg(W, rows.length * rowH + 6, rows.map((r, i) => {
    const y = i * rowH + 8, w = Math.max(6, (r.value / max) * plot);
    return `<text x="0" y="${y + 13}" font-size="13" fill="${INK}" font-weight="${r.hi ? 700 : 500}">${esc(r.label)}</text>${r.sub ? `<text x="0" y="${y + 13}" dx="${labelW - 62}" font-size="11" fill="${MUTE}">${esc(r.sub)}</text>` : ""}${rbar(labelW, y, w, 18, r.hi ? GOLD : BLUE)}<text x="${labelW + w + 8}" y="${y + 13}" font-size="13" font-weight="700" fill="${INK}">${esc(r.text)}</text>`;
  }).join("") + `<line x1="${labelW}" y1="2" x2="${labelW}" y2="${rows.length * rowH + 2}" stroke="${GRID}"/>`);
}
/** Columns: value on the cap, label under the baseline. */
function columns(rows, { h = 230 } = {}) {
  const W = 660, base = h - 46, max = Math.max(...rows.map((r) => r.value)), slot = W / rows.length, bw = Math.min(64, slot * 0.42);
  return svg(W, h, `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="${GRID}"/>` + rows.map((r, i) => {
    const ch = Math.max(6, (r.value / max) * (base - 34)), x = i * slot + slot / 2 - bw / 2;
    return `${rcol(x, base - ch, bw, ch, r.hi ? GOLD : BLUE)}<text x="${x + bw / 2}" y="${base - ch - 9}" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}">${esc(r.text)}</text><text x="${x + bw / 2}" y="${base + 20}" text-anchor="middle" font-size="12.5" fill="${INK}">${esc(r.label)}</text>${r.sub ? `<text x="${x + bw / 2}" y="${base + 37}" text-anchor="middle" font-size="11" fill="${MUTE}">${esc(r.sub)}</text>` : ""}`;
  }).join(""));
}
/** Two-part stacked bars with a legend: what goes to the price, what goes to the government (or bank). */
function stacks(rows, [nameA, nameB]) {
  const W = 660, labelW = 170, rowH = 44, plot = W - labelW - 96, max = Math.max(...rows.map((r) => r.a + r.b));
  const legend = `<rect x="${labelW}" y="0" width="12" height="12" rx="2" fill="${BLUE}"/><text x="${labelW + 18}" y="11" font-size="12" fill="${INK}">${esc(nameA)}</text><rect x="${labelW + 190}" y="0" width="12" height="12" rx="2" fill="${GOLD}"/><text x="${labelW + 208}" y="11" font-size="12" fill="${INK}">${esc(nameB)}</text>`;
  return svg(W, rows.length * rowH + 30, legend + rows.map((r, i) => {
    const y = i * rowH + 30, wa = (r.a / max) * plot, wb = Math.max(8, (r.b / max) * plot);
    return `<text x="0" y="${y + 15}" font-size="13" font-weight="600" fill="${INK}">${esc(r.label)}</text><rect x="${labelW}" y="${y}" width="${wa}" height="22" fill="${BLUE}"/>${rbar(labelW + wa + 2, y, wb, 22, GOLD)}<text x="${labelW + wa + wb + 10}" y="${y + 15}" font-size="13" font-weight="700" fill="${INK}">${esc(r.text)}</text>${wa > 120 ? `<text x="${labelW + 8}" y="${y + 15}" font-size="11.5" fill="#fff">${esc(r.aText)}</text>` : ""}`;
  }).join(""));
}
/** One line: how the loan balance falls over the years. */
function balanceLine(loan, ratePct, years) {
  const W = 660, H = 250, L = 64, R = 20, T = 18, B = 34, r = ratePct / 1200, n = years * 12, e = emi(loan, ratePct, years);
  const pts = []; let bal = loan;
  for (let m = 0; m <= n; m += 1) { if (m % 12 === 0) pts.push([m / 12, bal]); bal = bal * (1 + r) - e; }
  const x = (yr) => L + (yr / years) * (W - L - R), y = (v) => T + (1 - v / loan) * (H - T - B);
  const path = pts.map(([yr, v], i) => `${i ? "L" : "M"}${x(yr).toFixed(1)},${y(Math.max(0, v)).toFixed(1)}`).join("");
  const half = pts.find(([, v]) => v <= loan / 2);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => `<line x1="${L}" x2="${W - R}" y1="${y(loan * f)}" y2="${y(loan * f)}" stroke="${GRID}"/><text x="${L - 8}" y="${y(loan * f) + 4}" text-anchor="end" font-size="11" fill="${MUTE}">${f === 0 ? "0" : lakh(loan * f).replace("₹", "₹")}</text>`).join("");
  const years5 = [0, 5, 10, 15, 20].filter((v) => v <= years).map((v) => `<text x="${x(v)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${MUTE}">Year ${v}</text>`).join("");
  return svg(W, H, `${ticks}${years5}<path d="${path}L${x(years)},${y(0)}L${x(0)},${y(0)}z" fill="${BLUE}" opacity=".1"/><path d="${path}" fill="none" stroke="${BLUE}" stroke-width="2.4" stroke-linejoin="round"/>` +
    (half ? `<circle cx="${x(half[0])}" cy="${y(half[1])}" r="5" fill="${GOLD}" stroke="${SURF}" stroke-width="2"/><text x="${x(half[0]) + 10}" y="${y(half[1]) - 8}" font-size="12" font-weight="700" fill="${INK}">Half repaid by year ${half[0]}</text>` : ""));
}
/** Milestones on one line, in date order. */
function timeline(items) {
  const W = 660, H = 120, pad = 60, step = (W - pad * 2) / Math.max(1, items.length - 1);
  return svg(W, H, `<line x1="${pad}" x2="${W - pad}" y1="42" y2="42" stroke="${BLUE}" stroke-width="2"/>` + items.map((t, i) => {
    const cx = pad + i * step, words = t.what.split(" "), mid = Math.ceil(words.length / 2);
    return `<circle cx="${cx}" cy="42" r="6.5" fill="${i === items.length - 1 ? GOLD : BLUE}" stroke="${SURF}" stroke-width="2"/><text x="${cx}" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="${INK}">${esc(t.when)}</text><text x="${cx}" y="68" text-anchor="middle" font-size="11.5" fill="${INK}">${esc(words.slice(0, mid).join(" "))}</text><text x="${cx}" y="84" text-anchor="middle" font-size="11.5" fill="${INK}">${esc(words.slice(mid).join(" "))}</text>`;
  }).join(""));
}
/** A single progress meter. */
const meter = (pct) => svg(660, 30, `<rect x="0" y="6" width="660" height="18" rx="4" fill="${GRID}"/>${rbar(0, 6, 660 * pct / 100, 18, BLUE)}<text x="${660 * pct / 100 - 10}" y="19.5" text-anchor="end" font-size="12" font-weight="700" fill="#fff">${pct}% built</text>`);

let pageNo = 0;
const page = (body, cls = "") => { pageNo += 1; return `<section class="pg ${cls}">${body}<div class="foot"><span>${esc(P.name)} · ${reportNo}</span><span>100 Yards · Page ${pageNo}</span></div></section>`; };
const srcLine = (s) => (s ? `<p class="src">Source: ${esc(s)}</p>` : "");
const pages = [];

/* 1. Cover */
pageNo += 1;
pages.push(`<section class="pg navy cover">
  <div class="cover__img" style="background-image:url('${img(0)}')"></div>
  <img class="cover__brand" src="file://${path.join(ROOT, "public/brand/logo.png")}" alt="">
  <div class="cover__body">
    <p class="kick">Property Intelligence Report</p>
    <h1>${esc(P.name)}</h1>
    <p class="cover__loc">${esc(P.loc)}</p>
    <p class="cover__line">${esc(R.headline)}</p>
    <div class="cover__meta">
      <div>Report no.<b>${reportNo}</b></div><div>Prepared on<b>${today}</b></div>
      <div>Prepared by<b>Hundred Yards Realtor Pvt Ltd</b></div><div>Karnataka RERA agent<b>PRM/KA/RERA/1251/310/AG/231030/004229</b></div>
    </div>
  </div></section>`);

/* 2. Why this project */
pages.push(page(`<p class="kick">Why look at this project</p><h2>${["", "One reason", "Two reasons", "Three reasons", "Four reasons", "Five reasons", "Six reasons"][R.reasons.length] ?? "Why"} ${esc(P.name)} is on our shortlist.</h2>
  <p class="lead">${esc(R.pitch)}</p>
  <div class="grid2">${R.reasons.map((r) => `<div class="reason"><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${srcLine(r.source)}</div>`).join("")}</div>
  ${R.reasons.length <= 4 && STRENGTHS.length ? `<h3 style="margin-top:9mm">What the project itself offers</h3><ul class="cols">${STRENGTHS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}`));

/* 3. In numbers */
const glance = [["Builder", P.devFull || P.dev], ["Type", P.kind], [PLOT ? "Plots" : "Homes", P.config || snapGet(/config|bhk|unit type/i)], ["Sizes", P.sizes || snapGet(/size|sq/i)], ["Land", LAND], [PLOT ? "Plots in all" : "Homes in all", UNITS], ["Status", /verify|confirm/i.test(P.status) ? "" : P.status], ["Possession", /verify|confirm/i.test(POSS) ? "" : POSS]].filter(([, v]) => clean(v) && !/request|whatsapp|confirm|verify/i.test(v)).map(([k, v]) => [k, short(v, 40)]).slice(0, 6);
pages.push(page(`<p class="kick">The project in numbers</p><h2>${esc(P.config ? `${clean(P.config).replace(/\s*(apartments?|homes?|residences?)\s*$/i, "")} ${PLOT ? "" : "homes"}`.trim() : P.kind)} by ${esc(P.dev)}.</h2>
  ${NUMBERS.length >= 3 ? `<div class="tiles">${NUMBERS.slice(0, NUMBERS.length >= 6 ? 6 : 3).map((n) => `<div><b>${esc(n.value)}</b><small>${esc(n.label)}</small></div>`).join("")}</div>` : ""}
  ${ABOUT.map((p) => `<p style="margin-bottom:4mm;max-width:168mm">${esc(short(p, 520))}</p>`).join("")}
  <div class="facts" style="margin-top:6mm">${glance.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(clean(v))}</b></div>`).join("")}</div>
  <p class="src">Project facts: developer's published material, as listed by 100 Yards.</p>
  ${(NUMBERS.length < 6 ? 0 : 1) + (ABOUT.join("").length > 600 ? 1 : 0) === 0 && (img(1) || img(0)) ? `<img class="photo" style="position:absolute;left:18mm;width:174mm;bottom:22mm;height:${NUMBERS.length < 3 ? 110 : 62}mm" src="${img(1) || img(0)}" alt="">` : ""}`));

/* 4. Photos and plans */
if ((P.images ?? []).length > 2) {
  const shots = [2, 3, 4, 5].filter((i) => img(i));
  pages.push(page(`<p class="kick">Plans and views</p><h2>What is planned on the ground.</h2>
    <div style="display:grid;gap:5mm">${shots.slice(0, 3).map((i) => `<img class="photo" style="height:${shots.length > 2 ? 66 : 96}mm" src="${img(i)}" alt="">`).join("")}</div>
    <p class="src">Images from the developer's presentation. Artist's impressions and plans can change before approval.</p>`));
}

/* 5. Price list */
if (priceRows.length) {
  const head = PT[0];
  pages.push(page(`<p class="kick">Price list</p><h2>Every size, and what it starts at.</h2>
    <table style="font-size:${priceRows.length > 12 ? 9.4 : 11}pt"><thead><tr>${head.map((h, i) => `<th class="${i === head.length - 1 ? "n" : ""}">${esc(clean(h))}</th>`).join("")}</tr></thead>
    <tbody>${priceRows.slice(0, 16).map((r) => `<tr>${r.map((c, i) => `<td class="${i === r.length - 1 ? "n" : ""}">${i === 0 ? `<b>${esc(clean(c))}</b>` : esc(clean(c))}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <p class="src">Indicative starting prices from the developer's material, as listed by 100 Yards on ${today}. The final price depends on floor, facing and the launch price list.</p>
    <div class="band">Ask us for the <b>floor-wise price sheet</b> and the units still open. Pre-launch choices go first to buyers who register early. Call or WhatsApp <b>+91 99168 66667</b>.</div>`));
}

/* 5b. Price and size, drawn */
if (priced.length > 1 && priced.length <= 12) {
  const sq = (t) => Number((/([\d,]+)/.exec(t) ?? [0, "0"])[1].replace(/,/g, ""));
  pages.push(page(`<p class="kick">Price and size at a glance</p><h2>From ${lakh(priced[0].value)} to ${lakh(priced[priced.length - 1].value)}.</h2>
    <div class="chart"><h3>Starting price by home type</h3>${hbars(priced.map((u, i) => ({ label: short(u.type, 30), value: u.value, text: lakh(u.value), hi: i === 0 })), { labelW: 220 })}</div>
    ${priced.filter((u) => sq(u.size)).length < 2 ? "" : `<div class="chart" style="margin-top:9mm"><h3>How much space each one gives you (sq.ft.)</h3>`}${priced.filter((u) => sq(u.size)).length < 2 ? "<!--" : ""}${hbars(priced.filter((u) => sq(u.size)).map((u) => ({ label: short(u.type, 30), value: sq(u.size), text: `${sq(u.size).toLocaleString("en-IN")} sq.ft.` })), { labelW: 220 })}</div>${priced.filter((u) => sq(u.size)).length < 2 ? "-->" : ""}
    <p class="src">Indicative starting prices and super built-up areas from the developer's material, as listed by 100 Yards on ${today}.</p>`));
}

/* 6. What you really pay */
if (startPrice && picks.length) {
  const rows = picks.map((u) => ({ u, c: costs(u.value) }));
  pages.push(page(`<p class="kick">What you really pay</p><h2>The price, plus what the government adds.</h2>
    <p class="lead">Stamp duty and registration are paid on top of the agreement value. Here they are worked out${rows.length > 1 ? ` for ${rows.length === 2 ? "two" : "three"} sizes` : " on the starting price"}, so there are no surprises on registration day.</p>
    <div class="chart">${stacks(rows.map(({ u, c }) => ({ label: u.type.length > 22 ? u.type.slice(0, 21) + "…" : u.type, a: u.value, b: c.extra, text: lakh(c.total), aText: lakh(u.value) })), ["Listed price", "Government charges"])}</div>
    <table style="margin-top:7mm"><thead><tr><th>Home</th><th class="n">Price</th><th class="n">Stamp duty</th><th class="n">Cess etc.</th><th class="n">Regn.</th><th class="n">Total</th></tr></thead>
    <tbody>${rows.map(({ u, c }) => `<tr><td><b>${esc(short(u.type, 34))}</b><br>${esc(u.size)}</td><td class="n">${lakh(u.value)}</td><td class="n">${inr(c.duty)}</td><td class="n">${inr(c.cess + c.sur)}</td><td class="n">${inr(c.reg)}</td><td class="n"><b>${lakh(c.total)}</b></td></tr>`).join("")}</tbody></table>
    <p class="src">Stamp duty 5% above ₹45 lakh, cess 10% and urban surcharge 2% of the duty, registration 2%. ${esc(RATES.source)}. ${esc(RATES.asOf)} GST on an under-construction home is 5% unless the quoted price already includes it.</p>
    <div class="band">Government charges add about <b>${((rows[0].c.extra / rows[0].u.value) * 100).toFixed(1)}%</b> to the listed price. Keep that amount ready in your own funds; banks do not lend against it.</div>`));

  /* 6b. The monthly payment */
  const mid = rows[Math.min(1, rows.length - 1)], loan = mid.u.value * 0.8, e = emi(loan, 8.5, 20);
  pages.push(page(`<p class="kick">The monthly payment</p><h2>What the loan could look like.</h2>
    <table><thead><tr><th>Home</th><th class="n">Loan (80%)</th><th class="n">EMI at 8.5%</th><th class="n">EMI at 9.0%</th><th class="n">Own money</th></tr></thead>
    <tbody>${rows.map(({ u, c }) => `<tr><td><b>${esc(short(u.type, 34))}</b></td><td class="n">${lakh(u.value * 0.8)}</td><td class="n">${inr(emi(u.value * 0.8, 8.5, 20))}</td><td class="n">${inr(emi(u.value * 0.8, 9, 20))}</td><td class="n">${lakh(u.value * 0.2 + c.extra)}</td></tr>`).join("")}</tbody></table>
    <div class="chart" style="margin-top:9mm"><h3>How the loan comes down: ${esc(short(mid.u.type, 30))}, ${lakh(loan)} at 8.5% for 20 years</h3>${balanceLine(loan, 8.5, 20)}</div>
    <div class="chart" style="margin-top:6mm"><h3>Where 20 years of EMIs go</h3>${stacks([{ label: mid.u.type.length > 22 ? mid.u.type.slice(0, 21) + "…" : mid.u.type, a: loan, b: e * 240 - loan, text: lakh(e * 240), aText: `${lakh(loan)} loan repaid` }], ["Loan repaid", "Interest to the bank"])}</div>
    <p class="src">Illustration only: 20-year loan at two sample interest rates, same EMI throughout. Your bank decides the rate and how much it lends. Own money = 20% of the price plus the government charges. Paying extra early shortens the loan and cuts the interest.</p>`));
}

/* 7. Location today */
const schools = nearbyBy(/school|educat/i), hospitals = nearbyBy(/hospital|health/i);
pages.push(page(`<p class="kick">The location today</p><h2>What is already around ${esc(P.name)}.</h2>
  ${LA.length ? `<table style="margin-bottom:7mm"><tbody>${LA.map(([a, b]) => `<tr><td style="width:45%"><b>${esc(clean(a))}</b></td><td>${esc(clean(b))}</td></tr>`).join("")}</tbody></table>` : ""}
  <div class="two">
    ${schools.length ? `<div><h3>Schools</h3><ul class="plain">${schools.slice(0, 7).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
    ${hospitals.length ? `<div><h3>Hospitals</h3><ul class="plain">${hospitals.slice(0, 7).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
  </div>
  <p class="src">Nearby places as listed by 100 Yards. Drive the route at your own commute hour before you decide.</p>
  ${img(5) && LA.length + Math.max(schools.length, hospitals.length) < 14 ? `<img class="photo" style="position:absolute;left:18mm;right:18mm;width:174mm;bottom:22mm;height:56mm" src="${img(5)}" alt="">` : ""}`));

/* 8. What is coming */
pages.push(page(`<p class="kick">What is coming to this area</p><h2>The projects that can change this address.</h2>
  <p class="lead">Property values follow access and jobs. These are the public projects near ${esc(P.name)}, where each stands today, and why it matters to an owner here.</p>
  ${R.upcoming.map((u) => `<div class="item"><h3>${esc(u.what)}</h3><div><p><b>Where it stands.</b> ${esc(u.status)}</p><p style="margin-top:1.6mm"><b>Why it matters.</b> ${esc(u.why)}</p>${srcLine(u.source)}</div></div>`).join("")}`));

/* 8b. When things arrive */
if ((R.timeline ?? []).length) pages.push(page(`<p class="kick">When it arrives</p><h2>The dates that matter for this address.</h2>
  <div class="chart" style="margin-top:6mm">${timeline(R.timeline)}</div>
  <p class="src">Source: ${esc(R.timelineSource)}</p>
  ${R.progress ? `<div class="chart" style="margin-top:12mm"><h3>${esc(R.progress.label)}, ${esc(R.progress.asOf)}</h3>${meter(R.progress.pct)}</div>${srcLine(R.progress.source)}` : ""}
  ${(R.tiles ?? []).length ? `<div class="tiles" style="margin-top:12mm">${R.tiles.slice(0, 3).map((d) => `<div><b>${esc(d.value)}</b><small>${esc(d.label)}</small></div>`).join("")}</div>${srcLine(R.tilesSource)}` : ""}
  ${R.band ? `<div class="band">${esc(R.band)}</div>` : ""}`));

/* 9. Price story */
const perSqft = priced[0] && /([\d,]+)/.exec(priced[0].size) ? Math.round(priced[0].value / Number(/([\d,]+)/.exec(priced[0].size)[1].replace(/,/g, ""))) : null;
if (R.area) {
  const A = R.area, r100 = (n) => Math.round(n / 100) * 100;
  let cols, head;
  if (A.series) {
    cols = A.series.map(([label, value], i) => ({ label, value, text: inr(value), hi: i === A.series.length - 1 }));
    const ch = (A.series[A.series.length - 1][1] / A.series[0][1] - 1) * 100;
    head = ch > 1 ? `${A.name} asking prices: up about ${ch.toFixed(1)}% since ${A.series[0][0]}.` : ch < -1 ? `${A.name} asking prices have eased since ${A.series[0][0]}. Buyers have room to negotiate.` : `${A.name} asking prices are holding steady at about ${inr(r100(A.now))} per sq.ft.`;
  } else if (A.fiveYearPct) {
    const y1 = A.now / (1 + A.oneYearPct / 100), y5 = A.now / (1 + A.fiveYearPct / 100);
    cols = [{ label: "Five years ago", value: y5, text: `about ${inr(r100(y5))}` }, { label: "One year ago", value: y1, text: `about ${inr(r100(y1))}` }, { label: "Today", sub: "May 2026", value: A.now, text: inr(A.now), hi: true }];
    head = `${A.name} prices: up about ${A.fiveYearPct.toFixed(0)}% in five years.`;
  } else head = `${A.name} today: about ${inr(r100(A.now))} per sq.ft.`;
  const story = R.priceStory ?? [{ label: `${A.name} average asking price`, value: `${inr(A.now)} per sq.ft.`, source: A.short }, ...(A.yield ? [{ label: "Rental yield in this area", value: `${A.yield}%`, source: A.short }] : []), ...(A.rent ? [{ label: "Average rent per sq.ft. a month", value: `₹${A.rent}`, source: A.short }] : [])];
  pages.push(page(`<p class="kick">The price story</p><h2>${esc(head)}</h2>
    ${cols ? `<div class="chart"><h3>Average asking price in ${esc(A.name)}, ₹ per sq.ft.</h3>${columns(cols)}</div>${srcLine(A.source)}` : ""}
    <div class="stat" style="margin-top:8mm;grid-template-columns:repeat(${Math.max(2, Math.min(4, story.length))},1fr)">${story.map((s) => `<div><b>${esc(s.value)}</b><small>${esc(s.label)}</small><p class="src">${esc(s.source)}</p></div>`).join("")}</div>
    ${!cols ? srcLine(A.source) : ""}
    ${perSqft ? `<div class="chart"><h3>Where ${esc(P.name)} sits, ₹ per sq.ft.</h3>${hbars([{ label: `${A.name} average`, value: A.now, text: inr(A.now) }, { label: `${short(P.name, 24)}, starting`, value: perSqft, text: `about ${inr(r100(perSqft))}`, hi: true }], { labelW: 230 })}</div><p class="src">Project figure: lowest-priced home on the indicative price list divided by its area. ${perSqft > A.now ? "A branded project is priced above the street average; that premium is what you are choosing to pay for." : "Portal averages mix old and new homes, so compare like with like when you visit."}</p>` : ""}`));
}
pages.push(page(`<p class="kick">What moves prices next</p><h2>What can lift values here, and what can slow them.</h2>
  <div class="two" style="margin-top:4mm">
    <div><h3>What can push prices up</h3><ul class="plain">${R.movers.up.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>
    <div><h3>What can hold them back</h3><ul class="plain">${R.movers.down.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>
  </div>
  <div class="band">Past growth is a record, not a promise. The reasons on the left are why buyers are choosing this corridor now. The risks on the right are why we say: buy a home you would be happy to live in or hold for years.</div>
  ${img(4) || img(0) ? `<img class="photo" style="position:absolute;left:18mm;width:174mm;bottom:22mm;height:92mm" src="${img(4) || img(0)}" alt="">` : ""}`));

/* 10. Amenities */
if (AM.length) pages.push(page(`<p class="kick">Life inside the gate</p><h2>What the plan gives residents.</h2>
  <ul class="cols">${AM.slice(0, 30).map((a) => `<li>${esc(short(a, 60))}</li>`).join("")}</ul>
  <p class="src" style="margin-top:4mm">Amenities named in the developer's material. The final list is the one in the approved plan and your agreement.</p>
  ${AM.length <= 22 && (img(3) || img(1)) ? `<img class="photo" style="position:absolute;left:18mm;width:174mm;bottom:22mm;height:${AM.length < 12 ? 120 : 70}mm" src="${img(3) || img(1)}" alt="">` : ""}`));

/* 11. Before you book */
const askPlot = ["Which plots are open at this price, and what are their exact dimensions and facing?", "Is the layout approved, by which authority, and is the land converted for residential use?", "Will the plot get its own khata, and when?", "What is the full cost sheet, including development, club and maintenance charges?", "What is the payment schedule, and what must be complete before each instalment?", RERA_OK ? "Which phase does the RERA registration cover, and until what date?" : "When is the RERA registration expected, and is my payment refundable until then?", "By when must I build, and are there design rules for the house?", "Which banks have approved the layout for plot loans?"];
const askFlat = ["Which tower, floor and facing are open at this price?", "What is the full cost sheet, including parking, club and maintenance deposits?", "What is the payment schedule, and which construction stage triggers each instalment?", RERA_OK ? "Which phase does the RERA registration cover, and until what date?" : "When is the RERA registration expected, and is my payment refundable until then?", "What possession date goes into the agreement, and what is paid to me if it is late?", "What is the carpet area of my unit, in the agreement's own words?", "Which banks have approved the project for home loans?", "What is the expected monthly maintenance?"];
const ask = PLOT ? askPlot : askFlat;
pages.push(page(`<p class="kick">Before you book</p><h2>What to weigh, and what to ask.</h2>
  <div class="two">
    <div><h3>Weigh these</h3><ul class="plain">${WEIGH.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
      <h3 style="margin-top:7mm">Check the registration yourself</h3>
      <p style="font-size:11.2pt;color:#3a4459">${RERA_OK ? `Registration number listed for this project: <b>${esc(clean(P.rera))}</b>. ` : P.reraNote ? "No registration number has been issued yet. " : "Ask us for the registration number of the phase you are buying in. "}Open rera.karnataka.gov.in, choose Projects, and search by the project or promoter name. The entry shows validity, approvals and complaints.</p></div>
    <div><h3>Ask the builder</h3>${ask.map((q, i) => `<div class="q"><span>${i + 1}</span><p>${esc(q)}</p></div>`).join("")}</div>
  </div>`));

/* 12. FAQ */
if (faq.length) pages.push(page(`<p class="kick">Common questions</p><h2>Answers buyers ask us for.</h2>
  ${faq.filter((f) => clean(f.a).length < 330).slice(0, 6).map((f) => `<div class="item" style="grid-template-columns:62mm 1fr"><h3 style="font-size:13pt">${esc(f.q)}</h3><div><p>${esc(f.a)}</p></div></div>`).join("")}`));

/* 13. Next step + notes */
pages.push(page(`<p class="kick">Your next step</p><h2 style="color:#f1ede2">See it, then decide.</h2>
  <p class="lead">A report can take you to the gate. A site visit shows you the road, the neighbourhood and the view from your floor. We arrange the visit, the price sheet and the home-loan introductions, at no charge to you.</p>
  <div class="cta"><div><small>Call or WhatsApp</small><b>+91 99168 66667</b></div><div><small>Email</small><b>sales@100yards.in</b></div><div><small>Project page</small><b>100yards.in/projects/${esc(slug)}</b></div></div>
  <div style="position:absolute;left:18mm;right:18mm;bottom:22mm" class="note">
    <p style="color:#d4ad63;letter-spacing:.14em;text-transform:uppercase;font-size:7.6pt;font-weight:700">How this report was made</p>
    <p style="color:#aeb6c7">Project facts, prices, plans and images come from the developer's published material as listed by 100 Yards on ${today}. Area facts and price trends come from the public sources named beside each item, read on ${esc(R.checked)}. Statutory charges use published Karnataka rates.</p>
    <p style="color:#aeb6c7">This report is our analysis to help you shortlist. It is not legal, tax or investment advice and it does not promise any return; past price movement does not guarantee future prices, and public projects can be delayed or changed. Figures may be out of date or wrong. Check the RERA registration, the agreement and the title with your own lawyer before you pay. Hundred Yards Realtor Private Limited is a Karnataka RERA registered agent and may earn a fee from the developer if you buy.</p>
  </div>`, "navy"));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(P.name)} — Property Intelligence Report</title><style>${css}</style></head><body>${pages.join("")}</body></html>`;
const outDir = path.join(ROOT, "scripts/report/out");
mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `${slug}-buyers-report`);
writeFileSync(`${base}.html`, html);
const { chromium } = await import("playwright");
const exe = ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"].find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const tab = await browser.newPage();
await tab.goto(`file://${base}.html`, { waitUntil: "networkidle" });
await tab.pdf({ path: `${base}.pdf`, format: "A4", printBackground: true });
await browser.close();
console.log(`${pages.length} pages · ${base}.pdf`);
