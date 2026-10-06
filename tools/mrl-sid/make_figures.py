"""Generate the static architecture diagrams (blue = Matryoshka/vectors, violet = semantic IDs/codes, gray = other highlights) for the blog post as standalone SVGs.

Every diagram is redrawn from the text of the cited paper; none is copied from a paper's figure.
Run:  python3 tools/make_figures.py   (writes into assets/posts/mrl-sid/)
"""
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parents[2] / "assets" / "posts" / "mrl-sid"
OUT.mkdir(parents=True, exist_ok=True)

STYLE = """
<style>
  .ink{fill:#1f2328} .quiet{fill:#59636e} .edge{stroke:#8c959f} .box{fill:none;stroke:#8c959f;stroke-width:1.25}
  .hi{fill:#0969da;fill-opacity:.10;stroke:#0969da;stroke-width:2} .arrowhead{fill:#8c959f} .bg{fill:#ffffff}
  .sid{fill:#7c3aed;fill-opacity:.10;stroke:#7c3aed;stroke-width:2} .key{fill:#59636e;fill-opacity:.07;stroke:#59636e;stroke-width:1.75}
  .l1{fill:#5b21b6;fill-opacity:.16;stroke:#5b21b6;stroke-width:2} .l2{fill:#7c3aed;fill-opacity:.12;stroke:#7c3aed;stroke-width:2}
  .l3{fill:#a78bfa;fill-opacity:.14;stroke:#a78bfa;stroke-width:2} .l4{fill:#c4b5fd;fill-opacity:.18;stroke:#c4b5fd;stroke-width:2}
  .mrl-ink{fill:#0969da} .sid-ink{fill:#6d28d9}
  text{font-family:Inter,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
</style>"""


def svg(name, h, title, body, w=760):
    doc = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}">'
        f"<title>{escape(title)}</title>{STYLE}"
        '<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" '
        'orient="auto-start-reverse"><path class="arrowhead" d="M0 0L10 5L0 10z"/></marker></defs>'
        f'<rect class="bg" width="{w}" height="{h}"/>'
        f'<text class="ink" x="24" y="30" font-size="15" font-weight="600">{escape(title)}</text>'
        + "".join(body)
        + "</svg>"
    )
    (OUT / f"{name}.svg").write_text(doc)


def box(x, y, w, h, name, lines=(), hi=False):
    cx = x + w / 2
    cls = hi if isinstance(hi, str) else ("hi" if hi else "box")
    parts = [f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="8"/>',
             f'<text class="ink" x="{cx}" y="{y + 24}" text-anchor="middle" font-size="13" font-weight="600">{escape(name)}</text>']
    for i, ln in enumerate(lines):
        parts.append(f'<text class="{"ink" if hi else "quiet"}" x="{cx}" y="{y + 44 + 16 * i}" '
                     f'text-anchor="middle" font-size="11.5">{escape(ln)}</text>')
    return "".join(parts)


def path(d, both=False):
    start = ' marker-start="url(#a)"' if both else ""
    return f'<path class="edge" d="{d}" fill="none" stroke-width="1.25" marker-end="url(#a)"{start}/>'


def label(x, y, s, anchor="start", cls="quiet", size=11.5):
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}">{escape(s)}</text>'


def chain(name, title, steps, note=None, hi_index=None, hi_cls="hi"):
    """Four boxes left to right."""
    body = []
    xs = [24, 208, 392, 576]
    for i, (nm, lines) in enumerate(steps):
        body.append(box(xs[i], 56, 160, 76, nm, lines, hi=hi_cls if i == hi_index else False))
        if i < len(steps) - 1:
            body.append(path(f"M{xs[i] + 160} 94H{xs[i + 1] - 2}"))
    h = 150
    if note:
        body.append(label(24, 162, note))
        h = 184
    svg(name, h, title, body)


