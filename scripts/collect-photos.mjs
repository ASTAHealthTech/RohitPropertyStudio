#!/usr/bin/env node
/**
 * Downloads the full-size project photos from the old 100yards.in WordPress.
 *
 * Run on a computer with normal internet (not the Claude sandbox):
 *
 *   node scripts/collect-photos.mjs                 # uses the CDN copies only
 *   node scripts/collect-photos.mjs 162.241.0.0     # also tries the old server by its IP (best)
 *
 * The IP is the old Bluehost server address (Bluehost > Websites > Settings,
 * "IP address"). The domain itself now points at the new site, so the old
 * uploads are only reachable by IP.
 *
 * Saves to scripts/collected-photos/<project>/<n>.<ext> and writes
 * scripts/collected-photos/_report.json. Nothing here is committed to git.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "tools", "import-100yards", "photos-source.json");
const OUT = path.join(ROOT, "scripts", "collected-photos");
const IP = process.argv[2] && /^\d+\.\d+\.\d+\.\d+$/.test(process.argv[2]) ? process.argv[2] : null;
const HOST = "100yards.in";
const CDN = "https://cdn-ilcjoch.nitrocdn.com/KAQAWtHVuizgkdNGIAkAEPjKSAdclXgA/assets/images/optimized/rev-8de271b/";

if (!fs.existsSync(SRC)) { console.error("Cannot find " + SRC + ". Run this from the project folder."); process.exit(1); }
const sources = JSON.parse(fs.readFileSync(SRC, "utf8"));

function get(url, { viaIp = false, redirects = 4 } = {}) {
  return new Promise((resolve) => {
    let u; try { u = new URL(url); } catch { return resolve({ error: "bad url" }); }
    const secure = u.protocol === "https:";
    const options = {
      host: viaIp ? IP : u.hostname, port: secure ? 443 : 80, path: u.pathname + u.search, method: "GET",
      headers: { Host: u.hostname, "User-Agent": "Mozilla/5.0 (100yards photo migration)", Accept: "image/*,*/*" },
      servername: u.hostname, timeout: 30000,
    };
    const req = (secure ? https : http).request(options, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        // Stay on the old server when it only redirects http -> https or adds www.
        const same = new URL(next).hostname.replace(/^www\./, "") === HOST;
        return resolve(get(next, { viaIp: viaIp && same, redirects: redirects - 1 }));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, type: res.headers["content-type"] || "", body: Buffer.concat(chunks) }));
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (e) => resolve({ error: e.message }));
    req.end();
  });
}

/** Width and height from the file header: JPEG, PNG or WebP. */
function size(b) {
  try {
    if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), ext: "png" };
    if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const kind = b.toString("ascii", 12, 16);
      if (kind === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3), ext: "webp" };
      if (kind === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff, ext: "webp" };
      if (kind === "VP8L") { const n = b.readUInt32LE(21); return { w: 1 + (n & 0x3fff), h: 1 + ((n >> 14) & 0x3fff), ext: "webp" }; }
    }
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5), ext: "jpg" };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch { /* fall through */ }
  return null;
}

/** The address on the old server behind a CDN address, and the un-thumbnailed original. */
function candidates(src) {
  const list = [];
  const at = src.indexOf(HOST + "/wp-content/");
  if (at >= 0) {
    const direct = "https://" + src.slice(at);
    const full = direct.replace(/-\d{2,4}x\d{2,4}(\.[a-z]+)$/i, "$1").replace(/-scaled(\.[a-z]+)$/i, "$1");
    if (IP) { if (full !== direct) list.push({ url: full, viaIp: true }); list.push({ url: direct, viaIp: true }); }
  }
  list.push({ url: src, viaIp: false });
  // Photos listed by their old-site address are still held by the image network.
  if (at >= 0 && !src.includes("nitrocdn.com")) list.push({ url: CDN + src.slice(at), viaIp: false });
  return list;
}

fs.mkdirSync(OUT, { recursive: true });
const report = [];
const slugs = Object.keys(sources);
let done = 0, bigger = 0, failed = 0;

for (const slug of slugs) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < sources[slug].length; i++) {
    const src = sources[slug][i].src;
    // Already saved by an earlier run: keep it.
    const had = ["jpg", "png", "webp"].map((e) => path.join(dir, `${i}.${e}`)).find((f) => fs.existsSync(f));
    if (had && !IP) {
      const s = size(fs.readFileSync(had));
      if (s) { done++; if (s.w > 960) bigger++; report.push({ slug, i, ok: true, w: s.w, h: s.h, kb: Math.round(fs.statSync(had).size / 1024), from: "kept" }); process.stdout.write(s.w > 960 ? "+" : "."); continue; }
    }
    let best = null;
    for (const c of candidates(src)) {
      const r = await get(c.url, { viaIp: c.viaIp });
      if (r.error || r.status !== 200 || !r.body?.length) continue;
      const s = size(r.body);
      if (!s) continue;
      if (!best || s.w > best.w) best = { ...s, body: r.body, from: c.viaIp ? "old server" : "cdn", url: c.url };
      if (c.viaIp && s.w >= 1600) break;
    }
    if (!best) { failed++; report.push({ slug, i, src, ok: false }); process.stdout.write("x"); continue; }
    fs.writeFileSync(path.join(dir, `${i}.${best.ext}`), best.body);
    if (best.w > 960) bigger++;
    done++;
    report.push({ slug, i, ok: true, w: best.w, h: best.h, kb: Math.round(best.body.length / 1024), from: best.from });
    process.stdout.write(best.w > 960 ? "+" : ".");
  }
}

fs.writeFileSync(path.join(OUT, "_report.json"), JSON.stringify(report, null, 1));
const widths = report.filter((r) => r.ok).map((r) => r.w).sort((a, b) => a - b);
console.log(`\n\nSaved ${done} photos for ${slugs.length} projects. Failed: ${failed}.`);
console.log(`Wider than 960px (better than what the site has now): ${bigger}`);
if (widths.length) console.log(`Widths: smallest ${widths[0]}, middle ${widths[Math.floor(widths.length / 2)]}, largest ${widths[widths.length - 1]}`);
console.log(IP ? `Old server used: ${IP}` : "No server IP given: only the CDN copies were tried. Re-run with the Bluehost IP for the originals.");
console.log("Folder: scripts/collected-photos  (tell Claude when this finishes)");
