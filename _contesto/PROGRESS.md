# PROGRESS.md — Stato avanzamento Special Sushi Poke

> Ultimo aggiornamento: maggio 2026. Aggiornare questo file quando cambia qualcosa di sostanziale.
>
> 🛠️ **Lavoro tecnico in corso** (immagini, backend Supabase, dashboard titolare, Telegram): vedi **`BUILD-PROGRESS.md`**.
> ⚠️ **Dark mode abbandonata** (mag 2026): il cliente ha scelto la versione **chiara (cream)**. Niente più sync cream↔dark; il clone `special-sushi-poke-dark` non si mantiene più.

## ✅ Cosa è costruito (web app demo)

- **149 piatti** in 22 categorie, prezzi in centesimi, molti con **foto reali** (generate con nano-banana, in `public/menu/`)
- **Home**: hero, offerta del giorno (countdown), consigli dello chef (con foto), categorie con kanji
- **Menu**: griglia con foto, filtri categoria, dish detail drawer (varianti + extra)
- **Carrello** (drawer vaul): scroll nativo, upsell bevande (Coca-Cola + Açaí), codice sconto, mancia, totale, CTA
- **Checkout**: form (react-hook-form + zod) → pagina pagamento **finta** → success
- **WhatsApp FAB** (numero reale 379 369 7798), mobile tab bar
- Deploy live su Vercel (versione cream; il clone dark è stato abbandonato — cliente ha scelto il chiaro)

## 🔒 Decisioni locked

- ❌ Carrello NON si apre da solo all'aggiunta piatto → solo toast (commit `34347e7`)
- ✅ Cart drawer = scroll nativo `overflow-y-auto` + `data-vaul-no-drag` (la ScrollArea radix confliggeva col touch vaul)
- ✅ Footer carrello lean: Totale + CTA; upsell/sconto/mancia dentro lo scroll
- ✅ Numero WhatsApp reale `+393793697798` in `data/restaurant.ts` (commit `b72ec1c`)

## 📦 Deliverable cliente creati (copia in `_contesto/deliverables/`)

| File | Contenuto |
|---|---|
| `Special-Sushi-Poke-Proposta-WebApp.docx` | Documento cliente: premessa, notifiche ordini (4 opzioni), collegamento cassa/gestionale/stampante, Stripe, checklist sicurezza, note interne |
| `Special-Sushi-Poke-Presentazione-Opzioni.pptx` | 8 slide verticali 9:16 (telefono): copertina, Opz 1/2/3, confronto, Opz 4a stampante, Opz 4b cassa, prossimo passo |
| `Guida-Setup-Stampante.pdf` | Cheat-sheet 10 step per installare la stampante (linguaggio non-tecnico) |
| `design-exploration/mock up 5.png` + `6.png` | Board presentazione cream + dark (nel progetto, non in deliverables) |

## 💶 Pricing locked (4 opzioni)

| Opzione | Una tantum | Canone | Extra |
|---|---|---|---|
| **1 — Base** | €650 + IVA | €20/mese | — |
| **2 — + Pagamenti online** | €850 + IVA | €25/mese | commissione Stripe 1,5% |
| **3 — + Fedeltà clienti** | €1.300 + IVA | €35/mese | commissione Stripe 1,5% |
| **4 — Stampa in cucina** | collegamento €800 + IVA | €20/mese | + apparecchiatura a carico cliente |

- **Tutte le opzioni 1/2/3 includono**: notifiche Telegram + dashboard, modifica piatti/prezzi in autonomia, **slot consegne con limite per fascia oraria**, hosting/dominio/manutenzione.
- Opz 4 = stampante dedicata in cucina **oppure** collegamento alla cassa cloud esistente.
- Web app online entro ~2 settimane dalla conferma.

## 🔍 Ricerche già fatte (per non rifarle)

- **Stampanti comande cloud** (ricevono ordini dal sito via internet, no PC in loco):
  - 🥇 Epson **TM-M30III (152)** WiFi+BT+Ethernet ~€320 — *Server Direct Print*
  - 🥈 Star **TSP143IV** ~€250-450 — *CloudPRNT*
  - 💰 **NETUM NT-806W** ~€100 — economica MA richiede tablet/PC d'appoggio (no cloud nativo)
  - ❌ Epson TM-T20IV USB-Serial = NO (niente rete). Sunmi V2/V2 Pro = 58mm troppo stretto + Android vecchio.
- **Casse telematiche cloud IT con API**: Cassa in Cloud (TeamSystem), Tilby/ex-Scloby (Zucchetti) → l'ordine entra come da Glovo. RCH/Custom/Olivetti = serve middleware (RT System). Da chiedere al cliente: "che cassa/gestionale usate?"
- **Sunmi V3 / V3 Mix** (tablet POS 80mm, Android 13): si collega via **Sunmi Cloud Printer API** (REST) — **NO app custom necessaria**, si orchestra con n8n. Utile se il cliente vuole anche cassa/touch/NFC, non solo stampa.
- **Push notifications PWA** (iOS 16.4+): richiede "Aggiungi a schermata Home", Service Worker, VAPID keys, libreria `web-push`. Pattern soft-prompt→hard-prompt per non bruciare il permesso. Momento d'oro: dopo il primo ordine. ~1,5 giorni dev, €0 ricorrente.
- **App su App Store**: 3 strade — PWA (€0, "Aggiungi a Home"), Capacitor wrap (~€2k una tantum + €99/anno Apple), React Native nativo (€5k+, sconsigliato per singolo ristorante).

## 💡 Idee / upsell futuri (NON ancora venduti)

- Dashboard admin con notifiche realtime (Supabase Realtime) — ordini live, modifica menu/offerta
- Voice agent telefonico (Vapi/Retell) che prende ordini per telefono in italiano → n8n → sistema
- Sunmi V3 come cassa-POS in cassa (architettura modulare via Sunmi Cloud + n8n)
- App su App Store via Capacitor

## 🎯 Prossimi passi possibili (se cliente conferma)

1. Backend reale: Supabase (DB ordini + auth admin + RLS) — oggi è tutto localStorage
2. Stripe (Checkout ospitato o Payment Element) — la pagina pagamento è già predisposta finta
3. Push notifications PWA
4. Slot consegne con capacità reale (tabella slot + counter atomico)
5. Integrazione stampante cloud (endpoint Server Direct Print / CloudPRNT / Sunmi Cloud)
6. Hardening: validazione server, error handling, monitoring (Sentry), backup, dominio+SSL, GDPR/cookie

## 🧩 Note progetto

- `data/restaurant.ts` telefono fisso è placeholder; WhatsApp è reale.
- `CLAUDE.md` (root) importa `AGENTS.md` (avviso Next.js 16 breaking changes) — non rimuoverlo.
