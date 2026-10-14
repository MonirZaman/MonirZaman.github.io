/* Arithmetic intensity (FLOPs per byte moved to/from HBM) of the main operations in an LLM forward pass,
 * against the hardware's ridge point (peak FLOPS ÷ bandwidth; H100 SXM: 989 TFLOPS ÷ 3.35 TB/s ≈ 295).
 * Rough bf16 estimates:
 *   weight matmuls over n tokens: 2·n·W FLOPs ÷ 2·W bytes ≈ n
 *   decode attention over the KV cache: (QKᵀ + AV = 4·ctx·q_heads·d_head) ÷ (K and V = 4·ctx·kv_heads·d_head) = q_heads ÷ kv_heads
 *   elementwise ops (norms, activations, adds): about 1 FLOP per byte or less (Horace He, "Making Deep Learning Go Brrrr")
 * Usage: load bench.js, add <div class="intensity-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var BS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
  document.querySelectorAll(".intensity-widget").forEach(function (el) {
    B.card(el, "itw", "Which wall does each operation hit?", "FLOPs per byte, log scale");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'><div class='lb-ctrl'><div class='r'><label for='itB'>Decode batch size</label><output class='ob'></output></div><input id='itB' type='range' min='0' max='9' value='0'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='itN'>Prompt length in prefill</label><output class='on'></output></div><input id='itN' type='range' min='3' max='12' value='9'></div></div>" +
      "<div class='plot'></div><p class='lb-cap'></p>";
    var iB = body.querySelector("#itB"), iN = body.querySelector("#itN");
    function render() {
      var g = B.get(), M = g.M, H = g.H, b = BS[+iB.value], n = BS[+iN.value];
      body.querySelector(".ob").textContent = b; body.querySelector(".on").textContent = n.toLocaleString("en-US");
      var ridge = H.fl / H.bw;
      var ops = [
        ["Decode: weight matmuls", b, C.decode, "batch " + b],
        ["Decode: attention over cache", M.qh / M.kvh, C.kv, "same at any batch"],
        ["Prefill: weight matmuls", n, C.prefill, n.toLocaleString("en-US") + " tokens"],
        ["Norms, activations, adds", 0.8, "#8c959f", "elementwise"]
      ];
      var W = B.width(el, 300, 680), narrow = W < 460, lw = narrow ? 0 : 196, rowH = narrow ? 46 : 34, top = 22, Hh = top + ops.length * rowH + 30;
      var x0 = narrow ? 18 : lw + 8, x1 = W - 26, lmin = -1, lmax = 4, xs = function (v) { return x0 + (Math.log10(Math.max(0.1, Math.min(1e4, v))) - lmin) / (lmax - lmin) * (x1 - x0); };
      var s = "<svg viewBox='0 0 " + W + " " + Hh + "' role='img' aria-label='Arithmetic intensity of each operation against the ridge point'>";
      s += "<rect x='" + x0 + "' y='" + (top - 6) + "' width='" + (xs(ridge) - x0) + "' height='" + (ops.length * rowH + 4) + "' fill='#fff1e5'/>";
      s += "<rect x='" + xs(ridge) + "' y='" + (top - 6) + "' width='" + (x1 - xs(ridge)) + "' height='" + (ops.length * rowH + 4) + "' fill='#ddf4ff'/>";
      s += "<text x='" + (x0 + 4) + "' y='" + (top - 9) + "' style='fill:" + C.decode + "'>memory-bound</text><text x='" + (x1 - 4) + "' y='" + (top - 9) + "' text-anchor='end' style='fill:" + C.prefill + "'>compute-bound</text>";
      [0.1, 1, 10, 100, 1000, 10000].forEach(function (v) { s += "<line x1='" + xs(v) + "' x2='" + xs(v) + "' y1='" + (top - 6) + "' y2='" + (top + ops.length * rowH - 2) + "' stroke='#d0d7de' stroke-dasharray='2 3'/><text x='" + xs(v) + "' y='" + (Hh - 14) + "' text-anchor='middle'>" + (v < 1 ? v : v.toLocaleString("en-US")) + "</text>"; });
      s += "<text x='" + ((x0 + x1) / 2) + "' y='" + (Hh - 2) + "' text-anchor='middle'>FLOPs per byte</text>";
      s += "<line x1='" + xs(ridge) + "' x2='" + xs(ridge) + "' y1='" + (top - 6) + "' y2='" + (top + ops.length * rowH - 2) + "' stroke='" + C.ink + "' stroke-width='1.6'/>";
      ops.forEach(function (o, i) {
        var y = top + i * rowH + (narrow ? 26 : rowH / 2), x = xs(o[1]);
        if (narrow) s += "<text x='" + x0 + "' y='" + (y - 12) + "' style='fill:#1f2328;font-size:11.5px'>" + o[0] + "</text>";
        else s += "<text x='" + lw + "' y='" + (y + 4) + "' text-anchor='end' style='fill:#1f2328;font-size:11.5px'>" + o[0] + "</text>";
        s += "<line x1='" + x0 + "' x2='" + x + "' y1='" + y + "' y2='" + y + "' stroke='" + o[2] + "' stroke-width='2' opacity='.35'/>";
        s += "<circle cx='" + x + "' cy='" + y + "' r='6.5' fill='" + o[2] + "' stroke='#fff' stroke-width='2'/>";
        var lab = o[1] >= 10 ? Math.round(o[1]).toLocaleString("en-US") : o[1].toFixed(1), right = x < x1 - 70;
        s += "<text x='" + (right ? x + 10 : x - 10) + "' y='" + (y + 4) + "' text-anchor='" + (right ? "start" : "end") + "' style='fill:#1f2328'>" + lab + "</text>";
      });
      if (!narrow) s += "<text x='" + (xs(ridge) - 4) + "' y='" + (top + 8) + "' text-anchor='end' style='fill:#1f2328;font-weight:600'>ridge ≈ " + Math.round(ridge) + "</text>";
      body.querySelector(".plot").innerHTML = s + "</svg>";
      var use = function (I) { return Math.min(100, I / ridge * 100); };
      body.querySelector(".lb-cap").innerHTML = "The ridge (black line) sits at " + Math.round(ridge) + " FLOPs per byte for this hardware. Left of the ridge, an operation waits on memory and can use at most intensity ÷ ridge of the chip's arithmetic: <b>" + use(b).toFixed(use(b) < 1 ? 1 : 0) + "%</b> for decode at batch " + b + ", <b>" + use(M.qh / M.kvh).toFixed(1) + "%</b> for decode attention. Batching moves the decode matmuls right, but not attention: every conversation has its own cache to read.";
    }
    iB.oninput = render; iN.oninput = render; B.on(render); B.onResize(el, render); render();
  });
})();
