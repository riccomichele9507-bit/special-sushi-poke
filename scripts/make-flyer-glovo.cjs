// Volantino A6 ORIZZONTALE 14,8×10,5 cm — inserto da mettere negli ordini Glovo.
// Obiettivo: chi apre il sacchetto Glovo scannerizza il QR, si iscrive e ordina
// direttamente dal sito con 10% di sconto (codice SUSHI10, riservato agli iscritti).
// Il QR porta a /menu?code=SUSHI10 → l'app cattura il codice e lo pre-applica al
// checkout in automatico.
//
// Output: marketing/volantino-glovo-a6.png (+ qr-glovo.png)
// Formato: 1748×1240 px = 148×105 mm esatti a 300 DPI (A6 landscape).
// Le proporzioni combaciano con il preset A6 di Canva (1748/1240 = 148/105),
// quindi l'immagine riempie il formato senza bordi bianchi né ritagli.

const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

const ROOT = path.resolve(__dirname, "..");
const LOGO = path.join(ROOT, "public", "logo-mark.png");
const OUT = path.join(ROOT, "marketing", "volantino-glovo-a6.png");
const QR_OUT = path.join(ROOT, "marketing", "qr-glovo.png");

const DPI = 300;
const W = 1748; // 148 mm
const H = 1240; // 105 mm

// URL del QR: code=SUSHI10 catturato dall'app (PromoCodeCapture) e pre-applicato
// al checkout. utm per capire quante iscrizioni arrivano dal volantino Glovo.
const URL =
  "https://specialsushipokebari.com/menu?code=SUSHI10&utm_source=glovo&utm_medium=volantino";

// palette brand (app/globals.css)
const INK = "#1c1c1c";
const BAMBOO_DEEP = "#3f5849";
const GOLD = "#b8965a";
const RED = "#c8102e";
const WARM = "#6b6b65";

// ---- QR brandizzato -> SVG (unità modulo, con quiet zone) ----
function brandedQrSvg(url, px) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const d = qr.modules.data;
  const M = 4; // quiet zone (moduli) — necessaria per la scansione
  const T = n + 2 * M;
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const cm = Math.floor(n / 2);
  const clearR = Math.round(n * 0.08); // zona logo al centro
  const inLogo = (r, c) => Math.abs(r - cm) <= clearR && Math.abs(c - cm) <= clearR;
  const get = (r, c) => (r >= 0 && c >= 0 && r < n && c < n ? d[r * n + c] : 0);

  let dots = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!get(r, c) || isFinder(r, c) || inLogo(r, c)) continue;
      dots += `<rect x="${c + M + 0.06}" y="${r + M + 0.06}" width="0.88" height="0.88" rx="0.28"/>`;
    }
  }
  // occhi finder: angoli netti (rotondità minima) per non confondere il decoder
  const eye = (or_, oc) => {
    const x = oc + M,
      y = or_ + M;
    return (
      `<rect x="${x}" y="${y}" width="7" height="7" rx="1.1" fill="${RED}"/>` +
      `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="0.8" fill="#ffffff"/>` +
      `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.7" fill="${RED}"/>`
    );
  };
  const eyes = eye(0, 0) + eye(0, n - 7) + eye(n - 7, 0);

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${T} ${T}"><rect width="${T}" height="${T}" fill="#ffffff"/><g fill="${INK}">${dots}</g>${eyes}</svg>`,
    n,
  };
}

