# Moonshot Rodeo landing page

Moonshot Rodeo landing page with a slate-blue Fieldnotes identity. Buildless HTML, CSS, and JavaScript; no dependencies.

Run: `python3 -m http.server 8789 --bind 0.0.0.0 --directory dist`

Open: http://localhost:8789

Only `dist/` is served. Research notes remain outside the web root.

Content uses the completed February 6, 2026 showcase as a recap. Future dates, registration, and submission policies are intentionally unannounced. Contact actions open an email to the verified Arrowhead address; there is no form backend.

See `research/notes.md` for sources and editorial decisions.

Edit `src/index.html`, `src/build-sprint.html`, `dist/styles.css`, and `dist/script.js`, then run `python3 build.py`. The build embeds CSS, JavaScript, and local images into `dist/index.html` and `dist/build-sprint/index.html` for reliable mobile delivery. Commit generated pages and assets along with source changes.

Live preview: https://hermes.mink-pirate.ts.net/ (served from `dist/` on port 8789 through Tailscale Funnel).

After each requested change, rebuild, verify, commit with a descriptive message, and push to `main`.
