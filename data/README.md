# Données des chevaux

Un fichier JSON par cheval dans `chevaux/`. C'est la **source unique** : les fiches,
les cartes, les modales, l'arbre généalogique et le calculateur de consanguinité
liront ces fichiers (via le script de génération). Une donnée affichée à deux
endroits ne doit être écrite qu'ici.

Le nom du fichier est l'`id` du cheval : `chevaux/nashi.json` → `"id": "nashi"`.

## Après une modification

```
python3 build.py
```

Le script vérifie les fichiers (champs obligatoires, valeurs permises, père et mère
existants et du bon sexe) puis régénère `js/chevaux.js`, lu par les pages.
**Ne jamais éditer `js/chevaux.js` à la main** : il est réécrit à chaque passage.
`python3 build.py --check` signale s'il est périmé.

## Champs

| Champ | Valeurs | Remarque |
|---|---|---|
| `id` | minuscules, sans espace | **ne change jamais** (sert de lien entre fiches) |
| `nom` | `HC Nashi` | nom complet, affixe compris |
| `nom_usuel` | `Nashi` | nos chevaux uniquement, pour les cartes |
| `affixe` | `SD`, `OMD`, `du Vallat` | affixe d'élevage tel qu'il figure dans `nom`, devant ou derrière ; absent si le nom n'en a pas. Affichage partout : nom en italique (bleu/rose), affixe en petites capitales grises |
| `famille` | `humming` · `externe` | `humming` = nos chevaux ; `externe` = ancêtres, descendants nés ailleurs ou vendus avant nous |
| `role` | `etalon` · `jument` · `poulain` · `memoire` | nos chevaux uniquement |
| `statut` | `a-vendre` · `reserve` · `vendu` · `garde` | poulains, et externes vendus / à vendre par un autre élevage |
| `vendeur` | `Le Cros`, `SD`… | qui vend ou a vendu (externes) : badge « À vendre par … » |
| `sexe` | `male` · `femelle` · `hongre` | pilote le code couleur (bleu / rose) |
| `pere`, `mere` | `id` d'un autre cheval | absent si inconnu ; toute la généalogie en découle |
| `naissance`, `deces` | `2024-01-13`, `2010`, `~2004` | date complète si connue, sinon année |
| `robe`, `race`, `taille`, `origine`, `elevage` | texte libre | `elevage` = naisseur, pour les externes |
| `robe_courte` | `Bai Pearl` | version courte de la robe pour la ligne d'étiquettes des cartes (si `robe` est trop longue) |
| `distinction` | `Élite grade 1` | reproducteurs |
| `papiers` | `Plein Papier`, `Origines Constatées` | poulains |
| `test_adn` | texte libre | |
| `prix` | nombre en euros | affiché uniquement sur la fiche du cheval |
| `souche` | `cairnview` · `sancler` · `sd` · `hc` · `autre` | élevage d'origine, sert au code couleur du calculateur — **ce n'est pas une parenté** |
| `ueln` | identifiant officiel | |
| `page` | chemin de la fiche | nos chevaux |
| `photo` | image de la carte | choisie à la main, pas forcément la 1re de la galerie |
| `cadrage` | `center top`, `50% 30%` | point de cadrage de la photo de carte (`object-position`) |
| `photo_arbre` | médaillon de l'arbre | |
| `photos` | liste d'images | galerie de la modale |
| `resume` | 2–3 phrases | texte de la carte (coupé à 3 lignes) et de la modale |
| `description` | texte plus long | facultatif : remplace `resume` dans la modale |
| `cartes` | `{"suzie": {"photo": …, "resume": …}}` | variantes par page : la clé est l'`id` du cheval dont la fiche affiche la carte ; champs possibles `photo`, `cadrage`, `resume`, `photos` |
| `caractere` | liste de mots | |
| `notes` | texte libre | infos de référence (GVHS, taille…), non affichées sur les cartes |
| `source` | `site hummingcob.fr`, `infochevaux IFCE`… | origine de l'information |

Les champs vides sont simplement absents du fichier.

Le texte long des fiches (histoire, palmarès, descriptions) reste dans les pages HTML :
seules les données répétées ailleurs vivent ici.

## Cartes

Les cartes des pages sont générées par `build.py` entre deux marqueurs :

```
<!-- @cartes: nashi omamori | jinba contexte=suzie -->
…(réécrit à chaque build)…
<!-- @end:cartes -->
```

- les `id` sont affichés dans cet ordre ; `|` sépare des grilles distinctes ;
- `contexte=<id>` applique les variantes `cartes.<id>` (texte et photo propres à cette page) ;
- nos chevaux → lien vers leur fiche ; externes → modale (photos + infos), qui demande
  `js/chevaux.js` chargé avant `js/main.js` sur la page ;
- une donnée absente n'est pas affichée (pas de « mère : inconnue »).

## Noms

Dans une page, `<!-- @nom: archy --><!-- @end:nom -->` est remplacé par le nom mis en forme
(titres des fiches). En JS, `nomChevalHTML(c)` (défini dans `js/chevaux.js`) fait la même chose.

## Arbre généalogique

`arbre-positions.json` donne la place de chaque cheval dans l'arbre (`x`, `y`,
placement à la main). **Un cheval apparaît dans l'arbre s'il a une position** ; les
liens père/mère sont tracés automatiquement à partir des fiches. Rangées actuelles
(`y`) : −110 et 70 ascendants, 255 et 440 reproducteurs, 630 et 820 descendants.
