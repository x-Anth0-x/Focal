/* Original explanatory vector artwork. These diagrams are not optical simulations. */
window.FocalVisuals = (() => {
  let serial = 0;
  const esc = (value) =>
    String(value).replace(
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
  const C = {
    gold: "#efc56f",
    muted: "#8eabb4",
    green: "#a7c9ad",
    ink: "#17272e",
    white: "#f2eee5",
    blue: "#81aebf",
  };
  const text = (x, y, s, size = 14, color = C.white, anchor = "middle") =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif">${esc(s)}</text>`;
  const line = (x, y, x2, y2, color = C.muted, width = 2, dash = "") =>
    `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash ? 'stroke-dasharray="' + dash + '"' : ""}/>`;
  const box = (x, y, w, h, fill = C.ink, stroke = "#49616b", r = 12) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const circle = (x, y, r, fill = C.gold, stroke = "none", width = 1) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
  const person = (x, y, scale = 1, color = C.gold) =>
    `<g transform="translate(${x} ${y}) scale(${scale})">${circle(0, -40, 16, color)}<path d="M-25 57L-22 0Q0-16 22 0L25 57M-12 57L-15 100M12 57L15 100M-22 5L-38 43M22 5L38 43" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"/></g>`;
  const camera = (x, y, scale = 1) =>
    `<g transform="translate(${x} ${y}) scale(${scale})">${box(-55, -34, 110, 73, "#283a43", "#b3c2c6", 9)}${box(-32, -46, 43, 16, "#657780", "#b3c2c6", 3)}${circle(0, 2, 30, "#0c1d23", "#a5bbc4", 3)}${circle(0, 2, 20, "#1c3942", "#708e99", 2)}${circle(-7, -5, 6, "#75a8ad")}${circle(41, -20, 5, C.gold)}</g>`;
  const mountains = () =>
    `<path d="M0 232L125 95L220 189L327 69L474 213L555 122L680 230V350H0Z" fill="#2d4b54"/><path d="M125 95L154 129L132 122L118 143L101 129ZM327 69L367 114L339 102L322 124L306 101Z" fill="#b3c8c9"/><path d="M0 280Q180 239 340 285T680 260V350H0Z" fill="#203a40"/>`;
  const frame = (x, y, w, h) =>
    box(x, y, w, h, "none", "#b3c7cf", 3) +
    line(x + w / 3, y, x + w / 3, y + h, "#75939d66", 1) +
    line(x + (2 * w) / 3, y, x + (2 * w) / 3, y + h, "#75939d66", 1) +
    line(x, y + h / 3, x + w, y + h / 3, "#75939d66", 1) +
    line(x, y + (2 * h) / 3, x + w, y + (2 * h) / 3, "#75939d66", 1);
  function draw(kind, step = 0, title = "Schéma pédagogique") {
    const id = "visual-" + ++serial;
    let art = "";
    const s = Number(step);
    switch (kind) {
      case "camera":
        art =
          camera(290, 176, 2.3) +
          line(55, 80, 204, 120, s === 0 ? C.gold : C.muted) +
          text(65, 63, "LUMIÈRE", 12) +
          line(405, 100, 530, 78, s === 1 ? C.gold : C.muted) +
          text(555, 63, "MISE AU POINT", 12) +
          line(397, 214, 545, 256, s === 2 ? C.gold : C.muted) +
          text(551, 282, "DÉCLENCHEUR", 12);
        break;
      case "sensor":
        art =
          Array.from({ length: 9 }, (_, i) =>
            line(35, 80 + i * 23, 210, 172, C.gold, 1),
          ).join("") +
          `<ellipse cx="225" cy="172" rx="16" ry="98" fill="#85c1ca44" stroke="#85c1ca"/>` +
          line(245, 98, 450, 250, C.gold, 2) +
          line(245, 245, 450, 94, C.gold, 2) +
          Array.from({ length: 64 }, (_, i) =>
            box(
              460 + (i % 8) * 19,
              95 + Math.floor(i / 8) * 19,
              16,
              16,
              s === 2 && i % 6 === 0
                ? "#ffffff"
                : ["#c28d6a", "#739c82", "#739c82", "#638fa4"][i % 4],
              "none",
              2,
            ),
          ).join("") +
          text(225, 299, "OBJECTIF", 12) +
          text(535, 299, s === 2 ? "SATURATION" : "PHOTOSITES", 12);
        break;
      case "aperture":
        art = [77, 45, 17]
          .map(
            (r, i) =>
              `<g transform="translate(${i * 215} 0)" opacity="${i === s ? 1 : 0.35}">${circle(125, 155, 91, "#30444e", "#92a5aa", 4)}${Array.from({ length: 6 }, (_, k) => `<path d="M125 64L176 101L125 155L89 112Z" fill="#556872" stroke="#192b32" transform="rotate(${k * 60} 125 155)" opacity=".7"/>`).join("")}${circle(125, 155, r, "#0c1a21", "#b9cacc", 1)}${text(125, 280, ["f/1,8", "f/5,6", "f/16"][i], 20)}</g>`,
          )
          .join("");
        break;
      case "shutter":
      case "sport":
      case "street": {
        const motion = kind === "sport" ? [2, 1, 2][s] : s;
        art =
          (kind === "sport" && s === 2
            ? Array.from({ length: 14 }, (_, i) =>
                line(35, 45 + i * 15, 620, 30 + i * 15, "#77939d55", 3),
              ).join("")
            : "") +
          line(30, 272, 650, 272, "#59737b", 3) +
          [0, 1, 2, 3, 4]
            .map(
              (i) =>
                `<g opacity="${i === 4 ? 1 : motion === 0 ? 0.12 + i * 0.1 : motion === 1 ? 0.1 : 0}">${person(150 + i * 85, 160, 0.75, i === 4 ? C.gold : C.blue)}</g>`,
            )
            .join("") +
          line(95, 83, 575, 83, C.gold, 2, "8 8") +
          text(
            340,
            58,
            kind === "street"
              ? ["PRÉPARER LE CADRE", "ATTENDRE LE GESTE", "CHOISIR L’INSTANT"][
                  s
                ]
              : kind === "sport"
                ? [
                    "FIGER LE GESTE",
                    "SUIVRE LA CIBLE AF",
                    "ACCOMPAGNER LE SUJET",
                  ][s]
                : [
                    "MOUVEMENT VISIBLE",
                    "UN COMPROMIS DE DURÉE",
                    "INSTANT FIGÉ",
                  ][s],
            16,
          ) +
          (kind === "sport" && s === 1
            ? box(430, 108, 120, 150, "none", C.gold, 2)
            : "") +
          text(
            340,
            315,
            "Le mouvement se lit relativement au cadre.",
            12,
            C.muted,
          );
        break;
      }
      case "iso":
        art =
          mountains() +
          Array.from({ length: [22, 95, 270][s] }, (_, i) =>
            circle(
              (i * 83 + 17) % 680,
              (i * 139 + 31) % 350,
              ((i % 3) + 1) * 0.65,
              i % 2 ? "#ffffff" : "#000000",
              "none",
            ),
          ).join("") +
          box(230, 30, 220, 43, "#102129d9", "none") +
          text(340, 57, ["ISO 100", "ISO 1600", "ISO 6400"][s], 18) +
          text(340, 320, "Bruit illustré ; pas de mesure de capteur.", 12);
        break;
      case "triangle":
        art =
          `<path d="M340 55L110 268H570Z" fill="#223b44" stroke="#76909c" stroke-width="2"/>` +
          [
            circle(340, 55, 20, s === 0 ? C.gold : C.ink),
            circle(110, 268, 20, s === 1 ? C.gold : C.ink),
            circle(570, 268, 20, s === 2 ? C.gold : C.ink),
          ].join("") +
          text(340, 30, "OUVERTURE", 13) +
          text(110, 316, "TEMPS DE POSE", 13) +
          text(570, 316, "ISO", 13) +
          text(340, 194, "UN COMPROMIS", 18, C.gold) +
          text(340, 219, "trois effets visuels", 13, C.muted);
        break;
      case "modes":
        art =
          circle(340, 169, 122, "#23373f", "#a2b4ba", 4) +
          circle(340, 169, 94, "#12232a", "#68818b", 1) +
          ["P", "A", "S", "M"]
            .map((mode, i) => {
              const a = ((i * 90 - 90) * Math.PI) / 180;
              return text(
                340 + Math.cos(a) * 72,
                178 + Math.sin(a) * 72,
                mode,
                30,
                i === [1, 2, 3][s] ? C.gold : C.muted,
              );
            })
            .join("") +
          circle(340, 169, 15, C.gold) +
          text(
            340,
            324,
            ["PRIORITÉ OUVERTURE", "PRIORITÉ VITESSE", "MODE MANUEL"][s],
            14,
            C.gold,
          );
        break;
      case "meter":
        art =
          box(65, 100, 550, 110, "#1e333b") +
          Array.from({ length: 13 }, (_, i) =>
            line(95 + i * 40, 140, 95 + i * 40, i % 2 ? 165 : 180, C.muted, 2),
          ).join("") +
          text(95, 125, "−3", 14) +
          text(335, 125, "0", 14) +
          text(575, 125, "+3", 14) +
          `<path d="M${255 + s * 80} 225l-12 22h24Z" fill="${C.gold}"/>` +
          text(
            340,
            287,
            ["CORRECTION −1 IL", "MESURE DE RÉFÉRENCE", "CORRECTION +1 IL"][s],
            18,
            C.gold,
          );
        break;
      case "histogram":
        art =
          line(60, 275, 620, 275) +
          line(60, 275, 60, 60) +
          Array.from({ length: 45 }, (_, i) => {
            const h = Math.max(
              5,
              178 * Math.exp(-Math.pow((i - [8, 22, 38][s]) / 8, 2)),
            );
            return box(
              70 + i * 12,
              274 - h,
              9,
              h,
              `hsl(${42 + i * 2} 33% ${39 + i / 2}%)`,
              "none",
              1,
            );
          }).join("") +
          text(80, 307, "OMBRE", 11, C.muted) +
          text(340, 307, "TONS MOYENS", 11, C.muted) +
          text(592, 307, "LUMIÈRE", 11, C.muted);
        break;
      case "focus":
        art =
          mountains() +
          person(260 + s * 65, 164, 0.85) +
          frame(55, 45, 570, 260) +
          box(
            s === 2 ? 470 : 225 + s * 65,
            s === 2 ? 75 : 107,
            70,
            92,
            "none",
            C.gold,
            1,
          ) +
          text(
            340,
            332,
            ["AF PONCTUEL", "AF CONTINU", "CHOISIR SA CIBLE"][s],
            14,
            C.gold,
          );
        break;
      case "whitebalance":
      case "mixed":
        art =
          box(60, 55, 560, 245, ["#27516d", "#52615c", "#98704a"][s], "none") +
          circle(kind === "mixed" ? 190 : 340, 155, 60, "#c1bba2") +
          box(kind === "mixed" ? 370 : 280, 215, 120, 45, "#9ba29c", "none") +
          (kind === "mixed"
            ? `<path d="M340 55H620V300H340Z" fill="#dba25755"/>`
            : "") +
          text(
            340,
            327,
            kind === "mixed"
              ? ["LUMIÈRE DU JOUR", "SOURCE CHAUDE", "HARMONISATION"][s]
              : ["RENDU FROID", "RÉFÉRENCE NEUTRE", "RENDU CHAUD"][s],
            14,
            C.gold,
          );
        break;
      case "workflow":
      case "raw":
      case "planning":
      case "direction":
      case "rights": {
        const labels = {
          workflow: ["RAW", "DÉVELOPPEMENT", "JPEG"],
          raw: ["ORIGINAL", "RÉGLAGES", "VERSION"],
          planning: ["BRIEF", "MOYENS", "PLAN B"],
          direction: ["ÉCOUTER", "GUIDER", "AJUSTER"],
          rights: ["DEVIS", "AUTORISATIONS", "LIVRAISON"],
        }[kind];
        art =
          labels
            .map(
              (v, i) =>
                box(
                  42 + i * 215,
                  110,
                  166,
                  110,
                  i === s ? "#5d5032" : C.ink,
                  i === s ? C.gold : "#49616b",
                ) +
                text(
                  125 + i * 215,
                  172,
                  v,
                  kind === "rights" ? 11 : 13,
                  i === s ? C.gold : C.white,
                ) +
                (i < 2
                  ? line(214 + i * 215, 166, 250 + i * 215, 166, C.gold, 2)
                  : ""),
            )
            .join("") +
          text(340, 278, "Une décision claire à chaque étape.", 14, C.muted);
        break;
      }
      case "focal":
      case "lenskit":
        art =
          camera(95, 175, 0.9) +
          `<path d="M150 175L${[610, 550, 460][s]} ${[45, 90, 130][s]}V${[305, 260, 220][s]}Z" fill="#e9bf6222" stroke="${C.gold}"/>` +
          line(610, 35, 610, 315, C.muted, 2, "6 6") +
          text(
            340,
            330,
            kind === "focal"
              ? [
                  "CHAMP LARGE · 24 mm",
                  "CHAMP MOYEN · 50 mm",
                  "CHAMP ÉTROIT · 135 mm",
                ][s]
              : [
                  "UNE FOCALE · UN CHAMP",
                  "PLUSIEURS FOCALES",
                  "L’USAGE DÉCIDE",
                ][s],
            14,
            C.gold,
          );
        break;
      case "depth":
        art =
          line(60, 230, 620, 230) +
          box(
            [230, 170, 90][s],
            80,
            [110, 250, 470][s],
            180,
            "#86b49422",
            "#86b494",
            8,
          ) +
          person(285, 145, 0.6) +
          person(445, 134, 0.48, C.muted) +
          person(565, 125, 0.35, C.muted) +
          text(340, 48, "ZONE JUGÉE NETTE", 14, C.green) +
          text(
            340,
            305,
            [
              "MISE AU POINT PROCHE",
              "DISTANCE INTERMÉDIAIRE",
              "MISE AU POINT LOINTAINE",
            ][s],
            13,
            C.gold,
          );
        break;
      case "perspective":
        if (s < 2) {
          art =
            line(45, 279, 635, 279, C.muted, 2) +
            person(245, 145, 1.05, C.gold) +
            person(480, s === 0 ? 140 : 155, s === 0 ? 0.4 : 0.82, C.blue) +
            text(245, 318, "PREMIER PLAN", 12, C.gold) +
            text(480, 318, "ARRIÈRE-PLAN", 12, C.blue) +
            text(
              340,
              43,
              s === 0 ? "POINT DE VUE PROCHE" : "POINT DE VUE PLUS ÉLOIGNÉ",
              15,
              C.gold,
            );
          break;
        }
      // The third case demonstrates convergence, using the architecture diagram below.
      case "architecture":
        art =
          [0, 1, 2]
            .map((i) => {
              const skew = (
                  kind === "architecture" ? [0, 55, 0] : [55, 20, 55]
                )[s],
                x = 90 + i * 170;
              return (
                `<path d="M${x} 275L${x + skew} 70H${x + 130 - skew}L${x + 130} 275Z" fill="${i === 1 ? "#455e67" : "#253e48"}" stroke="#a1b5bd"/>` +
                Array.from({ length: 4 }, (_, j) =>
                  line(
                    x + skew + 10,
                    105 + j * 37,
                    x + 120 - skew,
                    105 + j * 37,
                    C.muted,
                    2,
                  ),
                ).join("")
              );
            })
            .join("") +
          text(
            340,
            320,
            kind === "architecture"
              ? [
                  "BOÎTIER HORIZONTAL",
                  "BOÎTIER INCLINÉ",
                  "CORRECTION ET RECADRAGE",
                ][s]
              : "VERTICALES CONVERGENTES",
            13,
            C.gold,
          );
        break;
      case "aberration":
        art =
          Array.from({ length: 9 }, (_, i) =>
            line(
              130 + i * 52,
              70,
              130 + i * 52,
              277,
              s === 0 ? (i % 2 ? "#ab98cd" : "#87c8b7") : "#bac8ca",
              s === 2 ? 10 : 3,
            ),
          ).join("") +
          (s === 0
            ? Array.from({ length: 9 }, (_, i) =>
                line(134 + i * 52, 70, 134 + i * 52, 277, "#d49bb866", 2),
              ).join("")
            : "") +
          text(
            340,
            320,
            [
              "FRANGES ILLUSTRÉES",
              "DÉTAIL INTERMÉDIAIRE",
              "DIFFRACTION ILLUSTRÉE",
            ][s],
            14,
            C.gold,
          );
        break;
      case "kit":
        art =
          camera(205, 163, 1.5) +
          box(405, 103, 80, 125, "#2b4049", "#9aafb7") +
          circle(445, 126, 22, "#12252d", "#8aabb5", 3) +
          [0, 1, 2]
            .map((i) =>
              box(
                355 + i * 72,
                248,
                52,
                35,
                i === s ? "#665733" : C.ink,
                i === s ? C.gold : "#49616b",
                5,
              ),
            )
            .join("") +
          text(
            340,
            56,
            ["LÉGER", "SPÉCIALISÉ", "PRÊT À PARTIR"][s],
            18,
            C.gold,
          ) +
          text(340, 326, "Usage · poids · budget · fiabilité", 13, C.muted);
        break;
      case "composition":
      case "negative":
        art =
          box(45, 40, 590, 260, "#213a43", "#6b8792", 4) +
          frame(45, 40, 590, 260) +
          person([340, 242, 155][s], 157, 0.77) +
          text(
            340,
            330,
            kind === "negative"
              ? ["FOND CONCURRENT", "FOND ÉPURÉ", "ESPACE POUR RESPIRER"][s]
              : ["CENTRER", "DÉCENTRER", "ÉPURER"][s],
            14,
            C.gold,
          ) +
          (kind === "negative" && s === 0
            ? Array.from({ length: 10 }, (_, i) =>
                line(65 + i * 59, 65, 140 + i * 45, 285, "#79939c", 4),
              ).join("")
            : "");
        break;
      case "lines":
        art =
          frame(45, 40, 590, 260) +
          (s === 0
            ? line(60, 275, 530, 75, C.gold, 5) + circle(530, 75, 21, C.gold)
            : s === 1
              ? box(125, 100, 100, 135, "#7c997d") +
                box(455, 100, 100, 135, "#7c997d")
              : box(90, 78, 225, 190, "#63808b") +
                circle(535, 172, 29, C.gold)) +
          text(
            340,
            330,
            [
              "UNE DIAGONALE GUIDE",
              "DES MASSES SE RÉPONDENT",
              "LE CONTRASTE ÉQUILIBRE",
            ][s],
            14,
            C.gold,
          );
        break;
      case "color":
        art =
          [0, 1, 2, 3, 4]
            .map((i) =>
              box(
                80 + i * 104,
                70,
                96,
                210,
                [
                  ["#627e79", "#779083", "#9aa786", "#bec391", "#d5d09b"],
                  ["#385f75", "#6796a8", "#bbc0ab", "#c38c59", "#e7af68"],
                  ["#444b50", "#666e73", "#8a9295", "#afb7b7", "#d9dddd"],
                ][s][i],
                "none",
                6,
              ),
            )
            .join("") +
          text(
            340,
            326,
            [
              "HARMONIE ANALOGUE",
              "CONTRASTE DE TEINTES",
              "VALEURS DE LUMINANCE",
            ][s],
            14,
            C.gold,
          );
        break;
      case "story":
      case "project":
        art = [0, 1, 2]
          .map(
            (i) =>
              `<g opacity="${i === s ? 1 : 0.35}">${box(35 + i * 220, 65, 185, 208, "#263e48", "#8ba5b1")}${i === 0 ? camera(127 + i * 220, 160, 1) : i === 1 ? person(127 + i * 220, 142, 0.7) : circle(127 + i * 220, 155, 43, C.gold)}${text(127 + i * 220, 302, (kind === "story" ? ["CONTEXTE", "ACTION", "CONCLUSION"] : ["INTENTION", "PRODUCTION", "PRÉSENTATION"])[i], 12)}</g>`,
          )
          .join("");
        break;
      case "light":
      case "portraitlight":
      case "portrait": {
        const lx = [340, 140, 540][s],
          ly = [45, 85, 80][s];
        art =
          circle(lx, ly, s === 2 ? 42 : 23, C.gold) +
          `<path d="M${lx - 18} ${ly + 20}L280 264H400Z" fill="#edc56a18"/>` +
          person(340, 174, 0.85, "#d1bd96") +
          line(lx, ly + 25, 340, 130, C.gold, 2, "6 6") +
          text(
            340,
            329,
            (kind === "portrait"
              ? ["ÉCHANGER", "PLACER", "DÉCLENCHER"]
              : kind === "portraitlight"
                ? ["SOURCE FRONTALE", "SOURCE À 45°", "DÉBOUCHER LES OMBRES"]
                : [
                    "LUMIÈRE FRONTALE",
                    "LUMIÈRE LATÉRALE",
                    "GRANDE SOURCE APPARENTE",
                  ])[s],
            14,
            C.gold,
          );
        break;
      }
      case "sun":
        art =
          mountains() +
          circle([110, 340, 570][s], [185, 54, 185][s], 29, C.gold) +
          `<path d="M110 185Q340 -80 570 185" fill="none" stroke="#efc56f88" stroke-dasharray="5 8"/>` +
          text(
            340,
            327,
            ["MATIN · ANGLE BAS", "MIDI · ANGLE HAUT", "SOIR · ANGLE BAS"][s],
            14,
            C.gold,
          );
        break;
      case "backlight":
        art =
          box(290, 35, 200, 242, "#e4dab9", "#f4e8c7") +
          line(390, 35, 390, 277, "#a69c81", 5) +
          person(
            310,
            166,
            0.8,
            s === 0 ? "#17262d" : s === 1 ? "#d6bd97" : "#bda984",
          ) +
          (s === 2
            ? `<ellipse cx="150" cy="200" rx="29" ry="65" fill="#a4b0b4" stroke="#f1e5c2"/>` +
              line(175, 180, 265, 160, C.gold, 3)
            : "") +
          text(
            340,
            325,
            [
              "EXPOSER POUR LE FOND",
              "EXPOSER POUR LE SUJET",
              "AJOUTER UN RÉFLECTEUR",
            ][s],
            14,
            C.gold,
          );
        break;
      case "flash":
        art =
          line(70, 235, 610, 235, C.muted, 2) +
          box(70, 95, 540, 110, "#30495155", "#54727e") +
          `<path d="M${[160, 340, 510][s]} 195v-112h24v112" fill="none" stroke="${C.gold}" stroke-width="5"/>` +
          text(340, 61, "LUMIÈRE CONTINUE + ÉCLAIR BREF", 15, C.gold) +
          text(
            340,
            277,
            "Durée d’ouverture / instant de l’éclair",
            13,
            C.muted,
          ) +
          text(
            340,
            315,
            ["AMBIANCE", "PUISSANCE DE L’ÉCLAIR", "SYNCHRONISATION"][s],
            14,
            C.gold,
          );
        break;
      case "family":
        art =
          [
            person(210, 155, 0.9, C.green),
            person(340, 130, 0.65, C.gold),
            person(465, 155, 0.9, C.blue),
          ].join("") +
          box(150, 72, 370, 210, "none", "#7f9e8b", 7) +
          text(
            340,
            45,
            ["UN PLAN COMMUN", "PRÉPARER LE GESTE", "UNE ACTION SIMPLE"][s],
            16,
            C.gold,
          ) +
          text(340, 327, "Relation · attention · sécurité", 13, C.muted);
        break;
      case "landscape":
        art =
          mountains() +
          box(0, 0, 680, 350, "none", "#8aa2a7", 3) +
          (s === 0
            ? circle(135, 285, 48, "#5f7566")
            : s === 1
              ? line(0, 255, 680, 255, C.gold, 2, "8 8") +
                line(0, 155, 680, 155, C.gold, 2, "8 8")
              : circle(565, 75, 25, C.gold)) +
          text(
            340,
            327,
            ["UN PREMIER PLAN", "DES PLANS SUCCESSIFS", "UNE LUMIÈRE CHOISIE"][
              s
            ],
            14,
            C.gold,
          );
        break;
      case "night":
        art =
          Array.from({ length: 42 }, (_, i) =>
            s === 1
              ? `<path d="M${((i * 89) % 650) + 15} ${((i * 53) % 230) + 20}q18 0 27 9" fill="none" stroke="#d3ddd8" stroke-width="2"/>`
              : circle(
                  ((i * 89) % 650) + 15,
                  ((i * 53) % 230) + 20,
                  i % 3 === 0 ? 2 : 1,
                  "#d3ddd8",
                ),
          ).join("") +
          `<path d="M0 350V288L150 240L275 287L450 222L680 295V350Z" fill="#233940"/>` +
          text(
            340,
            327,
            ["POSE COURTE", "ROTATION APPARENTE", "SÉRIE À ALIGNER"][s],
            14,
            C.gold,
          );
        break;
      case "curves":
        art =
          frame(170, 30, 340, 270) +
          line(170, 300, 510, 30, "#5a737b", 1, "5 6") +
          `<path d="${["M170 260Q340 165 510 80", "M170 300C315 310 355 5 510 30", "M170 290C260 155 400 190 510 48"][s]}" stroke="${s === 2 ? "#94b5cb" : C.gold}" fill="none" stroke-width="4"/>` +
          text(
            340,
            329,
            ["CONTRASTE DOUX", "COURBE EN S", "CANAL COULEUR"][s],
            14,
            C.gold,
          );
        break;
      case "mask":
      case "ethics":
        art =
          person(340, 159, 1.05, "#bea88d") +
          circle(
            340,
            117,
            68,
            "none",
            s === 0 ? "#758d99" : C.gold,
            s === 2 ? 12 : 3,
          ) +
          (kind === "mask"
            ? box(
                252,
                38,
                176,
                245,
                s === 0 ? "#e8bd651a" : "#e8bd6533",
                s === 0 ? "#75929d" : C.gold,
                26,
              )
            : "") +
          text(
            340,
            329,
            (kind === "mask"
              ? ["ACTION GLOBALE", "SÉLECTION LOCALE", "TRANSITION PROGRESSIVE"]
              : ["CONSENTEMENT", "TEXTURE PRÉSERVÉE", "TRANSPARENCE"])[s],
            14,
            C.gold,
          );
        break;
      case "backup":
        art =
          box(
            270,
            45,
            140,
            68,
            s === 0 ? "#5d5032" : C.ink,
            s === 0 ? C.gold : C.muted,
          ) +
          text(340, 85, "ORIGINAUX", 13) +
          line(340, 113, 340, 165) +
          line(125, 165, 555, 165) +
          [0, 1, 2]
            .map(
              (i) =>
                line(125 + i * 215, 165, 125 + i * 215, 205) +
                box(
                  50 + i * 215,
                  205,
                  150,
                  70,
                  i === s ? "#4d5438" : C.ink,
                  i === s ? C.gold : C.muted,
                ) +
                text(
                  125 + i * 215,
                  246,
                  ["TRAVAIL", "SAUVEGARDE", "RESTAURATION"][i],
                  11,
                ),
            )
            .join("") +
          text(
            340,
            321,
            "Des copies indépendantes, une restauration vérifiée.",
            13,
            C.gold,
          );
        break;
      case "export":
        art =
          box(90, 55, 260, 175, "#223b44", "#9bb0b7", 8) +
          box(100, 66, 240, 150, "#426067", "none", 2) +
          line(220, 230, 220, 266, C.muted, 7) +
          line(160, 268, 280, 268, C.muted, 5) +
          box(430, 75, 155, 205, "#d6d3c7", "#a9b3b4", 2) +
          box(446, 90, 123, 151, "#426067", "none", 0) +
          text(220, 310, "AFFICHAGE", 13, s === 0 ? C.gold : C.muted) +
          text(
            510,
            310,
            s === 2 ? "FICHIER VÉRIFIÉ" : "IMPRESSION",
            13,
            s === 1 ? C.gold : C.muted,
          );
        break;
      case "portfolio":
        art =
          [0, 1, 2, 3, 4, 5]
            .map((i) =>
              box(
                80 + (i % 3) * 177,
                45 + Math.floor(i / 3) * 135,
                155,
                110,
                [
                  "#4a635e",
                  "#8d7757",
                  "#3c5866",
                  "#586f78",
                  "#8d9378",
                  "#4c5f52",
                ][i],
                i % 3 === s ? C.gold : "#536b73",
                3,
              ),
            )
            .join("") +
          text(340, 330, ["SÉLECTIONNER", "UNIFIER", "ÉDITER"][s], 14, C.gold);
        break;
      case "critique":
        art =
          frame(90, 35, 500, 270) +
          mountains() +
          circle(
            [175, 340, 520][s],
            [140, 120, 200][s],
            40,
            "none",
            C.gold,
            3,
          ) +
          line(
            [175, 340, 520][s] + 38,
            [140, 120, 200][s],
            630,
            70,
            C.gold,
            2,
          ) +
          text(
            530,
            49,
            ["OBSERVER", "RELIER À L’INTENTION", "PROPOSER UN ESSAI"][s],
            12,
            C.gold,
          );
        break;
      default:
        art =
          camera(340, 165, 2) +
          text(340, 315, "Observer · comparer · comprendre", 16, C.gold);
    }
    return `<svg class="concept-svg" viewBox="0 0 680 350" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">Illustration schématique de la situation ${s + 1}. Le texte associé explique la notion et ses limites.</desc><defs><radialGradient id="${id}-bg"><stop stop-color="#29434d"/><stop offset="1" stop-color="#13232b"/></radialGradient></defs><rect width="680" height="350" rx="12" fill="url(#${id}-bg)"/>${art}</svg>`;
  }
  return { draw };
})();
