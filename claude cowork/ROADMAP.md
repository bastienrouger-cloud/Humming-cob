# Roadmap — Humming Cob

> Converti depuis `roadmap-interactif.html` (checklist JS avec sauvegarde navigateur) vers ce fichier Markdown, pour cocher directement dans l'éditeur / sur GitHub. Coche au fur et à mesure avec `- [x]`.

---

## 0. 🔧 Réorganisation de l'architecture (priorité actuelle)

Étape ajoutée spécifiquement pour Humming Cob (site déjà en prod, pas un nouveau projet) : le site compte aujourd'hui **19 fichiers HTML** (8 pages racine + 5 fiches `reproducteurs/` + 6 fiches `poulains/`), chacun avec son propre `<nav>` et `<footer>` copiés-collés. Toute modif du menu ou du pied de page doit être répétée 19 fois.

- [x] Auditer l'arborescence actuelle du repo (racine, `css/`, `js/`, `img/`, `reproducteurs/`, `poulains/`)
- [x] Nettoyer les fichiers orphelins repérés à la racine — `style.css` racine et fichier `git` supprimés le 20/07
  <details><summary>Détail</summary>

  - `style.css` à la racine (611 lignes) — non lié par aucune page, `css/style.css` (1677 lignes) est la vraie feuille utilisée. Probablement une version abandonnée à supprimer après vérification.
  - `git` — fichier vide (0 octet) sans extension à la racine, ressemble à une erreur de manip (`git ...` tapé dans le mauvais terminal ?). À vérifier puis supprimer.
  </details>
- [x] Définir l'arborescence cible (dossier `partials/`, séparation claire pages racine / fiches individuelles)
- [x] Créer `partials/header.html` et `partials/footer.html`
  <details><summary>Pourquoi</summary>Un seul fichier source pour le menu et le footer, injecté partout, au lieu de 19 copies à maintenir en parallèle.</details>
- [x] Choisir la méthode d'inclusion — **Option B retenue** : `build.py` en Python (pas de npm, cohérent avec `compress_images.py`), site statique préservé, double-clic conservé. GitHub Action volontairement reportée tant que le besoin ne se manifeste pas.
  <details><summary>Options à trancher</summary>

  - **Option A — include JS au chargement** (`fetch('partials/header.html')`) : zéro outillage à ajouter, mais flash de contenu (FOUC) le temps du fetch, et le menu dépend du JS pour s'afficher.
  - **Option B — petit script de build** (Node ou Python) qui injecte les partials et régénère les fichiers HTML statiques à chaque modif : reste 100 % statique en prod (SEO, perf, accessibilité intacts), mais introduit le premier outil de build de l'historique du site — à documenter dans `HUMMING_COB_REFERENCE.md` si retenu.
  </details>
