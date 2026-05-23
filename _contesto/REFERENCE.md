# REFERENCE.md — Riferimenti tecnici Special Sushi Poke

## Path e link

| Cosa | Valore |
|---|---|
| Codice cream (questa cartella, su Vercel) | `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke` |
| Codice dark (Tokyo Night, solo locale) | `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke-dark` |
| GitHub | https://github.com/riccomichele9507-bit/special-sushi-poke (branch `master`) |
| Vercel produzione | https://special-sushi-poke.vercel.app |
| Deliverable cliente | sul Desktop + copia in `_contesto/deliverables/` |

## Comandi

```bash
npm run dev      # sviluppo porta 3000
npm run build    # build (sempre prima di commit)
npm run lint     # eslint
git push origin master   # → Vercel auto-deploy
```

## Struttura cartelle (cream)

```
special-sushi-poke/
├── app/                 # Next.js App Router (pagine + layout)
│   ├── checkout/        # checkout + payment (finto) + success
│   ├── menu/            # pagina menu
│   ├── profile/ search/ # profilo, ricerca
│   ├── layout.tsx       # root layout (font, metadata)
│   └── page.tsx         # home
├── components/          # componenti React per feature
│   ├── cart/            # cart-drawer, cart-item-row, cart-summary, cart-upsell, ...
│   ├── checkout/        # checkout-form, ...
│   ├── home/            # daily-specials, chef-recommendations, hero, ...
│   ├── menu/            # add-to-cart-button, dish-detail-drawer, ...
│   ├── layout/          # header, mobile-tab-bar, ...
│   ├── shared/          # whatsapp-fab, price, ...
│   └── ui/              # shadcn base
├── data/               # dati statici
│   ├── menu.ts          # 149 piatti (prezzi in centesimi)
│   ├── categories.ts    # 22 categorie
│   ├── restaurant.ts    # info ristorante (nome, indirizzo, whatsapp, orari)
│   ├── specials.ts      # offerta del giorno
│   ├── reviews.ts / dish-reviews.ts / dish-extras.ts / pickup-slots.ts
├── lib/                # utility + hook + store UI
│   ├── format.ts        # formattazione prezzi/date
│   ├── validations.ts   # schemi zod
│   ├── cart-ui-store.ts # stato apertura drawer (Zustand)
│   ├── dish-detail-store.ts / pricing-store.ts / discount-codes.ts
│   ├── use-media-query.ts / use-countdown.ts
├── store/
│   └── cart-store.ts    # stato carrello globale (Zustand, persist localStorage)
├── types/
│   └── dish.ts          # tipo Dish, Category, Allergen, SpicyLevel
├── public/             # immagini (incl. /menu/*.png foto piatti)
├── design-exploration/ # mockup (mock up 1,2,5,6 .png + prompt)
└── _contesto/          # ← QUESTI documenti di contesto
```

## File chiave (dove mettere mano)

| File | Cosa fa |
|---|---|
| `store/cart-store.ts` | carrello: add/remove/increment/decrement/clear; hook `useCartItemsWithDish`, `useCartTotal`, `useCartCount`, `useCartHydrated` |
| `lib/cart-ui-store.ts` | apertura/chiusura drawer carrello |
| `lib/pricing-store.ts` | codice sconto + mancia |
| `components/cart/cart-drawer.tsx` | drawer carrello (scroll nativo + footer lean) |
| `data/menu.ts` | catalogo piatti (prezzi in centesimi) |
| `data/restaurant.ts` | dati ristorante (whatsapp `+393793697798`) |
| `app/globals.css` | palette `@theme` (vedi BRANDING.md) |

## Tipo Dish (`types/dish.ts`)

```ts
interface Dish {
  id: string; name: string; description: string;
  ingredients: string[]; price: number /* centesimi */;
  category: CategoryId; image: string; imageAlt: string;
  allergens: Allergen[]; spicyLevel: 0|1|2|3;
  isNew?, isVegan?, isFeatured?, isMostOrdered?: boolean;
  pieces?: number; bgFrom?, bgTo?: string; /* gradient fallback */
}
```

## Generazione immagini — skill nano-banana (kie.ai)

- **Posizione skill**: `C:\Users\Notebook Lenovo\.claude\skills\nano-banana-images\`
- **Script**: `scripts/generate_image.py --prompt "..." --output <path> --aspect <ratio> --resolution 1K|2K|4K`
- **Modello**: Nano Banana 2 (kie.ai), async con auto-polling
- ⚠️ **API key**: salvata in `nanobanana.env` dentro la cartella della skill. **NON è scritta qui di proposito** (segreto). Inizia con `3...`.
- Usata per generare le foto dei piatti in `public/menu/` e i mockup in `design-exploration/`.

## Dati ristorante (`data/restaurant.ts`)

- Nome: **Special Sushi Poke** — "Sushi & Poke d'asporto a Bari"
- Indirizzo: Via Giuseppe Petroni, 70124 Bari (IT) — GPS 41.1207, 16.8693
- Telefono: +39 080 123 4567 *(placeholder)* · **WhatsApp: +393793697798 (379 369 7798)** *(reale)*
- Email: ordini@specialsushipoke.it
- Orari: feriale 12:30–14:30 · 19:00–22:30 | weekend 12:30–15:00 · 19:00–23:00 | **lunedì chiuso**
- Raggio consegna: 4 km · Fascia prezzo: €€
- Social: instagram.com/specialsushipoke · facebook.com/specialsushipoke
