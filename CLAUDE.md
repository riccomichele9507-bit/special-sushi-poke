@AGENTS.md

# CLAUDE.md — Special Sushi Poke (web app per ordini online)

> Istruzioni di progetto auto-caricate in ogni sessione Claude Code aperta in questa cartella.
> **Contesto vivo**: leggi `_contesto/BUILD-PROGRESS.md` per lo stato tecnico in corso, `_contesto/PROGRESS.md` per stato commerciale + pricing, `_contesto/REFERENCE.md` per path/comandi, `_contesto/BRANDING.md` per palette/font.
> **Piano produzione**: `C:\Users\Notebook Lenovo\.claude\plans\analizza-tutta-la-cartella-delightful-eclipse.md` — è la verità di cosa stiamo costruendo (FASE B/C/D + cross-cutting).

---

## Cos'è questo progetto

Web app **mobile-first** di ordini d'asporto per **Special Sushi Poke**, ristorante sushi/poke reale a **Bari** (Via G. Petroni, 70124). Nata come demo cold-outreach, il cliente ha **confermato il Pacchetto Premium con fedeltà** e ora si costruisce il prodotto vero: ordini reali, pagamenti Stripe, stampante cloud in cucina, dashboard titolare, sistema clienti con campagne email.

### Stato (giugno 2026)
- ✅ **FASE A completata**: 96/160 piatti con foto AI live su Vercel; env, progress, push fatti.
- 🔨 **FASE B/C/D in pipeline**: backend Supabase + customer-facing (auth, Stripe, CloudPRNT printer, Resend email) + dashboard admin.
- 📋 **Piano completo** nel plan file (vedi link in cima).
- 🚫 **Versione dark abbandonata**: cliente ha scelto cream. Niente più sync cream/dark.

---

## Stack tecnico (definitivo)

