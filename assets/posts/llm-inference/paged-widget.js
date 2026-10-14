/* Paged KV cache with prefix caching, after vLLM's PagedAttention (Kwon et al., 2023) as described in
 * "Inside vLLM: Anatomy of a High-Throughput LLM Inference System" (Gordić, 2025): fixed 16-token blocks,
 * a block table per request, a shared free pool, and reuse of full blocks whose token prefix matches.
 * Simplified: 32 blocks, one shared 48-token system prompt (exactly 3 blocks).
 * Usage: load bench.js, add <div class="paged-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C, NB = 32, BLK = 16;
  var COL = { A: "#1b7c83", B: "#bf3989", C: "#9a6700", D: "#57606a" };
  var STEPS = [
    { cap: "An empty pool of 32 blocks, 16 tokens each. Nothing is reserved up front." },
    { add: ["A", 48, 20], cap: "Request A arrives: a 48-token system prompt plus a 20-token question. It takes 5 blocks; the last is only partly full." },
    { add: ["B", 48, 40], cap: "Request B has the <i>same</i> system prompt. With prefix caching, its block table points at A's first 3 blocks (striped), so it only allocates blocks for its own 40 tokens." },
    { add: ["C", 0, 70], cap: "Request C has a different prompt, so nothing can be shared. It takes 5 blocks." },
    { grow: 16, cap: "Each request generates 16 tokens. Blocks are added only when a request's last block is full." },
    { done: "A", cap: "A finishes. Its own blocks return to the pool. The shared prompt blocks stay, because B still points at them." },
    { add: ["D", 48, 24], cap: "Request D arrives with the same system prompt and skips prefilling those 48 tokens entirely. Its new blocks reuse the slots A freed." }
  ];
  var css = ".pgw .grid{display:grid;grid-template-columns:repeat(16,minmax(0,1fr));gap:3px;margin:4px 0 10px}" +
    ".pgw.narrow .grid{grid-template-columns:repeat(8,minmax(0,1fr))}" +
    ".pgw .blk{aspect-ratio:1;border-radius:3px;background:#fff;border:1px solid #d0d7de;display:grid;place-items:center;font:600 9.5px ui-monospace,Menlo,Consolas,monospace;color:#fff;transition:background .3s}" +
    ".pgw .reqs{display:grid;gap:4px;font-size:13px}.pgw .rq{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}" +
    ".pgw .sw{display:inline-block;width:11px;height:11px;border-radius:2px}.pgw .bt{font:12px ui-monospace,Menlo,Consolas,monospace;color:#59636e}" +
    ".pgw .cap{min-height:3em}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function simulate(upto, share) {
    var blocks = new Array(NB).fill(null), reqs = {}, order = [], sysBlocks = null;
    function alloc(o) { for (var i = 0; i < NB; i++) if (!blocks[i]) { blocks[i] = o; return i; } return -1; }
    function fitOwn(r) {
      var need = Math.ceil(r.own / BLK);
      while (r.ob.length < need) { var i = alloc({ refs: [r.id], sys: false, fill: 0 }); if (i < 0) break; r.ob.push(i); }
      r.ob.forEach(function (b, k) { blocks[b].fill = Math.min(BLK, r.own - k * BLK); });
    }
    for (var s = 1; s <= upto; s++) {
      var S = STEPS[s];
      if (S.add) {
        var r = { id: S.add[0], sys: S.add[1], own: S.add[2], sb: [], ob: [] };
        if (r.sys) {
          if (share && sysBlocks && sysBlocks.every(function (b) { return blocks[b]; })) { r.sb = sysBlocks.slice(); r.sb.forEach(function (b) { blocks[b].refs.push(r.id); }); r.hit = true; }
          else { for (var k = 0; k < r.sys / BLK; k++) r.sb.push(alloc({ refs: [r.id], sys: true, fill: BLK })); if (!sysBlocks || !share) sysBlocks = r.sb.slice(); }
        }
        fitOwn(r); reqs[r.id] = r; order.push(r.id);
      }
      if (S.grow) order.forEach(function (id) { reqs[id].own += S.grow; fitOwn(reqs[id]); });
      if (S.done) {
        var d = reqs[S.done];
        d.sb.concat(d.ob).forEach(function (b) { var o = blocks[b]; o.refs = o.refs.filter(function (x) { return x !== d.id; }); if (!o.refs.length) blocks[b] = null; });
        order = order.filter(function (x) { return x !== d.id; }); delete reqs[d.id];
      }
    }
    return { blocks: blocks, reqs: reqs, order: order };
  }

  document.querySelectorAll(".paged-widget").forEach(function (el) {
    B.card(el, "pgw", "A paged KV cache, request by request", "16 tokens per block");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<label style='display:flex;gap:6px;align-items:center;font-size:13px;margin-bottom:6px;cursor:pointer'><input type='checkbox' class='sh' checked> prefix caching</label>" +
      "<div class='grid' aria-label='Physical KV blocks'></div><div class='reqs'></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>blocks in use</span></div><div><b class='v2'></b><span>blocks saved by sharing</span></div><div><b class='v3'></b><span>if each request reserved 2,048 tokens</span></div></div>" +
      "<p class='lb-cap cap'></p><div class='lb-btns'><button class='b-back'>Back</button><button class='b-next pri'>Next</button><button class='b-play'>Play</button></div>";
    var n = 0, timer = null, sh = body.querySelector(".sh");
    function render() {
      el.classList.toggle("narrow", el.clientWidth < 460);
      var R = simulate(n, sh.checked), used = 0, saved = 0;
      body.querySelector(".grid").innerHTML = R.blocks.map(function (o, i) {
        if (!o) return "<div class='blk' title='block " + i + ": free'></div>";
        used++; if (o.refs.length > 1) saved += o.refs.length - 1;
        var bg = o.refs.length > 1 ? "repeating-linear-gradient(45deg," + COL[o.refs[0]] + " 0 4px," + COL[o.refs[1]] + " 4px 8px)" : COL[o.refs[0]];
        var lab = o.refs.length > 1 ? "×" + o.refs.length : (o.fill < BLK ? o.fill : "");
        return "<div class='blk' style='background:" + bg + ";border-color:transparent;opacity:" + (o.fill < BLK ? .6 : 1) + "' title='block " + i + ": " + o.refs.join(", ") + ", " + o.fill + "/16 tokens'>" + lab + "</div>";
      }).join("");
      body.querySelector(".reqs").innerHTML = R.order.map(function (id) { var r = R.reqs[id];
        return "<div class='rq'><span class='sw' style='background:" + COL[id] + "'></span><b>" + id + "</b><span class='bt'>block table → [" + r.sb.concat(r.ob).join(", ") + "]</span>" +
          "<span class='bt'>" + (r.hit ? "cache hit: skipped prefill for " + r.sys + " prompt tokens" : "") + "</span></div>"; }).join("") || "<span class='bt'>no requests yet</span>";
      body.querySelector(".v1").textContent = used + " / " + NB;
      body.querySelector(".v2").textContent = saved;
      body.querySelector(".v3").textContent = (R.order.length * 2048 / BLK) + " blocks";
      body.querySelector(".cap").innerHTML = STEPS[n].cap + (!sh.checked && n >= 2 ? " <i>(Prefix caching is off, so the system prompt is stored again.)</i>" : "");
      body.querySelector(".b-back").disabled = n === 0; body.querySelector(".b-next").disabled = n === STEPS.length - 1; body.querySelector(".b-play").disabled = n === STEPS.length - 1;
    }
    function stop() { clearInterval(timer); timer = null; }
    body.querySelector(".b-next").onclick = function () { stop(); n = Math.min(STEPS.length - 1, n + 1); render(); };
    body.querySelector(".b-back").onclick = function () { stop(); n = Math.max(0, n - 1); render(); };
    function play() { if (timer) return; if (n === STEPS.length - 1) n = 0; timer = setInterval(function () { if (n >= STEPS.length - 1) { stop(); render(); return; } n++; render(); }, 1700); render(); }
    body.querySelector(".b-play").onclick = play;
    sh.onchange = render;
    if (B.RM) n = STEPS.length - 1;
    B.onResize(el, render); render(); B.inView(el, play);
  });
})();
