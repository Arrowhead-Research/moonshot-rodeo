"""Build self-contained pages with embedded styles, scripts, and images."""
from pathlib import Path
import base64
import mimetypes
import re

for source, destination in [('src/index.html', 'dist/index.html'), ('src/build-sprint.html', 'dist/build-sprint/index.html')]:
    page = Path(source).read_text()
    page = page.replace('<!-- INLINE_STYLES -->', '<style>\n' + Path('dist/styles.css').read_text() + '\n</style>')
    page = page.replace('<!-- INLINE_SCRIPT -->', '<script>\n' + Path('dist/script.js').read_text() + '\n</script>')
    for relative in set(re.findall(r'src="(assets/[^"\s]+)"', page)):
        asset = Path('dist') / relative
        mime = mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
        encoded = base64.b64encode(asset.read_bytes()).decode('ascii')
        page = page.replace('src="' + relative + '"', 'src="data:' + mime + ';base64,' + encoded + '"')
    output = Path(destination)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page)