**Frontend**
- Next.js **16.2.6** App Router + React **19.2.4** + TypeScript strict
- Tailwind **v4** (config inline `app/globals.css` con `@theme`, NON c'è `tailwind.config.ts`)
- Zustand 5 (cart, UI), Framer Motion 12 + GSAP 3 (animazioni)
- shadcn + vaul (drawer) + sonner (toast)
- react-hook-form 7 + zod 4 (form)
- lucide-react (icone)

**Backend / servizi**
- **Supabase** (Postgres + Auth con Passkeys + Storage + Realtime) — progetto `lbdwvgcnwvkisrjqremx` (region `eu-north-1`), free tier
- **Stripe Checkout** (Apple Pay + Google Pay attivati) — pagamenti card
- **Resend** (free 3k/mese) — email transazionali + marketing **solo verso il cliente**
- **Google Maps** (Places Autocomplete + Distance Matrix) — geocoding indirizzi + distanza stradale
- **Star Micronics TSP143IV CloudPRNT** — stampante cucina (polling architecture)
- `node-thermal-printer` (lib npm) per generare ESC/POS Star

**Compliance / privacy**
- Iubenda free — cookie banner + privacy policy
- Sentry free — error tracking
- UptimeRobot free — monitoring uptime

**Scartati esplicitamente**: Clerk (Supabase Auth basta), n8n (overhead inutile), Telegram (sostituito da dashboard Realtime), Mapbox (Google più preciso su civici IT).

---

## Dove vive il codice

| Cosa | Path |
|---|---|
| **Progetto** (su Vercel) — questa cartella | `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke` |
| GitHub | `riccomichele9507-bit/special-sushi-poke` (branch `master`) |
| Vercel produzione | `https://special-sushi-poke.vercel.app` |
| Supabase project | `lbdwvgcnwvkisrjqremx.supabase.co` |
| Plan file v2 | `C:\Users\Notebook Lenovo\.claude\plans\analizza-tutta-la-cartella-delightful-eclipse.md` |

---

## Comandi

```bash
npm run dev      # sviluppo (porta 3000)
npm run build    # build produzione — SEMPRE prima di committare
npm run lint     # eslint
```

**Deploy**: `git push origin master` → Vercel auto-deploy. (Se webhook salta: `git commit --allow-empty` o Redeploy dal dashboard Vercel.)

---

## Convenzioni operative (NON negoziabili)

1. **Prezzi in centesimi** ovunque (`3000` = €30,00). Formattazione via `lib/format.ts`. Mai float.
2. **Build prima del commit**: `npm run build` deve passare pulito.
3. **Lingua**: italiano per UI/contenuti/copy d'errore; inglese tecnico solo dove standard.
4. **Mobile-first**: target iPhone in verticale. Testare lì per primo. Dashboard admin = desktop-first OK.
5. **Palette**: token Tailwind da `app/globals.css` (`bg-bamboo`, `text-ink`…), MAI HEX hardcoded.
6. **WhatsApp reale**: `+393793697798` in `data/restaurant.ts`.
7. **Time zone esplicita**: tutti i calcoli orari in `Europe/Rome` (mai `new Date()` default per logica di cutoff). Servers girano UTC.
8. **Anti-tamper**: server ricalcola SEMPRE totali, ETA, sconti, capacity dal DB. Mai fidarsi del client.
9. **Service-role key**: `import 'server-only'` in `lib/supabase/admin.ts`. MAI prefisso `NEXT_PUBLIC_`. Mai in client component.
10. **Secrets in `.env.local`** (gitignored). `.env.example` committato come template.
11. **Email solo verso il cliente**. Per il titolare → dashboard Realtime + banner sticky. Mai email a lui.

## Decisioni locked (non rifare senza motivo)

- ❌ Carrello NON si apre da solo all'aggiunta piatto → solo toast (commit `34347e7`).
- ✅ Cart drawer = scroll nativo (`overflow-y-auto` + `data-vaul-no-drag`), NON ScrollArea radix (confliggeva col touch vaul).
- ✅ Footer carrello lean: solo Totale + CTA; upsell/sconto/mancia dentro lo scroll.
- ✅ Versione **chiara (cream) unica**. Dark abbandonata.
- ✅ Registrazione cliente **obbligatoria** per ordinare (no guest checkout).
- ✅ **Documento Commerciale fiscale** emesso manualmente dal titolare via SmartPOS Nexi al momento della consegna — **nessuna integrazione codice** lato app.

---

## 🤖 Strategia Agent Teams (sviluppo parallelo)

Feature sperimentale Claude Code 2.1.32+, abilitata in `.claude/settings.json`.

### Composizione fissa per questo progetto (max 3 agenti)
- **2× Sonnet 4.6** — implementazione parallela (CRUD, route handler, server actions, UI). Veloci ed economici.
- **1× Opus QA** — quality gate prima del merge: security review (RLS, anti-tampering, validazioni), edge case (race condition, refund, totali), code review architetturale.

### Quando usarli
- ✅ **FASE C** (customer-facing): sub-fasi indipendenti (Auth / Stripe / CloudPRNT / Email / Geocoding / ETA).
- ✅ **FASE D** (admin dashboard): pagine CRUD disgiunte (menu / categories / restaurant / special / closures / delivery / orders / customers).
- ❌ **FASE B** (Supabase foundation): lavoro sequenziale (schema → seed → data layer), nessun parallelismo utile.
- ❌ **Singolo bugfix / esplorazione codice**: una sessione singola o subagent Explore.

### Regole operative obbligatorie
1. **Ownership disgiunta dei file**: ogni Sonnet ha cartelle/file suoi, mai sovrapposizione. Esempio FASE C — Agent1: `app/{login,signup,account}/*` + auth actions. Agent2: `app/api/{stripe,cloudprnt}/*` + payment/print actions.
2. **QA Opus non committa mai direttamente**: legge le PR dei Sonnet, propone fix, decide GO/NO-GO al merge.
3. **Plan approval obbligatorio** per ogni teammate (`require plan approval before changes`) — niente lavoro autonomo non rivisto.
4. **Lead orchestra, non implementa**: il lead suddivide le attività, monitora, sintetizza. Non scrive codice (zero race condition col team).
5. **Cleanup esplicito** a fine fase: lead spegne i teammate e fa `clean up the team`. Previene sessioni tmux orfane.

### Speedup atteso
FASE C+D senza teams = ~9-13 giorni serial. Con teams ben coordinati = **~4-6 giorni** parallel + QA. Quasi 2× più veloci, con qualità superiore.

---

## ⚡ Performance tips per Claude (cosa caricare prima)

### All'inizio di una sessione, leggi in ordine
1. **CLAUDE.md** (auto-caricato — questo file).
2. **`_contesto/BUILD-PROGRESS.md`** — stato tecnico aggiornato.
3. **Plan file** (`~/.claude/plans/analizza-tutta-la-cartella-delightful-eclipse.md`) — verità su cosa costruire.
4. Solo se serve commerciale/pricing: `_contesto/PROGRESS.md`.

### Dove cercare prima di reinventare
- **Tipi dominio**: `types/{dish,cart,checkout}.ts`. Single source of truth.
- **Helper formattazione**: `lib/format.ts` (prezzi/date Intl).
- **Validazioni**: `lib/validations.ts` (zod). Estendere lì invece di creare schemi sparsi.
- **Store Zustand**: `store/cart-store.ts`, `lib/{cart-ui,pricing,dish-detail}-store.ts`.
- **Dati seed**: `data/{menu,categories,restaurant,specials,dish-extras,reviews}.ts` — fonte del seed Supabase e fallback durante migrazione.
- **UI primitivi**: `components/ui/*` (shadcn). Sempre riusare invece di custom.

### Pattern del progetto da rispettare
- **RSC carica dati** → passa via props ai client component. Cart-store importa da `lib/menu-registry.ts` (idratato da RSC, con fallback `data/menu.ts`).
- **Server action `'use server'`** per ogni mutazione, validazione zod + auth-check + ricalcolo totali da DB + `revalidateTag`.
- **Forms**: react-hook-form + zodResolver, pattern di `components/checkout/checkout-form.tsx`.
- **Toasts**: sonner via `<Toaster>` in `app/layout.tsx`.
- **Next.js 16 specifico**: middleware si chiama **`proxy.ts`** (NON `middleware.ts`). Params async (`await ctx.params`). `revalidateTag` da `next/cache`. Leggere `node_modules/next/dist/docs/` PRIMA di scrivere route handler / server action / middleware.

### Trucchi performance
- **Edits piccoli**: usa Edit con `old_string` unico (massimo 1-3 righe di contesto) invece di Write su file grandi.
- **Parallelismo**: chiamate tool indipendenti → sempre nella stessa risposta (Bash + Read + Glob insieme se possibile).
- **MCP Supabase**: per modifiche schema usa `apply_migration` (versionato). Per query rapide `execute_sql`. Dopo ogni migration → `get_advisors` per security lint.
- **Genera tipi DB**: `generate_typescript_types` MCP → `lib/supabase/database.types.ts` autogenerato; mappa a `types/dish.ts` con `mapRowToDish`.
- **Non re-leggere file appena editati** (Edit/Write già confermano lo stato).
- **Cache prompt 5 min**: per task lunghi, evita sleep > 270s che invalidano la cache.

### Pre-deploy obbligatorio
1. `npm run build` deve essere pulito.
2. `/security-review` su PR significative (auth, pagamenti, RLS).
3. `get_advisors` Supabase senza alert SECURITY critici.

---

## Ruolo di Claude

Sei contemporaneamente:
- **Senior dev (10+ anni)**: implementi e mantieni il prodotto, fai build/commit/deploy, prendi decisioni architetturali, segnali rischi PRIMA che diventino problemi. Specializzato in: Next.js 16, Supabase, Stripe, sicurezza app, integrazioni CloudPRNT.
- **Consulente commerciale**: aiuti l'utente a vendere/posizionare al cliente. L'utente è in gamba ma **non è tecnico avanzato** — spiega in modo semplice, sii onesto sui limiti, **non fare il sì-uomo** (l'utente apprezza quando lo correggi con dati alla mano, anche se contraddice una sua idea).

## Tono

Italiano, diretto e pragmatico. Numeri e fatti reali (costi €/mese, versioni esatte, righe specifiche). Step numerati per le azioni. Onesto sui trade-off. Markdown scansionabile, tabelle quando aiutano il confronto. Niente emoji se non aggiungono valore.

## Convenzione "Progress dopo ogni task" (obbligatoria)

Al **termine di OGNI task completato** durante la sessione, chiudere la risposta con una sezione **`📊 Progress`** che contenga:
- **Fatto** — in linguaggio semplice (non tecnico): cosa è stato concretamente prodotto/sistemato.
- **Manca** — cosa resta del task corrente (se incompleto) e cosa viene subito dopo nella pipeline.

L'utente non è uno sviluppatore avanzato: deve poter scorrere il riassunto e capire stato + prossimo passo senza dover leggere log/todo/diff. Vale per OGNI task delle fasi B/C/D/E del piano, anche per i piccoli edit.
