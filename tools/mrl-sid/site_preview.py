"""Build ONE self-contained HTML preview of the Matryoshka/semantic-ID post, wrapped in this
site's real Jekyll Now layout and stylesheet, without needing Jekyll or Ruby.

    python3 tools/mrl-sid/site_preview.py preview.html

Open preview.html in any browser. Everything (CSS, figures, widgets, video) is embedded, so the
file works offline, except MathJax and the theme's Mermaid script, which load from their CDNs.

Approximations versus a real `jekyll build`: Markdown goes through python-markdown instead of
kramdown, and style.scss goes through the tiny compiler below (it supports only what this theme
uses: variables, nesting, `&`, @import of partials, and the `mobile` mixin). For a byte-exact
check, run `bundle exec jekyll serve` with the github-pages gem.
"""
import base64
import re
import sys
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[2]
POST = ROOT / "_posts" / "2026-10-06-matryoshka-embeddings-and-semantic-ids.md"
ASSETS = ROOT / "assets" / "posts" / "mrl-sid"


# ---------------------------------------------------------------- mini SCSS compiler
def scss_to_css(path):
    def load(p):
        src = p.read_text()
        def imp(m):
            name = m.group(1)
            return load(ROOT / "_sass" / f"_{name}.scss")
        return re.sub(r'@import\s+"([^"]+)";', imp, src)

    src = load(path)
    src = re.sub(r"\A\s*---.*?---", "", src, count=1, flags=re.S)  # Jekyll front matter
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"(?m)^\s*//.*$", "", src)
    src = re.sub(r"(?<!:)//[^\n]*", "", src)  # trailing // comments, not inside url(http://...)

    variables = {}
    def take_var(m):
        variables[m.group(1)] = m.group(2).strip()
        return ""
    src = re.sub(r"\$([\w-]+)\s*:\s*([^;{}]+);", take_var, src)
    src = re.sub(r"@mixin\s+mobile\s*\{\s*@media[^{]*\{\s*@content;\s*\}\s*\}", "", src)
    for _ in range(3):
        src = re.sub(r"\$([\w-]+)", lambda m: variables.get(m.group(1), m.group(0)), src)

    # tokenize into a tree of (selector, [children]) and declarations
    pos = 0
    def parse_block():
        nonlocal pos
        items, buf = [], ""
        while pos < len(src):
            ch = src[pos]; pos += 1
            if ch == "{":
                sel = buf.strip(); buf = ""
                items.append((sel, parse_block()))
            elif ch == "}":
                if buf.strip():
                    items.append(buf.strip())
                return items
            elif ch == ";":
                if buf.strip():
                    items.append(buf.strip())
                buf = ""
            else:
                buf += ch
        if buf.strip():
            items.append(buf.strip())
        return items

    tree = parse_block()
    out = []

    def combine(parents, sel):
        parts = [s.strip() for s in sel.split(",")]
        if not parents:
            return parts
        res = []
        for p in parents:
            for s in parts:
                res.append(s.replace("&", p) if "&" in s else f"{p} {s}")
        return res

    def emit(items, parents, media):
        decls = [i for i in items if isinstance(i, str)]
        if decls and parents:
            rule = ", ".join(parents) + " { " + "; ".join(decls) + "; }"
            out.append(f"{media} {{ {rule} }}" if media else rule)
        for i in items:
            if isinstance(i, tuple):
                sel, children = i
                if sel.startswith("@include mobile"):
                    emit(children, parents, "@media screen and (max-width: 640px)")
                elif sel.startswith("@media"):
                    emit(children, parents, sel)
                elif sel.startswith("@font-face"):
                    out.append(sel + " { " + "; ".join(c for c in children if isinstance(c, str)) + "; }")
                else:
                    emit(children, combine(parents, sel), media)

    emit(tree, [], None)
    return "\n".join(out)


