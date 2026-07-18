# HUMMING COB — Document de référence projet
> À coller dans le contexte du Projet Claude à chaque nouvelle session.
> Mettre à jour après chaque session importante.

---

## 1. Identité du projet

- **Nom** : Humming Cob
- **Nature** : Site vitrine d'un élevage de chevaux Irish Cob
- **URL live** : https://hummingcob.fr
- **Équipe** :
  - Bastien → technique, code, GitHub
  - Alice → contenu, textes, expertise bloodlines (utilise ChatGPT pour la rédaction)

---

## 2. Hébergement & déploiement

- **Hébergement** : GitHub Pages (compte `bastienrouger-cloud`)
- **Domaine** : OVH → `hummingcob.fr` (custom domain configuré dans GitHub Pages)
- **Branche live** : `main` — protégée, push direct bloqué, merge via Pull Request uniquement
- **Branche de test** : `dev` — terrain de jeu, preview automatique via Netlify
- **Preview Netlify** : https://humming-cob-dev.netlify.app (se met à jour à chaque push sur `dev`)
- **Emails** : Google (Gmail), balises Google Stats intégrées dans le code HTML
- **Images** : compressées via `compress_images.py` avant intégration

---

## 3. Stack technique

- HTML5 / CSS3 / JavaScript vanilla — pas de framework, pas de build tool
- Pas de backend — site 100% statique
- Chargement des polices via Google Fonts (import dans style.css)
- Données chevaux : fichiers `.js` (choix délibéré — évite les problèmes CORS sur `file://`)
- Pas de gestionnaire de paquets (npm, etc.)

---

## 4. Structure des fichiers

```
hummingcob.fr/
├── index.html               → Page d'accueil
├── elevage.html             → Présentation de l'élevage
├── reproducteurs.html       → Liste des reproducteurs (cards)
├── poulains.html            → Liste des poulains (cards)
├── frise.html               → Notre histoire (frise chronologique interactive JS)
├── arbre-genealogique.html  → Arbre généalogique (JS)
├── accouplement.html        → Outil test d'accouplement / consanguinité (JS complexe)
├── memoire.html             → Page mémoire (chevaux décédés)
├── style.css                → Feuille de style globale UNIQUE
├── compress_images.py       → Script de compression images
├── CNAME                    → Domaine custom OVH
├── .gitignore
├── css/                     → Styles complémentaires éventuels
├── js/                      → Scripts JS
│   └── donnees-chevaux.js   → Données exclusivement pour accouplement.html (format .js, pas .json — choix CORS)
├── img/                     → Images du site
├── reproducteurs/           → 1 fichier HTML par reproducteur + page "comment acheter"
│                              ⚠️ données du cheval intégrées directement dans le HTML, aucune dépendance externe
└── poulains/                → 1 fichier HTML par poulain + page "comment acheter"
                               ⚠️ données du cheval intégrées directement dans le HTML, aucune dépendance externe

Note architecture : arbre-genealogique.html est également autonome — ses données sont dans le HTML, aucune dépendance externe.
```

---

## 5. Design system

### Palette (variables CSS dans `:root`)
```css
--cream:    #FDFCF8   /* fond principal */
--ink:      #1C1812   /* texte principal */
--rose:     #C4788A   /* couleur d'accent principale */
--rose-lt:  #F0D8DE   /* rose clair, fonds secondaires */
--gold:     #9E8054   /* accent secondaire (peu utilisé) */
--mid:      #6B6055   /* texte secondaire, labels */
--border:   #E2DDD6   /* bordures, séparateurs */
```

### Typographie
```css
--serif:  'Cormorant Garamond'  /* titres, noms, éléments élégants */
--sans:   'Jost'                /* corps de texte, nav, labels, boutons */
```

### Conventions typographiques
- Titres : `font-family: var(--serif)`, `font-weight: 300`
- Corps : `font-family: var(--sans)`, `font-weight: 300`, `font-size: .95rem`
- Labels/tags : `font-size: .72rem`, `letter-spacing: .12em`, `text-transform: uppercase`
- Boutons : uppercase, `letter-spacing: .1em`, bordure fine

