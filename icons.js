/* Bespoke FOCAL pictograms share a single local vector sprite. */
window.FocalIcons = {
  draw(name, extra = '') {
    const id = String(name).replace(/[^a-z-]/g, '');
    return `<svg class="focal-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="assets/icons.svg?v=11#${id}"></use></svg>`;
  },
};
