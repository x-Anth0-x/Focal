# Livraison FOCAL Academy 2.0 — phases 1 et 2

## Périmètre réellement livré

Le site statique existant évolue sans changement de framework. Ses 48 identifiants, routes, lectures, quiz, missions et carnets historiques restent accessibles. L’audit préalable et ses tests de référence sont dans `AUDIT-2.0.md`, l’inventaire dans `lesson-inventory.json`, les décisions techniques dans `ARCHITECTURE-2.0.md`.

| Expérience | Fonctionnement livré |
| --- | --- |
| Accueil | Une action principale expliquée selon profil, diagnostic, erreurs, prérequis et échéances ; compétence travaillée, dernière séance, défi, difficultés et nombre d’applications documentées. |
| Profil | Niveau déclaré, expérience, photo/vidéo, intérêts, objectifs, temps, firmware facultatif, confirmation du Sony et des objectifs disponibles, objectif actif, objectif personnalisé avec limites déclarées. Un seul objectif suffit. |
| Diagnostic | Dix questions, décisions et interprétations de schémas, réponse « Je ne sais pas », corrections immédiates après soumission, estimation initiale prudente. Ce n’est pas un diagnostic exhaustif de tous les domaines. |
| Parcours | Graphe de compétences indépendant du pourcentage de lectures. Les prérequis orientent les recommandations sans verrouiller les cours. |
| Matériel | Captures et paramètres des 48 ateliers bornés aux focales et ouvertures possibles, calculateur et guide filtrés aux objectifs disponibles, missions adaptées. Les exemples historiques de théorie ne sont pas des réglages imposés. |
| Compétences | Découverte, compréhension estimée, application documentée, maîtrise estimée et révision ; preuves, erreurs, dates et règles consultables. Aucun avancement en maîtrise à partir de l’ancien bouton « Mission réalisée ». |
| Missions | Deux essais renseignés avec réglages possibles, observation, justification et critères personnels. Le matériel de la séance est conservé dans l’historique après changement de profil. Aucune analyse de photo n’est simulée. |
| Révision | Échéances persistantes et trois rythmes configurables. Réussir plusieurs fois le même jour ne fait pas sauter les intervalles. Révisions accessibles depuis les compétences et proposées par l’accueil. |
| Première leçon | `#learn/N01-L01` : six chapitres, objectif observable, prérequis, notions définies en contexte, schéma interactif propre, commandes Sony sourcées, exercices guidé et autonome, erreurs, six questions corrigées, mission et critères, mémo, prolongements et sources. L’ancienne route et son carnet restent disponibles. |
| Bibliothèque | Recherche insensible aux accents dans titres, objectifs et actions ; filtres domaine, niveau, statut et ressources matérielles déclarées. Problèmes et contextes se cherchent dans le champ libre. Les plans ne deviennent jamais de fausses pages de cours. |
| Photo maintenant | Dix situations avec choix parmi les objectifs disponibles, mode A/S, paramètres bornés, AF, lumière, placement, protocole de contrôle, explications et compromis. Assistant déterministe, sans IA ni commande du boîtier. |

La pratique vidéo est recueillie mais le parcours vidéo reste planifié : l’interface le dit. Les intervalles et pourcentages de confiance sont des règles pédagogiques explicites, pas des probabilités mesurées scientifiquement ni une certification.

## Contenu disponible et programme futur

- 48 leçons historiques conservées, dont 46 ont deux questions et une possède déjà cinq questions ; le cours historique de découverte conserve ses deux questions.
- Une version guidée complète du premier cours ajoute six questions et une mission détaillée, sans effacer l’ancienne version.
- Dix questions de diagnostic. Au total : 99 questions historiques et 16 nouvelles situations d’évaluation. Le fichier de révision réemploie les questions historiques : il n’est pas compté comme du contenu supplémentaire.
- 240 entrées distinctes dans 27 domaines : 48 cours accessibles et **192 plans sans contenu de cours**, marqués `planned` / `outline-only`, sans route active. Les compétences correspondantes sont non évaluables.
- Les objectifs 1 000 exercices, 500 cas, 1 500 questions, 300 fiches et 100 dépannages sont enregistrés comme objectifs futurs.

## Fichiers et séparation des responsabilités

- `learning-core.js` : règles pures, graphes, estimation, révisions, contraintes matérielles et scénarios.
- `learning-store.js` : validation des sauvegardes, calcul des scores à partir des réponses, migration versionnée et stockage.
- `learning-ui.js` et `learning.css` : nouveaux écrans accessibles au clavier, formulaires et rendu responsive.
- `data/academy-v2.json`, `equipment.json`, `diagnostic.json`, `pilot-first-shot.json`, `review-bank.json` : données éditoriales, sources, matériel et évaluations.
- `schemas/*.schema.json` et `scripts/validate_academy.py` : contrats typés, références, absence de cycles, unicité, quiz et complétude.
- `academy.js`, `camera-kit.js`, `diagrams.js`, `index.html` : points d’intégration limités, conservation des routes et nouveaux liens.
- `sony-a7iv.json` et son générateur : statut documentaire actualisé pour le périmètre effectivement consulté.
- `tests/learning-core.cjs`, `tests/learning-ui.py` : règles déterministes, migrations, matériels, formulaires, preuves, échéances, sauvegardes, onglets et responsive.

