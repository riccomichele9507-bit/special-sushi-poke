// Volantino QUADRATO 10×10 cm — inserto da mettere negli ordini Glovo.
// Obiettivo: chi apre il sacchetto Glovo scannerizza il QR, si iscrive e ordina
// direttamente dal sito con 10% di sconto (codice SUSHI10, riservato agli iscritti).
// Il QR porta a /menu?code=SUSHI10 → l'app cattura il codice e lo pre-applica al
// checkout in automatico. Tutto generato via sharp (stessa pipeline del volantino A5).
//
// Output: marketing/volantino-glovo-10x10.png (+ qr-glovo.png)
// Formato: 1200×1200 px ≈ 10×10 cm a 300 DPI (stampa cut-to-size).

const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

const ROOT = path.resolve(__dirname, "..");
const LOGO = path.join(ROOT, "public", "logo-mark.png");
const OUT = path.join(ROOT, "marketing", "volantino-glovo-10x10.png");
const QR_OUT = path.join(ROOT, "marketing", "qr-glovo.png");

const W = 1200;
const H = 1200;

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
  const QR_PX = 440;
  const { svg: qrSvg } = brandedQrSvg(URL, QR_PX);
  const qrBuf = await sharp(Buffer.from(qrSvg)).png().toBuffer();
  await sharp(qrBuf).toFile(QR_OUT);

  // --- logo mark centro QR ---
  const LOGO_QR_PX = 108;
  const logoQrBuf = await sharp(LOGO).resize(LOGO_QR_PX, LOGO_QR_PX).toBuffer();

  // --- logo mark header ---
  const LOGO_TOP_PX = 92;
  const logoTopBuf = await sharp(LOGO).resize(LOGO_TOP_PX, LOGO_TOP_PX).toBuffer();

  // QR card geometry
  const CARD = 500;
  const CARD_X = Math.round((W - CARD) / 2);
  const CARD_Y = 452;
  const QR_X = CARD_X + Math.round((CARD - QR_PX) / 2);
  const QR_Y = CARD_Y + Math.round((CARD - QR_PX) / 2);
  const CENTER_X = CARD_X + CARD / 2;
  const CENTER_Y = CARD_Y + CARD / 2;

  const badgeW = 780;
  const pillW = 560;

  // --- overlay SVG (testi, badge, card, footer) ---
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- cornice coupon -->
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="40" fill="none" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.55"/>

  <!-- eyebrow -->
  <text x="${W / 2}" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="27" letter-spacing="5" fill="${GOLD}">ISCRIVITI &#183; ORDINA DAL NOSTRO SITO</text>

  <!-- offerta protagonista -->
  <text x="${W / 2}" y="342" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="104" fill="${INK}">10% DI SCONTO</text>

  <!-- badge: senza minimo + consegna gratis -->
  <rect x="${(W - badgeW) / 2}" y="378" width="${badgeW}" height="64" rx="32" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
  <text x="${W / 2}" y="418" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="26" letter-spacing="1.5" fill="${BAMBOO_DEEP}">SENZA MINIMO DI SPESA &#183; CONSEGNA GRATIS A BARI</text>

  <!-- QR card -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD}" height="${CARD}" rx="40" fill="#ffffff" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.5"/>
  <!-- stamp crema dietro logo -->
  <rect x="${CENTER_X - 66}" y="${CENTER_Y - 66}" width="132" height="132" rx="22" fill="${cream}"/>

  <!-- pill codice -->
  <rect x="${(W - pillW) / 2}" y="978" width="${pillW}" height="96" rx="26" fill="${BAMBOO_DEEP}"/>
  <text x="${W / 2}" y="1041" text-anchor="middle" font-family="Arial, sans-serif" fill="${cream}">
    <tspan font-size="34" font-weight="bold" letter-spacing="2">CODICE</tspan>
    <tspan font-size="52" font-weight="bold" letter-spacing="4" dx="22">SUSHI10</tspan>
  </text>

  <!-- caption -->
  <text x="${W / 2}" y="1118" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="29" fill="${BAMBOO_DEEP}">Inquadra &#183; Iscriviti &#183; Risparmia</text>

  <!-- footer -->
  <rect x="0" y="1146" width="${W}" height="54" fill="${BAMBOO_DEEP}"/>
  <text x="${W / 2}" y="1181" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="30" fill="${cream}">specialsushipokebari.com</text>
</svg>`;

  await sharp({
    create: { width: W, height: H, channels: 3, background: cream },
  })
    .composite([
      { input: logoTopBuf, top: 96, left: Math.round((W - LOGO_TOP_PX) / 2) },
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: qrBuf, top: QR_Y, left: QR_X },
      {
        input: logoQrBuf,
        top: Math.round(CENTER_Y - LOGO_QR_PX / 2),
        left: Math.round(CENTER_X - LOGO_QR_PX / 2),
      },
    ])
    .png()
    .toFile(OUT);

  console.log("OK ->", OUT);
}

main().catch((e) => {
  console.error("FLYER GLOVO ERROR:", e.message);
  process.exit(1);
});