# 1. Matryoshka vs semantic ID (the post's anchor figure)
def anchor_figure():
    b = []
    b.append(label(24, 66, "LinkedIn MUSE · Matryoshka embedding", cls="mrl-ink", size=13))
    b.append(label(24, 86, "one continuous vector; every prefix is itself a usable embedding"))
    segs = [(24, 89, "1–512", True), (113, 89, "513–1,024", True), (202, 178, "1,025–2,048", True), (380, 356, "2,049–4,096", False)]
    for x, w, t, on in segs:
        b.append(f'<rect class="{"hi" if on else "box"}" x="{x}" y="100" width="{w}" height="40"/>')
        b.append(label(x + w / 2, 124, t, "middle", "ink"))
    b.append(label(24, 160, "coarse: title, seniority, location"))
    b.append(label(736, 160, "fine: qualifications, career trajectory", "end"))
    b.append('<path class="edge" d="M24 174V180H380V174" fill="none"/>')
    b.append(label(24, 198, "2,048-d prefix → IVFPQ retrieval over 1.3B+ profiles", cls="ink"))
    b.append('<path class="edge" d="M24 210V216H736V210" fill="none"/>')
    b.append(label(24, 234, "full 4,096-d vector → features for the L2 ranker", cls="ink"))
    b.append(label(24, 270, "YouTube PLUM · semantic ID", cls="sid-ink", size=13))
    b.append(label(24, 290, "one discrete code; each level quantizes what the previous levels left over"))
    sizes = ["2,048", "1,024", "512", "256"]
    for i, s in enumerate(sizes + [None]):
        x = 24 + i * 146
        if s is None:   # PLUM gives the size rule but not the depth L, so the last box stays generic
            b.append(box(x, 300, 128, 56, "… level L", ["2,048 / 2^(L−1)"]))
        else:
            b.append(box(x, 300, 128, 56, f"level {i + 1}", [f"{s} codes"], hi=f"l{i + 1}"))
        if i < 4:
            b.append(path(f"M{x + 128} 328H{x + 144}"))
    b.append('<path class="edge" d="M24 372V378H298V372" fill="none"/>')
    b.append(label(24, 396, "prefix (c1, c2) → a neighborhood of similar videos; progressive masking trains every prefix", cls="ink"))
    b.append('<path class="edge" d="M24 408V414H736V408" fill="none"/>')
    b.append(label(24, 432, "all L codes → one video; the LLM generates them token by token", cls="ink"))
    b.append(label(24, 458, "Sizes follow PLUM's rule 2,048 / 2^(ℓ−1); the paper doesn't say how many levels L there are."))
    svg("fig-coarse-to-fine", 474,
        "Both go coarse to fine: LinkedIn cuts a vector by length, YouTube cuts a code by depth", b)


def muse():
    chain("fig-muse", "LinkedIn MUSE: one embedding model, used at two lengths",
          [("Recruiter query", ["free-text", "qualifications"]),
           ("Query understanding", ["LLM → role details", "+ qualifications"]),
           ("MUSE dual tower", ["shared LLM,", "Matryoshka InfoNCE"]),
           ("Retrieve, then rank", ["2,048-d IVFPQ ANN;", "4,096-d → DCNv2 ranker"])],
          note="Profiles are embedded offline (batch + daily CDC deltas); only the query is embedded at request time.",
          hi_index=2)


def plum():
    chain("fig-plum", "PLUM turns videos into SIDs, teaches an LLM their language, then generates them",
          [("1 · SID tokenizer", ["multi-modal RQ-VAE", "+ co-watch contrast"]),
           ("2 · Continued pre-train", ["Gemini MoE + SID", "tokens, logs + text"]),
           ("3 · Retrieval SFT", ["history → next SID,", "reward-sampled"]),
           ("4 · Beam search", ["decode many SIDs,", "map SID → video"])],
          note="Codebook size per level: 2048 / 2^(level−1). Progressive masking trains every prefix of the SID.",
          hi_index=0, hi_cls="sid")


