/* Versioned local persistence. The historical key is never rewritten here. */
window.FocalLearningStore = (() => {
  "use strict";
  const C = FocalLearningCore,
    KEY = "focal_academy_learning_v2";
  let state = C.empty(),
    data = null,
    issue = "",
    recoverable = null;
  const record = (x) => x && typeof x === "object" && !Array.isArray(x);
  const id = () =>
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2);
  function clean(raw) {
    if (!record(raw) || ![1, 2].includes(raw.version))
      throw Error("Version de suivi pédagogique inconnue.");
    let r = C.clone(raw);
    if (r.version === 1) {
      r = {
        ...C.empty(),
        ...r,
        version: 2,
        reviews: r.reviews || {},
        migrations: [
          ...(r.migrations || []),
          {
            version: 2,
            at: new Date().toISOString(),
            note: "Ajout du calendrier de révision.",
          },
        ],
      };
    }
    if (
      !Array.isArray(r.attempts) ||
      !Array.isArray(r.practice) ||
      !record(r.reviews) ||
      !record(r.preferences) ||
      !Array.isArray(r.migrations)
    )
      throw Error("Suivi pédagogique incomplet.");
    const out = C.empty();
    out.profile =
      r.profile === null ? null : C.normalizeProfile(r.profile, data.equipment);
    const skillIds = new Set(
      data.academy.skills
        .filter((s) => s.assessable !== false)
        .map((s) => s.id),
    );
    if (r.diagnostic !== null) {
      if (
        !record(r.diagnostic) ||
        !record(r.diagnostic.answers) ||
        !C.dateOK(r.diagnostic.finishedAt)
      )
        throw Error("Diagnostic invalide.");
      const answers = {};
      for (const q of data.diagnostic.questions) {
        const a = r.diagnostic.answers[q.id];
        if (!Number.isInteger(a) || a < -1 || a >= q.options.length)
          throw Error("Diagnostic incomplet.");
        answers[q.id] = a;
      }
      out.diagnostic = {
        answers,
        results: C.grade(data.diagnostic.questions, answers),
        finishedAt: r.diagnostic.finishedAt,
      };
    }
    if (r.attempts.length > 300 || r.practice.length > 100)
      throw Error("Limite de journal atteinte ; conservez une sauvegarde.");
    const bank = [...data.pilot.questions, ...data.review.questions];
    out.attempts = r.attempts.map((a) => {
      if (
        !record(a) ||
        !skillIds.has(a.skillId) ||
        !C.dateOK(a.at) ||
        !Array.isArray(a.questionIds) ||
        !Array.isArray(a.mistakes) ||
        !Number.isInteger(a.total) ||
        a.total < 1 ||
        a.total > 100 ||
        new Set(a.questionIds).size !== a.total ||
        a.questionIds.length !== a.total ||
        a.correctCount < 0 ||
        a.correctCount > a.total ||
        !Number.isInteger(a.correctCount) ||
        a.mistakes.length !== a.total - a.correctCount ||
        a.mistakes.some((x) => !a.questionIds.includes(x))
      )
        throw Error("Évaluation invalide.");
      const qs = a.questionIds.map((id) =>
        bank.find((q) => q.id === id && q.skillId === a.skillId),
      );
      if (
        qs.some((q) => !q) ||
        !record(a.answers) ||
        qs.some(
          (q) =>
            !Number.isInteger(a.answers[q.id]) ||
            a.answers[q.id] < -1 ||
            a.answers[q.id] >= q.options.length,
        )
      )
        throw Error("Réponses d’évaluation invalides.");
      const graded = C.grade(qs, a.answers)[a.skillId];
      if (
        graded.correctCount !== a.correctCount ||
        graded.mistakes.some((id) => !a.mistakes.includes(id))
      )
        throw Error("Score incohérent.");
      return {
        answers: Object.fromEntries(qs.map((q) => [q.id, a.answers[q.id]])),
        id: String(a.id).slice(0, 100),
        skillId: a.skillId,
        source: ["pilot", "review"].includes(a.source) ? a.source : "review",
        questionIds: a.questionIds.map(String),
        total: a.total,
        correctCount: a.correctCount,
        score: a.correctCount / a.total,
        mistakes: a.mistakes.map(String),
        at: a.at,
      };
    });
    out.practice = r.practice.map((p) => {
      const snapshot = p.profileSnapshot
        ? C.normalizeProfile(p.profileSnapshot, data.equipment)
        : out.profile;
      if (
        !skillIds.has(p.skillId) ||
        !snapshot ||
        !C.validPractice(p, snapshot, data.equipment)
      )
        throw Error("Preuve de pratique invalide.");
      return {
        id: String(p.id).slice(0, 100),
        skillId: p.skillId,
        at: p.at,
        profileSnapshot: snapshot,
        trials: p.trials.map((t) => ({
          lensId: String(t.lensId),
          focal: t.focal,
          aperture: t.aperture,
          shutter: String(t.shutter),
          iso: t.iso,
        })),
        observation: String(p.observation).slice(0, 4000),
        justification: String(p.justification).slice(0, 2000),
        criteria: [true, true, true],
      };
    });
    for (const [key, rw] of Object.entries(r.reviews)) {
      if (
        !skillIds.has(key) ||
        !record(rw) ||
        !Number.isInteger(rw.step) ||
        rw.step < 0 ||
        rw.step > 4 ||
        !C.dateOK(rw.dueAt) ||
        !C.dateOK(rw.lastAt)
      )
        throw Error("Calendrier de révision invalide.");
      out.reviews[key] = { step: rw.step, dueAt: rw.dueAt, lastAt: rw.lastAt };
    }
    const days = r.preferences.reviewDays;
    if (
      !Array.isArray(days) ||
      days.length !== 5 ||
      days.some(
        (d, i) =>
          !Number.isInteger(d) || d < 1 || d > 365 || (i && d <= days[i - 1]),
      )
    )
      throw Error("Intervalles de révision invalides.");
    out.preferences = { reviewDays: [...days] };
    out.migrations = r.migrations.map((m) => ({
      version: Number(m.version),
      at: String(m.at),
      note: String(m.note).slice(0, 200),
    }));
    out.updatedAt = C.dateOK(r.updatedAt)
      ? r.updatedAt
      : new Date().toISOString();
    return out;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = clean(JSON.parse(raw));
      issue = "";
      recoverable = null;
    } catch (e) {
      issue =
        "Le suivi pédagogique local est illisible ou le stockage est indisponible. Exportez une copie de récupération depuis vos compétences, puis importez une sauvegarde valide. Le suivi historique est conservé.";
      try {
        recoverable = localStorage.getItem(KEY);
      } catch {}
    }
  }
  function write(next) {
    const safe = clean(next);
    safe.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(safe));
    state = safe;
    issue = "";
    recoverable = null;
    return state;
  }
  function update(fn) {
    if (issue) throw Error(issue);
    // Read latest state before each transaction, so another tab's notes are retained.
    load();
    if (issue) throw Error(issue);
    const next = C.clone(state);
    fn(next);
    return write(next);
  }
  return {
    KEY,
    async init() {
      const names = {
        academy: "academy-v2",
        equipment: "equipment",
        diagnostic: "diagnostic",
        pilot: "pilot-first-shot",
        review: "review-bank",
      };
      data = Object.fromEntries(
        await Promise.all(
          Object.entries(names).map(async ([key, name]) => {
            const r = await fetch("data/" + name + ".json?v=20261115-20");
            if (!r.ok) throw Error(name);
            return [key, await r.json()];
          }),
        ),
      );
      const errors = C.validateContent(data);
      if (errors.length) throw Error(errors.join("\n"));
      load();
      window.addEventListener("storage", (e) => {
        if (e.key === KEY) {
          load();
          window.dispatchEvent(new CustomEvent("focal-learning-sync"));
        }
      });
    },
    get data() {
      return data;
    },
    get state() {
      return state;
    },
    get issue() {
      return issue;
    },
    get recovery() {
      return recoverable;
    },
    validate: clean,
    export() {
      return C.clone(state);
    },
    restore(raw) {
      return write(clean(raw));
    },
    profile(raw) {
      const profile = C.normalizeProfile(raw, data.equipment);
      update((s) => {
        s.profile = profile;
        s.preferences.reviewDays = [...C.paces[profile.revisionPace]];
        for (const rw of Object.values(s.reviews))
          rw.dueAt = new Date(
            Date.parse(rw.lastAt) + s.preferences.reviewDays[rw.step] * C.DAY,
          ).toISOString();
      });
    },
    diagnostic(answers) {
      for (const q of data.diagnostic.questions)
        if (
          !Number.isInteger(answers[q.id]) ||
          answers[q.id] < -1 ||
          answers[q.id] >= q.options.length
        )
          throw Error(
            "Répondez aux dix questions, même par « Je ne sais pas ».",
          );
      update((s) => {
        s.diagnostic = {
          answers,
          results: C.grade(data.diagnostic.questions, answers),
          finishedAt: new Date().toISOString(),
        };
        for (const [key, r] of Object.entries(s.diagnostic.results))
          s.reviews[key] = C.nextReview(s, key, r.score >= 0.8);
      });
    },
    attempt(skillId, questions, answers, source = "review") {
      const r = C.grade(questions, answers)[skillId];
      if (!r) throw Error("Évaluation sans compétence.");
      for (const q of questions)
        if (
          !Number.isInteger(answers[q.id]) ||
          answers[q.id] < -1 ||
          answers[q.id] >= q.options.length
        )
          throw Error("Répondez à chaque question.");
      update((s) => {
        s.attempts.push({
          id: id(),
          skillId,
          source,
          answers,
          questionIds: questions.map((q) => q.id),
          ...r,
          at: new Date().toISOString(),
        });
        s.reviews[skillId] = C.nextReview(s, skillId, r.score >= 0.8);
      });
      return r;
    },
    practice(skillId, evidence) {
      update((s) => {
        const entry = {
          ...evidence,
          id: id(),
          skillId,
          at: new Date().toISOString(),
          profileSnapshot: C.clone(s.profile),
        };
        if (!s.profile || !C.validPractice(entry, s.profile, data.equipment))
          throw Error(
            "Consignez deux essais possibles avec votre objectif, une observation de 80 caractères, une justification de 40 caractères et les trois critères.",
          );
        s.practice.push(entry);
        s.reviews[skillId] ??= C.nextReview(s, skillId, true);
      });
    },
    pace(name) {
      if (!C.paces[name]) throw Error("Rythme inconnu.");
      update((s) => {
        s.preferences.reviewDays = [...C.paces[name]];
        if (s.profile) s.profile.revisionPace = name;
        for (const rw of Object.values(s.reviews))
          rw.dueAt = new Date(
            Date.parse(rw.lastAt) + s.preferences.reviewDays[rw.step] * C.DAY,
          ).toISOString();
      });
    },
  };
})();
