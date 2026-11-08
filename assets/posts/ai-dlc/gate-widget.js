/* Figure: what AI-DLC's PreToolUse hook checks before a write during Code Generation.
 * Sources (awslabs/aidlc-workflows): core/hooks/aidlc-plan-approval-guard.ts header comment (the three doors,
 * the evidence it requires, exit 2 to refuse), docs/guide/12-cli-commands.md (Guard Policy strict/relaxed/off,
 * CHANGE_ACCEPTED), docs/guide/04-phases-and-stages.md (a gate needs a real message from you).
 * The four checks are a simplified, reader-facing grouping of the guard's evidence rules.
 * Usage: <div class="gate-widget"></div> then load this file.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { hook: "#0969da", human: "#1a7f37", bad: "#cf222e", engine: "#6d28d9", quiet: "#59636e" };

  const CHECKS = [
    "Is this a write to your project’s code while Code Generation is running?",
    "Is there a code plan with test instructions?",
    "Did a person answer “Approve Plan” in a real message?",
    "Is the plan byte-for-byte the one that was approved?",
  ];
  // r: result per check: 1 pass, 0 fail, null not reached. v: verdict per policy
  const SCEN = [
    { id: "early", label: "Write code before any approval", call: "Write src/auth/limiter.ts",
      r: [1, 1, 0, null], v: { strict: "block", off: "block" },
      why: "No approval is on record. The write is refused and the agent is told to show you the plan question again." },
    { id: "self", label: "Agent records the approval itself", call: "Write src/auth/limiter.ts (after the agent logged “Approve Plan”)",
      r: [1, 1, 0, null], v: { strict: "block", off: "block" },
      why: "AI-DLC accepts a gate answer only when a real message from you backs it (its human-presence check, which Guard Policy never lowers). With no valid approval on record, the write is still refused." },
    { id: "ok", label: "Write after you approve", call: "Write src/auth/limiter.ts",
      r: [1, 1, 1, 1], v: { strict: "allow", off: "allow" },
      why: "Every check passes. The hook exits 0 and Claude Code runs the write." },
    { id: "edited", label: "Plan edited after you approved", call: "Write src/auth/limiter.ts (plan file changed since approval)",
      r: [1, 1, 1, 0], v: { strict: "block", off: "accept" },
      why: { strict: "Under <b>strict</b>, a changed plan reopens the approval: you are asked again.",
             off: "Under <b>relaxed</b> or <b>off</b>, the change is recorded once as a <code>CHANGE_ACCEPTED</code> audit row and the build continues." } },
    { id: "own", label: "Write to AI-DLC’s own records", call: "Write …/code-generation-plan.md (inside AI-DLC’s own record folder)",
      r: [0, null, null, null], v: { strict: "allow", off: "allow" },
      why: "Not your project’s code: AI-DLC’s own bookkeeping never meets this guard, so the plan itself can be written." },
  ];
  const VERD = {
    block: { t: "Refused · exit 2", col: C.bad, bg: "#ffebe9", sub: "Claude Code cancels the tool call; a PLAN_APPROVAL_BLOCKED event is logged" },
    allow: { t: "Allowed · exit 0", col: C.human, bg: "#eef9f0", sub: "The write goes ahead" },
    accept: { t: "Allowed · change recorded", col: C.engine, bg: "#f5f0ff", sub: "CHANGE_ACCEPTED written to the audit trail" },
  };

  const css = `
  .gtw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);
    background:#f6f8fa;border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .gtw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .gtw .hd b{font-size:15px}.gtw .hd span{color:var(--quiet);font-size:12.5px}
  .gtw .row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;align-items:center}
  .gtw .row .lb{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--quiet);margin-right:2px}
  .gtw button{font:inherit;font-size:13px;padding:4px 10px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .gtw button[aria-pressed="true"]{border-color:${C.hook};background:#ddf4ff;color:#0550ae;font-weight:600}
  .gtw .call{background:#fff;border:1px solid var(--edge);border-left:4px solid #8c959f;border-radius:8px;padding:7px 10px;font-size:13px;margin:4px 0 8px}
  .gtw .call code{font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-wrap:anywhere}
  .gtw ol{list-style:none;margin:0;padding:0}
  .gtw li{display:flex;gap:9px;align-items:flex-start;background:#fff;border:1px solid var(--edge);border-radius:8px;padding:7px 10px;margin:5px 0;font-size:13.5px;transition:opacity .3s,border-color .3s}
  .gtw li .m{flex:0 0 24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;background:#d0d7de;font-size:13px}
  .gtw li.pass .m{background:${C.human}} .gtw li.fail .m{background:${C.bad}} .gtw li.fail{border-color:${C.bad}}
  .gtw li.skip{opacity:.45} .gtw li.wait{opacity:.6}
  .gtw .vd{margin-top:8px;border-radius:8px;padding:9px 12px;border:2px solid;opacity:0;transition:opacity .35s}
  .gtw .vd.show{opacity:1}
  .gtw .vd b{font-size:15px}.gtw .vd small{display:block;color:var(--quiet);font-size:12.5px}
  .gtw .why{font-size:14px;margin:8px 2px 0;min-height:2.6em}
  @media (prefers-reduced-motion: reduce){.gtw li,.gtw .vd{transition:none}}`;

  function mount(root) {
    if (!document.getElementById("gtw-css")) { const s = document.createElement("style"); s.id = "gtw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("gtw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Interactive: the checks AI-DLC's hook runs before a write");
    root.innerHTML = `<div class="hd"><b>Inside one hook decision</b><span>From AI-DLC’s plan-approval guard; simplified</span></div>
      <div class="row sc"><span class="lb">Try</span>${SCEN.map(s => `<button data-s="${s.id}" aria-pressed="false">${s.label}</button>`).join("")}</div>
      <div class="row gp"><span class="lb">Guard Policy</span><button data-p="strict" aria-pressed="true">strict</button><button data-p="off" aria-pressed="false">relaxed / off</button></div>
      <div class="call">Tool call from Claude: <code class="cc"></code></div>
      <ol>${CHECKS.map((c, i) => `<li><span class="m">${i + 1}</span><span>${c}</span></li>`).join("")}</ol>
      <div class="vd" aria-live="polite"></div><p class="why"></p>`;
    const lis = root.querySelectorAll("li"), vd = root.querySelector(".vd"), why = root.querySelector(".why"), cc = root.querySelector(".cc");
    let scen = SCEN[0], pol = "strict", timers = [];

    function run(animate) {
      timers.forEach(clearTimeout); timers = [];
      root.querySelectorAll(".sc button").forEach(b => b.setAttribute("aria-pressed", b.dataset.s === scen.id));
      root.querySelectorAll(".gp button").forEach(b => b.setAttribute("aria-pressed", b.dataset.p === pol));
      cc.textContent = scen.call;
      lis.forEach(li => { li.className = "wait"; li.querySelector(".m").textContent = li.querySelector(".m").dataset.n || li.querySelector(".m").textContent; });
      vd.className = "vd"; why.innerHTML = "";
      const delay = animate && !RM ? 550 : 0;
      let t = 0;
      scen.r.forEach((r, i) => {
        timers.push(setTimeout(() => {
          const li = lis[i], m = li.querySelector(".m");
          m.dataset.n = m.dataset.n || String(i + 1);
          if (r === null) { li.className = "skip"; m.textContent = "–"; }
          else if (r === 1) { li.className = "pass"; m.textContent = "✓"; }
          else { li.className = "fail"; m.textContent = i === 0 ? "–" : "✗"; if (i === 0) li.className = "skip"; }
        }, t));
        t += delay;
      });
      timers.push(setTimeout(() => {
        const V = VERD[scen.v[pol]];
        vd.style.borderColor = V.col; vd.style.background = V.bg;
        vd.innerHTML = `<b style="color:${V.col}">${V.t}</b><small>${V.sub}</small>`;
        vd.classList.add("show");
        why.innerHTML = typeof scen.why === "string" ? scen.why : scen.why[pol];
      }, t));
    }
    root.querySelectorAll(".sc button").forEach(b => b.onclick = () => { scen = SCEN.find(s => s.id === b.dataset.s); run(true); });
    root.querySelectorAll(".gp button").forEach(b => b.onclick = () => { pol = b.dataset.p; run(true); });
    lis.forEach((li, i) => li.querySelector(".m").dataset.n = String(i + 1));
    run(false);
  }
  document.querySelectorAll(".gate-widget").forEach(mount);
})();
