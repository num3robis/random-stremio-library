# Random Library

Add-on Stremio qui tire au hasard des films et séries de ta bibliothèque Stremio.

Il ajoute deux catalogues dans Stremio (Découvrir) :

- **Films au hasard**
- **Séries au hasard**

Chaque catalogue affiche une sélection aléatoire d'éléments de ta bibliothèque, avec des filtres :

- **Durée** : par exemple < 90 min, 90-120 min, > 2h30 pour les films ; < 30 min, 30-60 min, > 60 min pour les séries.
- **Période** : avant 1980, 1980-1999, 2000-2009, 2010-2019, 2020 et après.
- **Vu / Pas vu** : filtre sur l'état de visionnage.
- **Nombre** : 1, 3, 5 ou 10 éléments.

Les durées et années viennent de Cinemeta. Les éléments sans information de durée ou d'année sont exclus dès qu'un filtre correspondant est actif.

## Fonctionnement

1. Une page de configuration (`/configure`) demande ton **authKey Stremio**.
2. L'add-on lit ta bibliothèque via l'API Stremio, puis renvoie une sélection aléatoire à chaque ouverture du catalogue.
3. Le lien d'installation généré contient ta clé : il donne un accès en lecture à ta bibliothèque. Ne le partage pas.

## Stack

- Node.js 20+
- TypeScript
- Express
- [stremio-addon-sdk](https://github.com/Stremio/stremio-addon-sdk)

## Lancer en local

Prérequis : Node.js 20 ou plus récent.

```bash
git clone https://github.com/num3robis/random-stremio-library.git
cd random-stremio-library
npm install --registry https://registry.npmjs.org/
npm run dev
```

Le serveur écoute sur le port `7000` par défaut (variable d'environnement `PORT` pour le changer).

Ensuite :

1. Ouvre http://localhost:7000/configure
2. Saisis ton authKey Stremio et choisis le nombre d'éléments par défaut.
3. Clique sur le lien d'installation généré pour ajouter l'add-on à Stremio.

Pour lancer la version compilée :

```bash
npm run build
npm start
```

## Scripts

| Script          | Rôle                                          |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Serveur de développement avec rechargement    |
| `npm run build` | Compile le TypeScript dans `dist/`            |
| `npm start`     | Lance la version compilée (`dist/index.js`)   |
| `npm run typecheck` | Vérifie les types sans générer de fichiers |

## Structure

- `src/index.ts` : serveur Express et routes
- `src/manifest.ts` : manifest Stremio, catalogues et extras
- `src/addon.ts` : logique de sélection aléatoire
- `src/filters.ts` : options et règles de filtrage
- `src/cinemeta.ts` : récupération des durées et années (avec cache)
- `src/stremioApi.ts` : connexion à Stremio et lecture de la bibliothèque
- `src/configure.ts` : page de configuration

## Limites connues

- Le filtre **Vu / Pas vu** repose sur les champs d'état de l'API Stremio, leur interprétation n'est pas encore vérifiée sur tous les comptes.
- Avec des filtres de durée ou de période, la recherche est bornée (nombre de vérifications et délai) pour éviter les timeouts de Stremio : il peut donc renvoyer moins d'éléments que demandé.
