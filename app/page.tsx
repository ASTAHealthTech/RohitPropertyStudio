import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, BadgeCheck, ChevronRight } from "lucide-react";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { CorridorMap, type Corridor } from "./components/CorridorMap";
import { Signature } from "./components/Signature";
import { OpeningSequence } from "./components/OpeningSequence";
import { HundredYards, type YardStage } from "./components/film/HundredYards";
import { ResidenceReel } from "./components/film/ResidenceReel";
import { LeadFormSlot } from "./components/leads/LeadFormSlot";
import { YouTubeRail } from "./components/lab/YouTubeRail";
import { areas, builders, formatLakh, priceRange, projectsInArea, projectsLite, reviews } from "./lib/catalog";
import { assurances, company, journey } from "./lib/company";
import datalabRegistry from "./lib/datalab/projects.json";
import { media } from "./lib/siteContent";

export const metadata: Metadata = {
  title: { absolute: "100 Yards | Real estate consultants in Bangalore: projects, prices and property reports" },
  description: `100 Yards (${company.legal}) walks you through the last stretch of buying a home in Bangalore: shortlist, site visits, the project's record, the terms and registration. ${projectsLite.length} projects from ${builders.length} builders.`,
  alternates: { canonical: "/" },
};

/** Stage imagery: real catalogue projects, named in the caption. */
const stageShots = [
  "sattva-vasanta-sky-devanahalli-bangalore",
  "lt-elara-celestia",
  "assetz-zen-and-sato-yelahanka-bangalore",
  "lodha-beaumont-estate",
  "embassy-greenshore-devanahalli-bangalore",
  "embassy-knowledge-park-villas-north-bangalore",
];
const reelSlugs = [
  "embassy-knowledge-park-villas-north-bangalore",
  "lodha-beaumont-estate",
  "lt-elara-celestia",
  "assetz-zen-and-sato-yelahanka-bangalore",
  "embassy-greenshore-devanahalli-bangalore",
  "century-kindle-yelahanka-bangalore",
  "goyal-co-orchid-salisbury-thanisandra-main-road-bangalore",
  "sattva-vasanta-sky-devanahalli-bangalore",
];

