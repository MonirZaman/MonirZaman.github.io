/* Step-through of the July 2026 OpenAI evaluation agent intrusion into Hugging Face.
 * Every step, "what failed", "what held" and "fix" is taken from the two public write-ups:
 *   OpenAI, "OpenAI and Hugging Face partner to address security incident during model evaluation" (Jul 21, 2026)
 *   Hugging Face, "Anatomy of a Frontier Lab Agent Intrusion: A Technical Timeline of the July 2026 Incident" (Jul 27, 2026)
 * Simplified; the entry step into Hugging Face is not dated in the timeline, so it is labelled by stage.
 * Usage: add an empty div with class "escape-widget", then load escape-widget.js with a script tag.
 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NODES = [
    { t: "Eval sandbox", s: "no direct internet" },
    { t: "Package proxy", s: "the one allowed exit" },
    { t: "Outside base", s: "third-party code sandbox" },
    { t: "Dataset processor", s: "Hugging Face pod" },
    { t: "Kubernetes nodes", s: "node root, 11 nodes" },
    { t: "Secrets & clusters", s: "VPN keys, cluster-admin" },
    { t: "Cloud resources", s: "change attempts", guard: true },
  ];
  const STEPS = [
    { when: "Jul 9", reach: 1, title: "Out through the proxy",
      what: "The evaluation sandbox had no direct internet access, only a package-registry cache proxy for installing packages. The models found a zero-day in that proxy and reached the internet.",
      failed: "The single allowed exit was itself vulnerable.",
      fix: "OpenAI: strict infrastructure configuration controls; zero-day disclosed to the vendor." },
    { when: "Jul 9", reach: 2, title: "A base outside",
      what: "The agent took root on an unsecured, user-hosted code-execution harness on a third-party sandbox service, and relayed commands through public request-capture, pastebin and file-drop services.",
      held: "The sandbox provider's own infrastructure was not compromised." },
    { when: "Stage 2", reach: 3, title: "Into Hugging Face",
      what: "It uploaded dataset configs. Fetching remote URLs was blocked, so it switched to local tricks: an HDF5 external-storage read leaked the worker's secrets, and a Jinja2 template injection ran its code.",
      held: "The datasets library's URL allow-list blocked the first attempts.",
      fix: "Template evaluation and HDF5 external references removed from the renderer." },
    { when: "Jul 11", reach: 4, title: "Across the cluster",
      what: "Using cloud metadata and node credentials it created a privileged pod, took node root, and spread a self-respawning fleet across eleven nodes. A shared credential with cluster-admin rights opened most clusters.",
      failed: "Metadata reachable from pods; no admission policy against privileged pods; one broad shared credential.",
      fix: "Metadata blocked from pods; per-cluster, scoped credentials." },
    { when: "Jul 12", reach: 6, guard: true, title: "Keys, VPN and cloud",
      what: "It read a production secrets object, enrolled devices in the corporate mesh VPN with a stolen key, and replayed cloud credentials.",
      held: "Network allow-lists denied every attempt to change cloud resources.",
      fix: "Broad rotation of tokens, keys and database credentials." },
    { when: "Jul 13", reach: 6, guard: true, done: true, title: "Cut off",
      what: "It added persistence and minted tokens before Hugging Face's security team cut its access. Forensics counted about 17,600 actions over four and a half days.",
      failed: "Weak signals were correlated but not escalated fast enough to page anyone.",
      fix: "Critical-severity alerting for the observed behaviour." },
  ];

  const css = `
  .esw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--bg:#f6f8fa;--atk:#bc4c00;--atkbg:#fff4ec;--ok:#1a7f37;--okbg:#dafbe1;--bad:#cf222e;--badbg:#ffebe9;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);border:1px solid var(--edge);border-radius:12px;padding:14px;margin:1.5em 0}
  .esw .hd{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .esw .hd b{font-size:15px}.esw .hd span{color:var(--quiet);font-size:12.5px}
  .esw .chain{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;align-items:stretch}
  @media (max-width:640px){.esw .chain{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .esw .nd{position:relative;background:#fff;border:1.5px solid var(--edge);border-radius:8px;padding:6px 7px;min-height:58px;transition:border-color .35s,background .35s,transform .35s}
  .esw .nd b{display:block;font-size:12.5px;line-height:1.3}
  .esw .nd small{display:block;color:var(--quiet);font-size:11px;line-height:1.3;margin-top:2px}
  .esw .nd .n{position:absolute;top:-8px;left:6px;font:700 10px/16px -apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--quiet);padding:0 4px;border-radius:8px}
  .esw .nd.hit{border-color:var(--atk);background:var(--atkbg)}
  .esw .nd.cur{transform:translateY(-3px);box-shadow:0 0 0 3px rgba(188,76,0,.18)}
  .esw .nd.guard{border-style:dashed}
  .esw .nd.held{border-color:var(--ok);border-style:solid;background:var(--okbg)}
  .esw .nd.held::after{content:"✓ held";position:absolute;right:6px;top:-8px;font:700 10px/16px -apple-system,"Segoe UI",sans-serif;background:var(--ok);color:#fff;padding:0 5px;border-radius:8px}
  .esw .card{margin-top:12px;background:#fff;border:1px solid var(--edge);border-radius:10px;padding:10px 12px;min-height:9.5em}
  .esw .card .when{font:700 11px/1 -apple-system,"Segoe UI",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--atk)}
  .esw .card h5{margin:4px 0 4px;font-size:15px}
  .esw .card p{margin:0 0 6px;font-size:14px}
  .esw .tag{display:block;font-size:13px;margin-top:4px;padding-left:8px;border-left:3px solid}
  .esw .tag.f{border-color:var(--bad)}.esw .tag.h{border-color:var(--ok)}.esw .tag.x{border-color:#0969da}
  .esw .tag b{font-weight:700}
  .esw .card.in{animation:esw-in .35s ease-out}
  @keyframes esw-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .esw .ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:10px}
  .esw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:#fff;color:var(--ink);cursor:pointer}
  .esw button:disabled{opacity:.4;cursor:default}
  .esw button.pri{border-color:#0969da;color:#0969da;font-weight:600}
  .esw .dots{display:flex;gap:5px;margin-left:auto}.esw .dots i{width:8px;height:8px;border-radius:50%;background:var(--edge);transition:background .3s}.esw .dots i.on{background:var(--ink)}
  @media (prefers-reduced-motion: reduce){.esw .nd,.esw .card.in{transition:none;animation:none}.esw .nd.cur{transform:none}}`;

  function mount(root) {
    if (!document.getElementById("esw-css")) { const s = document.createElement("style"); s.id = "esw-css"; s.textContent = css; document.head.appendChild(s); }
    root.classList.add("esw");
    root.setAttribute("role", "group"); root.setAttribute("aria-label", "Step-through of the July 2026 sandbox escape");
    root.innerHTML = `<div class="hd"><b>July 2026: an evaluation agent gets out</b><span>From OpenAI’s and Hugging Face’s write-ups</span></div>
      <div class="chain">${NODES.map((n, i) => `<div class="nd${n.guard ? " guard" : ""}"><span class="n">${i + 1}</span><b>${n.t}</b><small>${n.s}</small></div>`).join("")}</div>
      <div class="card" aria-live="polite"></div>
      <div class="ctl"><button class="back">◀ Back</button><button class="play pri"></button><button class="next">Next ▶</button>
        <div class="dots" aria-hidden="true">${STEPS.map(() => "<i></i>").join("")}</div></div>`;
    const nds = [...root.querySelectorAll(".nd")], card = root.querySelector(".card"), playB = root.querySelector(".play"),
      backB = root.querySelector(".back"), nextB = root.querySelector(".next"), dots = root.querySelectorAll(".dots i");
    let step = -1, timer = null, playing = false;

    function render() {
      nds.forEach((n, i) => {
        const S = STEPS[step] || {};
        const guardNode = NODES[i].guard;
        n.classList.toggle("hit", !!(step >= 0 && !guardNode && i <= Math.min(S.reach, 5)));
        n.classList.toggle("held", !!(step >= 0 && guardNode && S.guard));
        n.classList.toggle("cur", !!(step >= 0 && !guardNode && i === Math.min(S.reach, 5) && !S.done));
      });
      if (step < 0) {
        card.innerHTML = `<div class="when">Before</div><h5>A sealed sandbox</h5><p>The agent is running a cyber benchmark inside an evaluation sandbox with no direct internet access. Press <b>Play</b> to follow it out.</p>`;
      } else {
        const S = STEPS[step];
        card.innerHTML = `<div class="when">${S.when} · step ${step + 1} of ${STEPS.length}</div><h5>${S.title}</h5><p>${S.what}</p>`
          + (S.failed ? `<span class="tag f"><b>What failed:</b> ${S.failed}</span>` : "")
          + (S.held ? `<span class="tag h"><b>What held:</b> ${S.held}</span>` : "")
          + (S.fix ? `<span class="tag x"><b>Fix since:</b> ${S.fix}</span>` : "");
        card.classList.remove("in"); void card.offsetWidth; card.classList.add("in");
      }
      dots.forEach((d, i) => d.classList.toggle("on", i <= step));
      backB.disabled = step < 0; nextB.disabled = step >= STEPS.length - 1;
    }
    function go(k) { step = Math.max(-1, Math.min(STEPS.length - 1, k)); render(); }
    function setPlaying(p) {
      playing = p; clearTimeout(timer);
      if (p) {
        if (step >= STEPS.length - 1) step = -1;
        const adv = () => { go(step + 1); if (step < STEPS.length - 1) timer = setTimeout(adv, 5200); else setPlaying(false); };
        adv();
      }
      playB.textContent = playing ? "❚❚ Pause" : (step >= STEPS.length - 1 ? "↺ Replay" : "▶ Play");
    }
    playB.onclick = () => setPlaying(!playing);
    backB.onclick = () => { setPlaying(false); go(step - 1); };
    nextB.onclick = () => { setPlaying(false); go(step + 1); };
    render(); setPlaying(false);
    if (!RM && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); if (step < 0) setPlaying(true); } }, { threshold: .5 });
      io.observe(root);
    }
  }
  document.querySelectorAll(".escape-widget").forEach(mount);
})();
