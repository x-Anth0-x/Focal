# FOCAL Academy — Fondation web premium

Cette branche fournit une **nouvelle base frontend** directement dans le dépôt, pas une image de présentation.

## Démarrage
Ouvrir `index.html` avec un navigateur connecté à Internet. Le projet fonctionne sans compilation. Pour une prévisualisation locale plus représentative, lancer `python -m http.server 8000` puis ouvrir `http://localhost:8000`.

## Écrans
- Tableau de bord photographique, progression et navigation persistante
- Catalogue des 48 leçons réparties en 8 niveaux (titres structurés)
- Leçon de référence sur ouverture / profondeur de champ
- Studio interactif : ouverture, focale, distance de mise au point, capteur
- Progression locale exportable et importable au format JSON

## Ce qui n'est PAS encore livré
- Les 47 cours détaillés complets ne sont **pas** importés : le catalogue contient seulement leurs titres.
- Les photos distantes Unsplash sont des illustrations d'interface, **pas** des séries comparatives contrôlées. Leur disponibilité dépend du réseau et de leurs conditions de licence respectives. Il faut remplacer ces dépendances par une médiathèque autorisée et auto-hébergée avant la production.
- Le simulateur calcule des grandeurs optiques approximatives (modèle de lentille mince, cercle de confusion choisi). Il ne génère pas un flou physique de la photo affichée.
- Tests manuels réels iPhone / Android / Desktop et audit d'accessibilité à exécuter.
- Authentification, synchronisation entre appareils et hébergement de production non inclus.

## Design system
Thème bleu-noir, accents or, police Manrope / DM Sans, barres et cartes compactes, navigation fixe sur ordinateur et panneau mobile, structure responsive.

## Travail restant pour une véritable version commercialisable
1. Importer les contenus existants des 48 leçons sous une structure de données versionnée.
2. Remplacer les images distantes par des ressources locales autorisées.
3. Ajouter quiz/exercices corrigés et séparation entre « lu » et « compétence validée ».
4. Auditer la navigation clavier, les performances et les captures comparatives sur appareils réels.

Les changements sont proposés dans une pull request. La branche `main` reste intacte.