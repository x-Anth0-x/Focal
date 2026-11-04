"use strict";
/* Static application. Content, original vector visuals and progress are independent. */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (value) =>
    String(value ?? "").replace(
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
  const KEY = "focal_academy_web_v1";
  const tabs = [
    ["course", "Cours"],
    ["visual", "Atelier visuel"],
    ["mission", "Mission terrain"],
    ["quiz", "Quiz"],
    ["resources", "Mémo"],
  ];
  const levelDescriptions = [
    "Comprendre son appareil et apprivoiser la lumière.",
    "Quitter l’automatisme, construire des choix conscients.",
    "Choisir son point de vue et son rapport au sujet.",
    "Organiser le cadre pour affirmer une intention.",
    "Observer, orienter et façonner la lumière.",
    "Adapter son regard aux situations de terrain.",
    "Développer, protéger et partager ses images.",
    "Construire une démarche et présenter son travail.",
  ];
  // Deliberate scene assignment: visual context follows the lesson rather than its level alone.
  const sceneMap = [
    0, 0, 1, 5, 3, 0, 0, 2, 6, 5, 1, 6, 2, 0, 1, 3, 0, 0, 3, 3, 1, 1, 3, 3, 4,
    2, 1, 7, 4, 4, 1, 1, 2, 5, 3, 2, 6, 6, 6, 1, 6, 6, 7, 7, 6, 6, 7, 7,
  ];
  const sceneDescriptions = [
    "Appareil photographique sur une table",
    "Portrait en lumière naturelle",
    "Lac et montagnes à la lumière dorée",
    "Rue parisienne au crépuscule",
    "Buste éclairé par une source latérale",
    "Cycliste en mouvement",
    "Espace de développement photographique",
    "Studio de prise de vue",
  ];
  let curriculum = [],
    enrichment = {},
    reference = {},
    state = {},
    activeLesson = null,
    routeCounter = 0,
    saveTimer;
  const app = $("#app");
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
  }
  function knownMap(value, validator = () => true) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      curriculum
        .filter((x) => Object.hasOwn(value, x.id) && validator(value[x.id]))
        .map((x) => [x.id, value[x.id]]),
    );
  }
  function cleanState(raw) {
    const r = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    return {
      done: knownMap(r.done, (v) => typeof v === "boolean"),
      notes: knownMap(
        r.notes,
        (v) => typeof v === "string" && v.length <= 50000,
      ),
      practice: knownMap(r.practice, (v) => typeof v === "boolean"),
      answers: knownMap(r.answers, (v) => v && typeof v === "object"),
      quizV2: knownMap(r.quizV2, (v) => v && typeof v === "object"),
      readV2: knownMap(
        r.readV2,
        (v) =>
          Array.isArray(v) &&
          v.every((n) => Number.isInteger(n) && n >= 0 && n < 20),
      ),
      completedV2: knownMap(r.completedV2, (v) => typeof v === "boolean"),
      lastLesson: curriculum.some((x) => x.id === r.lastLesson)
        ? r.lastLesson
        : reference.id,
    };
  }
  function questions(id) {
    return id === reference.id ? reference.questions : enrichment[id].questions;
  }
  function answers(id) {
    return id === reference.id
      ? state.answers[id] || {}
      : state.quizV2[id] || {};
  }
  function score(id) {
    return questions(id).reduce(
      (n, q, i) => n + (answers(id)[i] === q.correct ? 1 : 0),
      0,
    );
  }
  function target(id) {
    return id === reference.id ? 4 : questions(id).length;
  }
  function isValidated(id) {
    return (
      !!state.completedV2[id] && !!state.practice[id] && score(id) >= target(id)
    );
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      updateProgress();
    } catch {
      toast("Stockage indisponible. Exportez votre suivi pour le conserver.");
    }
  }
  function updateProgress() {
    const count = curriculum.filter((x) => isValidated(x.id)).length;
    $("#navprogress").textContent = count;
    $("#navbar").style.width = `${(count / 48) * 100}%`;
    $("#nav-progressbar").setAttribute("aria-valuenow", count);
    const lessonLink = $('[data-nav="lesson"]');
    lessonLink.href =
      "#lesson/" + (activeLesson?.id || state.lastLesson || reference.id);
  }
  function scene(lesson, extra = "", caption = true) {
    const i = sceneMap[curriculum.indexOf(lesson)],
      x = ((i % 4) / 3) * 100,
      y = i > 3 ? 100 : 0;
    return `<figure class="photo-scene ${extra}" style="--scene-x:${x}%;--scene-y:${y}%" role="img" aria-label="${esc(sceneDescriptions[i])} — illustration générée"><div class="scene-shade"></div>${caption ? `<figcaption><span class="eyebrow">LE REGARD FOCAL</span><strong>${esc(enrichment[lesson.id].headline)}</strong><small>Visuel d’illustration généré</small></figcaption>` : ""}</figure>`;
  }
  function crumbs(text) {
    return `<div class="breadcrumbs"><a href="#courses">Formation</a><span>›</span>${text}</div>`;
  }
  function footer() {
    return `<footer class="academy-footer"><strong>FOCAL Academy</strong><span>Un peu de technique. Beaucoup de regard.</span><span>Apprendre à votre rythme.</span></footer>`;
  }
  function chapters(lesson) {
    if (lesson.id === reference.id)
      return reference.chapters.map((c) => ({
        titre: c.title,
        texte: c.body,
        key: c.key,
      }));
    if (lesson.cours?.chapitres?.length) return lesson.cours.chapitres;
    const text =
      lesson.cours?.explication_detaillee || lesson.cours?.introduction || "";
    const meta = enrichment[lesson.id];
    return [
      { titre: "Comprendre la notion", texte: text },
      ...meta.scenarios.map((x) => ({ titre: x.label, texte: x.explanation })),
      {
        titre: "Construire votre expérience de terrain",
        texte:
          meta.mission +
          " Notez votre intention, gardez une trace des réglages et comparez les résultats au même grossissement. Isolez la variable étudiée autant que possible et expliquez les compensations nécessaires.",
      },
      {
        titre: "Analyser et retenir",
        texte: meta.key + " " + meta.questions.map((q) => q.why).join(" "),
      },
    ];
  }
  function navigate(hash) {
    if (location.hash === hash) renderRoute();
    else location.hash = hash;
  }
  function heading(label, title, subtitle, extra = "") {
    return `<div class="page-heading"><div><span class="lesson-badge">${label}</span><h1>${esc(title)}</h1><p class="lead">${esc(subtitle)}</p></div>${extra}</div>`;
  }
  function setNav(type, level) {
    $$("[data-nav]").forEach((a) => {
      const active = a.dataset.nav === type;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    $$("[data-level]").forEach((a) =>
      a.classList.toggle("active", +a.dataset.level === level),
    );
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#sidebar").classList.remove("menu-open");
  }
  function lessonCard(lesson) {
    const data = enrichment[lesson.id],
      passed = isValidated(lesson.id),
      read = !!state.done[lesson.id];
    return `<a class="course-card" href="#lesson/${lesson.id}">${scene(lesson, "card-photo", false)}<div class="card-body"><div class="card-meta"><span>LEÇON ${String(lesson.ordre).padStart(2, "0")}</span><span>${lesson.duree_estimee_minutes} MIN</span></div><h3>${esc(lesson.titre)}</h3><p>${esc(data.headline)}</p><div class="card-bottom"><span class="status ${passed ? "passed" : ""}">${passed ? "✓ Validée" : read ? "◌ Déjà consultée" : "Cours · atelier · quiz"}</span><span class="card-arrow" aria-hidden="true">→</span></div></div></a>`;
  }
  function renderCatalog(selectedLevel = 0) {
    activeLesson = null;
    setNav("courses", selectedLevel);
    app.innerHTML =
      crumbs("Le parcours complet") +
      heading(
        "VOTRE PROCHAINE IMAGE COMMENCE ICI",
        "48 leçons. Un nouveau regard.",
        "Des premiers réglages à votre signature visuelle : observez, expérimentez, puis passez sur le terrain.",
      ) +
      `<div class="catalog-intro"><div><span class="eyebrow">LA MÉTHODE FOCAL</span><h2>Comprendre. Voir. Faire.</h2><p>Chaque leçon réunit un cours structuré, un schéma dédié, trois situations à explorer, une mission et un quiz corrigé.</p></div><div class="catalog-stats"><span><strong>48</strong>leçons illustrées</span><span><strong>8</strong>niveaux progressifs</span><span><strong>144</strong>situations visuelles</span></div></div><div class="catalog-toolbar"><label class="search-wrap"><span aria-hidden="true">⌕</span><input id="course-search" type="search" placeholder="Rechercher une notion, une leçon…" aria-label="Rechercher une leçon"></label><label class="level-select"><span class="sr-only">Filtrer par niveau</span><select id="level-filter"><option value="0">Tous les niveaux</option>${[...new Map(curriculum.map((x) => [x.niveau, x.niveau_titre]))].map(([n, t]) => `<option value="${n}" ${n === selectedLevel ? "selected" : ""}>${n}. ${esc(t)}</option>`).join("")}</select></label></div><div id="catalog-results" aria-live="polite"></div>${footer()}`;
    const search = $("#course-search"),
      filter = $("#level-filter");
    function draw() {
      const query = search.value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const rows = curriculum.filter(
        (x) =>
          (!+filter.value || x.niveau === +filter.value) &&
          (x.titre + " " + x.niveau_titre + " " + enrichment[x.id].key)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(query),
      );
      $("#catalog-results").innerHTML =
        `<p class="result-count">${rows.length} leçon${rows.length > 1 ? "s" : ""} ${query ? "pour votre recherche" : "à explorer"}</p>` +
        (rows.length
          ? [...new Set(rows.map((x) => x.niveau))]
              .map(
                (n) =>
                  `<section class="level-section"><div class="level-heading"><span class="level-index">${String(n).padStart(2, "0")}</span><div><h2>${esc(rows.find((x) => x.niveau === n).niveau_titre)}</h2><p>${levelDescriptions[n - 1]}</p></div></div><div class="course-grid">${rows
                    .filter((x) => x.niveau === n)
                    .map(lessonCard)
                    .join("")}</div></section>`,
              )
              .join("")
          : '<div class="empty-state"><h2>Aucune leçon pour cette recherche.</h2><p>Essayez un autre mot ou affichez tous les niveaux.</p><button class="btn alt" id="clear-search">Réinitialiser les filtres</button></div>');
      if ($("#clear-search"))
        $("#clear-search").onclick = () => {
          search.value = "";
          filter.value = "0";
          draw();
        };
    }
    search.oninput = draw;
    filter.onchange = draw;
    draw();
  }
  function renderLesson(id, selectedTab = "course") {
    const lesson = curriculum.find((x) => x.id === id);
    if (!lesson) {
      renderNotFound();
      return;
    }
    activeLesson = lesson;
    state.lastLesson = id;
    save();
    setNav("lesson", lesson.niveau);
    const meta = enrichment[id],
      parts = chapters(lesson),
      idx = curriculum.indexOf(lesson);
    document.title = `${lesson.titre} — FOCAL Academy`;
    app.innerHTML =
      crumbs(
        `<a href="#courses/${lesson.niveau}">${esc(lesson.niveau_titre)}</a><span>›</span>Leçon ${lesson.ordre}`,
      ) +
      heading(
        `NIVEAU ${lesson.niveau} · LEÇON ${String(lesson.ordre).padStart(2, "0")}`,
        lesson.titre,
        meta.headline,
        `<div class="lesson-utility"><span>◷ ${lesson.duree_estimee_minutes} min environ</span><div class="lesson-pagination">${idx > 0 ? `<a href="#lesson/${curriculum[idx - 1].id}" aria-label="Leçon précédente">‹</a>` : "<span></span>"}<span>${idx + 1} / 48</span>${idx < 47 ? `<a href="#lesson/${curriculum[idx + 1].id}" aria-label="Leçon suivante">›</a>` : "<span></span>"}</div></div>`,
      ) +
      `<div class="lesson-tabs" role="tablist" aria-label="Étapes de la leçon">${tabs.map(([key, label]) => `<button role="tab" id="tab-${key}" aria-controls="pane-${key}" aria-selected="false" tabindex="-1" data-tab="${key}">${label}</button>`).join("")}</div><div id="lesson-panes">${tabs.map(([key]) => `<section role="tabpanel" id="pane-${key}" aria-labelledby="tab-${key}" hidden></section>`).join("")}</div>${footer()}`;
    $("#pane-course").innerHTML =
      `<div class="section-title"><span>01</span><h2>Voir la notion autrement.</h2></div><div class="lesson-overview"><div class="concept-intro"><span class="eyebrow">LE REPÈRE ESSENTIEL</span><h2>${esc(meta.key)}</h2><p>${esc((lesson.objectifs || [])[0])}</p><div class="concept-preview">${FocalVisuals.draw(meta.kind, 0, lesson.titre)}</div><button class="text-button" id="open-visual">Explorer les trois situations <span>→</span></button></div>${scene(lesson, "lesson-photo")}<aside class="lesson-tips"><div class="takeaway"><span class="eyebrow">◎ &nbsp; À RETENIR</span><h3>${esc(meta.scenarios[0].label)}</h3><p>${esc(meta.scenarios[0].explanation)}</p><p>${esc(meta.scenarios[1].explanation)}</p></div><div class="field-tip"><span class="eyebrow">✧ &nbsp; SUR LE TERRAIN</span><p>${esc(meta.mission)}</p></div></aside></div><div class="section-title"><span>02</span><h2>Comprendre, chapitre par chapitre.</h2><span class="chapter-counter" id="chapter-counter"></span></div><p class="section-intro">Ouvrez chaque chapitre et marquez-le comme lu à votre rythme. Votre lecture est mémorisée.</p><div class="chapter-list">${parts
        .map(
          (c, i) =>
            `<details class="chapter" ${i === 0 ? "open" : ""}><summary><span class="chapter-number">${String(i + 1).padStart(2, "0")}</span><span>${esc(c.titre)}</span><span class="chapter-toggle" aria-hidden="true">＋</span></summary><div class="chapter-content">${String(
              c.texte,
            )
              .split(/\n\n+/)
              .map((p) => `<p>${esc(p)}</p>`)
              .join(
                "",
              )}${c.key ? `<div class="callout">${esc(c.key)}</div>` : ""}<label class="read-check"><input type="checkbox" data-read="${i}" ${(state.readV2[id] || []).includes(i) ? "checked" : ""}> J’ai lu et compris ce chapitre</label></div></details>`,
        )
        .join(
          "",
        )}</div><div class="next-step"><div><span class="eyebrow">OBSERVER POUR COMPRENDRE</span><h3>Une idée devient claire quand on la compare.</h3><p>Explorez les trois situations, puis testez sur le terrain.</p></div><button class="btn" id="go-visual">Ouvrir l’atelier visuel →</button></div>`;
    $("#pane-visual").innerHTML =
      `<div class="section-title"><span>↔</span><h2>Un sujet. Trois situations.</h2></div><p class="section-intro">Sélectionnez une situation, manipulez la scène 3D et observez le mécanisme.</p><div class="scenario-tabs" role="group" aria-label="Situations à comparer">${meta.scenarios.map((x, i) => `<button class="scenario-button ${i === 0 ? "selected" : ""}" data-scenario="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span>${esc(x.label)}</button>`).join("")}</div><div class="visual-workshop"><div id="workshop-art">${FocalVisuals.draw(meta.kind, 0, lesson.titre + " : " + meta.scenarios[0].label, "interactive")}</div><aside class="workshop-explanation" aria-live="polite"><span class="eyebrow">DÉCODER L’IMAGE</span><h2 id="scenario-title">${esc(meta.scenarios[0].label)}</h2><p id="scenario-explanation">${esc(meta.scenarios[0].explanation)}</p><div class="callout">${esc(meta.key)}</div><span class="illustration-label">Maquette 3D pédagogique : mécanismes simplifiés, sans valeur de mesure optique.</span></aside></div>${["aperture", "depth"].includes(meta.kind) ? depthCalculator() : ""}<div class="comparison-heading"><span class="eyebrow">GARDER LES TROIS REPÈRES EN TÊTE</span></div><div class="comparison-grid">${meta.scenarios.map((x, i) => `<article class="comparison-card">${FocalVisuals.draw(meta.kind, i, x.label)}<div><span class="eyebrow">SITUATION 0${i + 1}</span><h3>${esc(x.label)}</h3><p>${esc(x.explanation)}</p></div></article>`).join("")}</div>`;
    $("#pane-mission").innerHTML =
      `<div class="mission-layout"><div><div class="section-title"><span>→</span><h2>De la notion à votre image.</h2></div><div class="panel mission-brief"><span class="eyebrow">VOTRE MISSION · ${esc(lesson.id)}</span><h2>${esc(lesson.titre)}</h2><p class="mission-instruction">${esc(meta.mission)}</p><h3>Votre protocole</h3><ol><li>Écrivez votre intention avant de commencer.</li><li>Gardez une trace des réglages et des conditions de chaque essai.</li><li>Comparez les résultats au même grossissement.</li><li>Notez une observation et une correction pour votre prochaine séance.</li></ol><div class="callout">${esc(meta.key)}</div></div></div><aside class="panel mission-evidence"><span class="eyebrow">À RAPPORTER DE VOTRE SÉANCE</span><h3>Une preuve, une réflexion.</h3><ul>${(lesson.exercice?.preuves || ["Une série d’essais comparables", "Des réglages consignés", "Une conclusion argumentée"]).map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="tiny">Les images restent chez vous. Le site conserve uniquement vos notes et votre déclaration de réalisation.</p></aside></div><section class="panel notes-panel"><label for="fieldNotes"><h2>Mon carnet de terrain</h2><span>Intention, réglages, observations, prochain essai.</span></label><textarea id="fieldNotes" maxlength="50000" placeholder="Mon intention…\nLes conditions et mes réglages…\nCe que j’ai observé…\nCe que je changerai…">${esc(state.notes[id] || "")}</textarea><div class="notes-actions"><button class="btn" id="saveNotes">Enregistrer mes notes</button><span id="notes-status" role="status"></span><label class="read-check"><input type="checkbox" id="practiceDone" ${state.practice[id] ? "checked" : ""}> Mission réalisée</label></div></section>`;
    $("#pane-quiz").innerHTML =
      `<div class="section-title"><span>✓</span><h2>Vérifiez votre compréhension.</h2></div><p class="section-intro">${questions(id).length} questions propres à cette leçon. Chaque réponse est expliquée ; vous pouvez recommencer à tout moment.</p><div id="quiz"></div><div class="quiz-summary panel"><div><span class="eyebrow">VOTRE RÉSULTAT</span><h2 id="score" aria-live="polite"></h2><p>Objectif : ${target(id)} / ${questions(id).length} et mission terrain réalisée.</p></div><button class="btn alt" id="retry-quiz">Recommencer le quiz</button></div><section class="panel completion-panel"><div><span class="eyebrow">UNE NOUVELLE ÉTAPE</span><h2>Valider mon parcours personnel</h2><p>Le suivi est une autoévaluation pédagogique, pas une certification professionnelle.</p></div><button class="btn" id="finish">Valider cette leçon</button><p id="finishStatus" role="status"></p></section>`;
    $("#pane-resources").innerHTML =
      `<div class="section-title"><span>▤</span><h2>Votre fiche à emporter.</h2></div><div class="memo-layout"><div class="panel"><span class="eyebrow">${esc(lesson.id)} · LE MÉMO FOCAL</span><h2>${esc(lesson.titre)}</h2><div class="callout">${esc(meta.key)}</div>${meta.scenarios.map((x) => `<h3>${esc(x.label)}</h3><p>${esc(x.explanation)}</p>`).join("")}<h3>À essayer</h3><p>${esc(meta.mission)}</p><button class="btn alt" id="print-lesson">Imprimer ma fiche</button></div><aside class="panel"><span class="eyebrow">ALLER PLUS LOIN</span><h3>Les leçons voisines</h3>${curriculum
        .filter((x) => x.niveau === lesson.niveau && x.id !== id)
        .map(
          (x) =>
            `<a class="related-lesson" href="#lesson/${x.id}"><span>${esc(x.titre)}</span><span>→</span></a>`,
        )
        .join(
          "",
        )}<p class="tiny">Les images sont des illustrations générées ; les diagrammes sont des schémas explicatifs. Les règles techniques doivent être confrontées au matériel et aux conditions réelles.</p></aside></div>`;
    function selectTab(key, updateUrl = true) {
      if (!tabs.some((t) => t[0] === key)) key = "course";
      $$("[data-tab]").forEach((b) => {
        const active = b.dataset.tab === key;
        b.setAttribute("aria-selected", active);
        b.tabIndex = active ? 0 : -1;
        $("#pane-" + b.dataset.tab).hidden = !active;
      });
      if (updateUrl) history.replaceState(null, "", `#lesson/${id}/${key}`);
    }
    $$("[data-tab]").forEach((b) => {
      b.onclick = () => selectTab(b.dataset.tab);
      b.onkeydown = (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const all = $$("[data-tab]"),
          i = all.indexOf(b),
          next =
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? all.length - 1
                : (i + (e.key === "ArrowRight" ? 1 : -1) + all.length) %
                  all.length;
        selectTab(all[next].dataset.tab);
        all[next].focus();
      };
    });
    $("#open-visual").onclick = $("#go-visual").onclick = () => {
      selectTab("visual");
      $("#tab-visual").focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    function openSpatialPreview(event) {
      const button = event.target.closest("[data-open-spatial]");
      if (!button) return;
      const step = Number(button.closest(".spatial-view").dataset.step) || 0;
      selectTab("visual");
      $(`[data-scenario="${step}"]`).click();
      requestAnimationFrame(() => {
        $(".visual-workshop").scrollIntoView({
          block: "start",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        });
        $("#tab-visual").focus({ preventScroll: true });
      });
    }
    $("#pane-course").addEventListener("click", openSpatialPreview);
    $("#pane-visual").addEventListener("click", openSpatialPreview);
    function readCount() {
      const count = (state.readV2[id] || []).length;
      $("#chapter-counter").textContent = `${count} / ${parts.length} lus`;
    }
    $$("[data-read]").forEach(
      (input) =>
        (input.onchange = () => {
          const read = new Set(state.readV2[id] || []);
          if (input.checked) read.add(+input.dataset.read);
          else read.delete(+input.dataset.read);
          state.readV2[id] = [...read];
          state.done[id] = read.size === parts.length;
          save();
          readCount();
        }),
    );
    readCount();
    $$("[data-scenario]").forEach(
      (button) =>
        (button.onclick = () => {
          const i = +button.dataset.scenario;
          $$("[data-scenario]").forEach((b) => {
            b.classList.toggle("selected", b === button);
            b.setAttribute("aria-pressed", b === button);
          });
          FocalVisuals.update(
            $("#workshop-art"),
            meta.kind,
            i,
            lesson.titre + " : " + meta.scenarios[i].label,
          );
          $("#scenario-title").textContent = meta.scenarios[i].label;
          $("#scenario-explanation").textContent =
            meta.scenarios[i].explanation;
        }),
    );
    function exploreScene() {
      $$("[data-scenario]").forEach((b) => {
        b.classList.remove("selected");
        b.setAttribute("aria-pressed", "false");
      });
      $("#scenario-title").textContent = "Exploration libre";
      $("#scenario-explanation").textContent =
        meta.key +
        " Les réglages du laboratoire remplacent le préréglage de la situation. Sélectionnez une situation pour y revenir.";
    }
    $("#workshop-art").addEventListener("spatial-change", exploreScene);
    $("#workshop-art").addEventListener("spatial-play", exploreScene);
    const notes = $("#fieldNotes"),
      notesStatus = $("#notes-status");
    let noteTimer;
    function storeNotes(explicit = false) {
      state.notes[id] = notes.value;
      save();
      notesStatus.textContent = "Notes enregistrées sur cet appareil.";
      if (explicit) toast("Votre carnet est enregistré.");
    }
    notes.oninput = () => {
      notesStatus.textContent = "Enregistrement…";
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => storeNotes(), 400);
    };
    notes.onblur = () => {
      clearTimeout(noteTimer);
      storeNotes();
    };
    $("#saveNotes").onclick = () => storeNotes(true);
    $("#practiceDone").onchange = (e) => {
      state.practice[id] = e.target.checked;
      save();
      $("#finishStatus").textContent = "";
    };
    renderQuiz(lesson);
    $("#retry-quiz").onclick = () => {
      if (id === reference.id) state.answers[id] = {};
      else state.quizV2[id] = {};
      save();
      renderQuiz(lesson);
      $("#finishStatus").textContent =
        "Réponses effacées. Vous pouvez recommencer.";
    };
    $("#finish").onclick = () => {
      if (!state.practice[id] || score(id) < target(id)) {
        $("#finishStatus").textContent =
          `Pour valider : réalisez la mission et obtenez au moins ${target(id)} / ${questions(id).length} au quiz.`;
        return;
      }
      state.completedV2[id] = true;
      state.done[id] = true;
      save();
      $("#finishStatus").textContent =
        "Leçon validée dans votre parcours personnel. Bien joué !";
      toast("Une nouvelle leçon validée !");
    };
    if (isValidated(id))
      $("#finishStatus").textContent =
        "Leçon déjà validée dans votre parcours personnel.";
    $("#print-lesson").onclick = () => {
      document.body.classList.add("print-memo");
      window.print();
      document.body.classList.remove("print-memo");
    };
    if ($("#depth-form")) bindDepthCalculator();
    selectTab(selectedTab, false);
  }
  function renderQuiz(lesson) {
    const id = lesson.id,
      a = answers(id);
    $("#quiz").innerHTML = questions(id)
      .map(
        (q, i) =>
          `<section class="quiz-question panel"><div class="question-number">QUESTION ${String(i + 1).padStart(2, "0")}</div><h3>${esc(q.q)}</h3><div class="quiz-options">${q.a.map((option, j) => `<button class="quizopt ${a[i] === j ? (j === q.correct ? "correct" : "wrong") : ""}" data-q="${i}" data-a="${j}" aria-pressed="${a[i] === j}"><span>${String.fromCharCode(65 + j)}</span>${esc(option)}${a[i] === j ? `<span class="answer-mark" aria-hidden="true">${j === q.correct ? "✓" : "×"}</span>` : ""}</button>`).join("")}</div>${Number.isInteger(a[i]) ? `<div class="answer-feedback ${a[i] === q.correct ? "good" : ""}" role="status"><strong>${a[i] === q.correct ? "Bien vu." : "À revoir."}</strong> ${esc(q.why)}</div>` : ""}</section>`,
      )
      .join("");
    $$("[data-q]").forEach(
      (button) =>
        (button.onclick = () => {
          const dest = id === reference.id ? state.answers : state.quizV2;
          dest[id] ??= {};
          dest[id][+button.dataset.q] = +button.dataset.a;
          save();
          renderQuiz(lesson);
          const chosen = $(
            `[data-q="${button.dataset.q}"][data-a="${button.dataset.a}"]`,
          );
          chosen.focus({ preventScroll: true });
        }),
    );
    $("#score").textContent =
      `${score(id)} / ${questions(id).length} bonnes réponses`;
  }
  function depthCalculator() {
    return `<section class="panel depth-calculator"><span class="eyebrow">LABORATOIRE OPTIQUE</span><h2>Estimer la profondeur de champ</h2><p>Modèle de lentille mince, capteur plein format, cercle de confusion conventionnel de 0,03 mm. Valeurs indicatives, dépendantes du critère de netteté.</p><div id="depth-form" class="depth-grid"><div class="depth-inputs"><label for="aperture">Ouverture <output id="apertureOut"></output></label><input id="aperture" type="range" min="0" max="9" value="2"><label for="focal">Focale <output id="focalOut"></output></label><input id="focal" type="range" min="24" max="135" value="50"><label for="distance">Distance de mise au point <output id="distanceOut"></output></label><input id="distance" type="range" min="1" max="10" value="2" step="0.1"><button class="btn alt" id="resetLab">Réinitialiser</button></div><div class="depth-result" aria-live="polite"><span>Profondeur de champ estimée</span><strong id="dofOut"></strong><div><span>Limite proche <b id="nearOut"></b></span><span>Limite lointaine <b id="farOut"></b></span></div><p>Le calcul ne mesure ni le rendu du bokeh ni la diffraction.</p></div></div></section>`;
  }
  function bindDepthCalculator() {
    const values = [1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22, 32];
    function draw() {
      const N = values[+$("#aperture").value],
        f = +$("#focal").value,
        s = +$("#distance").value,
        fl = f / 1000,
        H = ((f * f) / (N * 0.03) + f) / 1000,
        near = (H * s) / (H + s - fl),
        far = s >= H ? Infinity : (H * s) / (H - s + fl),
        fmt = (n) =>
          Number.isFinite(n)
            ? n.toLocaleString("fr-FR", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }) + " m"
            : "∞";
      $("#apertureOut").textContent = "f/" + String(N).replace(".", ",");
      $("#focalOut").textContent = f + " mm";
      $("#distanceOut").textContent = s.toLocaleString("fr-FR") + " m";
      $("#nearOut").textContent = fmt(near);
      $("#farOut").textContent = fmt(far);
      $("#dofOut").textContent = fmt(far - near);
    }
    ["aperture", "focal", "distance"].forEach(
      (id) => ($("#" + id).oninput = draw),
    );
    $("#resetLab").onclick = () => {
      ["2", "50", "2"].forEach(
        (value, i) =>
          ($("#" + ["aperture", "focal", "distance"][i]).value = value),
      );
      draw();
    };
    draw();
  }
  // External progress updates must never re-render a route: doing so saves its last
  // lesson again and causes different lesson tabs to continually reload each other.
  function syncVisibleState(previous) {
    updateProgress();
    const put = (element, value) => {
      if (element && element.textContent !== String(value))
        element.textContent = value;
    };
    function badge(id) {
      return isValidated(id)
        ? "✓ Validée"
        : state.done[id]
          ? "◌ Déjà consultée"
          : "Cours · atelier · quiz";
    }
    $$(".course-card").forEach((card) => {
      const id = card.getAttribute("href").split("/").pop();
      const status = $(".status", card);
      put(status, badge(id));
      status?.classList.toggle("passed", isValidated(id));
    });
    if (activeLesson) {
      const id = activeLesson.id,
        notes = $("#fieldNotes");
      if (
        notes &&
        document.activeElement !== notes &&
        previous.notes[id] !== state.notes[id]
      )
        notes.value = state.notes[id] || "";
      const practice = $("#practiceDone");
      if (practice) practice.checked = !!state.practice[id];
      $$("[data-read]").forEach(
        (input) =>
          (input.checked = (state.readV2[id] || []).includes(
            +input.dataset.read,
          )),
      );
      put(
        $("#chapter-counter"),
        `${(state.readV2[id] || []).length} / ${$$(".chapter").length} lus`,
      );
      const oldAnswers =
        id === reference.id ? previous.answers[id] : previous.quizV2[id];
      const newAnswers =
        id === reference.id ? state.answers[id] : state.quizV2[id];
      const changedAnswers =
        JSON.stringify(oldAnswers || {}) !== JSON.stringify(newAnswers || {});
      if (changedAnswers) {
        const focus = document.activeElement?.closest("[data-q][data-a]");
        const restore = focus
          ? `[data-q="${focus.dataset.q}"][data-a="${focus.dataset.a}"]`
          : null;
        renderQuiz(activeLesson);
        if (restore) $(restore)?.focus({ preventScroll: true });
      }
      if (
        changedAnswers ||
        previous.practice[id] !== state.practice[id] ||
        previous.completedV2[id] !== state.completedV2[id]
      )
        put(
          $("#finishStatus"),
          isValidated(id)
            ? "Leçon déjà validée dans votre parcours personnel."
            : "",
        );
    }
    if ($(".progress-hero")) {
      const validated = curriculum.filter((x) => isValidated(x.id)).length,
        read = curriculum.filter((x) => state.done[x.id]).length;
      put($(".progress-hero h2"), `${validated} / 48 leçons validées`);
      const ring = $(".progress-ring");
      ring.style.setProperty("--percent", `${(validated / 48) * 100}%`);
      const percent = Math.round((validated / 48) * 100);
      if (ring.dataset.value !== String(percent)) {
        ring.querySelector("strong").innerHTML = `${percent}<small>%</small>`;
        ring.dataset.value = percent;
      }
      put(
        $(".progress-hero > div:nth-child(2) > p"),
        `${read} leçons consultées ou lues · ${Object.values(state.notes).filter(Boolean).length} carnets de terrain`,
      );
      $(".progress-hero > div:nth-child(2) > a").href =
        "#lesson/" + state.lastLesson;
      $$(".level-progress").forEach((panel, index) => {
        const count = curriculum.filter(
          (x) => x.niveau === index + 1 && isValidated(x.id),
        ).length;
        put($(".level-heading p", panel), `${count} / 6 validées`);
        $(".progress > div", panel).style.width = `${(count / 6) * 100}%`;
      });
      $$(".progress-lesson").forEach((link) => {
        const id = link.getAttribute("href").split("/").pop(),
          symbol = $(".progress-symbol", link);
        put(symbol, isValidated(id) ? "✓" : state.done[id] ? "◌" : "○");
        symbol.classList.toggle("passed", isValidated(id));
        put($("small", link), `${score(id)} / ${questions(id).length}`);
      });
    }
  }
  function renderProgress() {
    activeLesson = null;
    setNav("progress");
    const validated = curriculum.filter((x) => isValidated(x.id)).length,
      read = curriculum.filter((x) => state.done[x.id]).length;
    app.innerHTML =
      crumbs("Ma progression") +
      heading(
        "CHAQUE IMAGE EST UNE ÉTAPE",
        "Votre regard prend forme.",
        "Retrouvez vos acquis, vos lectures et votre carnet. Votre suivi est conservé sur cet appareil.",
      ) +
      `<div class="progress-hero panel"><div class="progress-ring" style="--percent:${(validated / 48) * 100}%"><strong>${Math.round((validated / 48) * 100)}<small>%</small></strong></div><div><span class="eyebrow">VOTRE PARCOURS PERSONNEL</span><h2>${validated} / 48 leçons validées</h2><p>${read} leçons consultées ou lues · ${Object.values(state.notes).filter(Boolean).length} carnets de terrain</p><a class="btn" href="#lesson/${state.lastLesson}">Continuer ma leçon →</a></div><div class="progress-exports"><button class="btn alt" id="export">Exporter mon suivi</button><label class="btn alt import-button">Importer un suivi<input id="import" type="file" accept="application/json,.json"></label><p class="tiny">L’export contient vos notes personnelles.<br>Le suivi ne vaut pas certification.</p></div></div><div class="level-progress-grid">${[
        ...new Map(curriculum.map((x) => [x.niveau, x.niveau_titre])),
      ]
        .map(([n, t]) => {
          const rows = curriculum.filter((x) => x.niveau === n),
            count = rows.filter((x) => isValidated(x.id)).length;
          return `<section class="level-progress panel"><div class="level-heading"><span class="level-index">${String(n).padStart(2, "0")}</span><div><h2>${esc(t)}</h2><p>${count} / 6 validées</p></div></div><div class="progress"><div style="width:${(count / 6) * 100}%"></div></div>${rows.map((x) => `<a class="progress-lesson" href="#lesson/${x.id}"><span class="progress-symbol ${isValidated(x.id) ? "passed" : ""}">${isValidated(x.id) ? "✓" : state.done[x.id] ? "◌" : "○"}</span><span>${esc(x.titre)}</span><small>${score(x.id)} / ${questions(x.id).length}</small></a>`).join("")}</section>`;
        })
        .join("")}</div>${footer()}`;
    $("#export").onclick = () => {
      const blob = new Blob(
          [
            JSON.stringify(
              {
                version: 1,
                contentVersion: 2,
                exportedAt: new Date().toISOString(),
                state,
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "focal_progression.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    $("#import").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        toast("Ce fichier est trop volumineux (maximum 2 Mo).");
        return;
      }
      try {
        const data = JSON.parse(await file.text());
        if (
          data.version !== 1 ||
          !data.state ||
          typeof data.state !== "object" ||
          Array.isArray(data.state)
        )
          throw Error("Format incorrect");
        const imported = cleanState(data.state);
        if (
          !window.confirm(
            "Importer ce suivi remplacera le suivi de cet appareil. Exportez votre suivi actuel si vous souhaitez le conserver. Continuer ?",
          )
        )
          return;
        state = imported;
        save();
        renderProgress();
        toast("Votre suivi a été importé.");
      } catch {
        toast("Import impossible : choisissez un export JSON FOCAL valide.");
      }
    };
  }
  function renderNotFound() {
    activeLesson = null;
    setNav("");
    app.innerHTML = `<div class="empty-state"><span class="eyebrow">FOCAL ACADEMY</span><h1>Cette leçon reste à trouver.</h1><p>Le lien ne correspond pas à une leçon du parcours.</p><a class="btn" href="#courses">Revenir aux 48 leçons</a></div>`;
  }
  function renderRoute() {
    routeCounter++;
    const bits = location.hash.slice(1).split("/");
    document.title = "FOCAL Academy — Le regard s’apprend";
    if (bits[0] === "courses") renderCatalog(Number(bits[1]) || 0);
    else if (bits[0] === "progress") renderProgress();
    else if (bits[0] === "glossary") {
      activeLesson = null;
      setNav("glossary");
      FocalGlossary.render(app, bits[1], state.lastLesson);
    } else if (bits[0] === "lesson") renderLesson(bits[1], bits[2]);
    else if (!bits[0]) renderLesson(state.lastLesson || reference.id);
    else renderNotFound();
    window.scrollTo(0, 0);
    FocalGlossary.restorePosition();
  }
  async function init() {
    try {
      const results = await Promise.all(
        ["curriculum.json", "lesson-content.json", "lesson_reference.json"].map(
          async (file) => {
            const response = await fetch(file);
            if (!response.ok) throw Error(file);
            return response.json();
          },
        ),
      );
      [curriculum, enrichment, reference] = results;
      if (curriculum.length !== 48 || curriculum.some((x) => !enrichment[x.id]))
        throw Error("Catalogue incomplet");
      let raw = {};
      try {
        raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      } catch {}
      state = cleanState(raw);
      if (
        state.done[reference.id] &&
        score(reference.id) >= 4 &&
        state.practice[reference.id]
      )
        state.completedV2[reference.id] = true;
      $("#level-nav").innerHTML =
        '<div class="sidebar-label">LE PARCOURS · 8 NIVEAUX</div>' +
        [...new Map(curriculum.map((x) => [x.niveau, x.niveau_titre]))]
          .map(
            ([n, title]) =>
              `<a href="#courses/${n}" data-level="${n}"><span class="level-number">${String(n).padStart(2, "0")}</span><span>${esc(title)}</span><span class="level-arrow">›</span></a>`,
          )
          .join("");
      $("#menu-toggle").onclick = () => {
        const open = $("#menu-toggle").getAttribute("aria-expanded") !== "true";
        $("#menu-toggle").setAttribute("aria-expanded", open);
        $("#sidebar").classList.toggle("menu-open", open);
      };
      window.addEventListener("hashchange", renderRoute);
      let pendingSync = 0,
        beforeSync = null;
      window.addEventListener("storage", (e) => {
        if (e.key !== KEY) return;
        try {
          const incoming = cleanState(JSON.parse(e.newValue || "{}"));
          beforeSync ??= state;
          state = incoming;
          if (!pendingSync)
            pendingSync = requestAnimationFrame(() => {
              pendingSync = 0;
              const previous = beforeSync;
              beforeSync = null;
              syncVisibleState(previous);
            });
        } catch {}
      });
      await FocalGlossary.init();
      renderRoute();
      updateProgress();
      window.FocalApp = {
        get lessons() {
          return curriculum;
        },
        get enrichment() {
          return enrichment;
        },
        get state() {
          return state;
        },
        get reference() {
          return reference;
        },
      };
    } catch (error) {
      app.innerHTML = `<div class="empty-state"><h1>Le parcours n’a pas pu se charger.</h1><p>Vérifiez votre connexion puis réessayez. Pour une ouverture locale, démarrez le serveur décrit dans le README.</p><button class="btn" id="reload">Réessayer</button></div>`;
      $("#reload").onclick = () => location.reload();
      console.error("FOCAL: chargement du catalogue impossible", error);
    }
  }
  init();
})();
