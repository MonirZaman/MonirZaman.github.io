/* Figure: five structured agent workflows side by side, each as a small flow you can run.
 * Scenarios replay what happens when the agent tries to skip the plan, or to finish without review.
 * Sources: AI-DLC hooks and stages (awslabs/aidlc-workflows); Anthropic feature-dev command file
 * (anthropics/claude-plugins-official); GitHub Spec Kit command templates (github/spec-kit);
 * OpenAI Codex plugin for Claude Code README and hooks.json (openai/codex-plugin-cc);
 * Google Conductor skills and workflow.md (gemini-cli-extensions/conductor). Flows are simplified.
 * Step kinds: "" work step, "human" a person decides, "hook" code can refuse, "prompt" only instructions guard it.
 * Usage: <div class="systems-widget"></div> then load this file.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { prompt: "#bc4c00", engine: "#6d28d9", hook: "#0969da", human: "#1a7f37", bad: "#cf222e" };

  // plan: index of the "approve plan" step; code: index of the first coding step; rev: index of the review step
  const SYS = [
    { id: "aidlc", n: "AI-DLC", by: "AWS", col: C.engine,
      steps: [["Requirements", "human"], ["Design", ""], ["Code plan", ""], ["Approve plan", "human"], ["Write code", "hook"], ["Reviewer agents", ""], ["Build & test", ""], ["Approve", "human"]],
      plan: 3, code: 4, rev: 5,
      skip: ["block", "The write is refused by a hook until a person approves this exact plan."],
      nofin: ["back", "Review is a stage the engine routes through, so the work can’t move past it; ending early just pauses the run. In unattended runs a Stop hook also sends Claude back."],
      note: "A state machine picks every step; hooks refuse out-of-order writes." },
    { id: "fd", n: "feature-dev", by: "Anthropic", col: C.prompt,
      steps: [["Explore", ""], ["Questions", "human"], ["Architecture", "human"], ["Approve", "prompt"], ["Implement", ""], ["3 reviewers", ""], ["Summary", ""]],
      plan: 3, code: 4, rev: 5,
      skip: ["asked", "Only the instructions stand here: “DO NOT START WITHOUT USER APPROVAL”."],
      nofin: ["asked", "The review phase is a step in the instructions; nothing stops the agent finishing early."],
      note: "One command, seven phases; order and stops live in the prompt." },
    { id: "sk", n: "Spec Kit", by: "GitHub (Microsoft)", col: C.prompt,
      steps: [["Constitution", ""], ["Specify", ""], ["Clarify", "human"], ["Plan", ""], ["Tasks", ""], ["Checklists", "prompt"], ["Implement", ""]],
      plan: 5, code: 6, rev: null,
      skip: ["asked", "Implement checks your checklists and is told to stop and ask if any are open. Extensions can add real hooks."],
      nofin: ["none", "No built-in review step after implementing; an analyze step checks the documents before it."],
      note: "Slash commands and templates; spec-driven, documents first." },
    { id: "cx", n: "Codex plugin", by: "OpenAI", col: C.hook,
      steps: [["Claude works", ""], ["Tries to finish", ""], ["Codex review", "hook"], ["Done", ""]],
      plan: null, code: 0, rev: 2,
      skip: ["none", "No planning step: the plugin adds review, not a process. Claude starts straight away."],
      nofin: ["block", "With the review gate on, a Stop hook runs a Codex review and blocks the finish if it finds issues."],
      note: "A second model reviews Claude’s work, on demand or as a gate." },
    { id: "cd", n: "Conductor", by: "Google", col: C.prompt,
      steps: [["Context", ""], ["Spec & plan", ""], ["Review plan", "prompt"], ["Tests first", ""], ["Implement", ""], ["Phase check", "human"]],
      plan: 2, code: 3, rev: 5,
      skip: ["asked", "You review the plan before work starts, but only the instructions hold the agent to it."],
      nofin: ["asked", "Each phase ends with a manual verification plan for you; the instructions ask the agent to stop for it."],
      note: "Project context and plans live as Markdown in your repo." },
  ];
  const OUT = {
    block: ["Stopped by code", C.hook, "#ddf4ff"],
    back: ["Held by the engine", C.engine, "#f5f0ff"],
    asked: ["Only the prompt asks", C.prompt, "#fff4ec"],
    none: ["Not covered by this tool", "#59636e", "#eaeef2"],
    ok: ["Runs to the end", C.human, "#eef9f0"],
  };
  const SC = [
    { id: "normal", label: "▶ Normal run", q: "Normal run: every step in order.",
      t: "All five share the same broad shape: decide what to build, build it, check it." },
    { id: "skip", label: "What if the agent skips the plan?", q: "The agent jumps straight to writing code. What stops it?",
      t: "Only AI-DLC refuses the write in code. feature-dev, Spec Kit and Conductor rely on their instructions; the Codex plugin doesn’t manage planning at all." },
    { id: "nofin", label: "What if it finishes without review?", q: "The agent tries to wrap up before any review. What stops it?",
      t: "Two enforce review outside the model: AI-DLC’s engine won’t route past it, and the Codex plugin’s Stop hook blocks the finish. Spec Kit has no review step after implementing." },
  ];

  const css = `
  .syw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;font:14px/1.45 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);
    background:#f6f8fa;border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .syw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .syw .hd b{font-size:15px}.syw .hd span{color:var(--quiet);font-size:12.5px}
  .syw .sc{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
  .syw button{font:inherit;font-size:13px;padding:4px 10px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .syw button[aria-pressed="true"]{border-color:#1f2328;font-weight:600}
  .syw .key{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--quiet);margin:0 0 10px}
  .syw .key i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-2px;background:#fff;border:2px solid}
  .syw .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
  .syw .card{background:#fff;border:1px solid var(--edge);border-top:4px solid;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column}
  .syw .card h4{margin:0;font-size:15px}.syw .card h4 small{font-weight:400;color:var(--quiet);font-size:12.5px}
  .syw .card .nt{font-size:12.5px;color:var(--quiet);margin:1px 0 6px}
  .syw .flow{display:flex;flex-wrap:wrap;align-items:center;gap:4px 2px;margin-bottom:6px}
  .syw .st{font-size:12px;padding:2px 7px;border-radius:11px;border:1.5px solid #d0d7de;background:#f6f8fa;white-space:nowrap;transition:background .25s,border-color .25s,box-shadow .25s,opacity .25s}
  .syw .st.human{border-color:${C.human}} .syw .st.hook{border-color:${C.hook};border-width:2.5px} .syw .st.prompt{border-color:${C.prompt};border-style:dashed}
  .syw .ar{color:#8c959f;font-size:11px}
  .syw .st.on{background:#1f2328;color:#fff;border-color:#1f2328;box-shadow:0 0 0 3px rgba(31,35,40,.15)}
  .syw .st.done{background:#eaeef2}
  .syw .st.skipped{opacity:.35;text-decoration:line-through}
  .syw .st.hit{background:#ffebe9;border-color:${C.bad};color:${C.bad};font-weight:700}
  .syw .st.warn,.syw .st.warn.on{background:#fff4ec;color:${C.prompt};border-color:${C.prompt};border-style:dashed;font-weight:700;box-shadow:none}
  .syw.narrow .card .nt{display:none}
  .syw .q{margin:0 0 8px;font-size:14.5px;font-weight:600}
  .syw .tk{margin:10px 2px 0;font-size:14px;padding:8px 10px;background:#fff;border:1px solid var(--edge);border-radius:8px;opacity:0;transition:opacity .3s}
  .syw .tk.show{opacity:1}
  .syw .out{margin-top:auto;border-radius:6px;padding:5px 8px;font-size:12.5px;min-height:2.9em;opacity:.35;transition:opacity .3s}
  .syw .out.show{opacity:1}
  .syw .out b{display:block;font-size:12.5px}
  @media (prefers-reduced-motion: reduce){.syw .st,.syw .out,.syw .tk{transition:none}}`;

  function mount(root) {
    if (!document.getElementById("syw-css")) { const s = document.createElement("style"); s.id = "syw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("syw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Interactive: five agent workflows side by side");
    root.innerHTML = `<div class="hd"><b>Five workflows, side by side</b><span>Simplified from each project’s source</span></div>
      <div class="sc">${SC.map(s => `<button data-s="${s.id}" aria-pressed="false">${s.label}</button>`).join("")}</div>
      <div class="key"><span><i style="border-color:${C.human}"></i>a person decides</span><span><i style="border-color:${C.hook};border-width:3px"></i>code can refuse</span>
        <span><i style="border-color:${C.prompt};border-style:dashed"></i>only the prompt asks</span></div>
      <p class="q" aria-live="polite"></p>
      <div class="grid">${SYS.map(S => `<div class="card" data-id="${S.id}" style="border-top-color:${S.col}">
        <h4>${S.n} <small>· ${S.by}</small></h4><div class="nt">${S.note}</div>
        <div class="flow">${S.steps.map((st, i) => (i ? '<span class="ar" aria-hidden="true">→</span>' : "") + `<span class="st ${st[1]}">${st[0]}</span>`).join("")}</div>
        <div class="out" aria-live="polite"></div></div>`).join("")}</div>
      <p class="tk"></p>`;
    let timers = [];
    function clear() { timers.forEach(clearTimeout); timers = []; }

    function run(sid, animate) {
      clear();
      root.querySelectorAll(".sc button").forEach(b => b.setAttribute("aria-pressed", b.dataset.s === sid));
      const T = animate && !RM ? 520 : 0;
      const SCN = SC.find(x => x.id === sid), qEl = root.querySelector(".q"), tkEl = root.querySelector(".tk");
      qEl.textContent = SCN.q; tkEl.classList.remove("show"); tkEl.innerHTML = "";
      let longest = 0;
      SYS.forEach(S => {
        const card = root.querySelector(`.card[data-id="${S.id}"]`), chips = [...card.querySelectorAll(".st")], out = card.querySelector(".out");
        chips.forEach(c => c.classList.remove("on", "done", "skipped", "hit", "warn"));
        out.className = "out"; out.innerHTML = "";
        // build the path of chip indices the run visits, and where it ends
        let path = [], end = "ok", hitAt = null, warnAt = null, skipped = [];
        const n = S.steps.length, all = [...Array(n).keys()];
        if (sid === "normal") path = all;
        if (sid === "skip") {
          const r = S.skip[0];
          if (S.plan === null) { path = all; end = "none"; }
          else {
            // the agent jumps from the start to the gate guarding code
            if (r === "block") { path = [0, S.code]; skipped = all.filter(i => i > 0 && i < S.code); hitAt = S.code; end = "block"; }
            else { path = [0, S.plan].concat(all.filter(i => i > S.plan)); skipped = all.filter(i => i > 0 && i < S.plan); warnAt = S.plan; end = r; }
          }
        }
        if (sid === "nofin") {
          const r = S.nofin[0];
          if (S.rev === null) { path = all; end = "none"; }
          else if (r === "block" || r === "back") {
            // the agent tries to stop before the review; code sends it to review
            path = all.filter(i => i < S.rev).concat([S.rev]); hitAt = null; warnAt = null; end = r;
          } else {
            path = all.filter(i => i < S.rev).concat([S.rev]); skipped = all.filter(i => i > S.rev); warnAt = S.rev; end = r;
          }
        }
        skipped.forEach(i => chips[i].classList.add("skipped"));
        path.forEach((ci, k) => {
          timers.push(setTimeout(() => {
            chips.forEach(c => c.classList.remove("on"));
            path.slice(0, k).forEach(j => chips[j].classList.add("done"));
            if (ci === hitAt) chips[ci].classList.add("hit");
            else if (ci === warnAt) chips[ci].classList.add("warn", "on");
            else chips[ci].classList.add("on");
          }, k * T));
        });
        timers.push(setTimeout(() => {
          if (warnAt !== null && sid === "nofin") chips[warnAt].classList.add("warn");
          const O = OUT[end];
          const txt = sid === "normal" ? "Every step runs in order." : (sid === "skip" ? S.skip[1] : S.nofin[1]);
          out.style.background = O[2]; out.innerHTML = `<b style="color:${O[1]}">${O[0]}</b>${txt}`; out.classList.add("show");
        }, path.length * T + (T ? 150 : 0)));
        longest = Math.max(longest, path.length * T + (T ? 150 : 0));
      });
      timers.push(setTimeout(() => { tkEl.innerHTML = "<b>Takeaway.</b> " + SCN.t; tkEl.classList.add("show"); }, longest + (T ? 300 : 0)));
    }
    root.querySelectorAll(".sc button").forEach(b => b.onclick = () => run(b.dataset.s, true));
    const fit = () => root.classList.toggle("narrow", root.clientWidth < 480);
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(root);
    if (RM || !("IntersectionObserver" in window)) run("skip", false);
    else {
      run("normal", false);
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); run("skip", true); } }, { threshold: .3 });
      io.observe(root);
    }
  }
  document.querySelectorAll(".systems-widget").forEach(mount);
})();
