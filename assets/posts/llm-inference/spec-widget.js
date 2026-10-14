/* Speculative decoding simulator (greedy decoding, simplified).
 * Each round: a cheap drafter proposes k tokens; the big model checks them in one pass and keeps them
 * left to right until the first miss, where it substitutes its own token. If all k pass, it adds a bonus token.
 * Each draft token is assumed to match with independent probability α, the assumption behind
 * Leviathan et al. (2023): expected tokens per pass = (1 − α^(k+1)) / (1 − α); speedup = that / (1 + k·c),
 * where c is the drafter's cost per token relative to one big-model pass.
 * Usage: load bench.js, add <div class="spec-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var TARGET = "the cache keeps every key and value so each new token only computes its own and reads the rest from memory instead of recomputing the whole prompt".split(" ");
  var WRONG = ["a", "model", "weights", "fast", "then", "all", "query", "slow", "it", "batch", "keeps", "disk", "for", "token", "layer", "GPU", "on", "first", "never", "cost"];
  var css = ".spw .split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}" +
    ".spw.narrow .split{grid-template-columns:1fr}.spw.narrow .rounds{height:150px}" +
    ".spw .rounds{display:flex;flex-direction:column;gap:5px;height:230px;overflow-y:auto;background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:8px}" +
    ".spw .rd{display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:12px}" +
    ".spw .rd .n{font:11.5px ui-monospace,Menlo,Consolas,monospace;color:#59636e;width:48px;flex:none}" +
    ".spw .ch{font:12px ui-monospace,Menlo,Consolas,monospace;padding:1px 6px;border-radius:4px;border:1.5px solid #d0d7de;transition:all .25s}" +
    ".spw .ch.dr{border-style:dashed;color:#59636e}" +
    ".spw .ch.ok{border-color:" + C.good + ";color:" + C.good + "}.spw .ch.no{border-color:" + C.bad + ";color:" + C.bad + ";text-decoration:line-through}" +
    ".spw .ch.fix{background:" + C.prefill + ";border-color:" + C.prefill + ";color:#fff}.spw .ch.bonus{background:" + C.good + ";border-color:" + C.good + ";color:#fff}" +
    ".spw .ch.skip{opacity:.25}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  function E(a, k) { return a >= 1 ? k + 1 : (1 - Math.pow(a, k + 1)) / (1 - a); }

  document.querySelectorAll(".spec-widget").forEach(function (el) {
    B.card(el, "spw", "Guess, then check", "greedy decoding, simplified");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'>" +
      "<div class='lb-ctrl'><div class='r'><label for='spA'>Chance each guess is right (α)</label><output class='oa'></output></div><input id='spA' type='range' min='0.3' max='0.95' step='0.05' value='0.75'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='spK'>Tokens guessed per round (k)</label><output class='ok'></output></div><input id='spK' type='range' min='1' max='10' value='4'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='spC'>Cost of one guess (× one big-model pass)</label><output class='oc'></output></div><input id='spC' type='range' min='0' max='0.3' step='0.01' value='0.05'></div></div>" +
      "<div class='split'><div><div class='rounds' aria-live='polite'></div>" +
      "<div class='lb-key'><span><i style='background:" + C.good + "'></i>kept / bonus</span><span><i style='background:" + C.bad + "'></i>rejected</span><span><i style='background:" + C.prefill + "'></i>big model's own token</span></div></div>" +
      "<div class='plot'></div></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>expected tokens per big-model pass</span></div><div><b class='v2'></b><span>expected speedup</span></div><div><b class='v3'>–</b><span>measured here, tokens per pass</span></div></div>" +
      "<div class='lb-btns' style='margin-top:10px'><button class='b1 pri'>Run a round</button><button class='b20'>Run 20</button><button class='br'>Reset</button></div>";
    var q = function (c) { return body.querySelector(c); };
    var pos = 0, passes = 0, toks = 0, busy = false, rounds = q(".rounds");
    function stats() {
      var a = +q("#spA").value, k = +q("#spK").value, c = +q("#spC").value;
      q(".oa").textContent = a.toFixed(2); q(".ok").textContent = k; q(".oc").textContent = c.toFixed(2);
      var e = E(a, k); q(".v1").textContent = e.toFixed(2); q(".v2").textContent = (e / (1 + k * c)).toFixed(2) + "×";
      q(".v3").textContent = passes ? (toks / passes).toFixed(2) + " (" + passes + " passes)" : "–";
      el.classList.toggle("narrow", el.clientWidth < 560);
      var W = 320, H = 230, pl = 34, pr = 10, pt = 22, pb = 30, sp = [], ym = 1;
      for (var kk = 1; kk <= 10; kk++) { var v = E(a, kk) / (1 + kk * c); sp.push(v); ym = Math.max(ym, v); }
      ym = Math.ceil(ym + 0.3);
      var xs = function (kk) { return pl + (kk - 1) / 9 * (W - pl - pr); }, ys = function (v) { return pt + (1 - v / ym) * (H - pt - pb); };
      var s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Expected speedup against k'><text x='" + pl + "' y='14'>expected speedup vs. k</text>";
      for (var y = 0; y <= ym; y++) s += "<line x1='" + pl + "' x2='" + (W - pr) + "' y1='" + ys(y) + "' y2='" + ys(y) + "' stroke='" + (y === 1 ? "#afb8c1" : C.faint) + "'" + (y === 1 ? " stroke-dasharray='3 3'" : "") + "/><text x='" + (pl - 5) + "' y='" + (ys(y) + 3.5) + "' text-anchor='end'>" + y + "×</text>";
      for (kk = 1; kk <= 10; kk++) s += "<text x='" + xs(kk) + "' y='" + (H - pb + 14) + "' text-anchor='middle'>" + kk + "</text>";
      s += "<text x='" + ((pl + W - pr) / 2) + "' y='" + (H - 3) + "' text-anchor='middle'>k</text>";
      s += "<path d='" + sp.map(function (v, i) { return (i ? "L" : "M") + xs(i + 1).toFixed(1) + "," + ys(v).toFixed(1); }).join("") + "' fill='none' stroke='" + C.good + "' stroke-width='2.4'/>";
      var best = sp.indexOf(Math.max.apply(null, sp)) + 1;
      s += "<text x='" + Math.min(W - 40, Math.max(pl + 30, xs(best))) + "' y='" + (ys(sp[best - 1]) - 9) + "' text-anchor='middle' style='fill:" + C.good + "'>best k = " + best + "</text>";
      s += "<circle cx='" + xs(k) + "' cy='" + ys(sp[k - 1]) + "' r='5.5' fill='" + C.ink + "' stroke='#fff' stroke-width='2'/></svg>";
      q(".plot").innerHTML = s;
    }
    function makeRound() {
      var a = +q("#spA").value, k = +q("#spK").value, chips = [], got = 0, miss = false;
      for (var i = 0; i < k; i++) {
        var truth = TARGET[(pos + i) % TARGET.length];
        if (miss) { chips.push({ t: "·", c: "skip" }); continue; }
        if (Math.random() < a) { chips.push({ t: truth, c: "ok" }); got++; }
        else { var w = WRONG[Math.floor(Math.random() * WRONG.length)]; if (w === truth) w = "um"; chips.push({ t: w, c: "no" }); chips.push({ t: truth, c: "fix", late: true }); got++; miss = true; }
      }
      if (!miss) { chips.push({ t: TARGET[(pos + k) % TARGET.length], c: "bonus", late: true }); got++; }
      pos += got; passes++; toks += got;
      return { chips: chips, got: got, n: passes };
    }
    function draw(r, animate, done) {
      var d = document.createElement("div"); d.className = "rd";
      d.innerHTML = "<span class='n'>#" + r.n + " +" + r.got + "</span>" + r.chips.map(function (c) { return "<span class='ch " + (animate ? (c.late ? "skip" : "dr") : c.c) + "'" + (animate && c.late ? " style='visibility:hidden'" : "") + ">" + c.t + "</span>"; }).join("");
      rounds.insertBefore(d, rounds.firstChild);
      if (rounds.children.length > 60) rounds.removeChild(rounds.lastChild);
      if (!animate) { done && done(); return; }
      var spans = d.querySelectorAll(".ch"), i = 0;
      (function next() {
        if (i >= spans.length) { done && done(); return; }
        var c = r.chips[i], sp = spans[i]; sp.style.visibility = "visible"; sp.className = "ch " + c.c; i++;
        setTimeout(next, 260);
      })();
    }
    function one() { if (busy) return; busy = true; draw(makeRound(), !B.RM, function () { busy = false; stats(); }); }
    q(".b1").onclick = one;
    q(".b20").onclick = function () { if (busy) return; for (var i = 0; i < 20; i++) draw(makeRound(), false); stats(); };
    q(".br").onclick = function () { pos = 0; passes = 0; toks = 0; rounds.innerHTML = ""; stats(); };
    ["#spA", "#spK", "#spC"].forEach(function (id) { q(id).oninput = stats; });
    B.onResize(el, stats); stats();
    if (B.RM) { for (var i = 0; i < 6; i++) draw(makeRound(), false); stats(); }
    else { draw(makeRound(), false); stats(); B.inView(el, function () { var c = 0; (function go() { if (c++ < 3) { busy = false; one(); setTimeout(go, 2600); } })(); }); }
  });
})();