# ---------------------------------------------------------------- render the post body
def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def render_post():
    text = POST.read_text()
    _, front, body = text.split("---", 2)
    title = re.search(r'title:\s*"(.*)"', front).group(1)
    date = re.search(r"date:\s*(\S+)", front).group(1)

    body = re.sub(r"\{%\s*assign A.*?%\}", "", body)
    body = body.replace("* TOC\n{:toc}", "[TOC]")

    mimes = {".svg": "image/svg+xml", ".png": "image/png", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm"}
    def asset(m):
        name = m.group(1)
        p = ASSETS / name
        if p.suffix == ".js":
            return "@@JS:" + name + "@@"
        return data_uri(p, mimes[p.suffix])
    body = re.sub(r"\{\{ A \}\}/([\w.-]+)", asset, body)

    stash = []
    def keep(s):
        stash.append(s); return f"@@KEEP{len(stash) - 1}@@"
    body = re.sub(r"\n\$\$\n(.+?)\n\$\$\n", lambda m: "\n\n" + keep(r"<div>\[" + m.group(1) + r"\]</div>") + "\n\n", body, flags=re.S)
    body = re.sub(r"\$\$(.+?)\$\$", lambda m: keep(r"\(" + m.group(1) + r"\)"), body)

    html = markdown.markdown(body, extensions=["tables", "fenced_code", "toc", "attr_list", "md_in_html"])
    html = re.sub(r"@@KEEP(\d+)@@", lambda m: stash[int(m.group(1))], html)
    # kramdown + rouge wrap fenced code in div.highlight; mimic it so the theme's code styles apply
    html = re.sub(r"<pre>(<code.*?</code>)</pre>", r'<div class="highlight"><pre class="highlight">\1</pre></div>', html, flags=re.S)
    # widget scripts: inline them
    html = re.sub(r'<script src="@@JS:([\w.-]+)@@"></script>',
                  lambda m: "<script>\n" + (ASSETS / m.group(1)).read_text() + "\n</script>", html)
    return title, date, html


def main(out):
    import datetime
    title, date, content = render_post()
    css = scss_to_css(ROOT / "style.scss")
    d = datetime.date.fromisoformat(date)
    date_str = f"{d:%B} {d.day}, {d.year}"

    post = (ROOT / "_layouts" / "post.html").read_text().split("---", 2)[2]
    post = post.replace("{{ page.title }}", title).replace("{{ content }}", content)
    post = re.sub(r"\{\{ page.date[^}]*\}\}", date_str, post)
    post = re.sub(r"\{%\s*include disqus.html\s*%\}", "", post)

    page = (ROOT / "_layouts" / "default.html").read_text()
    site = {"name": "Monir Moniruzzaman", "description": "Data Scientist, Problem solver, Researcher",
            "avatar": "https://raw.githubusercontent.com/MonirZaman/monirzaman.github.io/master/images/me-and-nora.jpg"}
    page = re.sub(r"\{%\s*include (google-analytics|meta|svg-icons)\.html\s*%\}", "", page)
    page = page.replace("{% if page.title %}{{ page.title }} – {% endif %}", title + " – ")
    for k, v in site.items():
        page = page.replace("{{ site.%s }}" % k, v)
    page = page.replace("{{ site.baseurl }}", "https://monirzaman.github.io")
    page = page.replace('<link rel="stylesheet" type="text/css" href="https://monirzaman.github.io/style.css" />',
                        "<meta charset=\"utf-8\"><style>\n" + css + "\n</style>")
    page = page.replace("{{ content }}", post)
    # This post has no Mermaid diagrams, so the preview skips the theme's Mermaid loader (a large script that
    # blocks the first paint) and the dead IE-only html5shiv link. The live site still loads them from the layout.
    page = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/mermaid[^"]*"></script>\s*<script>\s*mermaid\.initialize\([^<]*</script>', "", page)
    page = re.sub(r"<!--\[if lt IE 9\]>.*?<!\[endif\]-->", "", page, flags=re.S)
    page = page.replace("<body>", '<body>\n<div style="background:#fff8c5;border-bottom:1px solid #d4a72c;padding:6px 12px;font:13px Helvetica,Arial,sans-serif">'
                        "Local preview of a draft post (not yet published). Built with python-markdown, so tiny spacing differences from the live site are possible.</div>", 1)
    Path(out).write_text(page)
    print("wrote", out, f"{len(page) / 1024:.0f} KB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "preview.html")
