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

Cartes des chevaux
------------------
Dans une page, un bloc

    <!-- @cartes: fleur, festival contexte=archy -->
    ... cartes générées, ne pas éditer à la main ...
    <!-- @end:cartes -->

est rempli avec les cartes des chevaux listés, dans cet ordre, à partir de
data/chevaux/. « contexte » (facultatif) = l'id du cheval dont la page accueille
les cartes : les variantes de photo/texte prévues pour cette page (champ
« cartes » des données) remplacent alors les valeurs par défaut.
Nos chevaux → lien vers leur fiche. Chevaux extérieurs → modale (js/main.js).

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


_CHEVAUX_LUS = []   # rempli par generer_chevaux_js(), réutilisé pour les cartes

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
        if c.get("affixe") and decouper_nom(c)[1] == _sans_parentheses(c.get("nom", "")):
            erreurs.append("%s : affixe « %s » introuvable au début ou à la fin du nom « %s »"
                           % (c.get("id"), c["affixe"], c.get("nom")))
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

    global _CHEVAUX_LUS
    _CHEVAUX_LUS = chevaux
    lignes = ",\n".join("  " + json.dumps(c, ensure_ascii=False) for c in chevaux)
    lignes_pos = ",\n".join("  %s: %s" % (json.dumps(k), json.dumps(v)) for k, v in positions.items())
    contenu = (
        "// FICHIER GÉNÉRÉ par build.py à partir de data/chevaux/*.json — ne pas éditer à la main.\n"
        "// Pour modifier un cheval : éditer son fichier JSON, puis lancer `python3 build.py`.\n"
        "const CHEVAUX = [\n" + lignes + "\n];\n\n"
        "// Positions dans l'arbre généalogique (data/arbre-positions.json).\n"
        "const POSITIONS_ARBRE = {\n" + lignes_pos + "\n};\n\n"
        + NOM_JS
    )
    return contenu, erreurs


# ---------------------------------------------------------------- noms
# Un nom = le nom du cheval + un affixe d'élevage, devant (SD Suzie) ou derrière
# (Kuarahy OMD). Règle d'affichage, partout : le nom en italique (couleur du
# sexe), l'affixe en petites capitales grises, à sa place officielle.
# Même logique en Python (pages générées) et en JS (modale, arbre) : NOM_JS.

def _sans_parentheses(nom):
    return re.sub(r"\s*\(.*\)$", "", nom)


def decouper_nom(c):
    """(affixe devant, nom, affixe derrière, parenthèse) — « SD Jim (aka Nero) »
    → ("SD", "Jim", "", " (aka Nero)")."""
    nom = c.get("nom", "")
    base = _sans_parentheses(nom)
    paren = nom[len(base):]
    a = c.get("affixe")
    if a and base.startswith(a + " "):
        return a, base[len(a) + 1:], "", paren
    if a and base.endswith(" " + a):
        return "", base[:-len(a) - 1], a, paren
    return "", base, "", paren


def nom_html(c):
    avant, nom, apres, paren = decouper_nom(c)
    sexe = "femelle" if c.get("sexe") == "femelle" else "male"
    h = ""
    if avant:
        h += '<span class="nc-a">%s</span> ' % _esc(avant)
    h += '<em class="nc-n">%s</em>' % _esc(nom)
    if apres:
        h += ' <span class="nc-a">%s</span>' % _esc(apres)
    if paren:
        h += '<span class="nc-p">%s</span>' % _esc(paren)
    return '<span class="nc nc--%s">%s</span>' % (sexe, h)


