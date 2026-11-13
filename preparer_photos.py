#!/usr/bin/env python3
"""
preparer_photos.py — prépare les photos ajoutées au site (depuis le CMS ou à la main).

Lancé par l'action GitHub .github/workflows/photos.yml à chaque envoi, sur les seules
images ajoutées ou modifiées par cet envoi (les photos déjà en ligne ne sont jamais
recompressées). Peut aussi se lancer à la main :

    python3 preparer_photos.py "img/orion/nouvelle photo.jpg" …

Pour chaque image de img/ :
  - la remet à l'endroit (orientation du téléphone) ;
  - la réduit à 1920 px sur le plus grand côté ;
  - la recompresse (JPEG qualité 82) si elle dépasse 350 Ko ou 1920 px ;
  - retire les métadonnées (dont la position GPS des photos de téléphone) ;
  - convertit les HEIC/HEIF (iPhone) en .jpg et met à jour les fichiers
    data/galeries/*.json (et data/chevaux/*.json) qui y font référence.

Dépendances : Pillow, et pillow-heif pour les HEIC (pip install pillow pillow-heif).
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIF = True
except ImportError:
    HEIF = False

ROOT = Path(__file__).resolve().parent
COTE_MAX = 1920
QUALITE = 82
SEUIL_KO = 350
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def a_traiter(p: Path) -> bool:
    try:
        rel = p.resolve().relative_to(ROOT)
    except ValueError:
        return False
    return (rel.parts[0] == "img" and p.suffix.lower() in EXTENSIONS
            and not {"_backup", "_originaux"} & set(rel.parts) and p.is_file())


def preparer(p: Path):
    """Retourne le nouveau chemin si le fichier a été renommé (HEIC → JPG), sinon None."""
    heic = p.suffix.lower() in {".heic", ".heif"}
    if heic and not HEIF:
        print("  ✗ %s : HEIC non lisible (installer pillow-heif)" % p)
        return None
    taille_ko = p.stat().st_size / 1024
    img = Image.open(p)
    exif = img.getexif()
    tourne = exif.get(0x0112, 1) not in (1, None)          # orientation à appliquer
    trop_grande = max(img.size) > COTE_MAX
    if not (heic or tourne or trop_grande or taille_ko > SEUIL_KO or len(exif)):
        return None                                         # déjà prête, on n'y touche pas

    img = ImageOps.exif_transpose(img)
    if max(img.size) > COTE_MAX:
        img.thumbnail((COTE_MAX, COTE_MAX), Image.LANCZOS)

    cible = p.with_suffix(".jpg") if heic else p
    ext = cible.suffix.lower()
    if ext == ".png":
        img.save(cible, "PNG", optimize=True)
    elif ext == ".webp":
        img.save(cible, "WEBP", quality=QUALITE, method=6)
    else:
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(cible, "JPEG", quality=QUALITE, optimize=True, progressive=True)
    if heic:
        p.unlink()
    print("  ✓ %s : %.0f Ko → %.0f Ko%s" % (cible.relative_to(ROOT), taille_ko,
          cible.stat().st_size / 1024, " (converti depuis %s)" % p.name if heic else ""))
    return cible if heic else None


def remplacer_references(renommages):
    """Met à jour les chemins des photos converties dans data/galeries/ et data/chevaux/
    (écrits « img/… » à la main ou « /img/… » par le CMS)."""
    fichiers = sorted((ROOT / "data" / "galeries").glob("*.json")) + sorted((ROOT / "data" / "chevaux").glob("*.json"))
    for f in fichiers:
        texte = f.read_text(encoding="utf-8")
        nouveau = texte
        for avant, apres in renommages.items():
            for prefixe in ("", "/"):
                nouveau = nouveau.replace(json.dumps(prefixe + avant, ensure_ascii=False), json.dumps(prefixe + apres, ensure_ascii=False))
        if nouveau != texte:
            f.write_text(nouveau, encoding="utf-8")
            print("  ✓ %s : chemins mis à jour" % f.relative_to(ROOT))


def main(args):
    fichiers = [Path(a) if Path(a).is_absolute() else ROOT / a for a in args]
    fichiers = [p for p in fichiers if p.exists() and a_traiter(p)]
    if not fichiers:
        print("Aucune photo à préparer.")
        return 0
    print("Préparation de %d photo(s) :" % len(fichiers))
    renommages = {}
    for p in fichiers:
        nouveau = preparer(p)
        if nouveau:
            renommages[p.relative_to(ROOT).as_posix()] = nouveau.relative_to(ROOT).as_posix()
    if renommages:
        remplacer_references(renommages)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
