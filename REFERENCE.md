# FOCAL Academy — Application web responsive

## Démarrage
Ouvrir `index.html` sur ordinateur ou téléphone depuis un hébergement statique. Le fichier HTML est autonome et fonctionne aussi hors ligne depuis un ordinateur. Sur iOS, pour une expérience fiable et le stockage persistant, héberger les fichiers via HTTPS (GitHub Pages, Netlify, etc.). Aucun compte ni serveur n’est requis.

## Architecture
- `index.html` : application autonome, interface, styles, logique, simulateur, 48 fiches intégrées.
- `curriculum.json` : catalogue et contenus existants des 48 leçons (source de données réutilisable).
- `lesson_reference.json` : modèle de leçon finalisée, six chapitres, cinq questions argumentées.
- Stockage : `localStorage`, export/import JSON.

## Ce qui est réellement livré
- 1 leçon de référence complète sur l’ouverture, six chapitres, laboratoire interactif avec calcul indicatif des limites de profondeur de champ, mission, quiz corrigé, progression.
- 47 leçons antérieures consultables en lecture, non certifiées ni multimédia-finalisées.
- Interface responsive, navigation, recherche, sauvegarde, export/import.

## Limites techniques et scientifiques
- Visuel du portrait dessiné par code : illustration, non photographie, et le flou affiché n’est pas une simulation optique quantitative.
- Calcul de profondeur de champ : modèle de lentille mince, capteur plein format et cercle de confusion conventionnel de 0,03 mm. Les valeurs dépendent du critère de netteté et de l’affichage.
- Le compteur « 48 leçons marquées » combine lectures et validation du pilote : ce n’est pas une certification de compétences.
- Aucune série photographique contrôlée n’est incluse. Aucune validation scientifique exhaustive des 47 autres cours n’est revendiquée.
- Application sans framework pour faciliter l’essai immédiat et l’intégration progressive ; pour un produit à grande échelle, séparer composants, tests et contenu lors du passage à une chaîne de build.

## Extension
Dupliquer le schéma de `lesson_reference.json` pour chaque leçon, créer une interaction pertinente propre à chaque notion et associer des médias sourcés avec réglages documentés. Conserver les IDs N01-L01…N08-L06 pour la compatibilité des suivis.