### Composants globaux disponibles dans style.css
- `.container` → max-width 1100px, centré
- `.section` / `.section--alt` → blocs de page
- `.divider` / `.divider--center` → trait rose décoratif
- `.tag` → label rose uppercase
- `.btn` / `.btn--rose` → boutons
- `.nav` → navigation sticky
- `.hero` → hero pleine hauteur avec gradient radial
- `.about-grid` / `.about-grid--reverse` → grille 2 colonnes texte/image
- `.repro-card` → card reproducteur
- `.poulain-card` → card poulain avec hover effect
- `.gallery-grid` → galerie 2fr/1fr
- `.footer` → pied de page centré
- `.back-link` → lien retour avec flèche
- Responsive : breakpoint unique à 768px

---

## 6. Outil accouplement (accouplement.html)

Outil maison de calcul de consanguinité — le plus complexe du site.

- **Algorithme** : méthode de Wright / Henderson (matrice de parenté numérique)
- **Données** : chargées depuis `js/donnees-chevaux.js`
- **Statut** : validé et audité — 572 couples testés, 7/7 tests non-régression OK
- **Bug corrigé** : l'ancienne fonction retournait exactement la moitié de la valeur correcte sur les pédigrées avec ancêtres communs imbriqués
- **Coefficient de référence** : Avantgarde = 5.47%
- **Fonction clé** : `validateImport` couvre 4 modes de défaillance silencieux

### UX à améliorer (liste en attente)
- Message de bienvenue : ajouter une phrase d'explication du but de l'outil
- Badge visible : "pédigrée incomplet = valeur plancher"
- Clarifier le codage couleur des souches
- Citer les guidelines de génétique des populations pour les seuils

---

## 7. Conventions de construction des pages

### Structure HTML type d'une page
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- SEO meta + OG tags -->
  <link rel="stylesheet" href="/style.css"> <!-- ou chemin relatif selon profondeur -->
  <title>Page — Humming Cob</title>
</head>
<body>
  <nav class="nav">...</nav>
  <main>
    <!-- sections avec classes du design system -->
  </main>
  <footer class="footer">...</footer>
</body>
</html>
```

### Règles importantes
- **Un seul style.css global** — ne pas créer de CSS inline ou de balises `<style>` dans les pages
- Les pages dans `/reproducteurs/` et `/poulains/` utilisent des chemins relatifs `../style.css`
- Toujours utiliser les variables CSS, jamais les valeurs en dur
- Images toujours compressées avant commit via `compress_images.py`

---

## 8. Workflow Git

### Règle absolue
> ⚠️ `main` est protégée — push direct bloqué par GitHub. Tout passe par `dev` puis Pull Request.

### Source de vérité
- **GitHub est la source de vérité** — Google Drive abandonné
- Bastien travaille depuis le clone local sur Windows ou Mac via GitHub Desktop
- Alice édite directement sur GitHub

### Workflow standard
```
1. Basculer sur dev dans GitHub Desktop
2. Coder / modifier
3. Committer via GitHub Desktop
4. Push → Netlify preview se met à jour automatiquement
5. Envoyer l'URL preview à Alice pour validation
6. Si OK → Pull Request sur github.com → merge dev dans main
7. GitHub Pages déploie automatiquement → hummingcob.fr mis à jour
```

### Commandes Git (si ligne de commande)
```bash
git checkout dev              # basculer sur dev
git add .                     # stager les modifs
git commit -m "description"   # committer
git push origin dev           # pousser → Netlify se met à jour
# merger via Pull Request sur github.com
```

---

## 9. Points à refaire / dette technique connue

- [ ] Hero Cards style RSI sur la section "Nos chevaux" de l'index
- [ ] Créer `contact.html` dédiée (les 9 pages chevaux individuelles renvoient toutes vers `#contact` de l'index — pas idéal)
- [ ] Révision globale du design (site "premier projet", des choses à refaire)
- [ ] UX améliorations outil accouplement (voir section 6)
- [ ] Vérifier la cohérence des chemins relatifs entre pages racine et sous-dossiers

---

## 10. Ce que Claude doit savoir sur le contexte

- Bastien est infirmier libéral en reconversion partielle vers le web dev
- Ce site est aussi un projet portfolio pour démarcher des clients web
- **Google Drive abandonné** comme source de vérité — GitHub uniquement désormais
- Alice édite directement sur GitHub, données chevaux supplémentaires fournies par Alice via Google Drive si besoin
- Un client potentiel (clinique vétérinaire, via Joelle) a été identifié
