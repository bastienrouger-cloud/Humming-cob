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
- [x] **Open Graph par page — FAIT (vérifié 05/08)** : dossier `img/og/` avec une
      image OG dédiée par page ET par cheval (og-index, og-elevage, og-reproducteurs,
      og-accouplement, og-frise, og-arbre-genealogique + og-nashi, og-omamori, og-orion,
      og-kaeru, og-jinba-ittai, og-archy, og-avantgarde, og-sakura, og-suzie, og-ruby-jane).
      Toutes les pages principales et fiches chevaux les référencent.
      <details><summary>Bug de casse corrigé + petits restes</summary>

      ⚠️ **Bug corrigé** : le dossier était `img/OG/` (majuscule) dans git, mais les URLs
      pointent vers `img/og/` (minuscule) → OK sur Mac (insensible à la casse), **404 en
      prod** sur serveur Linux (Netlify/GH Pages). Renommé `img/OG` → `img/og` via git.

      Restent sur l'image générique `og-preview.jpg` (probablement volontaire) : la page
      liste **poulains.html**, **memoire.html**, **poulains/acheter.html**, et les deux
      pages légales. À voir si on leur fait une image dédiée.
      </details>
  <details><summary>Plan retenu (Bastien) — carte de visite par cheval</summary>

  **Usage réel** : poster sur les réseaux pour répondre à des annonces d'acheteurs
  ou d'éleveurs, et faire la promo. L'aperçu partagé doit donc vendre le cheval.

  **Format cible OG : 1200×630 px, paysage ~2:1.** C'est ce que recadrent Facebook,
  WhatsApp, iMessage, etc. Or les photos de chevaux sont surtout portrait/carré :
  les forcer en 1200×630 ne montre que le poitrail. Le recadrage est donc le vrai
  travail, pas la duplication.

  **Solution : un gabarit "carte de visite"** aux couleurs du site (DA Humming Cob),
  avec un cadre pour la photo + infos personnalisées par cheval (nom, âge ?, robe ?…).
  Conçu une fois, décliné par cheval. Bastien le fera sur une journée dédiée, sur son
  poste fixe (grand écran). Pas pendant une coupure.

  À voir ensemble le moment venu : incrustation auto du texte (script Python + Pillow
  sur un template PNG/SVG) vs composition manuelle dans un outil graphique.
  </details>
  <details><summary>Pourquoi</summary>Sans ça, partager le lien sur les réseaux ou en message n'affiche ni image ni description propre.</details>
- [x] Favicon en place — jeu complet monogramme HC, 21/07
- [x] robots.txt + sitemap.xml ✓ (fichiers présents)
  <details><summary>Pourquoi</summary>Pas bloquant pour un site non indexé, mais fait partie du SEO de base d'un vrai déploiement.</details>
- [x] Page 404 personnalisée ✓ (fichiers présents)

## 9. Déploiement

- [x] Hébergement choisi et fonctionnel — GitHub Pages (prod) + Netlify (preview `Dev`)
- [x] DNS / SSL configurés — hummingcob.fr en HTTPS
- [x] Mentions légales / politique de confidentialité — pages créées le 20/07, coordonnées de l'éditeur **complétées le 21/07** (régime éditeur non professionnel, plus aucun placeholder)
  <details><summary>Pourquoi</summary>Obligatoire dès qu'un site français collecte des données (formulaire, analytics) — même un site d'entraînement gagne à s'y habituer.</details>

---

## 💡 Idées à reprendre plus tard

