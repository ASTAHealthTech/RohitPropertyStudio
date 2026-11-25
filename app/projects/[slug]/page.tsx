/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck, Check, ChevronRight, Clock, FileText, MapPin, MessageCircle } from "lucide-react";
import { AmbientBackdrop } from "../../components/AmbientBackdrop";
import { ProjectCard } from "../../components/catalog/ProjectCard";
import { ProjectExtras, faqOf } from "../../components/catalog/ProjectExtras";
import { ProjectGallery } from "../../components/catalog/ProjectGallery";
import { LeadFormSlot } from "../../components/leads/LeadFormSlot";
import { areaBySlug, detailsFor, projectBySlug, projectsInArea } from "../../lib/catalog";
import { company, whatsappLink } from "../../lib/company";
import { photoSet } from "../../lib/catalog/photo";

type Params = { params: Promise<{ slug: string }> };

const clean = (text: string) => text.replace(/\*/g, "").trim();

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const bits = [clean(project.config), project.loc, clean(project.price)].filter(Boolean).join(" · ");
  const title = `${project.name} by ${project.dev}: price, plans, RERA`;
  const description = `${project.name} in ${project.loc}. ${bits}. Floor plans, amenities, travel times and the RERA registration, from 100 Yards.`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title, description, type: "article", images: project.images[0] ? [{ url: project.images[0].src, width: project.images[0].w, height: project.images[0].h }] : undefined },
  };
}

