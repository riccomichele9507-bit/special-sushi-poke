# Genera menu.pdf dal menu reale del sito (dati estratti dal DB Supabase).
# Impagina per categoria con nome, prezzo, ingredienti e allergeni.
# Render via Playwright (Chromium headless -> PDF A4).

import json
import html
from pathlib import Path
from playwright.sync_api import sync_playwright

DATA_FILE = r"C:\Users\Notebook Lenovo\.claude\projects\c--Users-Notebook-Lenovo-Desktop-special-sushi-poke\6dc6b2c4-dbd2-404f-9de7-2090a38469ea\tool-results\mcp-claude_ai_Supabase-execute_sql-1781643258854.txt"
OUT = Path(r"c:\Users\Notebook Lenovo\Desktop\special-sushi-poke\menu.pdf")

# --- parse dati ---
raw = open(DATA_FILE, encoding="utf-8").read()
text = json.loads(raw)["result"]
i, j = text.find("["), text.rfind("]")
dishes = json.loads(text[i:j + 1])
print("piatti:", len(dishes))

def eur(cents):
    return f"€{cents/100:.2f}".replace(".", ",")

def esc(s):
    return html.escape(s or "")

# --- raggruppa per categoria (già ordinati per cat_order, sort_order) ---
cats = []
seen = {}
for d in dishes:
    c = d["categoria"]
    if c not in seen:
        seen[c] = []
        cats.append(c)
    seen[c].append(d)

# --- costruisci HTML ---
rows = []
for c in cats:
    items = seen[c]
    block = [f'<section class="cat"><h2>{esc(c)}</h2>']
    for d in items:
        markers = ""
        if d.get("is_vegan"):
            markers += '<span class="tag veg">veg</span>'
        if (d.get("spicy_level") or 0) > 0:
            markers += '<span class="tag hot">piccante</span>'
        pieces = f' <span class="pieces">· {d["pieces"]} pz</span>' if d.get("pieces") else ""
        ingr = esc(d.get("ingredienti") or d.get("description") or "")
        allerg = d.get("allergeni")
        allerg_html = f'<div class="allerg">Allergeni: {esc(allerg)}</div>' if allerg else ""
        block.append(f'''<div class="dish">
  <div class="line">
    <span class="name">{esc(d["name"])}{pieces}{markers}</span>
    <span class="lead"></span>
    <span class="price">{eur(d["price"])}</span>
  </div>
  {'<div class="ingr">'+ingr+'</div>' if ingr else ''}
  {allerg_html}
</div>''')
    block.append("</section>")
    rows.append("\n".join(block))

body = "\n".join(rows)

doc = f"""<!doctype html><html lang="it"><head><meta charset="utf-8"><style>
  @page {{ size: A4; margin: 16mm 14mm 14mm 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: Georgia, 'Times New Roman', serif; color:#1c1c1c; margin:0; }}
  .header {{ text-align:center; border-bottom:3px solid #b8965a; padding-bottom:10px; margin-bottom:14px; }}
  .kanji {{ font-size:30px; color:#c8102e; letter-spacing:4px; }}
  .brand {{ font-size:26px; font-weight:bold; color:#3f5849; margin:2px 0; letter-spacing:1px; }}
  .sub {{ font-size:11px; color:#6b6b65; text-transform:uppercase; letter-spacing:3px; }}
  .info {{ font-size:10px; color:#6b6b65; margin-top:4px; }}
  section.cat {{ margin-top:14px; break-inside:auto; }}
  section.cat h2 {{ font-size:16px; color:#5a7a64; border-bottom:1px solid #5a7a64; padding-bottom:3px;
                    margin:0 0 8px; text-transform:uppercase; letter-spacing:1.5px; break-after:avoid; }}
  .dish {{ margin:0 0 9px; break-inside:avoid; }}
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
    <div class="kanji">寿司</div>
    <div class="brand">SPECIAL SUSHI POKE</div>
    <div class="sub">Menù · Sushi & Poke · Bari</div>
    <div class="info">Via G. Petroni 12/H-i, 70124 Bari · specialsushipokebari.com · Consegna gratuita entro 5 km</div>
  </div>
  <div class="cols">{body}</div>
  <div class="foot">Prezzi in euro, IVA inclusa. Lista allergeni completa su specialsushipokebari.com/allergeni.
  Pesce destinato al consumo crudo abbattuto secondo Reg. CE 853/2004.</div>
</body></html>"""

# --- render PDF ---
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page()
    page.set_content(doc, wait_until="networkidle")
    page.pdf(path=str(OUT), format="A4", print_background=True,
             margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    b.close()

print("OK ->", OUT, f"({OUT.stat().st_size/1024:.0f} KB)")
