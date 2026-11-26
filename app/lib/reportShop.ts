import { projects } from "./catalog";
import { company } from "./company";

/**
 * What can be bought online. The newest twenty projects in the catalogue are on
 * sale; the list moves by itself when a newer project is added. Every other
 * project goes through the request form and the team.
 *
 * A project gets an instant download only once its final, reviewed PDF has been
 * placed in `public/<VAULT>/<slug>.pdf` AND its slug is added to READY below.
 * Until then a paid order is delivered by email by the team.
 */
export const SHOP_SIZE = 20;
export const PRICE_PAISE = company.reportPrice * 100;

/** Folder inside public/ holding final PDFs. Not linked anywhere; served only through /api/report/download. */
export const VAULT = "r-7f3c9a1e5b2d4c86";
export const READY: ReadonlySet<string> = new Set<string>([]);

export const shopProjects = [...projects]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .slice(0, SHOP_SIZE)
  .map((p) => ({ slug: p.slug, name: p.name, loc: p.loc, instant: READY.has(p.slug) }));

export const shopBySlug = (slug: string) => shopProjects.find((p) => p.slug === slug);
