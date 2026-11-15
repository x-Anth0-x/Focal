/* Runway iris: a short silent flourish, then still. Replay on hover or keyboard focus. */
(() => {
  const mark = document.querySelector('.brand-aperture');
  if (!mark) return;
  const video = mark.querySelector('video');
  const link = mark.closest('a');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const allowed = () => !reduced.matches && !navigator.connection?.saveData && !document.hidden;
  function stop() {
    video.pause();
    mark.classList.remove('is-active');
  }
  async function play() {
    if (!allowed() || !video.paused) return;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.currentTime = 0;
    try { await video.play(); if (allowed()) mark.classList.add('is-active'); else stop(); }
    catch { stop(); }
  }
  video.addEventListener('error', stop);
  link.addEventListener('mouseenter', play);
  link.addEventListener('focus', play);
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  play();
})();
