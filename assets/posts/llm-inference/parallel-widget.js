/* How many GPUs a deployment needs, and how they would be split.
 * Memory = weights (params × bits/8) + KV cache (bench.js formula × context × conversations), with 10% headroom per GPU.
 * Layout follows vLLM's guidance (docs: "Parallelism and Scaling"): tensor parallelism inside a node of up to 8 GPUs,
 * pipeline parallelism across nodes. Tensor parallelism splits every layer's matrices (Megatron-LM, Shoeybi et al. 2019);
 * pipeline parallelism gives each node a contiguous slice of layers.
 * The decode ceiling (all GPUs reading their share of the weights at once) ignores communication, so it is an upper bound.
 * Usage: load bench.js, add <div class="parallel-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var CTX = [2048, 8192, 32768, 131072];
  var css = ".pll .nodes{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0 4px}" +
    ".pll .node{border:1.5px dashed #afb8c1;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px;background:#fff}" +
    ".pll .node>span{font:11px ui-monospace,Menlo,Consolas,monospace;color:#59636e}" +
    ".pll .gpus{display:flex;gap:4px;flex-wrap:wrap}" +
    ".pll .gpu{width:30px;height:48px;border:1.5px solid #8c959f;border-radius:4px;display:flex;flex-direction:column-reverse;overflow:hidden;background:#fff}" +
    ".pll .gpu i{display:block;width:100%}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  document.querySelectorAll(".parallel-widget").forEach(function (el) {
    B.card(el, "pll", "How many GPUs, and how to split them", "pick the 70B or 405B model");
    B.picker(el);
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-ctrls'><div class='lb-ctrl'><span style='font-size:13px'>Weights stored as</span><div class='lb-seg pr' role='group' aria-label='Weight precision'><button data-v='16' aria-pressed='true'>bf16</button><button data-v='8' aria-pressed='false'>8-bit</button><button data-v='4.5' aria-pressed='false'>4-bit</button></div></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='plC'>Context per conversation</label><output class='oc'></output></div><input id='plC' type='range' min='0' max='3' value='1'></div>" +
      "<div class='lb-ctrl'><div class='r'><label for='plU'>Conversations at once</label><output class='ou'></output></div><input id='plU' type='range' min='1' max='256' value='32'></div></div>" +
      "<div class='nodes'></div><div class='lb-key'><span><i style='background:#57606a'></i>weights</span><span><i style='background:" + C.kv + "'></i>KV cache</span><span>dashed box = one 8-GPU server</span></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>memory needed</span></div><div><b class='v2'></b><span>split</span></div><div><b class='v3'></b><span>decode ceiling per user</span></div></div><p class='lb-cap'></p>";
    var bits = 16, iC = body.querySelector("#plC"), iU = body.querySelector("#plU");
    function render() {
      var g = B.get(), M = g.M, H = g.H, ctx = CTX[+iC.value], u = +iU.value;
      body.querySelector(".oc").textContent = ctx.toLocaleString("en-US"); body.querySelector(".ou").textContent = u;
      var w = M.P * bits / 8, kv = B.kvPerTok(M) * ctx * u, cap = H.mem * 1e9 * 0.9, need = Math.max(1, Math.ceil((w + kv) / cap));
      var gpus = 1; while (gpus < need) gpus *= 2;
      var tp = Math.min(gpus, 8), pp = Math.ceil(gpus / 8), total = tp * pp;
      var nodes = "";
      for (var n = 0; n < pp; n++) {
        var gs = ""; for (var k = 0; k < tp; k++) { var wf = w / total / (H.mem * 1e9), kf = kv / total / (H.mem * 1e9);
          gs += "<div class='gpu' title='GPU " + (n * tp + k) + "'><i style='height:" + Math.min(100, wf * 100) + "%;background:#57606a'></i><i style='height:" + Math.min(100 - Math.min(100, wf * 100), kf * 100) + "%;background:" + C.kv + "'></i></div>"; }
        nodes += "<div class='node'><span>" + (pp > 1 ? "layers " + Math.round(n * M.L / pp + 1) + "–" + Math.round((n + 1) * M.L / pp) : "all " + M.L + " layers") + "</span><div class='gpus'>" + gs + "</div></div>";
      }
      body.querySelector(".nodes").innerHTML = nodes;
      body.querySelector(".v1").textContent = B.fmtGB(w + kv);
      body.querySelector(".v2").textContent = total === 1 ? "1 GPU" : "TP " + tp + (pp > 1 ? " × PP " + pp : "");
      var ceil = total * H.bw * g.BWE / (w + kv); // one decode step reads all weights plus every conversation's cache; each user gets one token per step
      body.querySelector(".v3").textContent = "≤ " + Math.round(ceil) + " tok/s";
      body.querySelector(".lb-cap").innerHTML = total === 1 ? "Everything fits on one GPU. Adding GPUs here would mostly buy room for more conversations, or a second copy of the model (data parallelism)." :
        "Tensor parallelism splits every layer across the " + tp + " GPUs in a server, so they read their share of the weights at the same time, but they must exchange results inside every layer over fast links (NVLink)." +
        (pp > 1 ? " Pipeline parallelism hands each server a slice of the layers; only activations cross between servers, but a token has to pass through every slice in turn." : "") +
        " The ceiling assumes free communication; real systems lose some of it.";
    }
    body.querySelectorAll(".pr button").forEach(function (bt) { bt.onclick = function () { bits = +bt.dataset.v; body.querySelectorAll(".pr button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); render(); }; });
    iC.oninput = render; iU.oninput = render; B.on(render); render();
  });
})();
