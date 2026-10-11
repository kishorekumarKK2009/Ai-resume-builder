@echo off
cd /d "%~dp0\.."
python - <<'PY'
from pathlib import Path
root = Path('.')
html_files = sorted(root.glob('*.html'))
css_line = '<link rel="stylesheet" href="css/page-loader.css">'
js_line = '<script src="js/page-loader.js"></script>'
call_line = '  <script>pageLoader.ready();</script>'
patched = []
for path in html_files:
    text = path.read_text(encoding='utf-8')
    modified = False
    if css_line not in text and '</head>' in text:
        text = text.replace('</head>', f'  {css_line}\n</head>', 1)
        modified = True
    if js_line not in text and '</body>' in text:
        text = text.replace('</body>', f'  {js_line}\n{call_line}\n</body>', 1)
        modified = True
    elif js_line in text and call_line.strip() not in text:
        text = text.replace(js_line, f'{js_line}\n{call_line}', 1)
        modified = True
    if modified:
        path.write_text(text, encoding='utf-8')
        patched.append(path.name)
print('patched:', patched)
PY
pause
