"""Patcha data/menu.ts: per ogni id generato (in scripts/_generated_ids.txt) sostituisce
il campo image:"" del piatto corrispondente con image:"/menu/{id}.png".

Match robusto: trova `id: "ID" ... image: ""` restando nello stesso oggetto (lo stop a `}`
impedisce di sconfinare nel piatto successivo). Funziona sia per oggetti su una riga sia
multi-riga. Idempotente: se il piatto ha gia' un'immagine non tocca nulla.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MENU = ROOT / "data" / "menu.ts"
RESULTS_FILE = Path(__file__).resolve().parent / "_generated_ids.txt"
PUBLIC_MENU = ROOT / "public" / "menu"


def main():
    if not RESULTS_FILE.exists():
        print(f"ERROR: {RESULTS_FILE} non trovato. Esegui prima lo script di generazione.")
        sys.exit(1)

    ids = [x.strip() for x in RESULTS_FILE.read_text(encoding="utf-8").splitlines() if x.strip()]
    content = MENU.read_text(encoding="utf-8")

    patched, skipped, missing_file = [], [], []

    for dish_id in ids:
        img = PUBLIC_MENU / f"{dish_id}.png"
        if not (img.exists() and img.stat().st_size > 10_000):
            missing_file.append(dish_id)
            continue

        pattern = re.compile(r'(id: "%s"[^}]*?image: )""' % re.escape(dish_id))
        new_content, n = pattern.subn(r'\1"/menu/%s.png"' % dish_id, content, count=1)
        if n == 1:
            content = new_content
            patched.append(dish_id)
        else:
            # gia' valorizzato o id non trovato con image vuota
            skipped.append(dish_id)

    MENU.write_text(content, encoding="utf-8")

    print(f"Patched: {len(patched)}")
    print(f"Skipped (gia' con immagine o non trovato): {len(skipped)}")
    if skipped:
        print(f"  {skipped}")
    if missing_file:
        print(f"File immagine mancante per: {missing_file}")


if __name__ == "__main__":
    main()
