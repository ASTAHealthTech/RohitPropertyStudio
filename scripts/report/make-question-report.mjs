/**
 * Property Intelligence Report — the question-by-question edition.
 *
 *   node scripts/report/make-question-report.mjs <catalogue-slug> [--specimen] [--for "Buyer Name"]
 *
 * One buyer question per page, about two dozen pages, different for every
 * property: the question set changes with the property type (apartment, villa,
 * plot) and every page is filled from that project's own catalogue entry
 * (app/lib/catalog/projects.json) plus an optional per-order facts file
 * (scripts/report/orders/<slug>.json) that the office fills from official pulls.
 *
 * THE RULE: nothing is invented. A fact comes from (a) the per-order file,
 * (b) the project's published material in the catalogue, labelled as such, or
 * (c) it prints as "Pending official pull". Statutory rates mirror
 * app/lib/labData.ts — keep the two in sync. The report never says buy or
 * don't buy, and never predicts a price.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--for");
const SPECIMEN = args.includes("--specimen");
const buyer = args.includes("--for") ? args[args.indexOf("--for") + 1] : "";
if (!slug) {
  console.error('Usage: node scripts/report/make-question-report.mjs <catalogue-slug> [--specimen] [--for "Buyer Name"]');
  process.exit(1);
}
const catalogue = JSON.parse(readFileSync(path.join(ROOT, "app/lib/catalog/projects.json"), "utf8"));
const P = catalogue.find((p) => p.slug === slug);
if (!P) { console.error(`No catalogue project with slug "${slug}"`); process.exit(1); }
const orderPath = path.join(ROOT, "scripts/report/orders", `${slug}.json`);
const O = existsSync(orderPath) ? JSON.parse(readFileSync(orderPath, "utf8")) : {};

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clean = (v) => String(v ?? "").replace(/\*/g, "").trim();
const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const reportNo = `HY-PIR-${new Date().getFullYear()}-${String(Math.abs([...slug].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 10000).padStart(4, "0")}`;
const KIND = /plot/i.test(P.kind) ? "plot" : /villa/i.test(P.kind) ? "villa" : "apartment";
const SELLER = "Hundred Yards Realtor Private Limited";
const AGENT = "PRM/KA/RERA/1251/310/AG/231030/004229";

/* ---- statutory rates: mirror app/lib/labData.ts ---- */
const RATES = {
  slabs: [[2_000_000, 0.02, "Up to ₹20 lakh · 2%"], [4_500_000, 0.03, "₹20–45 lakh · 3%"], [Infinity, 0.05, "Above ₹45 lakh · 5%"]],
  registration: 0.02, cess: 0.10, surchargeUrban: 0.02, surchargeRural: 0.03, gstUC: 0.05,
  source: "Karnataka Dept. of Stamps & Registration · registration revised Aug 2025",
  gstSource: "GST on real estate (CBIC framework)",
  asOf: "As of 2026 — verify current rates before any transaction",
};
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* ---- facts: order file first, then published material, else pending ---- */
const PENDING = `<span class="pend">Pending official pull</span>`;
const pub = (v) => (clean(v) && !/whatsapp|confirm with|verify at/i.test(v) ? { v: esc(clean(v)), src: "Developer's published material, as listed by 100 Yards" } : null);
const off = (key, src) => (O[key] ? { v: esc(O[key]), src: `${src}${O[`${key}AsOf`] ? `, read ${esc(O[`${key}AsOf`])}` : ""}`, official: true } : null);
const row = (label, fact, pendingSrc) => `<tr><th>${esc(label)}</th><td>${fact ? fact.v : PENDING}</td><td class="src">${fact ? fact.src : esc(pendingSrc)}</td></tr>`;
const snap = Object.fromEntries((P.snap ?? []).slice(1).filter((r) => r.length === 2).map(([k, v]) => [k.toLowerCase(), v]));
const snapFind = (...keys) => { for (const k of Object.keys(snap)) if (keys.some((x) => k.includes(x))) return snap[k]; return ""; };

/* ---- the true-cost worksheet on the published starting price ---- */
function costSheet() {
  if (!P.priceLakh) return null;
  const price = P.priceLakh * 100000;
  const slab = RATES.slabs.find(([upTo]) => price <= upTo);
  const duty = price * slab[1];
  const cess = duty * RATES.cess, sur = duty * RATES.surchargeUrban, reg = price * RATES.registration;
  const underConstruction = !/ready/i.test(`${P.status} ${P.poss}`);
  const gst = underConstruction ? price * RATES.gstUC : 0;
  return { price, slab, duty, cess, sur, reg, gst, underConstruction, total: price + duty + cess + sur + reg + gst };
}
const cost = costSheet();

