"""Genera le foto mancanti per le 5 categorie chiave: uramaki, poke, nigiri, sashimi, temaki.

Template di stile per categoria (coerente con le 27+8 foto esistenti). 1K per costo basso.
Output in public/menu/{id}.png. Salta i file gia' presenti. Scrive gli id riusciti in
scripts/_generated_ids.txt per il patch successivo di data/menu.ts.
"""

import subprocess
import sys
import time
from pathlib import Path

GEN_SCRIPT = Path(r"C:\Users\Notebook Lenovo\.claude\skills\nano-banana-images\scripts\generate_image.py")
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "menu"
RESULTS_FILE = Path(__file__).resolve().parent / "_generated_ids.txt"

NEGATIVE = (
    "Negative prompt: no text, no watermark, no logo, no caption, no plate label, "
    "no menu price tag, no UI overlay, no plastic, no fake food, no AI gloss, "
    "no oversaturation, no cartoon, no anime, no kawaii, no extra fingers, "
    "no distorted hands, no extra limbs."
)

TEMPLATES = {
    "uramaki": (
        "Premium food photography, 8 pieces of uramaki inside-out sushi roll on dark slate, "
        "{desc}. Rolls neatly lined up, glistening toppings, small garnish of microgreens, "
        "soy dish in soft focus. Shot from 45-degree angle, warm restaurant lighting, shallow "
        "depth of field. Style: contemporary Japanese izakaya, editorial food photography. "
    ),
    "poke": (
        "Premium food photography, a poke bowl in a deep ceramic bowl, white rice base topped "
        "with {desc}, neatly arranged sections, vibrant fresh colors. Shot from 90-degree "
        "top-down view, dark slate surface, warm lighting. Style: contemporary Japanese poke, "
        "editorial food magazine. "
    ),
    "temaki": (
        "Premium food photography, a single temaki hand roll cone made of dark nori, filled "
        "with {desc}, ingredients protruding from the top, standing upright on a minimal "
        "ceramic stand, dark slate background. Shot from 45-degree angle, warm side lighting. "
        "Style: contemporary Japanese izakaya, editorial food photography. "
    ),
    "nigiri": (
        "Premium food photography, {desc}, on dark slate, glistening, small garnish of wasabi "
        "mound and pickled pink ginger. Shot from 45-degree angle, shallow depth of field, "
        "warm restaurant lighting. Style: contemporary Japanese izakaya, editorial food "
        "photography. "
    ),
    "sashimi": (
        "Premium food photography, {desc}, fanned elegantly on a white minimalist plate over a "
        "bed of shaved daikon with a shiso leaf, wasabi and pickled ginger. Shot from "
        "45-degree angle, soft natural light, glistening fresh fish. Style: contemporary "
        "Japanese, editorial food photography. "
    ),
}

