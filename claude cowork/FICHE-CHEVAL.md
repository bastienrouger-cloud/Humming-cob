# Patron d'une fiche cheval

> Référence de la mise en page adoptée en juillet 2026 sur les fiches de
> `reproducteurs/`. La fiche d'**Archy** fait foi : en cas de doute, aller y voir.

---

## Ordre des sections

```
nav2  (sticky, sous la navbar)
hero  (carrousel à gauche · identité + CTA à droite)
palmarès
poulains / descendance
pédigrée  (replié par défaut)
footer
```

**Pourquoi cet ordre.** La descendance est passée avant le pédigrée : sur une fiche
de reproducteur, la question du visiteur est « qu'est-ce que ce cheval transmet ? ».
Les poulains sont la preuve, le pédigrée la pièce justificative. On montre la preuve
d'abord.

Il n'y a plus de section galerie séparée : toutes les photos sont dans le carrousel
du hero, et la lightbox donne l'accès plein écran.

---

## Identifiants normalisés

Les mêmes sur toutes les fiches — nav2 et `scroll-margin-top` en dépendent.

| Section     | id             | badge affiché |
| ----------- | -------------- | ------------- |
| Palmarès    | `#palmares`    | Résultats     |
| Descendance | `#descendance` | Descendance   |
| Pédigrée    | `#pedigree`    | Origines      |

Fonds alternés : palmarès sans fond, descendance sans fond, pédigrée en
`--bg-light`. Deux sections voisines ne doivent jamais avoir le même fond, sinon
elles fusionnent visuellement.

---

## nav2

Placée **juste après `<!-- @end:header -->`**, donc avant le hero.

```html
<nav class="nav2" id="nav2" aria-label="Sections de la fiche">
  <div class="nav2-inner">
    <ul class="nav2-links">
      <li><a href="#palmares">Palmarès</a></li>
      <li><a href="#descendance">Poulains</a></li>
      <li><a href="#pedigree">Pedigree</a></li>
    </ul>
    <a href="../index.html#contact" class="btn btn-primary nav2-cta"
       id="nav2Cta" tabindex="-1" aria-hidden="true">Conditions de saillie</a>
  </div>
</nav>
```

⚠️ **Ne pas ajouter de `margin-top`.** Les pages chevaux portent
`body class="horse-page"`, et `.horse-page` a déjà `padding-top: 80px` pour dégager
la navbar fixe. Un `margin-top` en plus empile deux fois la même hauteur — l'erreur
a déjà été faite une fois.

Ne lister que les sections réellement présentes sur la page.

---

## Carrousel du hero

Remplace l'ancienne image fixe dans `.horse-hero-img-wrap`.

```html
<div class="hero-carousel">
  <div class="hero-slides" id="heroSlides">
    <div class="hero-slide active"><img src="…" alt="Nom du cheval" data-cap="Légende"></div>
    <div class="hero-slide"><img src="…" alt="Nom du cheval" loading="lazy" data-cap="Légende"></div>
    …
    <button class="hero-nav hero-prev" aria-label="Photo précédente">‹</button>
    <button class="hero-nav hero-next" aria-label="Photo suivante">›</button>
    <span class="hero-expand" aria-hidden="true"><!-- icône --></span>
  </div>
  <p class="hero-cap" id="heroCap" aria-live="polite"></p>
  <div class="hero-timer" id="heroTimer" aria-hidden="true"></div>
</div>
```

Règles :

- **Seule la première photo** est chargée d'emblée, toutes les autres en
  `loading="lazy"`. Sans ça, 20 téléchargements se déclenchent pour une seule image visible.
- **`alt` obligatoire** sur chaque image. Les fiches d'origine n'en avaient pas toutes.
- **`data-cap`** alimente à la fois la légende sous la photo et celle de la lightbox —
  une seule source, pas de duplication.
- La lightbox est déjà branchée dans `js/main.js`, tableau `carousels`, entrée
  `#heroSlides`. Rien à ajouter par page.

### La minuterie

Une pastille par photo, l'active s'allonge en gélule et se remplit.

C'est **la fin de l'animation CSS** (`animationend`) qui déclenche la photo suivante,
pas un `setInterval`. Ne pas réintroduire de minuteur parallèle : les deux horloges
dérivent dès la première mise en pause au survol, et la barre se remplit bien avant
que l'image change. Un `setTimeout` de secours existe uniquement pour
`prefers-reduced-motion`, où l'animation n'existe pas et l'événement ne partirait jamais.

---

## Pédigrée repliable

Chaque parent porte `is-collapsed` **dans le HTML** et un bouton juste sous sa robe :

```html
<div class="ped-parent ped-parent--pere is-collapsed">
  <div class="ped-label ped-label--pere">Père</div>
  <div class="ped-name">…</div>
  <div class="ped-robe">…</div>
  <button type="button" class="ped-toggle ped-toggle--pere" aria-expanded="false">
    <span class="ped-toggle-label">Voir les ascendants</span>
    <svg …><polyline points="6 9 12 15 18 9"/></svg>
  </button>
  <div class="ped-gp">…</div>
</div>
```

Deux boutons indépendants, un par parent. Couleur reprise du parent : bleu pour le
père, rose pour la mère.

⚠️ L'état replié vient du **HTML**, pas du JS. Si c'est le script qui replie au
chargement, le bloc complet s'affiche une fraction de seconde avant de se refermer.

Variante : certaines fiches ont `ped-parent--unknown` au lieu de `--mere`
(ascendance non documentée). Le bouton prend alors la classe `ped-toggle--neutre`.

---

## CTA — étalon vs jument

| | Hero | nav2 |
| --- | --- | --- |
| **Étalon ouvert aux saillies** | Demander les conditions de saillie | Conditions de saillie |
| **Jument / autre** | Nous contacter | Nous contacter |

Le libellé court en nav2 est volontaire : le libellé complet ferait un bouton
disproportionné dans une barre de 46px.

Le bouton du hero doit être enveloppé dans son ancre :

```html
<div id="ctaAnchor" class="cta-anchor">
  <a href="../index.html#contact" class="btn btn-primary">…</a>
</div>
```

`#ctaAnchor` sert de repère au script : dès qu'on descend sous ce point, un
exemplaire du bouton apparaît dans la nav2 (desktop) ou en barre flottante centrée
en bas (mobile). L'original ne bouge jamais.

---

## Détails de rédaction

- **Élision** : « Palmarès **d'**Archy », « Poulains **d'**Avantgarde ». Devant une
  voyelle, `de` s'élide — le fait que ce soit en rose italique n'y change rien.
- **Palmarès qui s'arrête** : ajouter une `<p class="palmares-note">` expliquant
  pourquoi, sinon le visiteur lit « page pas à jour ». Voir Archy.
- **Cartes de descendance** : `<a href>` vers la fiche pour les poulains de
  l'élevage, `<div class="foal-card" data-images='[…]'>` avec lightbox pour les
  poulains extérieurs. Les deux sont cliquables, le libellé diffère
  (« Voir la fiche » vs « Cliquer pour agrandir »).

---

## Après toute modification

```
python3 build.py --check
```

Et si les partials header/footer ont bougé, `python3 build.py` avant de commiter.

---

## État au 20/07/2026

Converties : `archy`, `avantgarde`, `suzie`, `sakura`, `ruby-jane`.
Non converties : les 6 fiches de `poulains/` — même patron applicable, mais elles
n'ont ni palmarès ni descendance, donc une nav2 à deux entrées au mieux. À évaluer.
