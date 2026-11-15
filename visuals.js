/* Drop-in visual renderer: local Runway films replace every WebGL scene. */
window.FocalVisuals = (() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  function draw(kind, step = 0, title = "Observer en vidéo", mode = "preview", capture = null) {
    const c = capture || window.FocalCamera.capture(kind, step);
    const gear = "gear-" + c.lensId;
    if (mode === "preview") {
      const slug = kind === "camera" ? gear : FocalFilms.forKind(kind);
      return `<div class="runway-view runway-preview" data-kind="${esc(kind)}" data-step="${step}">${FocalFilms.poster(slug, title)}<button class="runway-open" data-open-film aria-label="Ouvrir l’atelier vidéo : ${esc(title)}">▷ Voir en vidéo ↗</button></div>`;
    }
    return `<div class="runway-view runway-interactive" data-kind="${esc(kind)}" data-step="${step}" data-title="${esc(title)}" data-capture="${esc(JSON.stringify(c))}"><div class="runway-kit-heading"><span class="eyebrow">VOTRE KIT · SONY α7 IV</span><strong>${esc(c.lensName)}</strong></div>${FocalFilms.player(gear, "Sony α7 IV · " + c.lensName)}<div class="runway-setting-reference"><span class="eyebrow">REPÈRES DE LA SITUATION ${step+1}</span><strong>${esc(c.focal)} mm · f/${esc(String(c.aperture).replace(".",","))} · ${esc(c.shutter)} s · ISO ${esc(c.iso)}</strong><p>Mode ${esc(c.mode)} · ${esc(c.af)}. Ces repères textuels sont à reproduire sur votre appareil ; ils ne modifient pas la vidéo. L’animation présente le kit, sans simuler le résultat optique.</p></div>${kind !== "camera" ? `<div class="runway-topic"><span class="eyebrow">OBSERVER LE SUJET DU COURS</span>${FocalFilms.player(FocalFilms.forKind(kind), title)}</div>` : ""}</div>`;
  }
  return {
    draw,
    update(element, kind, step, title) {
      element.querySelectorAll("video").forEach(v=>v.pause());
      element.innerHTML = draw(kind, step, title, "interactive");
    },
    ready: () => Promise.resolve(),
  };
})();
