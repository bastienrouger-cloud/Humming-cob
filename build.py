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


def main():
    check_only = "--check" in sys.argv

    header = (PARTIALS / "header.html").read_text(encoding="utf-8")
    footer = (PARTIALS / "footer.html").read_text(encoding="utf-8")

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
