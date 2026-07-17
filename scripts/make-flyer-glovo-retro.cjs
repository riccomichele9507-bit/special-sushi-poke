// RETRO del volantino A6 orizzontale 14,8×10,5 cm (fronte: make-flyer-glovo.cjs).
// E' la prima cosa che il cliente vede aprendo il sacchetto Glovo: ringrazia e
// mette il nome del locale. L'offerta e il QR stanno sul fronte.
//
// Output: marketing/volantino-glovo-a6-retro.png
// Formato: 1748×1240 px = 148×105 mm esatti a 300 DPI (A6 landscape),
// identico al fronte -> in Canva si stampano fronte/retro senza riadattare nulla.

const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const LOGO = path.join(ROOT, "public", "logo-mark.png");
const OUT = path.join(ROOT, "marketing", "volantino-glovo-a6-retro.png");

const DPI = 300;
const W = 1748; // 148 mm
const H = 1240; // 105 mm

// palette brand (app/globals.css)
const INK = "#1c1c1c";
const BAMBOO_DEEP = "#3f5849";
const GOLD = "#b8965a";
const WARM = "#6b6b65";

// dati reali da data/restaurant.ts
const NOME = "SPECIAL SUSHI POKE";
const TAGLINE = "Sushi &#38; Poke d&#39;asporto a Bari";
const INDIRIZZO = "Via G. Petroni 12/H-i &#183; 70124 Bari";

async function main() {
  // cream esatto dal logo (angolo), come il fronte
  const corner = await sharp(LOGO)
    .extract({ left: 2, top: 2, width: 4, height: 4 })
    .resize(1, 1)
    .raw()
    .toBuffer();
  const cream = `rgb(${corner[0]},${corner[1]},${corner[2]})`;

  const LOGO_PX = 190;
  const logoBuf = await sharp(LOGO).resize(LOGO_PX, LOGO_PX).toBuffer();

  const FOOTER_Y = 1168;
  const CX = W / 2;
  const LOGO_TOP = 250;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- cornice coupon, identica al fronte -->
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="40" fill="none" stroke="${GOLD}" stroke-width="3" stroke-opacity="0.55"/>

  <!-- il ringraziamento e' il protagonista -->
  <text x="${CX}" y="620" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="104" fill="${INK}">Grazie per aver ordinato</text>

  <!-- filetto -->
  <rect x="${CX - 150}" y="676" width="300" height="2.5" fill="${GOLD}" fill-opacity="0.75"/>

  <!-- nome del locale -->
  <text x="${CX}" y="770" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="46" letter-spacing="9" fill="${BAMBOO_DEEP}">${NOME}</text>

  <!-- tagline -->
  <text x="${CX}" y="826" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="${WARM}">${TAGLINE}</text>

  <!-- indirizzo -->
  <text x="${CX}" y="886" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" fill="${WARM}">${INDIRIZZO}</text>

  <!-- footer, identico al fronte -->
  <rect x="0" y="${FOOTER_Y}" width="${W}" height="${H - FOOTER_Y}" fill="${BAMBOO_DEEP}"/>
  <text x="${CX}" y="${FOOTER_Y + 47}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="31" fill="${cream}">specialsushipokebari.com</text>
</svg>`;

  await sharp({
    create: { width: W, height: H, channels: 3, background: cream },
  })
    .composite([
      { input: logoBuf, top: LOGO_TOP, left: Math.round(CX - LOGO_PX / 2) },
      { input: Buffer.from(svg), top: 0, left: 0 },
    ])
    .withMetadata({ density: DPI })
    .png()
    .toFile(OUT);

  console.log(`OK -> ${OUT}  (${W}x${H}px = 148x105mm @ ${DPI}dpi)`);
}

main().catch((e) => {
  console.error("FLYER GLOVO RETRO ERROR:", e.message);
  process.exit(1);
});
