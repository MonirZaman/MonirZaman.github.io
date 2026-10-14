/* Symmetric absmax quantization of 16 example weights.
 * scale = max|w| / (2^(bits−1) − 1); q = round(w / scale); ŵ = q × scale.
 * Toggle an outlier to see one large weight crush the rest, and per-group scales (groups of 4)
 * to see how giving each small group its own scale contains the damage. Weights are made up for illustration.
 * Usage: load bench.js, add <div class="quant-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var BASE = [0.21, -0.34, 0.08, 0.47, -0.12, 0.29, -0.51, 0.04, 0.38, -0.19, 0.13, -0.43, 0.26, -0.07, 0.55, -0.31];
  document.querySelectorAll(".quant-widget").forEach(function (el) {
    B.card(el, "qtw", "Round 16 weights to a few bits", "made-up weights");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'><div class='lb-ctrl'><div class='r'><label for='qtB'>Bits per weight</label><output></output></div><input id='qtB' type='range' min='2' max='8' value='4'></div>" +
      "<div class='lb-ctrl' style='gap:6px;font-size:13px'><label style='display:flex;gap:6px;align-items:center;cursor:pointer'><input type='checkbox' class='ou'> add one outlier weight</label>" +
      "<label style='display:flex;gap:6px;align-items:center;cursor:pointer'><input type='checkbox' class='gr'> give each group of 4 its own scale</label></div></div>" +
      "<div class='plot'></div>" +
      "<div class='lb-key'><span><i style='background:#fff;border:1.5px solid " + C.quiet + ";border-radius:50%'></i>original</span><span><i style='background:" + C.prefill + "'></i>after rounding</span><span><i style='background:" + C.bad + "'></i>error</span><span><i style='background:#eaeef2'></i>values the bits can represent</span></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>levels per scale</span></div><div><b class='v2'></b><span>average error, as % of a typical weight</span></div><div><b class='v3'></b><span>small weights rounded to zero</span></div></div><p class='lb-cap'></p>";
    var iB = body.querySelector("#qtB"), ou = body.querySelector(".ou"), gr = body.querySelector(".gr");
    function render() {
      var bits = +iB.value; body.querySelector("output").textContent = bits;
      var ws = BASE.slice(); if (ou.checked) ws[6] = 3.2;
      var G = gr.checked ? 4 : 16, qmax = Math.pow(2, bits - 1) - 1, q = [], sc = [];
      for (var g = 0; g < 16; g += G) { var seg = ws.slice(g, g + G), s = Math.max.apply(null, seg.map(Math.abs)) / qmax; sc.push(s); seg.forEach(function (w) { q.push(Math.round(w / s) * s); }); }
      var err = 0, zeros = 0; ws.forEach(function (w, i) { err += Math.abs(w - q[i]); if (q[i] === 0 && Math.abs(w) > 0.05) zeros++; }); err /= 16;
      var typ = BASE.reduce(function (a, w) { return a + Math.abs(w); }, 0) / 16;
      body.querySelector(".v1").textContent = 2 * qmax + 1; body.querySelector(".v2").textContent = Math.round(err / typ * 100) + "%"; body.querySelector(".v3").textContent = zeros + " of 15";
      var W = B.width(el, 300, 680), H = Math.round(W * 0.34) + 40, pl = 40, pr = 10, pt = 10, pb = 14;
      var lim = Math.max(0.6, Math.max.apply(null, ws.map(Math.abs))) * 1.08;
      var xs = function (i) { return pl + (i + 0.5) / 16 * (W - pl - pr); }, ys = function (v) { return pt + (1 - (v + lim) / (2 * lim)) * (H - pt - pb); };
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Original and quantized weights'>";
      for (var gi = 0; gi < 16 / G; gi++) {
        var x0 = pl + gi * G / 16 * (W - pl - pr), x1 = pl + (gi + 1) * G / 16 * (W - pl - pr);
        for (var l = -Math.min(qmax, 40); l <= Math.min(qmax, 40); l++) { var v = l * sc[gi]; if (Math.abs(v) > lim) continue; s += "<line x1='" + (x0 + 2) + "' x2='" + (x1 - 2) + "' y1='" + ys(v).toFixed(1) + "' y2='" + ys(v).toFixed(1) + "' stroke='#eaeef2'/>"; }
        if (G < 16 && gi > 0) s += "<line x1='" + x0 + "' x2='" + x0 + "' y1='" + pt + "' y2='" + (H - pb) + "' stroke='#afb8c1' stroke-dasharray='2 3'/>";
      }
      s += "<line x1='" + pl + "' x2='" + (W - pr) + "' y1='" + ys(0) + "' y2='" + ys(0) + "' stroke='#afb8c1'/>";
      [lim * 0.9, 0, -lim * 0.9].forEach(function (v) { s += "<text x='" + (pl - 5) + "' y='" + (ys(v) + 3.5) + "' text-anchor='end'>" + v.toFixed(1) + "</text>"; });
      ws.forEach(function (w, i) { var x = xs(i);
        s += "<line x1='" + x + "' x2='" + x + "' y1='" + ys(w) + "' y2='" + ys(q[i]) + "' stroke='" + C.bad + "' stroke-width='1.6'/>";
        s += "<rect x='" + (x - 6) + "' y='" + (ys(q[i]) - 3) + "' width='12' height='6' rx='1.5' fill='" + C.prefill + "'/>";
        s += "<circle cx='" + x + "' cy='" + ys(w) + "' r='4.5' fill='#fff' stroke='" + C.quiet + "' stroke-width='1.6'/>"; });
      body.querySelector(".plot").innerHTML = s + "</svg>";
      body.querySelector(".lb-cap").innerHTML = ou.checked && !gr.checked ? "The outlier sets the scale for everyone, so the step between levels is huge and most small weights round to zero." :
        ou.checked ? "Only the outlier's own group loses precision; the other groups keep their fine steps." :
        bits <= 3 ? "With so few levels even well-behaved weights land far from where they started." : "Without outliers, 4 bits already keeps every weight close to its original value.";
    }
    iB.oninput = render; ou.onchange = render; gr.onchange = render; B.onResize(el, render); render();
  });
})();
