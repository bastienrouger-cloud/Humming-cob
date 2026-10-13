#!/usr/bin/env python3
"""
build.py — Injection des partials header/footer dans les pages HTML.

Principe
--------
Chaque page contient des marqueurs :

    <!-- @partial:header -->
    ... contenu généré, ne pas éditer à la main ...
    <!-- @end:header -->

Le script remplace tout ce qui se trouve entre les deux marqueurs par le
contenu de partials/header.html (idem pour footer). Les pages restent des
fichiers HTML statiques complets : le site fonctionne toujours en double-clic,
sans serveur ni JS.

Jetons remplacés dans les partials
----------------------------------
    {{base}}   ""        à la racine        | "../"              en sous-dossier
    {{home}}   ""        sur index.html     | "{{base}}index.html" ailleurs

Le jeton {{home}} évite un rechargement inutile de la page quand on clique sur
"Contact" depuis l'accueil (on veut "#contact", pas "index.html#contact").

Données des chevaux
-------------------
Le script génère aussi `js/chevaux.js` à partir de `data/chevaux/*.json`
et `data/arbre-positions.json` (source unique, voir data/README.md). Les fichiers sont vérifiés au passage :
champs obligatoires, valeurs autorisées, père et mère existants. En cas
d'erreur, rien n'est écrit.

Usage
-----
    python3 build.py            # régénère toutes les pages
    python3 build.py --check    # ne modifie rien, signale les pages à régénérer
                                # (code de sortie 1 si des pages sont périmées)
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARTIALS = ROOT / "partials"

DATA_CHEVAUX = ROOT / "data" / "chevaux"
CHEVAUX_JS = ROOT / "js" / "chevaux.js"
POSITIONS_ARBRE = ROOT / "data" / "arbre-positions.json"

# Dossiers à ne jamais parcourir
EXCLUDED_DIRS = {".git", "img", "partials", "claude cowork", "node_modules"}


def find_pages():
    """Toutes les pages HTML du site, hors dossiers exclus."""
    pages = []
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED_DIRS for part in path.relative_to(ROOT).parts[:-1]):
            continue
        if path.parent == PARTIALS:
            continue
        pages.append(path)
    return sorted(pages)


def render(partial_text, page):
    """Remplace les jetons du partial selon l'emplacement de la page."""
    depth = len(page.relative_to(ROOT).parts) - 1
    base = "../" * depth
    home = "" if page.name == "index.html" and depth == 0 else base + "index.html"
    return partial_text.replace("{{base}}", base).replace("{{home}}", home)


def inject(html, name, partial_text, page):
    """
    Remplace le bloc entre <!-- @partial:name --> et <!-- @end:name -->.
    Retourne (html_modifié, trouvé?).
    """
    pattern = re.compile(
        r"(<!--\s*@partial:%s\s*-->).*?(<!--\s*@end:%s\s*-->)" % (name, name),
        re.DOTALL,
    )
    if not pattern.search(html):
        return html, False

    body = render(partial_text, page)
    replacement = "\\1\n" + body.rstrip("\n").replace("\\", "\\\\") + "\n\\2"
    return pattern.sub(replacement, html), True


VALEURS = {
    "famille": {"humming", "externe"},
    "sexe": {"male", "femelle", "hongre"},
    "role": {"etalon", "jument", "poulain", "memoire"},
    "statut": {"a-vendre", "reserve", "vendu", "garde"},
}