/* ---- the questions ---- */
const reraNo = P.rera ? { v: esc(P.rera), src: "Number listed for the project by 100 Yards; confirm on the register" } : null;
const commonQs = [
  { group: "Is it legal?", q: "Is the project registered with RERA, and until when?",
    rows: [["Registration number", off("reraNumber", "K-RERA register") ?? reraNo, "K-RERA register"], ["Registration status", off("reraStatus", "K-RERA register"), "K-RERA register"], ["Valid until (declared completion)", off("reraValidTill", "K-RERA register"), "K-RERA register"], ["Extensions granted", off("reraExtensions", "K-RERA register"), "K-RERA register"]],
    why: "Under the Real Estate (Regulation and Development) Act, 2016, a promoter may not advertise, book or sell in a covered project without registering it. The validity date is the completion date the promoter declared when registering.",
    ask: ["Which phase, tower or block does this registration number cover?", "Has an extension been applied for or granted, and why?"],
    check: "Search the registration number on rera.karnataka.gov.in under Projects. The QR code on the last page opens the portal." },
  { group: "Is it legal?", q: "Are the plan approvals on file?",
    rows: [["Sanctioned plan and approving authority", off("approvals", "K-RERA filing"), "K-RERA filing"], ["Commencement certificate", off("commencement", "K-RERA filing"), "K-RERA filing"], ["Occupancy certificate", off("occupancy", "Issuing authority"), "Issuing authority"]],
    why: "Construction should follow the plan sanctioned by the competent authority. The documents the promoter uploaded while registering are public, and are the ones your own lawyer should read.",
    ask: ["Can I have copies of the sanctioned plan and the commencement certificate?", "Is the unit I am shown exactly as in the sanctioned plan?"],
    check: "Open the project's page on the K-RERA portal and read the uploaded approvals. Ask a lawyer to read them with you." },
  { group: "Is it legal?", q: "Are there complaints or cases on record?",
    rows: [["Complaints on the K-RERA portal", off("complaints", "K-RERA complaints"), "K-RERA complaints"], ["Court cases found by search", off("courtCases", "eCourts search"), "eCourts search"]],
    why: "Complaints and cases do not by themselves make a project unsafe, but you should know they exist and what they are about before you commit.",
    ask: ["Are there pending complaints or litigation concerning this project or its land?", "Will you confirm that in writing?"],
    check: "K-RERA lists complaints by project. eCourts allows a party-name search for the promoter's legal entity." },
  { group: "Is it legal?", q: "Is the land title clean?",
    rows: [["Encumbrance certificate period", off("ecPeriod", "Kaveri EC"), "Kaveri online EC"], ["Registered transactions in the period", off("ecTransactions", "Kaveri EC"), "Kaveri online EC"], ["Mortgages or charges recorded", off("ecMortgages", "Kaveri EC"), "Kaveri online EC"], ["Notes", off("ecNotes", "Kaveri EC"), "Kaveri online EC"]],
    why: "An encumbrance certificate records registered transactions over a stated period. It is a strong signal, not a complete substitute for a lawyer's title search going back to the parent deed.",
    ask: ["Is the project land mortgaged to a lender, and how will my unit be released?", "Who is the landowner: the promoter, or a joint-development partner?"],
    check: "An EC can be applied for on the Kaveri portal for the survey numbers in the K-RERA filing. This report pulls it per order." },
  { group: "Who is behind it?", q: "Which company is the legal promoter?",
    rows: [["Developer brand", pub(P.devFull || P.dev), ""], ["Promoter entity on the register", off("promoterEntity", "K-RERA register"), "K-RERA register"], ["Company identification (CIN)", off("mcaEntity", "MCA master data"), "MCA master data"], ["Incorporated", off("mcaIncorporated", "MCA master data"), "MCA master data"]],
    why: "The brand on the hoarding and the company that signs your agreement are often different. Your rights are against the legal entity named in the agreement for sale.",
    ask: ["Which entity will sign my agreement for sale?", "What is its relationship to the brand?"],
    check: "The promoter's legal name is on the K-RERA registration. Its company record is public on the MCA portal." },
  { group: "Who is behind it?", q: "What else has this builder registered?",
    rows: [["Other projects by this builder in the 100 Yards catalogue", { v: esc(catalogue.filter((x) => x.devSlug === P.devSlug && x.slug !== P.slug).map((x) => x.name).slice(0, 8).join(", ") || "None listed"), src: "100 Yards catalogue" }, ""], ["Registrations under the same promoter", off("promoterRegistrations", "K-RERA register"), "K-RERA register"]],
    why: "A promoter's other registrations show scale and focus: how many projects run at once, and where.",
    ask: ["Which of your projects in this city were handed over in the last three years?", "May I visit one that is occupied?"],
    check: "Search the promoter's name on the K-RERA portal to list every registration." },
  { group: "Who is behind it?", q: "Did earlier projects finish on time?",
    rows: [["Earlier projects: declared against actual completion", off("deliveryRecord", "K-RERA register"), "K-RERA register"], ["Extensions across the promoter's projects", off("promoterExtensions", "K-RERA register"), "K-RERA register"]],
    why: "Each registration carries a declared completion date. Comparing it with what happened is the plainest evidence of how a builder delivers. Past record is information, not a forecast.",
    ask: ["When was your last project in this city due, and when was it handed over?", "What caused any delay?"],
    check: "Compare declared completion dates and extension records on the K-RERA portal." },
  { group: "Who is behind it?", q: "Who runs the company?",
    rows: [["Directors", off("mcaDirectors", "MCA master data"), "MCA master data"], ["Company status", off("mcaStatus", "MCA master data"), "MCA master data"]],
    why: "Knowing who the directors are lets you look up their other companies and any public record against them.",
    ask: ["Who are the directors of the promoter entity?", "Is the entity a subsidiary created only for this project?"],
    check: "Director details are public in the MCA company master data." },
  { group: "What will it really cost?", q: "What do I pay on top of the quoted price?", cost: true,
    why: "The quoted price is not the amount you pay. Stamp duty, registration, cess, surcharge and GST are set by law and are payable in addition.",
    ask: ["Is the price quoted inclusive of GST?", "Which other charges are payable now, and which at possession?"],
    check: "Rates are published by the Karnataka Department of Stamps and Registration. Work your own numbers in the Property Lab on 100yards.in." },
  { group: "What will it really cost?", q: "How does the price sit against the guidance value?",
    rows: [["Published starting price", pub(P.price), ""], ["Published price per sq ft", pub(snapFind("price / sq", "per sq")), ""], ["Guidance value for the location", off("guidanceValue", "Kaveri guidance value"), "Kaveri guidance value"], ["Official price index context", off("trendNote", "RBI / NHB series"), "RBI House Price Index"]],
    why: "The guidance value is the government's minimum value for a location. Stamp duty is charged on at least this value, whatever price is agreed. It is a reference point, not an opinion on fair price.",
    ask: ["What is the all-in price per square foot of carpet area?", "What was the launch price, and what has changed since?"],
    check: "Guidance values are searchable on the Kaveri portal by location." },
  { group: "What will it really cost?", q: "What is the payment schedule tied to?",
    rows: [["Payment plan offered", off("paymentPlan", "Builder's cost sheet"), "Builder's cost sheet"], ["Booking amount", off("bookingAmount", "Builder's cost sheet"), "Builder's cost sheet"], ["Project status", pub(P.status), ""], ["Possession, as published", pub(P.poss), ""]],
    why: "Under RERA a promoter may not accept more than ten percent of the cost as an advance without first signing and registering an agreement for sale. Later instalments are normally tied to construction milestones.",
    ask: ["Which construction milestone triggers each instalment?", "What does the cancellation and refund clause say?"],
    check: "Read the payment schedule in the draft agreement for sale, not only the brochure." },
  { group: "What will it really cost?", q: "What are the running costs after possession?",
    rows: [["Maintenance charge", off("maintenance", "Builder's cost sheet"), "Builder's cost sheet"], ["Corpus or sinking fund", off("corpus", "Builder's cost sheet"), "Builder's cost sheet"], ["Other deposits and charges", off("otherCharges", "Builder's cost sheet"), "Builder's cost sheet"]],
    why: "Maintenance, corpus funds and property tax continue for as long as you own the home. They change the real monthly cost more than most buyers expect.",
    ask: ["What is the maintenance charge per square foot, and for how long is it fixed?", "Who runs maintenance after the first year?"],
    check: "Ask for the full cost sheet and the maintenance clause of the agreement." },
];

