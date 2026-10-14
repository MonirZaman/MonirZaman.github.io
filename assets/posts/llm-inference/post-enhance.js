/* Small reading aids for this post: "#" links on headings, click-to-enlarge figures, a copy button
 * for the citation, a thin reading-progress bar, and a gentle fade-in for figures as they scroll into view.
 * No dependencies; safe to load once at the end of the post. Motion is skipped for reduced-motion readers.
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
  // 4. reading-progress bar along the top of the window
  const bar = document.createElement("div");
  bar.className = "read-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  let ticking = false;
  const update = () => {
    const r = entry.getBoundingClientRect(), total = r.height - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    bar.style.transform = "scaleX(" + p + ")"; ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update); update();

  // 5. figures and widgets fade in as they enter the viewport
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const targets = entry.querySelectorAll("p > img, picture, .thesis, .story-widget, .trifecta-widget, .layers-widget, .history-widget, .escape-widget, .escape-chart, table");
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(t => {
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight) return;          // already on screen: leave it alone
      t.classList.add("js-reveal"); io.observe(t);
    });
  }
})();
