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
  let modulePromise,
    attempt = 0;
  const load = () =>
    (modulePromise ??= import(
      "./spatial.js?v=20261104-6" + (attempt ? "&retry=" + attempt : "")
    ).catch((error) => {
      modulePromise = undefined;
      attempt++;
      throw error;
    }));
  function showError(host) {
    host.dataset.state = "unavailable";
    host.innerHTML =
      '<div class="spatial-unavailable"><strong>Le chargement 3D n’a pas abouti.</strong><p>Vous pouvez relancer le chargement sans quitter la leçon.</p><button class="btn alt" data-spatial-retry>Réessayer la 3D</button></div>';
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-spatial-retry]");
    if (!button) return;
    const host = button.closest(".spatial-view");
    if (!host) return;
    host.dataset.state = "loading";
    button.disabled = true;
    button.textContent = "Nouvel essai…";
    load()
      .then((engine) => engine.mount(host))
      .catch(() => showError(host));
  });
  const seen = new WeakSet();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        load()
          .then((engine) => {
            if (entry.target.isConnected) return engine.mount(entry.target);
          })
          .catch(() => showError(entry.target));
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
    draw(
      kind,
      step = 0,
      title = "Explorer la notion en 3D",
      mode = "preview",
      capture = null,
    ) {
      const shooting = capture || window.FocalCamera?.capture(kind, step) || {};
      return `<div data-capture="${escape(JSON.stringify(shooting))}" class="spatial-view spatial-${escape(mode)}" data-kind="${escape(kind)}" data-step="${step}" data-mode="${escape(mode)}" data-title="${escape(title)}" data-state="loading"><div class="spatial-loading"><span class="spatial-loader" aria-hidden="true"></span><span>Préparation de la scène 3D</span><small>${escape(title)}</small></div>${mode === "preview" ? `<button class="spatial-open" data-open-spatial aria-label="Ouvrir en 3D : ${escape(title)}"><span aria-hidden="true">◇</span> Ouvrir en 3D <span aria-hidden="true">↗</span></button>` : ""}</div>`;
    },
    update(element, kind, step, title) {
      const view = element.querySelector(".spatial-view");
      if (!view) {
        element.innerHTML = this.draw(kind, step, title, "interactive");
        return;
      }
      view.dataset.capture = JSON.stringify(
        window.FocalCamera?.capture(kind, step) || {},
      );
      view.dataset.kind = kind;
      view.dataset.step = String(step);
      view.dataset.title = title;
      view.dataset.state = "loading";
      load()
        .then((engine) => engine.mount(view))
        .catch(() => showError(view));
    },
    ready: load,
  };
})();
