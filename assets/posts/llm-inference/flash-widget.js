/* Standard attention vs. FlashAttention for one head of one layer during prefill.
 * Standard attention writes the full N×N score matrix to HBM and reads it back; FlashAttention streams
 * blocks of Q, K and V through on-chip SRAM and never stores the full matrix (Dao et al., 2022).
 * HBM traffic uses the orders of growth in the paper's Theorem 2: standard ~ N·d + N², FlashAttention ~ N²·d²/M,
 * with M = SRAM elements (H100: up to 228 KB shared memory per SM → ~116K bf16 values). Constants are dropped,
 * so read the traffic numbers as orders of magnitude.
 * Usage: load bench.js, add <div class="flash-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C, G = 8, NS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072], D = 128, MEL = 228 * 1024 / 2;
  var css = ".flw .row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}.flw.narrow .row{grid-template-columns:1fr}" +
    ".flw .grid{display:grid;grid-template-columns:repeat(" + G + ",1fr);gap:2px;max-width:260px;aspect-ratio:1;margin:0 auto}" +
    ".flw .t{border-radius:2px;background:#eaeef2;transition:background .2s,outline-color .2s;outline:2px solid transparent;outline-offset:-2px}" +
    ".flw .t.x{background:transparent}.flw .t.hbm{background:" + C.bad + ";opacity:.75}.flw .t.sram{background:" + C.good + ";outline-color:#1f2328}.flw .t.done{background:#d8f3e0}" +
    ".flw .mem{display:flex;gap:8px;margin-top:8px;font-size:12px}.flw .mem div{flex:1;border:1px solid #d0d7de;border-radius:6px;padding:5px 7px;background:#fff}" +
    ".flw .mem b{display:block;font:600 12px ui-monospace,Menlo,Consolas,monospace}.flw .gl{font-size:11.5px;color:#59636e;text-align:center;margin-top:4px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  document.querySelectorAll(".flash-widget").forEach(function (el) {
    B.card(el, "flw", "Attention without the giant matrix", "one head, one layer, prefill");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-seg md' role='group' aria-label='Algorithm' style='margin-bottom:10px'><button data-m='std' aria-pressed='false'>Standard attention</button><button data-m='fa' aria-pressed='true'>FlashAttention</button></div>" +
      "<div class='row'><div><div class='grid' aria-label='Score matrix, queries by keys'></div><div class='gl'>scores: queries (rows) × keys (columns), causal</div>" +
      "<div class='mem'><div><b class='m1'></b>on chip (SRAM)</div><div><b class='m2'></b>in HBM</div></div></div>" +
      "<div><div class='lb-ctrl'><div class='r'><label for='flN'>Sequence length N</label><output></output></div><input id='flN' type='range' min='0' max='7' value='3'></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>score matrix if stored (bf16)</span></div><div><b class='v2'></b><span>HBM traffic, standard (order of)</span></div><div><b class='v3'></b><span>HBM traffic, FlashAttention (order of)</span></div></div>" +
      "<p class='lb-cap cap'></p><div class='lb-btns'><button class='b-play pri'>Play</button><button class='b-reset'>Reset</button></div></div></div>";
    var mode = "fa", k = 0, timer = null, iN = body.querySelector("#flN"), q = function (c) { return body.querySelector(c); };
    var cells = []; for (var r = 0; r < G; r++) for (var c = 0; c < G; c++) { var d = document.createElement("div"); d.className = "t" + (c > r ? " x" : ""); q(".grid").appendChild(d); cells.push(d); }
    var order = []; for (r = 0; r < G; r++) for (c = 0; c <= r; c++) order.push(r * G + c);
    function draw() {
      cells.forEach(function (d, i) { var r = Math.floor(i / G), c = i % G; if (c > r) return; var idx = order.indexOf(i);
        d.className = "t" + (idx < k ? (mode === "std" ? " hbm" : (idx === k - 1 ? " sram" : " done")) : ""); });
      if (mode === "std") { q(".m1").textContent = "one tile at a time"; q(".m2").textContent = k ? k + " of " + order.length + " tiles stored" : "empty"; }
      else { q(".m1").textContent = k ? "Q, K, V blocks + one tile" : "empty"; q(".m2").textContent = "only Q, K, V and the output"; }
      q(".cap").innerHTML = mode === "std" ? "Standard attention computes every score, <b>writes the whole matrix to HBM</b>, then reads it back for the softmax and again to mix the values. At long N the matrix dwarfs everything else." :
        "FlashAttention loads a block of queries into SRAM, streams the key and value blocks past it, and keeps a running softmax. Each tile is used and discarded on chip (pale green), so <b>the full matrix never exists in HBM</b>. The result is exact, not an approximation.";
    }
    function stats() {
      var N = NS[+iN.value]; q("output").textContent = N.toLocaleString("en-US");
      var stdEl = N * D * 4 + N * N * 3, faEl = N * N * D * D / MEL;
      q(".v1").textContent = B.fmtGB(N * N * 2); q(".v2").textContent = B.fmtGB(stdEl * 2); q(".v3").textContent = B.fmtGB(Math.max(faEl, N * D * 4) * 2);
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() { if (timer) return; if (k >= order.length) k = 0; timer = setInterval(function () { if (k >= order.length) { stop(); return; } k++; draw(); }, 260); }
    body.querySelectorAll(".md button").forEach(function (bt) { bt.onclick = function () { mode = bt.dataset.m; body.querySelectorAll(".md button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); stop(); k = 0; draw(); play(); }; });
    q(".b-play").onclick = function () { stop(); k = 0; play(); }; q(".b-reset").onclick = function () { stop(); k = 0; draw(); };
    iN.oninput = stats;
    function lay() { el.classList.toggle("narrow", el.clientWidth < 560); }
    if (B.RM) k = order.length;
    B.onResize(el, lay); lay(); stats(); draw(); B.inView(el, play);
  });
})();
