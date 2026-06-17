# Genera menu.pdf dal menu reale del sito (dati dal DB), CON foto piatto + QR.
# Foto: miniature leggere (JPEG) dalle immagini del sito in public/menu/.
# QR: lo stesso del volantino (marketing/qr-sushi10.png) -> rimanda al menu online.
# Render: Playwright (Chromium headless) da file locale -> PDF A4.

import json
import html
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(r"c:\Users\Notebook Lenovo\Desktop\special-sushi-poke")
DATA_FILE = r"C:\Users\Notebook Lenovo\.claude\projects\c--Users-Notebook-Lenovo-Desktop-special-sushi-poke\6dc6b2c4-dbd2-404f-9de7-2090a38469ea\tool-results\mcp-claude_ai_Supabase-execute_sql-1781675292407.txt"
OUT = ROOT / "menu.pdf"
TMP = ROOT / "menu_tmp.html"
THUMBS = ROOT / "scripts" / "_thumbs"
THUMBS.mkdir(exist_ok=True)
QR = "marketing/qr-menu.png"  # QR pulito: rimanda solo al menu online (no sconto)

raw = open(DATA_FILE, encoding="utf-8").read()
text = json.loads(raw)["result"]
i, j = text.find("["), text.rfind("]")
dishes = json.loads(text[i:j + 1])
print("piatti:", len(dishes))

def eur(cents):
    return f"€{cents/100:.2f}".replace(".", ",")

def esc(s):
    return html.escape(s or "")