const amenities = P.am?.length ? { v: esc(P.am.slice(0, 14).join(", ")), src: "Developer's published material, as listed by 100 Yards" } : null;
const nearby = P.la?.length ? { v: P.la.slice(0, 8).map(([a, b]) => `${esc(a)} <b>${esc(b)}</b>`).join(" · "), src: "Developer's published travel times; they vary with traffic" } : null;
const typeQs = {
  apartment: [
    { group: "What am I actually buying?", q: "What is the carpet area, and how much is loading?",
      rows: [["Configurations", pub(P.config), ""], ["Sizes, as published", pub(P.sizes), ""], ["Carpet area of the chosen unit", off("carpetArea", "Agreement for sale"), "Draft agreement for sale"], ["Saleable area and loading", off("loading", "Builder's cost sheet"), "Builder's cost sheet"]],
      why: "RERA defines carpet area, and the agreement must state it. Brochure sizes are usually saleable area, which adds walls and a share of common spaces. Compare projects on carpet area.",
      ask: ["What is the RERA carpet area of this exact unit?", "What percentage is added to reach the saleable area?"],
      check: "The carpet area is stated in the agreement for sale and in the K-RERA filing." },
    { group: "What am I actually buying?", q: "What is my share of the land?",
      rows: [["Project land area, as published", pub(P.land), ""], ["Towers and homes, as published", pub([snapFind("tower"), snapFind("homes", "units")].filter(Boolean).join(" · ")), ""], ["Undivided share for the chosen unit", off("uds", "Agreement for sale"), "Draft agreement for sale"]],
      why: "With an apartment you own the flat and an undivided share of the land beneath the project. That share is what holds long-term value and matters if the building is ever redeveloped.",
      ask: ["What undivided share of land comes with this unit, in square feet?", "How is it calculated?"],
      check: "The undivided share is written in the agreement for sale and later in the sale deed." },
  ],
  villa: [
    { group: "What am I actually buying?", q: "Do I own the land under the villa?",
      rows: [["Configurations", pub(P.config), ""], ["Sizes, as published", pub(P.sizes), ""], ["Plot area and ownership form", off("plotArea", "Agreement for sale"), "Draft agreement for sale"]],
      why: "Villa communities are sold either with a defined plot in your name or with an undivided share of a larger land parcel. The two are very different kinds of ownership.",
      ask: ["Will the sale deed convey a defined plot or an undivided share?", "What are the plot dimensions?"],
      check: "Read the schedule of property in the draft agreement for sale." },
    { group: "What am I actually buying?", q: "What is built, and what can I change?",
      rows: [["Specification, as published", pub(snapFind("specification", "structure", "design")), ""], ["Customisation allowed", off("customisation", "Builder's written terms"), "Builder's written terms"]],
      why: "Structure, finishes and what you may alter later are fixed by the agreement and the community's rules, not by the show villa.",
      ask: ["Which finishes in the show villa are standard?", "What changes may I make after handover?"],
      check: "Ask for the written specification annexed to the agreement." },
  ],
  plot: [
    { group: "What am I actually buying?", q: "Is the layout approved, and by which authority?",
      rows: [["Layout approval and authority", off("layoutApproval", "Approving authority"), "K-RERA filing / approving authority"], ["Land area, as published", pub(P.land), ""], ["Plot sizes, as published", pub(P.sizes || P.config), ""]],
      why: "A plot is only as good as the approval of the layout it sits in. The approving authority and the approval number should be on the sanctioned layout plan.",
      ask: ["Which authority approved the layout, and what is the approval number?", "Is my plot number on the approved plan?"],
      check: "Ask for the sanctioned layout plan and match your plot number, dimensions and road width against it." },
    { group: "What am I actually buying?", q: "Is the land converted, and will I get a khata?",
      rows: [["Conversion to residential use", off("conversion", "Revenue records"), "Revenue records"], ["Khata for individual plots", off("khata", "Local body records"), "Local body records"]],
      why: "Agricultural land generally has to be converted for residential use before plots are sold, and each plot needs its own khata for tax, loans and building permission.",
      ask: ["May I see the conversion order?", "When will the individual khata for my plot be issued?"],
      check: "Conversion orders and khata records are held by the revenue department and the local body." },
  ],
};
const lifeQs = [
  { group: "What is it like to live there?", q: KIND === "plot" ? "What infrastructure is promised, in writing?" : "Which amenities are promised, in writing?",
    rows: [["Amenities, as published", amenities, "Developer's published material"], ["Amenities listed in the K-RERA filing", off("reraAmenities", "K-RERA filing"), "K-RERA filing"]],
    why: "Only what is written in the agreement and the registration filing is enforceable. A brochure is advertising.",
    ask: ["Which of these amenities are listed in the agreement for sale?", "Which are in this phase, and which in a later one?"],
    check: "Compare the brochure list with the amenities declared in the K-RERA filing." },
  { group: "What is it like to live there?", q: "What is nearby, and how long does it really take?",
    rows: [["Location", pub(P.loc), ""], ["Published travel times", nearby, "Developer's published material"], ["Site notes from our visit", off("siteNotes", "100 Yards site visit"), "100 Yards site visit"]],
    why: "Published travel times are measured in free-flowing traffic. Your own commute at your own hours is the number that matters.",
    ask: ["Which roads or metro lines nearby are finished, and which are only planned?"],
    check: "Drive the route at the hour you would actually travel, on a weekday." },
];
const riskQs = [
  { group: "What could go wrong?", q: "What happens if possession is late?",
    rows: [["Possession, as published", pub(P.poss), ""], ["Completion date declared to RERA", off("reraValidTill", "K-RERA register"), "K-RERA register"], ["Delay clause in the agreement", off("delayClause", "Draft agreement for sale"), "Draft agreement for sale"]],
    why: "If a promoter fails to give possession by the agreed date, RERA lets the buyer withdraw with a refund and interest, or stay and receive interest for each month of delay.",
    ask: ["What possession date goes into my agreement?", "What interest do you pay for delay, and from which date?"],
    check: "The date that binds the builder is the one in your agreement for sale. Compare it with the date declared to RERA." },
  { group: "What could go wrong?", q: "What must be true before I pay the next instalment?",
    rows: [["Current construction stage", off("constructionStage", "100 Yards site visit"), "100 Yards site visit"], ["Bank approvals for home loans", off("bankApprovals", "Builder / lender"), "Builder / lender"]],
    why: "Each payment should follow a milestone you can see and a document you hold. A lender's approval of the project is a second pair of eyes on the paperwork.",
    ask: ["Which banks have approved this project for loans?", "Will you share dated progress photographs with each demand?"],
    check: "Visit before each large payment, or ask us to." },
];
const QUESTIONS = [...commonQs, ...typeQs[KIND], ...lifeQs, ...riskQs];
const TOTAL = QUESTIONS.length;

