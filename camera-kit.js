/* A single declared body and the user's actual lenses. No remote camera control. */
window.FocalCamera = (() => {
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
  let profile, currentId, lessons;
  const short = {
    tamron: "Tamron 28–75 G2 · f/2,8",
    fe85: "FE 85 · f/1,8",
    fe35: "FE 35 · f/1,8",
  };
  function lens(id) {
    return profile.lenses[id] || profile.lenses.tamron;
  }
  function capture(kind, step = 0, lessonId = currentId) {
    const row = profile?.lessons[lessonId];
    let c = {
      lens: "tamron",
      focal: 50,
      aperture: 2.8,
      shutter: "1/250",
      iso: 100,
      mode: "A",
      af: "AF-S",
      distance: 2,
      ...row?.setup,
    };
    if (row && lessons?.[lessonId]?.kind === kind)
      c = { ...c, ...row.presets[step] };
    else {
      if (
        ["aperture", "depth", "aberration", "diffraction", "bokeh"].includes(
          kind,
        )
      )
        c.aperture = [
          Math.max(lens(c.lens).maxAperture, 1.8),
          5.6,
          kind === "diffraction" ? 22 : 16,
        ][step];
      if (kind === "focal") {
        c.lens = ["tamron", "fe35", "fe85"][step];
        c.focal = [28, 35, 85][step];
        c.aperture = 4;
      }
      if (kind === "iso") c.iso = [100, 1600, 6400][step];
      if (["shutter", "sport"].includes(kind))
        c.shutter = (
          kind === "sport"
            ? ["1/1000", "1/250", "1/30"]
            : ["1/30", "1/250", "1/1000"]
        )[step];
    }
    if (kind === "depth") c.distance = [1.2, 2, 5][step];
    const l = lens(c.lens);
    c.focal = Math.max(l.focalMin, Math.min(l.focalMax, c.focal));
    c.aperture = Math.max(l.maxAperture, Math.min(l.minAperture, c.aperture));
    return {
      ...c,
      body: profile.model,
      bodyCode: profile.modelCode,
      lensId: c.lens,
      lensName: l.name,
      lensShort: short[c.lens],
      focalMin: l.focalMin,
      focalMax: l.focalMax,
      apertureMin: l.maxAperture,
      apertureMax: l.minAperture,
    };
  }
  function numbers(c) {
    const a = "f/" + String(c.aperture).replace(".", ","),
      t = c.shutter + " s";
    return `${c.focal} mm · ${c.mode === "S" ? "ouv. auto (repère " + a + ")" : a} · ${c.mode === "A" ? "vit. auto (repère " + t + ")" : t} · ISO ${c.iso}`;
  }
  function banner(id) {
    const c = capture("reference", 0, id);
    return `<div class="sony-context"><a href="#camera"><span class="sony-alpha">α</span><span><strong>Sony α7 IV</strong><small>VOTRE BOÎTIER · ILCE-7M4</small></span></a><div><strong>${esc(c.lensShort)}</strong><span>Exemple à reproduire · ${esc(numbers(c))}</span></div><a class="sony-context-guide" href="#camera">Commandes du boîtier ↗</a></div>`;
  }
  function recipe(id) {
    const row = profile.lessons[id],
      c = capture("reference", 0, id),
      auto =
        c.mode === "A"
          ? "La vitesse est choisie par le boîtier en A. La durée affichée ici est un repère à surveiller."
          : c.mode === "S"
            ? "L’ouverture est choisie par le boîtier en S. La valeur proposée est un repère ; passez en M pour l’imposer."
            : "En M à ISO fixe, vous imposez ouverture, durée et ISO.";
    return `<section class="sony-recipe panel"><div class="sony-recipe-heading"><div><span class="eyebrow">SUR VOTRE SONY α7 IV</span><h2>${esc(row.purpose)}</h2></div><span class="sony-mode">${esc(c.mode)}<small>MODE PHOTO</small></span></div><div class="sony-settings"><div><small>OBJECTIF</small><strong>${esc(short[c.lens])}</strong></div><div><small>FOCALE</small><strong>${c.focal} mm</strong></div><div><small>OUVERTURE${c.mode === "S" ? " · AUTO" : ""}</small><strong>f/${String(c.aperture).replace(".", ",")}</strong></div><div><small>DURÉE${c.mode === "A" ? " · REPÈRE" : ""}</small><strong>${esc(c.shutter)} s</strong></div><div><small>ISO DE DÉPART</small><strong>${c.iso}</strong></div><div><small>MISE AU POINT</small><strong>${esc(c.af)}</strong></div></div><p class="sony-auto-note">${esc(auto)} Ces réglages de départ sont à ajuster à la lumière.</p><ol class="sony-steps">${row.steps.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></li>`).join("")}</ol><div class="sony-check"><span>À CONTRÔLER</span><p>${esc(row.check)}</p></div><details class="sony-reference"><summary>Version, fonctions personnalisées et guide Sony</summary><p>${esc(profile.documentation.note)}</p><p>Firmware de votre boîtier : non renseigné. Les opérations de développement et d’export se font dans votre logiciel, lorsqu’elles sont indiquées comme telles.</p><a href="${esc(profile.documentation.guide)}" target="_blank" rel="noopener noreferrer">Ouvrir le guide officiel ILCE-7M4 ↗</a></details></section>`;
  }
  function captureCaption(id) {
    const c = capture("reference", 0, id);
    return `<span class="sony-photo-reference">EXERCICE α7 IV · ${esc(c.lensShort)}</span><span class="sony-photo-numbers">${esc(numbers(c))}</span>`;
  }
  function renderGuide(app, lastLesson) {
    const id =
      lastLesson && profile.lessons[lastLesson] ? lastLesson : "N01-L01";
    app.innerHTML = `<div class="breadcrumbs"><a href="#courses">Formation</a><span>›</span>Votre Sony α7 IV</div><div class="page-heading"><div><span class="lesson-badge">VOTRE MATÉRIEL, VOTRE PARCOURS</span><h1>Le Sony α7 IV, en main.</h1><p class="lead">Un boîtier plein format, votre Tamron G2 et vos deux focales fixes. Chaque cours est décliné pour ce kit.</p></div></div><div class="sony-body-workshop">${FocalVisuals.draw("camera", 0, "Sony α7 IV : commandes et monture", "interactive")}</div><div class="sony-guide-grid">${Object.entries(
      profile.lenses,
    )
      .map(
        ([id, l]) =>
          `<article class="panel"><span class="eyebrow">${esc(l.model)}</span><h2>${esc(l.name)}</h2><p>${l.focalMin === l.focalMax ? "Focale fixe : " + l.focalMin + " mm. Pas de zoom." : "Zoom de " + l.focalMin + " à " + l.focalMax + " mm à ouverture maximale constante."}</p><p>Ouverture maximale : f/${String(l.maxAperture).replace(".", ",")}. Ouverture réglée depuis le boîtier.</p><p>Pas de stabilisation optique OSS/VC ; SteadyShot du boîtier à contrôler.</p></article>`,
      )
      .join(
        "",
      )}</div><section class="panel"><span class="eyebrow">AVANT LES EXERCICES</span><h2>Une base cohérente.</h2><ul>${profile.baseline.map((s) => `<li>${esc(s)}</li>`).join("")}</ul><p>${esc(profile.documentation.note)}</p><a href="${esc(profile.documentation.guide)}" target="_blank" rel="noopener noreferrer">Guide officiel Sony α7 IV ↗</a></section><a class="btn" href="#lesson/${id}">Retour à ma leçon →</a>`;
  }
  return {
    async init(enrichment) {
      const response = await fetch("sony-a7iv.json");
      if (!response.ok) throw Error("Profil Sony indisponible");
      profile = await response.json();
      lessons = enrichment;
      if (Object.keys(profile.lessons).length !== 48)
        throw Error("Profil Sony incomplet");
    },
    setLesson(id) {
      currentId = id;
    },
    capture,
    banner,
    recipe,
    captureCaption,
    renderGuide,
    lens,
    get profile() {
      return profile;
    },
  };
})();
