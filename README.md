# Moonshot Rodeo landing page

Moonshot Rodeo site for Arrowhead Research: a field-briefing identity (night ink, Arrowhead green, signal amber, Archivo display type). Buildless HTML, CSS, and JavaScript; the only build step is `build.py`.

Run: `python3 build.py && python3 -m http.server 8789 --bind 0.0.0.0 --directory dist`

Open: http://localhost:8789

## Structure

- `src/index.html`, `src/build-sprint.html` — page templates.
- `src/partials/` — shared head, header, footer, and mobile sticky CTA. `src/partner-logos.html` holds the partner strip.
- `dist/styles.css`, `dist/script.js` — shared styles and script, inlined into each page at build time.
- `tools/make-sketches.js` — regenerates the hand-drawn track sketches in `assets/tracks/` with the vendored rough.js (`node tools/make-sketches.js`).
- `assets/` — source images copied into `dist/assets/` (photos, panel portraits, partner logos, tracks, social card, brand wordmark). Original event photos stay in `dist/assets/`.

`build.py` fills the placeholders (`{{APPLY_URL}}`, `{{SITE_URL}}`, `{{SITE_PREFIX}}`, `{{GCAL_URL}}`), generates FAQPage structured data from the visible FAQ, inlines CSS/JS and small shared images, and writes `dist/index.html`, `dist/build-sprint/index.html`, `sitemap.xml`, and `moonshot-rodeo-2027.ics`. Everything is mirrored to the repository root, which GitHub Pages serves at https://arrowheadresearch.org/moonshot-rodeo/. Photos are served as files (not inlined) so they cache and get indexed.

## SEO and engagement

- Unique titles, descriptions, canonical URLs, Open Graph and Twitter cards per page; social card at `assets/social/moonshot-rodeo-og.jpg`.
- JSON-LD: `Event` (presentation day and build sprint), `Organization`, `WebSite`, `FAQPage`, `BreadcrumbList`.
- `sitemap.xml` lives under `/moonshot-rodeo/`; submit it in Search Console (the domain-root `robots.txt` belongs to the main arrowheadresearch.org site).
- Countdown, add-to-calendar (ICS and Google), sticky mobile apply bar, and repeated apply CTAs. CTA clicks push `cta_click` events to `window.dataLayer` for any analytics tag added later.

Content uses the completed February 6, 2026 showcase as a recap. See `research/notes.md` for sources and editorial decisions.

After each requested change, rebuild, verify, commit with a descriptive message, and push.
