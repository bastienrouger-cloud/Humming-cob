"""
compress_images.py
Compresse toutes les images JPG/PNG du dossier img/ qui dépassent un seuil.
Crée un backup dans img/_backup/ avant de toucher aux fichiers.

Usage : python compress_images.py
"""

import os
import shutil
from pathlib import Path
from PIL import Image

# ── CONFIG ────────────────────────────────────────────────
IMG_DIR      = Path(__file__).parent / "img"
BACKUP_DIR   = IMG_DIR / "_backup"
MAX_WIDTH    = 1920          # px — réduit si plus large
JPG_QUALITY  = 82            # 80-85 = bon compromis qualité/poids
THRESHOLD_KB = 300           # ne touche pas aux fichiers déjà sous ce seuil
# ──────────────────────────────────────────────────────────

def compress(src: Path, backup: Path):
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, backup)

    img = Image.open(src)

    # Converti RGBA → RGB si nécessaire (PNG avec transparence)
    if img.mode in ("RGBA", "P"):
        if src.suffix.lower() == ".png":
            img.save(src, "PNG", optimize=True)
            return
        img = img.convert("RGB")

    # Redimensionne si trop large
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)

    img.save(src, "JPEG", quality=JPG_QUALITY, optimize=True, progressive=True)


def main():
    extensions = {".jpg", ".jpeg", ".png"}
    files = [
        p for p in IMG_DIR.rglob("*")
        if p.suffix.lower() in extensions
        and "_backup" not in p.parts
        and "_originaux" not in p.parts
    ]

    total_before = total_after = 0
    compressed = skipped = 0

    print(f"\n{'Fichier':<60} {'Avant':>8} {'Après':>8} {'Gain':>7}")
    print("-" * 90)

    for f in sorted(files):
        size_kb = f.stat().st_size / 1024
        total_before += size_kb

        if size_kb < THRESHOLD_KB:
            total_after += size_kb
            skipped += 1
            continue

        rel = f.relative_to(IMG_DIR)
        backup = BACKUP_DIR / rel
        compress(f, backup)

        new_kb = f.stat().st_size / 1024
        total_after += new_kb
        gain = size_kb - new_kb
        print(f"{str(rel):<60} {size_kb:>7.0f}K {new_kb:>7.0f}K {gain:>6.0f}K")
        compressed += 1

    print("-" * 90)
    print(f"\n✅  {compressed} fichiers compressés, {skipped} déjà OK (< {THRESHOLD_KB} KB)")
    print(f"📦  Poids total : {total_before/1024:.1f} MB  →  {total_after/1024:.1f} MB")
    print(f"💾  Économie   : {(total_before-total_after)/1024:.1f} MB")
    print(f"\nBackup dans : {BACKUP_DIR}\n")


if __name__ == "__main__":
    try:
        from PIL import Image
    except ImportError:
        print("Pillow manquant. Lance d'abord :\n  pip install pillow\n")
        raise
    main()