JOBS = [
    # ---- POKE (9) ----
    ("duo-bowl", "poke", "tempura shrimp, salmon, mango, avocado, philadelphia cream and almond sauce"),
    ("poke-spigola-bowl", "poke", "soy-lime marinated sea bass, mango, wakame seaweed and almonds"),
    ("poke-crunchy-bowl", "poke", "crispy tempura, shrimp, wakame, cherry tomatoes, pistachio and wasabi mayo"),
    ("poke-salmon", "poke", "fresh salmon, avocado, edamame, corn, philadelphia, teriyaki and crispy fries"),
    ("poke-gamberi", "poke", "black venere rice, tempura shrimp, salmon, avocado, wakame, corn, pineapple and teriyaki"),
    ("poke-rainbow", "poke", "salmon, tuna, sea bass, avocado, tomato, edamame, corn and sesame"),
    ("poke-ananas", "poke", "salmon, avocado, pineapple, corn, wakame, philadelphia, teriyaki and fried onion"),
    ("poke-salmon-cotto", "poke", "cooked salmon, cooked shrimp, avocado, corn, wakame, mayo, teriyaki, philadelphia and crispy kataifi"),
    ("poke-vegetables", "poke", "lettuce, carrot, edamame, avocado, corn, purple cabbage, olives, pistachio and cashews (vegan)"),

    # ---- TEMAKI (5) ----
    ("temaki-maguro", "temaki", "fresh tuna, avocado and sesame"),
    ("temaki-gamberi", "temaki", "shrimp, avocado, philadelphia, teriyaki and crispy fries"),
    ("temaki-maguro-cotto", "temaki", "cooked tuna, avocado, teriyaki and fried onion"),
    ("temaki-venere-soy", "temaki", "black venere rice, philadelphia, tempura shrimp and almond sauce"),
    ("temaki-california", "temaki", "surimi crab, avocado, teriyaki and sesame"),

    # ---- NIGIRI (8) ----
    ("nigiri-tonno", "nigiri", "3 tuna nigiri pieces, deep red tuna slices on perfectly formed rice ovals"),
    ("nigiri-spigola", "nigiri", "3 sea bass nigiri pieces, white fish slices on rice ovals"),
    ("nigiri-ricciola", "nigiri", "3 amberjack yellowtail nigiri pieces, pale fish slices on rice ovals"),
    ("nigiri-amaebi", "nigiri", "3 sweet raw red shrimp amaebi nigiri pieces on rice ovals"),
    ("nigiri-ebi", "nigiri", "3 cooked butterflied shrimp nigiri pieces on rice ovals"),
    ("nigiri-salmon-flambe", "nigiri", "3 flame-seared salmon nigiri pieces with teriyaki, spicy mayo and pistachio"),
    ("nigiri-tonno-flambe", "nigiri", "3 flame-seared tuna nigiri pieces with spicy mayo, teriyaki and almond"),
    ("nigiri-spigola-flambe", "nigiri", "3 flame-seared sea bass nigiri pieces with almond sauce and almonds"),

    # ---- SASHIMI (5) ----
    ("sashimi-tonno", "sashimi", "12 thick slices of deep red tuna sashimi"),
    ("sashimi-spigola", "sashimi", "12 slices of white sea bass sashimi"),
    ("sashimi-ricciola", "sashimi", "12 slices of pale amberjack yellowtail sashimi"),
    ("tataki-salmon", "sashimi", "8 slices of lightly seared salmon tataki with teriyaki glaze and sesame"),
    ("tataki-tonno", "sashimi", "8 slices of lightly seared tuna tataki with teriyaki glaze and sesame"),

    # ---- URAMAKI (38) ----
    ("uramaki-astice", "uramaki", "lobster and avocado inside, tobiko roe and teriyaki glaze on top"),
    ("uramaki-lovestar", "uramaki", "black and white rice, salmon and avocado inside, salmon, philadelphia, teriyaki and pistachio on top"),
    ("uramaki-mandorla", "uramaki", "salmon and avocado inside, salmon, almond sauce and almond crumble on top"),
    ("uramaki-pistachio", "uramaki", "salmon, avocado and philadelphia inside, pistachio crumble and green pistachio sauce on top"),
    ("uramaki-tiger-plus", "uramaki", "fried surimi and fried avocado inside, flame-seared salmon, spicy mayo, teriyaki and almond on top"),
    ("uramaki-tobiko", "uramaki", "salmon, avocado and philadelphia inside, bright orange tobiko roe on top"),
    ("uramaki-salmon", "uramaki", "classic salmon and avocado inside, sesame coating"),
    ("uramaki-spicy-ebiten", "uramaki", "tempura shrimp and avocado inside, spicy salmon, teriyaki and crispy fries on top"),
    ("uramaki-ebiten", "uramaki", "tempura shrimp and lettuce inside, sesame, teriyaki mayo and crispy fries on top"),
    ("uramaki-ebiten-plus", "uramaki", "tempura shrimp and philadelphia inside, sesame, teriyaki and crispy kataifi on top"),
    ("uramaki-fry", "uramaki", "fried salmon, avocado and mayo inside, flame-seared salmon, spicy mayo, teriyaki and pistachio on top"),
    ("uramaki-miura-plus", "uramaki", "cooked salmon, avocado and philadelphia inside, sesame, teriyaki and crispy fries on top"),
    ("uramaki-tonno-cotto", "uramaki", "cooked tuna, avocado and philadelphia inside, sesame, teriyaki and fried onion on top"),
    ("uramaki-dragon", "uramaki", "tempura king prawns and sweet potato inside, avocado slices arranged like dragon scales, teriyaki and sesame on top"),
    ("uramaki-rainbow", "uramaki", "mixed fish inside, assorted fish slices and avocado on top, almond sauce and teriyaki"),
    ("uramaki-chicken", "uramaki", "fried chicken, cucumber and mayo inside, sesame, spicy mayo, teriyaki and fried onion on top"),
    ("uramaki-guacamole", "uramaki", "salmon, cucumber and cooked shrimp inside, guacamole, teriyaki, wasabi and green peas on top"),
    ("uramaki-philadelphia", "uramaki", "salmon, avocado and philadelphia inside, sesame coating"),
    ("uramaki-salmon-spicy", "uramaki", "salmon and avocado inside, spicy flame-seared salmon, teriyaki and crispy fries on top"),
    ("uramaki-tonno-spicy", "uramaki", "tuna and avocado inside, spicy mayo, teriyaki and almond on top"),
    ("uramaki-mazara", "uramaki", "salmon and avocado inside, raw red prawns and lime on top"),
    ("uramaki-lemon", "uramaki", "tempura shrimp and philadelphia inside, salmon tartare, lemon sauce and crispy kataifi on top"),
    ("uramaki-crispy", "uramaki", "tempura shrimp and philadelphia inside, flame-seared citron, teriyaki and green onion on top"),
    ("uramaki-special-miura", "uramaki", "cooked salmon and avocado inside, salmon, wakame, teriyaki and sesame on top"),
    ("uramaki-queen", "uramaki", "salmon, avocado and philadelphia inside, fresh strawberry slices and teriyaki on top"),
    ("uramaki-mango", "uramaki", "salmon, mango and philadelphia inside, mango sauce and sesame on top"),
    ("uramaki-pink", "uramaki", "salmon and philadelphia inside, delicate pink truffle sauce on top"),
    ("uramaki-nudo", "uramaki", "no seaweed, rice outside with salmon, avocado, philadelphia and sesame"),
    ("uramaki-arcobaleno", "uramaki", "tempura shrimp inside, assorted mixed fish on top, teriyaki mayo"),
    ("uramaki-affumicato", "uramaki", "tempura shrimp and avocado inside, smoked salmon, arugula sauce and crispy fries on top"),
    ("uramaki-fresh", "uramaki", "salmon, avocado, cucumber and sesame, fresh and light"),
    ("uramaki-ananas", "uramaki", "salmon, philadelphia and pineapple inside, sesame coating"),
    ("uramaki-nero-ricciola", "uramaki", "black rice, fried amberjack, mayo and avocado inside, spicy mayo, teriyaki and pistachio on top"),
    ("uramaki-venere-mandorla", "uramaki", "black venere rice, avocado, tempura shrimp and philadelphia inside, teriyaki and almond on top"),
    ("uramaki-ebiten-venere", "uramaki", "black venere rice, tempura shrimp inside, teriyaki, crispy kataifi and tobiko on top"),
    ("uramaki-fry-venere", "uramaki", "black venere rice, fried salmon and avocado inside, spicy salmon, teriyaki, almond and pistachio on top"),
    ("uramaki-venere-vegetarian", "uramaki", "black venere rice, fried vegetables inside, flame-seared salmon, teriyaki and tobiko on top"),
    ("uramaki-ebi-bollito", "uramaki", "boiled shrimp, avocado and mayonnaise inside, sesame and fried almond sauce on top"),
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total = len(JOBS)
    ok = 0
    generated_ids = []
    failures = []
    start_all = time.time()

    for i, (dish_id, cat, desc) in enumerate(JOBS, 1):
        out_path = OUT_DIR / f"{dish_id}.png"
        if out_path.exists() and out_path.stat().st_size > 10_000:
            print(f"[{i}/{total}] {dish_id}.png already exists (skip)")
            ok += 1
            generated_ids.append(dish_id)
            continue

        prompt = TEMPLATES[cat].format(desc=desc) + NEGATIVE
        print(f"\n[{i}/{total}] Generating {dish_id}.png ({cat})...")
        t0 = time.time()
        result = subprocess.run(
            [
                sys.executable,
                str(GEN_SCRIPT),
                "--prompt", prompt,
                "--output", str(out_path),
                "--aspect", "4:3",
                "--resolution", "1K",
            ],
            capture_output=False,
            text=True,
        )
        elapsed = time.time() - t0
        if result.returncode == 0 and out_path.exists() and out_path.stat().st_size > 10_000:
            ok += 1
            generated_ids.append(dish_id)
            print(f"  OK ({out_path.stat().st_size/1024:.0f} KB, {elapsed:.1f}s)")
        else:
            failures.append(dish_id)
            print(f"  FAILED ({elapsed:.1f}s)")

    RESULTS_FILE.write_text("\n".join(generated_ids), encoding="utf-8")

    total_time = time.time() - start_all
    print(f"\n=== Summary ===")
    print(f"Success: {ok}/{total}")
    print(f"Failed: {len(failures)}")
    if failures:
        print(f"  {failures}")
    print(f"Total time: {total_time/60:.1f} min")
    print(f"Generated ids written to: {RESULTS_FILE}")


if __name__ == "__main__":
    main()
