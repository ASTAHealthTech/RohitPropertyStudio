import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the 100 Yards home page without depending on JavaScript", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /100 Yards/);
  assert.match(html, /Rohitt Kumar Singh/);
  // The brand spells it with two t's. This catches any regression to one t.
  assert.doesNotMatch(html, /Rohit(?!t) Kumar Singh/);
  assert.match(html, /The last hundred yards are where a home is/i);
  assert.match(html, /Nothing paid before you have read the record/i);
  assert.match(html, /Begin your hundred yards/i);
  assert.match(html, /u-line/); // the self-drawing gold underline is present
  assert.match(html, /\/video\/hero\.mp4/); // hero film wired
  assert.match(html, /ticker__set/); // marquee track present
  assert.match(html, /PRM\/KA\/RERA\/1251\/310\/AG\/231030\/004229/); // RERA agent registration on screen
  assert.match(html, /Where Bangalore is growing/i);
  assert.match(html, /What 100 Yards clients say/i);
  assert.match(html, /class="opening"/); // first-visit opening is in the markup, hidden until the script arms it
});

test("makes no guarantee or advice claim, and takes no payment on the site", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /Buy now|Proceed to payment|guaranteed (returns|outcome)|assured returns/i);
  assert.match(html, /Every number names its source/i);
});

test("homepage rupee figures are labelled as published listing prices", async () => {
  const html = await (await render()).text();
  assert.match(html, /₹/);
  assert.match(html, /published starting figures/i);
});

test("hero film plays over a canvas fallback that never disappears", async () => {
  const html = await (await render()).text();
  assert.match(html, /class="backdrop"/);
  assert.match(html, /backdrop__canvas/);
  assert.match(html, /<video[^>]*\/video\/hero\.mp4/);
});

test("server-renders every project in the catalogue browser", async () => {
  const response = await render("/projects");
  assert.equal(response.status, 200);
  const html = await response.text();
  const links = new Set(html.match(/href="\/projects\/[a-z0-9-]+"/g) ?? []);
  assert.ok(links.size >= 130, `expected the whole catalogue in the HTML, found ${links.size}`);
});

test("a project page carries its facts, RERA pointer, forms and structured data", async () => {
  const response = await render("/projects/lodha-beaumont-estate");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Lodha Beaumont Estate/);
  assert.match(html, /PRM\/KA\/RERA\/1251\/472\/PR\/200726\/008829/);
  assert.match(html, /rera\.karnataka\.gov\.in/);
  assert.match(html, /RealEstateListing/);
  assert.match(html, /id="enquire-form"/);
  assert.match(html, /id="visit-form"/);
  assert.match(html, /id="snapshot"/);
  assert.match(html, /not legal, tax or investment advice/i);
  assert.equal((await render("/projects/no-such-project")).status, 404);
});

test("area and builder pages render from the catalogue", async () => {
  const area = await render("/areas/devanahalli");
  assert.equal(area.status, 200);
  const areaHtml = await area.text();
  assert.match(areaHtml, /Projects in Devanahalli/i);
  assert.match(areaHtml, /FAQPage/);
  const builder = await render("/builders/prestige-group");
  assert.equal(builder.status, 200);
  assert.match(await builder.text(), /Prestige Group projects/i);
});

test("old 100yards.in project addresses redirect permanently", async () => {
  const response = await render("/lodha-beaumont-estate");
  assert.ok([301, 308].includes(response.status), `status ${response.status}`);
  assert.match(response.headers.get("location") ?? "", /\/projects\/lodha-beaumont-estate$/);
});

// /api/lead and /api/desk import `cloudflare:workers`, which plain Node cannot
// load — they are exercised against `wrangler dev` (see CLAUDE.md, "Leads").
test("the lead desk page is private and unindexed", async () => {
  const desk = await render("/desk");
  assert.equal(desk.status, 200);
  const html = await desk.text();
  assert.match(html, /noindex/);
  assert.match(html, /Team key/i);
});

test("server-renders the Bengaluru Datalab from the register seed", async () => {
  const response = await render("/datalab");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Bengaluru Datalab/i);
  assert.match(html, /RERA register/i);
  assert.match(html, /rera\.karnataka\.gov\.in/);
  // never portal asking-prices: the datalab page carries no rupee figures at all
  assert.doesNotMatch(html, /₹\s?[\d,]+/);
});

test("server-renders the reports page and the homepage pillar", async () => {
  const response = await render("/reports");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Property Intelligence Report/i);
  assert.match(html, /sobha-parq-city-report-preview\.pdf/);
  assert.match(html, /never promises a return/i);
  assert.doesNotMatch(html, /r-7f3c9a1e5b2d4c86/);
  assert.match(html, /₹1,000/);
  assert.match(html, /id="order-form"/);
  assert.match(html, /No money is taken for a request/i);
  const home = await (await render()).text();
  assert.match(home, /Bengaluru Datalab/i);
  assert.match(home, /href="\/reports#order"/);
});

test("server-renders the factual instructor page", async () => {
  const response = await render("/rohitt");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Experience from the field, structured for the classroom/i);
  assert.match(html, /Electronics &amp; Communication/i);
  assert.match(html, /over a decade/i);
  assert.match(html, /Managing Director/i);
});

