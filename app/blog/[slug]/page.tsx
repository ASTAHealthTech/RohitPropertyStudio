/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AmbientBackdrop } from "../../components/AmbientBackdrop";
import { Blocks } from "../../components/catalog/Blocks";
import { LeadFormSlot } from "../../components/leads/LeadFormSlot";
import { articleBySlug, hasArticle, posts } from "../../lib/catalog";
import { company } from "../../lib/company";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return { title: "Guide not found" };
  const description = (article.desc || article.excerpt).slice(0, 300);
  return {
    title: article.title,
    description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: { title: article.title, description, type: "article", images: article.img ? [{ url: article.img }] : undefined },
  };
}

/** A guide, with the text as published on 100yards.in. */
export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  const more = posts.filter((p) => p.slug !== article.slug && hasArticle(p.slug)).slice(0, 3);
  const questions = article.blocks.filter((b) => b.t === "qa");
  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.desc || article.excerpt,
      ...(article.img ? { image: article.img } : {}),
      author: { "@type": "Organization", name: company.name }, publisher: { "@type": "Organization", name: company.name },
      mainEntityOfPage: `/blog/${article.slug}`,
    },
    ...(questions.length ? [{
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: questions.map((b) => b.t === "qa" ? { "@type": "Question", name: b.q, acceptedAnswer: { "@type": "Answer", text: b.a } } : null).filter(Boolean),
    }] : []),
  ]).replace(/</g, "\\u003c");

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell">
          <nav className="crumbs" aria-label="Breadcrumb" data-enter>
            <a href="/blog">Guides</a><ChevronRight size={13} aria-hidden="true" /><span aria-current="page">{article.title}</span>
          </nav>
          <div className="page-hero__copy guide__head">
            <p className="eyebrow" data-enter>{article.date} · {Math.max(1, Math.round(article.words / 220))} min read</p>
            <h1 data-split>{article.title}</h1>
            <p data-enter>{article.excerpt}</p>
          </div>
        </div>
      </section>

      <section className="section section--tight surface-dark">
        <div className="shell guide">
          <article className="guide__body">
            {article.img && <img className="guide__cover" src={article.img} alt="" width={1200} height={675} />}
            <Blocks blocks={article.blocks} caption={article.title} />
            <p className="pdisclaimer">
              This guide is general information from {company.legal}. It is not legal, tax or investment advice.
              Rules and charges change; check the current position with the authority concerned or a qualified professional before you act.
            </p>
          </article>
          <aside className="guide__side">
            <LeadFormSlot kind="callback" id="callback" compact />
            {more.length > 0 && (
              <div className="guide__more">
                <p className="eyebrow">More guides</p>
                <ul>{more.map((p) => <li key={p.slug}><a className="text-link" href={`/blog/${p.slug}`}>{p.title}</a></li>)}</ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
