"""Approximate a Jekyll/kramdown build of the post for local visual QA (no Jekyll needed).

- strips front matter, resolves the {% assign A %} Liquid variable to the local assets path
- converts kramdown math ($$...$$ inline -> \\( \\), display blocks -> \\[ \\]) the way kramdown does
- renders with python-markdown (tables, fenced code, toc, attr_list, md_in_html)
usage: python3 tools/preview.py <out.html>
"""
import re
import sys
from pathlib import Path
import markdown

ROOT = Path(__file__).resolve().parents[2]
post = (ROOT / "_posts" / "2026-10-06-matryoshka-embeddings-and-semantic-ids.md").read_text()
_, front, body = post.split("---", 2)
title = re.search(r'title:\s*"(.*)"', front).group(1)

assets = (ROOT / "assets/posts/mrl-sid").resolve().as_uri()
body = re.sub(r"\{%\s*assign A.*?%\}", "", body)
body = body.replace("{{ A }}", assets)
body = body.replace("* TOC\n{:toc}", "[TOC]")

stash = []
def keep(html):
    stash.append(html)
    return f"@@MATH{len(stash) - 1}@@"
# display math: a $$ block on its own lines
body = re.sub(r"\n\$\$\n(.+?)\n\$\$\n", lambda m: "\n\n" + keep(r"<div>\[" + m.group(1) + r"\]</div>") + "\n\n", body, flags=re.S)
# inline math
body = re.sub(r"\$\$(.+?)\$\$", lambda m: keep(r"\(" + m.group(1) + r"\)"), body)

html = markdown.markdown(body, extensions=["tables", "fenced_code", "toc", "attr_list", "md_in_html"])
html = re.sub(r"@@MATH(\d+)@@", lambda m: stash[int(m.group(1))], html)

page = f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>body{{max-width:760px;margin:40px auto;padding:0 16px;font:17px/1.65 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#1f2328;background:#fff}}
img{{max-width:100%}} table{{border-collapse:collapse;font-size:14px}} td,th{{border:1px solid #d0d7de;padding:6px 8px}}
pre{{background:#f6f8fa;padding:12px;overflow:auto}} code{{font-size:.9em}}
@media (prefers-color-scheme:dark){{body{{background:#0d1117;color:#e6edf3}} pre{{background:#161b22}} td,th{{border-color:#30363d}} a{{color:#4493f8}}}}</style>
</head><body><h1>{title}</h1>{html}</body></html>"""
Path(sys.argv[1]).write_text(page)
print("wrote", sys.argv[1], len(page), "bytes")
