/* Rendering for the additive Academy 2.0 experience. */
window.FocalLearning = (() => {
  "use strict";
  const C = FocalLearningCore,
    S = FocalLearningStore;
  const esc = (v) =>
    String(v ?? "").replace(
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
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (d) => new Date(d).toLocaleDateString("fr-FR");
  let context = {};
  const data = () => S.data,
    skills = () => data().academy.skills.filter((s) => s.assessable !== false);
  const skill = (id) => skills().find((s) => s.id === id);
  function legacy() {
    const l = context.legacy?.() || {},
      assessments = {};
    for (const s of skills()) {
      const q = context.questions?.(s.lessonId) || [],
        answers = context.answers?.(s.lessonId) || {};
      if (Object.keys(answers).length)
        assessments[s.lessonId] = {
          total: q.length,
          score: q.filter((q, i) => answers[i] === q.correct).length / q.length,
          mistakes: q.flatMap((q, i) =>
            answers[i] !== q.correct ? ["R-" + s.id + "-" + i] : [],
          ),
        };
    }
    return { ...l, assessments };
  }
  const estimate = (s) => C.estimate(s, S.state, legacy());
  const mission = (s) =>
    context.meta?.[s.lessonId]
      ? adaptMeta(s.lessonId, context.meta[s.lessonId]).mission
      : s.remediation.action;
  const link = (href, text, alt = false) =>
    `<a class="btn${alt ? " alt" : ""}" href="${esc(href)}">${esc(text)}</a>`;
  const header = (tag, title, lead) =>
    `<div class="breadcrumbs"><a href="#home">Accueil</a><span>›</span>${esc(tag)}</div><header class="learning-heading"><span class="eyebrow">FOCAL / ${esc(tag)}</span><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></header>`;
  const status = () =>
    '<p class="learning-status" role="status" aria-live="polite" tabindex="-1"></p>';
  const notice = () =>
    S.issue ? `<p class="learning-alert" role="alert">${esc(S.issue)}</p>` : "";
  const source = (id) => data().academy.sources.find((s) => s.id === id);
  const sourceLink = (id) => {
    const s = source(id);
    return s
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`
      : "";
  };
  function message(form, error) {
    const out = $(".learning-status", form);
    out.textContent = error.message || String(error);
    out.classList.add("error");
    out.setAttribute("role", "alert");
    out.focus?.();
  }
  function quizMarkup(questions, prefix) {
    return questions
      .map(
        (q, i) =>
          `<fieldset class="learning-question" data-question="${esc(q.id)}"><legend><span>${String(i + 1).padStart(2, "0")} / ${esc(q.type)}</span>${esc(q.prompt)}</legend>${q.visual ? diagnosticVisual(q.visual) : ""}${[...q.options, "Je ne sais pas encore"].map((o, j) => `<label class="learning-choice"><input type="radio" name="${prefix}-${esc(q.id)}" value="${j === q.options.length ? -1 : j}" required><span>${esc(o)}</span></label>`).join("")}</fieldset>`,
      )
      .join("");
  }
  function responses(form, questions, prefix) {
    return Object.fromEntries(
      questions.map((q) => [
        q.id,
        Number(new FormData(form).get(prefix + "-" + q.id)),
      ]),
    );
  }
  function corrections(questions, answers) {
    return questions
      .map(
        (q) =>
          `<article class="learning-correction ${answers[q.id] === q.correct ? "correct" : "incorrect"}"><h3>${answers[q.id] === q.correct ? "✓" : "↗"} ${esc(q.prompt)}</h3><p><strong>Réponse : ${esc(q.options[q.correct])}.</strong> ${esc(q.explanation)}</p></article>`,
      )
      .join("");
  }
  function diagnosticVisual(kind) {
    if (kind === "camera")
      return FocalDiagrams.render(
        "firstshot",
        0,
        FocalCamera.capture("camera", 0, "N01-L01"),
        "Trajet de la lumière vers le capteur",
        false,
      );
    if (kind === "aperture")
      return '<figure class="diagnostic-visual"><svg viewBox="0 0 440 135" role="img" aria-label="À gauche, un grand passage circulaire ; à droite, un petit passage, à même focale"><circle cx="110" cy="60" r="48" fill="var(--learning-gold)"/><circle cx="325" cy="60" r="23" fill="var(--learning-gold)"/><text x="110" y="128" text-anchor="middle">Grand passage</text><text x="325" y="128" text-anchor="middle">Petit passage</text></svg><figcaption>Schéma qualitatif : même focale, pupilles idéalisées.</figcaption></figure>';
    if (kind === "motion")
      return '<figure class="diagnostic-visual"><svg viewBox="0 0 440 100" role="img" aria-label="À gauche, un point presque immobile ; à droite, une longue trace pour le même déplacement"><circle cx="80" cy="40" r="7" fill="var(--learning-gold)"/><path d="M250 40h110" stroke="var(--learning-gold)" stroke-width="14" stroke-linecap="round"/><text x="80" y="90" text-anchor="middle">Trace courte</text><text x="305" y="90" text-anchor="middle">Trace longue</text></svg><figcaption>Modèle qualitatif : même mouvement pendant l’exposition.</figcaption></figure>';
    return '<figure class="diagnostic-visual"><svg viewBox="0 0 440 110" role="img" aria-label="Histogramme schématique : beaucoup de valeurs touchent le bord droit, le côté des hautes lumières"><path d="M20 85H420M20 85V10" stroke="currentColor" fill="none"/><path d="M20 85L60 80L100 72L150 75L210 60L270 35L320 60L370 20L410 10V85Z" fill="var(--learning-gold)"/><text x="25" y="106">Sombres</text><text x="340" y="106">Claires</text></svg><figcaption>Histogramme schématique du rendu, sans photographie source.</figcaption></figure>';
  }
  function home(app) {
    const rec = C.recommend(data().academy, S.state, legacy()),
      all = skills().map(estimate),
      applied = all.filter((x) =>
        ["applied", "mastered"].includes(x.stage),
      ).length,
      weak = skills()
        .filter((s) => estimate(s).mistakes.length)
        .slice(0, 3),
      last = S.state.practice.at(-1),
      current = rec.skill || skills()[0];
    $(".home-hero", app).outerHTML =
      `<section class="home-hero learning-hero"><div class="home-hero-copy"><span class="eyebrow">VOTRE REGARD / VOTRE PARCOURS</span><h1>Faites des choix.<br><em>Créez vos images.</em></h1><p class="home-intro">Comprendre la lumière, choisir vos réglages et savoir pourquoi votre photo fonctionne. Un parcours qui avance avec vous et votre matériel.</p><div class="learning-next"><span class="eyebrow">VOTRE PROCHAINE ÉTAPE</span>${link(rec.route, rec.label)}<p>${esc(rec.reason)}</p></div><a class="learning-shoot-link" href="#shoot">Je veux prendre une photo maintenant <span aria-hidden="true">↗</span></a></div><aside class="learning-dashboard" aria-label="Votre tableau de bord"><div class="learning-dashboard-top"><span class="eyebrow">LE REGARD SE CONSTRUIT</span><span class="learning-dot"></span></div><div class="learning-big-count"><strong>${String(applied).padStart(2, "0")}</strong><span>/ 48 compétences<br>avec application documentée</span></div><div class="learning-track"><i style="width:${(applied / 48) * 100}%"></i></div><dl><div><dt>En ce moment</dt><dd>${esc(current.title)}</dd></div><div><dt>Dernière mission consignée</dt><dd>${last ? esc(skill(last.skillId)?.title) + " · " + fmt(last.at) : "Votre premier essai vous attend."}</dd></div><div><dt>Prochain défi</dt><dd>${esc(mission(current))}</dd></div><div><dt>À consolider</dt><dd>${weak.length ? weak.map((s) => esc(s.title)).join(" · ") : S.state.diagnostic ? "Pas de difficulté détectée sur ce diagnostic limité." : "Le diagnostic permettra un premier repérage."}</dd></div></dl><div class="learning-dashboard-links"><a href="#skills">Voir mes compétences →</a><a href="#profile">${S.state.profile ? "Mon profil matériel" : "Confirmer mon matériel"} →</a></div><p class="tiny">Estimation pédagogique locale. Les lectures et validations historiques restent dans votre suivi.</p></aside></section>`;
    const spaces = $(".home-space-grid", app);
    const entries = [
      [
        "lesson",
        rec.route,
        "APPRENDRE",
        "Mon parcours guidé",
        "Une prochaine étape expliquée, du diagnostic aux missions.",
        "Continuer",
      ],
      [
        "camera",
        "#camera",
        "MAÎTRISER MON APPAREIL",
        "Mon Sony α7 IV",
        "Commandes de référence et réglages adaptés à votre profil.",
        "Prendre en main",
      ],
      [
        "focus",
        "#lesson/N01-L03/visual",
        "EXPÉRIMENTER",
        "Le laboratoire visuel",
        "Schémas explicatifs et calculateur : voyez ce qui change.",
        "Explorer",
      ],
      [
        "lexicon",
        "#knowledge",
        "APPROFONDIR",
        "La bibliothèque photo",
        "Recherchez dans les cours, le lexique et le référentiel planifié.",
        "Chercher une réponse",
      ],
    ];
    spaces.innerHTML = entries
      .map(
        ([icon, href, tag, title, description, action]) =>
          `<a class="home-space" href="${esc(href)}"><span class="home-space-icon" aria-hidden="true">${FocalIcons.draw(icon)}<i></i></span><span class="eyebrow">${tag}</span><h3>${title}</h3><p>${description}</p><span class="home-space-link">${action} ${FocalIcons.draw("arrow")}</span></a>`,
      )
      .join("");
    if (S.issue) app.insertAdjacentHTML("afterbegin", notice());
  }
  function profile(app) {
    const p = S.state.profile || {},
      eq = data().equipment;
    app.innerHTML =
      header(
        "Votre profil",
        "Votre matériel. Votre rythme.",
        "Deux minutes pour préparer un parcours réalisable. Le diagnostic qui suit prend environ 5 à 10 minutes.",
      ) +
      notice() +
      `<form id="profile-form" class="learning-form"><section class="panel"><span class="eyebrow">01 / D’OÙ PARTEZ-VOUS ?</span><div class="learning-fields"><label>Niveau déclaré<select name="declaredLevel"><option value="beginner">Je débute</option><option value="basics">J’ai quelques bases</option><option value="regular">Je photographie régulièrement</option></select></label><label>Expérience<select name="experience"><option value="none">Premières photos avec un appareil</option><option value="phone">Principalement au téléphone</option><option value="camera">Déjà un appareil à objectifs</option></select></label><label>Ma pratique<select name="practice"><option value="photo">Photo</option><option value="both">Photo et vidéo</option><option value="video">Vidéo</option></select></label><label>Minutes disponibles par semaine<input type="number" name="weeklyMinutes" min="15" max="1200" step="15" value="${p.weeklyMinutes || 60}" required></label></div><p class="tiny">Ce premier parcours enseigne la photo. Le programme vidéo figure dans le référentiel planifié.</p></section><section class="panel"><span class="eyebrow">02 / CE QUE VOUS AVEZ VRAIMENT</span><div class="learning-fields"><label>Boîtier pris en charge<select name="bodyId">${eq.bodies.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></label><label>Firmware, si connu<input name="firmware" maxlength="80" placeholder="Ex. version affichée sur votre boîtier" value="${esc(p.firmware || "")}"></label></div><fieldset class="learning-lenses"><legend>Je possède ou peux utiliser ces objectifs</legend>${eq.lenses.map((l) => `<label class="learning-choice"><input type="checkbox" name="ownedLensIds" value="${l.id}" ${p.ownedLensIds?.includes(l.id) ? "checked" : ""}><span><strong>${esc(l.name)}</strong><small>${esc(l.model)} · ${l.focalMin}–${l.focalMax} mm</small></span></label>`).join("")}<label class="learning-choice"><input type="checkbox" name="ownedLensIds" value="user-lens" ${p.customLens ? "checked" : ""}><span>Un autre objectif Sony E : je renseigne ses limites</span></label></fieldset><details class="learning-custom" ${p.customLens ? "open" : ""}><summary>Renseigner un autre objectif</summary><p>Ces valeurs restent déclaratives. Pour un zoom à ouverture variable, indiquez le plus grand nombre f de l’ouverture maximale (ex. 5,6 pour un 3,5–5,6), afin de rester dans une plage utilisable à toutes les focales. Vérifiez aussi la fermeture maximale commune.</p><div class="learning-fields"><label>Nom<input name="lensName" maxlength="120" value="${esc(p.customLens?.name || "")}" placeholder="Nom et référence"></label>${[
        ["focalMin", "Focale minimale (mm)", 4, 2000],
        ["focalMax", "Focale maximale (mm)", 4, 2000],
        ["maxAperture", "Nombre f minimal sûr", 0.5, 128],
        ["minAperture", "Nombre f maximal sûr", 0.5, 128],
      ]
        .map(
          ([key, label, min, max]) =>
            `<label>${label}<input type="number" name="${key}" min="${min}" max="${max}" step="any" value="${p.customLens?.[key] || ""}"></label>`,
        )
        .join(
          "",
        )}</div></details><label>Objectif actif<select name="activeLensId" id="active-lens"><option value="">Choisissez d’abord vos objectifs</option></select></label><label class="learning-choice"><input type="checkbox" name="confirmed" required ${p.confirmed ? "checked" : ""}><span>Je confirme que ce matériel est disponible pour mes exercices.</span></label></section><section class="panel"><span class="eyebrow">03 / VOTRE ENVIE D’IMAGE</span><fieldset class="learning-checks"><legend>Ce qui vous attire</legend>${data()
        .academy.modules.filter((m) =>
          [
            "portrait",
            "paysage",
            "rue",
            "action",
            "reportage",
            "nuit",
            "architecture",
            "video",
            "culture",
          ].some((k) => m.id === "MOD-" + k),
        )
        .map(
          (m) =>
            `<label><input type="checkbox" name="interests" value="${m.id}" ${p.interests?.includes(m.id) ? "checked" : ""}> ${esc(m.title)}</label>`,
        )
        .join(
          "",
        )}</fieldset><fieldset class="learning-checks"><legend>Mes objectifs</legend>${[
        ["controls", "Comprendre mes commandes"],
        ["sharp", "Obtenir la netteté voulue"],
        ["exposure", "Choisir mon exposition"],
        ["creative", "Développer mon regard"],
      ]
        .map(
          ([id, t]) =>
            `<label><input type="checkbox" name="goals" value="${id}" ${p.goals?.includes(id) ? "checked" : ""}> ${t}</label>`,
        )
        .join(
          "",
        )}</fieldset><label>Rythme de révision<select name="revisionPace"><option value="standard">Standard · 1, 3, 7, 21, 60 jours</option><option value="close">Rapproché · 1, 2, 4, 10, 30 jours</option><option value="wide">Espacé · 2, 5, 14, 30, 90 jours</option></select></label></section><p class="tiny">Conservation locale sur ce navigateur. Aucune photo envoyée. Exportez régulièrement votre suivi pour le garder.</p>${status()}<button class="btn" type="submit">${S.state.diagnostic ? "Enregistrer mon profil" : "Enregistrer et faire le diagnostic"} →</button> ${link("#home", "Revenir à l’accueil", true)}</form>`;
    const form = $("#profile-form");
    for (const key of [
      "declaredLevel",
      "experience",
      "practice",
      "revisionPace",
    ])
      if (p[key]) form.elements[key].value = p[key];
    function active() {
      const selected = [
          ...form.querySelectorAll('[name="ownedLensIds"]:checked'),
        ].map((i) => i.value),
        old = form.elements.activeLensId.value;
      form.elements.activeLensId.innerHTML = selected.length
        ? selected
            .map(
              (id) =>
                `<option value="${id}">${esc(eq.lenses.find((l) => l.id === id)?.name || "Mon autre objectif")}</option>`,
            )
            .join("")
        : '<option value="">Choisissez d’abord vos objectifs</option>';
      if (selected.includes(old)) form.elements.activeLensId.value = old;
      else if (selected.includes(p.activeLensId))
        form.elements.activeLensId.value = p.activeLensId;
    }
    form.querySelectorAll('[name="ownedLensIds"]').forEach(
      (i) =>
        (i.onchange = () => {
          active();
          if (i.value === "user-lens" && i.checked)
            $(".learning-custom").open = true;
        }),
    );
    active();
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const f = new FormData(form),
          raw = Object.fromEntries(f);
        raw.ownedLensIds = f.getAll("ownedLensIds");
        raw.interests = f.getAll("interests");
        raw.goals = f.getAll("goals");
        raw.confirmed = f.has("confirmed");
        if (raw.ownedLensIds.includes("user-lens"))
          raw.customLens = {
            name: f.get("lensName"),
            ...Object.fromEntries(
              ["focalMin", "focalMax", "maxAperture", "minAperture"].map(
                (k) => [k, Number(f.get(k))],
              ),
            ),
          };
        S.profile(raw);
        location.hash = S.state.diagnostic ? "#home" : "#diagnostic";
      } catch (error) {
        message(form, error);
      }
    };
  }
  function diagnostic(app) {
    const qs = data().diagnostic.questions;
    app.innerHTML =
      header(
        "Diagnostic",
        "Où en est votre regard ?",
        "Dix situations, sans note scolaire. Choisissez « Je ne sais pas encore » si vous hésitez : cela nous aide à vous proposer la bonne étape.",
      ) +
      notice() +
      `<p class="learning-info">5 à 10 min · Schémas qualitatifs, pas de comparaisons photographiques mesurées. L’estimation initiale reste peu fiable jusqu’à la pratique.</p><form id="diagnostic-form" class="learning-form"><p id="diagnostic-count" class="learning-form-progress" aria-live="polite">0 / ${qs.length} réponses</p>${quizMarkup(qs, "diag")}${status()}<button class="btn" type="submit">Construire mon point de départ →</button></form>`;
    const form = $("#diagnostic-form");
    form.onchange = () =>
      ($("#diagnostic-count").textContent =
        new Set([...form.querySelectorAll("input:checked")].map((i) => i.name))
          .size +
        " / " +
        qs.length +
        " réponses");
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const a = responses(form, qs, "diag");
        S.diagnostic(a);
        app.innerHTML =
          header(
            "Votre point de départ",
            "Votre prochain geste est clair.",
            "Voici ce que vos réponses suggèrent. Une seule question ne peut pas établir une compétence.",
          ) +
          `<div class="panel learning-recommendation">${link(C.recommend(data().academy, S.state, legacy()).route, C.recommend(data().academy, S.state, legacy()).label)}<p>${esc(C.recommend(data().academy, S.state, legacy()).reason)}</p>${link("#skills", "Voir mes estimations", true)}</div><div class="learning-corrections">${corrections(qs, a)}</div>`;
        window.scrollTo(0, 0);
      } catch (error) {
        message(form, error);
      }
    };
  }
  function lessonPanel(id) {
    const s = skills().find((s) => s.lessonId === id);
    if (!s) return "";
    const e = estimate(s);
    return `<section class="learning-lesson-panel"><div><span class="eyebrow">COMPÉTENCE OBSERVABLE</span><p>${esc(s.objective)}</p><small>${esc(e.label)} · confiance ${Math.round(e.confidence * 100)} % · ${s.prerequisites.length ? "Prérequis : " + s.prerequisites.map((id) => `<a href="#lesson/${skill(id).lessonId}">${esc(skill(id).title)}</a>`).join(", ") : "Aucun prérequis"}</small></div><div>${id === "N01-L01" ? link("#learn/N01-L01", "Suivre la leçon guidée") : link("#practice/" + s.id, "Consigner mes essais", true)}<a href="#skills">Comprendre mon estimation →</a></div></section>`;
  }
  function skillPage(app) {
    const list = skills(),
      states = list.map(estimate),
      due = list.filter((s) => estimate(s).status === "review");
    app.innerHTML =
      header(
        "Compétences",
        "Vos acquis, avec leurs preuves.",
        "Un cours lu est une découverte. La compréhension, l’application et la maîtrise estimée demandent des éléments différents.",
      ) +
      notice() +
      `<div class="learning-summary">${[
        ["Découvertes", states.filter((s) => s.stage !== "not-started").length],
        [
          "Compréhensions estimées",
          states.filter((s) =>
            ["understood", "applied", "mastered"].includes(s.stage),
          ).length,
        ],
        [
          "Applications documentées",
          states.filter((s) => ["applied", "mastered"].includes(s.stage))
            .length,
        ],
        ["À réviser", due.length],
      ]
        .map(([t, n]) => `<div><strong>${n}</strong><span>${t}</span></div>`)
        .join(
          "",
        )}</div><details class="panel learning-rules"><summary>Comment sont calculées ces estimations ?</summary><p>Découverte : lecture ou réponse. Compréhension estimée : au moins 80 % à une évaluation d’au moins cinq questions. Deux bonnes réponses au diagnostic donnent seulement une indication provisoire (confiance 35 %).</p><p>Application documentée : compréhension et deux essais plausibles, une observation, une justification et trois critères déclarés. Maîtrise estimée : deux évaluations réussies espacées de sept jours, au moins cinq questions distinctes et deux séances documentées espacées de deux jours. Confiance maximale du modèle : 85 %. Ces pourcentages décrivent une règle de suivi, pas une probabilité mesurée. Aucune certification ni analyse automatique des photos.</p><p>46 cours conservent un quiz de deux questions : ce bilan court ne suffit pas à établir une compréhension. La leçon d’ouverture possède cinq questions et le pilote six situations. Les cours historiques restent à consolider ; votre ancien suivi et vos notes sont conservés à part.</p><p>Le calendrier n’avance que lors d’une évaluation à l’échéance ; réessayer plusieurs fois dans la journée ne saute pas d’intervalle.</p></details><div class="panel learning-revision-settings"><label>Intervalles de révision<select id="review-pace"><option value="standard">Standard : 1 / 3 / 7 / 21 / 60 jours</option><option value="close">Rapprochés : 1 / 2 / 4 / 10 / 30 jours</option><option value="wide">Espacés : 2 / 5 / 14 / 30 / 90 jours</option></select></label>${status()}${link("#progress", "Exporter ou importer tout mon suivi", true)}${S.recovery ? '<button class="btn alt" id="recovery-export">Exporter les données à récupérer</button>' : ""}</div><section class="learning-skill-list">${list
        .map((s) => {
          const e = estimate(s);
          return `<article class="learning-skill" data-skill="${s.id}"><div><span class="learning-badge ${e.status}">${esc(e.label)}</span><h2>${esc(s.title)}</h2><p>${esc(s.objective)}</p><small>Confiance ${Math.round(e.confidence * 100)} % · ${e.evidenceCount} séance(s) · ${e.attemptCount} évaluation(s)${e.dueAt ? " · révision " + fmt(e.dueAt) : ""}</small><details><summary>Preuves et prochaine correction</summary><p>${esc(e.reason)}</p><p>${e.mistakes.length ? esc(e.mistakes.length) + " erreur(s) au dernier bilan. " + esc(s.remediation.explanation) : "Aucune erreur enregistrée, ou évaluation non réalisée."}</p><p>${esc(mission(s))}</p><p>Dernière pratique : ${e.lastPractice ? fmt(e.lastPractice) : "pas de séance consignée"}. Pré-requis : ${s.prerequisites.map((id) => esc(skill(id).title)).join(", ") || "aucun"}.</p></details></div><nav aria-label="Actions : ${esc(s.title)}">${link(s.lessonId === "N01-L01" ? "#learn/N01-L01" : "#lesson/" + s.lessonId, "Apprendre", true)}${link("#review/" + s.id, "Réviser", true)}${link("#practice/" + s.id, "Consigner", true)}</nav></article>`;
        })
        .join(
          "",
        )}</section><p class="tiny">48 compétences accessibles · 192 autres cibles planifiées, sans estimation.</p>`;
    $("#review-pace").value = S.state.profile?.revisionPace || "standard";
    $("#review-pace").onchange = (e) => {
      try {
        S.pace(e.target.value);
        skillPage(app);
      } catch (error) {
        message($(".learning-revision-settings"), error);
      }
    };
    if ($("#recovery-export"))
      $("#recovery-export").onclick = () =>
        download(S.recovery, "focal-recuperation-brute.json");
  }
  function download(content, name) {
    const u = URL.createObjectURL(
        new Blob([content], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  function reviewQuestions(s) {
    if (s.id === "SK-camera") return data().pilot.questions;
    return data().review.questions.filter((q) => q.skillId === s.id);
  }
  function bindQuiz(form, s, qs, prefix, sourceName) {
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const a = responses(form, qs, prefix),
          r = S.attempt(s.id, qs, a, sourceName);
        $(".learning-status", form).textContent =
          r.correctCount +
          " / " +
          r.total +
          " · " +
          (r.total >= 5
            ? "Bilan enregistré."
            : "Bilan court : consolidation nécessaire avant de conclure à une compréhension.");
        $(".quiz-corrections", form).innerHTML =
          corrections(qs, a) +
          `<div class="learning-actions">${link("#practice/" + s.id, "Mettre en pratique")}${link("#skills", "Voir mon estimation", true)}</div>`;
        $('button[type="submit"]', form).disabled = true;
      } catch (error) {
        message(form, error);
      }
    };
  }
  function review(app, id) {
    const s = skill(id);
    if (!s) return false;
    const qs = reviewQuestions(s);
    app.innerHTML =
      header(
        "Révision",
        s.title,
        "Retrouvez les décisions importantes, puis vérifiez-les sur le terrain.",
      ) +
      `<div class="panel"><p>${esc(s.remediation.explanation)}</p><p>${esc(mission(s))}</p>${link("#lesson/" + s.lessonId, "Revoir la leçon", true)}</div><form id="review-form" class="learning-form">${qs.length < 5 ? '<p class="learning-info">Ce cours conserve son quiz historique court. Il ne permet pas, à lui seul, de conclure à une compréhension ou à une maîtrise.</p>' : ""}${quizMarkup(qs, "review")}${status()}<button class="btn" type="submit">Corriger et planifier la révision</button><div class="quiz-corrections"></div></form>`;
    bindQuiz($("#review-form"), s, qs, "review", "review");
    return true;
  }
  function pilot(app) {
    const p = data().pilot,
      s = skill(p.skillId),
      c = FocalCamera.capture("camera", 0, p.id);
    app.innerHTML =
      header("Première leçon", p.title, p.objective) +
      `<div class="learning-pilot-meta"><span>35 min · ${esc(p.difficulty)}</span><span>Aucun prérequis</span><span>Documentation Sony consultée · ${fmt(p.validatedAt)}</span></div><p class="learning-info">Procédures documentées, sans vérification physique de votre firmware ou de vos boutons personnalisés. ${S.state.profile ? "Les valeurs proposées respectent votre objectif actif." : "Confirmez votre matériel pour adapter les réglages."}</p><nav class="learning-pilot-nav" aria-label="Étapes de la leçon"><a href="#pilot-observe" data-learning-jump>Observer</a><a href="#pilot-understand" data-learning-jump>Comprendre</a><a href="#pilot-practice" data-learning-jump>Essayer</a><a href="#pilot-quiz" data-learning-jump>Vérifier</a></nav><section class="panel" id="pilot-observe"><span class="eyebrow">01 / PARTIR DU CONCRET</span><h2>Un objet. Une intention.</h2><p>${esc(p.intuition)}</p><div id="pilot-diagram">${FocalVisuals.draw("firstshot", 0, p.title, "interactive", c)}</div><div class="learning-segments" role="group" aria-label="Étapes du trajet lumineux">${["Le trajet de la lumière", "Le sujet choisi", "Le contrôle du cadre"].map((t, i) => `<button class="btn alt" type="button" data-pilot-step="${i}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div><p class="tiny">${esc(p.visual.description)} ${esc(p.comparison.reason)}</p></section><section id="pilot-understand"><span class="eyebrow">02 / COMPRENDRE POUR CHOISIR</span>${p.chapters.map((ch, i) => `<details class="panel learning-chapter" ${i === 0 ? "open" : ""}><summary>${esc(ch.title)}</summary><p>${esc(ch.body)}</p></details>`).join("")}</section><section class="panel"><h2>Les mots utiles, ici.</h2><dl class="learning-glossary">${p.glossary.map((g) => `<div><dt><a href="#glossary/${g.slug}">${esc(g.term)}</a></dt><dd>${esc(g.definition)}</dd></div>`).join("")}</dl></section><section class="panel"><span class="eyebrow">03 / SUR LE SONY α7 IV</span><h2>Repérez, réglez, vérifiez.</h2><p>Objectif de départ : ${esc(c.lensName)} · ${c.focal} mm · A · f/${c.aperture}. Durée et ISO à contrôler selon la lumière réelle.</p><ol class="learning-sony-steps">${p.sonySteps.map((st) => `<li><h3>${esc(st.title)}</h3><p>${esc(st.instruction)}</p>${sourceLink(st.sourceId)}</li>`).join("")}</ol></section><section class="panel" id="pilot-practice"><span class="eyebrow">04 / ESSAYER</span><h2>${esc(p.guidedExercise.title)}</h2><ol>${p.guidedExercise.steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol><h3>${esc(p.autonomousExercise.title)}</h3><p>${esc(p.autonomousExercise.instruction)}</p><h3>Mission : ${esc(p.mission.title)}</h3><ul>${p.mission.criteria.map((t) => `<li>${esc(t)}</li>`).join("")}</ul><p class="tiny">${esc(p.mission.evidence)}</p>${link("#practice/" + s.id, "Consigner mes deux essais")}${!S.state.profile ? " " + link("#profile", "Confirmer mon matériel", true) : ""}</section><section class="panel"><h2>Si le résultat vous surprend.</h2>${p.errors.map((er) => `<details><summary>${esc(er.symptom)}</summary><p>${esc(er.check)}</p></details>`).join("")}</section><section id="pilot-quiz"><span class="eyebrow">05 / VÉRIFIER VOS DÉCISIONS</span><h2>Six situations pour faire le point.</h2><form id="pilot-quiz-form" class="learning-form">${quizMarkup(p.questions, "pilot")}${status()}<button class="btn" type="submit">Voir les corrections et enregistrer le bilan</button><div class="quiz-corrections"></div></form></section><section class="panel"><h2>Votre mémo de terrain.</h2><ul>${p.memo.map((t) => `<li>${esc(t)}</li>`).join("")}</ul><h3>Pour la prochaine séance</h3><div class="learning-actions">${p.deepening.map((id) => link("#lesson/" + id, data().academy.targets.find((t) => t.id === id).title, true)).join("")}</div></section><details class="panel"><summary>Sources et statut de cette leçon</summary><p>Pilote documenté, version ${p.version}, vérification documentaire du ${fmt(p.validatedAt)}. Aucun comparatif photographique ni test physique annoncé.</p><ul>${p.sourceIds.map((id) => `<li>${sourceLink(id)}</li>`).join("")}</ul></details>${link("#lesson/" + p.id, "Retrouver ma leçon et mon carnet historiques", true)}`;
    app.querySelectorAll("[data-pilot-step]").forEach(
      (b) =>
        (b.onclick = () => {
          app
            .querySelectorAll("[data-pilot-step]")
            .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          $("#pilot-diagram").innerHTML = FocalVisuals.draw(
            "firstshot",
            Number(b.dataset.pilotStep),
            p.title,
            "interactive",
            FocalCamera.capture("camera", Number(b.dataset.pilotStep), p.id),
          );
        }),
    );
    app.querySelectorAll("[data-learning-jump]").forEach(
      (a) =>
        (a.onclick = (e) => {
          e.preventDefault();
          const el = $(a.getAttribute("href"));
          el.tabIndex = -1;
          el.focus({ preventScroll: true });
          el.scrollIntoView({ behavior: "auto", block: "start" });
        }),
    );
    bindQuiz($("#pilot-quiz-form"), s, p.questions, "pilot", "pilot");
  }
  function practice(app, id) {
    const s = skill(id);
    if (!s) return false;
    if (!S.state.profile) {
      app.innerHTML =
        header(
          "Mission",
          "D’abord, votre objectif.",
          "Confirmez votre matériel pour vérifier que les réglages de vos essais sont possibles.",
        ) + link("#profile", "Déclarer mon matériel");
      return true;
    }
    const available = C.lenses(S.state.profile, data().equipment),
      criteria =
        id === "SK-camera"
          ? data().pilot.mission.criteria
          : [
              "J’ai nommé mon intention et réalisé deux essais comparables.",
              "J’ai consigné les réglages réellement affichés pour chaque essai.",
              "Mon observation distingue un fait visible et une correction justifiée.",
            ];
    app.innerHTML =
      header("Carnet de pratique", s.title, s.objective) +
      `<section class="panel"><h2>Votre défi</h2><p>${esc(mission(s))}</p><p>${esc(s.remediation.explanation)}</p><p class="tiny">Une déclaration personnelle documentée, sans contrôle automatique de vos images. Les essais restent rattachés au matériel utilisé, même si votre profil change.</p></section><form id="practice-form" class="learning-form"><div class="learning-trials">${[0, 1].map((i) => `<fieldset class="panel" data-trial="${i}"><legend>Essai ${i + 1} · valeurs réellement utilisées</legend><label>Objectif<select name="lens-${i}">${available.map((l) => `<option value="${l.id}" ${l.id === S.state.profile.activeLensId ? "selected" : ""}>${esc(l.name)}</option>`).join("")}</select></label><div class="learning-fields"><label>Focale (mm)<input type="number" name="focal-${i}" step="any" required></label><label>Ouverture (nombre f)<input type="number" name="aperture-${i}" step="any" required></label><label>Durée (ex. 1/250 ou 0.5)<input type="text" name="shutter-${i}" maxlength="12" pattern="(1/[0-9]+)|([0-9]+([.][0-9]+)?)" required></label><label>ISO<input type="number" name="iso-${i}" min="50" max="204800" step="1" required></label></div></fieldset>`).join("")}</div><section class="panel"><label>Ce que j’ai observé sur les deux images<textarea name="observation" minlength="80" maxlength="4000" required placeholder="Au moins 80 caractères : détail observé, différence visible, conditions conservées…"></textarea></label><label>Pourquoi je choisis cette correction<textarea name="justification" minlength="40" maxlength="2000" required placeholder="Au moins 40 caractères : ma décision et le résultat que j’attends…"></textarea></label><fieldset class="learning-checks"><legend>Je vérifie mes critères</legend>${criteria.map((c, i) => `<label><input type="checkbox" name="criterion-${i}" required> ${esc(c)}</label>`).join("")}</fieldset></section>${status()}<button class="btn" type="submit">Enregistrer cette séance documentée</button> ${link("#lesson/" + s.lessonId + "/mission", "Mon carnet historique", true)}</form>`;
    const form = $("#practice-form");
    function bounds(i) {
      const l = available.find(
        (l) => l.id === form.elements["lens-" + i].value,
      );
      for (const [key, min, max] of [
        ["focal", l.focalMin, l.focalMax],
        ["aperture", l.maxAperture, l.minAperture],
      ]) {
        const input = form.elements[key + "-" + i];
        input.min = min;
        input.max = max;
        input.placeholder = min === max ? String(min) : min + " à " + max;
      }
    }
    [0, 1].forEach((i) => {
      bounds(i);
      form.elements["lens-" + i].onchange = () => bounds(i);
    });
    form.onsubmit = (e) => {
      e.preventDefault();
      try {
        const f = new FormData(form);
        S.practice(s.id, {
          trials: [0, 1].map((i) => ({
            lensId: f.get("lens-" + i),
            focal: Number(f.get("focal-" + i)),
            aperture: Number(f.get("aperture-" + i)),
            shutter: f.get("shutter-" + i),
            iso: Number(f.get("iso-" + i)),
          })),
          observation: f.get("observation"),
          justification: f.get("justification"),
          criteria: [0, 1, 2].map((i) => f.has("criterion-" + i)),
        });
        $(".learning-status", form).textContent =
          "Séance enregistrée. " +
          estimate(s).label +
          " : " +
          estimate(s).reason;
        $('button[type="submit"]', form).disabled = true;
        form.insertAdjacentHTML(
          "beforeend",
          '<div class="learning-actions">' +
            link("#skills", "Voir mes compétences") +
            link("#home", "Ma prochaine étape", true) +
            "</div>",
        );
      } catch (error) {
        message(form, error);
      }
    };
    return true;
  }
  function knowledge(app) {
    const a = data().academy;
    app.innerHTML =
      header(
        "Bibliothèque",
        "Une question. Un chemin pour comprendre.",
        "48 cours existants à consolider, une leçon pilote guidée et 192 entrées planifiées. Les contenus planifiés ne sont pas des leçons disponibles.",
      ) +
      `<div class="panel learning-search"><label class="learning-search-main">Que cherchez-vous ?<input id="knowledge-query" type="search" placeholder="Flou, portrait, lumière, autofocus…"></label><div class="learning-fields"><label>Domaine / technique<select id="knowledge-domain"><option value="">Tous les domaines</option>${a.modules.map((m) => `<option value="${m.id}">${esc(m.title)}</option>`).join("")}</select></label><label>Niveau<select id="knowledge-level"><option value="">Tous les niveaux</option>${Array.from({ length: 8 }, (_, i) => `<option value="${i + 1}">Niveau ${i + 1}</option>`).join("")}</select></label><label>Disponibilité<select id="knowledge-status"><option value="available">Cours accessibles</option><option value="all">Inclure le programme planifié</option><option value="planned">Programme planifié seulement</option></select></label><label>Matériel<select id="knowledge-equipment"><option value="">Tout le référentiel</option><option value="mine">Compatible avec mon profil</option><option value="body">Boîtier</option><option value="lens">Objectif</option></select></label></div><p class="tiny">Recherchez aussi un problème ou un contexte dans le champ libre. Le filtre matériel vérifie les ressources déclarées, pas les accessoires qui restent à documenter.</p></div><p id="knowledge-count" aria-live="polite"></p><div id="knowledge-results"></div><div class="panel"><h2>Les mots de l’image.</h2><p>29 termes, des schémas et des situations pour les comprendre.</p>${link("#glossary", "Ouvrir le lexique", true)}</div>`;
    const norm = (s) =>
      String(s)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    function draw() {
      const query = norm($("#knowledge-query").value),
        domain = $("#knowledge-domain").value,
        level = $("#knowledge-level").value,
        status = $("#knowledge-status").value,
        eq = $("#knowledge-equipment").value,
        rows = a.targets.filter((t) => {
          const s = skill(t.skillIds[0]),
            hay = [
              t.title,
              ...t.keywords,
              s?.objective || "",
              s?.remediation?.action || "",
              s?.remediation?.explanation || "",
            ].join(" ");
          return (
            (!query ||
              query.split(/\s+/).every((q) => norm(hay).includes(q))) &&
            (!domain || t.moduleId === domain) &&
            (!level || t.level === Number(level)) &&
            (status === "all" ||
              (status === "planned"
                ? t.availability === "planned"
                : t.availability !== "planned")) &&
            (!eq ||
              (eq === "mine"
                ? !!S.state.profile &&
                  C.lenses(S.state.profile, data().equipment).length > 0
                : t.equipment.includes(eq)))
          );
        });
      $("#knowledge-count").textContent =
        rows.length +
        " résultat(s)" +
        (eq === "mine" && !S.state.profile
          ? " · confirmez d’abord votre profil matériel"
          : "");
      $("#knowledge-results").innerHTML = rows.length
        ? rows
            .map(
              (t) =>
                `<article class="learning-search-result"><div><span class="eyebrow">${esc(a.modules.find((m) => m.id === t.moduleId).title)} · NIVEAU ${t.level}</span><h2>${t.availability === "planned" ? esc(t.title) : `<a href="${t.id === "N01-L01" ? "#learn/N01-L01" : t.route}">${esc(t.title)}</a>`}</h2><p>${esc(t.objective || skill(t.skillIds[0])?.objective || "")}</p><small>${t.availability === "planned" ? "Planifié · plan seulement, contenu non rédigé" : t.id === "N01-L01" ? "Pilote guidé documenté disponible" : "Cours historique · consolidation éditoriale requise"}</small></div>${t.availability !== "planned" ? `<a class="text-button" href="${t.id === "N01-L01" ? "#learn/N01-L01" : t.route}">Étudier →</a>` : ""}</article>`,
            )
            .join("")
        : '<p class="panel">Aucun résultat. Essayez un terme plus simple ou un autre filtre.</p>';
    }
    app
      .querySelectorAll(".learning-search input,.learning-search select")
      .forEach((el) =>
        el.addEventListener(el.tagName === "INPUT" ? "input" : "change", draw),
      );
    draw();
  }
  function shoot(app) {
    app.innerHTML =
      header(
        "Photo maintenant",
        "Qu’avez-vous envie de photographier ?",
        "Des points de départ expliqués pour votre matériel. La lumière réelle et votre intention gardent le dernier mot.",
      ) +
      (S.state.profile
        ? `<label class="panel learning-scenario-select">Votre situation<select id="shoot-scenario">${C.scenarios.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join("")}</select></label><div id="shoot-result" aria-live="polite"></div>`
        : `<div class="panel"><h2>Commençons par votre matériel.</h2><p>Un seul objectif suffit. Confirmez celui que vous avez pour obtenir des valeurs possibles.</p>${link("#profile", "Confirmer mon matériel")}</div>`);
    if (!S.state.profile) return;
    function draw() {
      const c = C.shoot(
        $("#shoot-scenario").value,
        S.state.profile,
        data().equipment,
      );
      $("#shoot-result").innerHTML =
        `<section class="panel learning-shoot-card"><span class="eyebrow">POINT DE DÉPART / ${esc(c.title)}</span><h2>${esc(c.lensName)}</h2><div class="learning-setting-strip"><div><small>Mode</small><strong>${c.mode}</strong></div><div><small>Focale</small><strong>${c.focal} mm</strong></div><div><small>Ouverture</small><strong>${c.mode === "S" ? "Auto" : "f/" + c.aperture}</strong></div><div><small>Durée ${c.mode === "A" ? "à surveiller" : ""}</small><strong>${c.shutter} s</strong></div><div><small>AF</small><strong>${c.af}</strong></div></div><p>${esc(c.lensReason)} ${esc(c.why)}</p><ol><li><strong>Préparez :</strong> ${esc(c.apertureAdvice)} ${esc(c.durationAdvice)}</li><li><strong>Configurez les ISO :</strong> ${esc(c.isoAdvice)} En A, contrôlez la durée réelle : le minimum ISO AUTO peut être dépassé quand la limite ISO est atteinte.</li><li><strong>Cherchez la lumière :</strong> ${esc(c.light)}</li><li><strong>Placez le sujet :</strong> ${esc(c.placement)}</li><li><strong>Déclenchez :</strong> visez le détail important avec la zone AF, stabilisez le boîtier puis prenez un essai.</li><li><strong>Contrôlez :</strong> agrandissez le détail utile, vérifiez netteté, trace du mouvement, hautes lumières et lisibilité du cadre. Changez une seule décision puis comparez.</li></ol><div class="learning-info"><strong>Si les limites sont atteintes :</strong> ${esc(c.alternative)}</div><p class="tiny">Assistant à règles, sans analyse d’image ni commande du boîtier. Valeurs de départ, sans garantie d’exposition. ${S.state.profile.customLens ? "Les bornes de votre objectif personnalisé sont déclaratives." : ""}</p><div class="learning-actions">${link("#learn/N01-L01", "Apprendre à contrôler mon résultat", true)}${link("#profile", "Changer mon matériel", true)}</div><details><summary>Sources des commandes</summary>${sourceLink(c.mode === "A" ? "sony-TP1000650414" : "sony-TP1000616969")}<br>${sourceLink("sony-TP1000650254")}<br>${sourceLink("sony-TP1000650225")}</details></section>`;
    }
    $("#shoot-scenario").onchange = draw;
    draw();
  }
  function adaptMeta(id, meta) {
    if (!S.state.profile) return meta;
    const c = FocalCamera.capture("reference", 0, id),
      s = skills().find((s) => s.lessonId === id);
    const replacement =
      String(c.lensName) + " à " + c.focal + " mm, f/" + c.aperture;
    const captures = [0, 1, 2].map((i) =>
      FocalCamera.capture(meta.kind, i, id),
    );
    const scenarios = meta.scenarios.map((row, i) => {
      const x = captures[i];
      if (meta.kind === "aperture") return { ...row, label: "f/" + x.aperture };
      if (["focal", "lenskit"].includes(meta.kind))
        return {
          ...row,
          label: x.focal + " mm · " + x.lensShort,
          explanation:
            (x.focalMin === x.focalMax
              ? "Objectif fixe : ce cadrage ne change pas à position fixe. "
              : "Ce cadrage est permis avec votre zoom. ") + row.explanation,
        };
      if (meta.kind === "depth" && i === 2)
        return {
          ...row,
          explanation:
            "Le calcul ci-contre utilise votre focale et votre ouverture. À paramètres égaux, éloigner le point étend généralement la zone acceptable ; l’infini dépend du critère et de l’hyperfocale, pas d’une distance universelle.",
        };
      return row;
    });
    let action =
      id === "N01-L01"
        ? data().pilot.guidedExercise.steps.join(" ")
        : s.remediation.action;
    if (meta.kind === "aperture")
      action =
        "À focale, position et mise au point fixes, comparez " +
        [...new Set(captures.map((x) => "f/" + x.aperture))].join(", ") +
        ". En A, surveillez la durée automatique ; en M, compensez la durée pour conserver une exposition comparable.";
    if (meta.kind === "focal") {
      const focalValues = [...new Set(captures.map((x) => x.focal))];
      action =
        focalValues.length > 1
          ? "Depuis un point fixe, comparez les focales disponibles : " +
            focalValues.join(", ") +
            " mm, en utilisant seulement les objectifs déclarés. Puis déplacez-vous pour garder le sujet à taille similaire : le rapport entre les plans change avec votre position."
          : "Avec votre focale fixe de " +
            c.focal +
            " mm, réalisez une vue depuis un point repéré, puis une seconde en changeant votre position. Décrivez le changement de cadrage et de rapport entre les plans. Les trois repères de l’atelier gardent ici le même angle : comparer des focales depuis le même point demande un autre objectif ou un zoom.";
    }
    if (meta.kind === "lenskit") {
      const available = C.lenses(S.state.profile, data().equipment);
      const zoom = available.find((l) => l.focalMin !== l.focalMax);
      action = zoom
        ? "Faites une promenade en gardant une focale disponible sur votre zoom, puis une autre en autorisant les changements de focale dans sa plage. Comparez cadrages et déplacements. Ce protocole compare deux usages, pas les performances d’un objectif fixe face au zoom."
        : "Faites une promenade avec votre objectif fixe et notez les cadrages possibles depuis des positions sûres. Expliquez ce qui impose de vous déplacer ou de renoncer à une image. Sans zoom disponible, la comparaison zoom/fixe reste une étude théorique : aucun autre objectif n’est nécessaire pour cette mission.";
    }
    if (meta.kind === "aberration")
      action =
        "Sur un support stable, photographiez une cible détaillée à pleine ouverture puis à deux ouvertures permises par votre objectif. Gardez le traitement et l’exposition comparables ; distinguez franges, défaut de point et diffraction.";
    return {
      ...meta,
      scenarios,
      mission:
        action +
        " Objectif actif : " +
        replacement +
        ". " +
        (["focal", "lenskit", "perspective"].includes(meta.kind) &&
        c.focalMin === c.focalMax
          ? "Avec votre focale fixe, l’étude de cadrage en changeant de position change aussi la perspective ; elle ne remplace pas une comparaison de focales à position fixe."
          : ""),
    };
  }
  return {
    async init(options) {
      context = options;
      await S.init();
    },
    home,
    lessonPanel,
    adaptMeta,
    handle(app, bits) {
      switch (bits[0]) {
        case "onboarding":
        case "profile":
          profile(app);
          break;
        case "diagnostic":
          diagnostic(app);
          break;
        case "skills":
          skillPage(app);
          break;
        case "knowledge":
          knowledge(app);
          break;
        case "shoot":
          shoot(app);
          break;
        case "learn":
          if (bits[1] !== "N01-L01") return false;
          pilot(app);
          break;
        case "practice":
          return practice(app, bits[1]);
        case "review":
          return review(app, bits[1]);
        default:
          return false;
      }
      return true;
    },
    get state() {
      return S.state;
    },
    get data() {
      return S.data;
    },
    export: () => S.export(),
    validateImport: (x) => S.validate(x),
    restore: (x) => S.restore(x),
  };
})();