/* ---- rendering ---- */
const answered = (q) => q.cost ? Boolean(cost) : (q.rows ?? []).filter(([, f]) => f).length;
const status = (q) => {
  if (q.cost) return cost ? ["Worked out", "ok"] : ["Needs your quoted price", "pend"];
  const n = answered(q), m = q.rows.length;
  if ((q.rows ?? []).some(([, f]) => f?.official) && n === m) return ["Answered from the record", "ok"];
  if (n === 0) return ["Pending official pull", "pend"];
  return n === m ? ["Answered from published material", "part"] : ["Partly answered", "part"];
};

const fontDir = path.join(ROOT, "public/fonts");
const face = (family, file, weight, style = "normal") => `@font-face{font-family:"${family}";src:url("file://${path.join(fontDir, file)}") format("woff2");font-weight:${weight};font-style:${style}}`;
const QR = await import("qrcode");
const qr = await QR.default.toDataURL("https://rera.karnataka.gov.in/", { margin: 0, width: 220, color: { dark: "#14120f", light: "#00000000" } });
const coverImg = P.images?.[0] ? `file://${path.join(ROOT, "public", P.images[0].src)}` : "";

const css = `
${face("Jost", "jost-latin-wght-normal.woff2", "100 900")}
${[300, 400, 500].map((w) => face("Cormorant Garamond", `cormorant-garamond-latin-${w}-normal.woff2`, w) + face("Cormorant Garamond", `cormorant-garamond-latin-${w}-italic.woff2`, w, "italic")).join("")}
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:"Jost",sans-serif;font-weight:300;font-size:10.6pt;line-height:1.55;color:#14120f;font-variant-numeric:lining-nums;font-feature-settings:"lnum" 1}
.pg{position:relative;width:210mm;height:297mm;padding:19mm 18mm 20mm;background:#fbf8f2;overflow:hidden;page-break-after:always;display:flex;flex-direction:column}
.pg--ink{background:#0d0c0a;color:#ede7db}
h1,h2,h3{font-family:"Cormorant Garamond",serif;font-weight:300;margin:0;line-height:1.02;letter-spacing:-.01em}
.cap{font-size:7.6pt;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#6b5a36}
.pg--ink .cap{color:#cdb892}
.foot{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#6f6759;border-top:.4pt solid #cfc6b4;padding-top:3mm}
.pg--ink .foot{color:#8d8577;border-color:#36312a}
.wm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-32deg);font-family:"Cormorant Garamond",serif;font-size:86pt;letter-spacing:.1em;color:rgba(107,90,54,.09);white-space:nowrap;pointer-events:none}
.pg--ink .wm{color:rgba(205,184,146,.07)}
/* cover */
.cover__img{position:absolute;left:0;right:0;top:0;height:128mm;object-fit:cover;width:100%;opacity:.7}
.cover__shade{position:absolute;left:0;right:0;top:0;height:128mm;background:linear-gradient(180deg,rgba(13,12,10,.55),rgba(13,12,10,.1) 40%,#0d0c0a 100%)}
.cover__body{position:relative;margin-top:auto;display:grid;gap:5mm}
.cover h1{font-size:54pt}
.cover__line{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:19pt;color:#cdb892;max-width:120mm;line-height:1.2}
.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm 10mm;border-top:.4pt solid #36312a;padding-top:6mm;margin-top:6mm;font-size:9pt}
.meta span{display:block;color:#8d8577;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;margin-bottom:1mm}
.meta b{font-weight:400}
/* generic */
h2{font-size:31pt;margin:4mm 0 6mm}
.lede{font-size:12pt;max-width:150mm;color:#4a4439}
table{width:100%;border-collapse:collapse;font-size:10.6pt}
table.tight{font-size:9.2pt}table.tight th,table.tight td{padding:1.9mm 0}
th,td{text-align:left;vertical-align:top;padding:3.6mm 0;border-top:.4pt solid #cfc6b4}
tr:last-child th,tr:last-child td{border-bottom:.4pt solid #cfc6b4}
th{width:31%;font-weight:400;color:#4a4439;padding-right:4mm}
td{font-weight:400;padding-right:4mm}
td b{font-weight:500}
td.src{width:27%;font-size:8.2pt;color:#6f6759;font-weight:300;padding-right:0}
.pend{color:#8a6a2f;font-style:italic;font-family:"Cormorant Garamond",serif;font-size:11.5pt}
.legend{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;margin-top:6mm}
.legend div{border-top:1pt solid #14120f;padding-top:3mm;font-size:9pt;color:#4a4439}
.legend b{display:block;font-family:"Cormorant Garamond",serif;font-weight:400;font-size:14pt;color:#14120f;margin-bottom:1mm}
/* contents */
.toc{display:grid;gap:5.5mm;margin-top:2mm}
.toc h3{font-size:16pt;font-weight:400;margin-bottom:1.5mm}
.toc ol{margin:0;padding:0;list-style:none}
.toc li{display:grid;grid-template-columns:8mm 1fr auto 9mm;gap:3mm;align-items:baseline;padding:1.3mm 0;border-top:.3pt solid #dcd4c4;font-size:9.4pt}
.toc li i{font-style:normal;color:#6b5a36;font-weight:500}
.toc li em{font-style:normal;font-size:7pt;letter-spacing:.14em;text-transform:uppercase}
.toc li u{text-decoration:none;text-align:right;color:#6f6759}
.ok{color:#2f5d3a}.part{color:#6b5a36}.pendc{color:#8a6a2f}
/* question page */
.qhead{display:flex;justify-content:space-between;align-items:baseline}
.q{font-size:38pt;margin:7mm 0 9mm;max-width:160mm}
.short{background:#f0e9da;border-left:1.6pt solid #6b5a36;padding:4mm 5mm;display:grid;gap:1mm;margin-bottom:6mm}
.short b{font-family:"Cormorant Garamond",serif;font-weight:400;font-size:19pt;line-height:1.15}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-top:11mm}
.cols h3,.box h3{font-family:"Jost",sans-serif;font-size:7.6pt;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:#6b5a36;margin-bottom:2.5mm}
.cols p,.box p{margin:0;color:#3a3428;font-size:11.4pt;line-height:1.5}
.cols ul{margin:0;padding:0;list-style:none}
.cols li{padding:2.4mm 0 2.4mm 5mm;position:relative;font-size:11.4pt;color:#3a3428;border-top:.3pt solid #dcd4c4}
.cols li::before{content:"";position:absolute;left:0;top:5.6mm;width:2.4mm;height:.5pt;background:#6b5a36}
.box{margin-top:auto;margin-bottom:8mm;border-top:.4pt solid #cfc6b4;padding-top:4mm}
.sum td:last-child,.sum th:last-child{text-align:right;width:28%}
.sum tr.total td,.sum tr.total th{font-family:"Cormorant Garamond",serif;font-size:17pt;font-weight:400;border-top:1pt solid #14120f;color:#14120f}
.small{font-size:8pt;color:#6f6759;margin-top:3mm}
/* closing */
.check{columns:2;column-gap:10mm;margin:0;padding:0;list-style:none}
.check li{break-inside:avoid;padding:2.2mm 0 2.2mm 7mm;position:relative;border-top:.3pt solid #dcd4c4;font-size:9.8pt}
.check li::before{content:"";position:absolute;left:0;top:3.2mm;width:3.2mm;height:3.2mm;border:.6pt solid #14120f}
.sign{display:grid;grid-template-columns:1fr 34mm;gap:10mm;align-items:end;margin-top:auto;margin-bottom:8mm;border-top:.4pt solid #cfc6b4;padding-top:6mm}
.sign__line{height:16mm;border-bottom:.6pt solid #14120f;margin-bottom:2mm}
.sign img{width:30mm;height:30mm}
.notes{min-height:54mm;border:.4pt solid #cfc6b4;padding:5mm;font-family:"Cormorant Garamond",serif;font-size:13pt;font-style:italic;color:#4a4439}
`;

