/* Lethal-trifecta explorer: toggle private data / untrusted content / a way out, or load an example agent.
 * The framing is Simon Willison's (June 2025). Example agents are illustrative, written by the author.
 * Usage: add an empty div with class "trifecta-widget", then load trifecta-widget.js with a script tag.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LEGS = {
    data:      { name: "Private data",      col: "#6d28d9", soft: "rgba(109,40,217,.13)", generic: "something worth stealing" },
    untrusted: { name: "Untrusted content", col: "#bc4c00", soft: "rgba(188,76,0,.12)",  generic: "text an attacker can write" },
    exfil:     { name: "A way out",         col: "#0969da", soft: "rgba(9,105,218,.12)",  generic: "a channel that leaves your control" },
  };
  const PRESETS = [
    { name: "The GitHub demo", on: { data: 1, untrusted: 1, exfil: 1 },
      d: { data: "your private repos", untrusted: "issues anyone can write", exfil: "pull requests on a public repo" } },
    { name: "Coding agent with internet", on: { data: 1, untrusted: 1, exfil: 1 },
      d: { data: "your codebase and its .env files", untrusted: "docs, READMEs and web pages it reads", exfil: "any outbound HTTP request" } },
    { name: "Inbox summarizer (can’t send)", on: { data: 1, untrusted: 1, exfil: 0 },
      d: { data: "your email", untrusted: "the emails strangers send you", exfil: "" },
      note: "Check the quiet exits too: a summary that renders a remote image, or a link the agent fetches, is also a way out." },
    { name: "Web research agent", on: { data: 0, untrusted: 1, exfil: 1 },
      d: { data: "", untrusted: "the open web", exfil: "the URLs it fetches" },
      note: "It can still be steered into doing something useless or embarrassing. It just has nothing of yours to leak." },
    { name: "Internal docs Q&A", on: { data: 1, untrusted: 0, exfil: 0 },
      d: { data: "company documents", untrusted: "", exfil: "" },
      note: "Watch the assumption that internal content is trusted: anyone who can edit a wiki page can write instructions." },
  ];
  const MISSING = {
    data: "There is nothing private for an injected instruction to steal.",
    untrusted: "An attacker has no way to give the agent orders.",
    exfil: "Even if the agent is tricked into reading your data, it can’t send it anywhere.",
  };

  const css = `
  .trw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--bg:#f6f8fa;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
    color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .trw h4{margin:0 0 8px;font-size:15px}
  .trw .presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
  .trw .presets button{font:inherit;font-size:13px;padding:3px 10px;border-radius:14px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .trw .presets button[aria-pressed=true]{border-color:var(--ink);font-weight:600}
  .trw .body{display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:16px;align-items:center}
  @media (max-width:560px){.trw .body{grid-template-columns:1fr}.trw svg{max-width:260px;margin:0 auto}}
  .trw svg{display:block;width:100%;height:auto}
  .trw circle.leg{transition:fill .35s,stroke .35s,stroke-dasharray .35s}
  .trw svg text{font-size:12.5px;font-weight:700}
  .trw .toggles{display:flex;flex-direction:column;gap:6px}
  .trw .tg{display:flex;align-items:flex-start;gap:10px;text-align:left;font:inherit;padding:7px 10px;border-radius:8px;border:1.5px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer;transition:border-color .25s,background .25s}
  .trw .tg .sw{flex:none;width:30px;height:18px;border-radius:9px;background:#d0d7de;position:relative;margin-top:2px;transition:background .25s}
  .trw .tg .sw::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .25s}
  .trw .tg[aria-pressed=true] .sw::after{transform:translateX(12px)}
  .trw .tg b{display:block;font-size:14px}
  .trw .tg small{color:var(--quiet);font-size:12.5px}
  .trw .verdict{margin-top:12px;padding:9px 12px;border-radius:8px;font-size:14.5px;border:1.5px solid;transition:background .3s,border-color .3s}
  .trw .verdict.bad{background:#ffebe9;border-color:#cf222e}
  .trw .verdict.ok{background:#dafbe1;border-color:#1a7f37}
  .trw .verdict .note{display:block;color:var(--quiet);font-size:13px;margin-top:4px}
  @keyframes trw-pulse{0%,100%{opacity:.25}50%{opacity:.85}}
  .trw .core{animation:trw-pulse 1.6s ease-in-out infinite}
  @media (prefers-reduced-motion: reduce){.trw .core{animation:none;opacity:.6}}`;

  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  // circle centres in a 250 x 230 box
  const CEN = { data: [130, 82], untrusted: [90, 146], exfil: [170, 146] }, R = 60;

  function mount(root) {
    if (!document.getElementById("trw-css")) { const s = document.createElement("style"); s.id = "trw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("trw");
    root.innerHTML = `<h4>Does this agent have the lethal trifecta?</h4>
      <div class="presets" role="group" aria-label="Example agents">${PRESETS.map((p, i) => `<button data-i="${i}" aria-pressed="false">${p.name}</button>`).join("")}</div>
      <div class="body"><div class="fig"></div><div class="toggles" role="group" aria-label="Ingredients"></div></div>
      <div class="verdict" aria-live="polite"></div>`;
    const fig = root.querySelector(".fig"), tgBox = root.querySelector(".toggles"), verdict = root.querySelector(".verdict");
    const svg = el("svg", { viewBox: "0 0 260 240", role: "img", "aria-label": "Three overlapping circles: private data, untrusted content, a way out" }, fig);
    const circles = {}, labels = {};
    const labelPos = { data: [130, 52], untrusted: [72, 226], exfil: [196, 226] };
    for (const k in LEGS) {
      circles[k] = el("circle", { class: "leg", cx: CEN[k][0], cy: CEN[k][1], r: R, "stroke-width": 2 }, svg);
    }
    for (const k in LEGS) { labels[k] = el("text", { x: labelPos[k][0], y: labelPos[k][1], "text-anchor": "middle" }, svg); labels[k].textContent = LEGS[k].name; }
    const core = el("circle", { class: "core", cx: 130, cy: 124, r: 14, fill: "#cf222e" }, svg);
    const pathD = "M 62 170 Q 92 72 130 104 Q 162 136 248 136";
    const path = el("path", { d: pathD, fill: "none", stroke: "#cf222e", "stroke-width": 2, "stroke-dasharray": "4 4" }, svg);
    const head = el("path", { d: "M256 136 l-10 -5.5 l0 11 z", fill: "#cf222e" }, svg);
    const dot = el("circle", { r: 5.5, fill: "#cf222e", stroke: "#fff", "stroke-width": 1.5 }, svg);
    const leakTxt = el("text", { x: 224, y: 120, "text-anchor": "middle", fill: "#cf222e" }, svg); leakTxt.textContent = "leak path";

    const state = { on: { data: 1, untrusted: 1, exfil: 1 }, preset: 0 };
    const tgs = {};
    for (const k in LEGS) {
      const b = document.createElement("button"); b.className = "tg"; b.type = "button";
      b.innerHTML = `<span class="sw"></span><span><b style="color:${LEGS[k].col}">${LEGS[k].name}</b><small></small></span>`;
      b.onclick = () => { state.on[k] = state.on[k] ? 0 : 1; state.preset = -1; draw(); };
      tgBox.appendChild(b); tgs[k] = b;
    }
    root.querySelectorAll(".presets button").forEach(b => b.onclick = () => { const p = PRESETS[+b.dataset.i]; state.on = { ...p.on }; state.preset = +b.dataset.i; draw(); });

    let raf = null, t0 = 0;
    function animate(now) {
      if (!t0) t0 = now;
      const L = path.getTotalLength(), u = ((now - t0) % 2200) / 2200, p = path.getPointAtLength(u * L);
      dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y);
      raf = requestAnimationFrame(animate);
    }

    function draw() {
      const P = state.preset >= 0 ? PRESETS[state.preset] : null, on = state.on;
      root.querySelectorAll(".presets button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === state.preset)));
      for (const k in LEGS) {
        const L = LEGS[k], c = circles[k];
        c.setAttribute("fill", on[k] ? L.soft : "rgba(140,149,159,.05)");
        c.setAttribute("stroke", on[k] ? L.col : "#afb8c1");
        c.setAttribute("stroke-dasharray", on[k] ? "0" : "5 5");
        labels[k].setAttribute("fill", on[k] ? L.col : "#8c959f");
        const b = tgs[k]; b.setAttribute("aria-pressed", String(!!on[k]));
        b.style.borderColor = on[k] ? L.col : ""; b.querySelector(".sw").style.background = on[k] ? L.col : "";
        const desc = P && P.d[k] ? P.d[k] : (on[k] ? L.generic : "not present");
        b.querySelector("small").textContent = on[k] ? desc : "not present";
      }
      const all = on.data && on.untrusted && on.exfil;
      [core, path, head, dot, leakTxt].forEach(n => n.style.display = all ? "" : "none");
      cancelAnimationFrame(raf); t0 = 0;
      if (all && !RM) raf = requestAnimationFrame(animate);
      else if (all) { const p = path.getPointAtLength(path.getTotalLength() * .6); dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); }
      if (all) {
        const d = P ? P.d : { data: "your data", exfil: "an outbound channel" };
        verdict.className = "verdict bad";
        verdict.innerHTML = `<b>All three are present.</b> One injected instruction can read ${d.data} and send it out through ${d.exfil}.`
          + `<span class="note">You probably can’t remove a leg from an agent like this. Control each one at runtime instead (sections 3 to 5).</span>`;
      } else {
        const miss = Object.keys(LEGS).filter(k => !on[k]);
        verdict.className = "verdict ok";
        verdict.innerHTML = `<b>No complete leak path.</b> ${miss.map(k => MISSING[k]).join(" ")}`
          + (P && P.note ? `<span class="note">${P.note}</span>` : "");
      }
    }
    draw();
  }

  document.querySelectorAll(".trifecta-widget").forEach(mount);
})();
