"""Test batch: genera 8 foto piatto mancanti per validare lo stile.

Stesso stile/negative del batch categorie esistente. 1K per costo minimo.
Output in public/menu/{id}.png. Salta i file gia' presenti.
"""

import subprocess
import sys
import time
from pathlib import Path

GEN_SCRIPT = Path(r"C:\Users\Notebook Lenovo\.claude\skills\nano-banana-images\scripts\generate_image.py")
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "menu"

NEGATIVE = (
    "Negative prompt: no text, no watermark, no logo, no caption, no plate label, "
    "no menu price tag, no UI overlay, no plastic, no fake food, no AI gloss, "
    "no oversaturation, no cartoon, no anime, no kawaii, no extra fingers, "
    "no distorted hands, no extra limbs."
)

JOBS = [
    {
        "file": "nigiri-salmon.png",
        "prompt": (
            "Premium food photography, 3 salmon nigiri pieces on dark slate, perfectly "
            "formed rice ovals each topped with a glistening fresh salmon slice, subtle "
            "sheen, garnish of small wasabi mound and pickled pink ginger, tiny soy dish "
            "in soft focus. Shot from 45-degree angle, shallow depth of field, warm "
            "restaurant lighting. Style: contemporary Japanese izakaya, editorial food "
            "photography. " + NEGATIVE
        ),
    },
    {
        "file": "sashimi-salmon.png",
        "prompt": (
            "Premium food photography, fresh salmon sashimi, 12 thick bright-orange "
            "salmon slices fanned elegantly on a white minimalist plate over a bed of "
            "shaved daikon, shiso leaf, wasabi and pickled ginger garnish. Shot from "
            "45-degree angle, soft natural light, glistening fresh fish texture. Style: "
            "contemporary Japanese, editorial food photography. " + NEGATIVE
        ),
    },
    {
        "file": "uramaki-tiger.png",
        "prompt": (
            "Premium food photography, 8 pieces of uramaki tiger roll on dark slate, "
            "inside-out rolls with tempura shrimp and avocado inside, topped with seared "
            "salmon flambe, spicy mayo and teriyaki drizzle, almond crumble, slight flame "
            "char. Shot from 45-degree angle, dramatic warm lighting, glistening "
            "highlights. Style: contemporary Japanese izakaya fusion, editorial. " + NEGATIVE
        ),
    },
    {
        "file": "poke-chicken-bowl.png",
        "prompt": (
            "Premium food photography, poke bowl with white rice base topped with cooked "
            "chicken cubes, avocado slices, cherry tomatoes, cucumber, peanut crumble and "
            "spicy mayo drizzle, in a deep ceramic bowl. Shot from 90-degree top-down view, "
            "dark slate surface, warm lighting, vibrant fresh colors. Style: contemporary "
            "Japanese poke, editorial food magazine. " + NEGATIVE
        ),
    },
    {
        "file": "temaki-salmon-spicy.png",
        "prompt": (
            "Premium food photography, a single temaki hand roll cone with salmon, avocado, "
            "spicy mayo and crispy fries protruding from the top, dark nori cone standing "
            "upright on a minimal ceramic stand, dark slate background. Shot from 45-degree "
            "angle, warm side lighting highlighting nori texture. Style: contemporary "
            "Japanese izakaya, editorial food photography. " + NEGATIVE
        ),
    },
    {
        "file": "gunkan-salmon-classic.png",
        "prompt": (
            "Premium food photography, 3 classic salmon gunkan sushi on dark slate, rice "
            "ovals wrapped in seaweed strips forming little battleships, each topped with "
            "fresh diced salmon, glistening. Garnish of wasabi and pickled ginger. Shot "
            "from 45-degree angle, warm restaurant lighting. Style: contemporary Japanese "
            "izakaya, editorial. " + NEGATIVE
        ),
    },
    {
        "file": "tartar-salmon.png",
        "prompt": (
            "Premium food photography, salmon tartare in a ring-mold cylinder on a dark "
            "slate plate, fresh diced salmon with avocado, philadelphia cream and a crispy "
            "kataifi nest on top, dollops of chef's sauce, microgreens. Shot from 45-degree "
            "angle, dramatic side lighting, elegant restaurant presentation. Style: "
            "contemporary Japanese fine-dining, editorial food magazine. " + NEGATIVE
        ),
    },
    {
        "file": "pollo-limone.png",
        "prompt": (
            "Premium food photography, crispy fried chicken pieces glazed in glossy lemon "
            "sauce, garnished with thin lemon slices and sesame seeds, served in a white "
            "ceramic dish, dark slate background. Shot from 45-degree angle, warm lighting, "
            "glistening glaze, slight steam wisps. Style: contemporary Japanese-Asian, "
            "editorial food photography. " + NEGATIVE
        ),
    },
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total = len(JOBS)
    ok = 0
    failures = []
    start_all = time.time()

    for i, job in enumerate(JOBS, 1):
        out_path = OUT_DIR / job["file"]
        if out_path.exists() and out_path.stat().st_size > 10_000:
            print(f"[{i}/{total}] {job['file']} already exists (skip)")
            ok += 1
            continue

        print(f"\n[{i}/{total}] Generating {job['file']}...")
        t0 = time.time()
        result = subprocess.run(
            [
                sys.executable,
                str(GEN_SCRIPT),
                "--prompt", job["prompt"],
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
            size_kb = out_path.stat().st_size / 1024
            print(f"  OK ({size_kb:.0f} KB, {elapsed:.1f}s)")
        else:
            failures.append(job["file"])
            print(f"  FAILED ({elapsed:.1f}s)")

    total_time = time.time() - start_all
    print(f"\n=== Summary ===")
    print(f"Success: {ok}/{total}")
    print(f"Failed: {len(failures)}")
    if failures:
        print(f"  {failures}")
    print(f"Total time: {total_time/60:.1f} min")


if __name__ == "__main__":
    main()
