/* Figure: the same bug meets five kinds of "done" check. Illustrative scenario.
 * The bug (calling fetch without its window receiver) is the example AI-DLC's Build and Test stage itself gives
 * of behaviour Node or a DOM emulator can't show (core/aidlc-common/stages/construction/build-and-test.md).
 * Check styles: feature-dev's reviewer agents (anthropics/claude-plugins-official), Conductor's manual verification
 * plan (gemini-cli-extensions/conductor workflow.md), Anthropic's "Effective harnesses for long-running agents".
 * Usage: <div class="done-widget"></div> then load this file.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { ok: "#1a7f37", bad: "#cf222e", warn: "#9a6700", quiet: "#59636e" };
  const ROWS = [
    { n: "Reviewer agents read the code", eg: "e.g. feature-dev’s quality review", out: "“Looks correct.”", v: "miss" },
    { n: "Unit tests in Node or jsdom", eg: "a common default", out: "12 passed, 0 failed", v: "miss" },
    { n: "AI-DLC Build and Test, no browser available", eg: "tests run; browser target needs a real browser", out: "Tests pass · browser target: Unverified", v: "flag" },
    { n: "You follow a manual verification plan", eg: "e.g. Conductor’s end-of-phase check", out: "You click Log in: nothing happens", v: "catch" },
    { n: "End-to-end test in a real browser", eg: "Anthropic’s harness; AI-DLC with Playwright", out: "TypeError: Illegal invocation", v: "catch" },
  ];
  const V = { miss: ["Reported done · bug ships", C.bad], flag: ["Not marked done · flagged", C.warn], catch: ["Bug caught", C.ok] };

  const css = `
  .dnw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);
    background:#f6f8fa;border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .dnw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .dnw .hd b{font-size:15px}.dnw .hd span{color:var(--quiet);font-size:12.5px}
  .dnw pre{background:#fff;border:1px solid var(--edge);border-radius:8px;padding:8px 10px;margin:0 0 8px;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-x:auto}
  .dnw pre .bug{background:#ffebe9;border-radius:3px}
  .dnw .r{display:grid;grid-template-columns:1.3fr 1.2fr 1fr;gap:8px;align-items:center;background:#fff;border:1px solid var(--edge);border-radius:8px;padding:8px 10px;margin:5px 0;transition:opacity .3s}
  .dnw.narrow .r{grid-template-columns:1fr;gap:3px}
  .dnw .r.wait{opacity:.45}
  .dnw .r b{font-size:13.5px}.dnw .r small{display:block;color:var(--quiet);font-size:12px}
  .dnw .o{font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#424a53}
  .dnw .chip{justify-self:start;font-size:12px;font-weight:700;color:#fff;border-radius:10px;padding:1px 9px;opacity:0;transition:opacity .3s}
  .dnw .chip.show{opacity:1}
  .dnw .ctl{margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .dnw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid #0969da;color:#0969da;font-weight:600;background:#fff;cursor:pointer}
  .dnw .tally{font-size:13.5px}
  @media (prefers-reduced-motion: reduce){.dnw .r,.dnw .chip{transition:none}}`;

  function mount(root) {
    if (!document.getElementById("dnw-css")) { const s = document.createElement("style"); s.id = "dnw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("dnw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Interactive: one bug against five kinds of done check");
    root.innerHTML = `<div class="hd"><b>One bug, five ways to say “done”</b><span>Illustrative; bug example from AI-DLC’s docs</span></div>
      <pre>// login.js, written by the agent
const send = window.fetch;          <span class="bug">// detached from window</span>
export async function logIn(user) {
  return send("/api/login", { method: "POST", body: JSON.stringify(user) });
}</pre>
      ${ROWS.map(r => `<div class="r wait"><div><b>${r.n}</b><small>${r.eg}</small></div><div class="o">${r.out}</div><span class="chip"></span></div>`).join("")}
      <div class="ctl"><button class="go">↺ Run the checks again</button><span class="tally" aria-live="polite"></span></div>`;
    const rs = root.querySelectorAll(".r"), tally = root.querySelector(".tally");
    let timers = [];
    function run(animate) {
      timers.forEach(clearTimeout); timers = []; tally.textContent = "";
      rs.forEach(r => { r.classList.add("wait"); r.querySelector(".chip").classList.remove("show"); });
      ROWS.forEach((R, i) => timers.push(setTimeout(() => {
        const r = rs[i], ch = r.querySelector(".chip");
        r.classList.remove("wait"); ch.textContent = V[R.v][0]; ch.style.background = V[R.v][1]; ch.classList.add("show");
        if (i === ROWS.length - 1) tally.innerHTML = "Under Node (and jsdom test setups that borrow Node’s fetch) the call works; browsers throw. Only a real browser, or a person, saw it.";
      }, animate && !RM ? 400 + i * 750 : 0)));
    }
    root.querySelector(".go").onclick = () => run(true);
    const fit = () => root.classList.toggle("narrow", root.clientWidth < 600);
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(root);
    if (RM || !("IntersectionObserver" in window)) run(false);
    else { run(false); rs.forEach(r => { r.classList.add("wait"); r.querySelector(".chip").classList.remove("show"); }); tally.textContent = "";
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); run(true); } }, { threshold: .4 }); io.observe(root); }
  }
  document.querySelectorAll(".done-widget").forEach(mount);
})();