## Données et récupération

`focal_academy_web_v1` reste le suivi historique. `focal_academy_learning_v2` contient séparément profil, diagnostic, réponses stables, essais documentés et calendrier. La migration de l’ancien suivi ne copie aucune maîtrise. Une migration explicite du premier contrat pédagogique vers le contrat 2 ajoute le calendrier.

« Ma progression » exporte les deux modèles. L’import d’un export historique conserve le nouveau profil ; un export complet restaure les deux après validation. Une version future inconnue ou un score incohérent est rejeté avant remplacement. Un import est limité à 8 Mo. Un stockage pédagogique illisible reste exportable brut depuis les compétences ; il n’est pas effacé automatiquement.

Les écritures relisent l’état courant pour conserver les changements d’autres onglets. Un avertissement permet d’actualiser la vue sans détruire un formulaire en cours. Deux écritures exactement simultanées ne bénéficient pas d’une transaction distribuée : une synchronisation entre appareils demande le futur service optionnel décrit dans l’architecture. Limites actuelles du journal : 300 évaluations, 100 séances ; leur dépassement est refusé explicitement, sans purge silencieuse.

## Validation

Serveur local depuis la racine du dépôt :

```sh
python3 -m http.server 3000
```

Outils de développement uniquement : Node, Python, `jsonschema`, Playwright et Chromium. Aucune dépendance de production ajoutée. `requirements-dev.txt` déclare les outils Python ; `.github/workflows/quality.yml` exécute le validateur et les suites à chaque pull request et publication sur `main`.

```sh
python3 scripts/validate_academy.py
FOCAL_URL=http://127.0.0.1:3000 python3 tests/learning-ui.py
FOCAL_URL=http://127.0.0.1:3000 python3 tests/smoke.py
FOCAL_URL=http://127.0.0.1:3000 python3 tests/pedagogy.py
FOCAL_URL=http://127.0.0.1:3000 python3 tests/sony.py
python3 tests/films.py
```

Le validateur comprend les tests du moteur : 576 configurations bornées, 30 combinaisons situation/objectif, étapes de preuve, délais, migrations et défaillances du stockage. La suite débutant couvre 144 états avec un seul objectif et 50 combinaisons écran/route, le diagnostic, le pilote, la révision avec horloge contrôlée, les imports anciens/complets/corrompus et la préservation d’un brouillon inter-onglets. Les suites historiques couvrent les 48 cours et 144 situations, 29 termes et 87 étapes, optique, carnets, validations, export/import et mobile. Les anciennes suites du moteur 3D retiré ne sont pas revendiquées comme suites actuelles.

## Limites et prochaines étapes

1. Consolider éditorialement les 47 autres cours avec le format du pilote : les cours courts ne deviennent pas « complets » grâce à leurs métadonnées. Diversifier les évaluations et ajouter de vraies photos comparatives documentées.
2. Phase 3 : guide Sony exhaustif, fiches fabricant des objectifs et vérification sur matériel/firmware. Seules les pages officielles liées dans les sources ont été consultées ; aucun test physique n’est annoncé.
3. Phase 4 : compléter les quinze laboratoires, avec modèles explicités et comparaisons réelles. Les schémas existants sont conservés ; aucune nouvelle vidéo générée ne prétend démontrer un résultat optique.
4. Phase 5 : rédiger et vérifier progressivement les 192 plans et enrichir l’index avec problèmes, contextes et accessoires structurés.
5. Phase 6 : import volontaire des photos, EXIF, portfolio et éventuelle synchronisation. Aucune de ces capacités futures n’est annoncée comme implémentée.

## Publication et retour arrière

GitHub Pages sert la racine de `gh-pages`. Après vérification, pousser la branche de travail, ouvrir et fusionner la PR vers `main`, puis avancer `gh-pages` sur le commit fusionné sans forcer. Vérifier le statut Pages, le HTML public, les nouveaux fichiers et les parcours débutant en navigation privée. Les nouveaux scripts et données portent un identifiant de cache explicite dans leur URL ; aucun service worker ne conserve une ancienne application.

Un retour au commit précédant la livraison restaure l’application antérieure ; l’ancienne clé de progression reste lisible. Les données pédagogiques supplémentaires restent dans leur clé séparée et peuvent être restaurées en redéployant cette version. Exporter avant toute opération manuelle de restauration.
