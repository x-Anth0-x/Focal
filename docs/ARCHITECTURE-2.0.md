# Évolution statique, sans réécriture

- `learning-core.js` : règles pures, graphe, estimations, contraintes matérielles et recommandations. Horloge injectée pour tester les révisions.
- `learning-store.js` : contrats de données, stockage versionné, migration, sauvegarde/restauration, correspondance avec l’état historique sans modifier les réponses existantes.
- `learning-ui.js` : diagnostic, profil, compétences, recherche et leçon pilote. Nouvelles routes séparées des routes historiques.
- `data/` : compétences, référentiel cible, diagnostic, pilote, sources et scénarios. Les statuts distinguent disponibilité éditoriale et confiance pédagogique.
- `schemas/` et `scripts/validate_academy.py` : validation structurelle, unicité, références, prérequis sans cycle, évaluations et complétude.

La clé historique est conservée. Le modèle de maîtrise utilise une autre clé versionnée. Un export contient les deux ; un import ancien ne supprime pas un profil plus récent. Une mission cochée dans l’ancien suivi n’est pas une preuve automatique de maîtrise.

GitHub Pages reste la cible. Aucun envoi de données personnelles ni API d’IA n’est nécessaire. Une future synchronisation exige un service optionnel authentifié, un consentement explicite, une politique de conflits par identifiant/version et la conservation d’un export local. Aucune synchronisation entre appareils n’est annoncée comme implémentée.
