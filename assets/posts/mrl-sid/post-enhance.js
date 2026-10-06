/* Small reading aids for this post: "#" links on headings, click-to-enlarge figures,
 * and a copy button for the citation. No dependencies; safe to load once at the end of the post.
 */
(function () {
  const entry = document.querySelector(".entry");
  if (!entry) return;

  // 1. "#" link before each section heading that has an id
  entry.querySelectorAll("h2[id], h3[id]").forEach(h => {
    const a = document.createElement("a");
    a.className = "hd-anchor"; a.href = "#" + h.id; a.textContent = "#";
    a.setAttribute("aria-label", "Link to this section");
    h.insertBefore(a, h.firstChild);
  });

  // 2. click a figure to see it full width
  const box = document.createElement("div");
  box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.hidden = true;
  box.innerHTML = '<button class="lb-close" aria-label="Close enlarged figure">×</button><img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector("img");
  let last = null;
  const close = () => { box.hidden = true; document.body.style.overflow = ""; if (last) last.focus(); };
  box.addEventListener("click", e => { if (e.target !== big) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !box.hidden) close(); });
  entry.querySelectorAll("img").forEach(img => {
    if (!/\.svg|image\/svg/.test(img.getAttribute("src") || "")) return;   // only the diagrams
    img.classList.add("zoomable"); img.tabIndex = 0; img.setAttribute("role", "button");
    img.setAttribute("aria-label", (img.alt || "Figure") + " (click to enlarge)");
    const open = () => {
      last = img; big.src = img.src; big.alt = img.alt; box.hidden = false;
      document.body.style.overflow = "hidden"; box.querySelector(".lb-close").focus();
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  // 3. copy-to-clipboard buttons: <button data-copy="#some-pre">
  document.querySelectorAll("button[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const src = document.querySelector(btn.dataset.copy);
      if (!src) return;
      const text = src.innerText.trim(), label = btn.textContent;
      try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
      catch (e) {   // older browsers or no permission: select the text so the reader can copy it
        const r = document.createRange(); r.selectNodeContents(src);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Press Ctrl/Cmd+C";
      }
      setTimeout(() => { btn.textContent = label; }, 1800);
    });
  });
})();
