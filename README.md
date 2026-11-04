# FOCAL Academy

Une application de photographie en français : 48 leçons illustrées, 8 niveaux, un parcours personnel et une interface sombre et dorée adaptée au mobile.

## Démarrer

Aucune dépendance n’est nécessaire pour servir le site. Depuis le dépôt :

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Ouvrir ensuite `http://localhost:3000`. Le chargement des données JSON nécessite un serveur HTTP : l’ouverture de `index.html` en `file://` n’est pas le mode de démarrage pris en charge.

En production, les fichiers sont servis depuis la racine de la branche `gh-pages`. `.nojekyll` permet de les servir tels quels. Toutes les ressources utilisent des chemins relatifs compatibles avec `https://x-anth0-x.github.io/Focal/`.

## Parcours

Chaque leçon dispose de cinq espaces :

- **Cours** : repère essentiel, visuel d’ambiance et six chapitres avec suivi de lecture.
- **Atelier visuel** : scène 3D manipulable, réglage animé, repères cliquables, trois situations commentées et une comparaison de rendus 3D.
- **Mission terrain** : protocole, preuves attendues et carnet personnel.
- **Quiz** : questions propres au sujet, correction expliquée et possibilité de recommencer.
- **Mémo** : synthèse imprimable et liens vers les leçons du même niveau.

Les leçons d’ouverture et de profondeur de champ incluent aussi un calcul de profondeur de champ. La leçon pilote conserve ses cinq questions d’origine ; les 47 autres proposent chacune deux questions contextualisées. Les deux questions d’ouverture présentes dans `lesson-content.json` ne remplacent pas les cinq questions du pilote.

Les contenus d’origine sont conservés dans `curriculum.json`. Les compléments apportent 48 directions visuelles, 144 situations et 96 questions rédigées, dont 94 utilisées hors pilote. Pour les anciens cours courts, les chapitres combinent le texte d’origine, les situations, le protocole et une synthèse.

## Fichiers

| Fichier                     | Rôle                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `index.html`                | Structure accessible, chargement et navigation                |
| `academy.css`               | Interface, responsive, impression et réduction des animations |
| `academy.js`                | Catalogue, routes, leçons, quiz, carnet et progression        |
| `visuals.js`                | Schémas SVG originaux adaptés aux 48 sujets                   |
| `curriculum.json`           | Catalogue et contenu pédagogique d’origine                    |
| `lesson-content.json`       | Notions, missions, situations et questions complémentaires    |
| `lesson_reference.json`     | Chapitres et quiz d’origine du pilote sur l’ouverture         |
| `assets/academy-scenes.png` | Huit scènes d’ambiance générées, réutilisées selon le sujet   |
| `assets/landscape.png`      | Illustration générée de la première version, conservée        |
| `REFERENCE.md`              | Documentation historique de l’archive fournie                 |

Pour enrichir une leçon, conserver son identifiant `Nxx-Lxx`. Modifier ses textes dans `lesson-content.json`, et sa maquette dans `spatial-models.js`. Les illustrations générées ne sont pas des photographies comparatives contrôlées. Les maquettes 3D expliquent des mécanismes ; elles ne constituent pas des simulations optiques quantitatives. Le calcul optique annonce séparément ses hypothèses.

## Suivi et compatibilité

La clé `focal_academy_web_v1` reste identique. Les anciennes notes, missions, réponses au quiz pilote et marques de lecture sont conservées. Les marques de lecture seules ne deviennent pas des validations. Les nouveaux quiz utilisent un champ distinct pour éviter de réinterpréter les anciennes réponses génériques.

Une validation personnelle nécessite la mission déclarée réalisée et le score requis : 4/5 pour le pilote, 2/2 pour les autres. Ce suivi est une autoévaluation, pas une certification. La lecture des chapitres est enregistrée séparément. Les notes sont sauvegardées automatiquement et par bouton ; elles restent locales au navigateur. La page de progression propose export et import JSON, avec confirmation avant remplacement du suivi.

Liens directs : `#courses`, `#courses/5`, `#lesson/N06-L04/visual`, `#progress`. Les onglets et la navigation fonctionnent aussi au clavier.

## Vérifications

Les tests navigateur nécessitent Python, Playwright et Chromium dans l’environnement de développement uniquement :

```sh
FOCAL_URL=http://127.0.0.1:3000 python tests/smoke.py
```

`CHROMIUM_PATH` peut désigner un autre exécutable Chromium. La suite parcourt les 48 leçons, réalise les missions et quiz, vérifie la persistance, l’import/export, la reprise d’un ancien suivi, les calculs de profondeur de champ, les liens directs, le clavier et six largeurs d’écran.

## Laboratoire spatial et lexique vivant

