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
| `famille` | `humming` · `externe` | `humming` = nos chevaux ; `externe` = ancêtres, descendants nés ailleurs ou vendus avant nous |
| `role` | `etalon` · `jument` · `poulain` · `memoire` | nos chevaux uniquement |
| `statut` | `a-vendre` · `reserve` · `vendu` · `garde` | poulains uniquement |
| `sexe` | `male` · `femelle` · `hongre` | pilote le code couleur (bleu / rose) |
| `pere`, `mere` | `id` d'un autre cheval | absent si inconnu ; toute la généalogie en découle |
| `naissance`, `deces` | `2024-01-13`, `2010`, `~2004` | date complète si connue, sinon année |
| `robe`, `race`, `taille`, `origine`, `elevage` | texte libre | `elevage` = naisseur, pour les externes |
| `distinction` | `Élite grade 1` | reproducteurs |
| `papiers` | `Plein Papier`, `Origines Constatées` | poulains |
| `test_adn` | texte libre | |
| `prix` | nombre en euros | affiché uniquement sur la fiche du cheval |
| `souche` | `cairnview` · `sancler` · `sd` · `hc` · `autre` | élevage d'origine, sert au code couleur du calculateur — **ce n'est pas une parenté** |
| `ueln` | identifiant officiel | |
| `page` | chemin de la fiche | nos chevaux |
| `photo` | image de la carte | |
| `photo_arbre` | médaillon de l'arbre | |
| `photos` | liste d'images | galerie de la modale |
| `resume` | 2–3 phrases | texte de la carte et de la modale |
| `caractere` | liste de mots | |
| `arbre` | `true` · `false` | visible dans l'arbre généalogique |
| `notes` | texte libre | infos de référence (GVHS, taille…), non affichées sur les cartes |
| `source` | `site hummingcob.fr`, `infochevaux IFCE`… | origine de l'information |

Les champs vides sont simplement absents du fichier.

Le texte long des fiches (histoire, palmarès, descriptions) reste dans les pages HTML :
seules les données répétées ailleurs vivent ici.
