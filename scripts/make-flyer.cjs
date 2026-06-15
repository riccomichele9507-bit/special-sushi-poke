// Volantino "Special Sushi Poke" — campagna anti-Glovo, codice SUSHI10.
// v2: foto camioncino (fascia contenuta) + offerta protagonista + QR brandizzato
// (pallini arrotondati, occhi rossi, logo 寿司 al centro). Tutto via sharp.
// Output: marketing/volantino-special-sushi.png (+ qr-sushi10.png)

const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

const ROOT = path.resolve(__dirname, "..");
const VAN = path.join(ROOT, "public", "hero", "hero-van.png");
const LOGO = path.join(ROOT, "public", "logo-mark.png");
const OUT = path.join(ROOT, "marketing", "volantino-special-sushi.png");
const QR_OUT = path.join(ROOT, "marketing", "qr-sushi10.png");

const W = 1792;
const H = 2600;

const URL =
  "https://specialsushipokebari.com/menu?utm_source=volantino&utm_medium=qr&utm_campaign=glovo-winback&code=SUSHI10";

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
  const get = (r, c) => (r >= 0 && c >= 0 && r < n && c < n ? d[r * n + c] : 0);
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const cm = Math.floor(n / 2);
  const clearR = Math.round(n * 0.08); // zona logo al centro
  const inLogo = (r, c) => Math.abs(r - cm) <= clearR && Math.abs(c - cm) <= clearR;

  let dots = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!get(r, c) || isFinder(r, c) || inLogo(r, c)) continue;
      // modulo quasi pieno con angoli morbidi (massima leggibilità + stile)
      dots += `<rect x="${c + M + 0.06}" y="${r + M + 0.06}" width="0.88" height="0.88" rx="0.28"/>`;
    }
  }
  // occhi: angoli netti (rotondità minima) per non confondere il decoder
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

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  // cream esatto dal logo
  const corner = await sharp(LOGO)
    .extract({ left: 2, top: 2, width: 4, height: 4 })
    .resize(1, 1)
    .raw()
    .toBuffer();
  const cream = `rgb(${corner[0]},${corner[1]},${corner[2]})`;

  // --- van: fascia arrotondata ---
  const VB_W = 1632,
    VB_H = 600,
    VB_X = 80,
    VB_Y = 70;
  const vanResized = await sharp(VAN).resize(VB_W, null).toBuffer();
  const vrMeta = await sharp(vanResized).metadata();
  const vanCrop = await sharp(vanResized)
    .extract({
      left: 0,
      top: Math.max(0, Math.round((vrMeta.height - VB_H) / 2)),
      width: VB_W,
      height: VB_H,
    })
    .toBuffer();
  const roundMask = Buffer.from(
    `<svg width="${VB_W}" height="${VB_H}"><rect width="${VB_W}" height="${VB_H}" rx="36" ry="36"/></svg>`,
  );
  const vanRounded = await sharp(vanCrop)
    .composite([{ input: roundMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // --- QR brandizzato ---
  const QR_PX = 680;
  const { svg: qrSvg } = brandedQrSvg(URL, QR_PX);
  const qrBuf = await sharp(Buffer.from(qrSvg)).png().toBuffer();
  await sharp(qrBuf).toFile(QR_OUT);

  // --- logo centro QR ---
  const LOGO_PX = 132;
  const logoBuf = await sharp(LOGO).resize(LOGO_PX, LOGO_PX).toBuffer();

  // QR card geometry
  const CARD = 800,
    CARD_X = Math.round((W - CARD) / 2),
    CARD_Y = 1260;
  const QR_X = CARD_X + Math.round((CARD - QR_PX) / 2);
  const QR_Y = CARD_Y + Math.round((CARD - QR_PX) / 2);
  const CENTER_X = CARD_X + CARD / 2;
  const CENTER_Y = CARD_Y + CARD / 2;

  // --- overlay SVG (testi, badge, card, footer) ---
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- cornice oro fascia van -->
  <rect x="${VB_X}" y="${VB_Y}" width="${VB_W}" height="${VB_H}" rx="36" fill="none" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.7"/>

  <!-- offerta protagonista -->
  <text x="${W / 2}" y="785" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="36" letter-spacing="6" fill="${GOLD}">ORDINA DIRETTO DAL NOSTRO SITO</text>
  <text x="${W / 2}" y="915" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="132" fill="${INK}">10% DI SCONTO</text>
  <text x="${W / 2}" y="975" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="${WARM}">sul tuo ordine online</text>

  <!-- badge consegna gratuita -->
  <rect x="${(W - 800) / 2}" y="1006" width="800" height="68" rx="34" fill="none" stroke="${GOLD}" stroke-width="3"/>
  <text x="${W / 2}" y="1050" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="38" letter-spacing="2" fill="${BAMBOO_DEEP}">+ CONSEGNA GRATUITA A BARI</text>

  <!-- pill codice -->
  <rect x="${(W - 1000) / 2}" y="1100" width="1000" height="146" rx="30" fill="${BAMBOO_DEEP}"/>
  <text x="${W / 2}" y="1196" text-anchor="middle" font-family="Arial, sans-serif" fill="${cream}">
    <tspan font-size="46" font-weight="bold" letter-spacing="3">CODICE</tspan>
    <tspan font-size="92" font-weight="bold" letter-spacing="5" dx="34">SUSHI10</tspan>
  </text>

  <!-- QR card -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD}" height="${CARD}" rx="44" fill="#ffffff" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.55"/>
  <!-- stamp crema dietro logo -->
  <rect x="${CENTER_X - 80}" y="${CENTER_Y - 80}" width="160" height="160" rx="26" fill="${cream}"/>

  <!-- caption + trust -->
  <text x="${W / 2}" y="2160" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="48" fill="${BAMBOO_DEEP}">Inquadra &#183; Ordina &#183; Risparmia</text>
  <text x="${W / 2}" y="2240" text-anchor="middle" font-family="Arial, sans-serif" font-size="31" fill="${WARM}">Paghi online o alla consegna &#183; Stessa cucina, prezzo pi&#249; conveniente</text>

  <!-- footer -->
  <rect x="0" y="2460" width="${W}" height="140" fill="${BAMBOO_DEEP}"/>
  <text x="${W / 2}" y="2528" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="52" fill="${cream}">specialsushipokebari.com</text>
  <text x="${W / 2}" y="2572" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#d9e0d6">Special Sushi Poke &#183; Via G. Petroni, Bari</text>
</svg>`;

  await sharp({
    create: { width: W, height: H, channels: 3, background: cream },
  })
    .composite([
      { input: vanRounded, top: VB_Y, left: VB_X },
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: qrBuf, top: QR_Y, left: QR_X },
      { input: logoBuf, top: Math.round(CENTER_Y - LOGO_PX / 2), left: Math.round(CENTER_X - LOGO_PX / 2) },
    ])
    .png()
    .toFile(OUT);

  console.log("OK ->", OUT);
}

main().catch((e) => {
  console.error("FLYER ERROR:", e.message);
  process.exit(1);
});