const wm = SPECIMEN ? `<div class="wm">SPECIMEN</div>` : "";
let pageNo = 0;
const foot = () => `<div class="foot"><span>${esc(P.name)} · ${reportNo}</span><span>${SPECIMEN ? "Specimen · not for sale · " : ""}Page ${++pageNo}</span></div>`;
const page = (body, cls = "") => `<section class="pg ${cls}">${wm}${body}${foot()}</section>`;

const pages = [];
pages.push(page(`
  ${coverImg ? `<img class="cover__img" src="${coverImg}" alt=""><div class="cover__shade"></div>` : ""}
  <div class="cover cover__body">
    <p class="cap">Property Intelligence Report</p>
    <h1>${esc(P.name)}</h1>
    <p style="margin:0;color:#bcb4a5;font-size:12pt">${esc(P.loc)}</p>
    <p class="cover__line">${TOTAL} questions a careful buyer asks, each answered from the record.</p>
    <div class="meta">
      <div><span>Prepared for</span><b>${esc(buyer || (SPECIMEN ? "Specimen copy" : "—"))}</b></div>
      <div><span>Report no. and date</span><b>${reportNo} · ${today}</b></div>
      <div><span>Reviewed and signed by</span><b>Rohitt Kumar Singh, Managing Director</b></div>
      <div><span>${SELLER}</span><b>Karnataka RERA agent ${AGENT}</b></div>
    </div>
  </div>`, "pg--ink"));

