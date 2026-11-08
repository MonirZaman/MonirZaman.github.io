/* Figure: how AI-DLC's state machine sits beside Claude Code. Claude asks the engine for the next move,
 * does that one move, reports the outcome, and the engine updates the state file.
 * Sources: harness/claude/skills/aidlc/SKILL.md (the next/report loop, directive kinds run-stage, ask, done)
 * and docs/guide/04-phases-and-stages.md in awslabs/aidlc-workflows. Command output is simplified.
 * Usage: <div class="loop-widget"></div> then load this file. Autoplays once when scrolled into view.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { ink: "#1f2328", quiet: "#59636e", edge: "#d0d7de", prompt: "#bc4c00", engine: "#6d28d9", hook: "#0969da", human: "#1a7f37" };

  const NODES = {
    you:    { t: "You", s: "the person" },
    claude: { t: "Claude", s: "does the work" },
    engine: { t: "AI-DLC engine", s: "a command-line tool" },
    state:  { t: "State file", s: "aidlc-state.md" },
  };
  const LAYOUTS = {
    wide: { vb: [680, 300], w: 160, h: 60, pos: { you: [110, 60], claude: [110, 240], engine: [560, 240], state: [560, 60] } },
    tall: { vb: [360, 470], w: 150, h: 58, pos: { you: [90, 50], claude: [90, 250], engine: [270, 250], state: [270, 420] } },
  };
  const EDGES = {
    next:   { a: "claude", b: "engine", col: C.engine, off: -12, label: "orchestrate next" },
    read:   { a: "engine", b: "state", col: C.engine, off: -12, label: "reads" },
    dir:    { a: "engine", b: "claude", col: C.engine, off: -12, label: "one directive" },
    work:   { a: "claude", b: "claude", col: C.prompt, label: "" },
    report: { a: "claude", b: "engine", col: C.engine, off: -12, label: "orchestrate report" },
    write:  { a: "engine", b: "state", col: C.engine, off: -12, label: "updates" },
    ask:    { a: "claude", b: "you", col: C.human, off: 12, label: "asks" },
    answer: { a: "you", b: "claude", col: C.human, off: 12, label: "“Approve”" },
  };
  const STEPS = [
    { e: "next", st: ["requirements-analysis", "not started"], dir: "$ aidlc engine orchestrate next",
      cap: "Claude doesn’t decide what comes next. It runs one command and asks the engine." },
    { e: "read", st: ["requirements-analysis", "not started"], dir: "engine reads the state file and the compiled stage graph",
      cap: "The engine looks at the record: which stage is current, what is approved, what is still to do." },
    { e: "dir", st: ["requirements-analysis", "in progress"], dir: '{ "kind": "run-stage", "stage": "requirements-analysis" }',
      cap: "It answers with exactly <b>one</b> move, as JSON. Asking twice gives the same answer." },
    { e: "work", st: ["requirements-analysis", "in progress"], dir: "Claude writes requirements.md (and may run its specialist agents)",
      cap: "Now Claude does the actual work. This is where the model’s judgement matters: good questions, good writing." },
    { e: "report", st: ["requirements-analysis", "in progress"], dir: "$ aidlc engine orchestrate report --stage requirements-analysis --result awaiting-approval",
      cap: "Claude reports how it went. It never edits the state file itself; the engine refuses direct status changes." },
    { e: "write", st: ["requirements-analysis", "awaiting approval"], dir: "engine records: awaiting approval",
      cap: "The engine updates the record. The next <code>next</code> will see fresh state." },
    { e: "ask", st: ["requirements-analysis", "awaiting approval"], dir: '{ "kind": "ask", "question": "Approve requirements?" }',
      cap: "The stage has a gate, so the next directive is a question for you. Claude shows it and ends its turn." },
    { e: "answer", st: ["requirements-analysis", "awaiting approval"], dir: "a hook records that this reply came from you",
      cap: "You answer in a real message. A hook notes the reply, so the agent can’t approve on your behalf." },
    { e: "report", st: ["requirements-analysis", "awaiting approval"], dir: "$ aidlc engine orchestrate report --stage requirements-analysis --result approved",
      cap: "Claude reports the approval…" },
    { e: "write", st: ["user-stories", "not started"], dir: "engine records: approved, next stage is user-stories", done: true,
      cap: "…and the engine moves the record on. Then the loop starts again with <code>next</code>, until the directive is <code>done</code>." },
  ];

  const css = `
  .lpw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);
    background:#f6f8fa;border:1px solid var(--edge);border-radius:12px;padding:14px 14px 12px;margin:1.5em 0}
  .lpw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px}
  .lpw .hd b{font-size:15px}.lpw .hd span{color:var(--quiet);font-size:12.5px}
  .lpw svg{display:block;width:100%;height:auto;background:#fff;border:1px solid var(--edge);border-radius:8px}
  .lpw .node rect{fill:#fff;stroke:#8c959f;stroke-width:1.5;transition:stroke .3s,fill .3s}
  .lpw .node.on rect{stroke:var(--ink);stroke-width:2}
  .lpw .node.busy rect{stroke:${C.prompt};fill:#fff4ec;stroke-width:2.5}
  .lpw .node text.t{font-size:15px;font-weight:600;fill:var(--ink)}.lpw .node text.s{font-size:11.5px;fill:var(--quiet)}
  .lpw .edge line{stroke-width:2.2}.lpw .edge.cur line{stroke-dasharray:7 6;animation:lpw-march .8s linear infinite}
  .lpw .edge:not(.cur) text{display:none}
  .lpw .edge text{font-size:12px;font-weight:600;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round}
  @keyframes lpw-march{to{stroke-dashoffset:-13}}
  .lpw .panels{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-top:8px}
  .lpw.narrow .panels{grid-template-columns:1fr}
  .lpw .pn{background:#fff;border:1px solid var(--edge);border-radius:8px;padding:6px 9px;font-size:12.5px;min-width:0}
  .lpw .pn b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--quiet)}
  .lpw .pn code{font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;color:${C.engine}}
  .lpw .pn .sv{font:12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  .lpw .cap{min-height:3.2em;margin:10px 2px 8px;font-size:15px}
  .lpw .ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .lpw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .lpw button:disabled{opacity:.4;cursor:default}.lpw button.pri{border-color:#0969da;color:#0969da;font-weight:600}
  .lpw .dots{display:flex;gap:5px;margin-left:auto}.lpw .dots i{width:8px;height:8px;border-radius:50%;background:var(--edge)}.lpw .dots i.on{background:var(--ink)}
  @media (prefers-reduced-motion: reduce){.lpw .edge.cur line{animation:none}}`;

  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  function exitPoint(cx, cy, tx, ty, w, h) {
    const dx = tx - cx, dy = ty - cy;
    const s = Math.min((w / 2 + 6) / Math.abs(dx || 1e-9), (h / 2 + 6) / Math.abs(dy || 1e-9));
    return [cx + dx * s, cy + dy * s];
  }

  function mount(root) {
    if (!document.getElementById("lpw-css")) { const s = document.createElement("style"); s.id = "lpw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("lpw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Animated loop between Claude, the AI-DLC engine, its state file and you");
    root.innerHTML = `<div class="hd"><b>The loop: ask, do one thing, report</b><span>From AI-DLC’s /aidlc skill; simplified</span></div>
      <div class="stage"></div>
      <div class="panels"><div class="pn"><b>Command or directive</b><code class="dv"></code></div>
        <div class="pn"><b>State file</b><div class="sv"></div></div></div>
      <p class="cap" aria-live="polite"></p>
      <div class="ctl"><button class="back" aria-label="Previous step">◀ Back</button><button class="play pri"></button>
        <button class="next" aria-label="Next step">Next ▶</button><div class="dots" aria-hidden="true">${STEPS.map(() => "<i></i>").join("")}</div></div>`;
    const stage = root.querySelector(".stage"), cap = root.querySelector(".cap"), dv = root.querySelector(".dv"), sv = root.querySelector(".sv"),
      playB = root.querySelector(".play"), backB = root.querySelector(".back"), nextB = root.querySelector(".next"), dots = root.querySelectorAll(".dots i");
    let step = -1, timer = null, playing = false, raf = null, layoutKey = null, geo = null;

    function build() {
      root.classList.toggle("narrow", root.clientWidth < 560);
      const key = stage.clientWidth < 520 ? "tall" : "wide";
      if (key === layoutKey && geo) return;
      layoutKey = key; const L = LAYOUTS[key];
      stage.innerHTML = "";
      const svg = el("svg", { viewBox: `0 0 ${L.vb[0]} ${L.vb[1]}`, role: "img", "aria-label": "Diagram: you, Claude, the AI-DLC engine and its state file" }, stage);
      const gE = el("g", {}, svg), gN = el("g", {}, svg);
      geo = { edges: {}, nodes: {}, L, packet: null };
      // merge edges that share the same endpoints into one drawn line per direction
      for (const id in EDGES) {
        const E = EDGES[id]; if (E.a === E.b) continue;
        const [ax, ay] = L.pos[E.a], [bx, by] = L.pos[E.b];
        let p1 = exitPoint(ax, ay, bx, by, L.w, L.h), p2 = exitPoint(bx, by, ax, ay, L.w, L.h);
        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), nx = -(p2[1] - p1[1]) / len, ny = (p2[0] - p1[0]) / len;
        p1 = [p1[0] + nx * E.off, p1[1] + ny * E.off]; p2 = [p2[0] + nx * E.off, p2[1] + ny * E.off];
        const g = el("g", { class: "edge", opacity: 0 }, gE);
        el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: E.col, "marker-end": "url(#lpw-arr-" + id + ")" }, g);
        const defs = el("defs", {}, g), m = el("marker", { id: "lpw-arr-" + id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto" }, defs);
        el("path", { d: "M0 0L10 5L0 10z", fill: E.col }, m);
        const lo = Math.sign(E.off) * 18, mx = (p1[0] + p2[0]) / 2 + nx * lo, my = (p1[1] + p2[1]) / 2 + ny * lo;
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
      render(false);
    }

    function render(animate) {
      if (!geo) return;
      cancelAnimationFrame(raf);
      for (const id in geo.nodes) geo.nodes[id].setAttribute("class", "node");
      for (const id in geo.edges) { geo.edges[id].g.setAttribute("opacity", .13); geo.edges[id].g.setAttribute("class", "edge"); }
      const S = STEPS[step], P = geo.packet;
      if (S) {
        const E = EDGES[S.e];
        geo.nodes[E.a].classList.add("on"); geo.nodes[E.b].classList.add("on");
        if (S.e === "work") geo.nodes.claude.classList.add("busy");
        const G = geo.edges[S.e];
        if (G) { G.g.setAttribute("opacity", 1); G.g.setAttribute("class", "edge cur"); }
        dv.textContent = S.dir;
        sv.innerHTML = `Current stage: ${S.st[0]}<br>Status: <span style="color:${C.engine};font-weight:700">${S.st[1]}</span>`;
        if (G && animate && !RM) {
          P.setAttribute("fill", E.col);
          const t0 = performance.now(), dur = 1000;
          const tick = now => {
            const u = Math.min(1, (now - t0) / dur), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
            P.setAttribute("cx", G.p1[0] + (G.p2[0] - G.p1[0]) * e); P.setAttribute("cy", G.p1[1] + (G.p2[1] - G.p1[1]) * e);
            P.setAttribute("opacity", u < 1 ? 1 : 0);
            if (u < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        } else P.setAttribute("opacity", 0);
      } else {
        dv.textContent = "/aidlc add rate limiting to login"; sv.innerHTML = "Current stage: requirements-analysis<br>Status: not started";
        P.setAttribute("opacity", 0);
      }
      cap.innerHTML = step < 0 ? "Press <b>Play</b> to watch one stage go round the loop." : `<b>${step + 1}/${STEPS.length}.</b> ` + S.cap;
      dots.forEach((d, i) => d.classList.toggle("on", i <= step));
      backB.disabled = step <= 0; nextB.disabled = step >= STEPS.length - 1;
    }
    function go(k, a) { step = Math.max(-1, Math.min(STEPS.length - 1, k)); render(a); }
    function setPlaying(p) {
      playing = p; clearTimeout(timer);
      playB.textContent = p ? "❚❚ Pause" : (step >= STEPS.length - 1 ? "↺ Replay" : "▶ Play");
      if (p) {
        if (step >= STEPS.length - 1) step = -1;
        const adv = () => { go(step + 1, true); if (step < STEPS.length - 1) timer = setTimeout(adv, 2900); else setPlaying(false); };
        adv();
      }
    }
    playB.onclick = () => setPlaying(!playing);
    backB.onclick = () => { setPlaying(false); go(step - 1, true); };
    nextB.onclick = () => { setPlaying(false); go(step + 1, true); };
    build();
    if (window.ResizeObserver) new ResizeObserver(() => build()).observe(stage);
    if (RM) { go(STEPS.length - 1, false); setPlaying(false); return; }
    setPlaying(false);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (step < 0) setPlaying(true); } }, { threshold: .5 });
      io.observe(root);
    }
  }
  document.querySelectorAll(".loop-widget").forEach(mount);
})();
