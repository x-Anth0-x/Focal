/* Instruction first: deterministic diagrams replace unrelated generated demonstrations. */
window.FocalVisuals = (() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  function draw(kind,step=0,title='Comprendre la notion',mode='preview',capture=null) {
    const c={...(capture||FocalCamera.capture(kind,step))}, preview=mode==='preview';
    if(kind==='hyperfocal') c.distance=((c.focal*c.focal/(c.aperture*.03)+c.focal)/1000)*[.5,1,1.2][step];
    return `<div class="runway-view ${preview?'runway-preview diagram-card':'runway-interactive diagram-workshop'}" data-kind="${esc(kind)}" data-step="${step}" data-title="${esc(title)}" data-capture="${esc(JSON.stringify(c))}">${!preview?`<div class="diagram-kit"><span class="eyebrow">${esc(c.body)} · ${esc(c.lensName)}</span><p>${esc(c.focal)} mm · f/${esc(String(c.aperture).replace('.',','))} · ${c.mode==='A'?'durée auto (repère ':''}${esc(c.shutter)} s${c.mode==='A'?')':''} · ISO ${esc(c.iso)} · ${esc(c.mode)} · ${esc(c.af)}${c.focusZone?" · "+esc(c.focusZone):""}${c.kelvin?" · "+esc(c.kelvin)+" K":""}${c.exposureComp!==undefined?" · correction "+esc(c.exposureComp)+" IL":""}${c.distance?' · point à '+esc(c.distance)+' m':''}</p></div>`:''}${FocalDiagrams.render(kind,step,c,title,preview)}${preview?`<button class="runway-open" data-open-film aria-label="Ouvrir l’atelier : ${esc(title)}">Comprendre cette situation →</button>`:''}</div>`;
  }
  return {draw,update(el,kind,step,title,capture=null){el.innerHTML=draw(kind,step,title,'interactive',capture);},ready:()=>Promise.resolve()};
})();