async function main() {
  // cream esatto dal logo (angolo)
  const corner = await sharp(LOGO)
    .extract({ left: 2, top: 2, width: 4, height: 4 })
    .resize(1, 1)
    .raw()
    .toBuffer();
  const cream = `rgb(${corner[0]},${corner[1]},${corner[2]})`;

  // --- QR brandizzato ---
  const QR_PX = 520;
  const { svg: qrSvg } = brandedQrSvg(URL, QR_PX);
  const qrBuf = await sharp(Buffer.from(qrSvg)).png().toBuffer();
  await sharp(qrBuf).withMetadata({ density: DPI }).toFile(QR_OUT);

  // --- logo mark centro QR ---
  const LOGO_QR_PX = 130;
  const logoQrBuf = await sharp(LOGO).resize(LOGO_QR_PX, LOGO_QR_PX).toBuffer();

  // --- logo mark header (colonna sinistra) ---
  const LOGO_TOP_PX = 82;
  const logoTopBuf = await sharp(LOGO).resize(LOGO_TOP_PX, LOGO_TOP_PX).toBuffer();

  // Area utile: dentro la cornice, sopra il footer. Ogni colonna e' centrata
  // verticalmente qui dentro, altrimenti il contenuto resta in alto e sotto
  // rimane una fascia vuota.
  const FOOTER_Y = 1168;
  const AREA_TOP = 22;
  const AREA_CY = Math.round((AREA_TOP + FOOTER_Y) / 2); // 595

  // ---- COLONNA DESTRA: QR + codice ----
  const CARD = 600;
  const CARD_X = W - 70 - CARD; // 1078
  const pillW = 470;
  const PILL_H = 88;
  const PILL_GAP = 42;
  const R_BLOCK = CARD + PILL_GAP + PILL_H; // altezza blocco destro
  const CARD_Y = Math.round(AREA_CY - R_BLOCK / 2);
  const PILL_Y = CARD_Y + CARD + PILL_GAP;
  const QR_X = CARD_X + Math.round((CARD - QR_PX) / 2);
  const QR_Y = CARD_Y + Math.round((CARD - QR_PX) / 2);
  const R_CX = CARD_X + CARD / 2; // centro colonna destra
  const R_CY = CARD_Y + CARD / 2;

  // ---- COLONNA SINISTRA: offerta ----
  const L_LEFT = 70;
  const L_RIGHT = CARD_X - 56;
  const L_CX = Math.round((L_LEFT + L_RIGHT) / 2);
  const badgeW = 820;

  // --- overlay SVG (testi, badge, card, footer) ---
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- cornice coupon -->
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="40" fill="none" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.55"/>

  <!-- HOOK: la prova piu' forte ce l'ha in bocca mentre legge -->
  <text x="${L_CX}" y="455" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="31" letter-spacing="3.5" fill="${GOLD}">TI &#200; PIACIUTO?</text>

  <!-- offerta protagonista: il numero, non la richiesta di iscriversi -->
  <text x="${L_CX}" y="524" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="33" letter-spacing="2" fill="${INK}">LA PROSSIMA VOLTA LO PAGHI</text>
  <text x="${L_CX}" y="630" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="100" fill="${INK}">IL 20% IN MENO</text>

  <!-- la scala: rende sensato "usalo sull'ordine piu' grande" e spinge verso i 40 -->
  <rect x="${L_CX - badgeW / 2}" y="678" width="${badgeW}" height="64" rx="32" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
  <text x="${L_CX}" y="719" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="25" letter-spacing="1.2" fill="${BAMBOO_DEEP}">10% SUBITO &#183; 20% SOPRA I 40&#8364; &#183; CONSEGNA GRATIS</text>

  <!-- nudge sullo scontrino medio: il codice vale una volta sola -->
  <text x="${L_CX}" y="822" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="30" fill="${BAMBOO_DEEP}">Vale una volta sola: usalo sull&#8217;ordine pi&#249; grande</text>

  <!-- l'attrito residuo va rimpicciolito, non nascosto -->
  <text x="${L_CX}" y="870" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="${WARM}">Iscriviti in 30 secondi &#183; poi l&#8217;indirizzo resta salvato</text>

  <!-- QR card -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD}" height="${CARD}" rx="38" fill="#ffffff" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.5"/>
  <!-- stamp crema dietro logo -->
  <rect x="${R_CX - 72}" y="${R_CY - 72}" width="144" height="144" rx="22" fill="${cream}"/>

  <!-- pill codice -->
  <rect x="${R_CX - pillW / 2}" y="${PILL_Y}" width="${pillW}" height="86" rx="24" fill="${BAMBOO_DEEP}"/>
  <text x="${R_CX}" y="${PILL_Y + 58}" text-anchor="middle" font-family="Arial, sans-serif" fill="${cream}">
    <tspan font-size="29" font-weight="bold" letter-spacing="2">CODICE</tspan>
    <tspan font-size="46" font-weight="bold" letter-spacing="3.5" dx="18">SUSHI10</tspan>
  </text>

  <!-- istruzione d'uso, sotto il QR: il codice lo inserisce il QR -->
  <text x="${R_CX}" y="${PILL_Y + 132}" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" fill="${WARM}">Si applica da solo: non devi digitarlo</text>

  <!-- footer -->
  <rect x="0" y="${FOOTER_Y}" width="${W}" height="${H - FOOTER_Y}" fill="${BAMBOO_DEEP}"/>
  <text x="${W / 2}" y="${FOOTER_Y + 47}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="31" fill="${cream}">specialsushipokebari.com</text>
</svg>`;

  await sharp({
    create: { width: W, height: H, channels: 3, background: cream },
  })
    .composite([
      { input: logoTopBuf, top: 325, left: Math.round(L_CX - LOGO_TOP_PX / 2) },
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: qrBuf, top: QR_Y, left: QR_X },
      {
        input: logoQrBuf,
        top: Math.round(R_CY - LOGO_QR_PX / 2),
        left: Math.round(R_CX - LOGO_QR_PX / 2),
      },
    ])
    .withMetadata({ density: DPI }) // così Canva/stampa leggono 148×105 mm reali
    .png()
    .toFile(OUT);

  console.log(`OK -> ${OUT}  (${W}x${H}px = 148x105mm @ ${DPI}dpi)`);
}

main().catch((e) => {
  console.error("FLYER GLOVO ERROR:", e.message);
  process.exit(1);
});
