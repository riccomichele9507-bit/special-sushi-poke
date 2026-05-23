# BUILD-PROGRESS.md — Tracking sviluppo "da demo a prodotto"

> Ultimo aggiornamento: 22 maggio 2026.
> Tracking operativo dei 6 interventi richiesti per portare la demo a prodotto vero (immagini complete, backend, dashboard titolare, notifiche Telegram).
> Per il quadro commerciale/generale vedi `PROGRESS.md`. Per i path/comandi `REFERENCE.md`.

---

## 🎯 I 6 interventi richiesti

| # | Intervento | Stato |
|---|---|---|
| 1 | File `.env` + completare immagini menu | 🟡 In corso (env fatto, immagini in test) |
| 2 | Code review multi-agente (skill) | ✅ Risolto (built-in `/ultrareview` + `/review`) |
| 3 | Security scan pre-deploy (skill) | ✅ Risolto (built-in `/security-review`) |
| 4 | Dashboard privata titolare (CMS) | ⬜ Da fare (Fase D) |
| 5 | Notifica Telegram a ogni ordine | ⬜ Da fare (Fase C) |
| 6 | File di progress | ✅ Questo file |

Legenda: ✅ fatto · 🟡 in corso · ⬜ da fare · ⏸️ in pausa

---

## 🧭 Decisioni di questa sessione (22 mag 2026)

- **Dark mode ABBANDONATA**: il cliente ha scelto la versione **chiara (cream)**. Si elimina il vincolo di sync cream↔dark. Il clone `special-sushi-poke-dark` non va più mantenuto.
- **Backend = Supabase**. Il dominio in `next.config.ts` (`ytrnunswsbgyghzyhyqs...`) **non è dell'account** → da sostituire con il progetto nuovo.
- **Supabase free = 2 progetti attivi/org**; ce ne sono già 2 attivi (`travelcrm-ai`, `quotebot`). Decisione: **mettere in pausa `travelcrm-ai`** e creare progetto dedicato `special-sushi-poke`. Se in futuro serve travelcrm, si pausa questo e si riattiva quello.
- **Immagini**: prima un **test di 8 piatti**, poi decidere sulle restanti (133 mancanti su 160).
- **Review/security**: si usano i **comandi built-in**, niente install esterni.
- **Ordine lavori**: quick win → backend ordini+Telegram → dashboard.

---

## ✅ FASE A — Quick win

- [x] **A1** `.env.local` (gitignored) + `.env.example` (committato) con tutte le variabili (kie.ai, Supabase, Telegram, sito).
- [x] **A2** Questo file + puntatore in `PROGRESS.md` + drop vincolo dark.
- [x] **A3** Immagini test: generati 8 piatti (`nigiri-salmon`, `sashimi-salmon`, `uramaki-tiger`, `poke-chicken-bowl`, `temaki-salmon-spicy`, `gunkan-salmon-classic`, `tartar-salmon`, `pollo-limone`) via `scripts/generate_test_images.py`, collegati in `data/menu.ts`, build pulita. Stile coerente con le 27 esistenti. **DA DECIDERE: generare le restanti ~125?** (ora con foto: 35/160)
- [x] **A4** Skill review/security = built-in (vedi sotto).

