/* One 8×8 weight matrix pruned three ways: unstructured 50% (smallest weights anywhere),
 * 2:4 semi-structured (in every group of 4 along a row, keep the 2 largest; the pattern NVIDIA sparse
 * tensor cores accelerate, Mishra et al. 2021), and structured (drop the 2 columns with the smallest norm).
 * Weights are pseudo-random for illustration. Usage: load bench.js, add <div class="prune-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C;
  var MAT = [], seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var colScale = [1, 0.35, 0.9, 1.1, 0.3, 0.8, 1, 0.7];
  for (var r = 0; r < 8; r++) { MAT.push([]); for (var c = 0; c < 8; c++) MAT[r].push((rnd() * 2 - 1) * colScale[c]); }
  var NOTES = {
    dense: "All 64 weights stored and multiplied. Darker squares are larger weights; blue is positive, orange negative.",
    unstr: "The 32 smallest weights, wherever they are, become zero. Most of the total weight survives, but the zeros are scattered, so an ordinary GPU kernel still does all 64 multiplies.",
    s24: "In every run of 4 weights along a row, the 2 smallest become zero. The rule is rigid, so a bit more weight is lost, but recent NVIDIA GPUs can skip this exact pattern.",
    struct: "The 2 columns with the smallest weights are removed entirely. What remains is a smaller dense 8×6 matrix that runs fast on any hardware, but those inputs are gone."
  };
  var css = ".prw .wrap{display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:16px;align-items:start}" +
    ".prw.narrow .wrap{grid-template-columns:1fr}.prw .mat{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;max-width:240px}" +
    ".prw .c{aspect-ratio:1;border-radius:3px;transition:opacity .35s,background .35s}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  function mask(mode) {
    var m = MAT.map(function (row) { return row.map(function () { return 1; }); });
    if (mode === "unstr") { var all = []; MAT.forEach(function (row, i) { row.forEach(function (v, j) { all.push([Math.abs(v), i, j]); }); }); all.sort(function (a, b) { return a[0] - b[0]; }); all.slice(0, 32).forEach(function (x) { m[x[1]][x[2]] = 0; }); }
    if (mode === "s24") MAT.forEach(function (row, i) { for (var g = 0; g < 8; g += 4) { var idx = [g, g + 1, g + 2, g + 3].sort(function (a, b) { return Math.abs(row[a]) - Math.abs(row[b]); }); m[i][idx[0]] = 0; m[i][idx[1]] = 0; } });
    if (mode === "struct") { var nr = [0, 1, 2, 3, 4, 5, 6, 7].map(function (j) { return [MAT.reduce(function (s, row) { return s + row[j] * row[j]; }, 0), j]; }).sort(function (a, b) { return a[0] - b[0]; });
      nr.slice(0, 2).forEach(function (x) { MAT.forEach(function (row, i) { m[i][x[1]] = 0; }); }); }
    return m;
  }
  document.querySelectorAll(".prune-widget").forEach(function (el) {
    B.card(el, "prw", "Same matrix, three ways to prune", "pick a pattern");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='lb-seg md' role='group' aria-label='Pruning pattern' style='margin-bottom:12px'><button data-m='dense' aria-pressed='true'>Dense</button><button data-m='unstr' aria-pressed='false'>Unstructured 50%</button><button data-m='s24' aria-pressed='false'>2:4</button><button data-m='struct' aria-pressed='false'>Drop 2 columns</button></div>" +
      "<div class='wrap'><div class='mat' aria-label='Weight matrix'></div><div><div class='lb-ro' style='margin-top:0'><div><b class='v1'></b><span>weights kept</span></div><div><b class='v2'></b><span>total weight magnitude kept</span></div><div><b class='v3'></b><span>faster on a GPU?</span></div></div><p class='lb-cap'></p></div></div>";
    var mode = "dense";
    function render() {
      el.classList.toggle("narrow", el.clientWidth < 460);
      var m = mask(mode), kept = 0, mag = 0, tot = 0, h = "";
      MAT.forEach(function (row, i) { row.forEach(function (v, j) { tot += Math.abs(v);
        if (m[i][j]) { kept++; mag += Math.abs(v); h += "<div class='c' style='background:" + (v >= 0 ? C.prefill : C.decode) + ";opacity:" + Math.min(1, .15 + Math.abs(v) * .85).toFixed(2) + "'></div>"; }
        else h += "<div class='c' style='background:#fff;outline:1px dashed " + (mode === "struct" ? C.bad : "#afb8c1") + ";outline-offset:-1px'></div>"; }); });
      body.querySelector(".mat").innerHTML = h;
      body.querySelector(".v1").textContent = kept + " / 64"; body.querySelector(".v2").textContent = Math.round(mag / tot * 100) + "%";
      body.querySelector(".v3").textContent = { dense: "baseline", unstr: "rarely", s24: "on sparse tensor cores", struct: "yes, anywhere" }[mode];
      body.querySelector(".lb-cap").textContent = NOTES[mode];
    }
    body.querySelectorAll(".md button").forEach(function (bt) { bt.onclick = function () { mode = bt.dataset.m; body.querySelectorAll(".md button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); render(); }; });
    B.onResize(el, render); render();
  });
})();