function Table({ rows, caption }: { rows: string[][]; caption: string }) {
  const [head, ...body] = rows;
  return (
    <div className="ptable__wrap">
      <table className="ptable">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
        <tbody>{body.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} data-label={head[j]}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const area = areaBySlug(project.corrSlug);
  const related = projectsInArea(project.corrSlug).filter((p) => p.slug !== project.slug).slice(0, 3);
  const cover = project.images[0];
  const facts = [
    ["Price", clean(project.price)],
    ["Configuration", clean(project.config)],
    ["Sizes", clean(project.sizes)],
    ["Status", clean(project.status)],
    ["Possession", clean(project.poss)],
    ["Land area", clean(project.land)],
  ].filter(([, value]) => value && !/whatsapp|confirm with/i.test(value));
  const snapshot = (project.snap ?? []).slice(1).filter((row) => row.length === 2 && !/whatsapp/i.test(row[1]) && !/^destination$/i.test(row[0]) && !/minutes?$/i.test(row[1]));

  const extras = detailsFor(project.slug);
  const faq = faqOf(extras);

  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: project.name,
      description: project.about[0] ?? `${project.name} in ${project.loc}`,
      url: `/projects/${project.slug}`,
      image: project.images.map((i) => i.src),
      ...(project.priceLakh ? { offers: { "@type": "Offer", priceCurrency: "INR", price: Math.round(project.priceLakh * 100000), availability: "https://schema.org/InStock" } } : {}),
      provider: { "@type": "RealEstateAgent", name: company.name, telephone: company.phoneDisplay },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Projects", item: "/projects" },
        ...(area ? [{ "@type": "ListItem", position: 2, name: area.name, item: `/areas/${area.slug}` }] : []),
        { "@type": "ListItem", position: area ? 3 : 2, name: project.name, item: `/projects/${project.slug}` },
      ],
    },
    ...(faq.length ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    }] : []),
  ]).replace(/</g, "\\u003c");

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* ---- hero ---- */}
      <section className="page-hero phero">
        <AmbientBackdrop />
        <div className="shell">
          <nav className="crumbs" aria-label="Breadcrumb" data-enter>
            <a href="/projects">Projects</a>
            {area && <><ChevronRight size={13} aria-hidden="true" /><a href={`/areas/${area.slug}`}>{area.name}</a></>}
            <ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{project.name}</span>
          </nav>
          <div className="phero__grid">
            <div className="page-hero__copy">
              <p className="eyebrow" data-enter>
                <a href={`/builders/${project.devSlug}`}>{project.dev}</a> · {project.kind}
              </p>
              <h1 data-split>{project.name}</h1>
              <p className="phero__loc" data-enter><MapPin size={17} aria-hidden="true" /> {project.loc}</p>
              <div className="page-hero__actions" data-enter>
                <a className="button button--gold" href="#enquire" data-track="project_enquire_cta">Get price &amp; plans <ArrowUpRight size={16} aria-hidden="true" /></a>
                <a className="button button--outline" href="#visit" data-track="project_visit_cta">Book a site visit</a>
                <a className="text-link" href={whatsappLink(`Hi, I would like details of ${project.name}.`)} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">
                  <MessageCircle size={15} aria-hidden="true" /> WhatsApp us
                </a>
              </div>
            </div>
            {cover && (
              <figure className="phero__media" data-enter>
                <span className="frame frame--corner">
                  <img src={cover.src} {...photoSet(cover, "(max-width: 1000px) 92vw, 48vw")} alt={`${project.name} by ${project.dev}`} width={cover.w} height={cover.h} fetchPriority="high" />
                </span>
              </figure>
            )}
          </div>
          <dl className="pfacts" data-reveal-group>
            {facts.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- the record ---- */}
      <section className="section section--tight surface-dark">
        <div className="shell precord">
          <div className="precord__rera" data-reveal>
            <p className="eyebrow"><BadgeCheck size={15} aria-hidden="true" /> Registration</p>
            {project.rera ? (
              <>
                <p className="precord__num">{project.rera}</p>
                <p>This is the Karnataka RERA registration number listed for the project. Check it yourself on the official register before you decide.</p>
              </>
            ) : (
              <p>The RERA registration number for this project is not on our listing yet. Ask us for it, and check it on the official register before you decide.</p>
            )}
            <a className="text-link" href={company.reraVerifyUrl} target="_blank" rel="noreferrer">Verify on rera.karnataka.gov.in <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="precord__about">
            <p className="eyebrow">About the project</p>
            <h2 data-split>What {project.name} is.</h2>
            <div className="prose" data-reveal>
              {project.about.map((para) => <p key={para.slice(0, 40)}>{para}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* ---- photos ---- */}
      {project.images.length > 1 && (
        <section className="section section--tight surface-dark" id="photos">
          <div className="shell">
            <div className="head">
              <div className="head__main"><p className="eyebrow">Gallery</p><h2 data-split>Photos and plans.</h2></div>
              <p className="head__note" data-reveal>Images as published by the developer. Artist impressions may differ from the finished project.</p>
            </div>
            <ProjectGallery images={project.images} name={project.name} />
          </div>
        </section>
      )}

      {/* ---- price and plans ---- */}
      {(project.pt || project.ct) && (
        <section className="section section--tight surface-dark" id="pricing">
          <div className="shell">
            <div className="head">
              <div className="head__main"><p className="eyebrow">Price &amp; configurations</p><h2 data-split>What is on offer.</h2></div>
              <p className="head__note" data-reveal>
                Indicative figures as published for the project. Prices change by tower, floor and date; ask us for today&apos;s price sheet.
              </p>
            </div>
            {project.pt && <div data-reveal><Table rows={project.pt} caption={`${project.name} price table`} /></div>}
            {project.ct && <div data-reveal><Table rows={project.ct} caption={`${project.name} configuration table`} /></div>}
            <p className="annot">Stamp duty, registration and GST are extra. <a href="/lab">Work out the full cost in the Property Lab</a>.</p>
          </div>
        </section>
      )}

      {/* ---- details: the one ivory band ---- */}
      {snapshot.length > 0 && (
        <section className="section surface-light" id="details">
          <div className="shell">
            <div className="head">
              <div className="head__main"><p className="eyebrow">Project details</p><h2 data-split>The facts, in one place.</h2></div>
            </div>
            <dl className="pdetails" data-reveal>
              {snapshot.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ---- amenities + travel ---- */}
      {(project.am.length > 0 || project.la.length > 0) && (
        <section className="section surface-dark" id="amenities">
          <div className="shell pliving">
            {project.am.length > 0 && (
              <div>
                <p className="eyebrow">Amenities</p>
                <h2 data-split>Inside the gates.</h2>
                <ul className="pamen" data-reveal-group>
                  {project.am.map((item) => <li key={item}><Check size={15} aria-hidden="true" /> {item}</li>)}
                </ul>
              </div>
            )}
            {project.la.length > 0 && (
              <div>
                <p className="eyebrow">Getting around</p>
                <h2 data-split>What is nearby.</h2>
                <ul className="ptravel" data-reveal-group>
                  {project.la.map(([place, time]) => (
                    <li key={place}><span>{place}</span><strong><Clock size={13} aria-hidden="true" /> {time}</strong></li>
                  ))}
                </ul>
                <p className="annot">Approximate travel times as published; they vary with traffic.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---- everything else the published page says ---- */}
      <ProjectExtras sections={extras} name={project.name} />

      {/* ---- the report ---- */}
      <section className="section surface-deep" id="report">
        <div className="shell preport">
          <div className="preport__copy">
            <p className="eyebrow"><FileText size={15} aria-hidden="true" /> Before you commit</p>
            <h2 data-split>Read this project&apos;s record first.</h2>
            <p>
              The free snapshot gives you the registration record and key facts for {project.name} on two pages.
              The full Property Intelligence Report adds the builder&apos;s track record, the ownership trail and the
              complete cost framework, reviewed and signed by {company.md}.
            </p>
            <p className="preport__price"><strong>₹{company.reportPrice.toLocaleString("en-IN")}</strong> for the full signed report</p>
            <a className="text-link" href="/reports">See what the full report contains <ChevronRight size={15} aria-hidden="true" /></a>
          </div>
          <div data-reveal><LeadFormSlot kind="snapshot" projectSlug={project.slug} projectName={project.name} id="snapshot" compact /></div>
        </div>
      </section>

      {/* ---- enquiry ---- */}
      <section className="section surface-dark">
        <div className="shell pforms">
          <div id="enquire" data-reveal><LeadFormSlot kind="project" projectSlug={project.slug} projectName={project.name} id="enquire-form" /></div>
          <div id="visit" data-reveal data-reveal-delay="1"><LeadFormSlot kind="visit" projectSlug={project.slug} projectName={project.name} id="visit-form" /></div>
        </div>
        <div className="shell">
          <p className="pdisclaimer">
            Details on this page are as published for the project and listed by {company.legal}, Karnataka RERA agent
            registration {company.reraAgent}. They are information, not legal, tax or investment advice. Confirm price,
            availability, approvals and possession dates with our team and against the official register before any payment.
          </p>
        </div>
      </section>

      {/* ---- more nearby ---- */}
      {related.length > 0 && (
        <section className="section section--tight surface-dark">
          <div className="shell">
            <div className="head">
              <div className="head__main"><p className="eyebrow">Also in {project.corr}</p><h2 data-split>Compare before you choose.</h2></div>
              {area && <a className="text-link" href={`/areas/${area.slug}`}>All projects in {area.name} <ChevronRight size={15} aria-hidden="true" /></a>}
            </div>
            <div className="pgrid" data-reveal-group>
              {related.map((p) => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
