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
- **Atelier visuel** : schéma explicatif, trois situations commentées, paramètres et limites affichés.
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
| `visuals.js`                | Aperçus et ateliers vidéo Runway                   |
| `curriculum.json`           | Catalogue et contenu pédagogique d’origine                    |
| `lesson-content.json`       | Notions, missions, situations et questions complémentaires    |
| `lesson_reference.json`     | Chapitres et quiz d’origine du pilote sur l’ouverture         |
| `assets/academy-scenes.png` | Huit scènes d’ambiance générées, réutilisées selon le sujet   |
| `assets/landscape.png`      | Illustration générée de la première version, conservée        |
| `REFERENCE.md`              | Documentation historique de l’archive fournie                 |

Pour enrichir une leçon, conserver son identifiant `Nxx-Lxx`. Modifier ses textes dans `lesson-content.json`, et sa correspondance vidéo dans `lesson-films.json`. Les illustrations générées ne sont pas des photographies comparatives contrôlées. Les vidéos illustrent le sujet ; elles ne constituent pas des simulations optiques quantitatives. Le calcul optique annonce séparément ses hypothèses.

## Suivi et compatibilité

La clé `focal_academy_web_v1` reste identique. Les anciennes notes, missions, réponses au quiz pilote et marques de lecture sont conservées. Les marques de lecture seules ne deviennent pas des validations. Les nouveaux quiz utilisent un champ distinct pour éviter de réinterpréter les anciennes réponses génériques.

Une validation personnelle nécessite la mission déclarée réalisée et le score requis : 4/5 pour le pilote, 2/2 pour les autres. Ce suivi est une autoévaluation, pas une certification. La lecture des chapitres est enregistrée séparément. Les notes sont sauvegardées automatiquement et par bouton ; elles restent locales au navigateur. La page de progression propose export et import JSON, avec confirmation avant remplacement du suivi.

Liens directs : `#home`, `#courses/5`, `#lesson/N06-L04/visual`, `#progress`. Les onglets et la navigation fonctionnent aussi au clavier.

## Vérifications

Les tests navigateur nécessitent Python, Playwright et Chromium dans l’environnement de développement uniquement :

```sh
FOCAL_URL=http://127.0.0.1:3000 python tests/smoke.py
```

`CHROMIUM_PATH` peut désigner un autre exécutable Chromium. La suite parcourt les 48 leçons, réalise les missions et quiz, vérifie la persistance, l’import/export, la reprise d’un ancien suivi, les calculs de profondeur de champ, les liens directs, le clavier et six largeurs d’écran.

## Ateliers explicatifs et lexique

Les vidéos générées du kit et des scènes d’ambiance ne servent plus de démonstrations de réglage dans les leçons et le lexique. Elles sont conservées comme sources dans le dépôt. Le logo animé et l’étude réelle de déplacement du point du guide matériel restent distincts des mécanismes techniques.

`diagrams.js` fournit des schémas 2D déterministes pour les 48 notions : ouverture, champ, durée et mouvement, profondeur de champ, histogramme, balance des blancs, mise au point, lumière, cadrage, traitement et méthodes de travail. Les situations changent le schéma et sa légende. Chaque atelier précise « Ce qui change », « Repère à garder » et les hypothèses ou limites de la représentation. Les étapes de méthode sont des diagrammes de décisions, sans prétendre simuler un effet optique.

Les diamètres de pupille, angles de champ, déplacements v × t et limites de profondeur de champ utilisent les valeurs affichées. Les autres effets sont explicitement qualitatifs. Les illustrations ne mesurent ni le bruit, ni le bokeh, ni les aberrations des objectifs réels. Les cours conservent les missions et leurs protocoles de comparaison.

Le calculateur de profondeur de champ et le schéma sont synchronisés : les situations d’ouverture et de distance chargent leurs paramètres dans le calculateur ; modifier les valeurs ouvre une exploration libre, sans conserver une ancienne situation sélectionnée.

Les données Sony sont corrigées : les situations A/S/M utilisent réellement ces trois modes ; la leçon sur la distance garde 85 mm et f/1,8 pour comparer 1,2 / 2 / 5 m ; les exemples AF-S/AF-C, compensation d’exposition, Kelvin et compensation du triangle disposent de paramètres propres. Le générateur du profil conserve ces corrections.

La navigation et les icônes utilisent un sprite SVG local dessiné pour FOCAL (`assets/icons.svg`, `icons.js`, `atelier.css`). L’accueil conserve son menu masqué ; les espaces de travail affichent une navigation d’atelier et des niveaux identifiables, avec état actif accessible au clavier.

### Vérifications actuelles

