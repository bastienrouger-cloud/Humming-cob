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

Pédigrées : <!-- @pedigree: id --> … <!-- @end:pedigree --> (voir plus bas).

Au lieu d'une liste, on peut demander une section entière, triée :

    <!-- @cartes: section=poulains -->

    reproducteurs  nos étalons et juments — mâles d'abord, puis du plus âgé au plus jeune
    poulains       nos poulains — à vendre, réservés, gardés, vendus, puis par âge
    memoire        nos chevaux disparus — par âge
    a-vendre       nos poulains à vendre — par âge (bas des fiches poulains)
    poulains-presents  nos poulains encore à l'élevage (pas les vendus) — même tri que poulains

« format=mini » : petites cartes photo (nom + sexe/année, badge de vente) au
lieu des grandes cartes, pour l'accueil. Seulement nos chevaux qui ont une fiche.

« sauf=id » retire un cheval de la sélection (la fiche où l'on se trouve).
Un nouveau cheval apparaît donc tout seul dans sa section (page nos-chevaux.html).

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

# Tests génétiques (champ « genetique ») : locus → allèles permis. Génotype écrit
# « X/Y » ; « _ » = allèle inconnu (ex. « E/_ » : au moins un E). Sb1 et W20 sont
# deux variantes du même gène (KIT), d'où un seul locus. Le tobiano (To) est testé
# à part. Voir data/README.md.
LOCI = {
    "PSSM1": {"N", "P"}, "FIS": {"N", "P"},
    "E": {"E", "e"}, "A": {"A", "a"}, "D": {"D", "d"}, "Z": {"Z", "z"},
    "prl": {"prl", "n"}, "Cr": {"Cr", "n"}, "To": {"To", "n"}, "KIT": {"Sb1", "W20", "n"},
}


def verifier_genetique(c, par_id, erreurs):
    """Format des génotypes, puis cohérence avec ceux des parents (chaque allèle
    connu du poulain doit pouvoir venir d'un parent dont le génotype est connu)."""
    g = c.get("genetique") or {}
    if not isinstance(g, dict):
        erreurs.append("%s : « genetique » doit être un objet {locus: génotype}" % c.get("id")); return
    for locus, gt in g.items():
        permis = LOCI.get(locus)
        al = str(gt).split("/")
        if permis is None:
            erreurs.append("%s : locus génétique inconnu « %s » (permis : %s)" % (c.get("id"), locus, ", ".join(LOCI)))
        elif len(al) != 2 or any(a not in permis | {"_"} for a in al) or al == ["_", "_"]:
            erreurs.append("%s : génotype « %s » invalide pour %s (allèles : %s, « _ » si inconnu)"
                           % (c.get("id"), gt, locus, ", ".join(sorted(permis))))
    for locus in c.get("genetique_deduit") or []:
        if locus not in g:
            erreurs.append("%s : genetique_deduit cite %s, absent de genetique" % (c.get("id"), locus))
    # cohérence mendélienne avec les parents
    pere, mere = par_id.get(c.get("pere")) or {}, par_id.get(c.get("mere")) or {}
    for locus, gt in g.items():
        if locus not in LOCI:
            continue
        a, b = str(gt).split("/") if "/" in str(gt) else ("_", "_")
        gp, gm = (pere.get("genetique") or {}).get(locus), (mere.get("genetique") or {}).get(locus)
        ap = set(gp.split("/")) if gp else None
        am = set(gm.split("/")) if gm else None
        ok = lambda x, s: x == "_" or s is None or "_" in s or x in s
        if not ((ok(a, ap) and ok(b, am)) or (ok(b, ap) and ok(a, am))):
            erreurs.append("%s : %s %s impossible avec le père %s et la mère %s"
                           % (c.get("id"), locus, gt, gp or "?", gm or "?"))


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
        verifier_genetique(c, par_id, erreurs)
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


def _dates(c):
    """« 2019 », ou « 2004 – 2023 » pour un cheval disparu."""
    n, d = _naissance_courte(c), (c.get("deces") or "")[:4]
    return "%s – %s" % (n, d) if n and d else n


# Sections de la page « Nos chevaux » : (qui en fait partie, ordre d'affichage).
_ORDRE_STATUT = {"a-vendre": 0, "reserve": 1, "garde": 2, "vendu": 3}
_age = lambda c: c.get("naissance") or "9999"        # date croissante = plus âgé d'abord
_nous = lambda c: c.get("famille") == "humming"
SECTIONS = {
    "reproducteurs": (lambda c: _nous(c) and c.get("role") in ("etalon", "jument"),
                      lambda c: (c["sexe"] == "femelle", _age(c))),
    "poulains":      (lambda c: _nous(c) and c.get("role") == "poulain",
                      lambda c: (_ORDRE_STATUT.get(c.get("statut") or "garde", 2), _age(c))),
    "memoire":       (lambda c: _nous(c) and c.get("role") == "memoire", _age),
    "a-vendre":      (lambda c: _nous(c) and c.get("role") == "poulain" and c.get("statut") == "a-vendre", _age),
    "poulains-presents": (lambda c: _nous(c) and c.get("role") == "poulain" and c.get("statut") != "vendu",
                          lambda c: (_ORDRE_STATUT.get(c.get("statut") or "garde", 2), _age(c))),
    # Accueil : les chevaux présents (ni vendus ni disparus) — à vendre d'abord,
    # puis étalons, juments, autres poulains.
}


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
    if st == "garde" and c.get("role") == "poulain":
        return ("garde", "Reste à l'élevage")
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
    tags = [libelle_sexe(c), c.get("race"), c.get("robe_courte") or c.get("robe"), _dates(c)]
    # Les dates (« 2004 – 2023 ») restent d'un bloc : <wbr> autorise le retour à
    # la ligne juste avant elles, et .cc-dates interdit de les couper.
    tags_html = "".join(
        ('<span class="cc-sexe">%s</span>' if i == 0 else
         '<wbr><span class="cc-dates">%s</span>' if i == 3 else '<span>%s</span>') % _esc(t)
        for i, t in enumerate(tags) if t)
    b = badge_carte(c)
    badge = '<span class="cc-badge cc-badge--%s">%s</span>' % (b[0], _esc(b[1])) if b else ""
    nb = len(v.get("photos") or [])
    delai = " reveal-delay-%d" % (rang % 4 + 1)

    if c.get("role") == "memoire":
        sexe += " cc--memoire"
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


def carte_mini_html(c, base, contexte=None, rang=0):
    """Petite carte photo (accueil) : photo pleine, nom usuel seul (sans affixe
    ni date) posé sur un dégradé, filet et ombre bleus/roses selon le sexe,
    seul badge : « À vendre »."""
    v = dict(c)
    v.update((c.get("cartes") or {}).get(contexte or "", {}))
    sexe = "femelle" if c["sexe"] == "femelle" else "male"
    photo = v.get("photo") or c.get("photo_arbre")
    style = ' style="object-position:%s"' % _esc(v["cadrage"]) if v.get("cadrage") else ""
    b = badge_carte(c)
    badge = ('<span class="ca-badge ca-badge--%s">%s</span>' % (b[0], _esc(b[1]))
             if b and b[0] == "vente" else "")
    # Pas de .reveal sur la carte : son transition-delay retarderait le survol.
    # L'apparition se fait sur la rangée entière (.ca-rangee.reveal).
    return "\n".join(l for l in [
        '<a class="ca ca--%s" href="%s%s" data-cheval="%s">' % (sexe, base, _esc(c["page"]), c["id"]),
        '  <img src="%s%s" alt="%s" loading="lazy"%s>' % (base, _esc(photo), _esc(c["nom"]), style),
        ("  " + badge) if badge else "",
        '  <span class="ca-fleche">%s</span>' % _FLECHE,
        '  <span class="ca-corps">',
        '    <span class="ca-nom">%s</span>' % _esc(c.get("nom_usuel") or decouper_nom(c)[1]),
        "  </span>",
        "</a>",
    ] if l)


_CARTES = re.compile(r"(<!--\s*@cartes:\s*(.*?)\s*-->)(.*?)(<!--\s*@end:cartes\s*-->)", re.S)


def injecter_cartes(html, page, par_id, erreurs):
    depth = len(page.relative_to(ROOT).parts) - 1
    base = "../" * depth

    def remplace(m):
        args = m.group(2)
        ctx = re.search(r"contexte=(\w+)", args)
        sec = re.search(r"section=([\w-]+)", args)
        sauf = set((re.search(r"sauf=([\w,]+)", args) or re.search("()", "")).group(1).split(",")) - {""}
        mini = re.search(r"format=mini", args) is not None
        ids = [i.strip() for i in re.sub(r"(contexte|section|sauf|format)=[\w,-]+", "", args).split(",") if i.strip()]
        if sec:
            if sec.group(1) not in SECTIONS:
                erreurs.append("%s : section inconnue « %s » (permis : %s)"
                               % (page.relative_to(ROOT).as_posix(), sec.group(1), ", ".join(SECTIONS)))
                return m.group(0)
            garde, cle = SECTIONS[sec.group(1)]
            ids += [c["id"] for c in sorted(_CHEVAUX_LUS, key=cle) if garde(c) and c["id"] not in ids and c["id"] not in sauf]
        manquants = [i for i in ids if i not in par_id]
        if manquants:
            erreurs.append("%s : cartes inconnues %s" % (page.relative_to(ROOT).as_posix(), manquants))
            return m.group(0)
        # indentation : celle de la ligne du marqueur
        debut = html.rfind("\n", 0, m.start()) + 1
        ind = re.match(r"[ \t]*", html[debut:m.start()]).group(0)
        if mini:
            ids = [i for i in ids if par_id[i].get("page") and (par_id[i].get("photo") or par_id[i].get("photo_arbre"))]
        faire = carte_mini_html if mini else carte_html
        corps = "\n".join(faire(par_id[i], base, ctx.group(1) if ctx else None, n) for n, i in enumerate(ids))
        corps = "\n".join((ind + l) if l else l for l in corps.split("\n"))
        return m.group(1) + "\n" + corps + "\n" + ind + m.group(4)

    return _CARTES.sub(remplace, html)


# ---------------------------------------------------------------- pédigrées
# Dans une fiche :
#
#     <!-- @pedigree: nashi -->
#     … pédigrée généré, ne pas éditer à la main …
#     <!-- @end:pedigree -->
#
# Trois générations (parents, grands-parents, arrière-grands-parents) tirées des
# champs pere/mere. Ordi : tableau classique de gauche à droite, père en haut ;
# téléphone : liste indentée. Nos chevaux → lien vers leur fiche ; extérieurs
# avec photo → modale (comme leurs cartes) ; un ancêtre inconnu reste une case
# « Inconnu » discrète, sans texte inventé.

_PG_LABELS = {1: ("Père", "Mère"), 2: ("Grand-père", "Grand-mère"), 3: ("", "")}


def _pg_meta(c, niveau):
    """Carte fermée : la robe seule (tailles de cartes homogènes). Année, taille,
    race, registre et distinctions sont dans la modale / sur la fiche."""
    return _esc(c.get("robe_courte") or c.get("robe") or ""), ""


def _pg_noeud(par_id, cid, niveau, cote, base, repete=None):
    """Une case du pédigrée. cote = 0 (père) ou 1 (mère)."""
    sexe = "femelle" if cote else "male"
    label = _PG_LABELS[niveau][cote]
    c = par_id.get(cid) if cid else None
    lab = '<span class="pg-label">%s</span>' % label if label else ""
    if not c:
        return ('<div class="pg-node pg-node--%s pg-node--inconnu pg-n%d">%s'
                '<span class="pg-nom">%s</span></div>' % (sexe, niveau, lab, "Inconnue" if cote else "Inconnu"))
    meta, extra = _pg_meta(c, niveau)
    photo = c.get("photo_arbre") or c.get("photo")
    img = ('<img class="pg-photo" src="%s%s" alt="" loading="lazy">' % (base, _esc(photo))
           if niveau == 1 and photo else "")
    corps = (img + '<span class="pg-texte">' + lab
             + '<span class="pg-nom">%s%s</span>' % (nom_html(c), (
                 '<span class="pg-repete" title="Ancêtre présent %d fois dans ce pédigrée">%d×</span>'
                 % (repete, repete)) if repete else "")
             + ('<span class="pg-meta">%s</span>' % meta if meta else "")
             + ('<span class="pg-extra">%s</span>' % extra if extra else "")
             + "</span>")
    cls = "pg-node pg-node--%s pg-n%d%s" % (sexe, niveau, " pg-node--repete" if repete else "")
    if c.get("page"):
        return '<a class="%s pg-node--lien" href="%s%s">%s<span class="pg-fleche" aria-hidden="true">→</span></a>' % (
            cls, base, _esc(c["page"]), corps)
    if c.get("photos") or c.get("photo") or c.get("photo_arbre"):
        return ('<div class="%s pg-node--modale" tabindex="0" role="button" aria-haspopup="dialog" '
                'data-cheval="%s" title="Voir les photos et les infos">%s<span class="pg-fleche">%s</span></div>'
                % (cls, c["id"], corps, _PHOTOS))
    # Ni fiche ni photo : rien à ouvrir — case atténuée, sans effet au survol.
    return '<div class="%s pg-node--simple">%s</div>' % (cls, corps)


def pedigree_html(c, par_id, base):
    # Ancêtres présents plusieurs fois (consanguinité) : repérés par un badge.
    vus = []
    def compter(cid, niveau):
        x = par_id.get(cid) if cid else None
        if not x:
            return
        vus.append(cid)
        if niveau < 3:
            compter(x.get("pere"), niveau + 1)
            compter(x.get("mere"), niveau + 1)
    compter(c.get("pere"), 1)
    compter(c.get("mere"), 1)
    repetes = {i: vus.count(i) for i in vus if vus.count(i) > 1}

    def branche(cid, niveau, cote):
        noeud = _pg_noeud(par_id, cid, niveau, cote, base, repetes.get(cid))
        x = par_id.get(cid) if cid else None
        if niveau == 3:
            return noeud
        if not x or not (x.get("pere") or x.get("mere")):
            # pas de cases « Inconnu » pour les ancêtres d'un inconnu ; la
            # branche garde sa colonne pour que la case ne s'étale pas
            return '<div class="pg-branche pg-branche--seule">%s</div>' % noeud
        p, m = x.get("pere"), x.get("mere")
        return ('<div class="pg-branche">%s<div class="pg-sous"><div class="pg-c">%s</div>'
                '<div class="pg-c">%s</div></div></div>'
                % (noeud, branche(p, niveau + 1, 0), branche(m, niveau + 1, 1)))
    return ('<div class="pg" role="group" aria-label="Pédigrée sur trois générations">'
            + '<div class="pg-gens" aria-hidden="true"><span>Parents</span><span>Grands-parents</span>'
            + '<span>Arrière-grands-parents</span></div>'
            + '<div class="pg-arbre">' + branche(c.get("pere"), 1, 0) + branche(c.get("mere"), 1, 1)
            + "</div></div>")


_PEDIGREE = re.compile(r"(<!--\s*@pedigree:\s*(\w+)\s*-->)(.*?)(<!--\s*@end:pedigree\s*-->)", re.S)


def injecter_pedigrees(html, page, par_id, erreurs):
    depth = len(page.relative_to(ROOT).parts) - 1
    base = "../" * depth

    def remplace(m):
        c = par_id.get(m.group(2))
        if not c:
            erreurs.append("%s : pédigrée inconnu « %s »" % (page.relative_to(ROOT).as_posix(), m.group(2)))
            return m.group(0)
        debut = html.rfind("\n", 0, m.start()) + 1
        ind = re.match(r"[ \t]*", html[debut:m.start()]).group(0)
        corps = pedigree_html(c, par_id, base)
        # une ligne par case, pour des diffs lisibles
        corps = re.sub(r"(<(?:div class=\"pg-(?:branche|sous|arbre|gens|c)\"|a class=\"pg-node|div class=\"pg-node))",
                       r"\n\1", corps).strip("\n")
        corps = "\n".join(ind + l for l in corps.split("\n"))
        return m.group(1) + "\n" + corps + "\n" + ind + m.group(4)

    return _PEDIGREE.sub(remplace, html)


# ---------------------------------------------------------------- sujets du formulaire
# contact.html : <!-- @sujets --> … <!-- @end:sujets --> = options du menu « Sujet »,
# tirées des données (poulains à vendre ou réservés, étalons). Une fiche peut
# présélectionner un sujet : contact.html?sujet=nashi, ?sujet=saillie-archy.

_SUJETS = re.compile(r"(<!--\s*@sujets\s*-->)(.*?)(<!--\s*@end:sujets\s*-->)", re.S)


def sujets_html():
    nous = [c for c in _CHEVAUX_LUS if c.get("famille") == "humming"]
    nom = lambda c: c.get("nom_usuel") or c["nom"]
    poulains = sorted((c for c in nous if c.get("role") == "poulain" and c.get("statut") in ("a-vendre", "reserve")),
                      key=lambda c: c.get("naissance") or "")
    etalons = sorted((c for c in nous if c.get("role") == "etalon"), key=lambda c: c.get("naissance") or "")
    o = lambda v, t: '<option value="%s">%s</option>' % (_esc(v), _esc(t))
    lignes = []
    if poulains:
        lignes.append('<optgroup label="Nos poulains">')
        lignes += ["  " + o(c["id"], nom(c) + (" (réservé%s)" % ("e" if c["sexe"] == "femelle" else "")
                                               if c.get("statut") == "reserve" else "")) for c in poulains]
        lignes.append("</optgroup>")
    if etalons:
        lignes.append('<optgroup label="Saillies">')
        lignes += ["  " + o("saillie-" + c["id"], "Saillie avec " + nom(c)) for c in etalons]
        lignes.append("</optgroup>")
    lignes += ['<optgroup label="Autre">', "  " + o("visite", "Demande de visite"),
               "  " + o("reproducteurs", "Nos reproducteurs"), "  " + o("autre", "Autre question"), "</optgroup>"]
    return lignes


def injecter_sujets(html):
    def remplace(m):
        debut = html.rfind("\n", 0, m.start()) + 1
        ind = re.match(r"[ \t]*", html[debut:m.start()]).group(0)
        return m.group(1) + "\n" + "\n".join(ind + l for l in sujets_html()) + "\n" + ind + m.group(3)
    return _SUJETS.sub(remplace, html)


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
        html = injecter_pedigrees(html, page, par_id, erreurs_cartes)
        html = injecter_sujets(html)

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
