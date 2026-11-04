import * as T from "./vendor/three/three.module.min.js";
import { OrbitControls } from "./vendor/three/OrbitControls.js?v=20261104-5";
import {
  buildWorld,
  configs,
  formatValue,
} from "./spatial-models.js?v=20261104-5";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let previewRendererPromise,
  stageRendererPromise,
  active = null,
  queue = Promise.resolve(),
  renderers = 0,
  mountRevision = 0;
const cache = new Map(),
  reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function deadline(work, milliseconds, message) {
  let timer;
  return Promise.race([
    work,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
}
function configureRenderer(r) {
  r.setPixelRatio(1);
  r.toneMapping = T.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.2;
  r.outputColorSpace = T.SRGBColorSpace;
  r.setClearColor(0x101e27);
  renderers++;
  return r;
}
function classicRenderer() {
  const r = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "low-power",
  });
  r.backend = { isWebGPUBackend: false };
  r.renderAsync = (scene, camera) => {
    r.render(scene, camera);
    return Promise.resolve();
  };
  return configureRenderer(r);
}
async function renderer(preferWebGPU = false) {
  if (!preferWebGPU || !navigator.gpu?.requestAdapter) return classicRenderer();
  let adapter;
  try {
    adapter = await deadline(
      navigator.gpu.requestAdapter({ powerPreference: "low-power" }),
      1200,
      "Adaptateur graphique trop lent",
    );
  } catch {
    return classicRenderer();
  }
  if (!adapter) return classicRenderer();
  let candidate;
  const attempt = (async () => {
    const { WebGPURenderer } = await import(
      "./vendor/three/three.webgpu.min.js"
    );
    candidate = new WebGPURenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    await candidate.init();
    if (!candidate.backend.isWebGPUBackend) {
      candidate.dispose();
      return classicRenderer();
    }
    return configureRenderer(candidate);
  })();
  try {
    return await deadline(attempt, 3000, "Initialisation WebGPU trop lente");
  } catch {
    try {
      candidate?.dispose();
    } catch {}
    attempt.then(
      (r) => r.dispose(),
      () => {
        try {
          candidate?.dispose();
        } catch {}
      },
    );
    return classicRenderer();
  }
}
function getPreviewRenderer() {
  return (previewRendererPromise ??= renderer(false).catch((error) => {
    previewRendererPromise = undefined;
    throw error;
  }));
}
function getStageRenderer() {
  return (stageRendererPromise ??= renderer(true).catch((error) => {
    stageRendererPromise = undefined;
    throw error;
  }));
}
function sceneFor(world, quality = true) {
  const scene = new T.Scene();
  scene.background = new T.Color(0x101e27);
  scene.fog = new T.Fog(0x101e27, 10, 24);
  scene.add(world.root);
  scene.add(new T.HemisphereLight(0xb7d8eb, 0x29413d, 2.8));
  const key = new T.DirectionalLight(0xffdfae, 4);
  key.position.set(3, 6, 5);
  key.castShadow = quality;
  key.shadow.mapSize.set(quality ? 1024 : 256, quality ? 1024 : 256);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.normalBias = 0.035;
  scene.add(key);
  const rim = new T.DirectionalLight(0x79c5e0, 3.6);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
  const floor = new T.Mesh(
    new T.CylinderGeometry(4.3, 4.3, 0.065, 64),
    new T.MeshStandardMaterial({
      color: 0x172e39,
      roughness: 0.57,
      metalness: 0.35,
    }),
  );
  floor.position.y = -1.18;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new T.GridHelper(8, 16, 0x3e5f6e, 0x263e49);
  grid.position.y = -1.138;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);
  const ring = new T.Mesh(
    new T.TorusGeometry(3.6, 0.008, 5, 100),
    new T.MeshBasicMaterial({ color: 0x577d86 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -1.135;
  scene.add(ring);
  return scene;
}
function makeCamera(width = 680, height = 380) {
  const c = new T.PerspectiveCamera(39, width / height, 0.1, 60);
  c.position.set(5, 3.2, 7);
  c.lookAt(0, 0.1, 0);
  return c;
}
function disposeScene(scene, world) {
  world.dispose();
  scene.traverse((o) => {
    if (world.root === o || world.root.getObjectById(o.id)) return;
    if (o.shadow?.dispose) o.shadow.dispose();
    if (o.geometry) o.geometry.dispose();
    if (o.material)
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        m.dispose(),
      );
  });
  scene.clear();
}
function unavailable(host) {
  host.dataset.state = "unavailable";
  host.innerHTML =
    '<div class="spatial-unavailable"><span>EXPLICATION ACCESSIBLE</span><strong>Le rendu 3D n’a pas pu démarrer.</strong><p>Les explications restent consultables. Vous pouvez relancer la scène sans quitter la leçon.</p><button class="btn alt" data-spatial-retry>Réessayer la 3D</button></div>';
}
async function preview(host) {
  const key = host.dataset.kind + ":" + host.dataset.step;
  if (!cache.has(key)) {
    const r = await getPreviewRenderer();
    if (!host.isConnected) return;
    const world = buildWorld(host.dataset.kind, +host.dataset.step),
      scene = sceneFor(world, false),
      camera = makeCamera(560, 340);
    r.setSize(560, 340, false);
    await deadline(
      r.renderAsync(scene, camera),
      6000,
      "Le premier rendu 3D n’a pas répondu",
    );
    if (r.backend.isWebGPUBackend)
      await r.backend.device.queue.onSubmittedWorkDone();
    const url = r.domElement.toDataURL("image/webp", 0.86);
    cache.set(key, url);
    if (cache.size > 36) cache.delete(cache.keys().next().value);
    disposeScene(scene, world);
  }
  if (!host.isConnected) return;
  host
    .querySelectorAll(".spatial-thumbnail,.spatial-preview-label")
    .forEach((el) => el.remove());
  host.insertAdjacentHTML(
    "afterbegin",
    `<img class="spatial-thumbnail" src="${cache.get(key)}" width="560" height="340" alt="${escape(host.dataset.title)} — rendu d’un modèle 3D"><span class="spatial-preview-label"><i></i> ÉTUDE SPATIALE · 3D</span>`,
  );
  host.querySelector(".spatial-loading,.spatial-unavailable")?.remove();
  if (!host.querySelector("[data-open-spatial]"))
    host.insertAdjacentHTML(
      "beforeend",
      `<button class="spatial-open" data-open-spatial aria-label="Ouvrir en 3D : ${escape(host.dataset.title)}"><span aria-hidden="true">◇</span> Ouvrir en 3D <span aria-hidden="true">↗</span></button>`,
    );
  host.dataset.state = "ready";
  host.dataset.renderer = "webgl2-preview";
}
function stop() {
  if (!active) return;
  active.playing = false;
  cancelAnimationFrame(active.raf);
  const button = active.host.querySelector('[data-action="play"]');
  if (button) {
    button.textContent = "▷ Lancer l’animation";
    button.setAttribute("aria-pressed", "false");
  }
}
function destroy() {
  if (!active) return;
  stop();
  active.resizeObserver.disconnect();
  active.visibilityObserver.disconnect();
  active.controls.dispose();
  active.host._spatialCleanup?.();
  disposeScene(active.scene, active.world);
  active = null;
}
const removed = new MutationObserver(() => {
  if (active && !active.host.isConnected) destroy();
});
removed.observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
function applyValue(a, value, manual = true) {
  const cfg = a.world.config;
  const bounded = T.MathUtils.clamp(Number(value), cfg[1], cfg[2]);
  a.world.set(bounded);
  a.host.querySelector(".spatial-value").textContent = formatValue(
    a.world.kind,
    bounded,
  );
  const range = a.host.querySelector(".spatial-range");
  range.value = bounded;
  range.setAttribute("aria-valuetext", formatValue(a.world.kind, bounded));
  if (manual) {
    a.host.dataset.parameter = String(bounded);
    a.host.dispatchEvent(
      new CustomEvent("spatial-change", {
        bubbles: true,
        detail: {
          kind: a.world.kind,
          value: bounded,
          formatted: formatValue(a.world.kind, bounded),
        },
      }),
    );
  }
  draw(a);
}
function annotate(a) {
  const rect = a.canvas.getBoundingClientRect(),
    used = [];
  for (const [i, h] of a.world.hotspots.entries()) {
    const button = a.host.querySelector(`[data-hotspot="${i}"]`);
    if (!button) continue;
    const v = h.position
      .clone()
      .applyMatrix4(a.world.root.matrixWorld)
      .project(a.camera);
    button.hidden = v.z > 1 || Math.abs(v.x) > 0.94 || Math.abs(v.y) > 0.93;
    if (button.hidden) continue;
    const bw = button.offsetWidth || 100,
      bh = button.offsetHeight || 28;
    let x = (v.x * 0.5 + 0.5) * rect.width,
      y = (-v.y * 0.5 + 0.5) * rect.height;
    x = T.MathUtils.clamp(x, bw / 2 + 7, rect.width - bw / 2 - 7);
    for (let attempt = 0; attempt < 4; attempt++) {
      if (
        !used.some(
          (p) =>
            Math.abs(p.x - x) < (p.w + bw) / 2 + 8 &&
            Math.abs(p.y - y) < (p.h + bh) / 2 + 6,
        )
      )
        break;
      y += bh + 10;
    }
    y = T.MathUtils.clamp(y, bh / 2 + 10, rect.height - bh / 2 - 38);
    button.style.left = x + "px";
    button.style.top = y + "px";
    used.push({ x, y, w: bw, h: bh });
  }
}
function draw(a) {
  if (active !== a || !a.host.isConnected) return;
  try {
    a.renderer.render(a.scene, a.camera);
    annotate(a);
    a.frames++;
  } catch {
    stop();
    a.host.dataset.state = "unavailable";
  }
}
function orbit(a, dx, dy) {
  const offset = a.camera.position.clone().sub(a.controls.target),
    spherical = new T.Spherical().setFromVector3(offset);
  spherical.theta += dx;
  spherical.phi = T.MathUtils.clamp(
    spherical.phi + dy,
    0.22,
    Math.PI / 2 - 0.015,
  );
  offset.setFromSpherical(spherical);
  a.camera.position.copy(a.controls.target).add(offset);
  a.controls.update();
  draw(a);
}
function zoom(a, factor) {
  const delta = a.camera.position
    .clone()
    .sub(a.controls.target)
    .multiplyScalar(factor);
  const length = T.MathUtils.clamp(
    delta.length(),
    a.controls.minDistance,
    a.controls.maxDistance,
  );
  delta.setLength(length);
  a.camera.position.copy(a.controls.target).add(delta);
  a.controls.update();
  draw(a);
}
function selectHotspot(a, index) {
  const h = a.world.hotspots[index];
  if (!h) return;
  const insight = a.host.querySelector(".spatial-insight");
  insight.innerHTML = `<strong>${escape(h.label)}</strong><span>${escape(h.description)}</span>`;
  a.host
    .querySelectorAll("[data-hotspot]")
    .forEach((b) =>
      b.classList.toggle("selected", +b.dataset.hotspot === index),
    );
}
async function interactive(host) {
  if (
    active?.host === host &&
    active.world.step === +host.dataset.step &&
    active.world.kind === host.dataset.kind
  ) {
    stop();
    const initial = active.world.config[4][active.world.step];
    applyValue(active, initial, false);
    host.dataset.parameter = String(initial);
    host.dataset.state = "ready";
    return;
  }
  const revision = ++mountRevision;
  destroy();
  const r = await getStageRenderer();
  if (!host.isConnected || revision !== mountRevision) return;
  const kind = host.dataset.kind,
    step = +host.dataset.step,
    world = buildWorld(kind, step),
    cfg = world.config,
    scene = sceneFor(world, true),
    camera = makeCamera();
  r.shadowMap.enabled = true;
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.innerHTML = `<div class="spatial-stage-header"><div><span class="spatial-live-dot"></span> LABORATOIRE SPATIAL</div><span class="spatial-backend">${r.backend.isWebGPUBackend ? "WebGPU" : "WebGL 2"} · TEMPS RÉEL</span></div><div class="spatial-canvas-wrap"><div class="spatial-vignette"></div><div class="spatial-annotations">${world.hotspots.map((h, i) => `<button class="spatial-hotspot" data-hotspot="${i}" aria-label="Expliquer : ${escape(h.label)}"><span>${i + 1}</span>${escape(h.label)}</button>`).join("")}</div><div class="spatial-orbit-hint">Glissez horizontalement pour tourner · +/− pour zoomer</div><div class="spatial-view-tools"><button data-action="front" aria-label="Vue de face" title="Vue de face">Face</button><button data-action="reset" aria-label="Réinitialiser la vue" title="Réinitialiser la vue">↺</button><button data-action="zoom-in" aria-label="Rapprocher la vue">＋</button><button data-action="zoom-out" aria-label="Éloigner la vue">−</button></div></div><div class="spatial-control-deck"><div class="spatial-slider-label"><label>${escape(cfg[0])}</label><output class="spatial-value">${escape(formatValue(kind, world.value))}</output></div><input class="spatial-range" type="range" aria-label="${escape(cfg[0])}" min="${cfg[1]}" max="${cfg[2]}" step="${cfg[3]}" value="${world.value}"><div class="spatial-play-row"><button class="spatial-play" data-action="play" aria-pressed="false">▷ Lancer l’animation</button><span>Manipulez le réglage pour observer son effet.</span></div></div><div class="spatial-insight" aria-live="polite"><strong>À explorer</strong><span>Cliquez sur un repère numéroté pour comprendre le mécanisme.</span></div>`;
  const wrap = host.querySelector(".spatial-canvas-wrap"),
    canvas = r.domElement;
  wrap.prepend(canvas);
  canvas.className = "spatial-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    host.dataset.title +
      ". Scène 3D : flèches pour tourner, plus et moins pour zoomer, zéro pour réinitialiser.",
  );
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.05, 0);
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.minPolarAngle = 0.22;
  controls.maxPolarAngle = Math.PI / 2 - 0.015;
  controls.enableDamping = false;
  controls.enablePan = false;
  canvas.style.touchAction = "pan-y pinch-zoom";
  controls.update();
  const a = {
    host,
    world,
    scene,
    camera,
    controls,
    renderer: r,
    canvas,
    playing: false,
    raf: 0,
    frames: 0,
  };
  active = a;
  function resize() {
    if (active !== a) return;
    const w = wrap.clientWidth,
      h = wrap.clientHeight;
    if (w < 1 || h < 1) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    r.setSize(w, h, false);
    draw(a);
  }
  a.resizeObserver = new ResizeObserver(resize);
  a.resizeObserver.observe(wrap);
  a.visibilityObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) stop();
    else resize();
  });
  a.visibilityObserver.observe(host);
  controls.addEventListener("change", () => draw(a));
  controls.addEventListener("start", () => stop());
  function wheel(e) {
    e.stopImmediatePropagation();
  }
  canvas.addEventListener("wheel", wheel, { capture: true, passive: true });
  function keydown(e) {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
        "0",
        " ",
      ].includes(e.key)
    )
      e.preventDefault();
    else return;
    if (e.key === "ArrowLeft") orbit(a, 0.12, 0);
    if (e.key === "ArrowRight") orbit(a, -0.12, 0);
    if (e.key === "ArrowUp") orbit(a, 0, -0.1);
    if (e.key === "ArrowDown") orbit(a, 0, 0.1);
    if (e.key === "+" || e.key === "=") zoom(a, 0.88);
    if (e.key === "-") zoom(a, 1.12);
    if (e.key === "0") reset();
    if (e.key === " ") play();
  }
  canvas.addEventListener("keydown", keydown);
  function reset() {
    stop();
    camera.position.set(5, 3.2, 7);
    controls.target.set(0, 0.05, 0);
    controls.update();
    applyValue(a, cfg[4][step]);
    resize();
  }
  function play() {
    if (a.playing) {
      stop();
      return;
    }
    a.playing = true;
    a.host.dispatchEvent(new CustomEvent("spatial-play", { bubbles: true }));
    a.started = performance.now();
    host.querySelector('[data-action="play"]').textContent =
      "Ⅱ Mettre en pause";
    host
      .querySelector('[data-action="play"]')
      .setAttribute("aria-pressed", "true");
    const tick = (now) => {
      if (active !== a || !a.playing || document.hidden || !host.isConnected)
        return;
      const cycle = (now - a.started) / 5500,
        phase = (1 - Math.cos(cycle * Math.PI * 2)) / 2;
      let value = cfg[1] + (cfg[2] - cfg[1]) * phase;
      if (cfg[3] >= 1) value = Math.round(value / cfg[3]) * cfg[3];
      applyValue(a, value, false);
      a.raf = requestAnimationFrame(tick);
    };
    a.raf = requestAnimationFrame(tick);
  }
  host.querySelector(".spatial-range").oninput = (e) => {
    stop();
    applyValue(a, +e.target.value);
  };
  host
    .querySelectorAll("[data-hotspot]")
    .forEach((b) => (b.onclick = () => selectHotspot(a, +b.dataset.hotspot)));
  host.querySelector('[data-action="play"]').onclick = play;
  host.querySelector('[data-action="reset"]').onclick = reset;
  host.querySelector('[data-action="zoom-in"]').onclick = () => zoom(a, 0.85);
  host.querySelector('[data-action="zoom-out"]').onclick = () => zoom(a, 1.15);
  host.querySelector('[data-action="front"]').onclick = () => {
    stop();
    camera.position.set(0, 1, 8);
    controls.target.set(0, 0.05, 0);
    controls.update();
    draw(a);
  };
  const raycaster = new T.Raycaster(),
    pointer = new T.Vector2();
  let down;
  const onDown = (e) => (down = { x: e.clientX, y: e.clientY });
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(world.root, true)[0];
    if (hit && world.hotspots.length) {
      const pos = world.root.worldToLocal(hit.point.clone());
      let best = 0,
        distance = Infinity;
      world.hotspots.forEach((h, i) => {
        const d = h.position.distanceTo(pos);
        if (d < distance) {
          distance = d;
          best = i;
        }
      });
      selectHotspot(a, best);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  host._spatialCleanup = () => {
    canvas.removeEventListener("wheel", wheel, true);
    canvas.removeEventListener("keydown", keydown);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
  };
  try {
    await deadline(
      r.renderAsync(scene, camera),
      6000,
      "Le premier rendu 3D n’a pas répondu",
    );
  } catch (error) {
    if (active !== a || !host.isConnected) return;
    throw error;
  }
  if (active !== a) return;
  resize();
  host.dataset.state = "ready";
  host.dataset.renderer = r.backend.isWebGPUBackend ? "webgpu" : "webgl2";
  host.dataset.parameter = String(world.value);
  if (reducedMotion.matches)
    host.querySelector(".spatial-play-row>span").textContent =
      "Animation à la demande ; aucun mouvement automatique.";
}
export async function mount(host) {
  if (!configs[host.dataset.kind]) {
    unavailable(host);
    return;
  }
  if (host.dataset.mode === "interactive") {
    try {
      await interactive(host);
    } catch (error) {
      if (!host.isConnected) return;
      console.warn("FOCAL 3D : rendu indisponible", error.message);
      const failed = await stageRendererPromise?.catch(() => null);
      if (failed?.backend.isWebGPUBackend && !host.dataset.classicRetry) {
        host.dataset.classicRetry = "true";
        if (active?.host === host) destroy();
        failed.dispose();
        try {
          stageRendererPromise = Promise.resolve(classicRenderer());
          await interactive(host);
          return;
        } catch (retryError) {
          console.warn("FOCAL 3D : repli indisponible", retryError.message);
        }
      }
      if (active?.host === host) destroy();
      unavailable(host);
    }
  } else {
    queue = queue
      .then(() => preview(host))
      .catch((error) => {
        console.warn("FOCAL 3D : aperçu indisponible", error.message);
        if (host.isConnected) unavailable(host);
      });
    await queue;
  }
}
export function stats() {
  return {
    renderers,
    cache: cache.size,
    activeKind: active?.world.kind,
    frames: active?.frames || 0,
    playing: active?.playing || false,
    backend: active?.host.dataset.renderer,
    camera: active?.camera.position.toArray(),
  };
}