Les 48 anciens schémas SVG sont remplacés par des rendus de modèles 3D procéduraux. Les cours affichent des aperçus 3D ; les ateliers et le lexique donnent accès aux scènes manipulables.

- Rotation à la souris ou au toucher, zoom tactile et par boutons, vue de face et réinitialisation.
- Un réglage propre à la notion, une animation à la demande et des points explicatifs ancrés à la scène.
- Géométries mises à jour réellement : lamelles du diaphragme, plans de mise au point, répartition tonale, sources lumineuses, trajectoires et flux de fichiers.
- Lorsque le réglage est modifié librement, la narration quitte le préréglage pour éviter de présenter une ancienne situation comme l’état actuel.
- Les flèches font tourner la vue au clavier ; `+` / `−` zooment et `0` réinitialise. La barre d’espace lance ou arrête l’animation lorsque le canevas est sélectionné.

**29 notions techniques** deviennent des liens dans les cours, exemples et corrections. Chaque notion possède une définition, une animation 3D pilotable, trois étapes commentées et un exemple concret. La lecture des textes ne nécessite pas de GPU. Le retour depuis un mot cliqué restaure la leçon et son onglet, avec sa position de lecture.

Routes supplémentaires : `#glossary`, `#glossary/ouverture`, `#glossary/diaphragme`, `#glossary/focale`.

### Architecture graphique

| Fichier             | Rôle                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `spatial-models.js` | 53 configurations de maquettes, dont les 48 sujets du parcours                |
| `spatial.js`        | Rendu, contrôles, repères, animation, visibilité et libération des ressources |
| `spatial.css`       | Interface spatiale et lexique responsive                                      |
| `glossary.json`     | 29 définitions, 87 étapes et exemples rédigés                                 |
| `glossary.js`       | Liens de vocabulaire, recherche, navigation et narration                      |
| `vendor/three/`     | Three.js r180, contrôles et géométrie arrondie, sous licence MIT              |

Les aperçus des cours utilisent le moteur **WebGL 2** classique, sans attendre la disponibilité de WebGPU. Les scènes interactives tentent **WebGPU** avec des délais bornés pour la détection, l’initialisation et le premier rendu ; un échec ou un dépassement provoque un repli sur WebGL 2. Les dépendances utilisent des imports relatifs directs et sont servies depuis le dépôt ; aucun CDN, import map ni service externe n’est requis à l’exécution.

Le catalogue et l’index du lexique ne créent pas de moteur graphique. Les scènes se chargent à l’approche de la zone visible. Un moteur réutilisé produit les aperçus ; un second sert la scène interactive. Le cache des aperçus est borné. Le rendu est déclenché à la demande ; les animations ne démarrent jamais seules et s’arrêtent quand la scène ou la page est masquée. Géométries, matériaux, ombres et contrôles sont libérés à la sortie de scène. Les préférences de réduction des animations sont respectées.

L’absence de support graphique affiche une explication textuelle : définition, étapes, exemples et cours restent utilisables. Les visuels sont schématiques, les trajectoires peuvent être exagérées, et les objets représentés ne caractérisent pas un appareil ou un objectif réel. Seul le calcul de profondeur de champ est quantitatif, selon les hypothèses affichées.

### Vérification 3D

```sh
python tests/spatial.py
```

Cette suite utilise aussi Pillow pour contrôler une capture du canevas. Elle vérifie les géométries aux bornes des réglages, le rendu réel des 48 leçons et des 29 notions, les animations, la caméra, les repères, le retour à la leçon, les écrans étroits et le cas sans GPU. Le moteur WebGL 2 est vérifié avec le rendu logiciel de Chromium dans l’environnement cloud ; les performances WebGPU natives dépendent du matériel et ne sont pas mesurées ici.

### Chargement et accès aux cours

Les aperçus sont cliquables dès leur affichage et ouvrent l’atelier de la leçon. Cliquer sur une carte de comparaison sélectionne sa situation. Le chargement d’une miniature conserve son bouton pour éviter de perdre un clic en cours.

Les onglets Cours, Atelier visuel, Mission terrain, Quiz et Mémo restent indépendants du chargement graphique. Une erreur offre une relance explicite ; les promesses échouées ne sont pas conservées comme résultat définitif. Un ancien rendu dont la leçon a été quittée ne doit pas interrompre une nouvelle scène.

```sh
python tests/loading.py
```

Cette suite simule une détection WebGPU sans réponse, une initialisation suspendue, un premier rendu qui ne termine pas, une interruption réseau et la navigation pendant ces échecs. Elle vérifie aussi les cinq onglets, la sélection d’une comparaison, le maintien du lexique et la sauvegarde des notes.