NOM_JS = r"""// Nom d'un cheval en HTML (même règle que nom_html() dans build.py) :
// nom en italique, affixe en petites capitales, à sa place officielle.
function nomChevalHTML(c) {
  const e = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const base = c.nom.replace(/\s*\(.*\)$/, ''), paren = c.nom.slice(base.length), a = c.affixe;
  let avant = '', nom = base, apres = '';
  if (a && base.startsWith(a + ' ')) { avant = a; nom = base.slice(a.length + 1); }
  else if (a && base.endsWith(' ' + a)) { apres = a; nom = base.slice(0, -a.length - 1); }
  return `<span class="nc nc--${c.sexe === 'femelle' ? 'femelle' : 'male'}">`
    + (avant ? `<span class="nc-a">${e(avant)}</span> ` : '')
    + `<em class="nc-n">${e(nom)}</em>`
    + (apres ? ` <span class="nc-a">${e(apres)}</span>` : '')
    + (paren ? `<span class="nc-p">${e(paren)}</span>` : '') + '</span>';
}
"""


_NOM = re.compile(r"(<!--\s*@nom:\s*(\w+)\s*-->)(.*?)(<!--\s*@end:nom\s*-->)", re.S)


def injecter_noms(html, page, par_id, erreurs):
    def remplace(m):
        c = par_id.get(m.group(2))
        if not c:
            erreurs.append("%s : nom inconnu « %s »" % (page.relative_to(ROOT).as_posix(), m.group(2)))
            return m.group(0)
        return m.group(1) + nom_html(c) + m.group(4)
    return _NOM.sub(remplace, html)


# ---------------------------------------------------------------- cartes
import html as _html
import json as _json
from datetime import date as _date

_ANNEE = _date.today().year
_esc = lambda s: _html.escape(str(s), quote=True)


def _annee(c):
    m = re.search(r"\d{4}", c.get("naissance") or "")
    return int(m.group(0)) if m else None


def _naissance_courte(c):
    n = c.get("naissance") or ""
    return n[:4] if re.match(r"^\d{4}-\d\d-\d\d$", n) else n


def libelle_sexe(c):
    """Étalon, Entier, Poulain, Hongre, Jument, Pouliche — d'après sexe, rôle et âge."""
    an = _annee(c)
    age = _ANNEE - an if an else None
    if c["sexe"] == "hongre":
        return "Hongre"
    if c["sexe"] == "femelle":
        return "Pouliche" if (age is not None and age < 3 and c.get("role") != "jument") else "Jument"
    if c.get("role") == "etalon":
        return "Étalon"
    return "Poulain" if (age is not None and age < 1) else "Entier"


def badge_carte(c):
    """(classe, texte) du badge posé sur la photo, ou None."""
    e = "e" if c["sexe"] == "femelle" else ""
    par = (" par " + c["vendeur"]) if c.get("vendeur") else ""
    st = c.get("statut")
    if st == "a-vendre":
        return ("vente", "À vendre" + par)
    if st == "reserve":
        return ("reserve", "Réservé" + e + par)
    if st == "vendu":
        return ("vendu", "Vendu" + e + par)
    if c.get("role") == "memoire":
        return ("memoire", "En mémoire")
    d = c.get("distinction")
    if d:
        return ("elite", "★ Élite grade 1") if "Élite grade 1" in d else ("distinction", d)
    return None


_FLECHE = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           'stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>')
_PHOTOS = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           'stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="15" height="15" rx="2"/>'
           '<path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg>')


