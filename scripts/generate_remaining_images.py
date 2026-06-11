"""Genera le 60 immagini mancanti delle categorie non-chiave per arrivare a 160/160."""

import subprocess
import sys
import time
from pathlib import Path

GEN = Path(r"C:\Users\Notebook Lenovo\.claude\skills\nano-banana-images\scripts\generate_image.py")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "menu"
RESULTS = Path(__file__).resolve().parent / "_generated_ids.txt"

NEG = (
    "Negative prompt: no text, no watermark, no logo, no caption, no plate label, "
    "no menu price tag, no UI overlay, no plastic, no fake food, no AI gloss, "
    "no oversaturation, no cartoon, no anime, no kawaii, no extra fingers, "
    "no distorted hands, no extra limbs."
)

TPL = {
    "box": (
        "Premium food photography of a large sushi box with {desc}, neatly arranged "
        "on a dark slate platter, mixed nigiri + uramaki + sashimi sections, garnish "
        "of wasabi and pickled ginger, vivid colors of salmon orange + tuna red + "
        "white rice. Shot from 45-degree angle, warm restaurant lighting, shallow depth of field. "
        "Style: contemporary Japanese izakaya, editorial food photography. " + NEG
    ),
    "barca": (
        "Premium food photography of a small wooden sushi boat (Japanese fune) filled with "
        "{desc}, decorative wooden boat-shaped serving tray with sail detail, mixed sushi "
        "arranged inside. Shot from 45-degree angle on dark slate, warm restaurant lighting. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "hosomaki": (
        "Premium food photography of 6 small hosomaki rolls (thin Japanese sushi rolls, "
        "single-ingredient inside) with {desc}, neatly lined up on dark slate, "
        "small portions perfect for sharing, garnish of wasabi and pickled ginger. "
        "Shot from 45-degree angle, warm restaurant lighting, shallow DoF. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "fritto": (
        "Premium food photography of fried sushi roll, golden crispy tempura batter exterior, "
        "{desc}, lined up on dark slate, drizzle of sauce on top, glistening texture. "
        "Shot from 45-degree angle, warm restaurant lighting. "
        "Style: contemporary Japanese izakaya fusion, editorial. " + NEG
    ),
    "onigiri": (
        "Premium food photography of a single triangular onigiri (Japanese rice ball), "
        "compressed white rice with {desc}, half wrapped in nori seaweed strip at the base, "
        "garnish of sesame. Shot from 45-degree angle on dark slate, warm side lighting. "
        "Style: contemporary Japanese, editorial food photography. " + NEG
    ),
    "chirashi": (
        "Premium food photography of chirashi bowl: deep ceramic bowl with rice base topped "
        "with {desc}, vibrant arrangement of fresh fish slices and toppings. "
        "Shot from 90-degree top-down view, dark slate surface, warm lighting. "
        "Style: contemporary Japanese, editorial food magazine. " + NEG
    ),
    "tacos": (
        "Premium food photography of a single Japanese-style taco made with dark nori seaweed "
        "as shell, filled with {desc}, garnish of micro-greens, on dark slate. "
        "Shot from 45-degree angle, warm lighting. "
        "Style: contemporary Japanese fusion, editorial. " + NEG
    ),
    "tartare": (
        "Premium food photography of fish tartare presented in a ring-mold cylinder on dark slate "
        "plate, {desc}, garnish of microgreens. "
        "Shot from 45-degree angle, dramatic side lighting, elegant restaurant presentation. "
        "Style: contemporary Japanese fine-dining, editorial. " + NEG
    ),
    "carpaccio": (
        "Premium food photography of fish carpaccio: 12 thin slices of fresh fish fanned "
        "elegantly on a white minimalist plate, {desc}, drizzle of sauce. "
        "Shot from 45-degree angle, soft natural light, glistening fresh fish. "
        "Style: contemporary Japanese, editorial food photography. " + NEG
    ),
    "gunkan": (
        "Premium food photography of 3 small gunkan sushi (battleship rolls wrapped in nori strips), "
        "{desc}, on dark slate, glistening toppings. "
        "Shot from 45-degree angle, warm restaurant lighting. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "tempura": (
        "Premium food photography of {desc}, golden crispy tempura batter, arranged on "
        "a bamboo serving mat or dark slate, with small dipping sauce bowl. "
        "Shot from 45-degree angle, warm restaurant lighting, steam wisps. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "antipasti": (
        "Premium food photography of {desc}, traditional Asian appetizer, "
        "served on a small ceramic plate or bamboo basket. "
        "Shot from 45-degree angle on dark slate, warm restaurant lighting. "
        "Style: contemporary Japanese-Asian izakaya, editorial. " + NEG
    ),
    "grigliati": (
        "Premium food photography of {desc}, freshly grilled, char marks visible, "
        "served on a black ceramic plate with garnish. "
        "Shot from 45-degree angle, warm restaurant lighting, steam wisps. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "yakimesi": (
        "Premium food photography of Japanese fried rice (yakimeshi/yakimesi) in a "
        "deep bowl: {desc}, glistening grains with vegetables and proteins mixed in. "
        "Shot from 45-degree angle, warm restaurant lighting. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "caldi": (
        "Premium food photography of {desc}, hot Asian dish in a deep ceramic bowl, "
        "steam wisps rising. "
        "Shot from 45-degree angle on dark slate, warm restaurant lighting. "
        "Style: contemporary Japanese izakaya, editorial. " + NEG
    ),
    "dolci": (
        "Premium food photography of {desc}, traditional Japanese sweets, "
        "delicately arranged on a small ceramic plate with garnish. "
        "Shot from 45-degree angle, soft natural light, subtle colors. "
        "Style: contemporary Japanese dessert, editorial. " + NEG
    ),
}

