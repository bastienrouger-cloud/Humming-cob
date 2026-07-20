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
- [ ] Tester chaque page après migration (nav qui fonctionne, page active mise en évidence, responsive)

---

## 1. Cadrage avant tout code

- [ ] Public cible et objectif du site clairement définis
  <details><summary>Pourquoi</summary>Qui va utiliser le site, et pour quoi faire (vendre, informer, présenter) ? Ça oriente toutes les décisions de contenu et de structure ensuite.</details>
- [ ] Liste des pages nécessaires établie
  <details><summary>Pourquoi</summary>Éviter de découvrir en cours de route qu'il manque une page — lister toutes les pages avant de coder la première.</details>
- [ ] Contenu texte/visuel : disponible, à créer, ou volontairement en placeholder
  <details><summary>Pourquoi</summary>Pour un exercice ou un prototype, des placeholders assumés (texte reformulé, images génériques) sont tout à fait valables — pas besoin d'attendre le vrai contenu pour avancer la structure.</details>

## 2. Structure / arborescence

- [ ] Sitemap (arborescence des pages) posé
  <details><summary>Pourquoi</summary>Un schéma simple de qui pointe vers quoi, même à la main sur papier ou en markdown.</details>
- [ ] Pattern de page cohérent identifié et réutilisé
  <details><summary>Pourquoi</summary>Plutôt qu'un wireframe formel par page, un pattern réutilisé consciemment page après page (hero + contenu + CTA, par exemple) évite de réinventer la structure à chaque fois.</details>

## 3. Setup technique

- [ ] Dossiers de travail créés (css/js/assets/pages/partials...)
- [ ] Feuille de style de départ en place
  <details><summary>Pourquoi</summary>Un seul fichier CSS au départ, à splitter plus tard seulement si besoin réel — pas d'optimisation prématurée.</details>
- [ ] Git initialisé (repo, branches, authentification)
  <details><summary>Pourquoi</summary>Une branche stable (main) et une branche de travail (dev) séparent le site en ligne du travail en cours.</details>

## 4. HTML d'abord, sans style

- [ ] Structure sémantique complète (header, nav, main, sections, footer)
- [ ] Header/footer factorisés (partials ou composant réutilisable)
  <details><summary>Pourquoi</summary>Évite de dupliquer le même header/footer dans chaque page HTML — un seul fichier source, injecté partout. Voir section 0 pour le plan d'action détaillé sur Humming Cob.</details>
- [ ] Contenu réel dans le HTML, même en placeholder
  <details><summary>Pourquoi</summary>Pas de lorem ipsum générique — un placeholder qui ressemble au vrai contenu final donne une bien meilleure idée du rendu.</details>
- [x] Mise en évidence de la page active dans la navigation
  <details><summary>Pourquoi</summary>Petit détail UX facile à oublier — l'utilisateur doit voir immédiatement où il se trouve dans le menu.</details>

## 5. CSS ensuite

- [ ] Approche mobile-first
- [ ] Variables CSS pour couleurs/fonts centralisées
  <details><summary>Pourquoi</summary>Un seul endroit à changer pour ajuster toute la charte graphique.</details>
- [ ] Layout d'abord (grid/flexbox), détails visuels ensuite

## 6. Interactivité (JS) si besoin

- [ ] Menu mobile fonctionnel
- [ ] Formulaire de contact (même en façade, sans envoi réel)
  <details><summary>Pourquoi</summary>Utile pour tester le flux même avant d'avoir un vrai backend de réception.</details>
- [ ] Composants interactifs testés (carrousel, accordéon, modales...)

## 7. Responsive + tests

- [ ] Testé sur un vrai téléphone, pas seulement en redimensionnant le navigateur
  <details><summary>Pourquoi</summary>Le rebond de scroll (overscroll), les zones tactiles, et certains bugs Safari mobile ne se voient QUE sur un vrai appareil.</details>
- [ ] Vérifié sur plusieurs navigateurs (pas seulement celui de dev)

## 8. Perf + SEO de base

- [ ] Images compressées, attribut alt renseigné partout
- [x] Meta description par page — sauf `frise.html`
- [ ] Audit Lighthouse passé
- [x] Balises de suivi statistique — **gtag retiré des 19 pages le 20/07** (stats non consultées) → plus de bandeau cookies nécessaire
  <details><summary>Pourquoi</summary>Si un vrai tracking est ajouté, ça implique en toute rigueur un bandeau de consentement cookies (RGPD), même sur un site d'entraînement.</details>
- [ ] Open Graph personnalisé par page (og:title, og:description, og:image)
  <details><summary>Pourquoi</summary>Sans ça, partager le lien sur les réseaux ou en message n'affiche ni image ni description propre.</details>
- [ ] Favicon en place
- [ ] robots.txt + sitemap.xml
  <details><summary>Pourquoi</summary>Pas bloquant pour un site non indexé, mais fait partie du SEO de base d'un vrai déploiement.</details>
- [ ] Page 404 personnalisée

## 9. Déploiement

- [ ] Hébergement choisi et fonctionnel
- [ ] DNS / SSL configurés si domaine personnalisé
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
- [ ] **Favicon** : toujours référencé par les 21 pages, toujours absent de `img/`
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
