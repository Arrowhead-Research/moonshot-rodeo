"""Build self-contained pages with embedded styles, scripts, and images."""
from pathlib import Path
import base64
import mimetypes
import re
from shutil import copytree

copytree("vendor", "dist/vendor", dirs_exist_ok=True)
copytree("assets/panel", "dist/assets/panel", dirs_exist_ok=True)

for source, destination in [('src/index.html', 'dist/index.html'), ('src/build-sprint.html', 'dist/build-sprint/index.html')]:
    page = Path(source).read_text()
    page = page.replace('<!-- INLINE_STYLES -->', '<style>\n' + Path('dist/styles.css').read_text() + '\n</style>')
    page = page.replace('<!-- INLINE_SCRIPT -->', '<script>\n' + Path('dist/script.js').read_text() + '\n</script>')
    for relative in set(re.findall(r'src="(assets/[^"\s]+)"', page)):
        asset = Path('dist') / relative
        mime = mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
        encoded = base64.b64encode(asset.read_bytes()).decode('ascii')
        page = page.replace('src="' + relative + '"', 'src="data:' + mime + ';base64,' + encoded + '"')
    # Resolve site links relative to the page for root and project-site hosting.
    site_prefix = '../' if source == 'src/build-sprint.html' else './'
    page = re.sub(r'href="/(?!/)', 'href="' + site_prefix, page)
    output = Path(destination)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page)
    # Publish the same self-contained HTML from the repository root for Pages.
    pages_output = output.relative_to('dist')
    pages_output.parent.mkdir(parents=True, exist_ok=True)
    pages_output.write_text(page)
