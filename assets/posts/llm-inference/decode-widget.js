/* Step-through of one generation: one prefill pass, then one decode pass per token.
 * Shows the KV cache filling, the bytes of weights read per pass, and how little of the GPU's
 * arithmetic each pass uses (FLOPs needed ÷ FLOPs the chip could do in the time the pass takes).
 * Model and hardware come from bench.js (Llama 3 shapes; H100 = 3.35 TB/s, 989 dense BF16 TFLOPS).
 * Usage: load bench.js, add <div class="decode-widget"></div>, then load this file.
 * Autoplays once when scrolled into view (not under reduced motion).
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var PROMPT = ["Water", " boils", " at", " sea", " level", " at"];
  var OUT = ["100", " °C", ",", " or", " 212", " °F", "."];
  var css = ".dcw .row{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 10px}" +
    ".dcw .tok{font:12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:3px 7px;border-radius:5px;border:1.5px solid #d0d7de;background:#fff;white-space:pre;transition:background .3s,color .3s,border-color .3s}" +
    ".dcw .tok.p{border-color:" + C.prefill + "}.dcw .tok.p.hot{background:" + C.prefill + ";color:#fff}" +
    ".dcw .tok.d{border-color:" + C.decode + "}.dcw .tok.d.hot{background:" + C.decode + ";color:#fff}" +
    ".dcw .tok.g{color:#afb8c1;border-style:dashed}" +
    ".dcw .slots{display:flex;flex-wrap:wrap;gap:3px;margin:4px 0 10px}.dcw .slot{width:16px;height:16px;border-radius:3px;background:#eaeef2;transition:background .3s}" +
    ".dcw .lab{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:#59636e;font-weight:600}" +
    ".dcw .meter{position:relative;height:14px;background:#fff;border:1px solid #d0d7de;border-radius:4px;overflow:hidden;margin-top:4px}" +
    ".dcw .meter i{position:absolute;left:0;top:0;bottom:0;transition:width .4s}" +
    ".dcw .mticks{display:flex;justify-content:space-between;font:10.5px ui-monospace,Menlo,Consolas,monospace;color:#59636e;margin-top:2px}" +
    ".dcw .cap{min-height:3.2em}";
  var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  document.querySelectorAll(".decode-widget").forEach(function (el) {
    B.card(el, "dcw", "One answer, pass by pass", "step through it, or press Play");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lab'>Sequence</div><div class='row toks'></div>" +
      "<div class='lab'>KV cache: one slot per token, per layer</div><div class='slots'></div>" +
      "<div class='lab'>Share of the GPU's arithmetic used by this pass (log scale)</div><div class='meter'><i></i></div>" +
      "<div class='mticks'><span>0.1%</span><span>1%</span><span>10%</span><span>100%</span></div>" +
      "<div class='lb-ro'><div><b class='v-pass'>0</b><span>forward passes</span></div><div><b class='v-bytes'>0</b><span>weight bytes read so far</span></div>" +
      "<div><b class='v-util'>–</b><span>arithmetic used, this pass</span></div><div><b class='v-tps'>–</b><span>tokens/s ceiling for one user</span></div></div>" +
      "<p class='lb-cap cap'></p><div class='lb-btns'><button class='b-back'>Back</button><button class='b-next pri'>Next</button><button class='b-play'>Play</button><button class='b-reset'>Reset</button></div>";
    var q = function (c) { return body.querySelector(c); };
    var n = 0, N = OUT.length, timer = null; // n=0: nothing yet; n=1: after prefill; n=k: after k-1 decode passes

    function render() {
      var g = B.get(), M = g.M, H = g.H;
      var wB = B.weightBytes(M) - M.vocab * M.d * 2, tStep = wB / (H.bw * g.BWE); // the embedding table is only looked up, one row per token
      var toks = PROMPT.map(function (t) { return "<span class='tok p" + (n === 1 ? " hot" : "") + "'>" + t + "</span>"; }).join("") +
        OUT.map(function (t, i) { return i < n ? "<span class='tok d" + (i === n - 1 ? " hot" : "") + "'>" + t + "</span>" : "<span class='tok g'> ··· </span>"; }).join("");
      q(".toks").innerHTML = toks;
      var slots = "";
      for (var i = 0; i < PROMPT.length + N; i++) {
        var col = "#eaeef2";
        if (n >= 1 && i < PROMPT.length) col = C.prefill;
        else if (i >= PROMPT.length && i < PROMPT.length + n - 1) col = C.decode;
        slots += "<div class='slot' style='background:" + col + "'></div>";
      }
      q(".slots").innerHTML = slots;
      var tokThisPass = n === 0 ? 0 : n === 1 ? PROMPT.length : 1;
      var util = n === 0 ? 0 : (2 * M.P * tokThisPass / H.fl) / Math.max(tStep, 2 * M.P * tokThisPass / (H.fl * g.FLE));
      var pos = util <= 0 ? 0 : Math.max(0, Math.min(1, (Math.log10(util * 100) + 1) / 3));
      var m = q(".meter i"); m.style.width = (pos * 100) + "%"; m.style.background = n === 1 ? C.prefill : C.decode;
      q(".v-pass").textContent = n;
      q(".v-bytes").textContent = n ? B.fmtGB(n * wB) : "0";
      q(".v-util").textContent = n ? (util * 100).toFixed(util < 0.01 ? 2 : 1) + "%" : "–";
      q(".v-tps").textContent = Math.round(1 / tStep);
      var cap;
      if (n === 0) cap = "Before anything happens, the weights (" + B.fmtGB(B.weightBytes(M)) + " for " + M.label + ") sit in GPU memory. Press <b>Next</b> to run the first pass.";
      else if (n === 1) cap = "<b style='color:" + C.prefill + "'>Prefill.</b> One pass reads all " + PROMPT.length + " prompt tokens at once, stores their keys and values in the cache, and picks the first answer token, “" + OUT[0] + "”.";
      else cap = "<b style='color:" + C.decode + "'>Decode pass " + (n - 1) + ".</b> Feeds in “" + OUT[n - 2].trim() + "”, adds one slot to the cache, reads " + B.fmtGB(wB) + " of weights again, and picks “" + OUT[n - 1].trim() + "”." +
        (n === N ? " Done: " + n + " passes, " + B.fmtGB(n * wB) + " read, to write " + N + " tokens." : "");
      q(".cap").innerHTML = cap;
      q(".b-back").disabled = n === 0; q(".b-next").disabled = n === N; q(".b-play").disabled = n === N;
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() { if (timer) return; if (n === N) n = 0; render(); timer = setInterval(function () { if (n >= N) { stop(); return; } n++; render(); }, 900); }
    q(".b-next").onclick = function () { stop(); if (n < N) n++; render(); };
    q(".b-back").onclick = function () { stop(); if (n > 0) n--; render(); };
    q(".b-play").onclick = play;
    q(".b-reset").onclick = function () { stop(); n = 0; render(); };
    if (B.RM) n = N;
    B.on(render); render();
    B.inView(el, play);
  });
})();