export default function HomePage() {
  const bySlug = new Map(projectsLite.map((p) => [p.slug, p]));
  const stages: YardStage[] = journey.map((step, index) => {
    const project = bySlug.get(stageShots[index]);
    return {
      title: step.title, copy: step.copy,
      img: project?.cover?.src ?? "/brand/hero-poster.jpg",
      alt: project ? `${project.name} by ${project.dev}` : "",
      caption: project ? `${project.name} · ${project.dev}` : "",
    };
  });
  const reel = reelSlugs.map((slug) => bySlug.get(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p?.cover));
  const corridors: Corridor[] = areas.filter((a) => a.slug !== "coimbatore").map((area) => {
    const list = projectsInArea(area.slug);
    const range = priceRange(list);
    return {
      slug: area.slug, name: area.name, short: area.short, intro: area.intro, count: list.length,
      from: range ? formatLakh(range.min) : null, x: area.x, y: area.y,
      sample: list.slice(0, 4).map((p) => ({ slug: p.slug, name: p.name })),
    };
  });
  const stats = [
    { value: projectsLite.length, suffix: "", label: "Residential projects listed", source: "100 Yards catalogue" },
    { value: builders.length, suffix: "", label: "Builders represented", source: "100 Yards catalogue" },
    { value: company.cities.length, suffix: "", label: "Cities served", source: "Company profile" },
    { value: 10, suffix: "+", label: "Years in real estate", source: "MD's biography" },
  ];
  const [leadReview, ...otherReviews] = reviews;

  return (
    <main id="main-content">
      <OpeningSequence />

      {/* ---------- scene 1 · the promise ---------- */}
      <section className="hero hero--film" id="top">
        <AmbientBackdrop video={media.heroVideo} poster={media.heroPoster} />
        <div className="shell hero__inner">
          <div className="hero__copy hero__copy--wide">
            <p className="eyebrow" data-enter>Real estate advisory · {company.cities.join(" · ")}</p>
            <h1 data-split>
              The last hundred yards are where a home is{" "}
              <span className="u-line">
                won.
                <svg viewBox="0 0 100 8" aria-hidden="true" preserveAspectRatio="none">
                  <path data-draw d="M2,5.5 C30,3 70,3 98,5.5" />
                </svg>
              </span>
            </h1>
            <div className="hero__row">
              <p className="hero__lede" data-enter>
                Finding a home takes a weekend. Owning it without regret takes the visits, the
                paperwork, the price and the registration. We walk that stretch with you.
              </p>
              <div className="hero__actions" data-enter>
                <a className="button button--gold" href="#begin" data-track="callback_cta">Begin <ArrowUpRight size={15} aria-hidden="true" /></a>
                <a className="button button--outline" href="/projects">View residences</a>
              </div>
            </div>
            <p className="hero__status" data-enter>
              <BadgeCheck size={15} aria-hidden="true" /> Karnataka RERA registered agent · {company.reraAgent}
            </p>
          </div>
          <a className="scroll-cue" href="#manifesto" data-enter>Scroll <ArrowDown size={14} aria-hidden="true" /></a>
        </div>
        <div className="hero__foot">
          <div className="shell stat-rail__grid" data-reveal>
            {stats.map((stat) => (
              <article className="stat" key={stat.label}>
                <strong className="stat__value"><span data-count={stat.value} data-count-suffix={stat.suffix}>{stat.value}{stat.suffix}</span></strong>
                <span className="stat__label">{stat.label}</span>
                <span className="stat__source">{stat.source}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- scene 2 · what we do ---------- */}
      <section className="section manifesto surface-dark" id="manifesto">
        <div className="shell">
          <p className="eyebrow">What we do</p>
          <p className="manifesto__text" data-scrub-words>
            Anyone can show you a flat. We stay for what comes after: the site visits, the record, the terms, the registration. That last stretch is our name.
          </p>
        </div>
      </section>

      {/* ---------- scene 3 · the hundred yards (signature) ---------- */}
      <HundredYards stages={stages} />

      {/* ---------- scene 4 · what we assure ---------- */}
      <section className="section vows surface-dark" id="assurances">
        <div className="shell">
          <p className="eyebrow">What we assure you</p>
          <div className="vows__list">
            {assurances.map((vow) => (
              <article className="vow" key={vow.key}>
                <span className="vow__key">{vow.key}</span>
                <div>
                  <h2 data-split>{vow.title}</h2>
                  <p data-reveal>{vow.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <figure className="pullquote pullquote--film" data-reveal>
            <blockquote>{leadReview.quote}</blockquote>
            <figcaption>{leadReview.name} <span>· 100 Yards client</span></figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- scene 5 · the residences ---------- */}
      <ResidenceReel projects={reel} total={projectsLite.length} />

      {/* ---------- scene 6 · the city ---------- */}
      <section className="section surface-dark" id="areas">
        <div className="shell">
          <div className="head">
            <div className="head__main">
              <p className="eyebrow">Explore by area</p>
              <h2 data-split>Where Bangalore is growing.</h2>
            </div>
            <p className="head__note" data-reveal>Five corridors, {projectsLite.length} projects. Scroll the list and the map follows.</p>
          </div>
          <CorridorMap corridors={corridors} />
        </div>
      </section>

      {/* ---------- scene 7 · the record (the one bone band) ---------- */}
      <section className="section record surface-light" id="reports">
        <div className="shell record__grid">
          <div className="record__copy">
            <p className="eyebrow">The record</p>
            <h2 data-split>Eighteen questions. Answered before you sign.</h2>
            <p>
              For the home you are serious about, we prepare a Property Intelligence Report written
              as the questions a careful buyer asks. Each answer names its official source and
              date. It never says buy or don&apos;t buy. It shows you what is on file.
            </p>
            <p className="record__price"><strong>₹{company.reportPrice.toLocaleString("en-IN")}</strong><span>per property · reviewed and signed by {company.md}</span></p>
            <div className="hero__actions">
              <a className="button button--gold" href="/reports#order" data-track="report_order_cta">Order a report <ArrowUpRight size={15} aria-hidden="true" /></a>
              <a className="button button--outline" href="/reports/lodha-beaumont-estate-specimen.pdf" target="_blank" rel="noreferrer" data-track="report_sample_opened">Read a sample</a>
            </div>
          </div>
          <div className="record__pages" data-reveal aria-hidden="true">
            <div className="rpage rpage--a"><small>Question 9 of 18</small><b>What do I pay on top of the quoted price?</b><i /><span>Stamp duty, registration, cess, surcharge and GST, worked out on the quoted price, with the rate and source for each line.</span><em>Source: Karnataka Stamps &amp; Registration</em></div>
            <div className="rpage rpage--b"><small>Question 1 of 18</small><b>Is the project registered with RERA, and until when?</b><i /><span>The registration number, promoter on the register, validity date and any extensions, as read from the register.</span><em>Source: K-RERA register</em></div>
            <div className="rpage rpage--cover"><small>Property Intelligence Report</small><b>Lodha Beaumont Estate</b><span>Sadahalli, North Bengaluru</span><span className="rpage__line">18 questions, answered from the official record.</span><em>Signed: {company.md}</em></div>
          </div>
        </div>
      </section>

      {/* ---------- scene 8 · the person who signs ---------- */}
      <section className="section surface-dark" id="leadership">
        <div className="shell instructor__grid">
          <div className="instructor__portrait" data-clip>
            <div data-parallax="4">
              <Image src="/media/rohit-kumar-singh.jpg" alt={`${company.md}, ${company.mdRole} of ${company.legal}`} width={1764} height={2352} sizes="(max-width: 1000px) 92vw, 36vw" />
            </div>
          </div>
          <div className="instructor__copy">
            <p className="eyebrow">The person who signs</p>
            <h2 data-split>{company.md}</h2>
            <p className="instructor__role">{company.mdRole} · {company.legal}</p>
            <p className="instructor__quote">“Most people are not confused by property. They are confused by the words used around it.”</p>
            <p>
              An Electronics &amp; Communication engineer with over a decade in real estate, Rohitt leads
              100 Yards across Bangalore, Coimbatore, Dubai and Phuket, and puts his name on every
              report the firm issues.
            </p>
            <p className="instructor__habit">An engineer&apos;s habit: read the drawing first, then the claim.</p>
            <Signature />
            <div className="instructor__links">
              <a className="text-link" href="/rohitt">Read Rohitt&apos;s profile <ChevronRight size={15} aria-hidden="true" /></a>
              <a className="text-link" href={company.youtube} target="_blank" rel="noreferrer" data-track="youtube_clicked">Watch on YouTube <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- scene 9 · the builders ---------- */}
      <div className="ticker ticker--grand surface-dark" aria-label={`Builders we work with: ${builders.slice(0, 12).map((b) => b.name).join(", ")}`}>
        <div className="ticker__track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div className="ticker__set" key={copy}>
              {builders.slice(0, 12).map((b) => <span key={b.slug}>{b.name}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- scene 10 · proof ---------- */}
      <section className="section surface-dark" id="reviews">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">Client reviews</p><h2 data-split>What 100 Yards clients say.</h2></div>
            <a className="text-link" href="/stories">More client stories <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="review-row review-row--three" data-reveal-group>
            {otherReviews.slice(0, 3).map((review) => (
              <figure className="review" key={review.name}>
                <blockquote>“{review.quote}”</blockquote>
                <figcaption>{review.name}<span>100 Yards client</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- scene 11 · watch + learn ---------- */}
      <section className="section section--tight surface-dark" id="watch">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">From the field</p><h2 data-split>Property tours and market answers.</h2></div>
            <p className="head__note">Rohitt walks real Bangalore projects on the 100 Yards channel.</p>
          </div>
          <YouTubeRail limit={3} />
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">Learn before you buy</p><h2 data-split>Free tools from the 100 Yards Academy.</h2></div>
            <a className="text-link" href="/learn">Everything in Learn <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="grid grid--4" data-reveal-group>
            <a className="card card--link" href="/datalab">
              <span className="card__index">Register explorer</span>
              <h3>Bengaluru Datalab</h3>
              <p className="card__body">{datalabRegistry.projects.length} RERA-registered projects, searchable by name, builder or locality.</p>
              <span className="card__cta">Open the Datalab <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <a className="card card--link" href="/lab">
              <span className="card__index">Simulators</span>
              <h3>Property Lab</h3>
              <p className="card__body">The full cost of a home: stamp duty, EMI, rent versus buy, in one live simulator.</p>
              <span className="card__cta">Enter the Lab <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <a className="card card--link" href="/course">
              <span className="card__index">Course</span>
              <h3>Basics of Real Estate</h3>
              <p className="card__body">A 49-slide visual foundation in the language of property, by {company.md}.</p>
              <span className="card__cta">See the course <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <a className="card card--link" href="/blog">
              <span className="card__index">Guides</span>
              <h3>Buyer guides</h3>
              <p className="card__body">Plain-English explainers on deeds, charges, khata and the paperwork of buying.</p>
              <span className="card__cta">Read the guides <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------- scene 12 · zero yards ---------- */}
      <section className="section begin surface-dark" id="begin">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Zero yards</p>
            <h2 className="begin__title" data-split>Begin your hundred yards.</h2>
            <p className="head__note" data-reveal>Budget, area and timeline are enough to start. One advisor calls you back.</p>
            <dl className="office" data-reveal>
              <div><dt>Office</dt><dd>{company.address}</dd></div>
              <div><dt>Hours</dt><dd>{company.hours}</dd></div>
              <div><dt>India</dt><dd><a href={company.phoneHref}>{company.phoneDisplay}</a></dd></div>
              <div><dt>Dubai</dt><dd><a href={company.dubaiPhoneHref}>{company.dubaiPhoneDisplay}</a></dd></div>
            </dl>
          </div>
          <div data-reveal><LeadFormSlot kind="callback" id="callback" /></div>
        </div>
      </section>

    </main>
  );
}