const glance = [["Developer", pub(P.devFull || P.dev)], ["Property type", pub(P.kind)], ["Location", pub(P.loc)], ["Configurations", pub(P.config)], ["Sizes", pub(P.sizes)], ["Land area", pub(P.land)], ["Status", pub(P.status)], ["Possession", pub(P.poss)], ["Starting price", pub(P.price)], ["RERA number listed", reraNo]].filter(([, f]) => f);
pages.push(page(`
  <p class="cap">How to read this report</p>
  <h2>One question to a page. Every answer shows where it came from.</h2>
  <p class="lede">This report does not tell you to buy or not to buy, and it does not predict prices. It sets out what is on the public record and in the developer's own published material for this one property, so that you and your lawyer can decide.</p>
  <div class="legend">
    <div><b>From the record</b>Read by us from the named official source, on the date shown.</div>
    <div><b>Published material</b>Stated by the developer and listed by 100 Yards. Not independently verified.</div>
    <div><b>Pending official pull</b>Not yet obtained. Never estimated. Completed when the report is commissioned.</div>
  </div>
  <p class="cap" style="margin-top:8mm">The property at a glance</p>
  <table class="tight" style="margin-top:3mm">${glance.map(([l, f]) => `<tr><th>${esc(l)}</th><td>${f.v}</td><td class="src">${f.src}</td></tr>`).join("")}</table>`));