test("server-renders the company about page", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Hundred Yards Realtor Private Limited/);
  assert.match(html, /Built on T·R·U·S·T/);
  assert.match(html, /Karnataka RERA registered agent/i);
});

test("server-renders the split contact routes", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Our property experts are one step away/i);
  assert.match(html, /id="callback"/);
  assert.match(html, /\+971 55 482 6069/);
  assert.match(html, /sales@100yards\.in/i);
  assert.match(html, /does not create an order or collect payment/i);
});

test("server-renders the course curriculum page", async () => {
  const response = await render("/course");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Four chapters\. One coherent foundation/i);
  assert.match(html, /Learning focus/i);
});

test("server-renders the Property Lab with its instruments", async () => {
  const response = await render("/lab");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Ownership Simulator/i);
  assert.match(html, /Watch your money become a building/i);
  assert.match(html, /EMI Time Machine/i);
  assert.match(html, /Seven doors between shortlisting/i);
  assert.match(html, /X-ray Apartment/i);
  assert.match(html, /Deal Decoder/i);
  assert.match(html, /Property IQ Quiz/i);
  // statutory rates must carry their source and a verify pointer
  assert.match(html, /Stamps (&amp;|&) Registration/i);
  assert.match(html, /Kaveri/i);
});

test("the videos api degrades to an empty list when the feed is unreachable", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `videos-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/videos"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Array.isArray(data.videos));
  assert.match(data.channel, /youtube\.com/);
});

test("returns a helpful not-found response", async () => {
  const response = await render("/this-route-does-not-exist");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /That address is not on our map/i);
  assert.match(html, /Browse projects/i);
});

test("ad landing pages show the facts and the form, with no site menu", async () => {
  const project = await render("/enquire/lodha-beaumont-estate");
  assert.equal(project.status, 200);
  const html = await project.text();
  assert.match(html, /Lodha Beaumont Estate/);
  assert.match(html, /Published starting price/);
  assert.match(html, /id="ad-enquiry"/);
  assert.match(html, /Just your name and number/);
  assert.doesNotMatch(html.slice(html.indexOf("lead-form--ad")), /name="budget"/);
  assert.match(html, /tel:\+919916866667/);
  assert.match(html, /PRM\/KA\/RERA\/1251\/310\/AG\/231030\/004229/);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /class="desktop-nav"/);
  assert.doesNotMatch(html, /guaranteed|assured returns/i);

  const area = await (await render("/enquire/devanahalli")).text();
  assert.match(area, /New homes in Devanahalli/);
  assert.match(area, /\/enquire\/[a-z0-9-]+/);
  assert.equal((await render("/enquire")).status, 200);
  assert.equal((await render("/enquire/no-such-place")).status, 404);
});

test("project pages carry the imported sections, without investment pitches", async () => {
  const html = await (await render("/projects/brigade-wtc-devanahalli")).text();
  assert.match(html, /Nearby Social Infrastructure/);
  assert.match(html, /Stonehill International School/);
  assert.match(html, /Common questions/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /Investment Potential/);
  assert.doesNotMatch(html, /good for investment/i);
  assert.doesNotMatch(html, /wpforms|Paste a YouTube/i);
});

test("guides with imported text open on this site and old addresses follow them", async () => {
  const guide = await render("/blog/ifms-in-real-estate-charges-homebuyers-guide");
  assert.equal(guide.status, 200);
  const html = await guide.text();
  assert.match(html, /Interest-Free Maintenance Security/);
  assert.match(html, /not legal, tax or investment advice/);
  const old = await render("/ifms-in-real-estate-charges-homebuyers-guide");
  assert.ok([301, 308].includes(old.status));
  assert.match(old.headers.get("location") ?? "", /\/blog\/ifms-in-real-estate-charges-homebuyers-guide$/);
  const list = await (await render("/blog")).text();
  assert.doesNotMatch(list, /Monroe County|Dynamics 365|Dairygold/i);
  assert.equal((await render("/blog/no-such-guide")).status, 404);
});

test("old two-part project addresses redirect to the new project page", async () => {
  const old = await render("/residential-projects/summers-at-orchid-nirvana-devanahalli");
  assert.ok([301, 308].includes(old.status));
  assert.match(old.headers.get("location") ?? "", /\/projects\/summers-at-orchid-nirvana-devanahalli$/);
  assert.ok([301, 308].includes((await render("/upcoming-projects/sattva-lumina-2")).status));
  assert.ok([301, 308].includes((await render("/category/blog")).status));
});

test("the report shop sells the twenty newest projects and states its refund policy", async () => {
  const html = await (await render("/reports")).text();
  const shop = html.slice(html.indexOf('id="rc-project"'), html.indexOf("</select>", html.indexOf('id="rc-project"')));
  assert.equal((shop.match(/<option /g) ?? []).length, 21);
  assert.match(shop, /value="sobha-parq-city-hennur"/);
  assert.match(html, /href="\/refund"/);
  assert.match(html, /id="request-form"/);
  const refund = await (await render("/refund")).text();
  assert.match(refund, /Refund and cancellation policy/);
  assert.match(refund, /not been delivered within 48 hours/);
  assert.doesNotMatch(refund, /does not collect payments/);
});
