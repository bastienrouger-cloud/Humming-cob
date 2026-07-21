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

> ⚠️ **Quota Netlify épuisé jusqu'au 16/08/2026.** La preview ne se reconstruit plus et
> sert une version périmée du site — ne pas s'y fier pour juger un rendu d'ici là.
> Utiliser le serveur local (voir plus bas).

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

Deux façons de faire, et la seconde est nettement préférable.

### En double-clic (dépannage)

Le site reste 100 % statique — l'option "script de build" a été retenue plutôt que le
`fetch` JS — donc ouvrir `index.html` en double-clic fonctionne. Mais en `file://` :

- les chemins absolus ne se résolvent pas ;
- le navigateur cache le fichier de façon très collante, et on finit par juger un
  rendu qui n'est plus celui du fichier (ça nous a coûté une soirée entière le 21/07) ;
- Claude ne peut pas y accéder pour vérifier le rendu à ta place.

### Avec un serveur local (recommandé)

Depuis la racine du projet :

```
cd ~/Développement/Humming-cob
python3 -m http.server 8000
```

Puis ouvrir **http://localhost:8000/**. Laisser le terminal ouvert pendant la session,
`Ctrl+C` pour arrêter.

Trois avantages :

- les chemins se comportent comme en production ;
- plus de cache capricieux du `file://` ;
- **Claude peut voir le rendu** : le navigateur tourne sur ta machine, donc
  `localhost:8000` lui est accessible et il peut prendre des captures, mesurer les
  éléments et tester différentes largeurs — exactement ce qu'on faisait avec la
  preview Netlify.

Ce dernier point compte d'autant plus depuis que **le quota Netlify est épuisé
jusqu'au 16 août** : la preview ne se met plus à jour, elle sert une version périmée.
Le serveur local est donc le seul moyen fiable de faire valider un rendu.

## Règle d'or

`git pull` en arrivant, `git push` en partant. Sur chaque machine, à chaque session.

## Note

Le doc de référence du projet (`HUMMING_COB_REFERENCE_2.md`) mentionne aussi GitHub Desktop comme outil habituel en plus de la ligne de commande — même logique (`Dev` pour bosser, Pull Request pour passer en `main`), juste l'interface qui change.
