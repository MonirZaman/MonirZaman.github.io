/* Step-through animation of the GitHub MCP prompt-injection attack (Invariant Labs, May 2025).
 * Usage: add an empty div with class "story-widget", then load story-widget.js with a script tag.
 * Autoplays once when scrolled into view (unless the reader prefers reduced motion).
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { ink: "#1f2328", quiet: "#59636e", edge: "#d0d7de", data: "#6d28d9", untrusted: "#bc4c00", exfil: "#0969da", you: "#59636e" };

  const NODES = {
    stranger: { t: "Stranger", s: "the attacker" },
    you:      { t: "You", s: "the repo owner" },
    agent:    { t: "Your agent", s: "Claude + GitHub MCP" },
    pub:      { t: "Public repo", s: "anyone can open issues" },
    priv:     { t: "Private repos", s: "only you (and your agent)" },
  };
  // two layouts: wide (desktop) and tall (phones)
  const LAYOUTS = {
    wide: { vb: [680, 320], w: 156, h: 60, lab: true, pos: { stranger: [92, 56], you: [92, 264], agent: [330, 172], pub: [588, 56], priv: [588, 264] } },
    tall: { vb: [360, 504], w: 150, h: 58, lab: true, pos: { stranger: [90, 40], pub: [268, 158], agent: [96, 282], priv: [268, 398], you: [96, 466] } },
  };
  const EDGES = {
    e1: { a: "stranger", b: "pub", col: C.untrusted, off: -9, label: "writes issue #1" },
    e2: { a: "you", b: "agent", col: C.you, off: 0, label: "“look at my issues”" },
    e3: { a: "pub", b: "agent", col: C.untrusted, off: -11, label: "issue text" },
    e4: { a: "priv", b: "agent", col: C.data, off: 0, label: "private data" },
    e5: { a: "agent", b: "pub", col: C.data, off: -11, label: "opens PR #2" },
    e6: { a: "pub", b: "stranger", col: C.data, off: -9, label: "reads it" },
  };
  const STEPS = [
    { e: "e1", badge: ["pub", "untrusted", C.untrusted],
      cap: "A stranger opens an issue on your <b>public</b> repo. Hidden in its text: instructions addressed to any AI agent that reads it." },
    { e: "e2",
      cap: "You ask your agent something harmless: <i>“Have a look at the open issues in my public repo.”</i>" },
    { e: "e3", hijack: true,
      cap: "The agent reads the issue and treats the stranger’s instructions as part of its own task. It has been <span style='color:" + C.untrusted + ";font-weight:600'>hijacked</span>." },
    { e: "e4", badge: ["priv", "private data", C.data],
      cap: "Using <i>your</i> GitHub access, it reads your <b>private</b> repositories." },
    { e: "e5", badge: ["pub", "way out", C.exfil],
      cap: "It opens a pull request on the public repo containing what it found: a private project, a plan to relocate, a salary." },
    { e: "e6", done: true,
      cap: "The stranger reads the pull request. Every tool call was one the agent was allowed to make. Nothing was “hacked.”" },
  ];

  const css = `
  .stw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--bg:#f6f8fa;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
    color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px 14px 12px;margin:1.5em 0}
  .stw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px}
  .stw .hd b{font-size:15px}
  .stw .hd span{color:var(--quiet);font-size:12.5px}
  .stw svg{display:block;width:100%;height:auto;background:#fff;border:1px solid var(--edge);border-radius:8px}
  .stw .node rect{fill:#fff;stroke:#8c959f;stroke-width:1.5;transition:stroke .3s,fill .3s}
  .stw .node.on rect{stroke:var(--ink)}
  .stw .node.hijacked rect{stroke:${C.untrusted};stroke-width:2.5;fill:#fff4ec}
  .stw .node text.t{font-size:15px;font-weight:600;fill:var(--ink)}
  .stw .node text.s{font-size:11.5px;fill:var(--quiet)}
  .stw .edge line{stroke-width:2.2;transition:opacity .3s}
  .stw .edge.cur line{stroke-dasharray:7 6;animation:stw-march .8s linear infinite}
  .stw .edge text{font-size:12px;font-weight:600;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
  .stw .badge rect{rx:9}
  .stw .badge text{font-size:11px;font-weight:700;fill:#fff;letter-spacing:.02em}
  .stw .badge{animation:stw-pop .35s ease-out}
  @keyframes stw-march{to{stroke-dashoffset:-13}}
  @keyframes stw-pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .stw .cap{min-height:3.2em;margin:10px 2px 8px;font-size:15px;line-height:1.5}
  .stw .ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .stw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .stw button:disabled{opacity:.4;cursor:default}
  .stw button.pri{border-color:#0969da;color:#0969da;font-weight:600}
  .stw .dots{display:flex;gap:5px;margin-left:auto}
  .stw .dots i{width:8px;height:8px;border-radius:50%;background:var(--edge);transition:background .3s}
  .stw .dots i.on{background:var(--ink)}
  .stw .sum{display:none;margin-top:10px;padding:8px 10px;border-radius:8px;background:#fff;border:1px solid var(--edge);font-size:13.5px}
  .stw .sum.show{display:block;animation:stw-pop .4s ease-out}
  .stw .chip{display:inline-block;padding:0 7px;border-radius:9px;color:#fff;font-weight:700;font-size:12px;margin:0 2px}
  @media (prefers-reduced-motion: reduce){.stw .edge.cur line{animation:none}.stw .badge,.stw .sum.show{animation:none}}`;

  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  // point where the segment from the box centre towards (tx,ty) leaves a w x h box
  function exitPoint(cx, cy, tx, ty, w, h) {
    const dx = tx - cx, dy = ty - cy;
    const s = Math.min((w / 2 + 6) / Math.abs(dx || 1e-9), (h / 2 + 6) / Math.abs(dy || 1e-9));
    return [cx + dx * s, cy + dy * s];
  }

  function mount(root) {
    if (!document.getElementById("stw-css")) { const s = document.createElement("style"); s.id = "stw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("stw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Animated walkthrough of the GitHub MCP attack");
    root.innerHTML = `<div class="hd"><b>How a GitHub issue hijacked an agent</b><span>Reconstructed from Invariant Labs’ write-up</span></div>
      <div class="stage"></div><p class="cap" aria-live="polite"></p>
      <div class="ctl"><button class="back" aria-label="Previous step">◀ Back</button><button class="play pri"></button>
      <button class="next" aria-label="Next step">Next ▶</button><div class="dots" aria-hidden="true">${STEPS.map(() => "<i></i>").join("")}</div></div>
      <div class="sum">All three ingredients were present:
        <span class="chip" style="background:${C.data}">private data</span>
        <span class="chip" style="background:${C.untrusted}">untrusted content</span>
        <span class="chip" style="background:${C.exfil}">a way out</span>. Section 2 explains why that combination is the one to fear.</div>`;
    const stage = root.querySelector(".stage"), cap = root.querySelector(".cap"), playB = root.querySelector(".play"),
      backB = root.querySelector(".back"), nextB = root.querySelector(".next"), dots = root.querySelectorAll(".dots i"), sum = root.querySelector(".sum");

    let step = -1, timer = null, playing = false, raf = null, layoutKey = null, geo = null, svg = null;

    function build() {
      const key = stage.clientWidth < 520 ? "tall" : "wide";
      if (key === layoutKey && svg) return;
      layoutKey = key; const L = LAYOUTS[key];
      stage.innerHTML = "";
      svg = el("svg", { viewBox: `0 0 ${L.vb[0]} ${L.vb[1]}`, role: "img", "aria-label": "Diagram: stranger, you, your agent, public repo and private repos" }, stage);
      const gE = el("g", {}, svg), gN = el("g", {}, svg), gB = el("g", {}, svg);
      geo = { edges: {}, nodes: {}, L, gB, packet: null };
      for (const id in EDGES) {
        const E = EDGES[id], [ax, ay] = L.pos[E.a], [bx, by] = L.pos[E.b];
        let p1 = exitPoint(ax, ay, bx, by, L.w, L.h), p2 = exitPoint(bx, by, ax, ay, L.w, L.h);
        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), nx = -(p2[1] - p1[1]) / len, ny = (p2[0] - p1[0]) / len;
        p1 = [p1[0] + nx * E.off, p1[1] + ny * E.off]; p2 = [p2[0] + nx * E.off, p2[1] + ny * E.off];
        const g = el("g", { class: "edge", opacity: 0 }, gE);
        el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: E.col, "marker-end": "url(#stw-arr-" + id + ")" }, g);
        const defs = el("defs", {}, g), m = el("marker", { id: "stw-arr-" + id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
        el("path", { d: "M0 0L10 5L0 10z", fill: E.col }, m);
        const lo = E.off ? Math.sign(E.off) * 20 : 14, mx = (p1[0] + p2[0]) / 2 + nx * lo, my = (p1[1] + p2[1]) / 2 + ny * lo;
        const t = el("text", { x: mx, y: my + 4, "text-anchor": "middle", fill: E.col }, g); t.textContent = E.label;
        geo.edges[id] = { g, p1, p2 };
      }
      for (const id in NODES) {
        const [x, y] = L.pos[id], g = el("g", { class: "node" }, gN);
        el("rect", { x: x - L.w / 2, y: y - L.h / 2, width: L.w, height: L.h, rx: 10 }, g);
        const t = el("text", { x, y: y - 3, "text-anchor": "middle", class: "t" }, g); t.textContent = NODES[id].t;
        const s = el("text", { x, y: y + 15, "text-anchor": "middle", class: "s" }, g); s.textContent = NODES[id].s;
        geo.nodes[id] = g;
      }
      geo.packet = el("circle", { r: 7, opacity: 0, stroke: "#fff", "stroke-width": 2 }, svg);
      render(step, false);
    }

    function addBadge(nodeId, text, col, slot) {
      const L = geo.L, [x, y] = L.pos[nodeId], w = text.length * 6.6 + 16;
      const bx = x + L.w / 2 - w + 6 - slot * (w + 4), by = y - L.h / 2 - 11;
      const g = el("g", { class: "badge" }, geo.gB);
      el("rect", { x: bx, y: by, width: w, height: 18, fill: col, rx: 9 }, g);
      const t = el("text", { x: bx + w / 2, y: by + 13, "text-anchor": "middle" }, g); t.textContent = text;
    }

    function render(k, animate) {
      if (!geo) return;
      cancelAnimationFrame(raf);
      geo.gB.innerHTML = "";
      const slots = {};
      for (const id in geo.nodes) geo.nodes[id].setAttribute("class", "node");
      STEPS.forEach((S, i) => {
        const E = geo.edges[S.e];
        if (i < k) { E.g.setAttribute("opacity", .35); E.g.setAttribute("class", "edge"); }
        else if (i === k) { E.g.setAttribute("opacity", 1); E.g.setAttribute("class", "edge cur"); }
        else { E.g.setAttribute("opacity", 0); E.g.setAttribute("class", "edge"); }
        if (i <= k) {
          const ed = EDGES[S.e]; geo.nodes[ed.a].classList.add("on"); geo.nodes[ed.b].classList.add("on");
          if (S.badge) { const n = S.badge[0]; slots[n] = (slots[n] || 0); addBadge(n, S.badge[1], S.badge[2], slots[n]++); }
          if (S.hijack) geo.nodes.agent.classList.add("hijacked");
        }
      });
      cap.innerHTML = k < 0 ? "Press <b>Play</b> to watch the attack, or step through it." : `<b>${k + 1}/${STEPS.length}.</b> ` + STEPS[k].cap;
      dots.forEach((d, i) => d.classList.toggle("on", i <= k));
      backB.disabled = k <= 0; nextB.disabled = k >= STEPS.length - 1;
      sum.classList.toggle("show", k === STEPS.length - 1);
      // packet travelling along the current edge
      const P = geo.packet;
      if (k >= 0 && animate && !RM) {
        const E = geo.edges[STEPS[k].e]; P.setAttribute("fill", EDGES[STEPS[k].e].col);
        const t0 = performance.now(), dur = 1100;
        const tick = now => {
          const u = Math.min(1, (now - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          P.setAttribute("cx", E.p1[0] + (E.p2[0] - E.p1[0]) * e); P.setAttribute("cy", E.p1[1] + (E.p2[1] - E.p1[1]) * e);
          P.setAttribute("opacity", u < 1 ? 1 : 0);
          if (u < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } else P.setAttribute("opacity", 0);
    }

    function go(k, animate) { step = Math.max(-1, Math.min(STEPS.length - 1, k)); render(step, animate); }
    function setPlaying(p) {
      playing = p; clearTimeout(timer);
      playB.textContent = p ? "❚❚ Pause" : (step >= STEPS.length - 1 ? "↺ Replay" : "▶ Play");
      if (p) {
        if (step >= STEPS.length - 1) step = -1;
        const adv = () => { go(step + 1, true); if (step < STEPS.length - 1) timer = setTimeout(adv, 3200); else setPlaying(false); };
        adv();
      }
    }
    playB.onclick = () => setPlaying(!playing);
    backB.onclick = () => { setPlaying(false); go(step - 1, true); };
    nextB.onclick = () => { setPlaying(false); go(step + 1, true); };

    build(); setPlaying(false);
    if (window.ResizeObserver) new ResizeObserver(() => build()).observe(stage);
    if (!RM && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (step < 0) setPlaying(true); } }, { threshold: .55 });
      io.observe(root);
    }
  }

  document.querySelectorAll(".story-widget").forEach(mount);
})();
