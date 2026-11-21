/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AmbientBackdrop } from "../components/AmbientBackdrop";
import { posts } from "../lib/catalog";

export const metadata: Metadata = {
  title: "Buyer guides: deeds, charges, khata and the paperwork of buying property",
  description: `${posts.length} plain-English real estate guides from 100 Yards for homebuyers and investors in India.`,
  alternates: { canonical: "/blog" },
};

/**
 * The article bodies still live on the current 100yards.in WordPress site. Until
 * they are exported and moved here, each card opens the published article.
 */
export default function BlogPage() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <AmbientBackdrop />
        <div className="shell page-hero__grid">
          <div className="page-hero__copy">
            <p className="eyebrow" data-enter>Guides</p>
            <h1 data-split>The paperwork, in plain English.</h1>
            <p data-enter>{posts.length} guides for homebuyers and investors, written by the 100 Yards team.</p>
          </div>
        </div>
      </section>
      <section className="section section--tight surface-dark">
        <div className="shell postgrid" data-reveal-group>
          {posts.map((post) => (
            <a className="post" href={post.url} key={post.slug} target="_blank" rel="noreferrer">
              {post.img && <span className="post__media"><img src={post.img} alt="" loading="lazy" decoding="async" /></span>}
              <span className="post__meta">{post.date} · {post.minutes} min read</span>
              <strong>{post.title}</strong>
              <span className="post__excerpt">{post.excerpt}</span>
              <span className="card__cta">Read the guide <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
