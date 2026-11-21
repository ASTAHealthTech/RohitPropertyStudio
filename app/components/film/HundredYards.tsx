/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type YardStage = { title: string; copy: string; img: string; alt: string; caption: string };

/**
 * The homepage signature: the screen holds while a measure counts 0 → 100 yards,
 * and each twenty yards is one step of how 100 Yards works, with its own image
 * wiping in. Without JavaScript, under reduced motion, or on narrow screens it
 * is simply six steps in a column — nothing is hidden.
 */
export function HundredYards({ stages }: { stages: YardStage[] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.registerPlugin(ScrollTrigger);
      el.classList.add("is-pinned");
      const items = gsap.utils.toArray<HTMLElement>(".yards__stage", el);
      const shots = gsap.utils.toArray<HTMLElement>(".yards__shot", el);
      const count = el.querySelector<HTMLElement>(".yards__num");
      const bar = el.querySelector<HTMLElement>(".yards__bar i");
      let current = 0;
      if (count) count.textContent = "0";
      gsap.set(items, { autoAlpha: 0 });
      gsap.set(items[0], { autoAlpha: 1 });
      gsap.set(shots, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(shots[0], { clipPath: "inset(0% 0 0 0)" });

      const show = (next: number) => {
        if (next === current) return;
        const dir = next > current ? 1 : -1;
        gsap.to(items[current], { autoAlpha: 0, y: -18 * dir, duration: 0.35, ease: "power2.in", overwrite: true });
        gsap.fromTo(items[next], { autoAlpha: 0, y: 28 * dir }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.18, overwrite: true });
        shots.forEach((shot, k) => gsap.to(shot, { clipPath: k <= next ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)", duration: 1.1, ease: "power3.inOut", overwrite: true }));
        const img = shots[next].querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1.02, duration: 1.8, ease: "power2.out" });
        current = next;
      };

      const trigger = ScrollTrigger.create({
        trigger: el, start: "top top", end: "+=460%", pin: true, scrub: 0.6, refreshPriority: 2,
        onUpdate: (self) => {
          if (count) count.textContent = String(Math.round(self.progress * 100));
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          show(Math.min(items.length - 1, Math.floor(self.progress * (items.length - 0.001))));
        },
      });
      ScrollTrigger.refresh();
      return () => {
        trigger.kill();
        el.classList.remove("is-pinned");
        gsap.set([...items, ...shots], { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="yards surface-dark" id="journey" ref={root} aria-label="How we work, in a hundred yards">
      <div className="yards__left">
        <p className="eyebrow">How we work, measured</p>
        <p className="yards__count" aria-hidden="true"><span className="yards__num">100</span><small>yards</small></p>
        <ol className="yards__stages">
          {stages.map((stage, index) => (
            <li className="yards__stage" key={stage.title}>
              <span className="yards__mark">{index * 20} yards</span>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <img className="yards__inline" src={stage.img} alt={stage.alt} loading="lazy" decoding="async" />
            </li>
          ))}
        </ol>
        <div className="yards__bar" aria-hidden="true"><i /></div>
        <div className="yards__ticks" aria-hidden="true">{[0, 20, 40, 60, 80, 100].map((n) => <span key={n}>{n}</span>)}</div>
      </div>
      <div className="yards__right" aria-hidden="true">
        {stages.map((stage) => (
          <figure className="yards__shot" key={stage.title}>
            <img src={stage.img} alt="" loading="lazy" decoding="async" />
            <figcaption>{stage.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
