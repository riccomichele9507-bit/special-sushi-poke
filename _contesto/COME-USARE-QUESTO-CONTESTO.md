# COME USARE QUESTO CONTESTO

Questi file servono a **riprendere il progetto Special Sushi Poke in qualsiasi nuova chat** con Claude Code, senza perdere il filo.

## Cosa c'è in `_contesto/`

| File | A cosa serve |
|---|---|
| `../CLAUDE.md` (root progetto) | Identità progetto + stack + regole. **Si auto-carica** quando apri questa cartella in Claude Code. |
| `PROGRESS.md` | Stato attuale, decisioni prese, prezzi, ricerche fatte, prossimi passi. **Leggi questo per primo per capire dove siamo.** |
| `REFERENCE.md` | Path, link (GitHub, Vercel), comandi, struttura cartelle, dati ristorante, skill immagini. |
| `BRANDING.md` | Palette colori (HEX esatti) e font. |
| `deliverables/` | Copia dei documenti cliente (Word, PPTX, PDF) — snapshot. |

## Come ripartire in una nuova chat (3 modi)

### Modo 1 — Apri la cartella (consigliato)
Apri Claude Code **dentro** `C:\Users\Notebook Lenovo\Desktop\special-sushi-poke`.
Il `CLAUDE.md` si carica da solo. Poi scrivi:

> "Leggi `_contesto/PROGRESS.md` per lo stato attuale. Continuiamo da lì."

### Modo 2 — Prompt copia-incolla
Se apri una chat altrove, incolla questo:

```
Sto lavorando al progetto "Special Sushi Poke" — web app ordini d'asporto
per un ristorante sushi/poke di Bari, Next.js 16 + Tailwind v4.
Il codice è in C:\Users\Notebook Lenovo\Desktop\special-sushi-poke
(clone dark in special-sushi-poke-dark).
Leggi questi file per il contesto completo, in quest'ordine:
1. CLAUDE.md (root)
2. _contesto/PROGRESS.md
3. _contesto/REFERENCE.md
4. _contesto/BRANDING.md
Poi dimmi che hai capito lo stato e aspetta istruzioni.
```

### Modo 3 — Ordine di lettura manuale
`CLAUDE.md` → `_contesto/PROGRESS.md` → `_contesto/REFERENCE.md` → `_contesto/BRANDING.md`

## Regola d'oro

Quando succede qualcosa di importante (nuova feature, decisione, prezzo cambiato, commit rilevante), **aggiorna `_contesto/PROGRESS.md`**. È la memoria viva del progetto: se resta aggiornato, qualsiasi nuova chat riparte senza perdere niente.

## Sync cream + dark

Ricorda: ogni modifica funzionale va replicata su entrambi i cloni (`special-sushi-poke` e `special-sushi-poke-dark`). Cambia solo la palette, non la logica.