def generer_chevaux_js():
    """
    Lit data/chevaux/*.json, vérifie la cohérence et renvoie
    (contenu_de_js/chevaux.js, liste_d_erreurs).
    """
    import json

    chevaux, erreurs = [], []
    for f in sorted(DATA_CHEVAUX.glob("*.json")):
        try:
            c = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            erreurs.append("%s : JSON invalide (%s)" % (f.name, e))
            continue
        if c.get("id") != f.stem:
            erreurs.append("%s : l'id doit être « %s »" % (f.name, f.stem))
        for champ in ("id", "nom", "famille", "sexe"):
            if not c.get(champ):
                erreurs.append("%s : champ « %s » manquant" % (f.name, champ))
        for champ, permis in VALEURS.items():
            if champ in c and c[champ] not in permis:
                erreurs.append("%s : %s « %s » inconnu (permis : %s)"
                               % (f.name, champ, c[champ], ", ".join(sorted(permis))))
        chevaux.append(c)

    par_id = {c.get("id"): c for c in chevaux}
    for c in chevaux:
        for champ, sexes in (("pere", {"male", "hongre"}), ("mere", {"femelle"})):
            p = c.get(champ)
            if not p:
                continue
            if p not in par_id:
                erreurs.append("%s : %s « %s » introuvable dans data/chevaux/" % (c.get("id"), champ, p))
            elif par_id[p].get("sexe") not in sexes:
                erreurs.append("%s : %s « %s » a le mauvais sexe (%s)" % (c.get("id"), champ, p, par_id[p].get("sexe")))

    # Positions dans l'arbre généalogique (placement manuel) : un cheval est
    # dans l'arbre s'il a une position.
    positions = {}
    if POSITIONS_ARBRE.exists():
        try:
            positions = json.loads(POSITIONS_ARBRE.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            erreurs.append("arbre-positions.json : JSON invalide (%s)" % e)
    for pid, p in positions.items():
        if pid not in par_id:
            erreurs.append("arbre-positions.json : « %s » n'existe pas dans data/chevaux/" % pid)
        if not isinstance(p, dict) or not all(isinstance(p.get(k), (int, float)) for k in ("x", "y")):
            erreurs.append("arbre-positions.json : position de « %s » invalide (attendu {\"x\": …, \"y\": …})" % pid)

    lignes = ",\n".join("  " + json.dumps(c, ensure_ascii=False) for c in chevaux)
    lignes_pos = ",\n".join("  %s: %s" % (json.dumps(k), json.dumps(v)) for k, v in positions.items())
    contenu = (
        "// FICHIER GÉNÉRÉ par build.py à partir de data/chevaux/*.json — ne pas éditer à la main.\n"
        "// Pour modifier un cheval : éditer son fichier JSON, puis lancer `python3 build.py`.\n"
        "const CHEVAUX = [\n" + lignes + "\n];\n\n"
        "// Positions dans l'arbre généalogique (data/arbre-positions.json).\n"
        "const POSITIONS_ARBRE = {\n" + lignes_pos + "\n};\n"
    )
    return contenu, erreurs


def main():
    check_only = "--check" in sys.argv

    header = (PARTIALS / "header.html").read_text(encoding="utf-8")
    footer = (PARTIALS / "footer.html").read_text(encoding="utf-8")

    # ---- données des chevaux ----
    chevaux_js, erreurs = generer_chevaux_js()
    if erreurs:
        print("Erreurs dans data/chevaux/ (%d) — rien n'a été écrit :" % len(erreurs))
        for e in erreurs:
            print("  ✗ " + e)
        return 1
    actuel = CHEVAUX_JS.read_text(encoding="utf-8") if CHEVAUX_JS.exists() else ""
    chevaux_perime = actuel != chevaux_js
    if chevaux_perime and not check_only:
        CHEVAUX_JS.write_text(chevaux_js, encoding="utf-8", newline="\n")
        print("✓ js/chevaux.js régénéré (%d chevaux)\n" % chevaux_js.count('"id":'))

    pages = find_pages()
    changed, skipped, stale = [], [], []

    for page in pages:
        original = page.read_text(encoding="utf-8")
        html = original
        found_any = False

        for name, partial_text in (("header", header), ("footer", footer)):
            html, found = inject(html, name, partial_text, page)
            found_any = found_any or found

        rel = page.relative_to(ROOT).as_posix()

        if not found_any:
            skipped.append(rel)
            continue

        if html != original:
            if check_only:
                stale.append(rel)
            else:
                page.write_text(html, encoding="utf-8", newline="\n")
                changed.append(rel)

    # ---- rapport ----
    if check_only:
        if chevaux_perime:
            stale.insert(0, "js/chevaux.js")
        if stale:
            print("Pages à régénérer (%d) :" % len(stale))
            for rel in stale:
                print("  ! " + rel)
            print("\nLance `python3 build.py` pour les mettre à jour.")
            return 1
        print("Toutes les pages sont à jour (%d vérifiées)." % (len(pages) - len(skipped)))
        return 0

    print("%d page(s) régénérée(s)" % len(changed))
    for rel in changed:
        print("  ✓ " + rel)

    if skipped:
        print("\n%d page(s) sans marqueur, laissée(s) intacte(s) :" % len(skipped))
        for rel in skipped:
            print("  - " + rel)

    return 0


if __name__ == "__main__":
    sys.exit(main())
