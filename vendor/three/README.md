# Three.js r180

Vendored from the official `three@0.180.0` npm package, installed with npm's integrity verification enabled. Copyright Three.js authors, MIT license; see `LICENSE`.

- `three.webgpu.min.js` and `three.core.min.js`: renderer and common classes.
- `OrbitControls.js`: mouse, keyboard and touch camera controls.
- `RoundedBoxGeometry.js`: bevelled product-model geometry.

Source: https://github.com/mrdoob/three.js/tree/r180

The import map in `index.html` maps `three` to the local WebGPU build, which includes the WebGL 2 fallback. No CDN is needed at runtime.
