/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProjectLite } from "../../lib/catalog";

/**
 * A reel of residences. By default it is a native sideways scroller (touch,
 * trackpad, keyboard). On wide screens with motion allowed, the page holds and
 * vertical scrolling drives the reel sideways.
 */
export function ResidenceReel({ projects, total }: { projects: ProjectLite[]; total: number }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.registerPlugin(ScrollTrigger);
      const track = el.querySelector<HTMLElement>(".reel__track");
      if (!track) return;
      el.classList.add("is-pinned");
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 1 },
      });
      const drift = gsap.utils.toArray<HTMLElement>(".reel__img img", el).map((img) =>
        gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true } }),
      );
      ScrollTrigger.refresh();
      return () => {
        tween.scrollTrigger?.kill(); tween.kill();
        drift.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
        el.classList.remove("is-pinned");
        gsap.set(track, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="reel surface-dark" id="residences" ref={root}>
      <div className="reel__head">
        <div>
          <p className="eyebrow">Residences</p>
          <h2>A few from {total}.</h2>
        </div>
        <a className="button button--outline" href="/projects">See all {total} projects</a>
      </div>
      <div className="reel__track">
        {projects.map((p) => (
          <a className="reel__card" href={`/projects/${p.slug}`} key={p.slug}>
            <span className="reel__img">{p.cover && <img src={p.cover.src} alt={`${p.name} by ${p.dev}`} width={p.cover.w} height={p.cover.h} loading="lazy" decoding="async" />}</span>
            <span className="reel__meta"><strong>{p.name}</strong><span>{p.price.replace(/\*/g, "")}</span></span>
            <span className="reel__sub"><span>{p.dev} · {p.loc}</span><span>{p.kind}</span></span>
          </a>
        ))}
        <a className="reel__card reel__card--end" href="/projects">
          <span className="reel__endnum">{total}</span>
          <span className="reel__endcopy">projects in the catalogue.<br />Browse them all.</span>
        </a>
      </div>
      <p className="annot reel__note">prices are the published starting figures for each project, as listed by 100 Yards</p>
    </section>
  );
}
