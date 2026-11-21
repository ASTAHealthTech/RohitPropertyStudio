/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, BadgeCheck, ChevronRight, FileText } from "lucide-react";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { ClosingCta } from "./components/ClosingCta";
import { CorridorMap, type Corridor } from "./components/CorridorMap";
import { OpeningSequence } from "./components/OpeningSequence";
import { SectionVideo } from "./components/SectionVideo";
import { ProjectCard } from "./components/catalog/ProjectCard";
import { LeadFormSlot } from "./components/leads/LeadFormSlot";
import { YouTubeRail } from "./components/lab/YouTubeRail";
import { areas, builderLogos, builders, formatLakh, priceRange, projectsInArea, projectsLite, reviews } from "./lib/catalog";
import { company, services, trustValues, whyUs } from "./lib/company";
import datalabRegistry from "./lib/datalab/projects.json";
import { media } from "./lib/siteContent";

export const metadata: Metadata = {
  title: { absolute: "100 Yards | Real estate consultants in Bangalore: projects, prices and property reports" },
  description: `100 Yards (${company.legal}) helps you find, check and buy property in Bangalore. ${projectsLite.length} projects from ${builders.length} builders, RERA numbers on every listing, and signed property reports.`,
  alternates: { canonical: "/" },
};

const reportPages = [
  "Project identification & registration",
  "Record Grade assessment",
  "Promoter profile & track record",
  "Encumbrance & ownership history",
  "Statutory charges & cost framework",
  "Site documentation",
  "Due-diligence checklist",
  "Certification & references",
];

