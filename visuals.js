/* Lightweight, lazy entry point for the spatial learning engine. No GPU work on the catalogue. */
window.FocalVisuals = (() => {
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  let modulePromise;
  const load = () => (modulePromise ??= import("./spatial.js?v=20261104-3"));
  const seen = new WeakSet();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        load()
          .then((engine) => {
            if (entry.target.isConnected) engine.mount(entry.target);
          })
          .catch(() => {
            entry.target.dataset.state = "unavailable";
            const loading = entry.target.querySelector(".spatial-loading");
            if (loading)
              loading.innerHTML =
                "<span>La scène 3D ne peut pas se charger.</span><small>Les explications et les étapes restent disponibles ci-dessous.</small>";
          });
      }
    },
    { rootMargin: "80px" },
  );
  function scan() {
    document.querySelectorAll(".spatial-view").forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        observer.observe(el);
      }
    });
  }
  let scheduled = false;
  const mutations = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  });
  mutations.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return {
    draw(kind, step = 0, title = "Explorer la notion en 3D", mode = "preview") {
      return `<div class="spatial-view spatial-${escape(mode)}" data-kind="${escape(kind)}" data-step="${step}" data-mode="${escape(mode)}" data-title="${escape(title)}" data-state="loading"><div class="spatial-loading"><span class="spatial-loader" aria-hidden="true"></span><span>Préparation de la scène 3D</span><small>${escape(title)}</small></div></div>`;
    },
    update(element, kind, step, title) {
      const view = element.querySelector(".spatial-view");
      if (!view) {
        element.innerHTML = this.draw(kind, step, title, "interactive");
        return;
      }
      view.dataset.kind = kind;
      view.dataset.step = String(step);
      view.dataset.title = title;
      view.dataset.state = "loading";
      load().then((engine) => engine.mount(view));
    },
    ready: load,
  };
})();
