#!/usr/bin/env node
/**
 * Saves every page of the current 100yards.in site to scripts/collected-100yards/ as raw HTML,
 * so the new site's catalogue can be rebuilt from the full pages (FAQs, pros and cons, nearby
 * places, connectivity, galleries, guide articles), not from the short export it was first built on.
 *
 * Run it on a computer with normal internet (the build sandbox cannot reach 100yards.in):
 *     node scripts/collect-100yards.mjs
 * It only reads public pages, one at a time with a pause between them, and changes nothing online.
 * Safe to run again: pages already saved are skipped (delete the folder to start over).
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const BASE = (process.env.BASE || "https://100yards.in").replace(/\/$/, "");
const OUT = join(process.cwd(), "scripts", "collected-100yards");
const PAUSE = Number(process.env.PAUSE || 700);
const headers = { "user-agent": "Mozilla/5.0 (compatible; HundredYardsSiteMove/1.0; contact: sales@100yards.in)", accept: "text/html,application/xhtml+xml,application/xml" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const exists = (p) => access(p).then(() => true, () => false);
const fileFor = (url) => (new URL(url).pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9._-]+/gi, "__") || "home") + ".html";

async function get(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(30000) });
      if (res.ok) return { status: res.status, url: res.url, text: await res.text() };
      if (res.status === 404 || res.status === 410) return { status: res.status, url: res.url, text: "" };
      if (i === tries) return { status: res.status, url: res.url, text: "" };
    } catch (e) { if (i === tries) return { status: 0, url, text: "", error: String(e) }; }
    await sleep(1500 * i);
  }
}

/** Every address the old site lists in its own sitemaps (this also finds pages added since the export). */
async function fromSitemaps() {
  const found = new Set(), seen = new Set(), queue = ["/sitemap_index.xml", "/wp-sitemap.xml", "/sitemap.xml"].map((p) => BASE + p);
  while (queue.length) {
    const u = queue.shift(); if (seen.has(u)) continue; seen.add(u);
    const r = await get(u, 2); if (!r.text) continue;
    for (const m of r.text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/g)) {
      const loc = m[1].trim();
      if (/\.xml(\?|$)/i.test(loc)) queue.push(loc); else if (loc.startsWith(BASE) && !/\.(jpe?g|png|webp|gif|pdf|svg|mp4)(\?|$)/i.test(loc)) found.add(loc.replace(/\/?$/, "/"));
    }
    await sleep(300);
  }
  return found;
}

const readJson = async (p) => { try { return JSON.parse(await readFile(p, "utf8")); } catch { return []; } };

const urls = new Map(); // url -> why we want it
for (const u of await fromSitemaps()) urls.set(u, "sitemap");
for (const p of await readJson("app/lib/catalog/projects.json")) if (p.slug) { const u = `${BASE}/${p.slug}/`; if (!urls.has(u)) urls.set(u, "catalogue"); }
for (const p of await readJson("app/lib/catalog/posts.json")) if (p.url || p.slug) { const u = (p.url || `${BASE}/${p.slug}/`).replace(/\/?$/, "/"); if (!urls.has(u)) urls.set(u, "guide"); }
for (const p of ["/", "/about-us/", "/contact-us/", "/blog/", "/gallery/", "/career/", "/residential-projects/"]) if (!urls.has(BASE + p)) urls.set(BASE + p, "core");

await mkdir(OUT, { recursive: true });
console.log(`Found ${urls.size} pages on ${BASE}. Saving to scripts/collected-100yards/ ...`);
const index = []; let n = 0, saved = 0, skipped = 0, failed = 0;
for (const [url, why] of urls) {
  n++; const file = fileFor(url), path = join(OUT, file);
  if (await exists(path)) { skipped++; index.push({ url, file, why, status: "kept" }); continue; }
  const r = await get(url);
  if (r.text) { await writeFile(path, r.text); saved++; index.push({ url, finalUrl: r.url, file, why, status: r.status, bytes: r.text.length }); }
  else { failed++; index.push({ url, file: null, why, status: r.status, error: r.error }); }
  if (n % 10 === 0 || n === urls.size) console.log(`  ${n}/${urls.size}  saved ${saved}, already had ${skipped}, failed ${failed}`);
  await sleep(PAUSE);
}
await writeFile(join(OUT, "_index.json"), JSON.stringify(index, null, 1));
console.log(`\nDone. ${saved} saved, ${skipped} already there, ${failed} failed.`);
if (failed) console.log("Failed pages are listed in scripts/collected-100yards/_index.json (status 404 means the page no longer exists).");
console.log("Next: pack the folder and tell Claude it is ready:\n  tar -czf _claude_transfer/collected-100yards.tgz -C scripts collected-100yards");
