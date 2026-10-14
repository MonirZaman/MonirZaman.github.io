/* Shared bench for the LLM-inference post's widgets.
 * Holds one model + hardware choice that every calculator reads, so numbers agree across figures.
 * Load this once, before any widget script.
 *
 * Numbers and where they come from:
 *  - Llama 3.1 8B / 70B / 405B shapes (layers, hidden size, KV heads, head dim): Llama 3 paper, Dubey et al. 2024 (arXiv 2407.21783).
 *    Parameter counts 8.03B / 70.6B from the released model cards.
 *  - H100 SXM: 80 GB, 3.35 TB/s, 989 TFLOPS dense BF16 (NVIDIA lists 1,979 with sparsity).
 *  - The desktop GPU and laptop entries are illustrative round numbers, not a specific product.
 *  - Efficiency assumptions: 80% of memory bandwidth in decode, 60% of peak FLOPS in prefill.
 */
window.LLMBench = window.LLMBench || (function () {
  var MODELS = {
    "8b":   { label: "Llama 3.1 8B",   P: 8.03e9, L: 32,  kvh: 8, qh: 32,  hd: 128, d: 4096,  ffn: 14336, vocab: 128256 },
    "70b":  { label: "Llama 3.1 70B",  P: 70.6e9, L: 80,  kvh: 8, qh: 64,  hd: 128, d: 8192,  ffn: 28672, vocab: 128256 },
    "405b": { label: "Llama 3.1 405B", P: 405e9,  L: 126, kvh: 8, qh: 128, hd: 128, d: 16384, ffn: 53248, vocab: 128256 }
  };
  var HW = {
    h100:   { label: "H100 SXM",               short: "H100",            bw: 3.35e12, fl: 989e12, mem: 80 },
    gpu24:  { label: "Desktop GPU, 24 GB (illustrative)", short: "24 GB desktop GPU", bw: 1.0e12,  fl: 165e12, mem: 24 },
    laptop: { label: "Laptop, 64 GB unified (illustrative)", short: "laptop", bw: 0.4e12, fl: 15e12, mem: 64 }
  };
  var state = { m: "8b", h: "h100" }, subs = [], pickers = [];
  var C = { ink: "#1f2328", quiet: "#59636e", edge: "#d0d7de", bg: "#f6f8fa", prefill: "#0969da", decode: "#bc4c00",
            kv: "#6d28d9", good: "#1a7f37", bad: "#cf222e", faint: "#eaeef2" };
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  var css = "" +
  ".lbw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--bg:#f6f8fa;font:14px/1.5 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;" +
  "color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px 14px 12px;margin:1.5em 0}" +
  ".lbw *{box-sizing:border-box}" +
  ".lbw .lb-hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}" +
  ".lbw .lb-hd b{font-size:15px}.lbw .lb-hd span{color:var(--quiet);font-size:12.5px}" +
  ".lbw .lb-pick{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}" +
  ".lbw select{font:13.5px -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;padding:4px 6px;border:1px solid var(--edge);border-radius:6px;background:#fff;color:var(--ink);max-width:100%}" +
  ".lbw .lb-ctrls{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 18px;margin-bottom:10px}" +
  ".lbw .lb-ctrl{display:flex;flex-direction:column;gap:2px;min-width:0}" +
  ".lbw .lb-ctrl .r{display:flex;justify-content:space-between;gap:8px;font-size:13px}" +
  ".lbw .lb-ctrl output{font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}" +
  ".lbw input[type=range]{width:100%;accent-color:#0969da}" +
  ".lbw .lb-ro{display:flex;flex-wrap:wrap;gap:1px;background:var(--edge);border:1px solid var(--edge);border-radius:8px;overflow:hidden;margin:10px 0 0}" +
  ".lbw .lb-ro div{flex:1 1 130px;background:#fff;padding:8px 10px;min-width:0}" +
  ".lbw .lb-ro b{display:block;font:600 17px/1.25 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}" +
  ".lbw .lb-ro span{font-size:12px;color:var(--quiet)}" +
  ".lbw .lb-btns{display:flex;gap:6px;flex-wrap:wrap}" +
  ".lbw button{font:13.5px -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}" +
  ".lbw button:hover{border-color:var(--quiet)}.lbw button:disabled{opacity:.45;cursor:default}" +
  ".lbw button.pri{background:var(--ink);color:#fff;border-color:var(--ink)}" +
  ".lbw button:focus-visible,.lbw select:focus-visible,.lbw input:focus-visible{outline:2px solid #0969da;outline-offset:2px}" +
  ".lbw .lb-seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--edge);border-radius:6px;overflow:hidden;align-self:flex-start}" +
  ".lbw .lb-seg button{border:0;border-radius:0;border-right:1px solid var(--edge)}.lbw .lb-seg button:last-child{border-right:0}" +
  ".lbw .lb-seg button[aria-pressed=true]{background:var(--ink);color:#fff}" +
  ".lbw .lb-cap{font-size:13px;color:var(--quiet);margin:8px 0 0;line-height:1.5}" +
  ".lbw .lb-warn{font-size:13px;color:#cf222e;margin:8px 0 0}" +
  ".lbw svg{display:block;width:100%;height:auto;background:#fff;border:1px solid var(--edge);border-radius:8px}" +
  ".lbw svg text{font:11px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#59636e}" +
  ".lbw .lb-bar{display:flex;height:18px;border-radius:5px;overflow:hidden;background:#fff;border:1px solid var(--edge)}" +
  ".lbw .lb-bar i{display:block;height:100%;transition:width .3s}" +
  ".lbw .lb-key{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--quiet);margin-top:4px}" +
  ".lbw .lb-key i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
  "@media (prefers-reduced-motion: reduce){.lbw *{transition:none!important;animation:none!important}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function get() { return { M: MODELS[state.m], H: HW[state.h], BWE: 0.8, FLE: 0.6 }; }
  function set(k, v) { state[k] = v; pickers.forEach(function (p) { p.m.value = state.m; p.h.value = state.h; }); subs.forEach(function (f) { f(); }); }
  function on(f) { subs.push(f); }
  function opts(obj, sel) { return Object.keys(obj).map(function (k) { return "<option value='" + k + "'" + (k === sel ? " selected" : "") + ">" + obj[k].label + "</option>"; }).join(""); }
  var pid = 0;
  function picker(host) {
    pid++;
    var d = document.createElement("div"); d.className = "lb-pick";
    d.innerHTML = "<label class='lb-sr' for='lbm" + pid + "' style='position:absolute;left:-9999px'>Model</label><select id='lbm" + pid + "'>" + opts(MODELS, state.m) + "</select>" +
      "<label for='lbh" + pid + "' style='position:absolute;left:-9999px'>Hardware</label><select id='lbh" + pid + "'>" + opts(HW, state.h) + "</select>";
    var m = d.querySelector("#lbm" + pid), h = d.querySelector("#lbh" + pid);
    m.onchange = function () { set("m", m.value); }; h.onchange = function () { set("h", h.value); };
    pickers.push({ m: m, h: h }); host.appendChild(d); return d;
  }
  function weightBytes(M, bits) { return M.P * (bits || 16) / 8; }
  function kvPerTok(M, bytes) { return 2 * M.L * M.kvh * M.hd * (bytes || 2); }
  function fmtT(s) { return s < 1e-3 ? (s * 1e6).toFixed(0) + " µs" : s < 1 ? (s * 1e3).toFixed(s < 0.01 ? 2 : 1) + " ms" : s < 60 ? s.toFixed(2) + " s" : (s / 60).toFixed(1) + " min"; }
  function fmtGB(b) { var g = b / 1e9; return g < 1 ? (g * 1000).toFixed(0) + " MB" : g < 10 ? g.toFixed(2) + " GB" : g.toFixed(1) + " GB"; }
  function fmtN(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "K" : Math.round(n).toLocaleString("en-US"); }
  function width(el, min, max) { var w = el.clientWidth - 30; return Math.max(min || 300, Math.min(max || 680, w || 640)); }
  function onResize(el, f) { if (window.ResizeObserver) { var last = 0; new ResizeObserver(function () { var w = el.clientWidth; if (Math.abs(w - last) > 8) { last = w; f(); } }).observe(el); } else window.addEventListener("resize", f); }
  function inView(el, f) {
    if (RM || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); f(); } }, { threshold: 0.45 });
    io.observe(el);
  }
  function card(el, cls, title, sub) {
    el.classList.add("lbw"); if (cls) el.classList.add(cls);
    el.innerHTML = "<div class='lb-hd'><b>" + title + "</b>" + (sub ? "<span>" + sub + "</span>" : "") + "</div>";
    return el;
  }
  return { MODELS: MODELS, HW: HW, C: C, RM: RM, get: get, set: set, on: on, picker: picker, weightBytes: weightBytes, kvPerTok: kvPerTok,
           fmtT: fmtT, fmtGB: fmtGB, fmtN: fmtN, width: width, onResize: onResize, inView: inView, card: card };
})();
