# Pense-bête workflow git — Humming Cob

## En arrivant sur une machine

```
git checkout Dev
git pull
```

## Pendant que tu codes

Rien de spécial, tu modifies tes fichiers normalement.

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

Pour l'instant, pas de contrainte particulière : le site est encore 100 % statique (pas de header/footer chargés en JS via `fetch`), donc ouvrir `index.html` en double-clic fonctionne normalement.

⚠️ Ça changera le jour où les partials header/footer seront en place (voir `ROADMAP.md`, section 0) — **si on part sur l'option "fetch JS"** (celle utilisée dans le projet dont vient ce doc), il faudra repasser par un serveur local à chaque test :

```
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000 — à cause du blocage CORS sur `file://` et des chemins racine-relatifs. Si on part sur l'option "script de build" à la place, cette contrainte ne s'applique pas : le site reste double-cliquable.

## Règle d'or

`git pull` en arrivant, `git push` en partant. Sur chaque machine, à chaque session.

## Note

Le doc de référence du projet (`HUMMING_COB_REFERENCE_2.md`) mentionne aussi GitHub Desktop comme outil habituel en plus de la ligne de commande — même logique (`Dev` pour bosser, Pull Request pour passer en `main`), juste l'interface qui change.
