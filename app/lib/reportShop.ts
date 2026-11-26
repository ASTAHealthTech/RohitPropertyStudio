import { projects } from "./catalog";
import { company } from "./company";

/**
 * What can be bought online. The newest twenty projects in the catalogue are on
 * sale; the list moves by itself when a newer project is added. Every other
 * project goes through the request form and the team.
 *
 * A project gets an instant download only once its final, reviewed PDF has been
 * placed in `public/<VAULT>/<slug>.pdf` AND its slug is added to READY below.
 * A paid order for a project that is not READY is delivered by email by the team.
 */
export const SHOP_SIZE = 20;
export const PRICE_PAISE = company.reportPrice * 100;

/** Folder inside public/ holding final PDFs. The name is never sent to a browser: buyers download through
 * /api/report/download. Anyone who learns the name could fetch a file directly, so keep the repo private. */
export const VAULT = "r-7f3c9a1e5b2d4c86";
/** Slugs whose final PDF is in the vault. Regenerate with scripts/report/make-brief.mjs, copy to public/<VAULT>/, add the slug here. */
export const READY: ReadonlySet<string> = new Set<string>([
  "sobha-parq-city-hennur",
  "assetz-22-crest-yeshwanthpur",
  "century-immencity-blue-moon-jakkur",
  "lodha-beaumont-estate",
  "prestige-parklane",
  "sattva-thippapura",
  "brigade-granada",
  "brigade-wtc-devanahalli",
  "garden-breeze-prestige-city-sarjapur",
  "tvs-emerald-cascadia-mission-road",
  "unishire-the-weave-chokkanahalli",
  "godrej-vanantara-bannerghatta-road",
  "sumadhura-panorama-devanahalli",
  "prestige-eaton-park-sarjapur",
  "century-kindle-yelahanka-bangalore",
  "pavani-mirabilia-whitefield",
  "prestige-golfshire-devanahalli",
  "olivia-lt-raintree-boulevard-hebbal",
  "shriram-107-south-east-electronic-city-attibele",
  "amberstone-ventara-residences-sarjapur-road",
]);

export const shopProjects = [...projects]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .slice(0, SHOP_SIZE)
  .map((p) => ({ slug: p.slug, name: p.name, loc: p.loc, instant: READY.has(p.slug) }));

export const shopBySlug = (slug: string) => shopProjects.find((p) => p.slug === slug);
