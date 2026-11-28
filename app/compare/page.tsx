/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { ComparePicker } from "../components/catalog/ComparePicker";
import { LeadFormSlot } from "../components/leads/LeadFormSlot";
import { projectBySlug, projectsLite, type Project } from "../lib/catalog";
import { company, whatsappLink } from "../lib/company";

export const metadata: Metadata = {
  title: "Compare projects in Bangalore side by side",
  description: "Put two or three Bangalore projects next to each other: builder, location, starting price, sizes, land, homes, status, possession and RERA number, as published.",
  alternates: { canonical: "/compare" },
};

type Search = { searchParams: Promise<{ p?: string }> };
const clean = (text: string) => (text || "").replace(/\*/g, "").trim();
const dash = (text: string) => clean(text) || "Not published";

export default async function ComparePage({ searchParams }: Search) {
  const query = await searchParams;
  const slugs = (query.p ?? "").split(",").map((s) => s.trim()).filter(Boolean).filter((s, i, a) => a.indexOf(s) === i).slice(0, 3);
  const chosen = slugs.map((s) => projectBySlug(s)).filter((p): p is Project => Boolean(p));
  const rows: { label: string; value: (p: Project) => React.ReactNode }[] = [
    { label: "Builder", value: (p) => <a href={`/builders/${p.devSlug}`}>{p.devFull || p.dev}</a> },
    { label: "Location", value: (p) => p.loc },
    { label: "Part of the city", value: (p) => p.corr },
    { label: "Type", value: (p) => p.kind },
    { label: "Starting price", value: (p) => <strong className="cmp__price">{dash(p.price)}</strong> },
    { label: "Homes on offer", value: (p) => dash(p.config) },
    { label: "Sizes", value: (p) => dash(p.sizes) },
    { label: "Land area", value: (p) => dash(p.land) },
    { label: "Number of homes", value: (p) => dash(p.units) },
    { label: "Status", value: (p) => dash(p.status) },
    { label: "Possession", value: (p) => dash(p.poss) },
    { label: "RERA number", value: (p) => p.rera ? <span className="cmp__rera"><BadgeCheck size={15} aria-hidden="true" />{p.rera}</span> : "Not yet shared by the builder" },
    { label: "Amenities listed", value: (p) => p.am.length ? <>{p.am.slice(0, 5).join(", ")}{p.am.length > 5 ? `, and ${p.am.length - 5} more` : ""}</> : "Not published" },
  ];
  const names = chosen.map((p) => p.name).join(", ");
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Compare projects</p>
            <h1 data-split>Two brochures never line up. This does.</h1>
            <p data-enter>Pick two or three projects and read them row by row: the same facts, in the same order, as each builder has published them.</p>
          </div>
          <div className="page-hero__aside" data-enter>
            <strong>What this is, and is not</strong>
            <p>A side-by-side of published facts. It does not rank the projects or say which to buy. Builders quote sizes on different bases, so check carpet area before comparing sizes or prices.</p>
          </div>
        </div>
      </section>

      <section className="section section--tight surface-dark">
        <div className="shell">
          <ComparePicker options={projectsLite.map((p) => ({ slug: p.slug, name: p.name, dev: p.dev, corr: p.corr }))} chosen={chosen.map((p) => p.slug)} />

          {chosen.length === 0 && <p className="cmp__empty">Choose a first project above to begin. You can also open any project page and press &ldquo;Compare with another project&rdquo;.</p>}

          {chosen.length > 0 && (
            <div className="cmp__wrap" data-reveal>
              <table className="cmp">
                <caption className="sr-only">Comparison of {names}</caption>
                <thead>
                  <tr>
                    <td />
                    {chosen.map((p) => (
                      <th key={p.slug} scope="col">
                        <a className="cmp__head" href={`/projects/${p.slug}`}>
                          {p.images[0] ? <img src={p.images[0].src.replace(/\.webp$/, "-s.webp")} alt={`${p.name}, ${p.loc}`} width={800} height={Math.round((800 * p.images[0].h) / p.images[0].w)} loading="lazy" /> : <span className="cmp__blank" />}
                          <small>{p.dev}</small><b>{p.name}</b>
                        </a>
                      </th>
                    ))}
                    {chosen.length < 2 && <th scope="col" className="cmp__ghost">Choose a second project above to compare</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}><th scope="row">{row.label}</th>{chosen.map((p) => <td key={p.slug} data-label={p.name}>{row.value(p)}</td>)}{chosen.length < 2 && <td className="cmp__ghost" />}</tr>
                  ))}
                  <tr className="cmp__cta"><th scope="row">Next step</th>
                    {chosen.map((p) => <td key={p.slug}><a className="button button--gold" href={`/projects/${p.slug}#enquire`} data-track="compare_enquire">Get price &amp; plans <ArrowUpRight size={15} aria-hidden="true" /></a><a className="text-link" href={`/projects/${p.slug}`}>Full project page</a></td>)}
                    {chosen.length < 2 && <td className="cmp__ghost" />}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {chosen.length > 0 && (
            <p className="cmp__note">
              Every figure is the builder&apos;s own published figure, as shown on each project page. &ldquo;Not published&rdquo; means the builder has not shared it with us.
              Check each RERA number on <a href={company.reraVerifyUrl} target="_blank" rel="noreferrer">the Karnataka RERA register</a> before you book.
              {chosen.length > 1 && <> Want these compared on carpet area and total cost? <a href={whatsappLink(`Hi, please help me compare ${names}.`)} target="_blank" rel="noreferrer" data-track="whatsapp_clicked">Ask an advisor on WhatsApp</a>.</>}
            </p>
          )}
        </div>
      </section>

      <section className="section surface-dark">
        <div className="shell pforms pforms--single">
          <div>
            <p className="eyebrow">Still deciding</p>
            <h2 data-split>Tell us what matters. We narrow it down.</h2>
            <p className="head__note" data-reveal>Budget, area and timeline are enough. An advisor calls you back and walks you through the difference between your shortlisted projects.</p>
          </div>
          <div data-reveal><LeadFormSlot kind="callback" id="callback" /></div>
        </div>
      </section>
    </main>
  );
}