JOBS = [
    # BOX (3)
    ("box-100", "box", "100 pieces of mixed sushi: nigiri salmon and tuna, uramaki California and salmon, sashimi assortment, hosomaki rolls"),
    ("box-70", "box", "70 pieces of mixed sushi: nigiri, uramaki, hosomaki, sashimi pieces in vibrant colors"),
    ("box-35", "box", "35 pieces of mixed sushi: small selection of nigiri, uramaki and sashimi"),
    # BARCA (1)
    ("barca-piccola", "barca", "12 mixed sushi pieces: nigiri salmon, uramaki California, sashimi tuna slices, all arranged inside a small wooden boat"),
    # HOSOMAKI (5)
    ("hoso-salmon-avocado", "hosomaki", "salmon and avocado filling, classic combination"),
    ("hoso-ebi-cotto", "hosomaki", "cooked shrimp filling, pale orange"),
    ("hoso-avocado", "hosomaki", "pure avocado filling, vegan, bright green color"),
    ("hoso-soy-frutta", "hosomaki", "soy sauce drizzle and fresh fruit pieces inside, colorful"),
    ("hoso-ebiten", "hosomaki", "golden tempura shrimp filling, crispy crumbs visible"),
    # FRITTO (3)
    ("hoso-avocado-fritto", "fritto", "small fried sushi rolls (6 pieces) with philadelphia cream cheese, fresh fruit and chef sauce inside, golden crispy crumbs on outside"),
    ("hoso-salmon-fritto", "fritto", "small fried sushi rolls (6 pieces) with spicy salmon, teriyaki glaze and fried potatoes"),
    ("fotomaki-fritto", "fritto", "8 large fried uramaki rolls with tobiko, surimi, avocado, tempura shrimp inside, teriyaki and crispy potatoes on top"),
    # ONIGIRI (3)
    ("onigiri-ebi", "onigiri", "cooked shrimp, teriyaki glaze and sesame seeds on top"),
    ("onigiri-salmon-cotto", "onigiri", "cooked salmon flakes, teriyaki and crispy fried potatoes on top"),
    ("onigiri-tonno-cotto", "onigiri", "cooked tuna, teriyaki, fried onion and sesame seeds"),
    # CHIRASHI (2)
    ("chirashi-sake", "chirashi", "fresh salmon slices, teriyaki drizzle and sesame seeds"),
    ("chirashi-misto", "chirashi", "mixed fish slices: salmon, tuna, sea bass, with mayo drizzle, teriyaki and pistachio crumble"),
    # TACOS (1)
    ("tacos-spicy-salmon", "tacos", "spicy salmon, avocado slices, teriyaki and crispy fried potatoes"),
    # TARTARE (2)
    ("tartar-tonno", "tartare", "fresh diced tuna with avocado, mango cubes, quinoa crunch and chef sauce dollops"),
    ("fresh-tartar", "tartare", "fresh diced salmon with avocado, mango cubes, sesame seeds and chef sauce"),
    # CARPACCIO (2)
    ("carpaccio-salmon", "carpaccio", "salmon carpaccio with mango cubes, avocado pieces, quinoa crunch and chef sauce drizzle"),
    ("carpaccio-tonno", "carpaccio", "tuna carpaccio with mango cubes, avocado, quinoa crunch and chef sauce"),
    # GUNKAN (2)
    ("gunkan-salmon-tobiko", "gunkan", "fresh salmon with philadelphia cream and bright orange tobiko roe on top"),
    ("gunkan-salmon-spicy", "gunkan", "spicy minced salmon with teriyaki glaze and almond crumble"),
    # TEMPURA (9)
    ("ebi-tempura-mandorla", "tempura", "3 tempura shrimp pieces coated with almond crumble"),
    ("tempura-verdura", "tempura", "mixed vegetable tempura: zucchini, sweet potato, bell pepper, broccoli pieces"),
    ("involtini-gamberi", "tempura", "3 small fried spring rolls filled with shrimp, golden phyllo dough"),
    ("involtini-primavera", "tempura", "3 small fried vegetarian spring rolls with vegetable filling"),
    ("ebi-tempura-kataifi", "tempura", "3 shrimp wrapped in crispy kataifi pastry threads, golden brown"),
    ("calamari-fritti-gamberoni", "tempura", "mixed fried seafood: calamari rings and large king prawns"),
    ("pollo-fritto", "tempura", "Japanese karaage style fried chicken pieces, golden crispy"),
    ("patate-fritte", "tempura", "classic golden french fries in a small ceramic bowl"),
    ("edamame", "tempura", "boiled edamame soybean pods with sea salt sprinkled on top, bright green"),
    # ANTIPASTI (10)
    ("nuvoletta-gamberi", "antipasti", "pale crispy shrimp crackers (prawn crackers), light and airy texture"),
    ("gomma-wakame", "antipasti", "dark green wakame seaweed salad with sesame seeds, glistening"),
    ("pane-fritto", "antipasti", "3 pieces of small sweet fried bread, golden and pillowy"),
    ("pane-coniglio", "antipasti", "3 pieces of sweet egg bread shaped or filled with rabbit meat"),
    ("chicken-bao", "antipasti", "1 single steamed bao bun filled with chicken, soft white bun split open"),
    ("gyoza-carne", "antipasti", "4 pan-fried gyoza dumplings with mixed meat filling, golden bottoms, served with dipping sauce"),
    ("ravioli-gamberi", "antipasti", "4 steamed shrimp dumplings, translucent skin showing pink shrimp inside"),
    ("ravioli-verdura", "antipasti", "4 steamed vegetable dumplings, green-tinted skin"),
    ("xiaomai-gamberi", "antipasti", "4 open-top shaomai dumplings with shrimp filling, garnish of orange tobiko on top"),
    ("ravioli-misto", "antipasti", "3 mixed dumpling assortment: shrimp, pork, vegetable, different shapes"),
    # GRIGLIATI (3)
    ("salmon-piastra", "grigliati", "2 pieces of grilled salmon fillet with grill marks, served on black ceramic plate with lemon wedge"),
    ("spiedini-gamberi", "grigliati", "3 grilled shrimp skewers on bamboo sticks, char marks visible"),
    ("spiedini-pollo", "grigliati", "3 grilled chicken yakitori skewers on bamboo sticks with teriyaki glaze"),
    # YAKIMESI (3)
    ("yakimesi-pollo", "yakimesi", "Japanese fried rice with chicken pieces, scrambled egg, mixed vegetables, green onions"),
    ("yakimesi-salmon", "yakimesi", "fried rice with cooked salmon flakes, green peas, scrambled egg, green onions"),
    ("yakimesi-verdura", "yakimesi", "vegetarian fried rice with mixed vegetables, green peas, carrots"),
    # CALDI (9)
    ("gamberi-sale-pepe", "caldi", "stir-fried prawns with salt and crushed black pepper, garnish of green onion"),
    ("spaghetti-riso-verdure", "caldi", "stir-fried rice noodles with soy sauce, mixed vegetables, scrambled egg, glistening"),
    ("spaghetti-riso-gamberi", "caldi", "stir-fried rice noodles with shrimp, vegetables, scrambled egg"),
    ("spaghetti-soia-gamberi", "caldi", "glass soy noodles with vegetables and shrimp, translucent strands"),
    ("spaghetti-soia-vegetariani", "caldi", "glass soy noodles with mixed vegetables only, vegan"),
    ("ramen-verdure", "caldi", "ramen noodles in clear broth with vegetables and soft-boiled egg half"),
    ("ramen-gamberi", "caldi", "ramen noodles in broth with carrots and shrimp on top"),
    ("sarsina-spaghetti", "caldi", "special chef's spaghetti dish with traditional Italian-Asian fusion presentation"),
    ("udon-crema-avocado", "caldi", "thick udon noodles in creamy green avocado sauce, delicate vegan dish"),
    # DOLCI (2)
    ("mochi-limone", "dolci", "2 small round mochi rice cakes with lemon filling, pale yellow color, dusted with corn starch"),
    ("mochi-pistacchio", "dolci", "2 small round mochi rice cakes with green pistachio filling, dusted with corn starch"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = len(JOBS)
    ok = 0
    generated = []
    failures = []
    start = time.time()

    for i, (did, cat, desc) in enumerate(JOBS, 1):
        out_path = OUT / f"{did}.png"
        if out_path.exists() and out_path.stat().st_size > 10_000:
            print(f"[{i}/{total}] {did}.png skip (already exists)")
            ok += 1
            generated.append(did)
            continue

        if cat not in TPL:
            print(f"[{i}/{total}] {did}: NO TEMPLATE for category '{cat}' SKIPPING")
            failures.append(did)
            continue

        prompt = TPL[cat].format(desc=desc)
        print(f"\n[{i}/{total}] {did}.png ({cat})...")
        t0 = time.time()
        result = subprocess.run(
            [
                sys.executable,
                str(GEN),
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
            generated.append(did)
            kb = out_path.stat().st_size / 1024
            print(f"  OK ({kb:.0f} KB, {elapsed:.1f}s)")
        else:
            failures.append(did)
            print(f"  FAILED ({elapsed:.1f}s)")

    RESULTS.write_text("\n".join(generated), encoding="utf-8")
    total_min = (time.time() - start) / 60
    print(f"\n=== Summary ===")
    print(f"Success: {ok}/{total}")
    print(f"Failed: {len(failures)}: {failures}")
    print(f"Time: {total_min:.1f} min")


if __name__ == "__main__":
    main()
