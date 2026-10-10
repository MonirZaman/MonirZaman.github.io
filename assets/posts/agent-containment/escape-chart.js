/* SandboxEscapeBench overall escape rates (Marchand et al., arXiv 2603.02277 v3, UK AI Security Institute).
 * Values and 95% Wilson intervals as reported for the original evaluation: 18 tasks, 5 attempts per model-task pair,
 * 2.5M-token budget. Only models with an overall rate stated in the paper's text are shown.
 * Single series, one hue; bars grow when scrolled into view; hover or focus a bar for its interval.
 * Usage: add an empty div with class "escape-chart", then load escape-chart.js with a script tag.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DATA = [
    { m: "GPT-5", v: .50, lo: .40, hi: .60 },
    { m: "Claude Opus 4.5", v: .49, lo: .39, hi: .59 },
    { m: "GPT-5.2", v: .27, lo: .19, hi: .37 },
    { m: "Claude Haiku 4.5", v: .18, lo: .11, hi: .27 },
    { m: "GPT-OSS-120B", v: .16, lo: .09, hi: .24 },
  ];
  const pct = x => Math.round(x * 100) + "%";
  const css = `
  .ecc{--ink:#1f2328;--quiet:#59636e;--muted:#8c959f;--edge:#d0d7de;--grid:#eaeef2;--bar:#0969da;--bg:#f6f8fa;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .ecc h4{margin:0 0 2px;font-size:15px}.ecc .sub{color:var(--quiet);font-size:12.5px;margin:0 0 10px}
  .ecc .plot{position:relative;background:#fff;border:1px solid var(--edge);border-radius:8px;padding:10px 14px 6px}
  .ecc .row{display:grid;grid-template-columns:118px 1fr;align-items:center;gap:10px;height:34px}
  .ecc .lab{font-size:13px;color:var(--ink);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ecc .trk{position:relative;height:100%}
  .ecc .g{position:absolute;top:0;bottom:0;width:1px;background:var(--grid)}
  .ecc .b{position:absolute;left:0;top:9px;height:16px;border-radius:0 4px 4px 0;background:var(--bar);width:0;transition:width .9s cubic-bezier(.2,.7,.2,1)}
  .ecc .ci{position:absolute;top:16px;height:2px;background:var(--ink);opacity:0;transition:opacity .4s .7s}
  .ecc .ci::before,.ecc .ci::after{content:"";position:absolute;top:-4px;width:2px;height:10px;background:var(--ink)}
  .ecc .ci::before{left:0}.ecc .ci::after{right:0}
  .ecc .val{position:absolute;top:7px;font:600 12.5px/20px -apple-system,"Segoe UI",sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;opacity:0;transition:opacity .4s .7s;white-space:nowrap}
  .ecc.on .ci,.ecc.on .val{opacity:1}
  .ecc .hit{position:absolute;inset:2px 0;cursor:default;outline:none;border-radius:4px}
  .ecc .hit:focus-visible{box-shadow:0 0 0 2px #0969da}
  .ecc .axis{display:grid;grid-template-columns:118px 1fr;gap:10px;height:18px}
  .ecc .axis .t{position:relative}.ecc .axis span{position:absolute;transform:translateX(-50%);font-size:11px;color:var(--quiet);font-variant-numeric:tabular-nums}
  .ecc .tip{position:absolute;pointer-events:none;background:#1f2328;color:#fff;font-size:12.5px;line-height:1.4;padding:6px 8px;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity .15s;z-index:3}
  .ecc .tip.show{opacity:1}
  .ecc .note{font-size:13px;color:var(--ink);margin:10px 0 0;padding-left:8px;border-left:3px solid var(--bar)}
  .ecc details{margin-top:8px;font-size:13px}.ecc summary{cursor:pointer;color:var(--quiet)}
  .ecc table{border-collapse:collapse;margin-top:6px;font-variant-numeric:tabular-nums}
  .ecc td,.ecc th{border:1px solid var(--edge);padding:3px 8px;text-align:left;font-size:13px}
  @media (max-width:480px){.ecc .row{grid-template-columns:1fr;height:auto;gap:0;margin-bottom:4px}.ecc .lab{text-align:left;font-size:12.5px}.ecc .trk{height:30px}.ecc .b{top:7px}.ecc .ci{top:14px}.ecc .val{top:5px}}
  @media (max-width:480px){.ecc .axis{grid-template-columns:1fr}.ecc .axis>div:first-child{display:none}}
  @media (prefers-reduced-motion: reduce){.ecc .b,.ecc .ci,.ecc .val{transition:none}}`;

  function mount(root) {
    if (!document.getElementById("ecc-css")) { const s = document.createElement("style"); s.id = "ecc-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("ecc");
    root.setAttribute("role", "figure"); root.setAttribute("aria-label", "Bar chart of SandboxEscapeBench escape rates by model");
    const ticks = [0, .25, .5, .75, 1];
    root.innerHTML = `<h4>How often frontier models escaped a weakened container</h4>
      <p class="sub">SandboxEscapeBench: share of attempts that broke out, 18 tasks × 5 attempts, 2.5M-token budget. Whiskers: 95% intervals.</p>
      <div class="plot">${DATA.map((d, i) => `<div class="row"><div class="lab" title="${d.m}">${d.m}</div><div class="trk">
          ${ticks.map(t => `<i class="g" style="left:${t * 100}%"></i>`).join("")}
          <div class="b" data-w="${d.v * 100}"></div>
          <div class="ci" style="left:${d.lo * 100}%;width:${(d.hi - d.lo) * 100}%"></div>
          <div class="val" style="left:calc(${d.hi * 100}% + 6px)">${pct(d.v)}</div>
          <div class="hit" tabindex="0" data-i="${i}" aria-label="${d.m}: ${pct(d.v)} escaped, 95% interval ${pct(d.lo)} to ${pct(d.hi)}"></div></div></div>`).join("")}
        <div class="axis"><div></div><div class="t">${ticks.map(t => `<span style="left:${t * 100}%;${t === 0 ? "transform:none" : t === 1 ? "transform:translateX(-100%)" : ""}">${pct(t)}</span>`).join("")}</div></div>
        <div class="tip" role="status"></div></div>
      <p class="note">With 100M-token budgets, Claude Mythos Preview succeeded on every task within five attempts.</p>
      <details><summary>Show as a table</summary><table><thead><tr><th>Model</th><th>Escaped</th><th>95% interval</th></tr></thead><tbody>
        ${DATA.map(d => `<tr><td>${d.m}</td><td>${pct(d.v)}</td><td>${pct(d.lo)}–${pct(d.hi)}</td></tr>`).join("")}</tbody></table></details>`;
    const plot = root.querySelector(".plot"), tip = root.querySelector(".tip"), bars = root.querySelectorAll(".b");
    const grow = () => { bars.forEach(b => b.style.width = b.dataset.w + "%"); root.classList.add("on"); };
    if (RM || !("IntersectionObserver" in window)) grow();
    else { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); grow(); } }, { threshold: .4 }); io.observe(root); }
    const show = el => {
      const d = DATA[+el.dataset.i], r = el.getBoundingClientRect(), pr = plot.getBoundingClientRect();
      tip.innerHTML = `<b>${d.m}</b><br>${pct(d.v)} of attempts escaped<br>95% interval ${pct(d.lo)}–${pct(d.hi)}`;
      tip.classList.add("show");
      const x = Math.min(pr.width - tip.offsetWidth - 4, Math.max(4, r.left - pr.left + r.width * d.v));
      tip.style.left = x + "px"; tip.style.top = (r.top - pr.top - tip.offsetHeight - 2) + "px";
    };
    root.querySelectorAll(".hit").forEach(h => {
      h.addEventListener("mouseenter", () => show(h)); h.addEventListener("focus", () => show(h));
      h.addEventListener("mouseleave", () => tip.classList.remove("show")); h.addEventListener("blur", () => tip.classList.remove("show"));
    });
  }
  document.querySelectorAll(".escape-chart").forEach(mount);
})();
