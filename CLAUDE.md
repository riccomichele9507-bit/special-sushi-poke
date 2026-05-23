@AGENTS.md

# CLAUDE.md — Special Sushi Poke (web app per ordini online)

> Istruzioni di progetto auto-caricate in ogni sessione Claude Code aperta in questa cartella.
> Documenti di contesto dettagliati in **`_contesto/`**: leggi `_contesto/PROGRESS.md` (stato attuale + decisioni + prezzi), `_contesto/REFERENCE.md` (path, link, comandi), `_contesto/BRANDING.md` (palette e font), `_contesto/COME-USARE-QUESTO-CONTESTO.md` (handoff).

---

## Cos'è questo progetto

Web app **mobile-first** di ordini d'asporto per **Special Sushi Poke**, ristorante sushi/poke reale a **Bari** (Via G. Petroni, 70124). Nata come **demo cold-outreach** per chiudere il cliente reale; ora è una proposta commerciale completa con 4 opzioni di prezzo.

- **Obiettivo**: dimostrare al ristoratore una web app pronta (menu, carrello, checkout) e vendergli lo sviluppo + servizi (notifiche, stampa comande, pagamenti).
- **Stato**: demo funzionante e deployata. Niente backend reale ancora (ordini in localStorage, pagamento finto).
- **Stile estetico**: "Minimal & Zen" — palette cream/bambù/sakura, font giapponese serif. Esiste anche un clone "Tokyo Night" (dark).

---

## Dove vive il codice

| Cosa | Path |
|---|---|
| **Progetto principale (cream)** — su Vercel — *questa cartella* | `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke` |
| **Clone dark (Tokyo Night)** — solo locale | `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke-dark` |
| GitHub | `riccomichele9507-bit/special-sushi-poke` (branch `master`) |
| Vercel (produzione) | `https://special-sushi-poke.vercel.app` |

⚠️ **I due cloni vanno tenuti in sync**: ogni modifica funzionale fatta sul cream va replicata sul dark (cambia solo la palette, non la logica).

---

## Stack tecnico

- **Next.js 16.2.6** (App Router) + **React 19.2.4** + TypeScript
- **Tailwind v4** — config inline in `app/globals.css` con `@theme` (NON c'è `tailwind.config.ts`)
- **Zustand 5** (state: carrello, UI drawer, pricing)
- **Framer Motion 12** (animazioni) + **GSAP 3** (hero)
- **shadcn** + **vaul** (drawer) + **sonner** (toast)
- **react-hook-form 7** + **zod 4** (form checkout)
- **lucide-react** (icone)

## Comandi

```bash
npm run dev      # sviluppo (porta 3000)
npm run build    # build produzione (lanciare SEMPRE prima di committare)
npm run lint     # eslint
```

**Deploy**: `git push origin master` → Vercel fa auto-deploy. (Se Vercel non parte: a volte la webhook salta un commit — sbloccare con un commit vuoto `git commit --allow-empty` o "Redeploy" dal dashboard.)

---

## Convenzioni / regole operative (NON negoziabili)

1. **Prezzi in centesimi** ovunque nel codice (es. `3000` = €30,00). Formattazione via `lib/format.ts`.
2. **Sync cream + dark**: modifica funzionale → applicarla a entrambi i cloni.
3. **Build prima del commit**: `npm run build` deve passare pulito.
4. **Lingua**: italiano per UI e contenuti; inglese tecnico solo dove standard.
5. **Mobile-first**: il device target è iPhone in verticale. Testare lì per primo.
6. **Palette**: definita in `app/globals.css` (`@theme`). Usare i token (`bg-bamboo`, `text-ink`…), non HEX hardcoded.
7. **Numero WhatsApp reale**: `379 369 7798` (`+393793697798`) in `data/restaurant.ts`.

## Decisioni "locked" (non rifare senza motivo)

- ❌ **Il carrello NON si apre da solo** quando aggiungi un piatto → solo toast di conferma; l'utente apre il carrello quando vuole.
- ✅ **Cart drawer usa scroll nativo** (`overflow-y-auto` + `data-vaul-no-drag`), NON la `ScrollArea` di radix/base-ui (confliggeva col touch di vaul).
- ✅ Footer del carrello lean: solo Totale + CTA; upsell/sconto/mancia dentro l'area scroll.

---

## Ruolo di Claude in questo progetto

Sei contemporaneamente:
- **Senior dev**: implementi e mantieni la web app (cream + dark), fai build/commit/deploy.
- **Consulente commerciale**: aiuti l'utente a vendere il progetto al cliente (deliverable, prezzi, scelte hardware, architettura). L'utente è in gamba ma non è tecnico avanzato — spiega in modo semplice, sii onesto sui limiti, non fare il sì-uomo (l'utente apprezza quando lo correggi con dati alla mano).

## Tono

Italiano, diretto e pragmatico. Numeri e fatti reali (costi, versioni). Step numerati quando guidi azioni. Onesto sui limiti. Markdown scansionabile.
