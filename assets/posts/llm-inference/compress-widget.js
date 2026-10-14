/* Combine quantization and pruning: weight memory, whether it fits, and the batch-1 decode ceiling
 * (bandwidth × 0.8 ÷ weight bytes; KV reads ignored).
 * 4-bit counts as 4.5 bits per weight: 4 bits plus one 8-bit scale per 16 values, as in NVIDIA's NVFP4.
 * 2:4 sparsity stores half the values plus ~2 bits of position metadata per kept value.
 * "Structured −25%" removes a quarter of the parameters (illustrative; NVIDIA's Minitron work prunes 8B → 4B, then distills).
 * Usage: load bench.js, add <div class="compress-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  document.querySelectorAll(".compress-widget").forEach(function (el) {
    B.card(el, "cpw", "Shrink the model: what fits, and how fast?", "upper bounds");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'><div class='lb-ctrl'><span style='font-size:13px'>Weight precision</span><div class='lb-seg pr' role='group' aria-label='Precision'><button data-v='16' aria-pressed='true'>bf16</button><button data-v='8' aria-pressed='false'>8-bit</button><button data-v='4.5' aria-pressed='false'>4-bit</button></div></div>" +
      "<div class='lb-ctrl'><span style='font-size:13px'>Pruning</span><div class='lb-seg pn' role='group' aria-label='Pruning'><button data-v='none' aria-pressed='true'>None</button><button data-v='24' aria-pressed='false'>2:4</button><button data-v='struct' aria-pressed='false'>Structured −25%</button></div></div></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>weight memory</span></div><div><b class='v2'></b><span>fits on this hardware?</span></div><div><b class='v3'></b><span>decode ceiling, one user</span></div><div><b class='v4'></b><span>vs. bf16 dense</span></div></div><p class='lb-cap'></p>";
    var bits = 16, pr = "none";
    function render() {
      var g = B.get(), M = g.M, H = g.H, bpw = bits, frac = 1;
      if (pr === "24") bpw = bits / 2 + 1; if (pr === "struct") frac = 0.75;
      var bytes = M.P * frac * bpw / 8, fits = bytes < H.mem * 1e9 * 0.85;
      body.querySelector(".v1").textContent = B.fmtGB(bytes);
      var f = body.querySelector(".v2"); f.textContent = fits ? "yes" : "no"; f.style.color = fits ? C.good : C.bad;
      body.querySelector(".v3").textContent = fits ? Math.round(H.bw * g.BWE / bytes) + " tok/s" : "–";
      body.querySelector(".v4").textContent = (M.P * 2 / bytes).toFixed(1) + "× less to read";
      var cap = "These are ceilings from bytes alone. ";
      if (pr === "24" && bits === 4.5) cap += "This model predicts about 4.9× for 2:4 plus 4-bit; Red Hat measured 2.1–3.0× on real GPUs, because activations, attention and kernel overheads don't shrink with the weights.";
      else if (pr === "24") cap += "2:4 halves the values but adds position metadata, and the speedup depends on kernel support for your precision and GPU.";
      else if (pr === "struct") cap += "Structured pruning makes a smaller dense model, so the gain shows up on any runtime, but expect to fine-tune or distill to win back accuracy.";
      else if (bits < 16) cap += "Weight-only quantization speeds up decode because decode is mostly reading weights.";
      else cap += "Try the 70B model on the laptop: it only fits at 4-bit.";
      body.querySelector(".lb-cap").textContent = cap;
    }
    function seg(cls, setv) { body.querySelectorAll(cls + " button").forEach(function (bt) { bt.onclick = function () { setv(bt.dataset.v); body.querySelectorAll(cls + " button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); render(); }; }); }
    seg(".pr", function (v) { bits = +v; }); seg(".pn", function (v) { pr = v; });
    B.on(render); render();
  });
})();
