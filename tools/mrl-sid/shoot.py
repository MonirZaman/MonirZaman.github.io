"""Screenshot SVGs or an HTML page with headless Chromium (for visual QA).
usage: python3 tools/shoot.py out.png file1.svg [file2.svg ...]      -> stacked contact sheet
       python3 tools/shoot.py --page out.png page.html [width] [dark]
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

args = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch()
    if args[0] == "--page":
        out, page_path = args[1], args[2]
        width = int(args[3]) if len(args) > 3 else 900
        scheme = "dark" if len(args) > 4 and args[4] == "dark" else "light"
        pg = b.new_page(viewport={"width": width, "height": 900}, color_scheme=scheme)
        pg.goto(Path(page_path).resolve().as_uri())
        pg.wait_for_timeout(1500)
        pg.screenshot(path=out, full_page=True)
    else:
        out, files = args[0], args[1:]
        html = "<body style='margin:0;background:#ddd'>" + "".join(
            f"<img src='{Path(f).resolve().as_uri()}' style='display:block;width:760px;margin:8px'>" for f in files) + "</body>"
        sheet = Path(out).with_suffix(".html")
        sheet.write_text(html)
        pg = b.new_page(viewport={"width": 780, "height": 600})
        pg.goto(sheet.resolve().as_uri())
        pg.wait_for_timeout(500)
        pg.screenshot(path=out, full_page=True)
    b.close()
print("wrote", out)