- [x] Migrer les 19 pages HTML vers le nouveau système de partials — 17 migrées, `frise.html` et `arbre-genealogique.html` hors système (ni nav ni footer d'origine)
- [x] Revérifier la cohérence des chemins relatifs (racine vs `/reproducteurs/` vs `/poulains/`) après migration — dette technique déjà identifiée dans le doc de référence
- [x] Tester chaque page après migration — les 22 pages ont été parcourues depuis, nav et page active vérifiées

---

## 1. Cadrage avant tout code

- [x] Public cible et objectif du site clairement définis — vitrine d'élevage, vente de poulains
  <details><summary>Pourquoi</summary>Qui va utiliser le site, et pour quoi faire (vendre, informer, présenter) ? Ça oriente toutes les décisions de contenu et de structure ensuite.</details>
- [x] Liste des pages nécessaires établie — 22 pages, arborescence stabilisée
  <details><summary>Pourquoi</summary>Éviter de découvrir en cours de route qu'il manque une page — lister toutes les pages avant de coder la première.</details>
- [x] Contenu texte/visuel — contenu réel partout, aucun placeholder
  <details><summary>Pourquoi</summary>Pour un exercice ou un prototype, des placeholders assumés (texte reformulé, images génériques) sont tout à fait valables — pas besoin d'attendre le vrai contenu pour avancer la structure.</details>

## 2. Structure / arborescence

- [x] Sitemap (arborescence des pages) posé — à ne pas confondre avec le `sitemap.xml` du SEO, lui toujours absent (section 8)
  <details><summary>Pourquoi</summary>Un schéma simple de qui pointe vers quoi, même à la main sur papier ou en markdown.</details>
- [x] Pattern de page cohérent identifié et réutilisé — `FICHE-CHEVAL.md` pour les fiches, `.page-header` pour les pages de contenu
  <details><summary>Pourquoi</summary>Plutôt qu'un wireframe formel par page, un pattern réutilisé consciemment page après page (hero + contenu + CTA, par exemple) évite de réinventer la structure à chaque fois.</details>

## 3. Setup technique

- [x] Dossiers de travail créés (`css/`, `js/`, `img/`, `partials/`, `reproducteurs/`, `poulains/`)
- [x] Feuille de style de départ en place — `css/style.css`, feuille unique
  <details><summary>Pourquoi</summary>Un seul fichier CSS au départ, à splitter plus tard seulement si besoin réel — pas d'optimisation prématurée.</details>
- [x] Git initialisé — `main` protégée, `Dev` de travail, PR obligatoire
  <details><summary>Pourquoi</summary>Une branche stable (main) et une branche de travail (dev) séparent le site en ligne du travail en cours.</details>

## 4. HTML d'abord, sans style

- [ ] Structure sémantique complète — il manque toujours `<header>` et `<main>` : `<nav>` et les `<section>` sont directement sous `<body>`
- [x] Header/footer factorisés — `partials/` + `build.py` (voir section 0)
  <details><summary>Pourquoi</summary>Évite de dupliquer le même header/footer dans chaque page HTML — un seul fichier source, injecté partout. Voir section 0 pour le plan d'action détaillé sur Humming Cob.</details>
- [x] Contenu réel dans le HTML
  <details><summary>Pourquoi</summary>Pas de lorem ipsum générique — un placeholder qui ressemble au vrai contenu final donne une bien meilleure idée du rendu.</details>
- [x] Mise en évidence de la page active dans la navigation
  <details><summary>Pourquoi</summary>Petit détail UX facile à oublier — l'utilisateur doit voir immédiatement où il se trouve dans le menu.</details>

## 5. CSS ensuite

- [ ] Approche mobile-first — non : le CSS est écrit desktop-first, avec des `@media (max-width)`. Ça fonctionne, mais c'est l'inverse de la recommandation. Refonte lourde, pas prioritaire.
- [x] Variables CSS pour couleurs/fonts centralisées — bloc `:root`
  <details><summary>Pourquoi</summary>Un seul endroit à changer pour ajuster toute la charte graphique.</details>
- [x] Layout d'abord (grid/flexbox), détails visuels ensuite

## 6. Interactivité (JS) si besoin

- [x] Menu mobile fonctionnel — hamburger + sous-menus dépliables
- [x] Formulaire de contact — opérationnel via Web3Forms
  <details><summary>Pourquoi</summary>Utile pour tester le flux même avant d'avoir un vrai backend de réception.</details>
- [x] Composants interactifs testés — carrousels, lightbox, modales élevage, accordéon FAQ, nav2

## 7. Responsive + tests

- [x] Testé sur un vrai téléphone — iPhone, 21/07 (c'est ce qui a fait ressortir la bande crème sous le footer)
  <details><summary>Pourquoi</summary>Le rebond de scroll (overscroll), les zones tactiles, et certains bugs Safari mobile ne se voient QUE sur un vrai appareil.</details>
- [x] Vérifié sur plusieurs navigateurs — Chrome, Safari, Opera (⚠️ sur iOS tous sont des habillages de WebKit, ça ne vaut pas test multi-moteurs)

## 8. Perf + SEO de base

- [ ] **Images compressées** ⚠️ — `img/` pèse **897 Mo**, dont **233 fichiers de plus
      de 500 Ko**. C'est le plus gros levier de performance du site, et de loin.
      Un `compress_images.py` existe déjà mais n'a manifestement pas été passé partout.
      L'attribut `alt` est en revanche renseigné sur les images vérifiées.
- [x] Meta description par page — sauf `frise.html`
- [ ] Audit Lighthouse passé
- [x] Balises de suivi statistique — **gtag retiré des 19 pages le 20/07** (stats non consultées) → plus de bandeau cookies nécessaire
  <details><summary>Pourquoi</summary>Si un vrai tracking est ajouté, ça implique en toute rigueur un bandeau de consentement cookies (RGPD), même sur un site d'entraînement.</details>
- [ ] **Open Graph par page** — `og:title` et `og:description` sont propres à chaque
      page, mais **10 pages partagent la même `og:image` générique** (`og-preview.jpg`) :
      index, elevage, poulains, reproducteurs, memoire, acheter, frise,
      arbre-genealogique et les deux pages légales. Partager le lien d'une de ces
      pages affiche donc l'aperçu du site, pas son contenu. Les fiches chevaux, elles,
      ont bien leur image propre.
  <details><summary>Pourquoi</summary>Sans ça, partager le lien sur les réseaux ou en message n'affiche ni image ni description propre.</details>
- [x] Favicon en place — jeu complet monogramme HC, 21/07
- [ ] robots.txt + sitemap.xml
  <details><summary>Pourquoi</summary>Pas bloquant pour un site non indexé, mais fait partie du SEO de base d'un vrai déploiement.</details>
- [ ] Page 404 personnalisée

## 9. Déploiement

- [x] Hébergement choisi et fonctionnel — GitHub Pages (prod) + Netlify (preview `Dev`)
- [x] DNS / SSL configurés — hummingcob.fr en HTTPS
- [x] Mentions légales / politique de confidentialité — pages créées le 20/07, **coordonnées de l'éditeur à compléter** (placeholders `[...]` dans les deux fichiers)
  <details><summary>Pourquoi</summary>Obligatoire dès qu'un site français collecte des données (formulaire, analytics) — même un site d'entraînement gagne à s'y habituer.</details>

---

## 💡 Idées à reprendre plus tard

- [ ] **PNG détourés de Nashi** pour décorer les zones vides des fiches poulains (desktop)
  <details><summary>Détail technique — vérifié le 20/07</summary>

  Bastien prépare des PNG de Nashi sans arrière-plan. Objectif : combler les blancs
  du desktop (le mobile, lui, défile bien).

  **Faisable, et pas limité à une seule section** — aucune section n'a d'`overflow:hidden`,
  donc rien ne clippe. Deux approches :

  - *PNG dans une section, en `position:absolute`* : déborde sans problème, mais les
    sections suivantes sont peintes après dans l'ordre du DOM et passeront **par-dessus**
    en cas de débordement vers le bas. Se règle au `z-index`, au prix de passer aussi
    au-dessus du texte voisin.
  - *Conteneur `position:relative` enveloppant plusieurs sections* : plus propre pour un
    render vraiment à cheval sur une frontière — le PNG vit dans son propre plan,
    au-dessus des fonds, sous le texte si besoin.

  Seule contrainte réelle : `body` a `overflow-x: hidden`, donc pas de débordement
  latéral hors viewport (ce qui évite tout scroll horizontal parasite).

  Zones creuses repérées sur la fiche Nashi : marge droite de "Ses bases" (la liste
  n'occupe que la moitié de la largeur) et frontière bases/adoption. Silhouette plutôt
  verticale pour la marge, plutôt horizontale pour un chevauchement de frontière.
  </details>
- [ ] "Aller plus loin" — image du panneau gauche (`.explore-visual`) dynamique
  <details><summary>Détail</summary>

  Desktop : au survol de chaque carte du panneau droit (Notre élevage / Arbre généalogique / Testez un accouplement), l'image affichée dans `.explore-visual` à gauche change pour correspondre à la carte survolée.

  Mobile : le panneau gauche disparaît déjà en `@media(max-width:900px)` — au lieu de le perdre, intégrer l'image directement dans chaque carte (carte plus grande sur mobile, pas de souci vu que la page défile).

  Bloqué pour l'instant : pas encore d'images dédiées aux 3 destinations.
  </details>

---

## 🔍 Audit rapide (constats du code, à date du 18/07/2026)

Points relevés en inspectant les fichiers du repo — pas des cases cochées, juste de quoi t'orienter avant de remplir les sections ci-dessus :

- **Favicon cassé** : toutes les pages référencent `img/favicon.png`, ce fichier n'existe pas dans `img/`.
- **`robots.txt` et `sitemap.xml`** absents à la racine.
- **Pas de page 404** personnalisée.
- ~~Aucune page mentions légales / politique de confidentialité~~ → créées le 20/07. Google Analytics retiré ; reste le formulaire de contact (Web3Forms), couvert par la politique de confidentialité. **Coordonnées légales à compléter.**
- ~~Pas de bandeau de consentement cookies~~ → sans objet depuis le retrait de gtag (20/07).
- ~~Pas de mise en évidence de la page active dans la nav~~ → corrigé le 18/07 (détection dynamique dans `js/main.js`, testée sur les 6 cas de figure + logo mis en avant sur l'accueil, seul cas sans lien de nav correspondant).
- **Pas de balises `<header>`/`<main>` sémantiques** — `<nav>` et les `<section>` sont directement sous `<body>`.
- `frise.html` est la seule page sans meta description.
- Côté positif : variables CSS centralisées ✅, menu mobile fonctionnel ✅, formulaire de contact opérationnel ✅, `alt` renseigné sur les images vérifiées ✅, Git avec branches `main`/`Dev` séparées ✅.

Ces constats viennent de l'inspection du code, pas d'un test utilisateur réel (Lighthouse, vrai téléphone, autres navigateurs) — ces cases-là restent à valider par toi.


---

## 📌 Reste à faire, repéré le 20/07/2026

- [ ] **Compléter les coordonnées légales** dans `mentions-legales.html` et `confidentialite.html` (nom/raison sociale, statut, adresse, SIRET, directeur de publication) — cherche les `[crochets]`
- [x] **Favicon** : corrigé le 21/07 — jeu complet `img/favicon_io/` (ico, 16, 32, apple-touch 180, android 192/512, manifest) câblé sur les 21 pages en chemins **relatifs** (le site doit rester ouvrable en double-clic). `favicon.ico` aussi copié à la racine pour la requête par défaut des navigateurs. Manifest complété (nom, couleurs) et ses chemins d'icônes passés en relatif — ils étaient absolus et renvoyaient un 404.
  <details><summary>Limite connue</summary>

  Les icônes sont générées depuis le logo complet : très belles en 180px,   illisibles en 16px (onglet de navigateur). C'est inhérent au logo — cheval,   arbre et médaillon dans 16 pixels de côté. Un monogramme "HC" seul y gagnerait,   si un fichier source propre existe un jour.
  </details>
- [ ] Décider du sort de `frise.html` et `arbre-genealogique.html` — aujourd'hui sans nav ni footer, donc sans lien de retour vers le site
- [ ] `.gitattributes` (`* text=auto eol=lf`) — hygiène multi-machines Windows/Mac, non urgent
- [ ] Mettre à jour la palette dans `HUMMING_COB_REFERENCE_2.md` : les variables documentées (`--cream`, `--ink`, `--rose: #C4788A`…) ne correspondent plus au CSS réel (`--bg-cream`, `--noir`, `--rose: #D4899A`…)

---

## ✅ Séance du 20/07/2026 (soir) — fiches chevaux + transitions

**Les 10 fiches chevaux sont converties au patron.** Le détail du patron est dans
`FICHE-CHEVAL.md`, qui fait foi ; ci-dessous seulement ce qui a changé ce soir.

- [x] Fiches poulains converties : `nashi`, `omamori`, `orion`, `kaeru`, `Jinba-Ittaï`
  <details><summary>Ce qui diffère des reproducteurs</summary>

  Ni palmarès ni descendance → nav2 *Ses bases · Adoption · Pedigree*. Galerie sombre
  fusionnée dans le carrousel du hero. Pédigrée reconstruit sur 3 générations avec lien
  vers la fiche des parents présents à l'élevage.

  Deux cas particuliers : `kaeru` (né en mai 2026, pas à vendre → *Génétique · Premières
  semaines · Pedigree*, CTA "Suivre son évolution") et `Jinba-Ittaï` (vendue → *Ses bases ·
  Son histoire · Pedigree*, CTA "Voir les poulains disponibles" qui réoriente vers les
  poulains encore là).
  </details>
- [x] Bandeau d'identité (badge + race) sorti au-dessus du hero sur les 10 fiches, pour
      aligner le haut du carrousel sur le `<h1>` — **le fil d'Ariane a été supprimé**
      (la nav principale et la nav2 faisaient déjà le travail)
- [x] Carrousel du hero à hauteur variable sur desktop, borné entre 360px et 760px
- [x] Système de transitions entre sections : `.fade-to-cream` / `.fade-to-light` pour les
      deux crèmes, `.fade-bottom` pour les en-têtes à dégradé diagonal
      <details><summary>Décision à ne pas re-litiger</summary>

      Les raccords vers une section **sombre** (footer, "Aussi disponibles" des fiches
      poulains, citation de `memoire.html`) restent **volontairement francs**. Un fondu a
      été essayé sur les trois, puis retiré. C'est écrit aussi dans le CSS.
      </details>
- [x] `poulains/acheter.html` : HTML cassé réparé (un `<p>` non fermé, un `</div>` orphelin,
      un `<button>` de FAQ non fermé qui avalait sa réponse). **Les 22 pages passent
      désormais le contrôle de balises.**
- [x] Nouvelles classes CSS, en remplacement de styles inline dupliqués : `.horse-tags`,
      `.horse-price` / `.horse-price-row`, `.btn-on-dark`, `.horse-sold-note`,
      `.cta-anchor--center`, `.hero-frame`

### Points ouverts pour la prochaine fois

- [ ] **Badge de statut** : "Vendue" (Jinba) et "Croissance en cours" (Kaeru) utilisent
      exactement le même turquoise, alors que les deux statuts n'ont rien à voir. Mérite
      deux teintes distinctes — pas fait, c'est un choix de design à valider.
- [ ] **Légendes de photos à affiner** : les `data-cap` de `kaeru` étaient tous identiques
      dans l'original, je les ai regroupés par période sans dates précises. Ceux de `nashi`
      sur la série 2026 sont approximatifs.
- [ ] **Kuarahy OMD** (père d'Omamori et Orion) n'est documenté que sur une génération, donc
      son bloc pédigrée affiche des arrière-grands-parents "non renseigné" là où le côté
      maternel remonte bien. À compléter si les données existent.
- [ ] `reproducteurs/` : les 3 juments ont un CTA centré comme les 2 étalons — cohérent,
      mais c'est une harmonisation faite en cours de route, à revalider à l'œil.

---

## ✅ Séance du 21/07/2026 — mobile, favicon, acheter & poulains

### Passe mobile sur les fiches chevaux

- [x] Bandeau d'identité centré sous 900px (il était collé à gauche au-dessus du carrousel)
- [x] CTA flottant élargi aux deux bords
      <details><summary>Cause</summary>

      Il était centré par `left: 50%` + `translateX(-50%)`, donc dimensionné par son
      contenu : "Demander les conditions de saillie" passait sur deux lignes. Ancré sur
      `left`/`right` à 1rem, l'animation ne joue plus que sur Y. Mesuré : 249px → 468px
      sur un écran de 500.
      </details>
- [x] Bouton `#ctaEnd` en fin de page (mobile) : le CTA flottant s'efface en l'atteignant
- [x] Prix et CTA du hero empilés et centrés sous 900px (le `space-between` desktop les
      jetait aux deux bords)
- [x] Corrigé : une règle mobile visait encore `.hero-carousel::before` alors que le liseré
      avait migré vers `.hero-frame` la veille
- [x] Corrigé : le CTA nav2 de Jinba affichait "Poulains disponibles" mais pointait vers
      `#contact` (lien en dur dans le générateur)

### Favicon

- [x] Jeu complet régénéré depuis le monogramme HC fourni par Bastien
      <details><summary>Retouches appliquées à la source</summary>

      L'alpha du détourage GIMP plafonnait à 247 → encre translucide, normalisée à 255.
      Ré-encré en `--noir` plutôt qu'en noir pur. Accentuation légère sur les tailles 16 et
      32 seulement : les variantes épaissies bouchaient les contrepoinçons du C.
      Fonds **opaques crème** et non transparents — iOS compose l'apple-touch-icon sur du
      noir, et un favicon transparent à encre foncée disparaît en thème sombre.
      Ancien jeu (issu du logo complet) conservé dans `img/favicon_io/_ancien-logo-complet/`,
      à supprimer une fois le nouveau validé.
      </details>
- [x] Manifest réparé : ses chemins d'icônes étaient absolus (`/android-chrome-*.png`) alors
      que les fichiers sont dans `img/favicon_io/` → 404. Passés en relatif, `name` et
      couleurs complétés.
- [x] `<meta name="theme-color">` ajouté sur les 21 pages (le manifest ne s'applique qu'en
      mode application installée)

### Bande crème sous le footer sur iPhone — ❌ abandonné

**Le défaut est assumé pour l'instant.** Quatre pistes essayées, aucune retenue. Ne pas
recommencer sans avoir lu ce qui suit (c'est aussi rappelé en commentaire dans le CSS,
au-dessus de la règle `html`).

<details><summary>Ce qui a été essayé et pourquoi ça a échoué</summary>

1. **`html { background-color: var(--noir) }`** → sans effet sur iOS. **WebKit ignore le
   fond de `<html>` pour les zones de rebond** et utilise celui de `<body>`, contrairement
   à la spec et à Chrome. Vérifié en ligne : la règle était bien déployée, la bande est
   restée. Retiré.

2. **`overscroll-behavior-y: none`** → supprimait bien le rebond, donc la bande, mais
   supprimait avec lui **le rafraîchissement en tirant vers le bas**. Trop cher pour un
   défaut cosmétique. Retiré.

3. **Inverser `html` / `body`** (crème en haut, noir en bas) → écarté sans être tenté :
   `.horse-page` porte un `padding-top` de 80px peint avec le fond de `body`, la navbar
   translucide se serait assombrie sur les 10 fiches chevaux.

4. **`viewport-fit=cover`** → écarté : aurait obligé à répercuter `env(safe-area-inset-top)`
   sur trois valeurs couplées (hauteur de la navbar, `padding-top` de `.horse-page`,
   `--nav-h` lu par le JS), sans iPhone pour vérifier.

**À savoir** : sur iOS tous les navigateurs sont des habillages de WebKit, Opera compris.
Le manifest et le mode application n'entraient donc jamais en jeu — les changements de
`theme_color` / `background_color` faits ce jour-là visaient une hypothèse fausse.
</details>

### Cartes

- [x] Habillage "bouton" (`.btn-outline`) porté par `.explore-card` : fond transparent,
      liseré `--rose-deep` 1.5px, coins 26px, remplissage `--rose-pale` au survol.
      Partagé par les 4 cartes (les 3 de "Aller plus loin" + "Notre histoire" du QSN),
      au lieu d'être dupliqué — ce qui supprime au passage un piège d'ordre dans le CSS.
- [x] Émojis uniformisés : 🌸 Notre histoire · 🐴 Notre élevage · 🌳 Arbre généalogique ·
      🧬 Testez un accouplement, dans un `<span class="card-emoji">`
- [x] Titre en flex (émoji / libellé) : sur deux lignes, la seconde s'aligne sous le texte
      et non sous l'émoji, et l'émoji se centre verticalement sur le bloc

### `poulains/acheter.html`

- [x] nav2 à 4 entrées (Étapes · Pratique · Inclus · Questions) + CTA qui suit
      <details><summary>Pourquoi nav2 était obligatoire</summary>

      Toute la logique du CTA flottant vit dans le bloc `if (nav2)` de `js/main.js`.
      Pas de nav2, pas de CTA qui suit — les deux viennent en paire.
      Le bloc "On est disponibles" existant sert de `#ctaEnd`, plutôt que d'empiler un
      second bouton juste au-dessus.
      </details>
- [x] Bouton "Nous contacter" ajouté sous le texte de l'en-tête, il porte `#ctaAnchor`
- [x] Les 5 étapes : une par ligne dès 900px, palier à 2 colonnes supprimé
- [x] "Ce qui est inclus" : 5 colonnes fixes, empilées sous **1240px**
      <details><summary>D'où sort ce seuil</summary>

      Mesuré dans le navigateur, pas estimé : "Contrat de vente détaillé" demande 162px de
      largeur de texte pour tenir en 2 lignes ; + 52px de pastille = colonne de 214px, soit
      1214px de viewport pour 5 colonnes. Arrondi à 1240 pour absorber les variations de
      rendu des polices.
      **Les deux grilles ont volontairement des seuils différents** (900 pour les étapes,
      1240 pour le dossier) : les étapes n'ont qu'un libellé court, le dossier a un titre
      et une description. Ne pas "corriger" en croyant à un oubli.
      </details>

### `poulains.html`

- [x] Badge "Poulains" → "Nos chevaux", aligné sur `reproducteurs.html`
- [x] "Processus d'adoption" remonté **avant** "Déjà partis"
      <details><summary>Pourquoi</summary>

      Il arrivait après les poulains déjà vendus : un visiteur qui venait d'en repérer un
      devait traverser une section qui ne le concerne pas avant de trouver la marche à
      suivre. "Déjà partis" clôt maintenant la page sur une note plus douce.
      </details>
- [x] Ce bloc passe en carte (`.adoption-card`, 720px centrés, émoji 🤝) au lieu d'un
      bandeau séparé par un trait
- [x] Raccord adouci : le trait dur venait d'un `border-top` inline sur "Déjà partis", pas
      d'un écart de couleur — les deux causes ont été traitées

### `elevage.html`

- [ ] ⚠️ **Modale "Élevage du Gard" : image écrasée — NON RÉSOLU**
  <details><summary>Ce qui a été tenté, et ce qu'on sait</summary>

  **Symptôme** : la carte (`Cartes-France.jpg`, 774x1024, donc en portrait) s'affiche
  en 610x341 au lieu de 610x807. Elle est étirée, pas seulement réduite.

  **Cause identifiée par Bastien** (et c'est la bonne piste) : `#elev-body` est en
  `align-items: stretch`, et la chaîne `.elev-img-grid { flex: 1 }` →
  `.elev-img-item { flex: 1 }` distribue de force la hauteur de la rangée aux
  images. L'image reçoit donc la hauteur de la colonne de texte, et sa largeur
  suit le ratio. Cette égalisation **comprime toutes les images**, pas seulement
  celle du Gard — c'est invisible ailleurs parce que le texte est plus long.

  **Trois modales sur six ont une image en portrait** : `irish-cob` (0.67),
  `transparence` (0.77), `gard` (0.76). Les deux premières s'en sortent parce que
  leur texte est assez long. C'est de la chance, pas de la conception.

  **Tentatives infructueuses (21/07)** — ne pas refaire le tour :
  - sortir la chaîne du contexte flex (`display: block` à tous les niveaux)
  - `align-self: start` sur `#elev-images`
  - conteneur à `aspect-ratio` (collapse à 0 avant chargement de l'image)
  - `aspect-ratio` en style en ligne via `imgData.style`
  - attributs `width`/`height` sur l'`img`
  - chargement `eager` au lieu de `lazy`
  - classe de dérogation `.colonnes-libres` posée par les données
  - refonte du gabarit : `align-items: center` + suppression des `flex: 1`

  Tout a été **remis dans l'état d'origine** : aucune de ces pistes n'a tenu, et
  laisser un gabarit modifié qui ne corrige rien faisait courir un risque de
  régression sur les cinq autres modales.

  **Piste non explorée, probablement la plus simple** : recadrer le fichier
  source. 774x1024 est un format inutilement haut pour cette carte ; un
  recadrage proche du carré réglerait le problème par la géométrie plutôt que
  par le CSS.

  **Autre direction possible** : mise en page dédiée pour les modales à schéma ou
  carte — image en pleine largeur au-dessus du texte plutôt qu'en colonne. C'est
  aussi la meilleure lisibilité pour un visuel informatif.

  ⚠️ Attention méthodologique : lors de cette session, `getComputedStyle` et
  `getBoundingClientRect` ont renvoyé à plusieurs reprises des valeurs périmées
  dans l'outil de test, en contradiction avec les captures d'écran. **Se fier aux
  captures**, pas aux mesures, pour juger de ce rendu.
  </details>
- [x] Cartes sur une colonne sous 700px
- [x] "En savoir plus" visible en permanence via `@media (hover: none)`
      <details><summary>Pourquoi cette requête plutôt qu'une largeur</summary>

      L'invitation à cliquer était en `opacity: 0` et ne se révélait qu'au survol : donc
      jamais sur tactile. `(hover: none)` vise l'absence de survol, pas la taille d'écran —
      ça couvre les tablettes larges, et laisse l'animation aux petits écrans avec souris.
      </details>

### Points ouverts

- [ ] **`accouplement.html` à retravailler** : son en-tête passe en
      `.page-header--compact` (bas resserré à 1.5rem) parce que l'outil suit
      immédiatement. Le padding haut de 8rem, lui, n'est pas négociable — la
      navbar fixe fait 80px et la page n'a pas de `padding-top` sur le body, donc
      en dessous le contenu passe dessous. C'est ce qui se produisait avec les
      4rem d'avant : le badge "Calculateur" était masqué. Reste à revoir la
      cosmétique de cette page dans son ensemble.
- [ ] **Bande crème sous le footer (iOS)** : toujours présente, abandonnée faute de
      solution acceptable. À rouvrir seulement si une nouvelle idée émerge — voir la liste
      des pistes déjà éliminées plus haut.
- [ ] **Favicon 16px** : le monogramme est lisible mais reste fin ; à regarder en usage réel
- [ ] Supprimer `img/favicon_io/_ancien-logo-complet/` une fois le nouveau jeu validé
