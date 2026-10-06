/* Residual quantization explorer: a 2-D toy that shows how a semantic ID is built.
 * The three codebooks are fixed, hand-placed points (9 codes per level, a 3x3 grid that includes a zero code) so the geometry is
 * easy to see. Real systems (TIGER, PLUM) LEARN the codebooks with an RQ-VAE in hundreds of
 * dimensions; the encode rule shown here is the same:
 *   r0 = z;  c_l = argmin_k ||r_{l-1} - e^(l)_k||;  r_l = r_{l-1} - e^(l)_{c_l}
 * Usage: add an empty div with class "rq-widget", then load rq-widget.js with a script tag.
 */
(function () {
  // Each level is a 3x3 grid of codes (9 codes, including a zero code), each grid 3x finer than the last.
  // Because every level has a zero code, adding a level can never make the reconstruction worse.
  const grid = step => [-1, 0, 1].flatMap(j => [-1, 0, 1].map(i => [i * step, -j * step]));
  const BOOKS = [grid(2.6), grid(2.6 / 3), grid(2.6 / 9)];
  const W = 420, S = W / 8;                       // plane spans [-4, 4]
  const px = ([x, y]) => [W / 2 + x * S, W / 2 - y * S];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const norm = a => Math.hypot(a[0], a[1]);

  function encode(z) {
    let r = z, recon = [0, 0]; const steps = [];
    BOOKS.forEach(book => {
      let best = 0, bd = Infinity;
      book.forEach((e, k) => { const d = norm(sub(r, e)); if (d < bd) { bd = d; best = k; } });
      const base = recon; recon = add(recon, book[best]); r = sub(r, book[best]);
      steps.push({ code: best, base, recon, err: norm(sub(z, recon)) });
    });
    return steps;
  }

  const css = `
  .rqw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--grid:#eaeef2;--acc:#7c3aed;--z:#cf222e;--bg:#f6f8fa;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);
    border:1px solid var(--edge);border-radius:10px;padding:16px;margin:1.5em 0}
  .rqw h4{margin:0 0 6px;font-size:15px} .rqw .cap{color:var(--quiet);font-size:12.5px}
  .rqw .wrap{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}
  .rqw svg{width:100%;max-width:${W}px;height:auto;background:transparent;border:1px solid var(--edge);border-radius:8px;cursor:crosshair;touch-action:none}
  .rqw .side{flex:1;min-width:220px}
  .rqw .sid{font:600 18px ui-monospace,SFMono-Regular,Menlo,monospace;margin:6px 0 10px;display:flex;gap:4px}
  .rqw .sid span{padding:2px 9px;border-radius:5px;border:1.5px solid;background:#fff} .rqw .sid span.off{opacity:.3;border-style:dashed}
  .rqw table{border-collapse:collapse;width:100%;color:inherit;font:inherit} .rqw td{padding:3px 6px;border-top:1px solid var(--edge);color:inherit}
  .rqw button{font:inherit;padding:3px 10px;border-radius:6px;border:1px solid var(--edge);background:transparent;color:var(--ink);cursor:pointer}
  .rqw button[aria-pressed=true]{border-color:var(--acc);font-weight:600}`;

  function mount(root) {
    if (!document.getElementById("rqw-css")) {
      const s = document.createElement("style"); s.id = "rqw-css"; s.textContent = css; document.head.appendChild(s);
    }
    root.classList.add("rqw");
    root.innerHTML = `<h4>Try it: build a semantic ID by residual quantization</h4>
      <div class="cap">Click or drag anywhere to move the item <b style="color:var(--z)">z</b>. Each level picks the nearest code, then the next level quantizes what is left over.</div>
      <div class="wrap"><svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Residual quantization of a 2-D point"></svg>
      <div class="side"><div class="cap">Semantic ID</div><div class="sid"></div>
      <div class="cap">Use the first</div><div class="lv" role="group" aria-label="levels"></div>
      <table><tbody></tbody></table>
      <p class="cap">Toy: three hand-placed 3\u00d73 codebooks (9 codes each, coarse to fine) in 2-D. Real RQ-VAEs learn their codebooks in hundreds of dimensions, but encode exactly like this.</p></div></div>`;
    const svg = root.querySelector("svg"), sid = root.querySelector(".sid"), tb = root.querySelector("tbody"), lv = root.querySelector(".lv");
    let z = [1.9, 1.35], use = 3;
    [1, 2, 3].forEach(n => { const b = document.createElement("button"); b.textContent = n === 1 ? "1 code" : n + " codes"; b.onclick = () => { use = n; draw(); }; lv.appendChild(b); lv.append(" "); });
    const NS = "http://www.w3.org/2000/svg";
    const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
    const COLORS = ["#5b21b6", "#7c3aed", "#a78bfa"];   // violet = semantic IDs; darker = coarser level

    function draw() {
      svg.innerHTML = `<defs><marker id="rqa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>`;
      for (let g = -4; g <= 4; g++) {
        el("line", { x1: px([g, -4])[0], y1: 0, x2: px([g, -4])[0], y2: W, stroke: "var(--grid)" });
        el("line", { x1: 0, y1: px([0, g])[1], x2: W, y2: px([0, g])[1], stroke: "var(--grid)" });
      }
      el("circle", { cx: W / 2, cy: W / 2, r: 2.5, fill: "var(--quiet)" });
      const steps = encode(z);
      steps.slice(0, use).forEach((s, l) => {
        BOOKS[l].forEach((e, k) => {                       // codebook l, placed around the reconstruction so far
          const [x, y] = px(add(s.base, e));
          el("circle", { cx: x, cy: y, r: k === s.code ? 6 : 3.5, fill: k === s.code ? COLORS[l] : "none", stroke: COLORS[l], "stroke-width": 1.4, opacity: k === s.code ? 1 : 0.6 });
        });
        const [x1, y1] = px(s.base), [x2, y2] = px(s.recon);
        el("line", { x1, y1, x2, y2, stroke: COLORS[l], "stroke-width": 2.2, "marker-end": "url(#rqa)" });
      });
      const last = steps[use - 1], [rx, ry] = px(last.recon), [zx, zy] = px(z);
      el("line", { x1: rx, y1: ry, x2: zx, y2: zy, stroke: "var(--z)", "stroke-dasharray": "4 3", "stroke-width": 1.4 });
      el("circle", { cx: zx, cy: zy, r: 6, fill: "var(--z)" });
      const t = el("text", { x: zx + 9, y: zy - 8, fill: "var(--z)", "font-size": 14, "font-weight": 600 }); t.textContent = "z";

      sid.innerHTML = steps.map((s, i) => `<span class="${i < use ? "" : "off"}" style="color:${COLORS[i]};border-color:${COLORS[i]};background:${COLORS[i]}1a" title="level ${i + 1} code">${s.code}</span>`).join("");
      [...lv.querySelectorAll("button")].forEach((b, i) => b.setAttribute("aria-pressed", i + 1 === use));
      tb.innerHTML = steps.map((s, i) => `<tr style="opacity:${i < use ? 1 : .4}"><td>after level ${i + 1}</td><td>error ${s.err.toFixed(2)}</td></tr>`).join("");
    }
    function move(ev) {
      const r = svg.getBoundingClientRect(), k = W / r.width;
      const x = ((ev.clientX - r.left) * k - W / 2) / S, y = -((ev.clientY - r.top) * k - W / 2) / S;
      z = [Math.max(-3.9, Math.min(3.9, x)), Math.max(-3.9, Math.min(3.9, y))]; draw();
    }
    let down = false;
    svg.addEventListener("pointerdown", e => { down = true; svg.setPointerCapture(e.pointerId); move(e); });
    svg.addEventListener("pointermove", e => { if (down) move(e); });
    svg.addEventListener("pointerup", () => { down = false; });
    draw();
  }
  document.querySelectorAll(".rq-widget").forEach(mount);
})();
