/* Reference kit plus confirmed owned equipment. No remote camera control. */
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
  function learningProfile() { return window.FocalLearningStore?.state.profile; }
  function availableLenses() {
    const p = learningProfile(), data = window.FocalLearningStore?.data;
    return p && data ? Object.fromEntries(FocalLearningCore.lenses(p, data.equipment).map(l => [l.id, l])) : profile.lenses;
  }
  function lens(id) {
    return availableLenses()[id] || profile.lenses[id] || Object.values(availableLenses())[0];
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
    if (kind === "depth") { c.distance = [1.2, 2, 5][step]; c.aperture = 1.8; }
    const own = learningProfile();
    if (own) c = FocalLearningCore.constrain(c, own, FocalLearningStore.data.equipment, ["focal", "lenskit"].includes(kind));
    const l = lens(c.lens);
    c.focal = Math.max(l.focalMin, Math.min(l.focalMax, c.focal));
    c.aperture = Math.max(l.maxAperture, Math.min(l.minAperture, c.aperture));
    return {
      ...c,
      lessonId,
      body: profile.model,
      bodyCode: profile.modelCode,
      lensId: c.lens,
      lensName: l.name,
      lensShort: short[c.lens] || l.name,
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
    return `<div class="sony-context"><a href="#camera"><span class="sony-alpha">α</span><span><strong>Sony α7 IV</strong><small>${learningProfile() ? "BOÎTIER CONFIRMÉ" : "BOÎTIER DE RÉFÉRENCE"} · ILCE-7M4</small></span></a><div><strong>${esc(c.lensShort)}</strong><span>${learningProfile() ? "Réglages pour votre objectif actif" : "Exemple de référence · matériel à confirmer"} · ${esc(numbers(c))}</span></div><a class="sony-context-guide" href="#camera">Commandes du boîtier ↗</a></div>`;
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
    const own = learningProfile();
    const steps = own ? [
      `Utilisez ${c.lensName} à ${c.focal} mm. ${c.focalMin === c.focalMax ? "Focale fixe : adaptez le cadre sans attendre un zoom." : "Choisissez cette focale sur votre zoom."}`,
      `Mode ${c.mode}. ${c.mode === "A" ? `Réglez f/${c.aperture} ; la durée sera automatique.` : c.mode === "S" ? `Réglez ${c.shutter} s ; l’ouverture sera automatique.` : c.mode === "M" ? `Réglez f/${c.aperture} et ${c.shutter} s ; vérifiez si les ISO sont fixes ou automatiques.` : "Le boîtier règle ouverture et durée ; vérifiez les valeurs affichées."}`,
      `Point de départ ISO ${c.iso} ; ajustez à la lumière et contrôlez la durée et les alertes. Le minimum de durée ISO AUTO n’est pas une garantie quand la limite ISO est atteinte.`,
      `Choisissez ${c.af} et une zone AF sur le détail utile. ${row.check}`,
      window.FocalLearning ? FocalLearning.adaptMeta(id, lessons[id]).mission : row.steps[4]
    ] : row.steps;
    return `<section class="sony-recipe panel"><div class="sony-recipe-heading"><div><span class="eyebrow">SUR VOTRE SONY α7 IV</span><h2>${esc(row.purpose)}</h2></div><span class="sony-mode">${esc(c.mode)}<small>MODE PHOTO</small></span></div><div class="sony-settings"><div><small>OBJECTIF</small><strong>${esc(c.lensShort)}</strong></div><div><small>FOCALE</small><strong>${c.focal} mm</strong></div><div><small>OUVERTURE${c.mode === "S" ? " · AUTO" : ""}</small><strong>f/${String(c.aperture).replace(".", ",")}</strong></div><div><small>DURÉE${c.mode === "A" ? " · REPÈRE" : ""}</small><strong>${esc(c.shutter)} s</strong></div><div><small>ISO DE DÉPART</small><strong>${c.iso}</strong></div><div><small>MISE AU POINT</small><strong>${esc(c.af)}</strong></div></div><p class="sony-auto-note">${esc(auto)} Ces réglages de départ sont à ajuster à la lumière.</p><ol class="sony-steps">${steps.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${esc(s)}</p></li>`).join("")}</ol><div class="sony-check"><span>À CONTRÔLER</span><p>${esc(row.check)}</p></div><details class="sony-reference"><summary>Version, fonctions personnalisées et guide Sony</summary><p>${esc(profile.documentation.note)}</p><p>Firmware déclaré : ${esc(learningProfile()?.firmware || "non renseigné")}. Les opérations de développement et d’export se font dans votre logiciel, lorsqu’elles sont indiquées comme telles.</p><a href="${esc(profile.documentation.guide)}" target="_blank" rel="noopener noreferrer">Ouvrir le guide officiel ILCE-7M4 ↗</a></details></section>`;
  }
  function captureCaption(id) {
    const c = capture("reference", 0, id);
    return `<span class="sony-photo-reference">EXERCICE α7 IV · ${esc(c.lensShort)}</span><span class="sony-photo-numbers">${esc(numbers(c))}</span>`;
  }
  function focusCinema() {
    return `<section class="focus-cinema panel" aria-labelledby="focus-title">
      <div class="focus-cinema-heading"><div><span class="eyebrow">LE REGARD EN MOUVEMENT · RUNWAY</span><h2 id="focus-title">La netteté guide le regard.</h2><p>Un même cadre, deux sujets. Observez comment le déplacement du point change ce que vous regardez en premier.</p></div><span class="focus-duration">10 s · sans son</span></div>
      <figure class="focus-film"><video controls playsinline preload="none" poster="assets/focus-study-poster.jpg" aria-label="Illustration d’un déplacement de mise au point entre une tasse et une plante" aria-describedby="focus-film-caption"><source src="assets/focus-study.mp4" type="video/mp4"><p>Votre navigateur ne lit pas cette vidéo. <a href="assets/focus-study.mp4">Télécharger la démonstration</a>.</p></video><figcaption id="focus-film-caption">Scène illustrative générée avec Runway. Le point passe de la tasse à la plante, puis revient. Ce rendu n’est ni une captation du Sony α7 IV ni une simulation optique mesurée. <a href="assets/focus-study.mp4" download>Télécharger la vidéo</a>.</figcaption></figure>
      <div class="focus-practice"><div><span class="eyebrow">À VOUS DE JOUER · 5 MIN</span><h3>Deux sujets. Une intention.</h3><p>Posez deux objets à des distances différentes, près d’une fenêtre. Gardez le même cadrage pour comparer vos images.</p><a class="btn" href="#lesson/N02-L04/course">Comprendre la mise au point <span aria-hidden="true">↗</span></a></div><ol><li><strong>Préparez votre kit</strong><span>${esc(capture("reference",0,"N02-L04").lensName)} à ${capture("reference",0,"N02-L04").focal} mm · mode A · f/${capture("reference",0,"N02-L04").aperture}. Adaptez les ISO à la lumière et surveillez la vitesse.</span></li><li><strong>Choisissez le premier sujet</strong><span>En AF-S, placez une petite zone de mise au point sur l’objet proche. Faites une première photo.</span></li><li><strong>Déplacez le point</strong><span>Sans changer de place, visez l’objet éloigné avec la zone AF. Déclenchez et comparez les deux photos.</span></li></ol></div>
    </section>`;
  }
  function renderGuide(app, lastLesson) {
    const id =
      lastLesson && profile.lessons[lastLesson] ? lastLesson : "N01-L01";
    app.innerHTML = `<div class="breadcrumbs"><a href="#courses">Formation</a><span>›</span>Votre Sony α7 IV</div><div class="page-heading"><div><span class="lesson-badge">VOTRE MATÉRIEL, VOTRE PARCOURS</span><h1>Le Sony α7 IV, en main.</h1><p class="lead">${learningProfile() ? "Votre boîtier et vos objectifs confirmés. Les réglages actifs respectent leurs limites." : "Un boîtier et trois objectifs de référence. Confirmez ceux que vous possédez pour adapter les exercices."} <a href="#profile">Modifier mon profil matériel →</a></p></div></div><nav class="camera-shortcuts" aria-label="Accès rapide au guide"><a href="#camera-controls" data-camera-jump="camera-controls">01 <span>Comprendre le boîtier</span> ↓</a><a href="#camera-focus" data-camera-jump="camera-focus">02 <span>Observer et pratiquer</span> ↓</a><a href="#camera-lenses" data-camera-jump="camera-lenses">03 <span>Choisir un objectif</span> ↓</a></nav><div id="camera-controls" class="sony-body-workshop"><div class="camera-lens-switch" role="group" aria-label="Objectif à observer">${Object.entries(availableLenses()).map(([key,l])=>`<button class="btn alt" data-guide-lens="${esc(key)}" aria-pressed="${key===capture("camera",0,"N01-L01").lensId}">${esc(short[key] || l.name)}</button>`).join("")}</div><div id="guide-kit-film">${FocalVisuals.draw("camera", 0, "Sony α7 IV : présentation du kit", "interactive", capture("camera",0,"N01-L01"))}</div><div class="camera-control-notes"><span class="eyebrow">CINQ REPÈRES SUR LE BOÎTIER</span><ol><li><strong>Déclencheur et ON/OFF</strong> : allumer, faire le point à mi-course, puis déclencher.</li><li><strong>Sélecteur Photo / Film / S&amp;Q</strong> : choisir Photo pour les exercices du parcours.</li><li><strong>Molette P / A / S / M</strong> : choisir le mode adapté à la priorité du cours.</li><li><strong>Fn et commandes personnalisées</strong> : vérifier l’affectation de vos commandes dans votre configuration.</li><li><strong>Monture et objectif</strong> : changer d’objectif boîtier éteint, à l’abri de la poussière ; ne pas toucher le capteur.</li></ol></div></div><div id="camera-focus">${focusCinema()}</div><div id="camera-lenses" class="sony-guide-grid">${Object.entries(
      availableLenses(),
    )
      .map(
        ([id, l]) =>
          `<article class="panel"><span class="eyebrow">${esc(l.model)}</span><h2>${esc(l.name)}</h2><p>${l.focalMin === l.focalMax ? "Focale fixe : " + l.focalMin + " mm. Pas de zoom." : "Zoom de " + l.focalMin + " à " + l.focalMax + " mm à ouverture maximale constante."}</p><p>Ouverture maximale : f/${String(l.maxAperture).replace(".", ",")}. Ouverture réglée depuis le boîtier.</p><p>${l.id === "user-lens" ? "Caractéristiques et bornes déclarées par vous, à vérifier sur la documentation de cet objectif. La plage d’ouverture utilisée est conservatrice et constante." : "Données de référence héritées, fiche fabricant à recontrôler. SteadyShot du boîtier à contrôler."}</p></article>`,
      )
      .join(
        "",
      )}</div><section class="panel"><span class="eyebrow">AVANT LES EXERCICES</span><h2>Une base cohérente.</h2><ul>${profile.baseline.map((s) => `<li>${esc(s)}</li>`).join("")}</ul><p>${esc(profile.documentation.note)}</p><a href="${esc(profile.documentation.guide)}" target="_blank" rel="noopener noreferrer">Guide officiel Sony α7 IV ↗</a></section><a class="btn" href="#lesson/${id}">Retour à ma leçon →</a>`;
    app.querySelectorAll("[data-guide-lens]").forEach(button => {
      button.onclick = () => {
        app.querySelectorAll("[data-guide-lens]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        const chosen = button.dataset.guideLens, l = lens(chosen);
        const base = capture("camera",0,"N01-L01");
        const c = {...base, lens:chosen, lensId:chosen, lensName:l.name, lensShort:short[chosen]||l.name, focal:Math.max(l.focalMin,Math.min(l.focalMax,base.focal)), aperture:Math.max(l.maxAperture,Math.min(l.minAperture,base.aperture)),focalMin:l.focalMin,focalMax:l.focalMax,apertureMin:l.maxAperture,apertureMax:l.minAperture};
        app.querySelectorAll("#guide-kit-film video").forEach(v=>v.pause());
        app.querySelector("#guide-kit-film").innerHTML = FocalVisuals.draw("camera",0,"Votre kit Sony α7 IV","interactive",c);
      };
    });
    app.querySelectorAll("[data-camera-jump]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.getElementById(link.dataset.cameraJump);
        if (!target) return;
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      });
    });
  }
  return {
    async init(enrichment) {
      const response = await fetch("sony-a7iv.json?v=20261115-20");
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
    availableLenses,
    get profile() {
      return profile;
    },
  };
})();
