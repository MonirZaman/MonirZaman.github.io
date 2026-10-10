/* History-aware policy playground, modelled on the two examples in AWS's Strands Box announcement:
 *  (1) Slack posts capped at three successful posts per 10 minutes (counts HTTP 200 responses, not attempts)
 *  (2) after the agent reads a file under customers/, block outbound HTTP, whichever tool (shell or Python) did the read
 * Rules are shown in simplified pseudo-code; real Dogwood syntax differs (see the Dogwood guide).
 * Usage: add an empty div with class "history-widget", then load history-widget.js with a script tag.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = `
  .hiw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--bg:#f6f8fa;--ok:#1a7f37;--okbg:#dafbe1;--bad:#cf222e;--badbg:#ffebe9;--acc:#0969da;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .hiw .tabs{display:flex;gap:4px;border-bottom:1px solid var(--edge);margin:-2px 0 12px}
  .hiw .tabs button{font:inherit;font-weight:600;padding:6px 12px;border:0;border-bottom:2px solid transparent;background:none;color:var(--quiet);cursor:pointer;margin-bottom:-1px}
  .hiw .tabs button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--ink)}
  .hiw pre.rule{margin:0 0 10px;padding:8px 10px;background:#fff;border:1px solid var(--edge);border-radius:8px;font:12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;color:var(--ink)}
  .hiw pre.rule .kw{color:#cf222e;font-weight:700}.hiw pre.rule .kw2{color:#1a7f37;font-weight:700}.hiw pre.rule .c{color:var(--quiet)}
  .hiw .acts{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
  .hiw .acts button{font:inherit;font-size:13px;padding:4px 10px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .hiw .acts button.pri{border-color:var(--acc);color:var(--acc);font-weight:600}
  .hiw .acts code{font-size:12px}
  .hiw .clock{font:600 22px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
  .hiw .meter{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:6px 0}
  .hiw .meter .pips{display:flex;gap:4px}.hiw .meter .pips i{width:18px;height:18px;border-radius:4px;border:1.5px solid var(--edge);background:#fff;transition:background .3s,border-color .3s}
  .hiw .meter .pips i.on{background:var(--acc);border-color:var(--acc)}
  .hiw .meter small{color:var(--quiet)}
  .hiw .track{position:relative;height:46px;margin:10px 0 2px;background:#fff;border:1px solid var(--edge);border-radius:8px;overflow:hidden}
  .hiw .win{position:absolute;top:0;bottom:0;background:rgba(9,105,218,.09);border-left:1.5px dashed var(--acc);border-right:2px solid var(--ink);transition:left .45s,width .45s}
  .hiw .win span{position:absolute;top:2px;left:4px;font-size:10.5px;color:var(--acc);font-weight:600;white-space:nowrap}
  .hiw .ev{position:absolute;top:22px;width:12px;height:12px;margin-left:-6px;border-radius:50%;border:2px solid #fff;transition:left .45s;animation:hiw-drop .35s ease-out}
  .hiw .ev.ok{background:var(--ok)}.hiw .ev.no{background:var(--bad)}.hiw .ev.oth{background:#8c959f;border-radius:2px}
  @keyframes hiw-drop{from{transform:translateY(-10px);opacity:0}to{transform:none;opacity:1}}
  .hiw .ticks{position:relative;height:16px;font-size:10.5px;color:var(--quiet)}
  .hiw .ticks span{position:absolute;transform:translateX(-50%);transition:left .45s}
  .hiw .log{list-style:none;margin:8px 0 0;padding:0;max-height:178px;overflow:auto;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  .hiw .log li{padding:4px 8px;border-radius:6px;margin:3px 0;background:#fff;border:1px solid var(--edge);animation:hiw-drop .3s ease-out;word-break:break-word}
  .hiw .log li.ok{border-left:4px solid var(--ok)}.hiw .log li.no{border-left:4px solid var(--bad);background:var(--badbg)}
  .hiw .log li .m{color:var(--quiet)}
  .hiw .hist{display:flex;gap:5px;flex-wrap:wrap;min-height:28px;padding:6px;background:#fff;border:1px solid var(--edge);border-radius:8px;margin:6px 0}
  .hiw .hist span{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;padding:1px 7px;border-radius:10px;border:1.5px solid var(--edge);animation:hiw-drop .3s ease-out}
  .hiw .hist span.taint{border-color:#6d28d9;color:#6d28d9;background:rgba(109,40,217,.08);font-weight:700}
  .hiw .hist em{color:var(--quiet);font-size:12.5px}
  .hiw .lbl{font-size:12.5px;color:var(--quiet);margin-top:8px}
  .hiw .note{color:var(--quiet);font-size:12.5px;margin-top:8px}
  @media (prefers-reduced-motion: reduce){.hiw .ev,.hiw .log li,.hiw .hist span{animation:none}.hiw .win,.hiw .ev,.hiw .ticks span{transition:none}}`;

  const pad = n => String(n).padStart(2, "0");
  const fmt = m => `${pad(10 + Math.floor(m / 60))}:${pad(m % 60)}`;
  const LIMIT = 3, WINDOW = 10, SPAN = 20;   // track shows SPAN minutes ending a little after "now"

  function mount(root) {
    if (!document.getElementById("hiw-css")) { const s = document.createElement("style"); s.id = "hiw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("hiw");
    root.innerHTML = `<div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-t="rate">Rule 1: rate limit</button>
        <button role="tab" aria-selected="false" data-t="taint">Rule 2: read, then send</button></div>
      <div class="pane" data-p="rate"></div><div class="pane" data-p="taint" hidden></div>`;
    root.querySelectorAll(".tabs button").forEach(b => b.onclick = () => {
      root.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", String(x === b)));
      root.querySelectorAll(".pane").forEach(p => p.hidden = p.dataset.p !== b.dataset.t);
    });
    rate(root.querySelector('[data-p="rate"]'));
    taint(root.querySelector('[data-p="taint"]'));
  }

  /* ---------- Rule 1: three successful Slack posts per 10 minutes ---------- */
  function rate(P) {
    P.innerHTML = `<pre class="rule"><span class="kw2">permit</span> http:request <span class="c">when</span> host = slack.com, POST /api/chat.postMessage
<span class="kw">forbid</span>  that same request <span class="c">when</span>
        count(<span class="c">its successful responses (200) in the last</span> 10m) ≥ 3   <span class="c">// simplified</span></pre>
      <div class="meter"><span class="clock" aria-live="polite">10:00</span>
        <span class="pips" aria-hidden="true"><i></i><i></i><i></i></span><small class="cnt"></small></div>
      <div class="track"><div class="win"><span>last 10 min</span></div></div><div class="ticks"></div>
      <div class="acts">
        <button class="pri post">Post update to Slack</button><button class="logs">Pull more logs (AWS CLI)</button>
        <button class="w1">Wait 1 min</button><button class="w4">Wait 4 min</button>
        <button class="demo">▶ Replay AWS’s example</button><button class="reset">Reset</button></div>
      <ul class="log" aria-live="polite"></ul>`;
    const clock = P.querySelector(".clock"), pips = P.querySelectorAll(".pips i"), cnt = P.querySelector(".cnt"), track = P.querySelector(".track"),
      win = P.querySelector(".win"), ticks = P.querySelector(".ticks"), log = P.querySelector(".log");
    let now = 0, events = [], demoT = [];

    const recent = () => events.filter(e => e.kind === "post" && e.ok && e.t > now - WINDOW && e.t <= now).length;
    const x0 = () => Math.max(-1, now - SPAN + 3);
    const pct = t => ((t - x0()) / SPAN) * 100;

    function draw() {
      clock.textContent = fmt(now);
      const n = recent();
      pips.forEach((p, i) => p.classList.toggle("on", i < n));
      cnt.textContent = `${n} of ${LIMIT} successful posts in the last 10 min`;
      win.style.left = pct(now - WINDOW) + "%"; win.style.width = (WINDOW / SPAN * 100) + "%";
      track.querySelectorAll(".ev").forEach(d => { const e = events[+d.dataset.i]; d.style.left = pct(e.t + e.j) + "%"; });
      ticks.innerHTML = "";
      for (let m = Math.ceil(x0() / 5) * 5; m <= x0() + SPAN; m += 5) { const s = document.createElement("span"), q = pct(m); s.style.left = q + "%"; if (q < 4) s.style.transform = "none"; else if (q > 96) s.style.transform = "translateX(-100%)"; s.textContent = fmt(m); ticks.appendChild(s); }
    }
    function addLog(cls, html) { const li = document.createElement("li"); li.className = cls; li.innerHTML = html; log.prepend(li); }
    function act(kind) {
      let ok = true, msg;
      if (kind === "post") {
        ok = recent() < LIMIT;
        msg = ok ? `<b>${fmt(now)}</b> POST slack.com/api/chat.postMessage <span class="m">→ 200 allowed</span>`
                 : `<b>${fmt(now)}</b> POST slack.com/api/chat.postMessage <span class="m">→ 403</span> policy denied this operation: <b>rate_limit_slack_posts</b>. Slack posts are capped at three every 10 minutes. Wait before you post again.`;
      } else msg = `<b>${fmt(now)}</b> aws logs filter-log-events … <span class="m">→ allowed (different rule)</span>`;
      const same = events.filter(e => e.t === now).length;
      events.push({ t: now, ok, kind, j: same * 0.35 });
      const d = document.createElement("i"); d.className = "ev " + (kind === "post" ? (ok ? "ok" : "no") : "oth"); d.dataset.i = events.length - 1;
      d.title = (kind === "post" ? (ok ? "post allowed" : "post denied") : "log pull") + " at " + fmt(now);
      track.appendChild(d);
      addLog(ok ? "ok" : "no", msg); draw();
    }
    function wait(m) { now += m; draw(); }
    function reset() { demoT.forEach(clearTimeout); demoT = []; now = 0; events = []; track.querySelectorAll(".ev").forEach(d => d.remove()); log.innerHTML = ""; draw(); }
    // AWS's timeline: posts at 10:00, 10:03, 10:05, a 4th at 10:06 (denied), logs at 10:07, post at 10:11 (allowed)
    function demo() {
      reset();
      const plan = [[0, "post"], [3, "post"], [5, "post"], [6, "post"], [7, "logs"], [11, "post"]];
      let t = 0;
      plan.forEach(([m, k]) => { demoT.push(setTimeout(() => { now = m; draw(); act(k); }, t)); t += RM ? 0 : 900; });
    }
    P.querySelector(".post").onclick = () => act("post");
    P.querySelector(".logs").onclick = () => act("logs");
    P.querySelector(".w1").onclick = () => wait(1);
    P.querySelector(".w4").onclick = () => wait(4);
    P.querySelector(".reset").onclick = reset;
    P.querySelector(".demo").onclick = demo;
    draw();
  }

  /* ---------- Rule 2: after reading customers/, no outbound HTTP ---------- */
  function taint(P) {
    const ACTS = [
      { label: "cat notes/todo.md", via: "shell", ev: "fs:read", arg: "notes/todo.md" },
      { label: "pd.read_csv('customers/q3.csv')", via: "Python", ev: "fs:read", arg: "customers/q3.csv" },
      { label: "curl -X POST https://slack.com/api/…", via: "shell", ev: "http:request", arg: "slack.com" },
      { label: "requests.post('https://slack.com/api/…')", via: "Python", ev: "http:request", arg: "slack.com" },
    ];
    P.innerHTML = `<pre class="rule"><span class="kw">forbid</span> http:request
<span class="c">when</span> history contains fs:read <span class="c">where</span> path starts with "customers/"   <span class="c">// simplified</span></pre>
      <div class="acts">${ACTS.map((a, i) => `<button data-i="${i}"><code>${a.label}</code> <small style="color:#59636e">(${a.via})</small></button>`).join("")}
        <button class="reset">Reset</button></div>
      <div class="lbl">Shared history (what every enforcement point reports, whichever tool acted)</div>
      <div class="hist"><em>empty</em></div>
      <ul class="log" aria-live="polite"></ul>
      <p class="note">Try sending before and after reading the customer file, and switch between shell and Python. The rule doesn’t care which tool did the read.</p>`;
    const hist = P.querySelector(".hist"), log = P.querySelector(".log");
    let H = [];
    function act(a) {
      let ok = true, why = "";
      if (a.ev === "http:request") {
        const t = H.find(e => e.ev === "fs:read" && e.arg.startsWith("customers/"));
        if (t) { ok = false; why = ` <span class="m">→ 403</span> denied: history contains <b>fs:read ${t.arg}</b>`; }
      }
      if (ok) {
        if (!H.length) hist.innerHTML = "";
        H.push(a);
        const s = document.createElement("span"); s.textContent = `${a.ev} ${a.arg}`;
        if (a.ev === "fs:read" && a.arg.startsWith("customers/")) s.className = "taint";
        hist.appendChild(s);
      }
      const li = document.createElement("li"); li.className = ok ? "ok" : "no";
      li.innerHTML = `${a.via}: <b>${a.label}</b> <span class="m">→ reported as</span> ${a.ev}` + (ok ? ` <span class="m">→ allowed</span>` : why);
      log.prepend(li);
    }
    P.querySelectorAll(".acts button[data-i]").forEach(b => b.onclick = () => act(ACTS[+b.dataset.i]));
    P.querySelector(".reset").onclick = () => { H = []; hist.innerHTML = "<em>empty</em>"; log.innerHTML = ""; };
  }

  document.querySelectorAll(".history-widget").forEach(mount);
})();
