/* Figure: the same request run twice, once with the rule only in the prompt and once with a hook.
 * Story source: the header comment of AI-DLC's plan-approval guard (core/hooks/aidlc-plan-approval-guard.ts,
 * awslabs/aidlc-workflows), which records a field report of an agent writing code first and backfilling the plan.
 * The refusal text is AI-DLC's own (harness/claude/skills/aidlc/SKILL.md). Event order is simplified.
 * Usage: <div class="backfill-widget"></div> then load this file. Autoplays once when scrolled into view.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { prompt: "#bc4c00", hook: "#0969da", human: "#1a7f37", engine: "#6d28d9", bad: "#cf222e" };

  // each step adds one event to a lane; kind sets the colour
  const STEPS = [
    { lane: "both", kind: "human", who: "You", txt: "“Add rate limiting to the login endpoint.”",
      cap: "The same request goes to two agents. Both have been told: <i>write the code plan, get it approved, then write code.</i>" },
    { lane: "a", kind: "act", who: "Agent", txt: "Writes <code>src/auth/limiter.ts</code>",
      cap: "Left: the rule lives only in the instructions. The agent is eager and starts coding straight away." },
    { lane: "b", kind: "block", who: "Hook", txt: "Write refused (exit 2): “Nothing is built or changed while the plan waits for your approval.”",
      cap: "Right: the same write hits a hook. No approved plan exists, so the tool call is refused before anything changes." },
    { lane: "a", kind: "act", who: "Agent", txt: "Writes <code>code-summary.md</code>",
      cap: "Left: the code is done, so the agent summarises it." },
    { lane: "b", kind: "act", who: "Agent", txt: "Writes <code>code-generation-plan.md</code> and asks: Approve Plan?",
      cap: "Right: blocked, the agent does what it was supposed to do first: it writes the plan and asks you." },
    { lane: "a", kind: "bad", who: "Agent", txt: "Writes <code>code-generation-plan.md</code>, <b>after</b> the code",
      cap: "Left: it remembers the rule and writes a plan, describing code that already exists. The plan has become an output, not an input." },
    { lane: "b", kind: "human", who: "You", txt: "“Approve Plan”",
      cap: "Right: you read the plan and approve it, in a real message of your own." },
    { lane: "b", kind: "ok", who: "Hook", txt: "Write allowed: plan approved, bytes match",
      cap: "Right: now the same write passes. The approval is tied to the exact plan you read.", done: true },
  ];

  const css = `
  .bfw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);
    background:#f6f8fa;border:1px solid var(--edge);border-radius:12px;padding:14px 14px 12px;margin:1.5em 0}
  .bfw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .bfw .hd b{font-size:15px}.bfw .hd span{color:var(--quiet);font-size:12.5px}
  .bfw .lanes{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .bfw.narrow .lanes{grid-template-columns:1fr}
  .bfw .lane{background:#fff;border:1px solid var(--edge);border-radius:8px;padding:10px;min-height:250px}
  .bfw.narrow .lane{min-height:0}
  .bfw .lane h4{margin:0 0 8px;font-size:13.5px;display:flex;align-items:center;gap:6px}
  .bfw .lane h4 i{display:inline-block;width:10px;height:10px;border-radius:3px}
  .bfw .ev{border-left:4px solid var(--edge);background:#f6f8fa;border-radius:6px;padding:6px 8px;margin:6px 0;font-size:13.5px;animation:bfw-in .4s ease-out}
  .bfw .ev .w{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--quiet);display:block}
  .bfw .ev code{font-size:12px}
  .bfw .ev.human{border-color:${C.human}} .bfw .ev.act{border-color:#8c959f}
  .bfw .ev.block{border-color:${C.hook};background:#ddf4ff} .bfw .ev.ok{border-color:${C.hook};background:#eef9f0}
  .bfw .ev.bad{border-color:${C.bad};background:#ffebe9}
  .bfw .ev.cur{box-shadow:0 0 0 2px rgba(9,105,218,.25)}
  .bfw .empty{color:var(--quiet);font-size:13px;font-style:italic}
  .bfw .cap{min-height:3.2em;margin:10px 2px 8px;font-size:15px}
  .bfw .ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .bfw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .bfw button:disabled{opacity:.4;cursor:default}.bfw button.pri{border-color:#0969da;color:#0969da;font-weight:600}
  .bfw .dots{display:flex;gap:5px;margin-left:auto}.bfw .dots i{width:8px;height:8px;border-radius:50%;background:var(--edge)}.bfw .dots i.on{background:var(--ink)}
  .bfw .sum{display:none;margin-top:10px;padding:8px 10px;border-radius:8px;background:#fff;border:1px solid var(--edge);font-size:13.5px}
  .bfw .sum.show{display:block}
  @keyframes bfw-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){.bfw .ev{animation:none}}`;

  function mount(root) {
    if (!document.getElementById("bfw-css")) { const s = document.createElement("style"); s.id = "bfw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("bfw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Animated comparison: a process rule in the prompt versus enforced by a hook");
    root.innerHTML = `<div class="hd"><b>Same request, same rule, two outcomes</b><span>Based on a field report in AI-DLC’s source; simplified</span></div>
      <div class="lanes">
        <div class="lane" data-l="a"><h4><i style="background:${C.prompt}"></i>Rule in the prompt only</h4><div class="evs"></div></div>
        <div class="lane" data-l="b"><h4><i style="background:${C.hook}"></i>Rule enforced by a hook</h4><div class="evs"></div></div>
      </div>
      <p class="cap" aria-live="polite"></p>
      <div class="ctl"><button class="back" aria-label="Previous step">◀ Back</button><button class="play pri"></button>
        <button class="next" aria-label="Next step">Next ▶</button><div class="dots" aria-hidden="true">${STEPS.map(() => "<i></i>").join("")}</div></div>
      <div class="sum">Both agents had the same instructions. Only the one whose tool calls were checked by code wrote the plan first.</div>`;
    const lanes = { a: root.querySelector('[data-l="a"] .evs'), b: root.querySelector('[data-l="b"] .evs') };
    const cap = root.querySelector(".cap"), playB = root.querySelector(".play"), backB = root.querySelector(".back"),
      nextB = root.querySelector(".next"), dots = root.querySelectorAll(".dots i"), sum = root.querySelector(".sum");
    let step = -1, timer = null, playing = false;

    function render() {
      lanes.a.innerHTML = ""; lanes.b.innerHTML = "";
      STEPS.forEach((S, i) => {
        if (i > step) return;
        const targets = S.lane === "both" ? ["a", "b"] : [S.lane];
        targets.forEach(l => {
          const d = document.createElement("div");
          d.className = "ev " + S.kind + (i === step ? " cur" : "");
          d.innerHTML = `<span class="w">${S.who}</span>${S.txt}`;
          lanes[l].appendChild(d);
        });
      });
      ["a", "b"].forEach(l => { if (!lanes[l].children.length) lanes[l].innerHTML = '<p class="empty">Waiting for the request…</p>'; });
      cap.innerHTML = step < 0 ? "Press <b>Play</b> to run both agents, or step through." : `<b>${step + 1}/${STEPS.length}.</b> ` + STEPS[step].cap;
      dots.forEach((d, i) => d.classList.toggle("on", i <= step));
      backB.disabled = step <= 0; nextB.disabled = step >= STEPS.length - 1;
      sum.classList.toggle("show", step === STEPS.length - 1);
    }
    function go(k) { step = Math.max(-1, Math.min(STEPS.length - 1, k)); render(); }
    function setPlaying(p) {
      playing = p; clearTimeout(timer);
      playB.textContent = p ? "❚❚ Pause" : (step >= STEPS.length - 1 ? "↺ Replay" : "▶ Play");
      if (p) {
        if (step >= STEPS.length - 1) step = -1;
        const adv = () => { go(step + 1); if (step < STEPS.length - 1) timer = setTimeout(adv, 2900); else setPlaying(false); };
        adv();
      }
    }
    playB.onclick = () => setPlaying(!playing);
    backB.onclick = () => { setPlaying(false); go(step - 1); };
    nextB.onclick = () => { setPlaying(false); go(step + 1); };
    const fit = () => root.classList.toggle("narrow", root.clientWidth < 560);
    fit(); if (window.ResizeObserver) new ResizeObserver(fit).observe(root);
    if (RM) { go(STEPS.length - 1); setPlaying(false); return; }
    render(); setPlaying(false);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (step < 0) setPlaying(true); } }, { threshold: .5 });
      io.observe(root);
    }
  }
  document.querySelectorAll(".backfill-widget").forEach(mount);
})();