const groups = [...new Set(QUESTIONS.map((q) => q.group))];
const firstQPage = 4;
pages.push(page(`
  <p class="cap">The questions</p>
  <h2>${TOTAL} questions for ${KIND === "plot" ? "a plot" : KIND === "villa" ? "a villa" : "an apartment"} at ${esc(P.name)}.</h2>
  <div class="toc">${groups.map((g) => `<div><h3>${esc(g)}</h3><ol>${QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.group === g).map(({ q, i }) => { const [label, cls] = status(q); return `<li><i>${String(i + 1).padStart(2, "0")}</i><span>${esc(q.q)}</span><em class="${cls === "pend" ? "pendc" : cls}">${label}</em><u>${firstQPage + i}</u></li>`; }).join("")}</ol></div>`).join("")}</div>
  <p class="small">The last section of questions is chosen for the property type. A plot, a villa and an apartment are asked different things.</p>`));

QUESTIONS.forEach((q, i) => {
  const [label, cls] = status(q);
  let body;
  if (q.cost) {
    body = cost ? `
      <div class="short"><span class="cap">Short answer</span><b>About ${inr(cost.total - cost.price)} on top of a ${inr(cost.price)} price, before interiors, loan costs and deposits.</b></div>
      <table class="sum">
        <tr><th>Published starting price</th><td class="src">Developer's published material</td><td>${inr(cost.price)}</td></tr>
        <tr><th>Stamp duty</th><td class="src">${esc(cost.slab[2])}</td><td>${inr(cost.duty)}</td></tr>
        <tr><th>Cess</th><td class="src">10% of the stamp duty amount</td><td>${inr(cost.cess)}</td></tr>
        <tr><th>Surcharge</th><td class="src">2% of duty (urban). Rural areas: 3%</td><td>${inr(cost.sur)}</td></tr>
        <tr><th>Registration charge</th><td class="src">2% of the value</td><td>${inr(cost.reg)}</td></tr>
        <tr><th>GST</th><td class="src">${cost.underConstruction ? "5% on an under-construction home; 1% if it qualifies as affordable; none once the occupancy certificate is issued" : "None on a completed home with an occupancy certificate"}</td><td>${inr(cost.gst)}</td></tr>
        <tr class="total"><th>Illustrative total</th><td></td><td>${inr(cost.total)}</td></tr>
      </table>
      <p class="small">Worked on the published starting price, which is not a quotation. Duty is charged on the higher of the sale value or the guidance value. ${esc(RATES.source)}. ${esc(RATES.gstSource)}. ${esc(RATES.asOf)}. A commissioned report reworks this page on your actual quoted price.</p>` : `
      <div class="short"><span class="cap">Short answer</span><b>This page is worked out on your quoted price.</b></div>
      <table>${RATES.slabs.map(([, , l]) => `<tr><th>Stamp duty</th><td>${esc(l)}</td><td class="src">${esc(RATES.source)}</td></tr>`).join("")}
        <tr><th>Cess</th><td>10% of the stamp duty amount</td><td class="src">${esc(RATES.source)}</td></tr>
        <tr><th>Surcharge</th><td>2% of duty (urban) · 3% (rural)</td><td class="src">${esc(RATES.source)}</td></tr>
        <tr><th>Registration</th><td>2% of the value</td><td class="src">${esc(RATES.source)}</td></tr>
        <tr><th>GST</th><td>5% under construction · 1% affordable · none with occupancy certificate</td><td class="src">${esc(RATES.gstSource)}</td></tr></table>
      <p class="small">No starting price is published for this project, so no total is shown. ${esc(RATES.asOf)}.</p>`;
  } else {
    const n = answered(q);
    const short = n === 0 ? "Not yet on file. This is pulled from the official source when the report is commissioned."
      : n === q.rows.length ? (cls === "ok" ? "Answered from the official record below." : "Answered from the developer's published material. The official check is still to be done.")
      : "Partly answered. The lines marked pending are pulled when the report is commissioned.";
    body = `<div class="short"><span class="cap">Short answer</span><b>${short}</b></div>
      <table>${q.rows.map(([l, f, s]) => row(l, f, s || "Official source")).join("")}</table>`;
  }
  pages.push(page(`
    <div class="qhead"><p class="cap">${esc(q.group)}</p><p class="cap ${cls === "pend" ? "pendc" : cls}">Question ${i + 1} of ${TOTAL} · ${label}</p></div>
    <h2 class="q">${esc(q.q)}</h2>
    ${body}
    <div class="cols">
      <div><h3>Why it matters</h3><p>${esc(q.why)}</p></div>
      <div><h3>Ask the builder</h3><ul>${q.ask.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
    </div>
    <div class="box"><h3>Check it yourself</h3><p>${esc(q.check)}</p></div>`));
});

