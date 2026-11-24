# CLAUDE.md — 100 Yards site

The company site for **100 Yards (Hundred Yards Realtor Pvt Ltd)**, replacing the WordPress
site at 100yards.in. Company first; **Rohitt Kumar Singh** (MD, two t's) is the founder and
the person who signs reports. Three jobs: sell property (catalogue + lead forms), sell the
₹1,000 Property Intelligence Report, and teach (the Academy: course, Property Lab, Datalab).
The course is still pre-launch — no course price or payment.

## The 100 Yards layer (Nov 2026)

- **Catalogue**: `app/lib/catalog/*.json` — 134 projects, 59 guide cards, 11 reviews, 21 logos,
  gallery — extracted from the owner-supplied single-file HTML export of 100yards.in. Photos
  are pre-sized WebP in `public/p/<slug>/`, served as plain `<img>` (no image-transform quota).
  Regenerate from a new export; never hand-edit the JSON. `app/lib/company.ts` holds every
  company fact (phones, address, RERA agent no., report price, nav, ad-tag IDs).
- **Routes**: `/projects` (+`/[slug]`), `/areas` (+`/[slug]`), `/builders` (+`/[slug]`),
  `/reports`, `/about` (company), `/rohitt` (the old About), `/learn`, `/blog`, `/gallery`,
  `/commercial`, `/nri`, `/contact`, `/desk` (private). `app/[legacy]/page.tsx` permanently
  redirects old WordPress addresses (`/<project-slug>/` → `/projects/<slug>`).
- **Prices** on catalogue pages are the builders' published starting figures and always say so.
  The Datalab rule is unchanged: NO rupee figures there.
- **Leads**: every form is `LeadForm` (`kind` = project | visit | snapshot | report | nri |
  commercial | callback) → `POST /api/lead` → D1 table `leads` (migration `0002_leads.sql`),
  with campaign tags / gclid / fbclid and a 0–100 intent score. `/desk` + `/api/desk` are the
  team's lead page, locked by the Worker secret `DESK_KEY` (closed when unset). The node test
  suite cannot load `cloudflare:workers` routes — test them with
  `wrangler dev --local --config dist/server/wrangler.json` after copying `migrations/` into
  `dist/server/` and applying them with `wrangler d1 migrations apply ACADEMY_DB --local`.
- **Reports**: ₹1,000. No online payment yet — the order form saves a lead and the team sends a
  payment link on WhatsApp. Do not add a checkout without the owner's Razorpay keys.
- **The world (Nov 2026 redesign, owner-approved direction "the last hundred yards")**: warm
  black `#0d0c0a`, bone `#ede7db`, a thread of champagne `#cdb892`. Cormorant Garamond (light,
  display) + Jost (light, text), both SELF-HOSTED in `public/fonts` with `@font-face` in
  `tokens.css` — no `next/font`, no Google request, so sandbox screenshots match production.
  The token is still named `--navy` for history; it is the one ink. Never bring back navy/gold
  blocks, Manrope or Playfair. `styles/film.css` loads last and holds the scale and the scenes.
- **Theme and promise**: the name is the idea — 100 Yards walks the buyer through the last
  stretch (brief, shortlist, visit, record, terms, keys). The three assurances and six journey
  steps live in `app/lib/company.ts`; they are promises the firm must keep, so change their
  wording only with the MD's sign-off.
- **Motion beyond MotionLayer** (deliberate exceptions, each self-contained and each with a
  no-JS / mobile / reduced-motion layout that hides nothing):
  `OpeningSequence.tsx` — first-visit count to 100 then a parting curtain, pure CSS, ~4s, skipped
  for returning visitors, reduced motion, Save-Data and ad traffic (utm_/gclid/fbclid);
  MotionLayer holds the hero entrance while it plays.
  `film/HundredYards.tsx` — THE homepage signature: pinned, counter 0→100, six stages, images
  wipe in. `film/ResidenceReel.tsx` — pinned sideways reel (native scroller on touch).
  Both use `refreshPriority` so later ScrollTriggers measure correctly; keep that.
  The record pages fan open with CSS on `data-reveal`. Rotation is allowed there and nowhere else.
- **Question-based report**: `node scripts/report/make-question-report.mjs <catalogue-slug>
  [--specimen] [--for "Buyer"]` prints a 23-page A4 PDF: cover, how-to-read, contents, 18
  questions (one per page), site-visit checklist, review + signature. Questions 13–14 change
  with the property type (apartment / plot / villa). Facts come from
  `scripts/report/orders/<slug>.json` (official pulls), else the catalogue ("published
  material"), else print "Pending official pull" — never invented. The cost page mirrors
  `labData.ts` rates. `--specimen` watermarks and copies to `public/reports/<slug>-specimen.pdf`.
  The older `make-report.mjs` (datalab register, 10-page) is superseded but kept.
- **Before the domain switches**: the 59 guide bodies still live on WordPress. Export them and
  build `/blog/[slug]` first, or those rankings are lost (today the cards link out and old
  post addresses redirect to `/blog`).

## Stack

- React 19 + **vinext** (Next-style App Router in `app/`) — not Next.js itself
- Hand-written CSS in `app/styles/` (no Tailwind — it was removed deliberately)
- GSAP + ScrollTrigger, loaded only where motion actually needs it
- Cloudflare Worker `rohit-property-studio`; D1 `ACADEMY_DB` (leads),
  Analytics Engine `ACADEMY_ANALYTICS`, Cloudflare Images binding
- Repo `adyantdubey/RohittPropertyStudio`; push to `main` auto-builds and deploys

## Commands

```bash
npm run dev        # local dev
npm run build      # must pass before any commit
npm run lint       # must pass before any commit
npm test           # builds, then asserts the server-rendered HTML
```

**Claude does not deploy.** Push to `main` and Cloudflare does it.

**The Windows `node_modules` cannot build inside the Linux device bridge.** Build in the
cloud sandbox instead: tar the source (excluding `node_modules`, `dist`, `.git`, `.next`,
`.wrangler`, `.vinext/dev`), `npm install`, `npm run build`, serve with
`npx vinext start --port 4321`, and screenshot with Playwright. Copy `.vinext/fonts` across
too — the sandbox cannot reach Google Fonts, so without that cache the screenshots render
in fallback faces and every measurement is wrong.

## Stylesheet architecture

Load order matters; `app/layout.tsx` imports them in this order:

| File | Holds |
| --- | --- |
| `styles/tokens.css` | every colour, type step, space step, motion curve, and the `.surface-*` contracts |
| `styles/base.css` | reset, typography, `.button`, `.eyebrow`, `.text-link`, reveal defaults |
| `styles/components.css` | header, footer, cards, gallery, marquee, tools, forms |
| `styles/home.css` | the homepage acts |
| `styles/pages.css` | page hero and the inner-page blocks |

**ONE navy.** `--navy: #0b1736` (deep luxury blue; the owner rejected black, Nov 2026) is the only dark ground; gold is `--gold: #d4ae62` and headlines take `--head` (gold on navy, navy on the ivory and gold bands); `--deep/--carbon/--carbon-2/--carbon-3`
are aliases of it and must stay that way — depth comes from hairlines and type, never shades.
At most ONE ivory `surface-light` band per page; the rest stays navy. Numbered markers
(01/02) exist only where order is real: course chapters and journey steps. Roughly half the
content is deliberately un-boxed (top-rule lists, not bordered cards). `.annot` is the human
margin-note voice. The look is CINEMATIC, not sparse (owner direction, Aug 2026): sections
animate in, headlines split, videos play behind the hero/course/contact moments — but always
inside the motion contract below, always navy-tinted, and never with hand-drawn doodle marks
(`.sketch-word`/`.sketch-ring` were tried and rejected; `.u-line` + `data-draw` is the
approved drawn-line treatment).

**Surfaces, not colours.** A section never sets its own background and text colour. It picks
`surface-deep`, `surface-dark`, `surface-raise`, `surface-light` or `surface-gold`, and every
colour inside reads `var(--ink)`, `var(--ink-soft)`, `var(--ink-faint)`, `var(--line)` or
`var(--accent)`. That is what keeps gold legible on both silver and carbon.

**Specificity trap, already paid for once.** A rule like `.some-block p { font-size: … }` also
matches `<p class="eyebrow">` and silently wins, because it is more specific. Every such rule
in this codebase carries `:not(.eyebrow)`. Keep it that way, or give the paragraph its own class.

## Motion contract

`MotionLayer.tsx` is the only place motion is defined. Elements opt in with data attributes:

| Attribute | Effect |
| --- | --- |
| `data-split` | headline words rise out of a mask, once |
| `data-enter` | hero chrome fades up on load |
| `data-reveal` | block fades and lifts on entry (CSS-driven, works without GSAP) |
| `data-count` | number counts up once |
| `data-clip` | media wipes open from the bottom |
| `data-parallax` | media drifts slowly, desktop pointer only |
| `data-scrub-words` | statement words brighten through the scroll |
| `data-reveal-group` | container whose direct children rise in a stagger (CSS-driven) |
| `path[data-draw]` | SVG path draws itself in (used by `.u-line` underlines and charts) |

`splitWords` keeps element children (e.g. the `.u-line` span) intact as one rising unit —
don't flatten a `data-split` headline to plain text. MotionLayer also owns the fixed
`.scroll-progress` gold hairline and the route-change fade on `main`. The ticker marquee and
`.backdrop__video` drift are pure CSS. Rules: 0.4–0.9s, `power2`/`power3` easing. No bounce,
spin, elastic or rotation. Text never parallaxes. One signature move per page — the homepage
has the pinned hundred-yards scene (the corridor map is a quiet sticky list, not a second pin). Everything is skipped
under `prefers-reduced-motion`.

## Media contract

`AmbientBackdrop.tsx` layers, bottom to top: a generated skyline canvas, an optional video, a
brand scrim, and film grain. **The canvas always works, so no page depends on a video file.**
The hero video is LIVE: `public/video/hero.mp4` (city aerial, 1080p, ~6MB) via
`media.heroVideo`. `site.mp4` (construction) plays behind the home offer band via
`SectionVideo` and the course page hero; `keys.mp4` plays behind the contact hero. All three
are re-encoded 1080p H.264, well under Cloudflare's 25MiB asset cap — NEVER commit a raw
4K/90MB source; recipe in `public/video/README.md`. `SectionVideo.tsx` = absolutely
positioned video + navy tint inside a `.section--video` section; it removes itself if the
file is missing or refuses to play.

Video is disabled outright under reduced motion and Save-Data, and pauses off-screen.
Sandbox note: this container's Chromium has no H.264, so local Playwright always exercises
the no-video fallback; verify the film layers with webm stand-ins or on production.

## AI layer (Workers AI)

`wrangler.jsonc` declares `"ai": { "binding": "AI" }`. Workers AI runs on the FREE plan
(~10k neurons/day) — unlike Analytics Engine it needs no account upgrade. Everything is
built to degrade: if the binding is absent, quota is spent, or the model errors,
`/api/ask` returns `{ fallback: true }` and the client answers from the glossary + a
WhatsApp link. The AI is never load-bearing.

- Route: `app/api/ask/route.ts` — model `@cf/meta/llama-3.1-8b-instruct`, streamed SSE,
  answers capped at 320 tokens, per-visitor and per-isolate daily limits in memory.
- The system prompt is generated from `siteContent.ts` (glossary + chapters) and hard-rules
  the model to vocabulary education only: no legal/tax/price/investment advice, no
  project assessments, no invented statistics. Keep those rules if you touch the prompt.
- UI: `app/components/AcademyGuide.tsx`, section `#ask` on /resources. The glossary's
  no-match state hands its query over via the `academy:guide-ask` window event.
- Local `wrangler dev --local` cannot run the model (needs Cloudflare auth) — the route
  falls back, which is itself the test. The streaming path is verified on production.

## Property Lab rules

`/lab` holds five instruments plus the YouTube rail. The contract:

- Statutory rates (stamp duty, registration, cess, surcharge, GST) live ONLY in
  `app/lib/labData.ts` with `source`/`asOf`, and every tool renders them with a verify link.
  When a rate changes in law, that file is the single place to update.
- Everything user-adjustable is a slider with an illustrative default — never present a
  default as "today's rate". No tool judges a deal, predicts a price, or offers advice;
  each carries a boundary note. Keep that when editing copy.
- The Deal Decoder reuses `/api/ask` with `mode: "decode"` — same limits and fallback. Do not
  add a second AI route.
- The AI route tries MODEL CANDIDATES in order (stream, then non-stream) and remembers the
  first that works. `GET /api/ask` is a health check that reports per-model status and exact
  errors — open it on production whenever the AI "rests". Local dev always fails with
  "Binding AI needs to be run remotely"; that is expected, not a bug.
- The money tools are ONE instrument (`OwnershipSimulator.tsx`): true cost + EMI + rent-vs-buy
  in a single panel, all outputs tweened through the `useTweened` rAF hook (zero-duration under
  reduced motion) with catmull-rom smoothed chart curves. Do not split it back into separate
  graph tools.
- Quiz questions in `labData.ts` must stay answerable from the course material alone.
- Showpieces: ConstructionPlan (tower builds with the payment plan), EmiFlow (stacked
  amortisation streams + year scrubber), XrayFlat (isometric area cutaway), JourneyRail
  (pinned 7-step film-strip, same engine as the homepage rail — at most one pinned section
  per page besides it). All share `useTweened`/`smoothPath` from
  `app/components/lab/useTweened.ts`. Watch the `.tool__controls strong { color: var(--accent) }`
  cascade — controls with gold active backgrounds need `color: inherit` on their strong.

## YouTube integration

`/api/videos` fetches the public channel feed (`labData.youtube.feedUrl`), parses it with
regex (no XML parser needed for Atom entries), caches 6h at the edge, and returns
`{videos: []}` on ANY failure — the `YouTubeRail` component then collapses to a plain
channel card, so the site never depends on YouTube. Thumbnails come from i.ytimg.com; the
iframe (youtube-nocookie.com) loads only after a click. The feed cannot be reached from the
dev sandbox — the empty-fallback path IS the local test; the full rail appears on production.

## Market data rules

`app/lib/marketData.ts` feeds the "Market context, source-dated" homepage section.
Every figure carries `source` and `asOf`, and both render. Historical published figures
only — never forecasts, never unsourced numbers. `hpiSeries` stays EMPTY until someone
fills it from RBI's official House Price Index download (rbi.org.in → Statistics); the
self-drawing chart appears automatically once ≥6 quarters exist. The homepage test suite
enforces that any ₹ figure is accompanied by a named source.

## Brand assets

`/brandkit` is an internal, `noindex`, unlinked route holding the artboards for
`public/brand/cover.png`, `og.png` and `hero-poster.jpg`. Regenerate by building, serving, and
screenshotting `#cover`, `#og` and `#poster` from that page. Do not hand-edit the PNGs.

Course slides in `public/course/` are 1600px wide, 256-colour PNGs. Keep them that way — full
colour PNGs of the same slides were three times the size with no visible gain.

## Budgets

LCP under 2.5s on 4G · hero video under 2.5MB · other clips under 1.5MB · Lighthouse mobile
performance 90+, accessibility 100.

## Content honesty rules

This site makes verifiable claims only.

- Every statistic names its source on screen.
- Client reviews are **Hundred Yards property reviews, not course reviews**, and stay labelled
  that way until the course launches and has real learners.
- No income guarantees, no legal, tax or investment advice, no invented testimonials, no price
  until one is decided.

## Do not

- Do not deploy, or touch the Cloudflare account.
- Do not commit secrets — `MISTRAL_API_KEY` and `TURNSTILE_*` live in Worker secrets.
- Do not add a second animation library. GSAP is enough.
- Do not import a CSS file without creating it. That broke the build once.
- Do not add `playwright` to `package.json`. Screenshot tooling belongs in the sandbox, not in
  the Cloudflare build.
- Do not remove the AI fallback paths — the site must sell with the AI completely dead.
- After every rebuild, restart `wrangler dev` before screenshotting: it snapshots the asset
  directory at startup and serves stale hashes otherwise.
- `wrangler dev --local` has a quirk: a lazy `next/image` whose URL is DUPLICATED elsewhere on
  the page may never load locally. `vinext start` renders it correctly and production always
  has — verify image loading with `vinext start`, not wrangler.

## Datalab (phase 6)

`/datalab` is the Bengaluru register explorer: search + zone tabs + top picks + a dossier
overlay, all client-side over `app/lib/datalab/projects.json`. That JSON is REAL data only —
seeded from public K-RERA register summaries (Aug 2026, partial reg numbers marked
`reraComplete:false`) and regenerated by `node scripts/build-seed.mjs` from
`scripts/seed-raw.txt`. Full-register sync: `scripts/collect-rera.mjs` runs on a machine with
open internet (the sandbox cannot reach rera.karnataka.gov.in), saves raw HTML to
scripts/collected/, and may need its parser adapted to the portal's live markup — ask for
page-001.html if it fails. Rules: the Datalab shows NO rupee figures and NO portal listing
data, ever; top picks are the published status+footprint formula; every dossier links to the
official register. When the register grows past ~2k entries, move search behind /api with D1
instead of shipping the JSON to the client. Payments/reports intentionally NOT built yet.

## Report template (phase 6b)

`scripts/report/make-report.mjs <slug> [--specimen]` prints an 8-page A4 "Property
Intelligence Report" PDF from the datalab register entry + an optional
`scripts/report/orders/<slug>.json` of per-order verified facts (see orders/README.md).
Unfilled facts render as "pending official pull" — the generator NEVER invents a value, and
the price page shows only statutory rates (keep in sync with labData.ts). Brand: navy cover,
ivory pages, Playfair/Manrope from .vinext/fonts (style.css files are inlined with paths
rewritten — keep those caches). Specimens are watermarked and marked not-for-sale. Reports
are delivered only after Rohitt reviews and signs. Payment flow intentionally not built yet.

## The story (Nov 2026) — "from the drawing to the keys"

Owner direction: every page tells one story, not just motion. Three beats, in order:
1. **The drawing** (expertise) — `OpeningSequence.tsx` + `styles/opening.css`, "one line, one
   light, one door": one champagne line is drawn ("Every home begins as a line."), it becomes a
   detailed architect's plan, one room fills with warm light, and that room opens as a doorway
   (an animated hole in the overlay's `clip-path`) onto the hero. One slow camera push runs
   under all of it — no cuts, no building (a drawn tower was tried and rejected). CSS-only,
   armed by an inline script before paint, all timings multiples of `--ou`; about 5.5s on
   desktop, about 3s on phones and ad traffic (utm/gclid/fbclid). Plays ONCE PER BROWSER SESSION
   (`sessionStorage hy_opened`), never under reduced motion or Save-Data. `?intro=1` forces it.
   The lit room is centred on the 1600x900 sheet so the doorway hole (`--o-hw/--o-hh`, sized
   from `--s` and `--k`) lands on it at any screen size — keep that if the plan is redrawn.
   MotionLayer reads `window.__hyHold` so the hero headline waits for the door.
2. **The walk** — the hundred-yards counter and the reel on the homepage (unchanged).
3. **The signature** (trust) — `Signature.tsx`: Rohitt's name in Mrs Saint Delafield, written in
   left to right on reveal. It is a styled name, NOT his legal signature: never put it on a
   report PDF or anything a buyer could take for a signed document.
Inner pages stay light but not zero: `AmbientBackdrop` without a video draws a small plan
(`.backdrop__plan`) behind the page title in about a second. Plans are always vector, never images.

## Phones (styles/mobile.css, loaded last)

Owner direction: less scrolling on phones, almost no scroll animation, same story. At <=760px the
long stacks (journey stages, vows, area cards, reviews, learn cards, project gallery, related
projects) become horizontal swipe rows with the next card peeking in; the catalogue list uses
compact row cards; reveals are immediate (no scroll-triggered fades) and MotionLayer only
animates the page's opening headline. Nothing is removed from the HTML. Home went from about
20 phone screens to about 13 — keep new sections inside that budget.

## Enquiry emails (Nov 2026)

Every form posts to `/api/lead` (or `/api/early-access` on the old course form). The enquiry is saved to D1 first and
shows on `/desk`. `app/lib/notify.ts` then emails the team through Resend, AFTER the visitor has their answer
(`waitUntil`). It is off until the Worker secrets `RESEND_API_KEY` and `LEAD_NOTIFY_TO` exist; `LEAD_NOTIFY_FROM` is
optional and needs the domain verified in Resend. Email is never the record and can never fail a form. Do not commit
these values.

## Ad landing pages (`/enquire`)

Where Google and Meta ads send people. `/enquire/<area-slug>` and `/enquire/<project-slug>`
are built from the catalogue by one component (`components/leads/AdLanding.tsx`), plus a
general `/enquire`. Rules:

- No site menu, footer map or floating button there: `SiteHeader` and `StickyCta` return
  nothing on `/enquire*`, the footer is hidden by `body:has(.adpage)`. The page has its own
  slim bar (logo + call) and, on phones, a fixed Call / WhatsApp / Get price bar.
- Form is LeadForm kind `ad`: name, phone, budget, timeline. Phone layout shows two facts,
  then the form; the remaining facts follow below.
- `noindex` with the canonical pointing at the real project/area page. Never add them to the
  sitemap. Do not block them in robots.txt (the ad platforms must be able to read them).
- Same honesty rules: only catalogue facts, the price is labelled "Published starting price",
  no urgency lines ("only 3 left", "offer ends"), no returns claims.
- Tracking IDs live in `tracking` in `lib/company.ts` (`googleTagId`, `googleLeadLabel`,
  optional `googleCallLabel`, `metaPixelId`). Empty = no tags rendered.
- `.adhero` uses `overflow: clip`, not `hidden` — `hidden` breaks the sticky form.

## Text imported from the old site (Nov 2026)

`tools/import-100yards/build.py` reads the raw pages saved by `scripts/collect-100yards.mjs`
(`scripts/collected-100yards/`, git-ignored, 31 MB) and writes three catalogue files:

- `details.json` — per project, the published sections the short record lacks. Rendered by
  `components/catalog/ProjectExtras.tsx` (sections) and as the FAQ accordion + FAQPage JSON-LD.
- `articles.json` — guide bodies, served at `/blog/<slug>`; old `/<slug>/` addresses redirect there.
- `posts.json` — guide list with the ten WordPress theme demo posts removed.

Never hand-edit these; change the rules in build.py and regenerate (README in that folder).
The import copies text as published and only LEAVES THINGS OUT: Investment Potential,
Conclusion/verdict sections, enquiry prompts, placeholders, and any bullet or question about
returns or appreciation. 29 guides about investment or market calls are HELD (title-only on
/blog) until the Managing Director decides — do not import them without that yes.
Old two-part addresses (`/residential-projects/<slug>`, `/upcoming-projects/<slug>`,
`/category/*`, `/tag/*`) redirect permanently. Project photos beyond the first set are still
on the old server; `tools/import-100yards/photos-source.json` lists them.

## Opening sequence: smoothness rule (Nov 2026)

The first-visit opening (`OpeningSequence.tsx` + `styles/opening.css`) stuttered on laptops
because the plan was drawn with `stroke-dashoffset` and the door with an animated `clip-path`:
both repaint the full screen every frame and freeze while the page's scripts load. It was
rebuilt so that ONLY `transform` and `opacity` animate: walls are thin boxes that grow,
furniture/measures/labels are static SVG layers that fade in by group, the sheet is four
panels (`.o-pan`) that slide apart with the lit room painted on the two middle ones. The
hero video and skyline canvas wait for the door (`openingWaitMs` in `AmbientBackdrop.tsx`) and
the grain is paused under the sheet. Keep it that way: no dashoffset, clip-path, filter or
custom-property animation in the opening.

## Logo

`public/brand/logo.png` is the company's own logo (gold house + "100 Yards"), taken from the
original 100yards.in. It is the only brand mark: header, ad pages, footer, and the tab icon
(`app/icon.svg`, the house without the wordmark). Do not replace it with a drawn monogram —
the "100" box was a placeholder and the owner rejected it. Source is 499px wide; ask for the
designer's original if a larger one is ever needed.
