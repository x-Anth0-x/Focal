# FOCAL Academy

Application en français pour apprendre la photographie, intégrée à partir de la référence fournie.

## Visualiser

Ouvrir `index.html` dans un navigateur : aucune installation nécessaire.

Ou lancer depuis le dépôt :

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

L’application inclut 48 leçons, dont une leçon interactive sur l’ouverture, un simulateur, un quiz et une progression enregistrée dans le navigateur. Export et import du suivi disponibles dans « Ma progression ».

Voir `REFERENCE.md` pour le périmètre pédagogique et les limites du simulateur.

## Interface

`academy.css` contient le thème sombre et doré et les adaptations mobile. `academy.js` organise la leçon en onglets, conserve les interactions existantes et ajoute le parcours par niveau. Le contenu pédagogique et le stockage existants restent compatibles.

`assets/landscape.png` est un visuel généré pour cette interface. Les comparaisons de flou sont illustratives.
