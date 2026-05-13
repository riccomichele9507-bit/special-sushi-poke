"""Batch-generate the 17 missing category photos for Special Sushi Poke.

Calls the nano-banana-images skill's generate_image.py for each prompt,
saving to public/menu/ in this project. All at 1K resolution to keep cost low (~$1.70 total).
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
        "file": "barca-grande.png",
        "prompt": (
            "Premium food photography, large wooden sushi boat (Japanese style) full of "
            "assorted sushi: uramaki rolls, nigiri pieces, sashimi slices, hosomaki, gyoza, "
            "gunkan. Shot from 45-degree angle on dark slate table, hand-crafted wood boat "
            "detail visible. Wasabi, ginger, soy sauce in small ceramic dishes nearby. Warm "
            "restaurant ambient lighting, dramatic shadows, food magazine cover quality. "
            "Style: contemporary Japanese izakaya, editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "nigiri-misto.png",
        "prompt": (
            "Premium food photography, mixed nigiri platter on dark slate, 12 pieces of "
            "assorted nigiri: 4 salmon, 4 tuna red, 4 seabass white, perfectly formed rice "
            "ovals with fresh fish slices on top. Each piece shiny and glistening. Garnish "
            "of fresh wasabi mound, pickled pink ginger, small soy sauce dish. Shot from "
            "45-degree angle, shallow depth of field, warm restaurant lighting. Style: "
            "contemporary Japanese izakaya, editorial. "
            + NEGATIVE
        ),
    },
    {
        "file": "temaki-salmon.png",
        "prompt": (
            "Premium food photography, Japanese hand roll (temaki) with salmon, avocado "
            "and sesame, dark nori cone holding fresh salmon strips, avocado slices and "
            "sesame seeds protruding from the top. Single perfect cone standing upright "
            "on minimal ceramic stand, dark slate background, shot from 45-degree angle. "
            "Warm side lighting highlighting the texture of nori and fish. Wasabi and "
            "ginger small bowl in soft focus background. Style: contemporary Japanese "
            "izakaya, editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "hoso-salmon.png",
        "prompt": (
            "Premium food photography, thin hosomaki rolls with salmon, 6 pieces in a neat "
            "row on bamboo wooden board, each small roll showing perfectly centered orange "
            "salmon core wrapped in dark nori. Tiny garnish of wasabi and pickled pink "
            "ginger on the side, dark slate background. Shot from 45-degree angle, shallow "
            "depth of field, warm restaurant lighting. Style: contemporary Japanese izakaya, "
            "minimalist editorial. "
            + NEGATIVE
        ),
    },
    {
        "file": "uramaki-fritto.png",
        "prompt": (
            "Premium food photography, hot fried sushi rolls (uramaki tempura), 8 pieces on "
            "dark slate, golden crispy tempura coating outside with light melted cheese "
            "drizzle on top, decorative teriyaki sauce streaks, kataifi crunch garnish, "
            "small flame of seared salmon on each piece. Steam wisps visible. Shot from "
            "45-degree angle, dramatic lighting from upper right, deep shadows. Style: "
            "contemporary Japanese izakaya fusion, editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "onigiri-sake.png",
        "prompt": (
            "Premium food photography, Japanese onigiri rice ball with salmon and "
            "philadelphia cream cheese filling, triangular shape with nori strip wrapped "
            "around the base, sesame seeds sprinkled on top. Resting on minimal ceramic "
            "plate, dark slate background. Shot from 45-degree angle, soft warm lighting, "
            "single piece in sharp focus, second piece soft-focus background. Style: "
            "contemporary Japanese, editorial food magazine. "
            + NEGATIVE
        ),
    },
    {
        "file": "king-chirashi.png",
        "prompt": (
            "Premium food photography, deluxe chirashi bowl with black rice base, topped "
            "with fresh salmon tartare, sliced avocado, philadelphia dollops, almond "
            "crumble, drizzle of arugula sauce and teriyaki. Shot from 90-degree top-down "
            "view in a deep ceramic bowl, dark slate surface, warm restaurant lighting "
            "highlighting the contrast of colors against black rice. Style: contemporary "
            "Japanese izakaya premium, editorial food magazine. "
            + NEGATIVE
        ),
    },
    {
        "file": "tacos-sake.png",
        "prompt": (
            "Premium food photography, Japanese-fusion sushi tacos, 2 crispy shells filled "
            "with fresh salmon cubes, avocado, mango salsa, philadelphia cream, teriyaki "
            "drizzle, sesame seeds on top. Standing in a wooden taco holder rack, dark "
            "slate surface, shot from 45-degree angle, warm side lighting highlighting the "
            "texture of the crispy shell. Style: contemporary Japanese fusion, editorial "
            "food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "tris-tartar.png",
        "prompt": (
            "Premium food photography, trio of tartare: salmon tartare, tuna tartare, "
            "seabass tartare, each in its own small ring-mold cylinder on a long dark "
            "slate plate, garnished with avocado, quinoa, chef's signature sauce dollops, "
            "microgreens. Shot from 45-degree angle, dramatic side lighting, elegant "
            "restaurant presentation. Style: contemporary Japanese fine-dining, editorial "
            "food magazine. "
            + NEGATIVE
        ),
    },
    {
        "file": "carpaccio-misto.png",
        "prompt": (
            "Premium food photography, mixed fish carpaccio platter, 12 thin slices of "
            "salmon, tuna and seabass arranged in a circular fan pattern on white "
            "minimalist plate, garnished with avocado cubes, mango cubes, quinoa, drops "
            "of chef's sauce, microgreens. Shot from 45-degree angle, soft natural light, "
            "restaurant magazine quality. Style: contemporary Japanese-Italian fusion, "
            "editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "gunkan-tempura.png",
        "prompt": (
            "Premium food photography, gunkan-style sushi 3 pieces on dark slate, rice "
            "ovals wrapped in seaweed strips forming little battleships, topped with "
            "seared salmon flambe, cream cheese, fried tempura shrimp pieces, drizzle of "
            "sweet chili and chives. Shot from 45-degree angle, dramatic warm lighting, "
            "glistening highlights on the flambe. Style: contemporary Japanese izakaya, "
            "editorial. "
            + NEGATIVE
        ),
    },
    {
        "file": "ebi-tempura.png",
        "prompt": (
            "Premium food photography, 5 jumbo prawns tempura, golden crispy batter, "
            "lined up on white minimal plate, accompanied by small bowl of dipping "
            "tentsuyu sauce and a slice of lemon, daikon shavings. Steam wisps visible. "
            "Shot from 45-degree angle, warm restaurant lighting, shallow depth of "
            "field. Style: contemporary Japanese izakaya, editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "gyoza-pollo.png",
        "prompt": (
            "Premium food photography, 4 chicken gyoza dumplings pan-fried on bamboo "
            "steamer with golden crispy bottom and translucent steamed tops, fresh "
            "chopped scallions and sesame seeds on top, small ceramic bowl of "
            "soy-vinegar dipping sauce on the side. Dark slate background, shot from "
            "45-degree angle, warm steam visible. Style: contemporary Japanese izakaya, "
            "editorial. "
            + NEGATIVE
        ),
    },
    {
        "file": "gamberoni-piastra.png",
        "prompt": (
            "Premium food photography, 3 grilled jumbo shrimp on a black hot iron pan "
            "still sizzling, charred grill marks visible, sprinkled with sea salt and "
            "herbs, lemon wedge on the side. Dark slate background, dramatic lighting "
            "from above, slight smoke wisps. Shot from 45-degree angle, food magazine "
            "cover quality. Style: contemporary izakaya grill, editorial food "
            "photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "yakimesi-gamberi.png",
        "prompt": (
            "Premium food photography, Japanese-style fried rice (yakimesi) with shrimp, "
            "scrambled egg pieces, scallions, vegetables, served in a wide ceramic bowl. "
            "Shot from 45-degree angle, dark slate background, slight steam wisps, warm "
            "lighting highlighting the textures of rice and shrimp. Style: contemporary "
            "Japanese izakaya, editorial food photography. "
            + NEGATIVE
        ),
    },
    {
        "file": "ramen-zuppa.png",
        "prompt": (
            "Premium food photography, steaming bowl of Japanese ramen with shoyu broth, "
            "soft egg with runny yolk cut in half, tempura shrimp on top, fresh greens, "
            "scallions, wakame seaweed strips. Wooden chopsticks resting on bowl rim. "
            "Shot from 45-degree angle, dark slate background, dramatic steam wisps "
            "illuminated from the side, warm restaurant lighting. Style: contemporary "
            "Japanese ramen-ya, editorial food cover. "
            + NEGATIVE
        ),
    },
    {
        "file": "mochi-mango.png",
        "prompt": (
            "Premium food photography, 2 Japanese mochi sweets, soft yellow-orange "
            "mango-flavored, dusted with light powder, on a small minimalist white "
            "ceramic plate, sliced piece showing the soft mango filling inside. Shot "
            "from 45-degree angle, soft natural light, clean composition, minimal "
            "Japanese aesthetic background slightly out of focus. Style: contemporary "
            "Japanese sweets, editorial food photography. "
            + NEGATIVE
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