def carte_html(c, base, contexte=None, rang=0):
    v = dict(c)
    v.update((c.get("cartes") or {}).get(contexte or "", {}))
    sexe = "femelle" if c["sexe"] == "femelle" else "male"
    photo = v.get("photo") or c.get("photo_arbre") or (
        "img/placeholders/jument.jpg" if sexe == "femelle" else "img/placeholders/etalon.jpg")
    style = ' style="object-position:%s"' % _esc(v["cadrage"]) if v.get("cadrage") else ""
    tags = [libelle_sexe(c), c.get("race"), c.get("robe_courte") or c.get("robe"), _naissance_courte(c)]
    tags_html = "".join('<span%s>%s</span>' % (' class="cc-sexe"' if i == 0 else "", _esc(t))
                        for i, t in enumerate(tags) if t)
    b = badge_carte(c)
    badge = '<span class="cc-badge cc-badge--%s">%s</span>' % (b[0], _esc(b[1])) if b else ""
    nb = len(v.get("photos") or [])
    delai = " reveal-delay-%d" % (rang % 4 + 1)

    if c.get("page"):
        ouvre = '<a class="cc cc--%s reveal%s" href="%s%s" data-cheval="%s">' % (sexe, delai, base, _esc(c["page"]), c["id"])
        ferme = "</a>"
        action = "Voir la fiche " + _FLECHE
        coin = ""
    else:
        ctx = ' data-contexte="%s"' % _esc(contexte) if contexte else ""
        ouvre = ('<article class="cc cc--%s cc--modale reveal%s" tabindex="0" role="button" '
                 'aria-haspopup="dialog" data-cheval="%s"%s>' % (sexe, delai, c["id"], ctx))
        ferme = "</article>"
        action = ("Voir les %d photos " % nb if nb > 1 else "En savoir plus ") + _FLECHE
        coin = '<span class="cc-nb">%s %d</span>' % (_PHOTOS, nb) if nb > 1 else ""

    return "\n".join(l for l in [
        ouvre,
        '  <div class="cc-photo">',
        '    <img src="%s%s" alt="%s" loading="lazy"%s>' % (base, _esc(photo), _esc(c["nom"]), style),
        ("    " + badge) if badge else "",
        ("    " + coin) if coin else "",
        "  </div>",
        '  <div class="cc-corps">',
        '    <p class="cc-tags">%s</p>' % tags_html,
        '    <h3 class="cc-nom">%s</h3>' % nom_html(c),
        ('    <p class="cc-texte">%s</p>' % _esc(v["resume"])) if v.get("resume") else "",
        '    <span class="cc-action">%s</span>' % action,
        "  </div>",
        ferme,
    ] if l)


_CARTES = re.compile(r"(<!--\s*@cartes:\s*(.*?)\s*-->)(.*?)(<!--\s*@end:cartes\s*-->)", re.S)


def injecter_cartes(html, page, par_id, erreurs):
    depth = len(page.relative_to(ROOT).parts) - 1
    base = "../" * depth

    def remplace(m):
        args = m.group(2)
        ctx = re.search(r"contexte=(\w+)", args)
        ids = [i.strip() for i in re.sub(r"contexte=\w+", "", args).split(",") if i.strip()]
        manquants = [i for i in ids if i not in par_id]
        if manquants:
            erreurs.append("%s : cartes inconnues %s" % (page.relative_to(ROOT).as_posix(), manquants))
            return m.group(0)
        # indentation : celle de la ligne du marqueur
        debut = html.rfind("\n", 0, m.start()) + 1
        ind = re.match(r"[ \t]*", html[debut:m.start()]).group(0)
        corps = "\n".join(carte_html(par_id[i], base, ctx.group(1) if ctx else None, n) for n, i in enumerate(ids))
        corps = "\n".join((ind + l) if l else l for l in corps.split("\n"))
        return m.group(1) + "\n" + corps + "\n" + ind + m.group(4)

    return _CARTES.sub(remplace, html)


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
    par_id = {c["id"]: c for c in _CHEVAUX_LUS}
    erreurs_cartes = []

    for page in pages:
        original = page.read_text(encoding="utf-8")
        html = original
        found_any = False

        for name, partial_text in (("header", header), ("footer", footer)):
            html, found = inject(html, name, partial_text, page)
            found_any = found_any or found
        html = injecter_cartes(html, page, par_id, erreurs_cartes)
        html = injecter_noms(html, page, par_id, erreurs_cartes)

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

    if erreurs_cartes:
        print("Erreurs de cartes :")
        for e in erreurs_cartes:
            print("  ✗ " + e)
        return 1

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
