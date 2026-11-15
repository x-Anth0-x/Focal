# Audit avant évolution — FOCAL Academy 2.0

Audit du 15 novembre 2026, avant toute modification applicative de cette phase. Référence : `dec8e2c71e87bde6c3fbb57a40a56290c5218f1b`.

## Version réellement publiée

GitHub Pages sert la racine de `gh-pages`. Les branches `main` et `gh-pages` pointaient toutes deux sur la référence ci-dessus. Le HTML téléchargé depuis le domaine public est identique octet pour octet à la source ; il charge `academy.js?v=20261115-12` et `diagrams.js?v=20261115-12`. Le statut Pages était `built`.

## Inventaire et architecture

91 fichiers suivis : application statique sans dépendance de production, 48 leçons stables `N01-L01` à `N08-L06`, 29 termes, 144 situations, trois objectifs de référence, un boîtier Sony. `academy.js` regroupe routes, DOM, quiz et suivi ; les schémas, le matériel, le lexique et les médias sont déjà séparés. Les données sont six JSON historiques et un registre de médias. Les scripts associés et les suites ont été examinés ; l’inventaire de chaque leçon figure dans `lesson-inventory.json`.

Les six premières leçons possèdent six chapitres explicitement rédigés. Les 42 suivantes utilisent un assemblage d’explication, situations, mission et synthèse : ce rendu ne suffit pas à en faire des leçons éditorialement complètes. La banque complémentaire contient 96 questions ; la leçon d’ouverture emploie à leur place cinq questions dans `lesson_reference.json`. Il y a donc 99 questions effectivement proposées, avec deux questions pour 47 leçons et cinq pour la leçon d’ouverture. Les deux objectifs génériques ajoutés à presque toutes les leçons ne sont pas une cartographie de compétences.

## Priorités constatées

| Priorité | Constat | Décision pour les phases 1–2 |
| --- | --- | --- |
| P0 | Les trois objectifs sont présentés comme possédés sans confirmation. | Profil matériel déclaré, adaptation bornée aux objectifs disponibles ; exemples non confirmés identifiés. |
| P0 | Progression stockée dans `focal_academy_web_v1` ; les index de questions sont persistants. | Préserver cette clé et ces index, nouveau modèle versionné séparé, sauvegardes et import rétrocompatibles testés. |
| P1 | Validation personnelle = quiz court + mission cochée. | Ne pas la migrer en maîtrise ; modèle séparant découverte, compréhension, application documentée, maîtrise estimée et révision. |
| P1 | Prérequis historiques presque entièrement linéaires, sans graphe de compétences. | Graphe pédagogique indépendant et contrôlé, sans bloquer les anciens liens. |
| P1 | Pas de diagnostic, de profil, de révision ni de prochaine action expliquée. | Diagnostic contextualisé, recommandations transparentes, tableau de bord et révisions paramétrables. |
| P1 | Pas de leçon réunissant les 20 éléments demandés avec sources et 5 évaluations variées. | Leçon pilote détaillée liée à l’identifiant existant de découverte du boîtier, avec statut documentaire et limites explicites. |
| P2 | 48 leçons ne couvrent pas 27 domaines professionnels ; pas de statuts éditoriaux ni de schémas de contenus. | Référentiel de 240 entrées dont les contenus non rédigés sont « planifiés », inventaire et contrats validés. |
| P2 | Recherche limitée au niveau ou au lexique. | Index transversal filtrable, incluant matériel et statut, sans présenter les entrées planifiées comme des cours disponibles. |
| P2 | Guide Sony schématique et procédures non testées physiquement. | Sources officielles consultées pour le pilote ; guide exhaustif, firmware et validation physique restent phase 3. |
| P2 | Médias générés et ancien moteur 3D conservés dans le dépôt. | Ne pas les réactiver comme preuves optiques ; préserver les schémas calculés et leurs limites. |

## Ce qui reste conservé

Tous les identifiants et liens historiques, les 48 cours, les missions, le carnet, les réponses, les validations personnelles, les marqueurs de lecture, l’import/export, les raccourcis clavier, la synchronisation inter-onglets, les modèles pédagogiques déterministes, le calculateur et l’identité sombre/dorée. Aucune réécriture de framework ou infrastructure serveur n’est justifiée pour ces phases.

## Tests de référence exécutés avant les modifications

`tests/smoke.py`, `tests/pedagogy.py`, `tests/sony.py` et `tests/films.py` : tous passants. Ils couvrent les 48 parcours, quiz et notes, export/import et reprise de données, 144 associations/états, 29 notions, 87 étapes, calculs et responsive. Les suites `spatial.py` et `loading.py` visent un moteur retiré ; les assertions de canevas de `scrolling.py` sont historiques. Elles ne sont pas revendiquées comme suites actuelles vertes.

## Sources vérifiées pour le socle

Le guide officiel Sony français est accessible à nouveau. Les pages « Avant », « Arrière », « Face supérieure », les sélecteurs, P/A/S/M, Mode mise au pt, Zone mise au pt et ISO AUTO vit.ob min ont été consultées le 15 novembre 2026. Cela vérifie les libellés documentaires, pas leur présence sur le firmware et les boutons personnalisés d’un appareil physique. Les futurs contenus ne doivent pas généraliser cette vérification aux autres fonctions ou aux objectifs non documentés.

## Portée de livraison

Les phases 1 et 2 livrent un socle fonctionnel, un diagnostic, un profil, une adaptation matérielle, un moteur explicable et un pilote. Les objectifs 1 000 exercices, 500 cas, 1 500 questions, 300 fiches et 100 dépannages sont une cible éditoriale future, pas un volume déclaré disponible.
