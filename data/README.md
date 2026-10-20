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
| `vendeur` | `Le Cros de l'Oume`, `SD`… | qui vend ou a vendu (externes) : badge « À vendre par … » |
| `sexe` | `male` · `femelle` · `hongre` | pilote le code couleur (bleu / rose) |
| `pere`, `mere` | `id` d'un autre cheval | absent si inconnu ; toute la généalogie en découle |
| `naissance`, `deces` | `2024-01-13`, `2010`, `~2004` | date complète si connue, sinon année |
| `robe`, `race`, `taille`, `origine`, `elevage` | texte libre | `elevage` = naisseur, pour les externes |
| `robe_courte` | `Bai Pearl` | version courte de la robe pour la ligne d'étiquettes des cartes (si `robe` est trop longue) |
| `distinction` | `Élite grade 1` | reproducteurs |
| `papiers` | `Plein Papier`, `Origines Constatées` | poulains |
| `genetique` | `{"PSSM1": "N/N", "E": "E/e", "KIT": "Sb1/W20"}` | tests génétiques, un génotype `X/Y` par locus ; `_` = allèle inconnu (`E/_`) ; locus absent = **pas testé** (jamais « négatif » par défaut). Locus : `PSSM1`, `FIS` (`N`/`P`), `E`, `A`, `D`, `Z`, `prl`, `Cr`, `To`, `KIT` (`Sb1`, `W20`, `n` — même gène). Le build vérifie le format et la cohérence avec les parents. Le calculateur s'en sert pour la génétique du poulain (`js/genetique.js`). Tableau de travail : Notion › Tests génétiques |
| `genetique_deduit` | `["PSSM1"]` | locus non testés sur le cheval lui-même mais déduits (« par filiation », robe) |
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
| `entete` | `{"titres": ["Élite grade 1"], "mentions": ["Débourrée montée"], "ligne": "Jument · Bientôt à la retraite"}` | en-tête de la fiche (nos chevaux), généré par build.py entre `<!-- @entete: id -->` et `<!-- @end:entete -->` : pastille de statut (tirée de `statut`), titres en or (« ★ » ajouté pour l'Élite), mentions en neutre, puis la ligne de texte. Textes d'Alice : à recopier tels quels |
| `caractere` | liste de mots | |
| `notes` | texte libre | infos de référence (GVHS, taille…), non affichées sur les cartes |
| `registre` | `GVHS GV13705P · TGCA` | stud-books / numéros d'inscription, affichés dans la modale |
| `source` | `site hummingcob.fr`, `infochevaux IFCE`… | origine de l'information |

Les champs vides sont simplement absents du fichier.

Le texte long des fiches (histoire, palmarès, descriptions) reste dans les pages HTML :
seules les données répétées ailleurs vivent ici.

## Fichier du calculateur

Le bouton « Télécharger mes ajouts » d'`accouplement.html` produit une **liste de chevaux au même
format que ces fiches** (`nom`, `sexe`, `pere`, `mere`, `naissance`, `robe`, `race`, `souche`,
`elevage`, `genetique`…), avec `famille: "externe"` et `source: "calculateur hummingcob.fr"`.
L'`id` est tiré du nom (« Bella du Test » → `belladutest`, suffixe `-2` si déjà pris) et les liens
`pere` / `mere` suivent. Pour intégrer un cheval reçu : un objet de la liste = un fichier
`chevaux/<id>.json`, puis `python3 build.py`. Un élevage d'origine hors de notre liste devient
`souche: "autre"` + `elevage: "<nom>"`. L'import accepte ce format, une fiche seule, et l'ancien
format du calculateur (`name`, `sex`, `sire`, `dam`, `lineage`), converti à la volée.

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

## Pédigrées

Dans une fiche, `<!-- @pedigree: nashi --><!-- @end:pedigree -->` est remplacé par le pédigrée
sur trois générations, tiré de `pere` / `mere`. Nos chevaux → lien vers leur fiche ; extérieurs
avec une photo (`photos`, `photo` ou `photo_arbre`) → modale. Un ancêtre présent plusieurs fois est
signalé (« 2× dans le pédigrée »). Les ancêtres d'un cheval inconnu ne sont pas affichés.
Le texte d'introduction et la « Note sur les origines » restent écrits à la main dans la fiche.

## Formulaire de contact

Dans `contact.html`, `<!-- @sujets --><!-- @end:sujets -->` est rempli avec les poulains à vendre ou
réservés et les étalons (saillies). Une fiche présélectionne le sujet par l'adresse :
`contact.html?sujet=nashi`, `contact.html?sujet=saillie-archy`.

## Livre d'or

`livre-dor.json` contient les messages **publiés**, ajoutés à la main après lecture des mails
« Livre d'or — Humming Cob » (formulaire de `livre-dor.html`, même clé Web3Forms que le contact).

```json
[
  {
    "nom": "Ludivine — Le Cros de l'Oume",
    "message": "Premier paragraphe…\n\nSecond paragraphe…",
    "date": "2026-10-20",
    "cheval": "sakura",
    "accueil": true
  }
]
```

- `nom` : tel que la personne l'a écrit dans « Votre nom, tel qu'il apparaîtra ».
- `message` : paragraphes séparés par une ligne vide (`\n\n`).
- `date` : date de réception, AAAA-MM-JJ (seul le mois est affiché).
- `cheval` (facultatif) : l'id du cheval choisi dans le formulaire (le mail donne l'id).
- `accueil` (facultatif) : `true` pour le montrer sur l'accueil (3 au plus, les plus récents).

Ne publier que si la case « J'accepte que ce message… soit publié » est cochée dans le mail
(`accord_publication: oui`). Tant que la liste est vide (`[]`), la liste de la page reste cachée ;
la section de l'accueil n'apparaît qu'à partir de 2 messages marqués `accueil` (réglage
`SEUIL_ACCUEIL` dans build.py). Le lien du pied de page et le formulaire sont toujours là
(c'est le lien à envoyer aux amis pour les premiers messages). Messages non publiés : à
supprimer de la boîte mail au plus tard un an après réception (politique de confidentialité).