- [x] **Carrousel hero des fiches — photo entière + fond flouté (09/08)** : les photos
      étaient en `object-fit: cover` → une photo portrait dans un cadre large se faisait
      zoomer violemment. Passé en `object-fit: contain` (photo entière, sans rognage) +
      un `::before` flouté/assombri (`blur(26px) brightness(.72)`) qui reprend le `src`
      de chaque slide (`--slide-bg` posé par `js/main.js`) pour combler le vide, façon
      Apple TV / Photos. Fait dans **style.css + ~5 lignes de main.js** → s'applique à
      **toutes les fiches** sans modif page par page. L'index (carrousel « Qui sommes-nous »)
      n'est pas touché (cible : `.hero-slide` uniquement). Sauvegardes :
      /tmp/style.b4carousel.css, /tmp/main.b4carousel.js.

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
- [x] **"Explorez notre univers" — image par défaut + sélection persistante (09/08)** : le panneau gauche (`.explore-visual`) affichait un monogramme HC au repos et ne montrait une photo qu'au survol (qui disparaissait au mouseleave). Désormais « Notre élevage » est **sélectionnée par défaut** (photo + carte surlignée), le survol change la sélection, et l'image **persiste** sur la dernière carte (classe `.is-selected` réutilisant l'éclairage rosé du survol sans le lift). Dans style.css + main.js, index uniquement.
- [x] **"Explorez notre univers" — refonte mobile (09/08)** : sur ≤900px le
- [x] **Nav — logo neutre (09/08)** : le logo « Humming Cob » passait en rose sur
      l'accueil (`.nav-logo.nav-active`), se comportant comme un onglet actif — d'où une
      incohérence (le logo s'allume, mais « À propos », vrai lien vers la section histoire
      de l'accueil, jamais). Convention : un logo est identité + bouton accueil, sans état
      « page active ». Retiré le bloc JS qui posait `nav-active` sur le logo + la règle CSS.
      Résultat : accueil = rien de surligné (logique, l'accueil n'est pas un onglet), autres
      pages = onglet correspondant surligné. « À propos » conservé. Sauvegardes :
      /tmp/main.b4logo.js, /tmp/style.b4logo.css.
      panneau-image partagé (`.explore-visual`) est masqué (inutile sans survol, il
      restait figé sur élevage). Chaque carte devient **autonome** : son image en tête
      (pleine largeur via `::before` + `--card-img`, marges négatives pour être à fleur
      du liseré, coins hauts arrondis) puis titre + texte. Surbrillance neutralisée au
      tactile. ⚠️ Piège corrigé : un `url()` relatif dans une variable CSS est résolu
      depuis la feuille (`css/`) → 404 ; on résout en URL absolue via `document.baseURI`
      dans main.js. Sauvegardes : /tmp/style.b4mobile.css, /tmp/main.b4mobile.js.
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
- ~~Aucune page mentions légales / politique de confidentialité~~ → créées le 20/07, coordonnées complétées le 21/07. Google Analytics retiré ; reste le formulaire de contact (Web3Forms), couvert par la politique de confidentialité.
- ~~Pas de bandeau de consentement cookies~~ → sans objet depuis le retrait de gtag (20/07).
- ~~Pas de mise en évidence de la page active dans la nav~~ → corrigé le 18/07 (détection dynamique dans `js/main.js`, testée sur les 6 cas de figure + logo mis en avant sur l'accueil, seul cas sans lien de nav correspondant).
- **Pas de balises `<header>`/`<main>` sémantiques** — `<nav>` et les `<section>` sont directement sous `<body>`.
- `frise.html` est la seule page sans meta description.
- Côté positif : variables CSS centralisées ✅, menu mobile fonctionnel ✅, formulaire de contact opérationnel ✅, `alt` renseigné sur les images vérifiées ✅, Git avec branches `main`/`Dev` séparées ✅.

Ces constats viennent de l'inspection du code, pas d'un test utilisateur réel (Lighthouse, vrai téléphone, autres navigateurs) — ces cases-là restent à valider par toi.


---

## 📌 Reste à faire, repéré le 20/07/2026

- [x] **Coordonnées légales complétées** (21/07) — régime de l'**éditeur non professionnel**
      (LCEN art. 6 III 2°) : seuls le directeur de la publication et l'hébergeur sont
      exigés pour un site personnel. Les mentions raison sociale / statut / SIRET ont été
      **retirées** plutôt que remplies approximativement : elles ne concernent que les
      éditeurs professionnels.
  <details><summary>À revoir le jour où l'activité sera déclarée</summary>

  L'élevage n'a pas de statut à ce jour (terres prêtées, MSA du Gard ayant refusé même
  en cotisant solidaire). Ça se débloquera avec le projet d'achat de ferme en cours.
  Bastien envisage par ailleurs de passer freelance plus tard.

  Le jour où l'un ou l'autre est déclaré, il faudra repasser au régime **professionnel** :
  raison sociale, statut juridique, adresse, SIRET, et le cas échéant le numéro de TVA.
  Les deux fichiers portent un commentaire HTML à cet endroit précis.

  **Point non tranché** : l'affichage de prix sur les fiches poulains. Le site ne réalise
  aucune transaction en ligne — pas de paiement, pas de panier, vente de la main à la
  main avec contrat — donc c'est de la vitrine et non du commerce électronique. Mais la
  question du statut de l'activité de vente reste entière et dépasse le site.
  La **Chambre d'agriculture du Gard** conseille gratuitement sur ces situations.
  </details>
- [x] **Favicon** : corrigé le 21/07 — jeu complet `img/favicon_io/` (ico, 16, 32, apple-touch 180, android 192/512, manifest) câblé sur les 21 pages en chemins **relatifs** (le site doit rester ouvrable en double-clic). `favicon.ico` aussi copié à la racine pour la requête par défaut des navigateurs. Manifest complété (nom, couleurs) et ses chemins d'icônes passés en relatif — ils étaient absolus et renvoyaient un 404.
  <details><summary>Limite connue</summary>

  Les icônes sont générées depuis le logo complet : très belles en 180px,   illisibles en 16px (onglet de navigateur). C'est inhérent au logo — cheval,   arbre et médaillon dans 16 pixels de côté. Un monogramme "HC" seul y gagnerait,   si un fichier source propre existe un jour.
  </details>
- [x] **`arbre-genealogique.html` aligné** (22/07) — bouton retour (bruns hors charte
      `#3a2010`/`#b09080` → `--gris` texte + `--rose` bordure) et **bleu étalon aligné**
      sur le `--bleu` du site (`#6A8FA0` → `#5B7FA6`, 6 occurrences : légende, ligne
      paternelle, tracés JS père + nœuds étalons). Le doré Poulain et le rose Jument sont
      conservés — code visuel de la légende.
  <details><summary>⚠️ Décision d'architecture : cette page reste un ÎLOT — ne pas la brancher à style.css</summary>

  **La page n'importe PAS `css/style.css`** : elle est autonome, tout son style est
  inline avec son propre `:root`. J'ai d'abord voulu aliaser son `:root` vers la charte
  globale (`--serif: var(--font-serif)`, etc.) — **erreur** : ces variables globales
  n'existent pas ici, la police est tombée en Times et les bordures ont disparu.
  Restauré depuis sauvegarde, refait avec les variables LOCALES uniquement.

  **Pourquoi ne PAS lier style.css** (vérifié) : 3 collisions de noms de classes entre
  le style interne de l'arbre et la charte — `.active`, `.visible`, `.back-btn`. Les deux
  premières sont des classes d'état génériques **pilotées par les 798 lignes de JS** de
  l'arbre (survol des chevaux, apparition). Lier les feuilles ferait entrer les règles
  globales `.visible`/`.active` dans la logique interactive de l'arbre — risque de bug
  subtil, coûteux à valider, sur la page la plus fragile. Bénéfice (propagation auto d'un
  changement de couleur, ~1×/an) trop faible face au risque.

  **Règle du projet** : `arbre-genealogique.html` et `frise.html` sont des îlots
  autonomes. On aligne leurs valeurs de couleur À LA MAIN dans leur `:root`, on ne les
  branche pas au système. Savoir quand ne pas factoriser fait partie du métier.

  Reste possible plus tard (confort, sans effet visuel) : ranger les couleurs en dur qui
  dupliquent les variables locales (`#D4899A`=`--rose`, `#C0A050`=`--or`…). Non prioritaire.
  </details>

- [x] **`arbre-genealogique.html` — passe interaction & bandeau (22/07 aprèm)** :
      refonte de l'effet de sélection et du panneau d'info, tout aligné sur la charte.
      <details><summary>Détail des changements de l'après-midi</summary>

      - **Effet de sélection** : l'ancien cercle qui grossissait (`R_SELECTED`) est
        abandonné (mauvais sur mobile, chevauchait les noms). Remplacé par la mise en
        évidence du nom dans la couleur du cheval (`nodeStroke`) + graisse 700, plus un
        **soulignage animé qui se dessine de gauche à droite** (`scaleX 0→1`,
        `transform-box: fill-box`). Pour les Élite, le trait passe **sous le sous-libellé**
        de distinction, pas sous le nom.
      - **Halo crème sous les noms** (`paint-order: stroke` + stroke crème `#FEFBF6`) :
        technique cartographique pour que les tracés bleu/rose ne masquent plus les noms.
      - **Bouton "Retour au site"** : DA alignée sur le CTA (pilule pleine rose,
        texte blanc).
      - **Panneau d'info transformé en CARTE** (DA des cartes du site, ex. calculateur) :
        coins 18px, léger relief, **bordure de la couleur du cheval sélectionné**
        (`--sel-color` posé en inline par `showPanel`), conteneur nom séparé des infos
        par un filet vertical de la même couleur.
      - **Fin de la persistance** : sans sélection, le panneau revient à l'état neutre
        (`hidePanel()` retire `--sel-color` et la classe `active`).
      - **Pastille de robe** : couleur = la robe qu'elle contient (`robeToColor()` :
        palomino, buckskin, grullo, alezan, bai, noir…) au lieu du rose systématique.
      - **Nom des poulains** : affixe passé en PRÉFIXE (`Nashi HC` → `HC Nashi`) sur les
        5 poulains, pour que le mot mis en couleur (dernier mot, doré) soit le vrai nom
        et non l'affixe. ⚠️ Le format des données était `em:'X HC'` **sans espace** après
        le `:` — un motif de remplacement avec espace échoue en silence. Toujours mettre
        une `assert count==1` avant `replace` sur ce fichier.
      - **Gouttière du bandeau** : `width: calc(100% - 4rem)` ajouté (les bords
        collaient à l'écran sous 1680px). 32px de marge de chaque côté, aligné sur le
        padding 2rem du header.

      Sauvegardes éphémères : /tmp/arbre.backup.html … backup6.html.
      </details>

- [ ] **Propager le préfixe HC au reste du site** : l'affixe en préfixe (`HC Nashi`)
      n'est fait que dans l'arbre. À reporter sur les fiches poulains pour cohérence —
      Bastien : « idéalement à propager au reste du site ».

- [x] **`arbre-genealogique.html` — halo trait + cadre de dézoom (22/07 soir)** :
      <details><summary>Deux petits ajustements</summary>

      - **Halo crème sur le trait de soulignage** du cheval sélectionné : même technique
        que les noms (`paint-order: stroke` + `stroke: #FEFBF6`, largeur 2.6). Le trait
        reste lisible là où une ligne de filiation bleue/rose passe juste dessous.
      - **Cadre de dézoom** : `MIN_S` constant (0.12, dézoom « dans le vide ») remplacé
        par `minScale()` **relatif à l'ajustement** — `min(cw/TREE_W, ch/TREE_H) * 0.70`.
        Le reset est à `*0.93`, donc on peut reculer d'un cran pour voir un cadre large
        autour de l'arbre, mais pas au-delà. Appliqué aux 3 points de clamp (molette,
        pinch, boutons). Sauvegarde : /tmp/arbre.backup7.html (éphémère).
      - **Halo crème sur les nœuds repliés** : anneau crème (`stroke #FEFBF6`, 6px)
        ajouté sous le liseré coloré de chaque nœud, dans le calque `nodes` (au-dessus
        des lignes). Résultat : toute ligne de filiation qui traverse ou frôle un nœud
        est « découpée » par un tampon crème → le liseré coloré ne se fait plus toucher
        par les tracés bleu/rose (cas signalé sur HC Omamori). Sans effet en état actif
        (la grande photo `R_ACTIVE` le recouvre). Sauvegarde : /tmp/arbre.backup8.html.
      - **Halo étendu aux nœuds ouverts** : le même anneau crème grandit jusqu'à
        `R_ACTIVE` avec le cercle (map `haloEls`, transition `r`, une ligne dans
        `applyState`). Une photo ouverte ceinturée de crème sépare le nœud des traits
        qui le frôlent ou le traversent sans le concerner (cas signalé sur HC Nashi).
        Sauvegarde : /tmp/arbre.backup9.html.
      - **Pan borné (22/07)** : `clampVP()` ajouté dans `applyVP()` — l'arbre ne
        peut plus dériver à l'infini. Cadre `PAD = 120px` : les bords ne rentrent pas
        plus loin que PAD dans le viewport ; si l'arbre tient dans la vue (dézoom), il
        est verrouillé au centre. Extents monde alignés sur `fitTransform`
        (x:0..TREE_W, y:-110..820). Sauvegarde : /tmp/arbre.backup10.html.
      - **Carte externe en pointillés (validé)** : la carte d'info d'un
        cheval externe / en mémoire / masqué prend une **bordure en tirets**
        (`.info-panel.active.is-ext`), pour perpétuer la règle du portrait (les externes
        sont en tirets sur l'arbre). Couleur conservée (bleu étalon / rose jument).
        Bastien : « impeccable ».
- [x] **`frise.html` — header aligné + police unifiée (22/07)** :
      <details><summary>Header repris de l'arbre, police raccord au site</summary>

      - **Header** : repris la DA du header de arbre-genealogique.html — h1 Cormorant
        (« Notre <em>histoire</em> », em rose), sous-titre Jost petites capitales gris,
        **bouton retour en pilule pleine rose-deep** (texte blanc + flèche SVG) avec
        hover `--rose-dark` + ombre. Padding aligné (1.5rem 2rem 1rem), border-bottom
        retiré.
      - **Police unifiée** : la page utilisait une variable **fantôme** `--font-titre`
        (jamais définie) → les titres retombaient sur `'Playfair Display'` (non chargé).
        Remplacé les 2 occurrences par `var(--font-serif, Cormorant)`. Tout est en
        Cormorant maintenant (années de la frise incluses).
      - **Différence avec l'arbre** : `frise.html` **lie `style.css`** (l'arbre non),
        donc on a pu utiliser directement les variables de charte (`--rose-deep`,
        `--rose-dark`, `--gris`, `--noir`, `--font-serif/sans`) — plus propre que les
        littéraux recopiés de l'arbre.
      - Reste à traiter (à discuter avec Bastien) : le corps de la frise (mise en page,
        couleurs, sépia du panneau détail, tige/fleurs). Sauvegarde : /tmp/frise.backup.html.
      </details>

- [x] **Graisse des titres des îlots (22/07)** : les headers de `arbre-genealogique`
      et `frise` étaient en Cormorant **weight 300** alors que tous les titres du site
      (`.section-title`) sont en **400** — même famille, graisse plus fine, d'où
      l'impression de mauvaise police (repéré par Bastien). Passés en 400 sur les deux.
      (Frise avait hérité du 300 lors de l'alignement du header.)

- [x] **🔴 BUG SITE-WIDE : polices non chargées (Times partout) — corrigé (22/07)** :
      <details><summary>Le @import de style.css était ignoré → tout le site en Times</summary>

      En comparant frise et arbre, découvert que le titre de frise s'affichait en
      **Times**, pas en Cormorant. Cause racine : dans `css/style.css`, le
      `@import url(...Cormorant...Jost...)` était **ligne 69, après `:root`, `body`,
      `a{}`**. Spec CSS : un `@import` doit précéder toute règle de style, sinon il est
      **invalide et silencieusement ignoré**. Donc **toutes les pages qui lient
      style.css** (index, elevage, poulains, accouplement, memoire, reproducteurs,
      légales, frise) tournaient en **Times** (fallback serif), pas en Cormorant.
      **Seul `arbre-genealogique.html` était correct**, car il ne lie pas style.css et
      a son propre `<link>` Google Fonts — d'où l'impression que « l'arbre avait une
      autre police » : c'était le seul juste.

      **Les DEUX polices étaient touchées** (même @import) : titres en Times au lieu de
      Cormorant, ET **corps de texte en Segoe UI/système au lieu de Jost**. Le corps est
      en Jost (sans-serif), pas Garamond — le « Garamond » vient du nom du font de titre
      « Cormorant Garamond ». Charte = Cormorant (titres) + Jost (corps).

      **Fix** : `@import` remonté tout en haut de style.css (avant `:root`). Vérifié par
      mesure de largeur sur elevage ET frise : Cormorant ≠ Times ET Jost ≠ sans système
      → les deux polices chargent partout maintenant. ⚠️ Impact visible sur **toutes** les pages : les titres
      passent de Times à Cormorant (police de la charte). Sauvegarde : /tmp/style.backup.css.

      Détail lié : les headers d'îlots arbre + frise passés en Cormorant **400** (étaient
      en 300) pour matcher `.section-title`. Cohérent maintenant que la police charge.
      </details>

- [ ] **Aligner `frise.html`** — quasi fini (état réel 05/08, l'ancien diagnostic
      était périmé)
  <details><summary>Ce qui est fait / ce qui reste</summary>

  **Fait** : la frise lie désormais `style.css` (plus un îlot strict comme l'arbre) ;
  header aligné sur l'arbre (Cormorant, bouton pilule rose + flèche SVG) ; polices
  Cormorant/Jost OK (plus aucun Playfair ni var fantôme) ; panneau détail refait en
  **crème clair** (`#FBF3E7`, était sombre `rgba(14,8,4)`) ; couleurs quasi toutes dans
  la charte (#B06070, #FEFBF6, #1C1C1C, #6A6A6A).

  **Reste** : deux bruns résiduels (`#7a6a60`, `#3a2f2a`) à valider (tige/racine) ;
  passe visuelle finale desktop + mobile ; question sépia largement close (c'est crème
  maintenant). Point structurel commun avec l'arbre → voir « Nav sur les pages JS ».
  </details>
- [ ] **Nav sur les pages JS** — arbre et frise n'ont pas la navbar/footer commune,
      mais ont chacune un bouton « Retour au site ». À tester : ce bouton suffit-il,
      ou faut-il vraiment intégrer les partials ? Bastien penche pour le bouton seul.
- [ ] Décider du sort de `frise.html` et `arbre-genealogique.html` — voir les deux
      points ci-dessus, qui remplacent l'ancienne formulation
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

- [x] **`accouplement.html` — passe DA (21/07 soir)** : branché sur les variables
      globales (alias au lieu de couleurs recopiées), **doré `--gold` supprimé**
      (18 occurrences → `--rose-deep`, il n'existait nulle part ailleurs), boutons
      alignés sur `.btn-outline`/`.link-arrow`, panneau "Tester une compatibilité"
      mis en avant (liseré rose, coins 26px, ombre), et **les deux avertissements
      fusionnés** dans la pastille au-dessus des cases. L'outil n'a pas été touché,
      testé fonctionnel (48 chevaux, sélection OK). En-tête : `.page-header--compact`.
      <details><summary>Reste à voir</summary>Le padding haut de 8rem n'est pas
      négociable : navbar fixe de 80px, pas de padding-top sur le body → en dessous
      le contenu passe sous la barre (c'était le bug des 4rem, badge masqué). Copie
      de sauvegarde avant modif : /tmp/accouplement.backup.html (éphémère).</details>
- [x] **`accouplement.html` — correctifs en vrac (22/07)** :
      <details><summary>Deux corrections</summary>

      - **Survol case jument** : le fond au survol était un crème `#fbf6ee` (rendu
        « crème » signalé) → rose pâle `#fbeef2`, symétrique du bleu pâle de la case
        étalon (`#f3f6f9`).
      - **Titres d'élevage du menu « Chevaux enregistrés »** : collision de classe.
        Les `<tr>` d'en-tête de groupe réutilisaient `.section-divider`, qui dans
        `style.css` est le trait **dégradé rose décoratif global** (sous les titres) —
        il remplissait toute la ligne (gros bandeau rose). Renommés en classe dédiée
        `.group-head`, avec un style de titre propre : petites capitales rose-deep
        entre deux filets qui s'estompent + pastille de lignée. La `<div
        class="section-divider">` décorative (sous le h1) reste inchangée.
        Sauvegarde : /tmp/accouplement.backup.html.
      - **Espace hero réduit (22/07)** : le badge « Calculateur » était bien plus bas
        que sur les autres pages (gap navbar→badge 134px vs 54px sur elevage). Cause :
        `body { padding:80px 0 0 }` **propre à accouplement**, qui comptait la navbar
        fixe une 2ᵉ fois (déjà absorbée par les 8rem du `.page-header`). Retiré →
        le hero passe sous la navbar comme partout, gap identique à elevage (54px),
        badge non masqué. ⚠️ Corrige la note précédente « pas de padding-top sur le
        body » : il y en avait un (80px), d'où le doublon.

- [x] **`memoire.html` — même correctif d'espace hero (22/07)** : même doublon que
      accouplement, mais l'offset était dans `style.css` : `.memorial-page {
      padding-top: 80px }` + hero `.memorial-hero { padding: 7rem ... }`. Retiré
      l'offset (→ `padding-top: 0`) et passé le hero à **8rem** en haut → le hero passe
      sous la navbar, écart navbar→label = 54px, identique à elevage. Les deux règles
      sont propres à memoire (classe `.memorial-*`), aucun impact sur les autres pages.
      Sauvegarde : /tmp/style.backup.css.
- [ ] **Bande crème sous le footer (iOS)** : toujours présente, abandonnée faute de
      solution acceptable. À rouvrir seulement si une nouvelle idée émerge — voir la liste
      des pistes déjà éliminées plus haut.
- [ ] **Favicon 16px** : le monogramme est lisible mais reste fin ; à regarder en usage réel
- [ ] Supprimer `img/favicon_io/_ancien-logo-complet/` une fois le nouveau jeu validé
