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
- **Atelier visuel** : schéma propre à la notion, trois situations commentées et une comparaison côte à côte.
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

Pour enrichir une leçon, conserver son identifiant `Nxx-Lxx`. Modifier ses textes dans `lesson-content.json`, et son schéma dans `visuals.js`. Les illustrations générées ne sont pas des photographies comparatives contrôlées. Les ateliers SVG sont des schémas explicatifs, pas des simulations quantitatives. Le calcul optique annonce séparément ses hypothèses.

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