const visit = {
  apartment: ["See the actual tower and floor, not only the model flat", "Stand in the unit at the time of day you are usually home", "Check the view against what the neighbouring plot may become", "Count lifts per tower and homes per floor", "Ask where water comes from, and the backup", "Walk the route to the main road and the nearest metro or bus", "Photograph the stage of construction, with the date", "Ask to see the sanctioned plan on site"],
  villa: ["Walk the boundary of the exact villa plot", "Check road width and turning space in front", "Ask what will be built on adjoining plots", "Look at drainage and slope after rain if you can", "Check water source and power backup for the villa", "Ask which finishes in the show villa are standard", "Photograph the stage of construction, with the date", "Ask to see the sanctioned plan on site"],
  plot: ["Find the boundary stones of the exact plot", "Measure the plot and the road in front of it", "Check the level of the plot against the road", "Ask which plots around it are sold, and to whom", "Look for water, power and drainage lines actually laid", "Ask where the park and civic amenity sites are on the plan", "Photograph the plot and the approach road, with the date", "Ask to see the sanctioned layout plan on site"],
}[KIND];
pages.push(page(`
  <p class="cap">On the day</p>
  <h2>Your site-visit checklist for ${esc(P.name)}.</h2>
  <p class="lede">Take this page with you. Tick each line on site and write what you saw.</p>
  <ul class="check" style="margin-top:8mm">${visit.map((v) => `<li>${esc(v)}</li>`).join("")}</ul>
  <p class="cap" style="margin-top:10mm">Papers to carry home</p>
  <ul class="check" style="margin-top:3mm">${["Draft agreement for sale", "Full cost sheet with every charge", "Sanctioned plan and approvals", "Payment schedule", "List of approved lenders", "Specification and amenities annexure"].map((v) => `<li>${esc(v)}</li>`).join("")}</ul>`));

pages.push(page(`
  <p class="cap">Review</p>
  <h2>Reviewer's notes and signature.</h2>
  <div class="notes">${O.reviewNotes ? esc(O.reviewNotes) : "Written by the reviewer for each commissioned report, after the official pulls are complete."}</div>
  <p class="cap" style="margin-top:9mm">What this report is, and is not</p>
  <p style="margin:3mm 0 0;font-size:9.4pt;color:#3a3428">It is a reading of public records and published material for one property on the dates shown. It is not legal, tax or investment advice, not a valuation, and not a recommendation to buy or to avoid. Records change; verify against the official source before any payment, and take independent legal advice before you sign. ${SELLER} is a Karnataka RERA registered agent (${AGENT}) and may earn a fee from the developer if you buy through it.</p>
  <p class="cap" style="margin-top:8mm">Sources used</p>
  <p style="margin:3mm 0 0;font-size:9.4pt;color:#3a3428">Karnataka RERA register (rera.karnataka.gov.in) · Kaveri, Department of Stamps and Registration (guidance values, encumbrance certificates) · MCA company master data · eCourts · RBI House Price Index · the developer's published material as listed by 100 Yards.</p>
  <div class="sign">
    <div><div class="sign__line"></div><b style="font-weight:400">Rohitt Kumar Singh</b><br><span style="font-size:8.6pt;color:#6f6759">Managing Director, ${SELLER}${SPECIMEN ? " · unsigned specimen" : ""}</span></div>
    <div><img src="${qr}" alt="QR code to rera.karnataka.gov.in"><div style="font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#6f6759;margin-top:1.5mm">Official register</div></div>
  </div>`));

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(P.name)} — Property Intelligence Report</title><style>${css}</style></head><body>${pages.join("")}</body></html>`;
const outDir = path.join(ROOT, "scripts/report/out");
mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `${slug}-questions${SPECIMEN ? "-specimen" : ""}`);
writeFileSync(`${base}.html`, html);

const { chromium } = await import("playwright");
const exeCandidates = ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", "/opt/pw-browsers/chromium"];
const exe = exeCandidates.find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const tab = await browser.newPage();
await tab.goto(`file://${base}.html`, { waitUntil: "networkidle" });
await tab.pdf({ path: `${base}.pdf`, format: "A4", printBackground: true });
await browser.close();
console.log(`${pages.length} pages · ${KIND} question set · ${base}.pdf`);
if (SPECIMEN) {
  const pub2 = path.join(ROOT, "public/reports", `${slug}-specimen.pdf`);
  mkdirSync(path.dirname(pub2), { recursive: true });
  copyFileSync(`${base}.pdf`, pub2);
  console.log("published specimen:", pub2);
}
