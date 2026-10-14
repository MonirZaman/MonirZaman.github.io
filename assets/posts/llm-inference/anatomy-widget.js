/* One LLM call, stage by stage: tokenize → embed → transformer blocks (attention with Q, K, V, then MLP)
 * → output head → sample → append and repeat.
 * Parameter split computed from the Llama 3.1 shapes in bench.js (Llama 3 paper): embedding table and output head
 * are vocab × hidden each; attention per layer is Wq, Wk, Wv, Wo; the MLP per layer is three hidden × ffn matrices.
 * Token IDs, attention weights and next-token probabilities are illustrative, not real model outputs.
 * Usage: load bench.js, add <div class="anatomy-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var TOK = ["Water", " boils", " at", " sea", " level", " at"], IDS = [32353, 75157, 520, 9581, 2237, 520];
  var ATT = [0.06, 0.34, 0.05, 0.16, 0.27, 0.12];
  var NEXT = [["100", 0.71], ["212", 0.12], [" about", 0.07], [" around", 0.04], ["sea", 0.01]];
  var PARTS = [["emb", "Embedding table", "#8c959f"], ["att", "Attention (Q, K, V, O)", C.prefill], ["mlp", "MLP (feed-forward)", "#1b7c83"], ["head", "Output head", "#9a6700"]];
  var STEPS = [
    { on: null, t: "Text in", c: "You send a prompt. The model never sees letters, only numbers." },
    { on: null, t: "1 · Tokenize", c: "A tokenizer splits the text into <b>tokens</b>, common words or word pieces, and maps each to an ID. Llama 3's vocabulary has 128,256 tokens. <i>(IDs shown are illustrative.)</i>" },
    { on: "emb", t: "2 · Embed", c: "Each ID selects one row of the <b>embedding table</b>: a vector of {d} numbers. Only those rows are read, so this step moves almost no bytes, even though the table is {embB}." },
    { on: "att", t: "3 · Attention", c: "In every layer, each token makes a <b>query</b> (Q: what am I looking for?), a <b>key</b> (K: what do I contain?) and a <b>value</b> (V: what do I pass on?). The newest token's Q is scored against every K, and the scores weight a mix of the Vs. K and V are kept in the <span style='color:" + C.kv + ";font-weight:600'>KV cache</span> for later tokens; Q is used once and thrown away." },
    { on: "mlp", t: "4 · MLP", c: "Each token's vector then passes through a <b>feed-forward network</b> on its own: {d} → {ffn} → {d} numbers. These matrices hold most of the model's weights." },
    { on: "both", t: "5 · Repeat × {L}", c: "Attention plus MLP make one <b>transformer block</b>. The vector flows through {L} of them, each adding its result to a running sum (the residual stream)." },
    { on: "head", t: "6 · Output head", c: "The last vector is multiplied by the <b>output head</b> to get one score (a logit) per vocabulary entry. Softmax turns the scores into probabilities, and the sampler picks one." },
    { on: "loop", t: "7 · Append and repeat", c: "The chosen token is appended to the sequence and the whole trip runs again for the next one. This loop is <b>autoregressive generation</b>, and it is why the rest of this post exists." }
  ];
  var css = ".anw .toks{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 8px;min-height:30px}" +
    ".anw .tk{display:flex;flex-direction:column;align-items:center;font:12.5px ui-monospace,Menlo,Consolas,monospace;padding:3px 7px;border-radius:5px;border:1.5px solid #d0d7de;background:#fff;white-space:pre;transition:all .3s}" +
    ".anw .tk small{font-size:10px;color:#59636e}.anw .tk.new{border-color:" + C.decode + "}" +
    ".anw .vec{display:flex;gap:1px;margin-top:3px}.anw .vec i{display:block;width:5px;height:9px;border-radius:1px}" +
    ".anw .stage{background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:10px 12px;min-height:150px}" +
    ".anw .stage h4{margin:0 0 6px;font:600 14px -apple-system,'Segoe UI',Helvetica,Arial,sans-serif}" +
    ".anw .stage p{margin:0 0 8px;font-size:13.5px;line-height:1.5}" +
    ".anw .bars{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:3px 8px;align-items:center;font:12px ui-monospace,Menlo,Consolas,monospace}" +
    ".anw .bars b{display:block;height:11px;border-radius:2px;transition:width .4s}" +
    ".anw .params{margin-top:10px}.anw .pbar{display:flex;height:20px;border-radius:5px;overflow:hidden;border:1px solid #d0d7de}" +
    ".anw .pbar i{display:block;height:100%;transition:opacity .3s}" +
    ".anw .plab{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:#59636e;margin-top:4px}" +
    ".anw .plab span{transition:opacity .3s}.anw .plab i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}" +
    ".anw .dots{display:flex;gap:4px;margin:8px 0}.anw .dots button{width:22px;height:8px;padding:0;border-radius:4px;border:0;background:#d0d7de}.anw .dots button[aria-current=true]{background:#1f2328}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function vec(seed, n) { var s = "", x = seed; for (var i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; var v = x / 233280; s += "<i style='background:" + (v > .5 ? C.prefill : C.decode) + ";opacity:" + (0.25 + Math.abs(v - .5) * 1.5).toFixed(2) + "'></i>"; } return "<span class='vec'>" + s + "</span>"; }

  document.querySelectorAll(".anatomy-widget").forEach(function (el) {
    B.card(el, "anw", "One LLM call, stage by stage", "Next / Back, or Play");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='toks'></div><div class='stage'><h4></h4><p class='cap'></p><div class='viz'></div></div>" +
      "<div class='dots' role='tablist' aria-label='Stages'></div>" +
      "<div class='params'><div class='lab' style='font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:#59636e;font-weight:600;margin-bottom:4px'>Where the weights live</div><div class='pbar'></div><div class='plab'></div><p class='lb-cap rd'></p></div>" +
      "<div class='lb-btns'><button class='b-back'>Back</button><button class='b-next pri'>Next</button><button class='b-play'>Play</button></div>";
    var n = 0, timer = null, q = function (c) { return body.querySelector(c); };
    var temp = 1, topP = 1;
    function dist() {
      var lg = NEXT.map(function (x) { return Math.log(x[1]) / temp; }), mx = Math.max.apply(null, lg), ex = lg.map(function (v) { return Math.exp(v - mx); }), z = ex.reduce(function (a, b) { return a + b; }, 0);
      var pr = ex.map(function (v) { return v / z; }), idx = pr.map(function (v, i) { return i; }).sort(function (a, b) { return pr[b] - pr[a]; }), keep = {}, cum = 0;
      for (var k = 0; k < idx.length; k++) { keep[idx[k]] = 1; cum += pr[idx[k]]; if (cum >= topP - 1e-9) break; }
      var z2 = pr.reduce(function (a, v, i) { return a + (keep[i] ? v : 0); }, 0);
      return pr.map(function (v, i) { return keep[i] ? v / z2 : 0; });
    }
    function sampler() {
      var d = dist();
      q(".oT").textContent = temp.toFixed(1); q(".oP").textContent = topP.toFixed(2);
      q(".samp").innerHTML = NEXT.map(function (x, i) { return "<span>“" + x[0] + "”</span><b style='width:" + (d[i] * 100) + "%;max-width:100%;background:" + (d[i] ? C.decode : "#d0d7de") + "'></b><span>" + (d[i] ? d[i].toFixed(2) : "cut") + "</span>"; }).join("");
      q("#anT").oninput = function (e) { temp = +e.target.value; sampler(); };
      q("#anP").oninput = function (e) { topP = +e.target.value; sampler(); };
      q(".b-samp").onclick = function () { stop(); var out = []; for (var j = 0; j < 20; j++) { var r = Math.random(), c = 0; for (var i = 0; i < d.length; i++) { c += d[i]; if (r <= c) { out.push(NEXT[i][0].trim()); break; } } } q(".sres").textContent = out.join(" · "); };
    }
    STEPS.forEach(function (s, i) { var b = document.createElement("button"); b.setAttribute("aria-label", s.t.replace(/\{L\}/, "")); b.onclick = function () { stop(); n = i; render(); }; q(".dots").appendChild(b); });
    function sizes(M) {
      var emb = M.vocab * M.d, att = M.L * (2 * M.d * M.qh * M.hd + 2 * M.d * M.kvh * M.hd), mlp = M.L * 3 * M.d * M.ffn;
      return { emb: emb, att: att, mlp: mlp, head: emb, tot: 2 * emb + att + mlp };
    }
    function render() {
      var M = B.get().M, S = sizes(M), s = STEPS[n];
      var fill = function (str) { return str.replace(/\{d\}/g, M.d.toLocaleString("en-US")).replace(/\{ffn\}/g, M.ffn.toLocaleString("en-US")).replace(/\{L\}/g, M.L).replace(/\{embB\}/g, B.fmtGB(S.emb * 2)); };
      var showNew = n === 7;
      q(".toks").innerHTML = n === 0 ? "<span class='tk'>Water boils at sea level at</span>" :
        TOK.map(function (t, i) { return "<span class='tk'>" + t + "<small>" + IDS[i] + "</small>" + (n >= 2 ? vec(IDS[i], 10) : "") + "</span>"; }).join("") +
        (showNew ? "<span class='tk new'>100<small>1041</small>" + vec(1041, 10) + "</span>" : "");
      q("h4").textContent = fill(s.t); q(".cap").innerHTML = fill(s.c);
      var viz = "";
      if (n === 3) viz = "<div class='bars'>" + TOK.map(function (t, i) { return "<span>Q·K “" + t.trim() + "”</span><b style='width:" + (ATT[i] * 100 / 0.34) + "%;max-width:100%;background:" + C.prefill + "'></b><span>" + ATT[i].toFixed(2) + "</span>"; }).join("") + "</div><p class='lb-cap' style='margin-top:4px'>Attention weights for the last token (illustrative). They sum to 1 and mix the six value vectors.</p>";
      if (n === 6) viz = "<div class='lb-ctrls' style='margin-bottom:6px'><div class='lb-ctrl'><div class='r'><label for='anT'>Temperature</label><output class='oT'></output></div><input id='anT' type='range' min='0.1' max='2' step='0.1' value='" + temp + "'></div>" +
        "<div class='lb-ctrl'><div class='r'><label for='anP'>Top-p</label><output class='oP'></output></div><input id='anP' type='range' min='0.3' max='1' step='0.05' value='" + topP + "'></div></div>" +
        "<div class='bars samp'></div><div class='lb-btns' style='margin-top:6px'><button class='b-samp'>Sample 20 tokens</button><span class='lb-cap sres' style='margin:0'></span></div>" +
        "<p class='lb-cap' style='margin-top:4px'>Five candidates out of 128,256, with made-up scores. Temperature divides the scores before the softmax: low values sharpen the distribution toward greedy decoding, high values flatten it. Top-p keeps only the smallest set of candidates whose probabilities add up to p.</p>";
      if (n !== 6 || !q(".samp")) q(".viz").innerHTML = viz;
      if (n === 6) sampler();
      var on = s.on;
      q(".pbar").innerHTML = PARTS.map(function (p) { var hot = on === p[0] || (on === "both" && (p[0] === "att" || p[0] === "mlp")) || on === "loop" || on === null;
        return "<i style='width:" + (S[p[0]] / S.tot * 100) + "%;background:" + p[2] + ";opacity:" + (hot ? 1 : .22) + "'></i>"; }).join("");
      q(".plab").innerHTML = PARTS.map(function (p) { return "<span><i style='background:" + p[2] + "'></i>" + p[1] + " " + Math.round(S[p[0]] / S.tot * 100) + "%</span>"; }).join("");
      var readNoEmb = (S.tot - S.emb) * 2;
      q(".rd").innerHTML = M.label + ": " + B.fmtGB(S.tot * 2) + " of bf16 weights. Producing one token reads about " + B.fmtGB(readNoEmb) + " of them: everything except the embedding table, where it looks up a single row.";
      q(".dots").querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-current", i === n); });
      q(".b-back").disabled = n === 0; q(".b-next").disabled = n === STEPS.length - 1; q(".b-play").disabled = n === STEPS.length - 1;
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() { if (timer) return; if (n === STEPS.length - 1) n = 0; render(); timer = setInterval(function () { if (n >= STEPS.length - 1) { stop(); render(); return; } n++; render(); }, 3200); }
    q(".b-next").onclick = function () { stop(); n = Math.min(STEPS.length - 1, n + 1); render(); };
    q(".b-back").onclick = function () { stop(); n = Math.max(0, n - 1); render(); };
    q(".b-play").onclick = play;
    if (B.RM) n = 3;
    B.on(render); render(); B.inView(el, play);
  });
})();
