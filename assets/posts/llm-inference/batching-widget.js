/* Scheduler timeline: static batching vs. continuous batching (Orca's iteration-level scheduling, Yu et al. 2022),
 * with and without chunked prefill (as described in "Inside vLLM", Gordić 2025).
 * Toy model, not a benchmark: 4 batch slots; a step that only decodes costs 1 time unit (memory-bound);
 * each prompt token prefilled in a step adds 0.002 units (compute). Chunked prefill caps prefill at 1,000 tokens per step.
 * Requests and their sizes are made up for illustration.
 * Usage: load bench.js, add <div class="batching-widget"></div>, load this file.
 */
(function () {
  var B = window.LLMBench, C = B.C, SLOTS = 4, CHUNK = 1000, PF = 0.002;
  var REQS = [
    { id: "A", at: 0, p: 200, o: 6 }, { id: "B", at: 0, p: 300, o: 2 }, { id: "C", at: 0, p: 120, o: 9 }, { id: "D", at: 0, p: 250, o: 3 },
    { id: "E", at: 2.5, p: 4000, o: 3 }, { id: "F", at: 2.5, p: 150, o: 5 }, { id: "G", at: 4, p: 300, o: 4 }
  ];
  function simulate(mode, chunked) {
    var t = 0, slots = new Array(SLOTS).fill(null), waiting = [], pending = REQS.map(function (r) { return Object.assign({ left: r.o, pre: r.p, first: null, last: null, gaps: [] }, r); });
    var steps = [], done = 0, guard = 0;
    while (done < REQS.length && guard++ < 400) {
      pending = pending.filter(function (r) { if (r.at <= t + 1e-9) { waiting.push(r); return false; } return true; });
      var anyRunning = slots.some(Boolean);
      if (mode === "cont" || !anyRunning) {
        for (var i = 0; i < SLOTS; i++) if (!slots[i] && waiting.length) slots[i] = waiting.shift();
      }
      if (!slots.some(Boolean)) { t = pending.length ? Math.min.apply(null, pending.map(function (r) { return r.at; })) : t + 1; continue; }
      var budget = chunked ? CHUNK : Infinity, pre = 0, cells = [];
      slots.forEach(function (r, i) {
        if (!r) { cells.push(null); return; }
        if (r.pre > 0) { var n = Math.min(r.pre, budget); budget -= n; r.pre -= n; pre += n; cells.push({ id: r.id, k: n > 0 ? "p" : "w" }); }
        else cells.push({ id: r.id, k: "d" });
      });
      var dur = 1 + pre * PF, end = t + dur;
      slots.forEach(function (r, i) {
        if (!r) return; var c = cells[i];
        if (c.k === "d" || (c.k === "p" && r.pre === 0)) {
          if (r.first === null) r.first = end; else r.gaps.push(end - r.last);
          r.last = end; r.left--;
          if (c.k === "p") c.k = "p1";
          if (r.left <= 0) { slots[i] = null; done++; r.end = end; }
        }
      });
      steps.push({ t: t, dur: dur, cells: cells, pre: pre });
      t = end;
    }
    return { steps: steps, total: t };
  }
  function metrics(mode, chunked) {
    // re-run to collect per-request numbers
    var t = 0, slots = new Array(SLOTS).fill(null), waiting = [], pending = REQS.map(function (r) { return Object.assign({ left: r.o, pre: r.p, first: null, last: null, maxGap: 0 }, r); }), all = pending.slice(), busy = 0, cap = 0, guard = 0, done = 0;
    while (done < REQS.length && guard++ < 400) {
      pending = pending.filter(function (r) { if (r.at <= t + 1e-9) { waiting.push(r); return false; } return true; });
      if (mode === "cont" || !slots.some(Boolean)) for (var i = 0; i < SLOTS; i++) if (!slots[i] && waiting.length) slots[i] = waiting.shift();
      if (!slots.some(Boolean)) { t = pending.length ? Math.min.apply(null, pending.map(function (r) { return r.at; })) : t + 1; continue; }
      var budget = chunked ? CHUNK : Infinity, pre = 0, emit = [];
      slots.forEach(function (r) { if (!r) return; if (r.pre > 0) { var n = Math.min(r.pre, budget); budget -= n; r.pre -= n; pre += n; if (r.pre === 0) emit.push(r); } else emit.push(r); });
      var dur = 1 + pre * PF, end = t + dur;
      slots.forEach(function (r) { if (r) { busy += dur; } cap += dur; });
      emit.forEach(function (r) { if (r.first === null) r.first = end; else r.maxGap = Math.max(r.maxGap, end - r.last); r.last = end; r.left--; if (r.left <= 0) { slots[slots.indexOf(r)] = null; done++; } });
      t = end;
    }
    var ttft = all.reduce(function (s, r) { return s + (r.first - r.at); }, 0) / all.length;
    var gap = Math.max.apply(null, all.map(function (r) { return r.maxGap; }));
    return { total: t, ttft: ttft, gap: gap, util: busy / cap };
  }
  var css = ".btw .lane text{font:600 10.5px ui-monospace,Menlo,Consolas,monospace;fill:#fff}" +
    ".btw .opts{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:10px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  document.querySelectorAll(".batching-widget").forEach(function (el) {
    B.card(el, "btw", "Who gets the GPU, step by step", "4 batch slots, 7 requests");
    var body = document.createElement("div"); el.appendChild(body);
    body.innerHTML = "<div class='opts'><div class='lb-seg md' role='group' aria-label='Scheduler'><button data-m='static' aria-pressed='false'>Static batching</button><button data-m='cont' aria-pressed='true'>Continuous batching</button></div>" +
      "<label style='display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer'><input type='checkbox' class='ck'> chunked prefill</label></div>" +
      "<div class='plot'></div>" +
      "<div class='lb-key'><span><i style='background:" + C.prefill + "'></i>prefill</span><span><i style='background:" + C.decode + "'></i>decode</span><span><i style='background:#afb8c1'></i>waiting for its chunk</span><span><i style='background:#fff;border:1px dashed #afb8c1'></i>idle slot</span><span>column width = how long the step took</span></div>" +
      "<div class='lb-ro'><div><b class='v1'></b><span>time to finish all</span></div><div><b class='v2'></b><span>average time to first token</span></div><div><b class='v3'></b><span>longest stall between tokens</span></div><div><b class='v4'></b><span>slots in use</span></div></div>" +
      "<p class='lb-cap'></p><div class='lb-btns'><button class='b-play pri'>Replay</button></div>";
    var mode = "cont", chunked = false, shown = Infinity, timer = null;
    var COLS = { p: C.prefill, p1: C.prefill, d: C.decode, w: "#afb8c1" };
    function render() {
      var S = simulate(mode, chunked), M = metrics(mode, chunked);
      var maxT = Math.max(simulate("static", false).total, simulate("cont", false).total, simulate("cont", true).total, simulate("static", true).total);
      var W = B.width(el, 300, 680), lab = 26, rowH = 26, top = 30, Hh = top + SLOTS * rowH + 30, x = function (t) { return lab + t / maxT * (W - lab - 8); };
      var s = "<svg viewBox='0 0 " + W + " " + Hh + "' role='img' aria-label='Timeline of batch slots'>";
      for (var i = 0; i < SLOTS; i++) s += "<text x='2' y='" + (top + i * rowH + 15) + "'>#" + (i + 1) + "</text>";
      var seen = {}, lv = 0; REQS.forEach(function (r) { if (r.at > 0 && !seen[r.at]) { seen[r.at] = 1; var ids = REQS.filter(function (q) { return q.at === r.at; }).map(function (q) { return q.id; }).join(" + ");
        s += "<line x1='" + x(r.at) + "' x2='" + x(r.at) + "' y1='" + (top - 6) + "' y2='" + (top + SLOTS * rowH) + "' stroke='#59636e' stroke-dasharray='2 3'/><text x='" + (x(r.at) + 3) + "' y='" + (lv++ % 2 ? top - 2 : top - 12) + "'>" + ids + " arrive</text>"; } });
      S.steps.forEach(function (stp, k) {
        if (k >= shown) return;
        var x0 = x(stp.t), w = Math.max(1, x(stp.t + stp.dur) - x0 - 1);
        stp.cells.forEach(function (c, i) {
          var y = top + i * rowH;
          if (!c) { s += "<rect x='" + x0 + "' y='" + y + "' width='" + w + "' height='" + (rowH - 4) + "' fill='#fff' stroke='#d0d7de' stroke-dasharray='2 2'/>"; return; }
          s += "<g class='lane'><rect x='" + x0 + "' y='" + y + "' width='" + w + "' height='" + (rowH - 4) + "' rx='2' fill='" + COLS[c.k] + "'/>" + (w > 11 ? "<text x='" + (x0 + w / 2) + "' y='" + (y + 15) + "' text-anchor='middle'>" + c.id + "</text>" : "") + "</g>";
        });
      });
      for (var tt = 0; tt <= maxT; tt += 5) s += "<text x='" + x(tt) + "' y='" + (Hh - 4) + "' text-anchor='middle'>" + tt + "</text>";
      s += "<text x='" + (W - 8) + "' y='" + (Hh - 16) + "' text-anchor='end'>time (one decode step = 1)</text></svg>";
      body.querySelector(".plot").innerHTML = s;
      body.querySelector(".v1").textContent = M.total.toFixed(1); body.querySelector(".v2").textContent = M.ttft.toFixed(1);
      body.querySelector(".v3").textContent = M.gap.toFixed(1); body.querySelector(".v4").textContent = Math.round(M.util * 100) + "%";
      body.querySelector(".lb-cap").innerHTML = mode === "static" ? "Static batching waits for the slowest request in a batch. Slots sit empty after B and D finish, and E, F and G can't start until the whole first batch is done." :
        chunked ? "Chunked prefill splits E's 4,000-token prompt across several steps, so no single step is huge. Requests already decoding keep streaming with only small hiccups, while E's own first token arrives a little later." :
        "Continuous batching refills a slot the step after it frees up, so nothing sits idle. But look at E: its 4,000-token prefill makes one step long, and every request that is mid-answer freezes for it. Turn on chunked prefill.";
    }
    function play() { clearInterval(timer); shown = 0; render(); var n = simulate(mode, chunked).steps.length; timer = setInterval(function () { shown++; render(); if (shown >= n) { clearInterval(timer); shown = Infinity; } }, 140); }
    body.querySelectorAll(".md button").forEach(function (bt) { bt.onclick = function () { mode = bt.dataset.m; body.querySelectorAll(".md button").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); }); play(); }; });
    body.querySelector(".ck").onchange = function (e) { chunked = e.target.checked; play(); };
    body.querySelector(".b-play").onclick = play;
    B.onResize(el, render); render(); B.inView(el, play);
  });
})();
