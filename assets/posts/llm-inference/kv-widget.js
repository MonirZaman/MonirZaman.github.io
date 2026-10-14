/* GPU memory budget: weights vs. KV cache.
 * KV bytes per token = 2 (K and V) × layers × KV heads × head dim × bytes per value
 * (the formula in the llama.app "Prefill vs Decode" guide; Llama 3 shapes from bench.js).
 * Usage: load bench.js, add <div class="kv-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var CTX = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];
  document.querySelectorAll(".kv-widget").forEach(function (el) {
    B.card(el, "kvw", "What fits in GPU memory", "context × users × bytes");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'><div class='lb-ctrl'><div class='r'><label for='kvC'>Context per conversation</label><output class='oc'></output></div><input id='kvC' type='range' min='0' max='7' value='3'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='kvN'>Conversations at once</label><output class='on'></output></div><input id='kvN' type='range' min='1' max='128' value='16'></div>" +
      "<div class='lb-ctrl'><span style='font-size:13px'>Cache stored as</span><div class='lb-seg pr' role='group' aria-label='KV precision'><button data-b='2' aria-pressed='true'>bf16</button><button data-b='1' aria-pressed='false'>fp8</button></div></div></div>" +
      "<div class='lb-bar'><i class='bw' style='background:" + C.quiet + "'></i><i class='bk' style='background:" + C.kv + "'></i></div>" +
      "<div class='lb-key'><span><i style='background:" + C.quiet + "'></i>weights (bf16)</span><span><i style='background:" + C.kv + "'></i>KV cache</span><span class='cap2'></span></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>cache per token</span></div><div><b class='v2'></b><span>cache in total</span></div><div><b class='v3'></b><span>max conversations at this context</span></div></div>" +
      "<p class='lb-warn' hidden></p>";
    var bytes = 2, iC = body.querySelector("#kvC"), iN = body.querySelector("#kvN");
    function render() {
      var g = B.get(), M = g.M, H = g.H, ctx = CTX[+iC.value], n = +iN.value;
      body.querySelector(".oc").textContent = ctx.toLocaleString("en-US"); body.querySelector(".on").textContent = n;
      var per = B.kvPerTok(M, bytes), kv = per * ctx * n, w = B.weightBytes(M), cap = H.mem * 1e9, tot = Math.max(cap, w + kv);
      body.querySelector(".bw").style.width = (w / tot * 100) + "%"; body.querySelector(".bk").style.width = (kv / tot * 100) + "%";
      body.querySelector(".cap2").textContent = "full bar = " + (tot > cap ? B.fmtGB(tot) + " (over capacity)" : H.mem + " GB");
      body.querySelector(".v1").textContent = (per / 1024).toFixed(0) + " KB";
      body.querySelector(".v2").textContent = B.fmtGB(kv);
      var mx = Math.floor((cap * 0.9 - w) / (per * ctx)); body.querySelector(".v3").textContent = mx > 0 ? mx.toLocaleString("en-US") : "0";
      var wn = body.querySelector(".lb-warn");
      if (w > cap * 0.9) { wn.hidden = false; wn.textContent = "The weights alone don't fit. Quantize them (§8) or pick a smaller model."; }
      else if (w + kv > cap * 0.9) { wn.hidden = false; wn.textContent = "Over budget. A serving engine would make some requests wait, or pause one and recompute its cache later."; }
      else wn.hidden = true;
    }
    body.querySelectorAll(".pr button").forEach(function (bt) { bt.onclick = function () { bytes = +bt.dataset.b; body.querySelectorAll(".pr button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); render(); }; });
    iC.oninput = render; iN.oninput = render; B.on(render); render();
  });
})();
