/* Roofline for one decode step as batch size grows.
 * step time ≈ max(weight bytes / bandwidth, 2 × params × B / FLOPS); KV-cache reads ignored (short sequences),
 * the same simplification the vLLM "Anatomy" post uses for its roofline discussion.
 * Model/hardware from bench.js. Usage: load bench.js, add <div class="roofline-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var BS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  document.querySelectorAll(".roofline-widget").forEach(function (el) {
    B.card(el, "rfw", "Batch size vs. time per decode step", "drag the slider");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrl'><div class='r'><label for='rfB'>Sequences decoding together (batch size)</label><output></output></div><input id='rfB' type='range' min='0' max='10' step='1' value='0'></div>" +
      "<div class='plot' style='margin-top:8px'></div>" +
      "<div class='lb-key'><span><i style='background:" + C.ink + "'></i>step time</span><span><i style='background:" + C.decode + "'></i>memory floor</span><span><i style='background:" + C.prefill + "'></i>compute line</span></div>" +
      "<div class='lb-ro'><div><b class='v-itl'></b><span>time between tokens, per user</span></div><div><b class='v-tp'></b><span>tokens/s, all users</span></div><div><b class='v-bd'></b><span>limited by</span></div><div><b class='v-bs'></b><span>knee (B<sub>sat</sub>)</span></div></div>" +
      "<p class='lb-cap'></p>";
    var sl = body.querySelector("input"), out = body.querySelector("output");
    function step(b) { var g = B.get(), M = g.M, H = g.H; var tm = B.weightBytes(M) / (H.bw * g.BWE), tc = 2 * M.P * b / (H.fl * g.FLE); return { t: Math.max(tm, tc), tm: tm, tc: tc }; }
    function render() {
      var g = B.get(), M = g.M, H = g.H, bi = +sl.value, b = BS[bi]; out.textContent = b;
      var st = step(b), bsat = (H.fl * g.FLE) * B.weightBytes(M) / (2 * M.P * H.bw * g.BWE), ideal = H.fl / H.bw * 2 / 2;
      var W = B.width(el, 300, 680), Hh = Math.round(W * 0.42) + 40, pl = 62, pr = 12, pt = 14, pb = 34;
      var xs = function (lb) { return pl + lb / 10 * (W - pl - pr); };
      var tmax = step(1024).t * 1.08, ys = function (v) { return pt + (1 - v / tmax) * (Hh - pt - pb); };
      var s = "<svg viewBox='0 0 " + W + " " + Hh + "' role='img' aria-label='Step time against batch size'>";
      for (var k = 0; k <= 4; k++) { var v = tmax * k / 4; s += "<line x1='" + pl + "' x2='" + (W - pr) + "' y1='" + ys(v) + "' y2='" + ys(v) + "' stroke='" + C.faint + "'/><text x='" + (pl - 5) + "' y='" + (ys(v) + 3.5) + "' text-anchor='end'>" + (v >= 1 ? v.toFixed(2) + ' s' : (v * 1e3).toFixed(v < 0.01 ? 1 : 0) + ' ms') + "</text>"; }
      var every = W < 420 ? 2 : 1;
      BS.forEach(function (bb, i) { if (i % every === 0) s += "<text x='" + xs(i) + "' y='" + (Hh - pb + 15) + "' text-anchor='middle'>" + bb + "</text>"; });
      s += "<text x='" + ((pl + W - pr) / 2) + "' y='" + (Hh - 3) + "' text-anchor='middle'>batch size (log scale)</text>";
      var pm = "", pc = "", pa = "";
      for (var j = 0; j <= 160; j++) { var lb = j / 16, bb2 = Math.pow(2, lb), x = xs(lb).toFixed(1), r = step(bb2);
        pm += (j ? "L" : "M") + x + "," + ys(r.tm).toFixed(1); if (r.tc <= tmax) pc += (pc ? "L" : "M") + x + "," + ys(r.tc).toFixed(1); pa += (j ? "L" : "M") + x + "," + ys(r.t).toFixed(1); }
      s += "<path d='" + pm + "' fill='none' stroke='" + C.decode + "' stroke-width='1.3' stroke-dasharray='4 4'/>";
      s += "<path d='" + pc + "' fill='none' stroke='" + C.prefill + "' stroke-width='1.3' stroke-dasharray='4 4'/>";
      s += "<path d='" + pa + "' fill='none' stroke='" + C.ink + "' stroke-width='2.4'/>";
      var ks = Math.log2(bsat); if (ks > 0 && ks < 10) s += "<line x1='" + xs(ks) + "' x2='" + xs(ks) + "' y1='" + pt + "' y2='" + (Hh - pb) + "' stroke='" + C.quiet + "' stroke-dasharray='2 3'/><text x='" + (xs(ks) - 4) + "' y='" + (pt + 10) + "' text-anchor='end'>knee</text>";
      s += "<circle cx='" + xs(bi) + "' cy='" + ys(st.t) + "' r='5.5' fill='" + C.ink + "' stroke='#fff' stroke-width='2'/></svg>";
      body.querySelector(".plot").innerHTML = s;
      body.querySelector(".v-itl").textContent = B.fmtT(st.t);
      body.querySelector(".v-tp").textContent = B.fmtN(b / st.t);
      var bd = body.querySelector(".v-bd"); bd.textContent = st.tc > st.tm ? "compute" : "memory"; bd.style.color = st.tc > st.tm ? C.prefill : C.decode;
      body.querySelector(".v-bs").textContent = "≈ " + Math.round(bsat);
      body.querySelector(".lb-cap").innerHTML = st.tc > st.tm ?
        "Past the knee. Each extra sequence now adds real work, so every user waits longer between tokens." :
        "Below the knee. Going from 1 to " + b + " sequences costs almost nothing per step, so throughput grows about " + b + "×. On peak specs the knee would sit near " + Math.round(ideal) + "; it is lower here because we assume kernels reach 60% of peak FLOPS but 80% of bandwidth.";
    }
    sl.oninput = render; B.on(render); B.onResize(el, render); render();
  });
})();
