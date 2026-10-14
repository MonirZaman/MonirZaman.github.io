/* Latency of one request: TTFT (prefill) and output tokens × TPOT (decode).
 * TTFT  ≈ max((2·params·n + 2·layers·hidden·n²) / (0.6·FLOPS), weight bytes / (0.8·bandwidth))
 *         The n² term is causal attention (QKᵀ and AV, halved by the mask).
 * TPOT  ≈ (weight bytes + KV bytes at the average context) / (0.8·bandwidth)
 * Model/hardware from bench.js. Usage: load bench.js, add <div class="latency-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var INS = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
  var OUTS = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
  var PRESETS = [["Chat reply", 3, 4], ["Summarize a long doc", 8, 3], ["Write an essay", 1, 8]];
  document.querySelectorAll(".latency-widget").forEach(function (el) {
    B.card(el, "ltw", "Where one request spends its time", "try the presets");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-seg pre' role='group' aria-label='Presets' style='margin-bottom:10px'>" +
      PRESETS.map(function (p, i) { return "<button data-i='" + i + "' aria-pressed='" + (i === 0) + "'>" + p[0] + "</button>"; }).join("") + "</div>" +
      "<div class='lb-ctrls'><div class='lb-ctrl'><div class='r'><label for='ltIn'>Prompt tokens</label><output class='o-in'></output></div><input id='ltIn' type='range' min='0' max='9' value='3'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='ltOut'>Output tokens</label><output class='o-out'></output></div><input id='ltOut' type='range' min='0' max='8' value='4'></div></div>" +
      "<div class='lb-bar'><i class='b1' style='background:" + C.prefill + "'></i><i class='b2' style='background:" + C.decode + "'></i></div>" +
      "<div class='lb-key'><span><i style='background:" + C.prefill + "'></i>prefill → time to first token</span><span><i style='background:" + C.decode + "'></i>decode → output tokens × time per token</span></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>time to first token</span></div><div><b class='v2'></b><span>time per output token</span></div><div><b class='v3'></b><span>tokens/s while streaming</span></div><div><b class='v4'></b><span>end to end</span></div></div>" +
      "<p class='lb-cap'></p><p class='lb-warn' hidden></p>";
    var iIn = body.querySelector("#ltIn"), iOut = body.querySelector("#ltOut");
    function render() {
      var g = B.get(), M = g.M, H = g.H, nin = INS[+iIn.value], nout = OUTS[+iOut.value];
      body.querySelector(".o-in").textContent = nin.toLocaleString("en-US"); body.querySelector(".o-out").textContent = nout.toLocaleString("en-US");
      var lin = 2 * M.P * nin, att = 2 * M.L * M.d * nin * nin;
      var ttft = Math.max((lin + att) / (H.fl * g.FLE), B.weightBytes(M) / (H.bw * g.BWE));
      var tpot = (B.weightBytes(M) + B.kvPerTok(M) * (nin + nout / 2)) / (H.bw * g.BWE);
      var dec = nout * tpot, e2e = ttft + dec;
      body.querySelector(".b1").style.width = (ttft / e2e * 100) + "%"; body.querySelector(".b2").style.width = (dec / e2e * 100) + "%";
      body.querySelector(".v1").textContent = B.fmtT(ttft); body.querySelector(".v2").textContent = B.fmtT(tpot);
      body.querySelector(".v3").textContent = (1 / tpot).toFixed(0); body.querySelector(".v4").textContent = B.fmtT(e2e);
      var share = ttft / e2e;
      body.querySelector(".lb-cap").innerHTML = (share > 0.5 ? "Prefill dominates: this request feels slow to <i>start</i>." : "Decode dominates: this request feels slow to <i>finish</i>.") +
        " Attention is " + Math.round(att / (lin + att) * 100) + "% of the prefill arithmetic at this prompt length; it grows with the square of the prompt.";
      var need = B.weightBytes(M) + B.kvPerTok(M) * (nin + nout), w = body.querySelector(".lb-warn");
      if (need > H.mem * 1e9 * 0.95) { w.hidden = false; w.textContent = "Weights plus cache need " + B.fmtGB(need) + " but this hardware has " + H.mem + " GB. A real runtime would quantize or offload, and run far slower than shown."; } else w.hidden = true;
    }
    body.querySelectorAll(".pre button").forEach(function (bt) {
      bt.onclick = function () { var p = PRESETS[+bt.dataset.i]; iIn.value = p[1]; iOut.value = p[2];
        body.querySelectorAll(".pre button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); render(); };
    });
    function clearPre() { body.querySelectorAll(".pre button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); render(); }
    iIn.oninput = clearPre; iOut.oninput = clearPre; B.on(render); render();
  });
})();
