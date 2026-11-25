"""Build self-contained pages with embedded styles, scripts, and images.

Templates live in src/ and shared fragments in src/partials/. Shared CSS and JS
live in dist/styles.css and dist/script.js. The output is written to dist/ and
mirrored to the repository root, which GitHub Pages serves.
"""
from pathlib import Path
from shutil import copytree
from urllib.parse import quote, quote_plus
import base64
import html
import json
import mimetypes
import re

SITE_URL = 'https://arrowheadresearch.org/moonshot-rodeo/'
APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf_Ubf0xR1-YBlCTn87MaXaGOxG4RZdPN51F5zK_tqhxJaBOA/viewform?usp=dialog'
VENUE = '3625 Potomac Avenue, Alexandria, VA 22305'
EVENT_SUMMARY = 'Moonshot Rodeo 2027'
EVENT_DETAILS = ('Military and intelligence community builders present prototypes and field '
                 'solutions to an expert panel. Details: ' + SITE_URL)
LAST_MODIFIED = '2026-11-21'

GCAL_URL = ('https://calendar.google.com/calendar/render?action=TEMPLATE'
            '&text=' + quote_plus(EVENT_SUMMARY) +
            '&dates=20270204/20270205'
            '&location=' + quote_plus(VENUE) +
            '&details=' + quote_plus(EVENT_DETAILS))

PAGES = [
    ('src/index.html', 'dist/index.html', './'),
    ('src/build-sprint.html', 'dist/build-sprint/index.html', '../'),
]

for folder in ['panel', 'partners', 'tracks', 'photos', 'social', 'brand']:
    copytree(f'assets/{folder}', f'dist/assets/{folder}', dirs_exist_ok=True)
copytree('vendor', 'dist/vendor', dirs_exist_ok=True)

partial = lambda name: Path(f'src/partials/{name}.html').read_text().strip()


def favicon():
    """Build the favicon data URI from the lasso mark on a dark rounded tile."""
    mark = partial('lasso')
    inner = mark[mark.index('>') + 1:mark.rindex('</svg>')]
    svg = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
           "<rect width='32' height='32' rx='7' fill='#0c1411'/>"
           "<g fill='none' stroke='#f2b705' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>"
           + inner.replace('currentColor', '#f2b705').replace('"', "'") + "</g></svg>")
    return 'data:image/svg+xml,' + quote(svg, safe=" =:/'")


def faq_schema(page):
    """Generate FAQPage structured data from the visible FAQ so they never drift."""
    items = re.findall(r'<details class="faq-item"><summary>(.*?)</summary><div class="faq-a">(.*?)</div></details>', page, re.S)
    if not items:
        return ''
    strip = lambda text: html.unescape(re.sub(r'<[^>]+>', '', text)).strip()
    data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}}
            for q, a in items
        ],
    }
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n</script>'


for source, destination, site_prefix in PAGES:
    page = Path(source).read_text()
    page = page.replace('<!-- HEAD_COMMON -->', partial('head-common'))
    page = page.replace('{{FAVICON}}', favicon())
    page = page.replace('<!-- SITE_HEADER -->', partial('header'))
    page = page.replace('<!-- SITE_FOOTER -->', partial('footer'))
    page = page.replace('<!-- LASSO -->', partial('lasso'))
    page = page.replace('<!-- STICKY_CTA -->', partial('sticky-cta'))
    page = page.replace('<!-- PARTNER_LOGOS -->', Path('src/partner-logos.html').read_text().strip())
    page = page.replace('<!-- FAQ_SCHEMA -->', faq_schema(page))
    page = page.replace('<!-- INLINE_STYLES -->', '<style>\n' + Path('dist/styles.css').read_text() + '\n</style>')
    page = page.replace('<!-- INLINE_SCRIPT -->', '<script>\n' + Path('dist/script.js').read_text() + '\n</script>')
    page = page.replace('{{NAV_SPRINT_CURRENT}}', ' aria-current="page"' if 'build-sprint' in source else '')
    page = page.replace('{{APPLY_URL}}', APPLY_URL)
    page = page.replace('{{GCAL_URL}}', html.escape(GCAL_URL))
    page = page.replace('{{SITE_URL}}', SITE_URL)
    page = page.replace('{{SITE_PREFIX}}', site_prefix)
    # Root-relative ./ paths in templates are written for the home page.
    if site_prefix != './':
        page = re.sub(r'(src|href|srcset)="\./', r'\1="' + site_prefix, page)
    # Embed small shared images (logos, workshop photos) for reliable mobile delivery.
    for relative in set(re.findall(r'src="(assets/[^"\s]+)"', page)):
        asset = Path('dist') / relative
        mime = mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
        encoded = base64.b64encode(asset.read_bytes()).decode('ascii')
        page = page.replace('src="' + relative + '"', 'src="data:' + mime + ';base64,' + encoded + '"')
    # Resolve site links relative to the page for root and project-site hosting.
    page = re.sub(r'href="/(?!/)', 'href="' + site_prefix, page)
    unresolved = re.findall(r'\{\{[A-Z_]+\}\}|<!-- [A-Z_]+ -->', page)
    assert not unresolved, f'{source}: unresolved placeholders {unresolved}'
    output = Path(destination)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page)
    # Publish the same self-contained HTML from the repository root for Pages.
    pages_output = output.relative_to('dist')
    pages_output.parent.mkdir(parents=True, exist_ok=True)
    pages_output.write_text(page)

def fold(line):
    """Fold iCalendar content lines at 75 octets (RFC 5545)."""
    out = []
    while len(line.encode()) > 75:
        cut = 75 if not out else 74
        out.append(line[:cut])
        line = line[cut:]
    out.append(line)
    return '\r\n '.join(out)


ics = '\r\n'.join(fold(line) for line in [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arrowhead Research//Moonshot Rodeo//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', 'UID:moonshot-rodeo-2027@arrowheadresearch.org', 'DTSTAMP:20261121T000000Z',
    'DTSTART;VALUE=DATE:20270204', 'DTEND;VALUE=DATE:20270205',
    'SUMMARY:' + EVENT_SUMMARY,
    'LOCATION:' + VENUE.replace(',', '\\,'),
    'DESCRIPTION:' + EVENT_DETAILS.replace(',', '\\,'),
    'URL:' + SITE_URL,
    'END:VEVENT', 'END:VCALENDAR']) + '\r\n'

sitemap = '\n'.join([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    *[f'  <url><loc>{SITE_URL}{path}</loc><lastmod>{LAST_MODIFIED}</lastmod></url>' for path in ['', 'build-sprint/']],
    '</urlset>', ''])

for root in [Path('dist'), Path('.')]:
    (root / 'moonshot-rodeo-2027.ics').write_text(ics, newline='')
    (root / 'sitemap.xml').write_text(sitemap)
