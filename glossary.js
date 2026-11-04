/* Technical terms are real links: keyboard accessible, bookmarkable, and opened in context. */
window.FocalGlossary = (() => {
  const esc = (value) =>
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
  const selectors =
    ".chapter-content p,.callout,.concept-intro h2,.takeaway p,#scenario-explanation,.comparison-card p,.mission-instruction,#pane-resources p,.answer-feedback";
  let terms = [],
    lookup = new Map(),
    pattern,
    scheduled = false,
    observer,
    returnPoint = null,
    pendingReturn = false;
  const normalize = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function linkText(node) {
    if (
      !node.parentElement ||
      node.parentElement.closest(
        "a,button,textarea,code,script,style,.glossary-page",
      )
    )
      return;
    const content = node.textContent;
    pattern.lastIndex = 0;
    const matches = [...content.matchAll(pattern)];
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of matches) {
      const start = match.index,
        end = start + match[0].length,
        before = content[start - 1],
        after = content[end];
      if (
        (before && /[\p{L}\p{N}]/u.test(before)) ||
        (after && /[\p{L}\p{N}]/u.test(after))
      )
        continue;
      const term = lookup.get(normalize(match[0]));
      if (!term) continue;
      fragment.append(document.createTextNode(content.slice(offset, start)));
      const a = document.createElement("a");
      a.href = "#glossary/" + term.slug;
      a.className = "technical-term";
      a.textContent = match[0];
      a.title = "Comprendre « " + term.title + " » en 3D";
      a.setAttribute("aria-label", match[0] + " : explication et animation 3D");
      fragment.append(a);
      offset = end;
    }
    if (offset) {
      fragment.append(document.createTextNode(content.slice(offset)));
      node.replaceWith(fragment);
    }
  }
  function linkify() {
    if (!pattern) return;
    document
      .querySelectorAll("#app " + selectors.split(",").join(",#app "))
      .forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(linkText);
      });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      linkify();
    });
  }
  async function init() {
    const response = await fetch("glossary.json");
    if (!response.ok) throw Error("Lexique indisponible");
    terms = await response.json();
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a.technical-term");
      if (link && location.hash.startsWith("#lesson/"))
        returnPoint = { hash: location.hash, y: scrollY };
    });
    for (const term of terms)
      for (const alias of term.aliases) lookup.set(normalize(alias), term);
    pattern = new RegExp(
      terms
        .flatMap((t) => t.aliases)
        .sort((a, b) => b.length - a.length)
        .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|"),
      "giu",
    );
    observer = new MutationObserver((records) => {
      if (
        records.some(
          (r) =>
            !r.target.parentElement?.closest(".spatial-view,.glossary-page"),
        )
      )
        schedule();
    });
    observer.observe(document.querySelector("#app"), {
      childList: true,
      subtree: true,
      characterData: true,
    });
    linkify();
  }
  function header(crumb) {
    return `<div class="breadcrumbs"><a href="#courses">Formation</a><span>›</span><a href="#glossary">Lexique vivant</a>${crumb ? "<span>›</span>" + esc(crumb) : ""}</div>`;
  }
  function index(app) {
    document.title = "Lexique vivant — FOCAL Academy";
    app.innerHTML =
      header() +
      `<div class="glossary-page"><div class="page-heading"><div><span class="lesson-badge">LES MOTS DEVIENNENT DES MÉCANISMES</span><h1>Le lexique vivant.</h1><p class="lead">Un mot. Une explication. Une scène à manipuler. Explorez ${terms.length} notions pour comprendre ce qui se passe vraiment.</p></div><span class="glossary-emblem" aria-hidden="true">3D</span></div><label class="search-wrap glossary-search"><span aria-hidden="true">⌕</span><input id="term-search" type="search" placeholder="Ouverture, focale, ISO, bokeh…" aria-label="Rechercher un terme technique"></label><div class="glossary-grid" id="glossary-results"></div></div>`;
    const draw = () => {
      const query = normalize(app.querySelector("#term-search").value),
        rows = terms.filter((t) =>
          normalize([t.title, ...t.aliases].join(" ")).includes(query),
        );
      app.querySelector("#glossary-results").innerHTML = rows.length
        ? rows
            .map(
              (t, i) =>
                `<a class="glossary-card" href="#glossary/${t.slug}"><span class="glossary-card-number">${String(terms.indexOf(t) + 1).padStart(2, "0")}</span><span class="glossary-card-icon" aria-hidden="true">◇</span><h2>${esc(t.title)}</h2><p>${esc(t.definition)}</p><span class="glossary-card-cta">Comprendre en 3D <span>↗</span></span></a>`,
            )
            .join("")
        : '<p class="empty-state">Aucun terme ne correspond à votre recherche.</p>';
    };
    app.querySelector("#term-search").oninput = draw;
    draw();
  }
  function detail(app, slug, lastLesson) {
    const term = terms.find((t) => t.slug === slug);
    const returnHash =
      returnPoint?.hash ||
      "#lesson/" + (lastLesson || term?.lesson || "N01-L03");
    if (!term) {
      app.innerHTML =
        header() +
        `<div class="empty-state"><h1>Ce terme n’est pas dans le lexique.</h1><a class="btn" href="#glossary">Voir toutes les notions</a></div>`;
      return;
    }
    document.title = term.title + " en 3D — FOCAL Academy";
    app.innerHTML =
      header(term.title) +
      `<article class="glossary-page glossary-detail"><div class="glossary-back"><a href="${esc(returnHash)}" id="glossary-return">← Retour à ma leçon</a><a href="#glossary">Les ${terms.length} notions ↗</a></div><div class="page-heading"><div><span class="lesson-badge">COMPRENDRE PAR LE MOUVEMENT</span><h1>${esc(term.title)}<span class="title-period">.</span></h1><p class="glossary-definition">${esc(term.definition)}</p></div><span class="glossary-emblem" aria-hidden="true">3D</span></div><div class="glossary-experience"><div class="glossary-model">${FocalVisuals.draw(term.kind, 0, term.title + " : explication en trois dimensions", "interactive")}</div><aside class="glossary-story"><span class="eyebrow">LE MÉCANISME EN 3 ÉTAPES</span><div class="glossary-steps">${term.steps.map((s, i) => `<button class="glossary-step ${i === 0 ? "active" : ""}" data-glossary-step="${i}" aria-pressed="${i === 0}"><span>${String(i + 1).padStart(2, "0")}</span><strong>${esc(s.title)}</strong><span class="step-progress"></span></button>`).join("")}</div><div class="glossary-narration" aria-live="polite"><span class="eyebrow" id="glossary-step-label">ÉTAPE 01</span><h2 id="glossary-step-title">${esc(term.steps[0].title)}</h2><p id="glossary-step-body">${esc(term.steps[0].body)}</p></div><p class="illustration-label">Maquette 3D pédagogique. Les formes, les trajets et les effets sont simplifiés pour expliquer la notion.</p></aside></div><section class="glossary-concrete panel"><span class="concrete-icon" aria-hidden="true">✧</span><div><span class="eyebrow">CONCRÈTEMENT, SUR LE TERRAIN</span><h2>Ce que cela change dans votre image.</h2><p>${esc(term.example)}</p></div></section><div class="glossary-next"><a class="btn" href="#lesson/${term.lesson}/visual">Pratiquer dans la leçon associée ↗</a><a class="text-button" href="#glossary">Explorer un autre terme →</a></div></article>`;
    app.querySelector("#glossary-return").onclick = () =>
      (pendingReturn = true);
    const model = app.querySelector(".glossary-model");
    function explore(event) {
      app.querySelectorAll("[data-glossary-step]").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      app.querySelector("#glossary-step-label").textContent =
        event.type === "spatial-play"
          ? "ANIMATION DU MÉCANISME"
          : "EXPLORATION LIBRE";
      app.querySelector("#glossary-step-title").textContent =
        "Observer le mécanisme";
      app.querySelector("#glossary-step-body").textContent =
        term.definition + " " + term.steps[1].body;
    }
    model.addEventListener("spatial-change", explore);
    model.addEventListener("spatial-play", explore);
    app.querySelectorAll("[data-glossary-step]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.glossaryStep;
          app.querySelector("#glossary-return").onclick = () =>
            (pendingReturn = true);
          const model = app.querySelector(".glossary-model");
          function explore(event) {
            app.querySelectorAll("[data-glossary-step]").forEach((b) => {
              b.classList.remove("active");
              b.setAttribute("aria-pressed", "false");
            });
            app.querySelector("#glossary-step-label").textContent =
              event.type === "spatial-play"
                ? "ANIMATION DU MÉCANISME"
                : "EXPLORATION LIBRE";
            app.querySelector("#glossary-step-title").textContent =
              "Observer le mécanisme";
            app.querySelector("#glossary-step-body").textContent =
              term.definition + " " + term.steps[1].body;
          }
          model.addEventListener("spatial-change", explore);
          model.addEventListener("spatial-play", explore);
          app.querySelectorAll("[data-glossary-step]").forEach((button) => {
            button.classList.toggle("active", button === b);
            button.setAttribute("aria-pressed", button === b);
          });
          app.querySelector("#glossary-step-label").textContent =
            "ÉTAPE 0" + (i + 1);
          app.querySelector("#glossary-step-title").textContent =
            term.steps[i].title;
          app.querySelector("#glossary-step-body").textContent =
            term.steps[i].body;
          FocalVisuals.update(
            app.querySelector(".glossary-model"),
            term.kind,
            i,
            term.title + " : " + term.steps[i].title,
          );
        }),
    );
  }
  return {
    init,
    linkify,
    restorePosition() {
      if (pendingReturn && returnPoint && location.hash === returnPoint.hash) {
        pendingReturn = false;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => window.scrollTo(0, returnPoint.y)),
        );
      }
    },
    render(app, slug, lastLesson) {
      if (slug) detail(app, slug, lastLesson);
      else index(app);
    },
    get terms() {
      return terms;
    },
  };
})();
