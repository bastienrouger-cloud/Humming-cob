# Pense-bête workflow git — Humming Cob

## En arrivant sur une machine

```
git checkout Dev
git pull
```

## Pendant que tu codes

Tu modifies tes fichiers normalement — **sauf le header et le footer**.

### ⚠️ Header et footer : ne jamais les éditer dans les pages

Depuis la mise en place des partials, la nav et le footer sont générés. Dans chaque page HTML tu verras :

```html
<!-- @partial:header -->
   ... contenu généré — toute modif ici sera écrasée ...
<!-- @end:header -->
```

Pour changer le menu ou le pied de page :

1. éditer `partials/header.html` ou `partials/footer.html`
2. lancer `python3 build.py` à la racine
3. commiter les partials **et** les pages régénérées

Les partials utilisent deux jetons, remplacés automatiquement selon l'emplacement de la page :

- `{{base}}` → `` à la racine, `../` dans `reproducteurs/` et `poulains/`
- `{{home}}` → `` sur l'accueil (donc `#contact`), `index.html` ou `../index.html` ailleurs

Donc on écrit `{{base}}elevage.html` et `{{home}}#contact`, jamais de chemin en dur.

### Vérifier avant de commiter

```
python3 build.py --check
```

Ne modifie rien, signale juste les pages qui ne sont plus à jour (code de sortie 1). Le réflexe à prendre avant un push.

### Deux pages hors système

`frise.html` et `arbre-genealogique.html` n'ont ni nav ni footer (choix d'origine, header custom pour la frise). Le build les ignore et le signale à chaque exécution — c'est normal, pas une erreur.

## Pour sauvegarder ton avancée (sur `Dev`)

```
git add .
git commit -m "message court décrivant ce qui a changé"
git push
```

## En partant d'une machine

```
git push
```

(déjà fait si tu as suivi l'étape du dessus — juste le réflexe à vérifier avant de fermer le capot)

## Basculer entre les branches

```
git checkout main    # version stable, en prod sur hummingcob.fr
git checkout Dev     # version de travail
```

## Passer de Dev à main : Pull Request obligatoire

Différence importante avec d'autres projets : sur Humming Cob, `main` est **protégée**. Impossible de la merger ou d'y push directement, même en ligne de commande — tout passe par une Pull Request sur GitHub.

```
1. push sur Dev            → Netlify preview se met à jour automatiquement
2. (si besoin) envoyer l'URL de preview à Alice pour validation :
   https://humming-cob-dev.netlify.app
3. Si c'est bon → ouvrir une Pull Request sur github.com (Dev → main)
4. Merge la PR           → GitHub Pages redéploie → hummingcob.fr à jour
```

## Voir une branche sur GitHub (navigateur)

https://github.com/bastienrouger-cloud/Humming-cob
→ menu déroulant en haut à gauche de la liste des fichiers → choisir `main` ou `Dev`.

## Tester le site en local

Pas de contrainte : le site reste 100 % statique. L'option "script de build" a été retenue plutôt que le `fetch` JS, donc **ouvrir `index.html` en double-clic fonctionne toujours**, sans serveur.

Un serveur local reste possible si tu préfères tester avec de vraies URL :

```
python3 -m http.server 8000
```

## Règle d'or

`git pull` en arrivant, `git push` en partant. Sur chaque machine, à chaque session.

## Note

Le doc de référence du projet (`HUMMING_COB_REFERENCE_2.md`) mentionne aussi GitHub Desktop comme outil habituel en plus de la ligne de commande — même logique (`Dev` pour bosser, Pull Request pour passer en `main`), juste l'interface qui change.
