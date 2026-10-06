/* Beam-search explorer: generative retrieval over semantic-ID codes, one level at a time.
 * Toy model. The probabilities and the three-video catalog are invented to show the mechanism
 * PLUM describes (emit SID codes level by level, keep the best partial codes, look the finished
 * codes up in the catalog, where a code may name no video). Nothing here comes from a real model.
 * Usage: add an empty div with class "beam-widget", then load beam-widget.js with a script tag.
 */
(function () {
  // P(next code | prefix). Keys are prefixes joined by commas ("" is the empty prefix).
  const P = {
    "": { 7: .50, 3: .30, 12: .15, 1: .05 },
    "7": { 41: .60, 9: .30, 22: .10 }, "3": { 5: .70, 18: .20, 30: .10 },
    "12": { 1: .90, 4: .10 }, "1": { 1: 1.0 },
    "7,41": { 6: .45, 2: .35, 0: .20 }, "3,5": { 4: .80, 1: .20 }, "7,9": { 3: .50, 8: .50 },
  };
  const CATALOG = { "7,41,2": "video A", "3,5,4": "video B", "7,41,0": "video C" };   // (7, 41, 6) names nothing
  const LV = ["#5b21b6", "#7c3aed", "#a78bfa"], LV_INK = ["#4c1d95", "#5b21b6", "#6d28d9"];
  const W = 800, H = 384, COLX = [50, 200, 380, 560];

  function search(beam) {
    let beams = [{ code: [], p: 1 }]; const levels = [];
    for (let d = 0; d < 3; d++) {
      const cands = [];
      beams.forEach((b, bi) => {
        const dist = P[b.code.join(",")];
        Object.keys(dist).sort((a, c) => dist[c] - dist[a]).forEach(k => cands.push({ code: b.code.concat(+k), p: b.p * dist[k], parent: bi }));
      });
      cands.sort((a, b) => b.p - a.p);                 // stable: ties keep insertion order
      cands.forEach((c, i) => { c.kept = i < beam; });
      levels.push(cands); beams = cands.slice(0, beam);
    }
    return levels;
  }

  const css = `
  .bmw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--acc:#7c3aed;--ok:#1a7f37;--bad:#cf222e;--bg:#f6f8fa;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);
    border:1px solid var(--edge);border-radius:10px;padding:16px;margin:1.5em 0}
  .bmw h4{margin:0 0 4px;font-size:15px} .bmw .cap{color:var(--quiet);font-size:12.5px}
  .bmw .bar{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin:10px 0}
  .bmw .grp{display:flex;gap:4px;align-items:center}
  .bmw button{font:inherit;padding:3px 11px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .bmw button[aria-pressed=true]{border-color:var(--acc);color:var(--acc);font-weight:600}
  .bmw button:disabled{opacity:.4;cursor:default}
  .bmw .scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .bmw .hint{display:none;color:var(--quiet);font-size:12px;margin:2px 0 4px} @media (max-width:640px){.bmw .hint{display:block}}
  .bmw svg{display:block;width:100%;min-width:620px;height:auto;background:#fff;border:1px solid var(--edge);border-radius:8px}
  .bmw .say{min-height:3em;margin:10px 2px 0;font-size:14px}
  .bmw .say b.ok{color:var(--ok)} .bmw .say b.bad{color:var(--bad)}
  .bmw .dots{display:flex;gap:5px} .bmw .dots i{width:8px;height:8px;border-radius:50%;background:var(--edge)} .bmw .dots i.on{background:var(--acc)}`;

  function mount(root) {
    if (!document.getElementById("bmw-css")) {
      const s = document.createElement("style"); s.id = "bmw-css"; s.textContent = css; document.head.appendChild(s);
    }
    root.classList.add("bmw");
    root.innerHTML = `<h4>Try it: generate a semantic ID with beam search</h4>
      <div class="cap">Step through decoding. Each box is a partial code; its shade marks the level, as in the widget above.</div>
      <div class="bar"><span class="grp">Beam width <span class="bw"></span></span>
        <span class="grp"><button class="back" aria-label="Previous step">◂ Back</button><button class="next" aria-label="Next step">Next ▸</button>
        <button class="play">Play</button><button class="reset">Reset</button></span><span class="dots" aria-hidden="true"></span></div>
      <div class="hint">Swipe the tree sideways; it also scrolls to follow each step.</div><div class="scroll"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Beam search tree over semantic-ID codes"></svg></div>
      <div class="say" aria-live="polite"></div>
      <div class="cap">Toy model: the probabilities and the three-video catalog are invented to show the mechanism.</div>`;
    const svg = root.querySelector("svg"), say = root.querySelector(".say"), dots = root.querySelector(".dots");
    const NSTEP = 8;
    let beam = 2, step = 0, timer = null, levels = search(beam);
    for (let i = 0; i < NSTEP; i++) dots.appendChild(document.createElement("i"));
    [1, 2, 3].forEach(b => {
      const btn = document.createElement("button"); btn.textContent = b;
      btn.setAttribute("aria-label", "beam width " + b);
      btn.onclick = () => { beam = b; levels = search(b); draw(); };
      root.querySelector(".bw").appendChild(btn);
    });
    const NS = "http://www.w3.org/2000/svg";
    const el = (t, a, parent) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; };
    const txt = (x, y, s, a, parent) => { const e = el("text", Object.assign({ x, y }, a), parent); e.textContent = s; return e; };

    function chipW(n) { return n * 34 + 8; }
    function node(x, y, code, state, final) {
      // state: "live" | "kept" | "pruned"
      const g = el("g", { opacity: state === "pruned" ? 0.32 : 1 });
      const w = chipW(code.length), x0 = x - w / 2;
      el("rect", { x: x0, y: y - 15, width: w, height: 30, rx: 7, fill: "#fff",
        stroke: final ? (final.ok ? "#1a7f37" : "#cf222e") : (state === "kept" ? "#7c3aed" : "#8c959f"),
        "stroke-width": final || state === "kept" ? 2 : 1.2 }, g);
      code.forEach((c, i) => {
        el("rect", { x: x0 + 4 + i * 34, y: y - 11, width: 30, height: 22, rx: 4, fill: LV[i], "fill-opacity": .16, stroke: LV[i], "stroke-width": 1.2 }, g);
        txt(x0 + 19 + i * 34, y + 4.5, String(c), { "text-anchor": "middle", "font-size": 12.5, "font-weight": 600, fill: LV_INK[i], "font-family": "ui-monospace,SFMono-Regular,Menlo,monospace" }, g);
      });
      return g;
    }
    function draw() {
      svg.innerHTML = "";
      [...root.querySelectorAll(".bw button")].forEach((b, i) => b.setAttribute("aria-pressed", i + 1 === beam));
      [...dots.children].forEach((d, i) => d.classList.toggle("on", i <= step));
      root.querySelector(".back").disabled = step === 0; root.querySelector(".next").disabled = step === NSTEP - 1;
      ["level 1", "level 2", "level 3"].forEach((s, i) => txt(COLX[i + 1], 24, s, { "text-anchor": "middle", "font-size": 12, fill: LV_INK[i], "font-weight": 600 }));
      // root
      const ry = H / 2 + 10;
      el("circle", { cx: COLX[0], cy: ry, r: 16, fill: "#7c3aed", "fill-opacity": .14, stroke: "#7c3aed", "stroke-width": 1.5 });
      txt(COLX[0], ry + 34, "user history", { "text-anchor": "middle", "font-size": 11.5, fill: "#59636e" });
      const pos = [];
      let prevPos = [{ x: COLX[0] + 16, y: ry }];
      for (let l = 0; l < 3; l++) {
        if (step < 2 * l + 1) break;
        const pruneShown = step >= 2 * l + 2, cands = levels[l], n = cands.length;
        const gap = Math.min(42, (H - 70) / Math.max(n - 1, 1)), top = ry - gap * (n - 1) / 2;
        const here = cands.map((c, i) => ({ x: COLX[l + 1], y: top + i * gap, c }));
        here.forEach(h => {
          const par = prevPos[h.c.parent], x1 = h.x - chipW(h.c.code.length) / 2;
          const state = pruneShown ? (h.c.kept ? "kept" : "pruned") : "live";
          el("path", { d: `M${par.x} ${par.y} C${(par.x + x1) / 2} ${par.y} ${(par.x + x1) / 2} ${h.y} ${x1} ${h.y}`, fill: "none",
            stroke: state === "kept" ? "#7c3aed" : state === "pruned" ? "#d0d7de" : "#8c959f", "stroke-width": state === "kept" ? 2 : 1.2 });
          let final = null;
          if (l === 2 && step === NSTEP - 1 && h.c.kept) final = { ok: !!CATALOG[h.c.code.join(",")] };
          node(h.x, h.y, h.c.code, state, final);
          txt(h.x + chipW(h.c.code.length) / 2 + 6, h.y + 4, "p=" + h.c.p.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""),
            { "font-size": 11, fill: state === "pruned" ? "#afb8c1" : "#59636e" });
          if (final) {
            const name = CATALOG[h.c.code.join(",")];
            txt(h.x + chipW(3) / 2 + 52, h.y + 4.5, final.ok ? "→ " + name : "→ no such video",
              { "font-size": 12.5, "font-weight": 700, fill: final.ok ? "#1a7f37" : "#cf222e" });
          }
        });
        // only kept nodes become parents at the next level, in kept order
        prevPos = here.filter(h => h.c.kept).map(h => ({ x: h.x + chipW(h.c.code.length) / 2 + 54, y: h.y }));
        pos.push(here);
      }
      say.innerHTML = caption();
      // on narrow screens, keep the level being decoded in view
      const sc = root.querySelector(".scroll");
      if (sc.scrollWidth > sc.clientWidth + 4) {
        const lvl = step === 0 ? 0 : Math.min(3, Math.floor((step - 1) / 2) + 1);
        const x = COLX[lvl] / W * sc.scrollWidth - sc.clientWidth * 0.4;
        sc.scrollTo({ left: Math.max(0, x), behavior: "smooth" });
      }
    }
    function caption() {
      const B = beam, plural = B === 1 ? "" : "s";
      if (step === 0) return "The model has read the user's watch history. It must now <i>write</i> the next video's semantic ID, one code at a time. Press <b>Next</b>.";
      const l = Math.floor((step - 1) / 2);
      if (step === NSTEP - 1) {
        const fin = levels[2].filter(c => c.kept), ok = fin.filter(c => CATALOG[c.code.join(",")]).length;
        let s = `Look each finished code up in the catalog: <b class="${ok ? "ok" : "bad"}">${ok} of ${B}</b> name a real video. `;
        s += B === 1 ? "Greedy decoding (beam 1) followed the single most likely path into a code that names nothing, so this user gets no recommendation."
           : ok < B ? "The most plausible-looking code can still name nothing; PLUM reports fewer than 5% invalid codes after fine-tuning." : "";
        if (B < 3) s += " Try a wider beam.";
        return s;
      }
      if ((step - 1) % 2 === 0) return `Level ${l + 1}: extend every prefix in the beam with each possible next code. A partial code's score <i>p</i> is the product of its codes' probabilities.`;
      return `Keep the ${B} highest-scoring partial code${plural} (the beam); the rest are dropped and never revisited.`;
    }
    function go(d) { step = Math.max(0, Math.min(NSTEP - 1, step + d)); draw(); }
    function stop() { clearInterval(timer); timer = null; root.querySelector(".play").textContent = "Play"; }
    root.querySelector(".next").onclick = () => { stop(); go(1); };
    root.querySelector(".back").onclick = () => { stop(); go(-1); };
    root.querySelector(".reset").onclick = () => { stop(); step = 0; draw(); };
    root.querySelector(".play").onclick = () => {
      if (timer) return stop();
      if (step === NSTEP - 1) step = 0;
      root.querySelector(".play").textContent = "Pause"; draw();
      timer = setInterval(() => { if (step >= NSTEP - 1) return stop(); go(1); }, 1700);
    };
    draw();
  }
  document.querySelectorAll(".beam-widget").forEach(mount);
})();
