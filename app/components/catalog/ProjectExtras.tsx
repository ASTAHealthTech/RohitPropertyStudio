import { Blocks } from "./Blocks";
import type { Block, DetailSection } from "../../lib/catalog";

/**
 * The parts of a project's published page that the short catalogue record does not hold:
 * why buyers look at it, what is nearby, pros and considerations, and the common questions.
 * Investment pitches, verdicts and enquiry prompts were left out when the pages were imported.
 */
const ORDER = ["about", "snapshot", "pricing", "amenities", "location", "why", "other", "nearby", "pros"] as const;
const EYEBROW: Record<string, string> = {
  about: "About the project", snapshot: "Project details", pricing: "Price & configurations", amenities: "Amenities",
  location: "Location", why: "At a glance", other: "More detail", nearby: "Nearby", pros: "Both sides",
};

export function faqOf(sections: DetailSection[]) {
  return sections.filter((s) => s.kind === "faq").flatMap((s) => s.blocks).filter((b): b is Extract<Block, { t: "qa" }> => b.t === "qa");
}

export function ProjectExtras({ sections, name }: { sections: DetailSection[]; name: string }) {
  const ordered = ORDER.flatMap((kind) => sections.filter((s) => s.kind === kind));
  const faq = faqOf(sections);
  if (!ordered.length && !faq.length) return null;
  return (
    <>
      {ordered.length > 0 && (
        <section className="section section--tight surface-dark" id="more">
          <div className="shell pextras">
            {ordered.map((section) => (
              <article className={`pextra pextra--${section.kind}`} key={section.title} data-reveal>
                <header>
                  <p className="eyebrow">{EYEBROW[section.kind]}</p>
                  <h2>{section.title}</h2>
                </header>
                <Blocks blocks={section.blocks} caption={`${name}: ${section.title}`} />
              </article>
            ))}
            <p className="annot">As published for the project. Travel times, sizes and prices are indicative; confirm them with our team and the official register.</p>
          </div>
        </section>
      )}
      {faq.length > 0 && (
        <section className="section surface-dark" id="questions">
          <div className="shell faq__grid">
            <div className="faq__intro">
              <p className="eyebrow">{name}, answered</p>
              <h2 data-split>Common questions.</h2>
              <p>Answers as published for the project. Nothing here is a forecast or advice.</p>
            </div>
            <div className="accordion" data-reveal>
              {faq.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