def dual():
    b = [path("M184 136H206"), path("M368 136H380V86H390"), path("M368 136H380V186H390"),
         path("M552 86H564V120H574"), path("M552 186H564V152H574"),
         box(24, 98, 160, 76, "Content embedding", ["from a multimodal", "content model"]),
         box(208, 98, 160, 76, "Quantize to SID", ["RQ-VAE, K codes", "50–100× smaller"], hi="sid"),
         box(392, 48, 160, 76, "Collaborative ID", ["token / n-gram", "embedding tables"]),
         box(392, 148, 160, 76, "SiDec decoder", ["codebook sum + MLP", "→ content vector"], hi=True),
         box(576, 98, 160, 76, "Ranker / retriever", ["both streams as", "input features"])]
    svg("fig-dual-sid", 244, "One stored SID does two jobs: a learned ID and a rebuilt content vector", b)


def token_factory():
    chain("fig-token-factory", "Token Factory packs each watched item into one soft token",
          [("Item features", ["SID, channel,", "client, watch time"]),
           ("Token maker", ["MLP, co-trained", "→ 1 soft token"]),
           ("Compress (optional)", ["MLP over sequence", "or pool every K"]),
           ("LLM recommender", ["soft + text tokens", "rank or generate"])],
          note="A history item drops from 12 text tokens to 1 soft token; the ranking prompt shrinks from 1,536 to 480 tokens.",
          hi_index=1, hi_cls="key")


def personas():
    chain("fig-personas", "An LLM writes each user's interests in words, then they steer retrieval",
          [("Watch history", ["titles, grouped", "into clusters"]),
           ("Persona LLM", ["Gemini Nano,", "distilled from Pro"]),
           ("Interests", ["summary + explore,", "stored per user"]),
           ("Constrained kNN", ["sequential model", "→ candidates"])],
          note="Personas are rebuilt in the background when stale, so a live request never waits for the LLM.",
          hi_index=1, hi_cls="key")


def self_evolving():
    xs = [24, 170, 316, 462, 608]
    items = [("Offline agent", ["fast loop,", "proposes changes"]), ("Train and score", ["offline loss or", "proxy metric"]),
             ("Journal", ["every config", "+ its results"]), ("Online agent", ["slow loop, picks", "top-K to test"]),
             ("A/B test", ["live north-star", "metrics"])]
    b = []
    for i, (n, l) in enumerate(items):
        b.append(box(xs[i], 56, 128, 76, n, l, hi="key" if i == 2 else False))
        if i < 4:
            b.append(path(f"M{xs[i] + 128} 94H{xs[i + 1] - 2}"))
    b += [path("M672 132V156H392V134"), path("M368 132V180H88V134"),
          label(532, 150, "online metrics", "middle"), label(228, 174, "past results shape new ideas", "middle")]
    svg("fig-self-evolving", 200, "Two agent loops share one experiment journal", b)


def recevolve():
    xs = [24, 170, 316, 462, 608]
    items = [("Ideator", ["ideas from KB", "and literature"]), ("Critic", ["reviews each", "idea first"]),
             ("Coding agent", ["edits code on", "a new branch"]), ("Train and eval", ["2M-step TPU run", "NDCG, recall"]),
             ("Keep / revert", ["commit if better,", "else roll back"])]
    b = ['<rect class="key" x="24" y="48" width="712" height="40" rx="8"/>',
         label(380, 72, "Orchestrator + knowledge base: holds all state, sends each sub-agent its context", "middle", "ink", 13)]
    for i, (n, l) in enumerate(items):
        b.append(box(xs[i], 120, 128, 76, n, l))
        if i < 4:
            b.append(path(f"M{xs[i] + 128 + (2 if i == 0 else 0)} 158H{xs[i + 1] - 2}", both=(i == 0)))
    b += [path("M88 88V118"), path("M672 120V90"), label(96, 108, "context"), label(664, 108, "results", "end")]
    svg("fig-recevolve", 216, "Stateless sub-agents run the loop; the orchestrator holds the state", b)


if __name__ == "__main__":
    for f in (anchor_figure, muse, plum, dual, token_factory, personas, self_evolving, recevolve):
        f()
    print(sorted(p.name for p in OUT.glob("*.svg")))
