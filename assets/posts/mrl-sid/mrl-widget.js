/* Matryoshka truncation explorer for EmbeddingGemma 2.
 * Storage is computed exactly (vectors x dims x 2 bytes for bfloat16).
 * Quality notes are quoted from the EmbeddingGemma 2 developer guide; where the
 * guide gives no number, the widget says so instead of inventing one.
 * Usage: add an empty div with class "mrl-widget", then load mrl-widget.js with a script tag.
 */
(function () {
  const DIMS = [768, 512, 256, 128];
  const NOTES = {
    768: { text: "full quality (reference)", media: "full quality (reference)", use: "multimodal and visual-document retrieval; when recall matters most" },
    512: { text: "not quantified in the guide", media: "not quantified in the guide", use: "the guide groups it with 768 for multimodal retrieval" },
    256: { text: "\u201cmost of the full quality\u201d", media: "about 95%", use: "storage-constrained indexes" },
    128: { text: "around 90%", media: "around 75%", use: "large text-only indexes; first-stage shortlisting before re-ranking" },
  };

  const css = `
  .mrlw{--ink:#1f2328;--quiet:#59636e;--edge:#d0d7de;--acc:#0969da;--accbg:rgba(9,105,218,.12);--bg:#f6f8fa;
    font:14px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);
    border:1px solid var(--edge);border-radius:10px;padding:16px;margin:1.5em 0}
  .mrlw h4{margin:0 0 8px;font-size:15px}
  .mrlw .row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .mrlw button{font:inherit;padding:4px 12px;border-radius:6px;border:1px solid var(--edge);background:transparent;color:var(--ink);cursor:pointer}
  .mrlw button[aria-pressed=true]{background:var(--accbg);border-color:var(--acc);font-weight:600}
  .mrlw .vec{display:flex;height:22px;margin:10px 0 4px;border:1px solid var(--edge);border-radius:4px;overflow:hidden}
  .mrlw .vec span{flex:1;border-right:1px solid var(--bg);background:transparent;transition:background .25s}
  .mrlw .vec span.on{background:var(--acc)}
  .mrlw .cap{color:var(--quiet);font-size:12.5px}
  .mrlw table{border-collapse:collapse;margin-top:10px;width:100%;color:inherit;font:inherit}
  .mrlw td{color:inherit;padding:4px 8px;border-top:1px solid var(--edge);vertical-align:top}
  .mrlw td:first-child{color:var(--quiet);width:42%}
  .mrlw input{font:inherit;width:9em;padding:2px 6px;border:1px solid var(--edge);border-radius:6px;background:transparent;color:var(--ink)}`;

  function fmtBytes(b) {
    const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0;
    while (b >= 1000 && i < u.length - 1) { b /= 1000; i++; }
    return (b >= 100 ? b.toFixed(0) : b.toFixed(b >= 10 ? 1 : 2)) + " " + u[i];
  }

  function mount(root) {
    if (!document.getElementById("mrlw-css")) {
      const s = document.createElement("style"); s.id = "mrlw-css"; s.textContent = css; document.head.appendChild(s);
    }
    root.classList.add("mrlw");
    root.innerHTML = `<h4>Try it: truncate an EmbeddingGemma 2 vector</h4>
      <div class="row" role="group" aria-label="Embedding dimensions"></div>
      <div class="vec" aria-hidden="true"></div>
      <div class="cap">Each cell is 16 dimensions of the 768-d vector. The highlighted prefix is what you keep.</div>
      <table><tbody>
        <tr><td>Vectors in your index</td><td><input type="number" min="1" step="1000" value="1000000" aria-label="number of vectors"></td></tr>
        <tr><td>Storage (bfloat16, 2 bytes per dim)</td><td class="st"></td></tr>
        <tr><td>Reduction vs 768-d</td><td class="red"></td></tr>
        <tr><td>Text &amp; code retrieval quality</td><td class="qt"></td></tr>
        <tr><td>Image, video &amp; speech retrieval quality</td><td class="qm"></td></tr>
        <tr><td>Suggested use</td><td class="use"></td></tr>
      </tbody></table>
      <div class="cap" style="margin-top:8px">Quality figures: EmbeddingGemma 2 developer guide (Google, Oct 2026). Storage is plain arithmetic.</div>`;
    const btns = root.querySelector(".row"), vec = root.querySelector(".vec"), input = root.querySelector("input");
    for (let i = 0; i < 48; i++) vec.appendChild(document.createElement("span"));
    let dim = 768;
    DIMS.forEach(d => {
      const b = document.createElement("button"); b.textContent = d + "-d"; b.onclick = () => { dim = d; render(); }; btns.appendChild(b);
    });
    input.oninput = render;
    function render() {
      [...btns.children].forEach((b, i) => b.setAttribute("aria-pressed", DIMS[i] === dim));
      [...vec.children].forEach((c, i) => c.classList.toggle("on", i < dim / 16));
      const n = Math.max(0, Number(input.value) || 0);
      root.querySelector(".st").textContent = fmtBytes(n * dim * 2);
      root.querySelector(".red").textContent = dim === 768 ? "none (full size)" : (768 / dim).toFixed(dim === 512 ? 1 : 0) + "\u00d7 smaller";
      root.querySelector(".qt").textContent = NOTES[dim].text;
      root.querySelector(".qm").textContent = NOTES[dim].media;
      root.querySelector(".use").textContent = NOTES[dim].use;
    }
    render();
  }
  document.querySelectorAll(".mrl-widget").forEach(mount);
})();
