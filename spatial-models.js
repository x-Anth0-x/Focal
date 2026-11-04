import * as T from "three";
import { RoundedBoxGeometry } from "./vendor/three/RoundedBoxGeometry.js";
const gold = 0xe9bd68,
  blue = 0x76b8c9,
  green = 0x9bbb9b,
  ink = 0x1b2b34,
  cream = 0xe0d3b7;
export const configs = {
  camera: ["Vue éclatée", 0, 1, 0.01, [0, 0.5, 1], ""],
  sensor: ["Signal collecté", 0.05, 1, 0.01, [0.2, 0.6, 1], ""],
  aperture: ["Ouverture", 1.4, 16, 0.1, [1.8, 5.6, 16], "f/"],
  shutter: ["Temps de pose", 0, 9, 1, [3, 6, 8], "pose"],
  iso: ["Sensibilité", 0, 6, 1, [0, 4, 6], "ISO"],
  triangle: ["Compensation", -3, 3, 0.1, [1, -1, 0], " IL"],
  modes: ["Priorité", 0, 2, 1, [0, 1, 2], "mode"],
  meter: ["Correction", -3, 3, 0.1, [-1, 0, 1], " IL"],
  histogram: ["Répartition des tons", 0.08, 0.92, 0.01, [0.18, 0.5, 0.83], ""],
  focus: ["Distance de mise au point", 1, 7, 0.1, [2, 4, 6], " m"],
  whitebalance: [
    "Balance des blancs",
    2000,
    9000,
    100,
    [2800, 5500, 8000],
    " K",
  ],
  workflow: ["Étape du flux", 0, 2, 1, [0, 1, 2], "step"],
  focal: ["Focale", 24, 135, 1, [24, 50, 135], " mm"],
  lenskit: ["Plage de focales", 24, 105, 1, [35, 70, 85], " mm"],
  depth: ["Ouverture", 1.4, 16, 0.1, [2, 5.6, 16], "f/"],
  perspective: ["Distance du point de vue", 1, 8, 0.1, [1.5, 5, 8], " m"],
  aberration: ["Ouverture", 1.4, 22, 0.1, [1.4, 5.6, 22], "f/"],
  kit: ["Éléments du kit", 1, 4, 1, [1, 3, 4], ""],
  composition: ["Placement du sujet", -2, 2, 0.05, [0, -1.2, 1.5], ""],
  lines: ["Direction des lignes", 0, 75, 1, [55, 0, 25], "°"],
  color: ["Teinte principale", 0, 360, 1, [130, 210, 30], "°"],
  negative: ["Place du sujet", 0.3, 1.4, 0.01, [1.4, 0.8, 0.35], ""],
  street: ["Instant observé", 0, 1, 0.01, [0, 0.5, 1], ""],
  story: ["Image dans la série", 0, 2, 1, [0, 1, 2], "step"],
  light: ["Direction de lumière", -85, 85, 1, [0, -65, 65], "°"],
  sun: ["Hauteur du soleil", 5, 75, 1, [10, 75, 12], "°"],
  backlight: ["Lumière sur le sujet", 0, 1, 0.01, [0, 0.35, 1], ""],
  flash: ["Instant de l’éclair", 0, 1, 0.01, [0.15, 0.5, 0.85], ""],
  portraitlight: ["Angle de la source", -85, 85, 1, [0, -45, 65], "°"],
  mixed: ["Équilibre des sources", 0, 1, 0.01, [0, 0.5, 1], ""],
  portrait: ["Orientation du visage", -35, 35, 1, [-15, 0, 25], "°"],
  family: ["Écart entre les plans", 0, 2, 0.05, [0, 1, 2], " m"],
  landscape: ["Séparation des plans", 0, 1, 0.01, [0.1, 0.55, 1], ""],
  sport: ["Temps de pose", 0, 9, 1, [8, 6, 3], "pose"],
  architecture: ["Inclinaison du boîtier", 0, 25, 0.5, [0, 22, 0], "°"],
  night: ["Temps de pose", 1, 30, 1, [2, 15, 30], " s"],
  raw: ["Exposition au développement", -2, 2, 0.1, [0, 1, -0.7], " IL"],
  curves: ["Contraste tonal", 0.5, 1.8, 0.01, [0.6, 1.4, 1.1], ""],
  mask: ["Rayon du masque", 0.2, 1.5, 0.01, [1.5, 0.7, 0.3], ""],
  ethics: ["Correction temporaire", 0, 1, 0.01, [0, 0.5, 1], ""],
  backup: ["Copies indépendantes", 1, 3, 1, [1, 2, 3], ""],
  export: ["Largeur de sortie", 512, 4096, 512, [1024, 3072, 4096], " px"],
  planning: ["Étape de préparation", 0, 2, 1, [0, 1, 2], "step"],
  direction: ["Orientation proposée", -35, 35, 1, [-25, 0, 25], "°"],
  portfolio: ["Images retenues", 3, 8, 1, [8, 6, 3], ""],
  critique: ["Point d’attention", 0, 2, 1, [0, 1, 2], "step"],
  rights: ["Périmètre convenu", 0, 2, 1, [0, 1, 2], "step"],
  project: ["Étape du projet", 0, 2, 1, [0, 1, 2], "step"],
};
Object.assign(configs, {
  diffraction: ["Ouverture", 1.4, 32, 0.1, [2, 8, 22], "f/"],
  bokeh: ["Ouverture", 1.4, 16, 0.1, [1.8, 5.6, 11], "f/"],
  dynamic: ["Écart de lumière", 2, 14, 0.1, [3, 8, 14], " IL"],
  hyperfocal: ["Distance de mise au point", 1, 15, 0.1, [3, 7, 12], " m"],
  chromatic: ["Décalage des composantes", 0, 1, 0.01, [0, 0.5, 1], ""],
});
export const times = [
  "1 s",
  "1/4 s",
  "1/15 s",
  "1/30 s",
  "1/60 s",
  "1/125 s",
  "1/250 s",
  "1/500 s",
  "1/1000 s",
  "1/2000 s",
];
export function formatValue(kind, value) {
  const c = configs[kind];
  if (c[5] === "f/") return "f/" + Number(value).toFixed(1).replace(".", ",");
  if (c[5] === "pose") return times[Math.round(value)];
  if (c[5] === "ISO") return "ISO " + 100 * 2 ** Math.round(value);
  if (c[5] === "mode") return ["A / Av", "S / Tv", "M"][Math.round(value)];
  if (c[5] === "step") return "Étape " + (Math.round(value) + 1);
  return (
    Number(value).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + c[5]
  );
}
function mat(color, options = {}) {
  return new T.MeshPhysicalMaterial({
    color,
    roughness: 0.36,
    metalness: 0.34,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    ...options,
  });
}
function mesh(g, m, parent, x = 0, y = 0, z = 0) {
  const o = new T.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
function box(parent, x, y, z, w, h, d, m) {
  return mesh(
    new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.12),
    m,
    parent,
    x,
    y,
    z,
  );
}
function sphere(parent, x, y, z, r, m, scale) {
  const o = mesh(new T.SphereGeometry(r, 24, 16), m, parent, x, y, z);
  if (scale) o.scale.set(...scale);
  return o;
}
function tube(parent, points, color = gold, r = 0.012) {
  return mesh(
    new T.TubeGeometry(
      new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
      36,
      r,
      6,
      false,
    ),
    mat(color, { emissive: color, emissiveIntensity: 0.35 }),
    parent,
  );
}
function ring(parent, x, y, z, r, m, width = 0.025) {
  return mesh(new T.TorusGeometry(r, width, 10, 64), m, parent, x, y, z);
}
function cylinder(parent, x, y, z, r, h, m) {
  return mesh(new T.CylinderGeometry(r, r, h, 48), m, parent, x, y, z);
}
function pointer(parent, a, b, color = gold) {
  const origin = new T.Vector3(...a),
    end = new T.Vector3(...b);
  parent.add(
    new T.ArrowHelper(
      end.clone().sub(origin).normalize(),
      origin,
      origin.distanceTo(end),
      color,
      0.14,
      0.06,
    ),
  );
}
function camera(parent, x = 0, y = 0, z = 0, size = 1) {
  const g = new T.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(size);
  parent.add(g);
  const body = mat(0x28343d, { roughness: 0.3, metalness: 0.75 }),
    metal = mat(0xaeb8bb, { metalness: 0.85, roughness: 0.26 });
  box(g, 0, 0, 0, 1.7, 1.1, 0.65, body);
  box(g, 0, 0.45, 0.01, 1.66, 0.22, 0.69, metal);
  box(
    g,
    -0.66,
    -0.05,
    0.38,
    0.32,
    0.85,
    0.16,
    mat(0x141e24, { roughness: 0.9 }),
  );
  box(g, -0.1, 0.66, 0.02, 0.55, 0.22, 0.5, body);
  cylinder(g, 0.53, 0.65, 0.02, 0.13, 0.13, metal);
  const lens = new T.Group();
  g.add(lens);
  const barrel = cylinder(lens, 0, 0, 0.72, 0.55, 1.0, body);
  barrel.rotation.x = Math.PI / 2;
  ring(lens, 0, 0, 1.21, 0.48, metal, 0.035);
  ring(lens, 0, 0, 1.23, 0.4, mat(0x101d22), 0.045);
  sphere(
    lens,
    0,
    0,
    1.2,
    0.39,
    mat(0x397d89, { roughness: 0.1, metalness: 0.58, clearcoat: 1 }),
    [1, 1, 0.12],
  );
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    box(
      lens,
      Math.cos(a) * 0.553,
      Math.sin(a) * 0.553,
      0.7,
      0.02,
      0.02,
      0.42,
      metal,
    );
  }
  return { group: g, lens };
}
function bust(parent, x = 0, y = 0, z = 0, size = 1, color = cream) {
  const g = new T.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(size);
  parent.add(g);
  const m = mat(color, { metalness: 0.05, roughness: 0.52 });
  const torso = sphere(g, 0, -0.35, 0, 0.65, m, [1.1, 0.9, 0.65]);
  cylinder(g, 0, 0.12, 0, 0.18, 0.3, m);
  const head = new T.Group();
  head.position.y = 0.68;
  g.add(head);
  sphere(head, 0, 0, 0, 0.4, m, [0.86, 1.2, 0.85]);
  sphere(head, 0, -0.02, 0.35, 0.1, m, [0.6, 1, 0.8]);
  sphere(head, -0.14, 0.08, 0.3, 0.029, mat(0x243a43));
  sphere(head, 0.14, 0.08, 0.3, 0.029, mat(0x243a43));
  sphere(g, 0, -0.82, 0, 0.62, mat(0x657b7f), [1.1, 0.12, 0.7]);
  return { group: g, head, torso };
}
function card(parent, x, y, z, color = cream, w = 1.1, h = 1.45) {
  const g = new T.Group();
  g.position.set(x, y, z);
  parent.add(g);
  box(g, 0, 0, 0, w, h, 0.08, mat(color, { metalness: 0.15, roughness: 0.5 }));
  box(g, 0, 0.12, 0.05, w * 0.87, h * 0.66, 0.015, mat(0x3c6770));
  for (let i = 0; i < 2; i++)
    box(
      g,
      -0.1,
      -h * 0.35 + i * 0.085,
      0.055,
      w * 0.6,
      0.018,
      0.012,
      mat(0x6b7e7d),
    );
  return g;
}
function tree(parent, x, z, scale = 1) {
  const g = new T.Group();
  g.position.set(x, -1.05, z);
  g.scale.setScalar(scale);
  parent.add(g);
  cylinder(g, 0, 0.36, 0, 0.045, 0.7, mat(0x705c43));
  for (let i = 0; i < 3; i++)
    mesh(
      new T.ConeGeometry(0.3 - i * 0.05, 0.65, 7),
      mat(i % 2 ? 0x557d70 : 0x456b61),
      g,
      0,
      0.65 + i * 0.22,
      0,
    );
  return g;
}
function irisBlade(parent, index, material) {
  const a = (index * Math.PI * 2) / 9,
    b = ((index + 1) * Math.PI * 2) / 9,
    points = [{ x: Math.cos(a), y: Math.sin(a), inner: true }];
  for (let i = 0; i <= 10; i++) {
    const angle = a + 0.15 + ((b - a) * i) / 10;
    points.push({
      x: Math.cos(angle) * 1.26,
      y: Math.sin(angle) * 1.26,
      inner: false,
    });
  }
  points.push({ x: Math.cos(b), y: Math.sin(b), inner: true });
  const vertices = [],
    flags = [];
  const push = (point, z) => {
    vertices.push(point.x, point.y, z);
    flags.push(point.inner);
  };
  const tri = (p, q, r, z) => {
    push(p, z);
    push(q, z);
    push(r, z);
  };
  for (let i = 1; i < points.length - 1; i++) {
    tri(points[0], points[i], points[i + 1], 0.045);
    tri(points[0], points[i + 1], points[i], 0);
  }
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      q = points[(i + 1) % points.length];
    push(p, 0);
    push(q, 0);
    push(q, 0.045);
    push(p, 0);
    push(q, 0.045);
    push(p, 0.045);
  }
  const base = new Float32Array(vertices),
    geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  const blade = mesh(geometry, material, parent, 0, 0.2, 0.025 + index * 0.004);
  return {
    set(radius) {
      const array = geometry.attributes.position.array;
      for (let i = 0; i < flags.length; i++)
        if (flags[i]) {
          array[i * 3] = base[i * 3] * radius;
          array[i * 3 + 1] = base[i * 3 + 1] * radius;
        }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    },
  };
}
function landscape(parent, separation = 0.5) {
  const g = new T.Group();
  parent.add(g);
  for (let i = 0; i < 5; i++) {
    const o = mesh(
      new T.ConeGeometry(0.8 + i * 0.12, 1.8 + i * 0.18, 5),
      mat([0x546d77, 0x6b8083, 0x86928a][i % 3], {
        roughness: 0.8,
        metalness: 0.1,
      }),
      g,
      -2 + i,
      0,
      -1.5 - (i % 2) * separation,
    );
    o.rotation.y = 0.7;
    sphere(
      g,
      -2 + i,
      0.83 + i * 0.09,
      -1.5 - (i % 2) * separation,
      0.2,
      mat(cream),
      [1, 0.4, 1],
    );
  }
  box(
    g,
    0,
    -0.98,
    -0.5,
    5,
    0.05,
    3,
    mat(0x2d646e, { roughness: 0.13, metalness: 0.6 }),
  );
  tree(g, -1.9, 0.5, 0.8);
  tree(g, 1.8, 0.8, 1.1);
  return g;
}
function kelvin(k) {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b =
    t >= 66
      ? 255
      : t <= 19
        ? 0
        : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return new T.Color().setRGB(
    T.MathUtils.clamp(r, 0, 255) / 255,
    T.MathUtils.clamp(g, 0, 255) / 255,
    T.MathUtils.clamp(b, 0, 255) / 255,
  );
}
export function buildWorld(kind, step = 0) {
  const root = new T.Group(),
    objects = [],
    materials = [],
    hotspots = [];
  let update = () => {};
  const M = {
    gold: mat(gold),
    blue: mat(blue),
    ink: mat(ink),
    green: mat(green),
    cream: mat(cream, { metalness: 0.08, roughness: 0.5 }),
    steel: mat(0xa6b7c0, { metalness: 0.8, roughness: 0.22 }),
  };
  const addHot = (label, position, description) =>
    hotspots.push({ label, position: new T.Vector3(...position), description });
  const cfg = configs[kind] || configs.camera;
  let current = cfg[4][step] ?? cfg[4][0];
  switch (kind) {
    case "camera":
    case "kit":
    case "lenskit": {
      const c = camera(root, -0.3, 0, 0, 1.35),
        sensor = box(root, -0.4, 0, -0.65, 1, 0.66, 0.05, M.blue);
      const items = [
        cylinder(root, 1.9, -0.65, -0.15, 0.3, 0.75, M.ink),
        box(root, 1.8, -0.8, 1.1, 0.5, 0.35, 0.1, M.gold),
        box(root, -1.8, -0.65, 0.1, 0.6, 0.7, 0.4, M.ink),
      ];
      addHot(
        "Objectif",
        [-0.3, 0, 1.7],
        "Les lentilles forment l’image et la pupille d’entrée détermine l’ouverture.",
      );
      addHot(
        "Capteur",
        [-0.4, 0, -0.65],
        "Le capteur reçoit l’image projetée par l’objectif.",
      );
      addHot(
        "Commande",
        [0.4, 0.9, 0],
        "Le déclencheur commande la prise de vue selon la configuration du boîtier.",
      );
      update = (v) => {
        const e =
          kind === "camera" ? v : kind === "lenskit" ? (v - 24) / 81 : 0.12;
        c.lens.position.z = e * 1.5;
        sensor.position.z = -0.65 - e;
        items.forEach(
          (o, i) => (o.visible = kind === "kit" ? i < v - 1 : false),
        );
        if (kind === "lenskit") c.lens.scale.z = 0.7 + e * 0.9;
      };
      break;
    }
    case "sensor": {
      const c = camera(root, -1.75, 0, -0.1, 0.7);
      c.group.rotation.y = Math.PI / 2;
      const grid = new T.InstancedMesh(
        new T.BoxGeometry(0.19, 0.19, 0.08),
        M.cream,
        144,
      );
      root.add(grid);
      const matrix = new T.Matrix4(),
        col = new T.Color();
      for (let i = 0; i < 144; i++) {
        matrix.makeTranslation(
          1 + ((i % 12) - 5.5) * 0.205,
          (Math.floor(i / 12) - 5.5) * 0.205,
          0,
        );
        grid.setMatrixAt(i, matrix);
      }
      grid.rotation.y = -0.4;
      for (let i = 0; i < 5; i++)
        tube(
          root,
          [
            [-1.1, (i - 2) * 0.22, 0.1],
            [0, 0, 0.1],
            [0.8, (2 - i) * 0.35, 0],
          ],
          gold,
          0.008,
        );
      addHot(
        "Photosites",
        [1, 0.9, 0],
        "Chaque photosite collecte un signal ; saturation et traitement influencent le résultat.",
      );
      update = (v) => {
        for (let i = 0; i < 144; i++) {
          col.set([0xb67c64, 0x71967e, 0x71967e, 0x547f9a][i % 4]);
          col.multiplyScalar(0.25 + v * (i % 7 === 0 ? 1.8 : 1));
          grid.setColorAt(i, col);
        }
        grid.instanceColor.needsUpdate = true;
      };
      break;
    }
    case "aperture":
    case "depth":
    case "aberration":
    case "diffraction":
    case "bokeh": {
      const iris = new T.Group();
      iris.rotation.x = -0.12;
      root.add(iris);
      ring(iris, 0, 0.2, 0, 1.45, M.steel, 0.14);
      ring(iris, 0, 0.2, 0.08, 1.24, M.ink, 0.12);
      const blades = new T.Group();
      iris.add(blades);
      const rayGroup = new T.Group();
      root.add(rayGroup);
      const head = bust(root, 2, -0.45, -1, 0.65),
        waves = [];
      head.group.visible = ["depth", "bokeh"].includes(kind);
      const zone = box(
        root,
        2,
        -0.25,
        -1,
        1,
        1.5,
        1,
        mat(green, {
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
          roughness: 0.8,
          metalness: 0,
        }),
      );
      zone.visible = kind === "depth";
      zone.castShadow = false;
      if (kind === "diffraction")
        for (let i = 0; i < 5; i++)
          waves.push(
            ring(
              root,
              0,
              0.2,
              -0.6 - i * 0.3,
              0.1 + i * 0.08,
              mat(blue, {
                transparent: true,
                opacity: 0.55 - i * 0.08,
                emissive: blue,
                emissiveIntensity: 0.35,
              }),
              0.012,
            ),
          );
      if (kind === "bokeh")
        for (let i = 0; i < 8; i++)
          waves.push(
            sphere(
              root,
              1 + Math.sin(i * 15) * 1.8,
              0.3 + Math.cos(i * 23),
              -1.9 - (i % 3) * 0.2,
              0.16,
              mat(gold, {
                transparent: true,
                opacity: 0.3,
                emissive: gold,
                emissiveIntensity: 0.5,
              }),
              [1, 1, 0.2],
            ),
          );
      for (let i = 0; i < 9; i++) {
        const a = (i * Math.PI * 2) / 9;
        const ray = tube(
          rayGroup,
          [
            [Math.cos(a) * 1.1, 0.2 + Math.sin(a) * 1.1, 2.1],
            [0, 0.2, 0],
            [0, 0.2, -2],
          ],
          blue,
          0.007,
        );
        objects.push(ray);
      }
      addHot(
        "Pupille d’entrée",
        [0, 0.2, 0.18],
        "À focale fixée, le nombre f augmente quand le diamètre de la pupille diminue.",
      );
      addHot(
        "Rayons illustrés",
        [0.7, 0.8, 1.4],
        "Le trajet est schématique ; la scène ne calcule pas une optique complète.",
      );
      const bladeModels = Array.from({ length: 9 }, (_, i) =>
        irisBlade(blades, i, i % 2 ? M.steel : M.ink),
      );
      update = (v) => {
        const radius = (1.14 * 1.4) / v;
        bladeModels.forEach((b) => b.set(radius));
        rayGroup.scale.x = 0.45 + radius * 0.45;
        rayGroup.scale.y = 0.45 + radius * 0.45;
        head.group.scale.setScalar(0.65);
        if (kind === "depth") {
          const H = (2500 / (v * 0.03) + 50) / 1000,
            near = (H * 2) / (H + 2 - 0.05),
            far = 2 >= H ? 12 : (H * 2) / (H - 2 + 0.05);
          zone.scale.z = Math.min(4, (far - near) * 2.5);
          zone.position.z = -1 + (2 - (near + far) / 2) * 2.5;
        }
        waves.forEach((w, i) =>
          w.scale.setScalar(
            kind === "diffraction" ? 0.35 + v * 0.12 : 0.15 + 3 / v,
          ),
        );
      };
      break;
    }
    case "shutter":
    case "sport":
    case "street": {
      camera(root, -2, -0.48, 1, 0.65).group.rotation.y = 0.65;
      const subject = bust(root, 0, -0.2, 0, 0.9, M.gold.color),
        ghosts = [];
      for (let i = 0; i < 5; i++) {
        const g = bust(root, -0.35 - i * 0.32, -0.2, 0, 0.9, blue).group;
        g.traverse((o) => {
          if (o.isMesh) {
            o.material = o.material.clone();
            o.material.transparent = true;
            o.material.opacity = 0.05 + i * 0.035;
          }
        });
        ghosts.push(g);
      }
      const track = ring(root, 0, -1.01, 0, 2.2, M.steel, 0.01);
      track.rotation.x = -Math.PI / 2;
      for (let i = 0; i < 5; i++) tree(root, -2 + i, -1.7, 0.7);
      addHot(
        "Sujet",
        [0, 0.9, 0],
        "Sa position pendant la collecte détermine sa trace dans l’image.",
      );
      addHot(
        "Trajectoire",
        [-1, -0.9, 0.1],
        "Pose courte, suivi et filé correspondent à des choix différents.",
      );
      update = (v) => {
        const motion = kind === "street" ? v : 1 - v / 9;
        subject.group.position.x = kind === "street" ? (v - 0.5) * 3 : 0.6;
        ghosts.forEach((g, i) => {
          g.visible = kind !== "street" && i < motion * 6;
          g.position.x = subject.group.position.x - (i + 1) * motion * 0.5;
        });
      };
      break;
    }
    case "iso":
    case "meter":
    case "triangle":
    case "histogram":
    case "raw":
    case "curves":
    case "dynamic": {
      if (kind === "triangle") {
        const points = [
          [-1.6, -0.5, 0],
          [1.6, -0.5, 0],
          [0, 1.5, -0.7],
        ];
        points.forEach((p, i) => {
          sphere(root, ...p, 0.2, [M.blue, M.gold, M.green][i]);
          tube(root, [p, points[(i + 1) % 3]], i === 0 ? gold : blue, 0.025);
        });
        const photon = sphere(root, 0, 0, 0, 0.35, M.cream);
        update = (v) => {
          photon.scale.setScalar(0.7 + v * 0.1);
          photon.position.y = v * 0.22;
        };
        addHot(
          "Compromis",
          [0, 0.2, 0],
          "Même luminosité apparente, mais des effets différents sur mouvement, netteté et bruit.",
        );
      } else if (
        kind === "histogram" ||
        kind === "curves" ||
        kind === "dynamic"
      ) {
        const bars = [];
        for (let i = 0; i < 32; i++) {
          const b = box(
            root,
            (i - 15.5) * 0.13,
            -0.75,
            0,
            0.095,
            0.2,
            0.35,
            mat(new T.Color().setHSL(0.12 + i * 0.001, 0.35, 0.35 + i * 0.009)),
          );
          bars.push(b);
        }
        pointer(root, [-2.3, -0.95, 0.3], [2.5, -0.95, 0.3], 0x79959f);
        addHot(
          "Valeurs tonales",
          [0, 0.8, 0.2],
          "L’histogramme compte des valeurs ; il ne situe pas les objets dans le cadre.",
        );
        update = (v) => {
          const center = kind === "curves" || kind === "dynamic" ? 0.5 : v,
            contrast = kind === "curves" ? v : 1;
          bars.forEach((b, i) => {
            const t = i / 31,
              spread = kind === "dynamic" ? (v / 14) * 0.45 : 0;
            const gauss = (c, w) => Math.exp(-Math.pow((t - c) / w, 2));
            const h =
              0.12 +
              (kind === "dynamic"
                ? 1.7 * (gauss(0.5 - spread, 0.12) + gauss(0.5 + spread, 0.12))
                : 2.1 *
                  gauss(center, kind === "curves" ? 0.16 * contrast : 0.2));
            b.scale.y = h / 0.2;
            b.position.y = -0.95 + h / 2;
          });
        };
      } else {
        const picture = landscape(root, 0.45),
          noise = [];
        if (kind === "iso")
          for (let i = 0; i < 160; i++)
            noise.push(
              sphere(
                root,
                Math.sin(i * 23) * 2,
                Math.sin(i * 39) * 1.1,
                0.5 + Math.cos(i * 19),
                0.023,
                i % 2 ? M.cream : M.ink,
              ),
            );
        const plane = box(
          root,
          0,
          -0.1,
          1.8,
          4,
          2.2,
          0.03,
          mat(0xe7c983, {
            transparent: true,
            opacity: 0,
            roughness: 1,
            metalness: 0,
          }),
        );
        addHot(
          "Rendu",
          [0, 0.8, 1.8],
          kind === "iso"
            ? "Le bruit est illustratif. L’ISO n’augmente pas la lumière reçue."
            : "Éclaircir le rendu ne recrée pas les informations saturées à la capture.",
        );
        update = (v) => {
          if (kind === "iso") {
            noise.forEach((o, i) => (o.visible = i < (v / 6) * 160));
            plane.material.opacity = v * 0.025;
          } else plane.material.opacity = Math.max(0, ((v + 3) / 6) * 0.35);
          picture.position.z = 0;
        };
      }
      break;
    }
    case "modes": {
      const c = camera(root, 0, -0.25, 0, 1.4);
      const dial = cylinder(root, 0.6, 1, 0, 0.44, 0.16, M.steel);
      const points = [];
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        points.push(
          sphere(
            root,
            0.6 + Math.cos(a) * 0.31,
            1.12,
            Math.sin(a) * 0.31,
            0.065,
            [M.gold, M.blue, M.green][i],
          ),
        );
      }
      update = (v) => {
        dial.rotation.y = (v * Math.PI * 2) / 3;
        points.forEach((p, i) =>
          p.scale.setScalar(i === Math.round(v) ? 1.5 : 0.6),
        );
      };
      addHot(
        "Sélecteur",
        [0.6, 1.15, 0],
        "A : ouverture, S : durée, M : ouverture et durée ; l’ISO automatique peut rester actif.",
      );
      break;
    }
    case "focus":
    case "hyperfocal":
    case "focal":
    case "perspective":
    case "composition":
    case "negative": {
      const c = camera(root, -2, -0.45, 1.3, 0.6);
      c.group.rotation.y = 0.8;
      const subject = bust(root, 0, 0, 0.25, 0.95),
        background = bust(root, 1.7, -0.2, -1.4, 0.75, blue);
      const plane = box(
        root,
        0,
        0.2,
        0,
        3.6,
        2.1,
        0.018,
        mat(blue, {
          transparent: true,
          opacity: 0.07,
          depthWrite: false,
          metalness: 0,
        }),
      );
      const rim = ring(root, 0, 0.2, 0, 1.25, M.gold, 0.012);
      rim.scale.x = 1.45;
      addHot(
        "Sujet",
        [0, 0.8, 0.25],
        "Le cadrage, la zone nette et la place du sujet répondent à des choix distincts.",
      );
      addHot(
        "Point de vue",
        [-2, 0.3, 1.3],
        "Se déplacer change les rapports entre les plans. Changer seulement la focale change le champ.",
      );
      update = (v) => {
        if (kind === "hyperfocal") {
          const H = 10.4666667,
            near = (H * v) / (H + v - 0.05),
            far = v >= H ? 20 : (H * v) / (H - v + 0.05);
          plane.position.z = 2 - v * 0.2;
          rim.position.z = plane.position.z;
          plane.scale.z = Math.min(8, far - near);
          background.group.position.z = 2 - Math.min(far, 15) * 0.2;
          subject.group.position.z = 2 - v * 0.2;
        } else if (kind === "focus") {
          plane.position.z = (v - 4) * 0.4;
          rim.position.z = plane.position.z;
        } else if (kind === "focal") {
          const scale = 50 / v;
          plane.scale.set(scale, scale, 1);
          rim.scale.set(scale * 1.45, scale, 1);
        } else if (kind === "perspective") {
          background.group.scale.setScalar(0.75);
          c.group.position.z = 1 + v * 0.2;
        } else if (kind === "composition") {
          subject.group.position.x = v;
          rim.position.x = v;
        } else {
          subject.group.scale.setScalar(v * 0.8);
          background.group.visible = step === 0;
          plane.scale.x = 1.5;
        }
      };
      break;
    }
    case "whitebalance":
    case "mixed":
    case "color": {
      const head = bust(root, 0, 0, 0, 1.1),
        plates = [];
      for (let i = 0; i < 7; i++)
        plates.push(
          box(
            root,
            -2.1 + i * 0.7,
            -0.8,
            -0.7,
            0.5,
            0.3,
            0.7,
            mat(new T.Color().setHSL(i / 7, 0.4, 0.48)),
          ),
        );
      const left = new T.PointLight(0xffaa60, 12, 8),
        right = new T.PointLight(0x80bbff, 12, 8);
      left.position.set(-2, 2, 1);
      right.position.set(2, 2, 1);
      root.add(left, right);
      addHot(
        "Deux couleurs de lumière",
        [-1.7, 1.4, 1],
        "La balance des blancs transforme l’interprétation, sans modifier physiquement la source.",
      );
      update = (v) => {
        if (kind === "whitebalance") {
          const warmth = (v - 2000) / 7000;
          head.group.traverse((o) => {
            if (o.isMesh && o.material.color)
              o.material.color.copy(
                new T.Color(0x9bbad3).lerp(new T.Color(0xeab677), warmth),
              );
          });
        } else if (kind === "mixed") {
          left.intensity = 3 + v * 20;
          right.intensity = 23 - v * 20;
        } else
          plates.forEach((p, i) =>
            p.material.color.setHSL((v / 360 + i * 0.04) % 1, 0.45, 0.46),
          );
      };
      break;
    }
    case "workflow":
    case "planning":
    case "rights":
    case "story":
    case "project": {
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const c = card(
          root,
          (i - 1) * 1.6,
          0,
          (i % 2) * -0.4,
          i === 0 ? gold : cream,
        );
        c.rotation.y = (i - 1) * -0.15;
        cards.push(c);
        if (i < 2)
          pointer(
            root,
            [(i - 1) * 1.6 + 0.6, 0, 0],
            [i * 1.6 - 0.65, 0, 0],
            blue,
          );
      }
      addHot(
        "Étape 1",
        [-1.6, 0.7, 0],
        kind === "rights"
          ? "Définir la prestation et les usages convenus."
          : "Partir d’une source ou d’une intention claire.",
      );
      addHot(
        "Étape 2",
        [0, 0.7, -0.4],
        "Documenter les décisions et les transformations.",
      );
      addHot(
        "Étape 3",
        [1.6, 0.7, 0],
        "Contrôler le résultat et la destination.",
      );
      update = (v) => {
        cards.forEach((c, i) => {
          c.position.y = i === Math.round(v) ? 0.28 : 0;
          c.rotation.y = (i - 1) * -0.15 + (i === Math.round(v) ? 0.08 : 0);
          c.scale.setScalar(i === Math.round(v) ? 1.08 : 0.9);
        });
      };
      break;
    }
    case "lines":
    case "architecture": {
      const buildings = new T.Group();
      root.add(buildings);
      for (let i = 0; i < 4; i++) {
        const h = 1.4 + (i % 2) * 0.8;
        box(
          buildings,
          (i - 1.5) * 1.15,
          h / 2 - 1,
          -0.5,
          0.8,
          h,
          0.8,
          i % 2 ? M.ink : M.steel,
        );
        for (let j = 0; j < 4; j++)
          for (let k = 0; k < 2; k++)
            box(
              buildings,
              (i - 1.5) * 1.15 + (k - 0.5) * 0.3,
              j * 0.34 - 0.55,
              -0.085,
              0.17,
              0.16,
              0.025,
              M.gold,
            );
      }
      const rails = new T.Group();
      root.add(rails);
      for (let i = 0; i < 4; i++)
        tube(
          rails,
          [
            [-2 + i * 0.9, -1, 2],
            [-1 + i * 0.5, -1, -1.7],
          ],
          gold,
          0.012,
        );
      addHot(
        "Verticales",
        [0, 0.8, -0.1],
        "Incliner le boîtier crée une convergence dans l’image ; le bâtiment ne se déforme pas.",
      );
      update = (v) => {
        if (kind === "architecture")
          root.rotation.x = -T.MathUtils.degToRad(v) * 0.45;
        else rails.rotation.y = T.MathUtils.degToRad(v);
      };
      break;
    }
    case "light":
    case "portraitlight":
    case "portrait":
    case "direction":
    case "backlight":
    case "ethics":
    case "mask": {
      const subject = bust(root, 0, 0, 0, 1.15),
        lamp = new T.Group();
      root.add(lamp);
      box(lamp, 0, 0, 0, 0.7, 0.9, 0.08, M.cream);
      const source = new T.SpotLight(0xffdca0, 32, 12, Math.PI / 5, 0.7, 1.4);
      source.castShadow = true;
      source.shadow.mapSize.set(512, 512);
      root.add(source, source.target);
      source.target.position.set(0, 0.4, 0);
      const stand = cylinder(lamp, 0, -0.7, 0, 0.025, 1.4, M.steel);
      const halo = ring(
        root,
        0,
        0.68,
        0.38,
        0.5,
        mat(blue, { transparent: true, opacity: 0.65 }),
        0.02,
      );
      halo.visible = kind === "mask";
      const marks = [];
      if (kind === "ethics")
        for (let i = 0; i < 8; i++)
          marks.push(
            sphere(
              subject.head,
              Math.cos(i * 5) * 0.23,
              Math.sin(i * 4) * 0.22,
              0.33,
              0.018,
              mat(0x85624b),
            ),
          );
      addHot(
        "Sujet",
        [0, 1.15, 0.2],
        "Une maquette permet de lire les volumes sans prétendre reproduire une peau réelle.",
      );
      addHot(
        "Source",
        [-1.7, 1.6, 1],
        "Sa direction et sa taille apparente façonnent les ombres.",
      );
      update = (v) => {
        let angle = T.MathUtils.degToRad(
          ["portrait", "direction"].includes(kind)
            ? -45
            : ["backlight", "ethics", "mask"].includes(kind)
              ? -45
              : v,
        );
        lamp.position.set(Math.sin(angle) * 2.5, 1.7, Math.cos(angle) * 2.5);
        lamp.lookAt(0, 0.4, 0);
        source.position.copy(lamp.position);
        if (kind === "portrait" || kind === "direction")
          subject.head.rotation.y = T.MathUtils.degToRad(v);
        if (kind === "backlight") source.intensity = 5 + v * 45;
        if (kind === "mask") {
          halo.scale.setScalar(v);
          subject.head.scale.setScalar(1);
        }
        if (kind === "ethics") marks.forEach((m, i) => (m.visible = i > v * 8));
      };
      break;
    }
    case "sun":
    case "landscape":
    case "night": {
      const land = landscape(root, 0.5),
        basePositions = land.children.map((o) => o.position.z),
        sun = sphere(
          root,
          0,
          2,
          -2,
          0.19,
          mat(gold, { emissive: gold, emissiveIntensity: 2 }),
        );
      const rays = [];
      if (kind === "night")
        for (let i = 0; i < 44; i++) {
          const x = Math.sin(i * 32) * 3,
            y = 1.1 + Math.abs(Math.sin(i * 19)) * 1.3,
            z = -1.8 - Math.cos(i * 13) * 1.2;
          const ray = tube(
            root,
            [
              [0, 0, 0],
              [0.15, 0.03, 0],
            ],
            cream,
            0.008,
          );
          ray.position.set(x, y, z);
          rays.push(ray);
        }
      const lamp = new T.DirectionalLight(0xffdba6, 2.5);
      root.add(lamp);
      addHot(
        kind === "night" ? "Trajectoire apparente" : "Lumière et profondeur",
        [0, 1.4, -1.7],
        kind === "night"
          ? "Sans suivi, les étoiles se déplacent dans le cadre pendant la collecte."
          : "L’organisation des plans et l’angle de lumière participent à la lecture.",
      );
      update = (v) => {
        if (kind === "sun") {
          const a = T.MathUtils.degToRad(v);
          sun.position.set(Math.cos(a) * 3, Math.sin(a) * 3, -1.5);
          lamp.position.copy(sun.position);
        } else if (kind === "night") {
          sun.visible = false;
          rays.forEach((r) => (r.scale.x = v / 10));
        } else
          land.children.forEach((o, i) => {
            o.position.z = basePositions[i] + (v - 0.5) * 0.7 * (i % 3);
          });
      };
      break;
    }
    case "flash": {
      camera(root, -1.8, -0.3, 0, 0.8).group.rotation.y = 0.7;
      const shutter = box(root, 0, 0.2, 0, 0.08, 2, 1.5, M.steel);
      const pulse = sphere(
        root,
        -1.6,
        1.15,
        0.45,
        0.2,
        mat(gold, { emissive: gold, emissiveIntensity: 1 }),
      );
      const bars = [];
      for (let i = 0; i < 12; i++)
        bars.push(box(root, -2 + i * 0.35, -0.9, 1, 0.12, 0.1, 0.15, M.blue));
      addHot(
        "Synchronisation",
        [0, 0.8, 0],
        "L’éclair doit coïncider avec une ouverture compatible de l’obturateur ; le HSS est un autre régime.",
      );
      update = (v) => {
        shutter.position.x = (v - 0.5) * 2;
        pulse.scale.setScalar(0.4 + Math.sin(v * Math.PI) * 1.3);
        bars.forEach((o, i) => {
          o.scale.y = i / 12 < v ? 4 : 1;
        });
      };
      break;
    }
    case "family": {
      const people = [
        bust(root, -1.3, 0, 0, 0.9),
        bust(root, 0, -0.35, 0.3, 0.65, gold),
        bust(root, 1.3, 0, 0, 0.9, blue),
      ];
      const plane = box(
        root,
        0,
        0.1,
        0.1,
        4,
        2.3,
        0.015,
        mat(green, { transparent: true, opacity: 0.08, depthWrite: false }),
      );
      addHot(
        "Plans des visages",
        [0, 0.8, 0.1],
        "Rapprocher les visages d’un même plan réduit l’étendue de profondeur nécessaire.",
      );
      update = (v) => {
        people[1].group.position.z = 0.2 + v * 0.8;
        people[2].group.position.z = -v * 0.55;
        plane.position.z = 0.1;
      };
      break;
    }
    case "backup": {
      const disks = [];
      for (let i = 0; i < 3; i++) {
        const g = new T.Group();
        root.add(g);
        g.position.set((i - 1) * 1.6, 0, (i % 2) * -0.4);
        for (let j = 0; j < 3; j++) {
          cylinder(
            g,
            0,
            -0.35 + j * 0.22,
            0,
            0.55,
            0.16,
            i === 0 ? M.steel : M.blue,
          );
          sphere(g, 0.25, -0.35 + j * 0.22, 0.46, 0.035, M.gold);
        }
        disks.push(g);
        if (i < 2)
          tube(
            root,
            [
              [(i - 1) * 1.6 + 0.5, 0, 0],
              [i * 1.6 - 0.5, 0, 0],
            ],
            gold,
            0.016,
          );
      }
      addHot(
        "Copies indépendantes",
        [0, 0.7, -0.4],
        "Une synchronisation peut propager les erreurs ; vérifiez réellement une restauration.",
      );
      update = (v) => disks.forEach((g, i) => (g.visible = i < v));
      break;
    }
    case "export":
    case "portfolio":
    case "critique": {
      const frames = [];
      for (let i = 0; i < 8; i++) {
        const c = card(
          root,
          ((i % 4) - 1.5) * 1.1,
          Math.floor(i / 4) * 1.4 - 0.65,
          -0.3,
          i % 2 ? cream : gold,
          0.95,
          1.15,
        );
        frames.push(c);
      }
      const cursor = ring(root, 0, 0, 0.2, 0.25, M.gold, 0.02);
      cursor.visible = kind === "critique";
      addHot(
        "Destination",
        [0, 1, 0.1],
        "Sélection, dimensions et usage orientent la préparation des images.",
      );
      update = (v) => {
        frames.forEach((f, i) => {
          f.visible = kind === "portfolio" ? i < v : true;
          if (kind === "export") f.scale.setScalar(0.65 + (v / 4096) * 0.35);
        });
        if (kind === "critique")
          cursor.position.set([-1.65, -0.55, 1.65][Math.round(v)], 0.95, 0.2);
      };
      break;
    }
    case "chromatic": {
      const lens = sphere(root, 0, 0.1, 0, 1, M.blue, [0.15, 1, 1]),
        beams = new T.Group();
      root.add(beams);
      const colors = [0xe38d83, 0x99cda5, 0x83b2e4];
      addHot(
        "Composantes de lumière",
        [0, 0.9, 0],
        "Les trajets colorés exagèrent une séparation de foyers pour expliquer les franges.",
      );
      update = (v) => {
        beams.children.slice().forEach((o) => {
          o.geometry.dispose();
          o.material.dispose();
          beams.remove(o);
        });
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++)
            tube(
              beams,
              [
                [-2.5, (j - 1) * 0.55, 0.05],
                [0, (j - 1) * 0.55, 0.05],
                [2 + (i - 1) * v * 0.7, 0, (i - 1) * v * 0.35],
              ],
              colors[i],
              0.012,
            );
      };
      break;
    }
    default:
      camera(root, 0, 0, 0, 1.3);
  }
  update(current);
  root.traverse((o) => {
    if (o.geometry) objects.push(o.geometry);
    if (o.material) {
      const mm = Array.isArray(o.material) ? o.material : [o.material];
      materials.push(...mm);
    }
  });
  return {
    root,
    kind,
    step,
    config: cfg,
    hotspots,
    value: current,
    set(v) {
      current = v;
      update(v);
    },
    get valueNow() {
      return current;
    },
    dispose() {
      const geometry = new Set(),
        mats = new Set();
      root.traverse((o) => {
        if (o.shadow?.dispose) o.shadow.dispose();
        if (o.geometry) geometry.add(o.geometry);
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            mats.add(m),
          );
      });
      geometry.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
