/* Local Runway assets; no remote player, API key or automatic playback. */
window.FocalFilms = (() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  let data, kinds = {};
  function clip(slug) { return data.clips[slug]; }
  function poster(slug, title) {
    const c = clip(slug);
    return `<img class="runway-poster" src="${esc(c.poster)}" alt="${esc(title || c.description)}" loading="lazy" width="1280" height="720">`;
  }
  function player(slug, title = "") {
    const c = clip(slug), label = title || c.title;
    return `<figure class="runway-film" data-clip="${esc(slug)}"><video controls playsinline preload="none" poster="${esc(c.poster)}" aria-label="${esc(label)}"><source src="${esc(c.video)}" type="video/mp4"></video><p class="runway-video-error" hidden>Lecture indisponible. Vous pouvez télécharger la vidéo ou poursuivre avec sa description.</p><figcaption>${esc(c.description)} <span>Illustration Runway · sans son · environ 10 s.</span> <a href="${esc(c.video)}" download>Télécharger la vidéo</a></figcaption></figure>`;
  }
  function lesson(lesson, meta) {
    const row = data.lessons[lesson.id];
    return `<section class="lesson-film panel" aria-labelledby="film-title-${esc(lesson.id)}"><div class="focus-cinema-heading"><div><span class="eyebrow">OBSERVER · COMPRENDRE · ESSAYER</span><h2 id="film-title-${esc(lesson.id)}">${esc(clip(row.clip).title)}</h2><p>${esc(row.observe)}</p></div><span class="focus-duration">ÉTUDE FILMÉE · RUNWAY</span></div>${player(row.clip)}<div class="film-exercise"><div><span class="eyebrow">VOTRE EXERCICE</span><h3>${esc(meta.headline)}</h3><p>${esc(meta.mission)}</p><button class="btn" data-film-mission>Ouvrir ma mission terrain →</button></div><ol>${meta.scenarios.map((s,i)=>`<li><strong>${esc(s.label)}</strong><span>${esc(s.explanation)}</span></li>`).join("")}</ol></div><p class="runway-note">Cette scène aide à observer le sujet du cours. Elle ne prouve pas un effet de réglage ni les performances du boîtier. Reproduisez les comparaisons avec votre matériel.</p></section>`;
  }
  document.addEventListener("play", event => {
    if (event.target.tagName !== "VIDEO" || event.target.matches(".brand-motion")) return;
    document.querySelectorAll("video:not(.brand-motion)").forEach(v => { if (v !== event.target) v.pause(); });
  }, true);
  document.addEventListener("error", event => {
    if (!["VIDEO", "SOURCE"].includes(event.target.tagName)) return;
    const message = event.target.closest(".runway-film")?.querySelector(".runway-video-error");
    if (message) message.hidden = false;
  }, true);
  document.addEventListener("visibilitychange", () => { if (document.hidden) document.querySelectorAll("video:not(.brand-motion)").forEach(v => v.pause()); });
  return {
    async init(enrichment) {
      const response = await fetch("lesson-films.json?v=20261115-8");
      if (!response.ok) throw Error("Médias des cours indisponibles");
      data = await response.json();
      for (const [id, meta] of Object.entries(enrichment)) {
        if (!data.lessons[id] || !data.clips[data.lessons[id].clip]) throw Error("Film manquant : " + id);
        kinds[meta.kind] = id;
      }
    },
    clip, poster, player, lesson,
    forKind(kind) { const aliases = {diffraction:"aberration",bokeh:"depth",dynamic:"histogram",hyperfocal:"depth",chromatic:"aberration"}; return data.lessons[kinds[aliases[kind] || kind]]?.clip || "kit"; },
    pause() { document.querySelectorAll("video:not(.brand-motion)").forEach(v => v.pause()); },
  };
})();
