/* PLUM ablation explorer. Every number is Recall@10 from the PLUM paper's controlled comparison
 * (He et al., arXiv 2510.07784): neither LLM initialization nor continued pre-training (CPT) 0.19,
 * LLM initialization only 0.23, CPT only 0.27, both 0.28. Nothing is interpolated.
 * Usage: add an empty div with class "plum-widget", then load plum-widget.js with a script tag.
 */
(function () {
  const ROWS = [
    { init: false, cpt: false, r: 0.19, name: "Neither" },
    { init: true, cpt: false, r: 0.23, name: "LLM init only" },
    { init: false, cpt: true, r: 0.27, name: "CPT only" },
    { init: true, cpt: true, r: 0.28, name: "Both" },
  ];
  const css = `
  .plw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--acc:#7c3aed;--bg:#f6f8fa;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);
    border:1px solid var(--edge);border-radius:10px;padding:16px;margin:1.5em 0}
  .plw h4{margin:0 0 4px;font-size:15px} .plw .cap{color:var(--quiet);font-size:12.5px}
  .plw .tg{display:flex;flex-wrap:wrap;gap:8px 18px;margin:12px 0}
  .plw label{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none}
  .plw .sw{position:relative;width:38px;height:22px;border-radius:11px;background:#d0d7de;transition:background .2s;flex:none}
  .plw .sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 2px rgba(0,0,0,.25)}
  .plw input{position:absolute;opacity:0;width:1px;height:1px} .plw input:checked + .sw{background:var(--acc)} .plw input:checked + .sw::after{left:19px}
  .plw input:focus-visible + .sw{outline:2px solid var(--acc);outline-offset:2px}
  .plw .big{font-size:30px;font-weight:700;color:var(--acc);line-height:1.1} .plw .big small{font-size:14px;color:var(--quiet);font-weight:400;margin-left:6px}
  .plw .rows{margin-top:12px;display:grid;grid-template-columns:auto 1fr auto;gap:6px 10px;align-items:center}
  .plw .row-n{font-size:13px;color:var(--quiet);white-space:nowrap} .plw .row-n.on{color:var(--ink);font-weight:600}
  .plw .track{display:block;height:16px;background:#fff;border:1px solid var(--edge);border-radius:4px;overflow:hidden}
  .plw .fill{display:block;height:100%;background:#c4b5fd;transition:width .5s ease,background .2s} .plw .fill.on{background:var(--acc)}
  .plw .v{font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace}`;
  function mount(root) {
    if (!document.getElementById("plw-css")) {
      const s = document.createElement("style"); s.id = "plw-css"; s.textContent = css; document.head.appendChild(s);
    }
    root.classList.add("plw");
    root.innerHTML = `<h4>Try it: what each PLUM stage buys</h4>
      <div class="cap">Switch the two stages on and off. Recall@10 on next-video retrieval, from the paper's controlled comparison.</div>
      <div class="tg">
        <label><input type="checkbox" class="i"><span class="sw"></span>Start from a pre-trained LLM</label>
        <label><input type="checkbox" class="c"><span class="sw"></span>Continued pre-training on SIDs + text</label>
      </div>
      <div class="big" aria-live="polite"></div>
      <div class="rows"></div>
      <div class="cap" style="margin-top:10px">Source: PLUM, He et al. 2025 (arXiv 2510.07784). Bars start at zero.</div>`;
    const rows = root.querySelector(".rows"), big = root.querySelector(".big"), ci = root.querySelector(".i"), cc = root.querySelector(".c");
    const MAX = 0.30;
    ROWS.forEach(r => {
      rows.insertAdjacentHTML("beforeend", `<span class="row-n">${r.name}</span><span class="track"><span class="fill" style="width:0"></span></span><span class="v">${r.r.toFixed(2)}</span>`);
    });
    function render() {
      const cur = ROWS.find(r => r.init === ci.checked && r.cpt === cc.checked), base = ROWS[0].r;
      const lift = cur === ROWS[0] ? "the baseline" : `+${Math.round((cur.r / base - 1) * 100)}% over neither`;
      big.innerHTML = `${cur.r.toFixed(2)}<small>Recall@10 · ${lift}</small>`;
      const names = rows.querySelectorAll(".row-n"), fills = rows.querySelectorAll(".fill");
      ROWS.forEach((r, i) => { names[i].classList.toggle("on", r === cur); fills[i].classList.toggle("on", r === cur); fills[i].style.width = (r.r / MAX * 100) + "%"; });
    }
    ci.onchange = cc.onchange = render;
    requestAnimationFrame(render);
  }
  document.querySelectorAll(".plum-widget").forEach(mount);
})();