### Stato immagini menu (agg. 22 mag)
- Totale piatti: **160**. **Con foto ora: 54** (27 preesistenti + 8 test + 19 categorie chiave). Senza foto: 106 (fallback gradiente + kanji).
- **Costo reale kie.ai nano-banana-2 @1K = ~8 crediti/immagine.** I crediti si esauriscono → 19/65 generate, poi stop "Credits insufficient" (le fallite NON si pagano).
- Stato per categoria chiave:
  - ✅ **poke**: completo · ✅ **temaki**: completo
  - 🟡 **nigiri**: 5/8 (mancano i 3 flambé: nigiri-salmon-flambe, nigiri-tonno-flambe, nigiri-spigola-flambe)
  - ⬜ **sashimi**: mancano 5 (sashimi-tonno, sashimi-spigola, sashimi-ricciola, tataki-salmon, tataki-tonno)
  - ⬜ **uramaki**: mancano 38 (l'intero blocco — il più grande)
- **Per finire servono ~46 immagini → ~370 crediti** (poi ~570 per anche tutte le NON-chiave). Ricarica su kie.ai → Billing.
- Ri-lancio: `python scripts/generate_key_category_images.py` (salta le già fatte) → `python scripts/update_menu_images.py` → `npm run build`.

---

## ⬜ FASE B — Supabase foundation

- [ ] **B1** Pausa `travelcrm-ai` → crea progetto `special-sushi-poke` (verifica free) → URL/anon/service in `.env.local` → aggiorna `remotePattern` in `next.config.ts` → `npm i @supabase/supabase-js @supabase/ssr`.
- [ ] **B2** Schema + RLS: tabelle `categories`, `dishes`, `restaurant_settings` (singleton), `daily_special` (singleton), `orders`. Prezzi `int` (centesimi). RLS: lettura pubblica su contenuti, scrittura solo authenticated; `orders` solo lato server (service-role). `get_advisors` dopo le migration. Bucket Storage `dish-images`.
- [ ] **B3** Seed `scripts/seed-supabase.mjs` dai file `data/*.ts` (idempotente, upsert) → DB identico ai file statici.
- [ ] **B4** Client `lib/supabase/{server,client,admin}.ts` + data layer `lib/data/queries.ts` (`mapRowToDish`). Strategia anti-rottura: RSC passano dati come props; `lib/menu-registry.ts` per il cart-store sincrono; `data/*.ts` come fallback. Caching: ISR + `revalidateTag`, niente `cacheComponents` all'inizio.

---

## ⬜ FASE C — Ordini reali + Telegram

- [ ] **C1** Server action `app/actions/orders.ts` `createOrder()`: valida (zod) → ricalcola totali da DB (anti-tamper) → insert `orders` (service-role) → Telegram.
- [ ] **C2** Aggancio: `components/checkout/checkout-form.tsx` (~r.56, ramo cash) + `components/payment/fake-stripe-form.tsx` (~r.68, ramo card). Niente doppioni.
- [ ] **C3** `lib/telegram.ts` `sendOrderNotification()`: messaggio italiano leggibile, `try/catch` (ordine non fallisce se Telegram down, logga `telegram_error`).
- [ ] **PREREQUISITO UTENTE**: bot @BotFather → `TELEGRAM_BOT_TOKEN`; `TELEGRAM_CHAT_ID` (lo ricaviamo insieme).

---

## ⬜ FASE D — Auth titolare + Dashboard

- [ ] **D1** Supabase Auth email/password; utente titolare creato a mano. `app/actions/auth.ts` (login/logout).
- [ ] **D2** Protezione `/admin`: `proxy.ts` (Next 16: middleware = proxy) + check `auth.getUser()` in `app/admin/layout.tsx` e in ogni action.
- [ ] **D3** Route `app/admin/`: login, home, `menu` (lista + toggle), `menu/[id]`+`menu/new` (17 campi + upload immagine Storage), `categories`, `restaurant`, `special`, `orders` (+ `[id]`).
- [ ] **D4** Server actions CRUD `app/actions/admin/*` (auth → zod → write → `revalidateTag`). Schemi zod in `lib/validations.ts`. Riuso shadcn + react-hook-form. Dashboard desktop-first.

---

## 🔐 Definition of done (pre-deploy)

Prima di ogni `git push origin master`:
1. `npm run build` pulito.
2. `/security-review` (scan vulnerabilità: chiavi esposte, SQL injection, RLS) — soprattutto dopo Fase B/C/D.
3. `/ultrareview` su richiesta (review multi-agente) prima di milestone importanti.

---

## 🔑 Variabili d'ambiente (`.env.local`)

| Variabile | A cosa serve | Quando |
|---|---|---|
| `KIEAI_API_KEY` | generazione immagini kie.ai | Fase A (opz: la skill ha già una chiave) |
| `NEXT_PUBLIC_SUPABASE_URL` | endpoint Supabase | Fase B |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client pubblico Supabase | Fase B |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only (insert ordini, admin) | Fase B/C/D |
| `TELEGRAM_BOT_TOKEN` | bot Telegram | Fase C |
| `TELEGRAM_CHAT_ID` | destinatario notifica | Fase C |
| `NEXT_PUBLIC_SITE_URL` | URL canonico (già usato in layout) | già presente |

---

## 🧩 Note

- ⚠️ **Next.js 16 breaking changes**: leggere `node_modules/next/dist/docs/` prima di route handler / server action / middleware (es. middleware → `proxy.ts`, params async, `revalidateTag`).
- Le funzionalità 4 e 5 = pacchetti commerciali **2/3** della proposta: costruirle = costruire il prodotto vendibile.
- Tenere `data/*.ts` in repo come fallback/rollback per tutta la migrazione a DB.
