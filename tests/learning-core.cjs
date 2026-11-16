/* Deterministic rules: never substitute a simulated picture for observed practice. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  C = require("../learning-core.js");
const path = require("node:path");
const root = path.join(__dirname, "..");
const data = Object.fromEntries(
  Object.entries({
    academy: "academy-v2",
    equipment: "equipment",
    diagnostic: "diagnostic",
    pilot: "pilot-first-shot",
    review: "review-bank",
  }).map(([key, name]) => [
    key,
    JSON.parse(fs.readFileSync(path.join(root, "data", name + ".json"))),
  ]),
);
assert.deepEqual(C.validateContent(data), []);
assert.equal(data.academy.targets.length, 240);
assert.equal(data.academy.modules.length, 27);
assert.equal(data.academy.skills.filter((s) => s.assessable).length, 48);
assert.equal(
  data.academy.targets.filter((t) => t.availability === "planned").length,
  192,
);
assert(
  C.graphErrors(
    [
      { id: "a", prerequisites: ["b"] },
      { id: "b", prerequisites: ["a"] },
    ],
    "test",
  ).some((s) => s.includes("cycle")),
);
assert(C.graphErrors([{ id: "a", prerequisites: ["missing"] }], "test").length);
const bad = C.clone(data);
bad.pilot.questions[0].correct = 20;
assert(C.validateContent(bad).length);
bad.pilot.questions[0].correct = 0;
bad.academy.targets[50].route = "#lesson/fake";
assert(C.validateContent(bad).length);
const profile = C.normalizeProfile(
  {
    confirmed: true,
    bodyId: "sony-a7iv",
    ownedLensIds: ["tamron"],
    activeLensId: "tamron",
  },
  data.equipment,
);
assert.throws(() =>
  C.normalizeProfile({ ...profile, ownedLensIds: [] }, data.equipment),
);
assert.throws(() =>
  C.normalizeProfile({ ...profile, ownedLensIds: ["unknown"] }, data.equipment),
);
assert.throws(() =>
  C.normalizeProfile(
    {
      ...profile,
      customLens: {
        name: "bad",
        focalMin: 85,
        focalMax: 35,
        maxAperture: 4,
        minAperture: 2,
      },
    },
    data.equipment,
  ),
);
const kit = JSON.parse(fs.readFileSync(path.join(root, "sony-a7iv.json")));
let count = 0;
for (const own of ["tamron", "fe35", "fe85"]) {
  const p = { ...profile, ownedLensIds: [own], activeLensId: own };
  for (const row of Object.values(kit.lessons))
    for (const c of [row.setup, ...row.presets]) {
      const x = C.constrain(c, p, data.equipment, true),
        l = C.lenses(p, data.equipment)[0];
      assert.equal(x.lensId, own);
      assert(
        x.focal >= l.focalMin &&
          x.focal <= l.focalMax &&
          x.aperture >= l.maxAperture &&
          x.aperture <= l.minAperture,
      );
      count++;
    }
  for (const scenario of C.scenarios) {
    const x = C.shoot(scenario.id, p, data.equipment);
    assert.equal(x.lensId, own);
    assert(x.mode === (scenario.moving ? "S" : "A"));
    assert(!x.moving || x.apertureAdvice.includes("automatique"));
  }
}
const now = Date.parse("2026-11-16T12:00:00Z"),
  state = C.empty(new Date(now).toISOString()),
  skill = data.academy.skills[0];
assert.equal(C.recommend(data.academy, state).route, "#onboarding");
state.profile = profile;
assert.equal(C.recommend(data.academy, state).route, "#diagnostic");
assert.equal(
  C.estimate(skill, state, {
    done: { "N01-L01": true },
    practice: { "N01-L01": true },
  }).stage,
  "discovered",
);
const answers = Object.fromEntries(
  data.diagnostic.questions.map((q) => [q.id, q.correct]),
);
state.diagnostic = {
  answers,
  results: C.grade(data.diagnostic.questions, answers),
  finishedAt: new Date(now).toISOString(),
};
assert.equal(C.estimate(skill, state).stage, "understood");
assert.equal(C.estimate(skill, state).confidence, 0.35);
const qs = data.pilot.questions,
  qa = Object.fromEntries(qs.map((q) => [q.id, q.correct]));
const pass = {
  skillId: skill.id,
  source: "pilot",
  questionIds: qs.map((q) => q.id),
  answers: qa,
  ...C.grade(qs, qa)[skill.id],
  at: new Date(now).toISOString(),
};
state.attempts.push(pass);
assert.equal(C.estimate(skill, state).confidence, 0.55);
const entry = {
  skillId: skill.id,
  at: new Date(now).toISOString(),
  trials: [0, 1].map(() => ({
    lensId: "tamron",
    focal: 50,
    aperture: 4,
    shutter: "1/250",
    iso: 400,
  })),
  observation:
    "Le sujet est net sur les deux vues ; le fond occupe moins de place sur la deuxième image après mon changement de cadrage.",
  justification:
    "Je conserve le cadrage plus serré car il enlève une forme claire qui attirait le regard.",
  criteria: [true, true, true],
};
assert(C.validPractice(entry, profile, data.equipment));
assert(
  !C.validPractice(
    {
      ...entry,
      trials: [{ ...entry.trials[0], aperture: 1.8 }, entry.trials[1]],
    },
    profile,
    data.equipment,
  ),
);
assert(
  !C.validPractice(
    { ...entry, observation: "case cochée" },
    profile,
    data.equipment,
  ),
);
state.practice.push(entry);
assert.equal(C.estimate(skill, state).stage, "applied");
state.attempts.push({ ...pass, at: new Date(now + C.DAY).toISOString() });
state.practice.push({ ...entry, at: new Date(now + C.DAY).toISOString() });
assert.equal(C.estimate(skill, state).stage, "applied");
state.attempts.push({ ...pass, at: new Date(now + 8 * C.DAY).toISOString() });
state.practice.push({ ...entry, at: new Date(now + 3 * C.DAY).toISOString() });
assert.equal(C.estimate(skill, state).stage, "mastered");
state.attempts.push({
  ...pass,
  score: 0,
  correctCount: 0,
  mistakes: pass.questionIds,
  at: new Date(now + 9 * C.DAY).toISOString(),
});
assert.equal(C.estimate(skill, state).stage, "discovered");
state.reviews[skill.id] = {
  step: 0,
  lastAt: new Date(now - C.DAY).toISOString(),
  dueAt: new Date(now - 1).toISOString(),
};
assert.equal(C.estimate(skill, state, {}, now).status, "review");
assert.equal(
  C.recommend(data.academy, state, {}, now).route,
  "#review/SK-camera",
);
const review = C.nextReview(state, skill.id, true, now);
assert.equal(review.step, 1);
state.reviews[skill.id] = review;
assert.equal(C.nextReview(state, skill.id, true, now + 1000).step, 1);
assert.equal(C.nextReview(state, skill.id, false, now).step, 0);
// The actual browser store is executed with an isolated localStorage and deterministic fetch.
let storage = new Map(),
  storageBlocked = false;
const window = { addEventListener() {}, dispatchEvent() {} },
  sandbox = {
    window,
    FocalLearningCore: C,
    crypto: { randomUUID: () => String(Math.random()) },
    CustomEvent: class {},
    localStorage: {
      getItem: (k) => {
        if (storageBlocked) throw Error("blocked");
        return storage.get(k) || null;
      },
      setItem: (k, v) => {
        if (storageBlocked) throw Error("quota");
        storage.set(k, v);
      },
    },
    fetch: async (url) => ({
      ok: true,
      json: async () =>
        data[
          Object.entries({
            academy: "academy-v2",
            equipment: "equipment",
            diagnostic: "diagnostic",
            pilot: "pilot-first-shot",
            review: "review-bank",
          }).find(([, n]) => url.includes(n + ".json"))[0]
        ],
    }),
  };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, "learning-store.js"), "utf8"),
  sandbox,
);
const S = window.FocalLearningStore;
(async () => {
  await S.init();
  storage.set("focal_academy_web_v1", "UNCHANGED");
  S.profile(profile);
  S.diagnostic(answers);
  S.attempt(skill.id, qs, qa, "pilot");
  S.practice(skill.id, entry);
  const backup = JSON.parse(JSON.stringify(S.export()));
  assert.equal(backup.attempts[0].correctCount, 6);
  assert.equal(storage.get("focal_academy_web_v1"), "UNCHANGED");
  const corrupt = C.clone(backup);
  corrupt.attempts[0].correctCount = 0;
  assert.throws(() => S.restore(corrupt));
  assert.equal(S.state.attempts[0].correctCount, 6);
  const v1 = C.clone(backup);
  v1.version = 1;
  delete v1.reviews;
  S.restore(v1);
  assert.equal(S.state.version, 2);
  assert(S.state.migrations.some((m) => m.note.includes("calendrier")));
  // Preserve historical evidence after switching the active equipment.
  S.profile({ ...profile, ownedLensIds: ["fe85"], activeLensId: "fe85" });
  S.restore(S.export());
  assert.equal(S.state.practice[0].trials[0].lensId, "tamron");
  storageBlocked = true;
  assert.throws(() => S.pace("wide"));
  assert.equal(S.state.profile.activeLensId, "fe85");
  storageBlocked = false;
  console.log(
    "PASS: graph/content contracts; " +
      count +
      " constrained presets; 30 scenario/kit combinations; evidence stages, time thresholds, overdue rules; store migration, corruption, quota and equipment-history preservation.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