def thumb_src(image_path):
    """Crea (una volta) una miniatura JPEG 160px e ritorna il path relativo."""
    if not image_path or image_path.startswith("http"):
        return None
    name = image_path.split("/")[-1]
    src = ROOT / "public" / "menu" / name
    if not src.exists():
        return None
    stem = Path(name).stem
    dst = THUMBS / f"{stem}.jpg"
    if not dst.exists():
        im = Image.open(src).convert("RGB")
        w, h = im.size
        m = min(w, h)
        im = im.crop(((w - m) // 2, (h - m) // 2, (w - m) // 2 + m, (h - m) // 2 + m))
        im = im.resize((160, 160), Image.LANCZOS)
        im.save(dst, "JPEG", quality=72)
    return f"scripts/_thumbs/{stem}.jpg"

cats, seen = [], {}
for d in dishes:
    c = d["categoria"]
    if c not in seen:
        seen[c] = []
        cats.append(c)
    seen[c].append(d)

rows = []
for c in cats:
    block = [f'<section class="cat"><h2>{esc(c)}</h2>']
    for d in seen[c]:
        markers = ""
        if d.get("is_vegan"):
            markers += '<span class="tag veg">veg</span>'
        if (d.get("spicy_level") or 0) > 0:
            markers += '<span class="tag hot">piccante</span>'
        pieces = f' <span class="pieces">· {d["pieces"]} pz</span>' if d.get("pieces") else ""
        ingr = esc(d.get("ingredienti") or d.get("description") or "")
        allerg = d.get("allergeni")
        allerg_html = f'<div class="allerg">Allergeni: {esc(allerg)}</div>' if allerg else ""
        ts = thumb_src(d.get("image"))
        thumb = f'<img class="thumb" src="{esc(ts)}">' if ts else '<div class="thumb ph"></div>'
        block.append(f'''<div class="dish">
  {thumb}
  <div class="body">
    <div class="line">
      <span class="name">{esc(d["name"])}{pieces}{markers}</span>
      <span class="lead"></span>
      <span class="price">{eur(d["price"])}</span>
    </div>
    {'<div class="ingr">'+ingr+'</div>' if ingr else ''}
    {allerg_html}
  </div>
</div>''')
    block.append("</section>")
    rows.append("\n".join(block))

body = "\n".join(rows)

doc = f"""<!doctype html><html lang="it"><head><meta charset="utf-8"><style>
  @page {{ size: A4; margin: 16mm 14mm 14mm 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: Georgia, 'Times New Roman', serif; color:#1c1c1c; margin:0; }}
  .header {{ position:relative; text-align:center; border-bottom:3px solid #b8965a; padding-bottom:10px; margin-bottom:14px; }}
  .kanji {{ font-size:30px; color:#c8102e; letter-spacing:4px; }}
  .brand {{ font-size:26px; font-weight:bold; color:#3f5849; margin:2px 0; letter-spacing:1px; }}
  .sub {{ font-size:11px; color:#6b6b65; text-transform:uppercase; letter-spacing:3px; }}
  .info {{ font-size:10px; color:#6b6b65; margin-top:4px; }}
  .qr-box {{ position:absolute; top:0; right:0; text-align:center; }}
  .qr {{ width:78px; height:78px; }}
  .qr-cap {{ font-family:Arial,sans-serif; font-size:8px; color:#3f5849; font-weight:bold;
             text-transform:uppercase; letter-spacing:.5px; margin-top:1px; }}
  section.cat {{ margin-top:14px; }}
  section.cat h2 {{ font-size:16px; color:#5a7a64; border-bottom:1px solid #5a7a64; padding-bottom:3px;
                    margin:0 0 8px; text-transform:uppercase; letter-spacing:1.5px; break-after:avoid; }}
  .dish {{ display:flex; gap:8px; align-items:flex-start; margin:0 0 9px; break-inside:avoid; }}
  .thumb {{ width:46px; height:46px; object-fit:cover; border-radius:6px; flex-shrink:0; border:1px solid #e3ded4; }}
  .thumb.ph {{ background:linear-gradient(135deg,#eee7db,#d9d2c4); }}
  .body {{ flex:1; min-width:0; }}
  .line {{ display:flex; align-items:baseline; gap:6px; }}
  .name {{ font-size:12.5px; font-weight:bold; color:#1c1c1c; white-space:nowrap; }}
  .pieces {{ font-weight:normal; color:#6b6b65; font-size:10.5px; }}
  .lead {{ flex:1; border-bottom:1px dotted #c9c4ba; transform:translateY(-3px); }}
  .price {{ font-size:12.5px; font-weight:bold; color:#5a7a64; white-space:nowrap; font-variant-numeric:tabular-nums; }}
  .ingr {{ font-family:Arial, sans-serif; font-size:10px; color:#6b6b65; margin-top:1px; line-height:1.35; }}
  .allerg {{ font-family:Arial, sans-serif; font-size:8.5px; color:#a8a59c; margin-top:1px; }}
  .tag {{ font-family:Arial, sans-serif; font-size:8px; text-transform:uppercase; letter-spacing:.5px;
          border-radius:6px; padding:1px 5px; margin-left:6px; vertical-align:middle; }}
  .tag.veg {{ background:#e7efe5; color:#3f5849; }}
  .tag.hot {{ background:#fbe6e3; color:#c8102e; }}
  .foot {{ margin-top:18px; border-top:1px solid #e3ded4; padding-top:8px; text-align:center;
           font-family:Arial,sans-serif; font-size:9px; color:#a8a59c; }}
  .cols {{ column-count:2; column-gap:22px; }}
</style></head><body>
  <div class="header">
    <div class="qr-box"><img class="qr" src="{QR}"><div class="qr-cap">Inquadra<br>e ordina</div></div>
    <div class="kanji">寿司</div>
    <div class="brand">SPECIAL SUSHI POKE</div>
    <div class="sub">Menù · Sushi & Poke · Bari</div>
    <div class="info">Via G. Petroni 12/H-i, 70124 Bari · specialsushipokebari.com · Consegna gratuita entro 5 km</div>
  </div>
  <div class="cols">{body}</div>
  <div class="foot">Prezzi in euro, IVA inclusa. Lista allergeni completa su specialsushipokebari.com/allergeni.
  Pesce destinato al consumo crudo abbattuto secondo Reg. CE 853/2004.</div>
</body></html>"""

TMP.write_text(doc, encoding="utf-8")
try:
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        page = b.new_page()
        page.goto(TMP.as_uri(), wait_until="networkidle")
        page.wait_for_timeout(800)
        page.pdf(path=str(OUT), format="A4", print_background=True,
                 margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
        page.set_viewport_size({"width": 794, "height": 1123})
        page.screenshot(path=str(ROOT / "menu-preview.png"),
                        clip={"x": 0, "y": 0, "width": 794, "height": 1123})
        b.close()
finally:
    if TMP.exists():
        os.remove(TMP)

print("OK ->", OUT, f"({OUT.stat().st_size/1024/1024:.1f} MB)")
