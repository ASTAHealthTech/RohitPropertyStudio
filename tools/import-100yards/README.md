# Import from the old 100yards.in site

Turns the pages saved by `scripts/collect-100yards.mjs` into the files the site reads.

    node scripts/collect-100yards.mjs            # saves raw pages to scripts/collected-100yards/ (not in Git)
    pip install beautifulsoup4 lxml
    python tools/import-100yards/build.py scripts/collected-100yards app/lib/catalog app/lib/catalog/projects.json app/lib/catalog/posts.json

Writes `details.json` (extra sections per project), `articles.json` (guide text) and
`posts.json` (guide list, theme demo posts removed) into `app/lib/catalog/`.

Rules the script applies. Text is copied as published, never reworded:
- left out: Investment Potential, Conclusion / verdict sections, enquiry prompts, forms,
  footer text, template placeholders, questions and bullets about returns or appreciation;
- a section is only added to a project when the catalogue record does not already hold it
  (about, details, price, amenities, travel); nearby places, pros/cons, FAQs are always added;
- guides whose subject is investment or market calls are HELD (see `HOLD` in build.py) until
  the Managing Director decides; they stay title-only on /blog.

`photos-source.json` lists the photos each old project page shows (not downloaded yet).
