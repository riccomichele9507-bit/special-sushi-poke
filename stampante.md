# Stampante — Star TSP143IV-UEWB (CloudPRNT) — Tutto in un posto

> Stampante: **Star TSP143IV-UEWB** (= "X4": 4 interfacce — USB-C, LAN, Wi-Fi, Bluetooth), serie TSP100IV. Supporta **CloudPRNT** (l'architettura usata dalla nostra app).
>
> - 🎥 **Video aiuto config**: https://www.youtube.com/watch?v=_gU-MBd9Axs
> - 📘 **Manuale ufficiale CloudPRNT**: https://star-m.jp/products/s_print/oml/tsp100iv/manual/en/convenientFunctions/settingsCloudPRNT.htm
> - 📱 **App**: "Star Quick Setup Utility" (iOS App Store / Google Play)
> - 📄 Manuale online Star: codice `80879200`

---

# PARTE 1 — Come collegarla all'app (i passi trovati)

## ⚠️ PREREQUISITO BLOCCANTE — farlo PRIMA di tutto
La stampante si autentica al nostro endpoint con un **token segreto** (`CLOUDPRNT_TOKEN`).
**Oggi è VUOTO** → senza, la stampante riceve **401** e non stampa mai.

Token da usare: **`acdd25f7-c4b5-4b9f-8c97-3aafd94f07db`** (o rigenerane uno).

1. **Vercel** → progetto special-sushi-poke → Settings → Environment Variables →
   `CLOUDPRNT_TOKEN` = il token (ambiente Production) → **Save** → **Redeploy**.
2. Lo stesso token va nella stampante (Fase 2.3, come Password).
3. (Opzionale) stesso valore anche in `.env.local`.

## FASE 1 — Setup base + Wi-Fi di casa (per la prova)
1. **Carta**: apri il coperchio (leva), inserisci il rotolo nel verso giusto, tira un lembo, richiudi.
2. **Accendi**: alimentatore + accensione, LED blu acceso. Dopo ~20 s (se non collegata) stampa il foglio **"WLAN Setup"** con un QR.
3. **Wi-Fi casa** con l'app **Star Quick Setup Utility**:
   - [ Start Guide (Initial Settings) ] → [ Use Wireless LAN ] → segui (SSID + password Wi-Fi di casa).
   - A fine setup si riavvia e stampa la **Wireless Network Diagnosis**: se OK assegna un **indirizzo IP** → **segnatelo** (serve dopo). Se "Fail": spegni/riaccendi e riprova.
   - Senza app: inquadra il QR del foglio "WLAN Setup" con la fotocamera e segui.

## FASE 2 — CloudPRNT (collega stampante ↔ app) — IL PASSO CRUCIALE
> Non è nella guida "easy": si fa dal **pannello web della stampante**.
1. Sul browser vai a `http://<IP-della-stampante>` (l'IP è nella diagnosi della Fase 1).
   Login default: utente **`root`**, password **`public`**.
2. Menu (in alto a sinistra) → **CloudPRNT** → **CloudPRNT Service = ENABLE**.
3. Compila e **Submit**:
   - **Server URL**: `https://specialsushipokebari.com/api/cloudprnt`
   - **Polling Time**: `10` (secondi)
   - **User Name**: `printer`
   - **Password**: `<CLOUDPRNT_TOKEN>` (uguale a Vercel)
4. **Save** → **SaveRestart device** → **Execute**.
5. **Se non parte per HTTPS/orario** (URL `https://`): in CloudPRNT imposta un **NTP Server** (es. `pool.ntp.org`) e l'**HTTPS trust level** per CA pubblica → Submit → Save/Restart.

## VERIFICA
1. **/admin → Stampante**: "Ultimo poll" si aggiorna entro ~10-20 s e compare il **MAC**.
2. **Ordine di prova**: in test usa carta `4242 4242 4242 4242` (o "alla consegna") → entro ~10 s esce la **comanda** (banner DELIVERY/RITIRO, piatti, totale, e per delivery il **QR di navigazione**). Scansiona il QR → Google Maps sull'indirizzo.

## FASE 3 — Spostamento al ristorante
- Rifai **solo** la rete: Star Quick Setup Utility → Wi-Fi del locale. **Meglio**: cavo **Ethernet/LAN** in cucina (più stabile; la LAN ha priorità).
- **Non toccare** la config CloudPRNT (URL+token+polling restano: l'endpoint è in cloud).
- Riverifica con /admin → Stampante + ordine di prova.

## Troubleshooting
| Sintomo | Causa | Soluzione |
|---|---|---|
| "Ultimo poll" fermo | rete/URL | controlla Wi-Fi/LAN; Server URL esatto |
| Non stampa / 401 | token diverso | `CLOUDPRNT_TOKEN` su Vercel = quello in stampante (utente `printer`); dopo modifica Vercel → Redeploy |
| Fermo solo in HTTPS | ora errata / CA | NTP server + HTTPS trust level (Fase 2.5) |
| Caratteri strani / QR rotto | formato | restiamo in **StarLine**; in `app/api/cloudprnt/route.ts` la costante `PRINT_MEDIA_TYPE="application/vnd.star.line"` è l'unico punto da cambiare |
| "Fail" diagnosi Wi-Fi | rete | spegni/riaccendi e riprova |

## Note tecniche (per noi)
- Endpoint: `app/api/cloudprnt/route.ts` (POST/GET/DELETE). Auth: Basic (`printer` + `CLOUDPRNT_TOKEN`) o `?token=`.
- Payload **StarLine** da `node-thermal-printer` (`lib/print/receipt.ts`), salvato base64 in `print_jobs.payload`, servito come `application/vnd.star.line`.
- QR comanda = link Google Maps da `order.geo` (solo delivery). La comanda **non** è documento fiscale (lo emette il SmartPOS Nexi).

---

# PARTE 2 — Guida Star "Easy Setup" (il file che mi hai inviato)

Accessori: TSP143IV-UEWB · cavo alimentazione · cavo USB · piedini gomma · guida rotolo · istruzioni sicurezza.
Porte retro: `LAN` · `USB-C (PC/Mac)` · `USB-A 1.5A (Android)` · `Cash Drawer/Buzzer` · `RESET`.

**Carta**: apri coperchio, inserisci rotolo nel verso giusto, tira il lembo, richiudi (58 mm: monta la guida + cambia memory switch).
**Accensione**: alimentatore → LED blu. Se non collegata via USB/LAN, dopo ~20 s stampa il QR wireless.
**App config**: Android/iOS = "Star Quick Setup Utility"; Windows = "Star Windows Software" (con driver, Setup.exe); macOS/Linux = driver da https://www.star-m.jp/supportsite-wsw.html

**Wi-Fi**: scollega il cavo LAN (la LAN ha priorità). Servono SSID + Security Key.
- App → [Start Guide (Initial Settings)] → [Use Wireless LAN] → segui. A fine: riavvio + "Wireless Network Diagnosis" (se OK → IP assegnato). Se "Fail": spegni/riaccendi, riprova.
- Senza app: inquadra il QR "WLAN Setup" con la fotocamera.

**Bluetooth**: device "TSP100IV-XXXXX" (vedi "Dev Name" nel foglio "Bluetooth Setup"). Impostazioni Bluetooth del telefono/PC → seleziona il device → pairing. (Windows: può dire "Driver unavailable" ma il pairing è ok.)

**Reset comunicazione**: accendi → apri coperchio → tieni FEED finché Power LED lampeggia (rilascia) → tieni FEED finché Network LED lampeggia (rilascia) → tieni FEED per scegliere: Network=LAN, Bluetooth=BT, entrambi=tutto → chiudi coperchio → riavvio + stampa esito.

**Star Micronics Cloud** (opzionale, gratis: Digital Journal, Coupon) — **non necessario** per noi (usiamo CloudPRNT verso il nostro server).

Copyright 2024 Star Micronics Co., Ltd.