```sh
FOCAL_URL=http://127.0.0.1:3000 python tests/smoke.py
FOCAL_URL=http://127.0.0.1:3000 python tests/pedagogy.py
FOCAL_URL=http://127.0.0.1:3000 python tests/sony.py
python tests/films.py
```

`pedagogy.py` vérifie les 144 états visuels, les rapports de diamètre, les angles plein format, les paramètres constants de l’expérience de distance, la synchronisation du calculateur, les 29 notions et 87 étapes du lexique, les écrans étroits et l’absence de téléchargements de vidéos décoratives et de moteur 3D dans les ateliers. Les anciennes suites `spatial.py` et `loading.py`, ainsi que les assertions de canevas de `scrolling.py`, concernent le moteur retiré.

## Kit Sony α7 IV

Le profil `sony-a7iv.json` décrit le boîtier ILCE-7M4, le Tamron A063 28–75 mm f/2,8 G2, le Sony SEL85F18 et le Sony SEL35F18F plein format. Il fournit 48 protocoles de cinq étapes et 144 situations. `camera-kit.js` affiche ces protocoles dans les cours, les missions et le mémo ; `#camera` présente les commandes et les trois objectifs. Le générateur éditorial est `scripts/build_sony_profile.py`.

Les focales et ouvertures des ateliers et du calculateur respectent le kit : 28–75 mm et f/2,8–22 pour le Tamron ; 35 ou 85 mm fixes et f/1,8–22 pour les Sony. Le calculateur propose des valeurs d’ouverture compatibles avec ces objectifs. Les modes sont A et S, avec vitesse ou ouverture automatique signalée explicitement. Les réglages sont des points de départ, pas les EXIF des illustrations générées.

Le firmware et les affectations personnalisées de l’utilisateur sont inconnus. Le guide officiel Sony est lié mais son accès depuis cet environnement est bloqué par la politique réseau ; les intitulés et chemins exacts des menus ne sont donc pas présentés comme vérifiés. Aucune manipulation n’a été testée sur un boîtier physique. Les schémas ne sont pas des relevés physiques du matériel.

```sh
python tests/sony.py
```

La suite contrôle les 48 protocoles, les 144 situations, les limites des objectifs, les trois sélections du calculateur, les vues du boîtier et les écrans étroits.

## Étude de mise au point · Runway

La page `#camera` propose trois accès rapides (boîtier, étude filmée, objectifs), une vidéo illustrative et un exercice de cinq minutes à reproduire avec le Tamron à 50 mm. Les raccourcis déplacent aussi le focus clavier sans changer la route de l’application. Le cours de mise au point reste accessible depuis l’exercice.

`assets/focus-study.mp4` est une scène générée avec Runway, accompagnée de `assets/focus-study-poster.jpg`. Elle illustre une intention de mise au point ; elle ne provient pas du Sony et n’est pas une simulation optique quantitative. Aucun son, lecture automatique ou lecteur tiers. Le navigateur affiche l’affiche et charge la vidéo à la demande (`preload="none"`, commandes natives, lecture dans la page sur mobile). Une description textuelle et un téléchargement direct restent disponibles.

Source de génération : tâche Runway `91b28501-5fe1-4497-b014-d376292b4c3e`. Le média est stocké dans le dépôt : aucune URL signée temporaire ni clé API n’est intégrée au site.

## Logo animé FOCAL

Le symbole de l’en-tête est un diaphragme doré généré puis animé avec Runway. La vidéo locale est optimisée pour un affichage de 45 à 62 px, sans audio et sans boucle permanente. Elle joue brièvement à l’arrivée, puis peut être relancée par survol ou focus clavier. Les préférences de réduction des animations et d’économie de données conservent une affiche fixe. Le logo reste un lien vers les cours ; les lecteurs pédagogiques gèrent leur lecture indépendamment de cette animation décorative.

`brand.js` pilote la lecture et le repli statique, `brand.css` conserve les dimensions responsive du symbole, `assets/brand/sources.json` documente les générations Runway.

## Accueil et navigation

La racine, `#home` et l’ancien lien `#courses` affichent l’accueil : présentation de la méthode, quatre accès aux espaces (leçon, matériel, lexique, progression) et huit liens de niveaux. La barre latérale est masquée sur cet accueil uniquement et revient dans les espaces de travail. Le logo et l’entrée « Accueil » y ramènent.

Les pages `#courses/1` à `#courses/8` affichent chacune six liens de leçons compacts, sans grandes vignettes. La recherche porte sur le niveau affiché ; le sélecteur et les liens précédent/suivant permettent de changer de niveau. La page qui regroupait les 48 grandes cartes est remplacée par l’accueil. Les liens directs vers les leçons et les données de suivi restent compatibles. Le bouton principal de l’accueil propose la première leçon ou la reprise de la leçon en cours.
