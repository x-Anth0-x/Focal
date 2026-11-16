/* Pure learning rules. No DOM, storage or hidden inference from photographs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FocalLearningCore = api;
})(typeof window === "undefined" ? globalThis : window, () => {
  "use strict";
  const DAY = 86400000;
  const labels = {
    "not-started": "À découvrir",
    discovered: "Découverte",
    understood: "Compréhension estimée",
    applied: "Application documentée",
    mastered: "Maîtrise estimée",
    review: "À réviser",
  };
  const paces = {
    close: [1, 2, 4, 10, 30],
    standard: [1, 3, 7, 21, 60],
    wide: [2, 5, 14, 30, 90],
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const dateOK = (x) => typeof x === "string" && Number.isFinite(Date.parse(x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, Number(x)));
  function empty(now = new Date().toISOString()) {
    return {
      version: 2,
      profile: null,
      diagnostic: null,
      attempts: [],
      practice: [],
      reviews: {},
      preferences: { reviewDays: [...paces.standard] },
      migrations: [
        {
          version: 2,
          at: now,
          note: "Suivi historique conservé séparément ; aucune maîtrise importée.",
        },
      ],
      updatedAt: now,
    };
  }
  function graphErrors(rows, name) {
    const errors = [],
      ids = new Set(rows.map((x) => x.id)),
      visiting = new Set(),
      seen = new Set(),
      map = new Map(rows.map((x) => [x.id, x]));
    if (ids.size !== rows.length) errors.push(name + ": identifiant dupliqué");
    function visit(id) {
      if (visiting.has(id)) {
        errors.push(name + ": cycle " + id);
        return;
      }
      if (seen.has(id)) return;
      visiting.add(id);
      for (const p of map.get(id)?.prerequisites || []) {
        if (!ids.has(p)) errors.push(name + ": prérequis absent " + p);
        else visit(p);
      }
      visiting.delete(id);
      seen.add(id);
    }
    rows.forEach((x) => visit(x.id));
    return errors;
  }
  function validateContent(data) {
    const { academy, equipment, diagnostic, pilot } = data,
      errors = [];
    for (const key of ["modules", "skills", "targets"])
      errors.push(...graphErrors(academy[key], key));
    const modules = new Set(academy.modules.map((x) => x.id)),
      skills = new Set(academy.skills.map((x) => x.id)),
      targets = new Set(academy.targets.map((x) => x.id)),
      sources = new Set(academy.sources.map((x) => x.id));
    for (const row of [...academy.skills, ...academy.targets]) {
      if (!modules.has(row.moduleId)) errors.push("Module absent " + row.id);
      for (const id of row.skillIds || [])
        if (!skills.has(id)) errors.push("Compétence absente " + id);
      for (const id of row.sourceIds || [])
        if (!sources.has(id)) errors.push("Source absente " + id);
      if (row.lessonId && !targets.has(row.lessonId))
        errors.push("Leçon absente " + row.id);
      if (
        row.availability === "planned" &&
        (row.route || row.editorialStatus !== "outline-only")
      )
        errors.push("Contenu planifié présenté comme fini " + row.id);
    }
    for (const l of equipment.lenses)
      if (
        !(
          l.focalMin > 0 &&
          l.focalMax >= l.focalMin &&
          l.maxAperture > 0 &&
          l.minAperture >= l.maxAperture
        )
      )
        errors.push("Bornes objectif " + l.id);
    const qids = new Set();
    for (const q of [
      ...diagnostic.questions,
      ...pilot.questions,
      ...(data.review?.questions || []),
    ]) {
      if (
        qids.has(q.id) ||
        !skills.has(q.skillId) ||
        !q.prompt ||
        !q.explanation ||
        !Array.isArray(q.options) ||
        q.options.length < 3 ||
        new Set(q.options).size !== q.options.length ||
        !Number.isInteger(q.correct) ||
        q.correct < 0 ||
        q.correct >= q.options.length
      )
        errors.push("Question invalide " + q.id);
      qids.add(q.id);
    }
    const required = [
      "title",
      "objective",
      "prerequisites",
      "intuition",
      "chapters",
      "glossary",
      "visual",
      "comparison",
      "sonySteps",
      "guidedExercise",
      "autonomousExercise",
      "errors",
      "questions",
      "mission",
      "memo",
      "deepening",
      "sourceIds",
      "durationMinutes",
      "difficulty",
    ];
    for (const key of required)
      if (!Object.hasOwn(pilot, key) || pilot[key] === null)
        errors.push("Pilote incomplet " + key);
    if (
      pilot.questions.length < 5 ||
      new Set(pilot.questions.map((q) => q.type)).size < 3
    )
      errors.push("Évaluation pilote insuffisante");
    for (const id of pilot.sourceIds)
      if (!sources.has(id)) errors.push("Source pilote absente " + id);
    for (const s of pilot.sonySteps)
      if (!sources.has(s.sourceId))
        errors.push("Source commande absente " + s.sourceId);
    for (const id of pilot.deepening)
      if (!targets.has(id)) errors.push("Approfondissement absent " + id);
    if (!targets.has(pilot.id) || !skills.has(pilot.skillId))
      errors.push("Référence pilote absente");
    return errors;
  }
  function lenses(profile, equipment) {
    if (!profile?.confirmed) return equipment.lenses;
    return [
      ...equipment.lenses,
      ...(profile.customLens ? [profile.customLens] : []),
    ].filter((l) => profile.ownedLensIds.includes(l.id));
  }
  function normalizeProfile(raw, equipment) {
    if (!raw || raw.confirmed !== true)
      throw Error("Confirmez votre matériel.");
    if (!equipment.bodies.some((b) => b.id === raw.bodyId))
      throw Error("Boîtier non pris en charge.");
    const p = {
      confirmed: true,
      bodyId: raw.bodyId,
      ownedLensIds: [...new Set(raw.ownedLensIds || [])],
      activeLensId: raw.activeLensId,
      declaredLevel: String(raw.declaredLevel || "beginner").slice(0, 40),
      experience: String(raw.experience || "none").slice(0, 40),
      practice: String(raw.practice || "photo").slice(0, 20),
      interests: (raw.interests || []).map(String).slice(0, 12),
      goals: (raw.goals || []).map(String).slice(0, 12),
      weeklyMinutes: clamp(raw.weeklyMinutes || 60, 15, 1200),
      revisionPace: Object.hasOwn(paces, raw.revisionPace)
        ? raw.revisionPace
        : "standard",
      firmware: String(raw.firmware || "Non renseigné").slice(0, 80),
    };
    if (
      p.interests.some((x) => x.length > 100) ||
      p.goals.some((x) => x.length > 100) ||
      !Number.isFinite(p.weeklyMinutes)
    )
      throw Error("Profil invalide.");
    if (raw.customLens) {
      const c = raw.customLens;
      p.customLens = {
        id: "user-lens",
        name: String(c.name || "Mon objectif").slice(0, 120),
        model: "Données déclarées par vous, à vérifier",
        focalMin: Number(c.focalMin),
        focalMax: Number(c.focalMax),
        maxAperture: Number(c.maxAperture),
        minAperture: Number(c.minAperture),
        editorialStatus: "user-declared",
      };
      const l = p.customLens;
      if (
        !(
          l.focalMin >= 4 &&
          l.focalMax >= l.focalMin &&
          l.focalMax <= 2000 &&
          l.maxAperture >= 0.5 &&
          l.minAperture >= l.maxAperture &&
          l.minAperture <= 128
        )
      )
        throw Error("Vérifiez les bornes de votre objectif.");
    }
    const valid = new Set([
      ...equipment.lenses.map((l) => l.id),
      ...(p.customLens ? ["user-lens"] : []),
    ]);
    if (!p.ownedLensIds.length || p.ownedLensIds.some((id) => !valid.has(id)))
      throw Error("Sélectionnez au moins un objectif disponible.");
    if (!p.ownedLensIds.includes(p.activeLensId))
      p.activeLensId = p.ownedLensIds[0];
    return p;
  }
  function constrain(c, profile, equipment, comparison = false) {
    if (!profile?.confirmed) return { ...c };
    const available = lenses(profile, equipment),
      requested = c.lens || c.lensId;
    const l =
      available.find(
        (l) =>
          l.id ===
          (comparison && profile.ownedLensIds.includes(requested)
            ? requested
            : profile.activeLensId),
      ) || available[0];
    if (!l) throw Error("Aucun objectif disponible.");
    return {
      ...c,
      lens: l.id,
      lensId: l.id,
      lensName: l.name,
      lensShort: l.name,
      focal: clamp(
        Number.isFinite(Number(c.focal)) ? c.focal : l.focalMin,
        l.focalMin,
        l.focalMax,
      ),
      aperture: clamp(
        Number.isFinite(Number(c.aperture)) ? c.aperture : l.maxAperture,
        l.maxAperture,
        l.minAperture,
      ),
      focalMin: l.focalMin,
      focalMax: l.focalMax,
      apertureMin: l.maxAperture,
      apertureMax: l.minAperture,
    };
  }
  function grade(questions, answers) {
    const results = {};
    for (const q of questions) {
      const r = (results[q.skillId] ??= {
        total: 0,
        correctCount: 0,
        mistakes: [],
      });
      r.total++;
      if (answers[q.id] === q.correct) r.correctCount++;
      else r.mistakes.push(q.id);
    }
    for (const r of Object.values(results)) r.score = r.correctCount / r.total;
    return results;
  }
  function validPractice(entry, profile, equipment) {
    if (
      !entry ||
      !dateOK(entry.at) ||
      !Array.isArray(entry.trials) ||
      entry.trials.length < 2 ||
      String(entry.observation || "").trim().length < 80 ||
      String(entry.justification || "").trim().length < 40 ||
      entry.criteria?.length !== 3 ||
      !entry.criteria.every((x) => x === true)
    )
      return false;
    return entry.trials.every((t) => {
      const l = lenses(profile, equipment).find((l) => l.id === t.lensId);
      const duration =
        typeof t.shutter === "string" && /^1\/[0-9]+$/.test(t.shutter)
          ? 1 / Number(t.shutter.slice(2))
          : Number(t.shutter);
      return (
        l &&
        Number.isFinite(t.focal) &&
        t.focal >= l.focalMin &&
        t.focal <= l.focalMax &&
        Number.isFinite(t.aperture) &&
        t.aperture >= l.maxAperture &&
        t.aperture <= l.minAperture &&
        duration > 0 &&
        duration <= 30 &&
        Number.isFinite(t.iso) &&
        t.iso >= 50 &&
        t.iso <= 204800
      );
    });
  }
  function estimate(skill, state, legacy = {}, now = Date.now()) {
    const attempts = state.attempts
        .filter((a) => a.skillId === skill.id)
        .sort((a, b) => Date.parse(a.at) - Date.parse(b.at)),
      last = attempts.at(-1),
      diag = state.diagnostic?.results[skill.id],
      practice = state.practice
        .filter((p) => p.skillId === skill.id)
        .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    let stage = "not-started",
      provisional = false;
    if (
      legacy.done?.[skill.lessonId] ||
      legacy.readV2?.[skill.lessonId]?.length ||
      diag ||
      last ||
      practice.length
    )
      stage = "discovered";
    if (
      last
        ? last.total >= 5 && last.score >= 0.8
        : diag?.total >= 2 && diag.score === 1
    ) {
      stage = "understood";
      provisional = !last;
    }
    const old = legacy.assessments?.[skill.lessonId];
    if (stage === "not-started" && old) stage = "discovered";
    if (!last && !diag && old?.total >= 5 && old.score >= 0.8) {
      stage = "understood";
      provisional = true;
    }
    if (stage === "understood" && practice.length) stage = "applied";
    const passed = attempts.filter((a) => a.total >= 5 && a.score >= 0.8),
      unique = new Set(passed.flatMap((a) => a.questionIds));
    if (
      stage === "applied" &&
      unique.size >= 5 &&
      passed.length >= 2 &&
      Date.parse(passed.at(-1).at) - Date.parse(passed[0].at) >= 7 * DAY &&
      practice.length >= 2 &&
      Date.parse(practice.at(-1).at) - Date.parse(practice[0].at) >= 2 * DAY
    )
      stage = "mastered";
    const dueAt = state.reviews[skill.id]?.dueAt || null,
      due = !!dueAt && Date.parse(dueAt) <= now;
    const confidence =
      stage === "mastered"
        ? 0.85
        : stage === "applied"
          ? 0.65
          : stage === "understood"
            ? provisional
              ? 0.35
              : 0.55
            : stage === "discovered"
              ? 0.15
              : 0;
    return {
      id: skill.id,
      stage,
      status: due ? "review" : stage,
      label: labels[due ? "review" : stage],
      confidence,
      provisional,
      dueAt,
      lastPractice: practice.at(-1)?.at || null,
      evidenceCount: practice.length,
      attemptCount: attempts.length,
      mistakes: last?.mistakes || diag?.mistakes || old?.mistakes || [],
      reason:
        stage === "mastered"
          ? "Évaluations espacées et pratiques déclarées répétées."
          : stage === "applied"
            ? "Quiz réussi et deux essais consignés ; preuve déclarative."
            : stage === "understood"
              ? provisional
                ? "Estimation initiale à confirmer par une évaluation complète."
                : "Au moins cinq questions, avec 80 % de réussite."
              : "La lecture et les cases cochées ne prouvent pas une maîtrise.",
    };
  }
  function nextReview(state, skillId, passed, now = Date.now()) {
    const days = state.preferences.reviewDays,
      old = state.reviews[skillId];
    // Repeated submissions on the same day cannot skip revision intervals.
    const step = passed
      ? old && Date.parse(old.dueAt) <= now
        ? Math.min(old.step + 1, days.length - 1)
        : old?.step || 0
      : 0;
    return {
      step,
      lastAt: new Date(now).toISOString(),
      dueAt: new Date(now + (passed ? days[step] : 1) * DAY).toISOString(),
    };
  }
  function recommend(academy, state, legacy = {}, now = Date.now()) {
    if (!state.profile)
      return {
        route: "#onboarding",
        label: "Créer mon parcours",
        reason:
          "Confirmez votre matériel et vos envies pour recevoir des exercices réalisables.",
      };
    if (!state.diagnostic)
      return {
        route: "#diagnostic",
        label: "Faire mon diagnostic",
        reason:
          "Dix décisions pour trouver votre point de départ. « Je ne sais pas » est une réponse utile.",
      };
    const skills = academy.skills.filter((s) => s.assessable !== false),
      map = new Map(skills.map((s) => [s.id, s])),
      est = new Map(skills.map((s) => [s.id, estimate(s, state, legacy, now)]));
    const due = skills.find((s) => est.get(s.id).status === "review");
    if (due)
      return {
        route: "#review/" + due.id,
        label: "Réviser : " + due.title,
        reason:
          "La révision prévue est arrivée. " + due.remediation.explanation,
        skill: due,
      };
    const understood = (id) =>
      ["understood", "applied", "mastered"].includes(est.get(id)?.stage);
    function earliest(s) {
      for (const id of s.prerequisites)
        if (!understood(id)) return earliest(map.get(id));
      return s;
    }
    const weak = skills.find((s) => est.get(s.id).mistakes.length),
      interested = skills.find(
        (s) =>
          state.profile.interests.includes(s.moduleId) &&
          !["applied", "mastered"].includes(est.get(s.id).stage),
      );
    const candidate = earliest(
      weak ||
        interested ||
        skills.find(
          (s) => !["applied", "mastered"].includes(est.get(s.id).stage),
        ) ||
        skills[0],
    );
    const route = understood(candidate.id)
      ? "#practice/" + candidate.id
      : candidate.lessonId === "N01-L01"
        ? "#learn/N01-L01"
        : "#lesson/" + candidate.lessonId;
    return {
      route,
      label: understood(candidate.id)
        ? "Mettre en pratique : " + candidate.title
        : "Apprendre : " + candidate.title,
      reason:
        (weak
          ? "Une difficulté observée oriente cette proposition. "
          : interested
            ? "Votre intérêt déclaré oriente cette proposition. "
            : "Cette compétence prépare la suite. ") +
        (candidate !== weak && weak ? "Un prérequis est à consolider. " : "") +
        "Séance conseillée : " +
        Math.min(state.profile.weeklyMinutes, 35) +
        " min ; les cours restent accessibles librement.",
      skill: candidate,
    };
  }
  const scenarios = [
    {
      id: "portrait",
      title: "Portrait intérieur",
      focal: 75,
      aperture: 2.8,
      shutter: "1/250",
      af: "AF-S",
      light: "Une fenêtre latérale sans soleil direct.",
      placement: "Sujet éloigné du fond ; vérifiez que l’œil voulu est net.",
      why: "Une grande ouverture peut isoler le sujet ; vérifiez la profondeur sur le visage.",
    },
    {
      id: "child",
      title: "Enfant qui court",
      focal: 50,
      aperture: 4,
      shutter: "1/1000",
      af: "AF-C",
      moving: true,
      light: "Privilégiez un espace lumineux.",
      placement: "Laissez de la place dans la direction de la course.",
      why: "Une courte durée réduit la trace du mouvement ; AF-C suit la distance.",
    },
    {
      id: "animal",
      title: "Animal en mouvement",
      focal: 85,
      aperture: 4,
      shutter: "1/1000",
      af: "AF-C",
      moving: true,
      light: "Cherchez une lumière régulière.",
      placement:
        "Gardez une distance respectueuse et le sujet dans la zone AF.",
      why: "Le suivi et une durée courte aident ; ne vous approchez pas pour compenser une focale courte.",
    },
    {
      id: "landscape",
      title: "Paysage ensoleillé",
      focal: 28,
      aperture: 8,
      shutter: "1/125",
      af: "AF-S",
      light: "Observez les ombres et les hautes lumières.",
      placement: "Organisez premier plan et horizon.",
      why: "f/8 est un départ, pas une garantie de netteté à toutes les distances.",
    },
    {
      id: "sunset",
      title: "Coucher de soleil",
      focal: 35,
      aperture: 8,
      shutter: "1/125",
      af: "AF-S",
      light: "Surveillez les zones claires utiles.",
      placement: "Choisissez un élément qui raconte le lieu.",
      why: "L’intention décide des ombres conservées ; vérifiez les zones claires plutôt que la seule moyenne.",
    },
    {
      id: "street",
      title: "Rue la nuit",
      focal: 35,
      aperture: 1.8,
      shutter: "1/250",
      af: "AF-C",
      moving: true,
      light: "Utilisez vitrines et éclairages existants.",
      placement: "Attendez le passage du sujet dans la lumière.",
      why: "Un passant exige une durée assez courte ; acceptez du bruit plutôt qu’un flou involontaire.",
    },
    {
      id: "building",
      title: "Bâtiment",
      focal: 28,
      aperture: 8,
      shutter: "1/125",
      af: "AF-S",
      light: "Observez la direction des ombres.",
      placement:
        "Gardez le boîtier à niveau si vous voulez des verticales parallèles.",
      why: "La convergence dépend de l’orientation du boîtier ; une autre focale ne la corrige pas seule.",
    },
    {
      id: "travel",
      title: "Voyage",
      focal: 35,
      aperture: 5.6,
      shutter: "1/250",
      af: "AF-S",
      light: "Cherchez une lumière qui décrit le lieu.",
      placement: "Incluez un contexte lisible autour du sujet.",
      why: "Un cadrage large raconte le contexte ; avec une focale longue, cherchez un détail.",
    },
    {
      id: "sport",
      title: "Sport",
      focal: 85,
      aperture: 4,
      shutter: "1/1000",
      af: "AF-C",
      moving: true,
      light: "Anticipez les zones bien éclairées.",
      placement:
        "Cadrez la trajectoire attendue, depuis une position autorisée.",
      why: "La priorité S favorise la durée ; l’ouverture et les ISO restent limités par le matériel et la lumière.",
    },
    {
      id: "lowlight",
      title: "Faible lumière, sujet immobile",
      focal: 35,
      aperture: 1.8,
      shutter: "1/125",
      af: "AF-S",
      light: "Rapprochez le sujet d’une source disponible.",
      placement: "Appuyez-vous et contrôlez les reflets.",
      why: "La stabilisation aide contre votre bougé, jamais contre le mouvement du sujet.",
    },
  ];
  function shoot(id, profile, equipment) {
    if (!profile?.confirmed)
      throw Error("Confirmez votre matériel avant de recevoir une recette.");
    const s = scenarios.find((s) => s.id === id) || scenarios[0],
      available = lenses(profile, equipment);
    const ranked = [...available].sort(
      (a, b) =>
        Math.abs(clamp(s.focal, a.focalMin, a.focalMax) - s.focal) -
        Math.abs(clamp(s.focal, b.focalMin, b.focalMax) - s.focal),
    );
    const l = ranked[0],
      c = constrain(
        { ...s, lens: l.id, mode: s.moving ? "S" : "A", iso: 1600 },
        { ...profile, activeLensId: l.id },
        equipment,
      );
    return {
      ...c,
      isoAdvice:
        "ISO AUTO, plage de départ 100–6400 à adapter. Si la limite est atteinte, ajoutez de la lumière ou acceptez un compromis.",
      durationAdvice: s.moving
        ? "Imposez " +
          s.shutter +
          " s en S ; contrôlez l’ouverture disponible et une éventuelle alerte."
        : "En A, surveillez la durée réelle ; " +
          s.shutter +
          " s est un repère à adapter au sujet et à votre stabilité.",
      apertureAdvice: s.moving
        ? "Ouverture automatique, dans les limites de votre objectif."
        : "Départ f/" + c.aperture + " ; contrôlez la profondeur de champ.",
      lensReason:
        l.focalMin === l.focalMax
          ? "Focale fixe : adaptez le cadrage depuis une position sûre ; elle ne zoome pas."
          : "Zoom : commencez à " + c.focal + " mm et affinez le cadre.",
      alternative: s.moving
        ? "Si la photo est sombre : plus de lumière, ISO plus élevé accepté, ou durée plus longue avec davantage de trace."
        : "Si la durée est trop longue : plus de lumière, ouverture plus grande si possible, ou ISO plus élevé.",
    };
  }
  return {
    DAY,
    labels,
    paces,
    empty,
    clone,
    dateOK,
    graphErrors,
    validateContent,
    lenses,
    normalizeProfile,
    constrain,
    grade,
    validPractice,
    estimate,
    nextReview,
    recommend,
    scenarios,
    shoot,
  };
});