export default function HomePage() {
  const corridors: Corridor[] = areas.filter((a) => a.slug !== "coimbatore").map((area) => {
    const list = projectsInArea(area.slug);
    const range = priceRange(list);
    return {
      slug: area.slug, name: area.name, short: area.short, intro: area.intro, count: list.length,
      from: range ? formatLakh(range.min) : null, x: area.x, y: area.y,
      sample: list.slice(0, 4).map((p) => ({ slug: p.slug, name: p.name })),
    };
  });
  const featured = projectsLite.filter((p) => p.cover && p.priceLakh).slice(0, 6);
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

      {/* ---------- act 1 · the firm ---------- */}
      <section className="hero hero--firm" id="top">
        <AmbientBackdrop video={media.heroVideo} poster={media.heroPoster} />
        <div className="shell hero__inner">
          <div className="hero__copy hero__copy--wide">
            <p className="eyebrow" data-enter>Real estate advisory · {company.cities.join(" · ")}</p>
            <h1 data-split>
              Find the home.{" "}
              <span className="u-line">
                Check
                <svg viewBox="0 0 100 8" aria-hidden="true" preserveAspectRatio="none">
                  <path data-draw d="M2,5.5 C30,3 70,3 98,5.5" />
                </svg>
              </span>{" "}
              the record. Then decide.
            </h1>
            <p className="hero__lede" data-enter>
              100 Yards shortlists, shows and negotiates property across Bangalore, and puts the
              official record of each project in front of you before you pay anyone.
            </p>
            <form className="hero__search" action="/projects" method="get" data-enter>
              <label>
                <span>Area</span>
                <select name="area" defaultValue="">
                  <option value="">Any area</option>
                  {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                </select>
              </label>
              <label>
                <span>Type</span>
                <select name="type" defaultValue="">
                  <option value="">Any type</option>
                  <option>Apartments</option><option>Villas</option><option>Plots</option>
                </select>
              </label>
              <button className="button button--gold" type="submit">Search projects <ArrowUpRight size={16} aria-hidden="true" /></button>
            </form>
            <p className="hero__status" data-enter>
              <BadgeCheck size={15} aria-hidden="true" /> Karnataka RERA registered agent · {company.reraAgent}
            </p>
          </div>
          <a className="scroll-cue" href="#firm" data-enter>Scroll <ArrowDown size={14} aria-hidden="true" /></a>
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

      {/* ---------- builders ticker ---------- */}
      <div className="ticker surface-dark" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((copy) => (
            <div className="ticker__set" key={copy}>
              {builders.slice(0, 12).map((b) => <span key={b.slug}>{b.name}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- act 2 · what we do ---------- */}
      <section className="section surface-dark" id="firm">
        <div className="shell">
          <div className="statement__grid">
            <p className="statement__text" data-scrub-words>
              A property decision gets easier when someone shows you the record, not only the brochure.
            </p>
            <p className="statement__aside annot">how 100 Yards works: shortlist, site visit, the paperwork, then the negotiation</p>
          </div>
          <div className="grid grid--4" data-reveal-group>
            {services.map((service) => (
              <article className="card" key={service.title}>
                <h3>{service.title}</h3>
                <p className="card__body">{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- act 3 · the city (signature move) ---------- */}
      <section className="section surface-dark" id="areas">
        <div className="shell">
          <div className="head">
            <div className="head__main">
              <p className="eyebrow">Explore by area</p>
              <h2 data-split>Where Bangalore is growing.</h2>
            </div>
            <p className="head__note" data-reveal>Five corridors, {projectsLite.length} projects. Scroll the list and watch the map follow.</p>
          </div>
          <CorridorMap corridors={corridors} />
        </div>
      </section>

      {/* ---------- act 4 · the projects ---------- */}
      <section className="section surface-dark" id="projects">
        <div className="shell">
          <div className="head">
            <div className="head__main">
              <p className="eyebrow">Latest projects</p>
              <h2 data-split>Newly added to 100 Yards.</h2>
            </div>
            <a className="text-link" href="/projects">All {projectsLite.length} projects <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <div className="pgrid" data-reveal-group>
            {featured.map((p) => <ProjectCard key={p.slug} project={p} />)}
          </div>
          <p className="annot section-foot">prices are the published starting figures for each project, as listed by 100 Yards</p>
        </div>
      </section>

      {/* ---------- act 5 · the report ---------- */}
      <section className="section section--video surface-deep" id="reports">
        <SectionVideo src="/video/site.mp4" opacity={0.3} />
        <div className="shell pillar__grid">
          <div className="pillar__copy">
            <p className="eyebrow"><FileText size={15} aria-hidden="true" /> Property Intelligence Report</p>
            <h2 data-split>Ten pages of record, before lakhs of commitment.</h2>
            <p>
              For the property you are serious about: its registration record, the builder&apos;s track
              record, the ownership trail and the full cost on top of the quoted price. Every fact
              names its source. Reviewed and signed by {company.md} before it reaches you.
            </p>
            <p className="preport__price"><strong>₹{company.reportPrice.toLocaleString("en-IN")}</strong> per property · free snapshot on every project page</p>
            <div className="hero__actions">
              <a className="button button--gold" href="/reports#order" data-track="report_order_cta">Order a report <ArrowUpRight size={16} aria-hidden="true" /></a>
              <a className="button button--outline" href="/reports/embassy-edge-specimen.pdf" target="_blank" rel="noreferrer" data-track="report_sample_opened">Read the sample</a>
            </div>
          </div>
          <aside className="pillar__spine" data-reveal aria-label="Report contents">
            <p className="pillar__spine-title">The report, page by page</p>
            {reportPages.map((item, index) => (
              <p className="pillar__spine-row" key={item}><span>{String(index + 1).padStart(2, "0")}</span> {item}</p>
            ))}
            <p className="annot">it never says buy or don&apos;t buy. It shows you the record.</p>
          </aside>
        </div>
      </section>

      {/* ---------- act 6 · the person accountable ---------- */}
      <section className="section surface-dark" id="leadership">
        <div className="shell instructor__grid">
          <div className="instructor__portrait" data-clip>
            <div data-parallax="4">
              <Image src="/media/rohit-kumar-singh.jpg" alt={`${company.md}, ${company.mdRole} of ${company.legal}`} width={1764} height={2352} sizes="(max-width: 1000px) 92vw, 36vw" />
            </div>
          </div>
          <div className="instructor__copy">
            <p className="eyebrow">Leadership</p>
            <h2 data-split>{company.md}</h2>
            <p className="instructor__role">{company.mdRole} · {company.legal}</p>
            <p className="instructor__quote">“Most people are not confused by property. They are confused by the words used around it.”</p>
            <p>
              An Electronics &amp; Communication engineer with over a decade in real estate, Rohitt leads
              100 Yards across Bangalore, Coimbatore, Dubai and Phuket. He reviews and signs every
              property report the firm issues.
            </p>
            <div className="instructor__links">
              <a className="text-link" href="/rohitt">Read Rohitt&apos;s profile <ChevronRight size={15} aria-hidden="true" /></a>
              <a className="text-link" href={company.youtube} target="_blank" rel="noreferrer" data-track="youtube_clicked">Watch on YouTube <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- act 7 · proof ---------- */}
      <section className="section surface-deep" id="reviews">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">Client reviews</p><h2 data-split>What 100 Yards clients say.</h2></div>
            <p className="head__note">Reviews from property buyers who worked with the 100 Yards team.</p>
          </div>
          <figure className="pullquote" data-reveal>
            <blockquote>{leadReview.quote}</blockquote>
            <figcaption>{leadReview.name} <span>· 100 Yards client</span></figcaption>
          </figure>
          <div className="review-row" data-reveal-group>
            {otherReviews.slice(0, 3).map((review) => (
              <figure className="review" key={review.name}>
                <blockquote>“{review.quote}”</blockquote>
                <figcaption>{review.name}<span>100 Yards client</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="shell section-foot">
          <a className="text-link" href="/stories">More client stories <ChevronRight size={15} aria-hidden="true" /></a>
        </div>
      </section>

      {/* ---------- act 8 · the builders (the one ivory band) ---------- */}
      <section className="section section--tight surface-light" id="builders">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">Developer partners</p><h2 data-split>The builders we work with.</h2></div>
            <a className="text-link" href="/builders">All {builders.length} builders <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <ul className="logowall" data-reveal-group>
            {builderLogos.map((logo) => (
              <li key={logo.slug}><img src={logo.img} alt={logo.name} loading="lazy" decoding="async" /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- act 9 · why us ---------- */}
      <section className="section surface-dark">
        <div className="shell boundary__grid">
          <div data-reveal>
            <p className="eyebrow">Why 100 Yards</p>
            <h2 data-split>Customer-centric is not a phrase here.</h2>
            <p className="trustline" aria-label="Our values: Transparency, Reliability, Understanding, Service excellence, Timely execution">
              {trustValues.map((v, i) => <span key={i} title={v.title}>{v.letter}</span>)}
            </p>
            <p className="annot">Transparency · Reliability · Understanding · Service excellence · Timely execution</p>
          </div>
          <ul className="whylist" data-reveal-group>
            {whyUs.map((item) => (
              <li key={item.title}><strong>{item.title}</strong><span>{item.copy}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- act 10 · watch ---------- */}
      <section className="section section--tight surface-dark" id="watch">
        <div className="shell">
          <div className="head">
            <div className="head__main"><p className="eyebrow">From the field</p><h2 data-split>Property tours and market answers.</h2></div>
            <p className="head__note">Rohitt walks real Bangalore projects on the 100 Yards channel.</p>
          </div>
          <YouTubeRail limit={3} />
        </div>
      </section>

      {/* ---------- act 11 · learn ---------- */}
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

      {/* ---------- act 12 · the ask ---------- */}
      <section className="section surface-dark" id="callback-section">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Talk to an advisor</p>
            <h2 data-split>Tell us the brief. We shortlist.</h2>
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

      <ClosingCta />
    </main>
  );
}
