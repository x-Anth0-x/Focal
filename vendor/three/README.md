# Three.js r180

Vendored from the official `three@0.180.0` npm package, installed with npm's integrity verification enabled. Copyright Three.js authors, MIT license; see `LICENSE`.

- `three.webgpu.min.js`, `three.module.min.js`, and `three.core.min.js`: WebGPU, classic WebGL 2 and common classes.
- `OrbitControls.js`: mouse, keyboard and touch camera controls.
- `RoundedBoxGeometry.js`: bevelled product-model geometry.

Source: https://github.com/mrdoob/three.js/tree/r180

Imports in OrbitControls.js and RoundedBoxGeometry.js are adapted from the bare `three` specifier to the local `./three.core.min.js`. Application modules import local renderer modules directly, so an import map is not required. License headers are preserved. No CDN is needed at runtime.
