# BRANDING.md — Palette e font Special Sushi Poke

Tutto definito in **`app/globals.css`** tramite `@theme` (Tailwind v4, NESSUN `tailwind.config.ts`).
Usare sempre i token Tailwind (`bg-bamboo`, `text-ink`, `ring-border`…), mai HEX hardcoded.

## Palette "Minimal & Zen" (cream) — valori esatti

| Token | HEX | Uso |
|---|---|---|
| `paper` | `#fafaf9` | sfondo principale |
| `paper-warm` | `#f4ebe2` | sfondo secondario caldo / card |
| `ink` | `#1c1c1c` | testo principale |
| `bamboo` | `#5a7a64` | verde bambù — colore primario / CTA |
| `bamboo-soft` | `#a8c0a0` | verde chiaro (badge, bordi tenui) |
| `bamboo-deep` | `#3f5849` | verde scuro (hover, testo su chiaro) |
| `sakura` | `#f4d4d0` | rosa sakura (upsell, accenti soft) |
| `sakura-deep` | `#d99a93` | rosa scuro |
| `warm-gray` | `#6b6b65` | grigio caldo (testo secondario) |
| `warm-gray-soft` | `#b8b5ac` | grigio chiaro |
| `sushi-red` | `#c8102e` | rosso sushi (accento forte, badge offerta) |
| `gold` | `#b8965a` | oro (premium / evidenza) |
| `matcha` | `#4a7c59` | verde matcha (accento alternativo) |
| `card` | `#ffffff` | superfici card |

> Nota: nei deliverable (Word/PPTX/PDF) ho usato `sushi-red #c1454a` come accento più tenue per stampa; nel codice il token reale è `#c8102e`. Per nuovi materiali brand, il riferimento canonico è questo file (codice).

## Font (`app/layout.tsx` + `globals.css`)

| Ruolo | Font | Token Tailwind |
|---|---|---|
| Heading / titoli | **Noto Serif JP** (Google Fonts), fallback Georgia, serif | `font-heading` |
| Corpo / UI | **Inter** (Google Fonts) | `font-sans` |
| Monospace | **Geist Mono** | `font-mono` |

## Raggi (radius scale, `@theme`)

`--radius` base con scala: `sm` (×0.6) · `md` (×0.8) · `lg` (×1) · `xl` (×1.4) · `2xl` (×1.8) · `3xl` (×2.2) · `4xl` (×2.6).

## Palette "Tokyo Night" (clone dark `special-sushi-poke-dark`)

Stessa struttura di token, ma valori dark:
- Sfondo: navy/blu-nero profondo (`#0d1117` circa)
- Accento primario: **neon cyan** (`#56b6c2` circa)
- Highlight: **magenta/viola** (`#bb9af7` circa)
- Accento caldo: ambra (`#e0af68` circa)
- Testo: off-white
- Rosso sushi mantenuto per badge offerta

> Il dark è un clone visivo: stessa logica/componenti, cambia solo la palette in `globals.css`. Vedi i file reali nel clone per i valori precisi.

## Mockup di riferimento

In `design-exploration/`:
- `mock up 1.png` — board presentazione "Minimal & Zen" (4 schermate)
- `mock up 2.png` — board "Tokyo Night"
- `mock up 5.png` — board cream aggiornata (con foto reali piatti)
- `mock up 6.png` — board dark aggiornata
