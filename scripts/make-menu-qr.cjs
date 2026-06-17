// QR brandizzato "pulito" che porta SOLO al menu online (nessun codice sconto).
// Stesso stile del volantino (pallini arrotondati, occhi rossi, logo 寿司 al
// centro). Output: marketing/qr-menu.png.

const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

const ROOT = path.resolve(__dirname, "..");
const LOGO = path.join(ROOT, "public", "logo-mark.png");
const OUT = path.join(ROOT, "marketing", "qr-menu.png");
const URL = "https://specialsushipokebari.com/menu";

const INK = "#1c1c1c";
const RED = "#c8102e";

function brandedQrSvg(url, px) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const d = qr.modules.data;
  const M = 4;
  const T = n + 2 * M;
  const get = (r, c) => (r >= 0 && c >= 0 && r < n && c < n ? d[r * n + c] : 0);
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const cm = Math.floor(n / 2);
  const clearR = Math.round(n * 0.08);
  const inLogo = (r, c) => Math.abs(r - cm) <= clearR && Math.abs(c - cm) <= clearR;

  let dots = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!get(r, c) || isFinder(r, c) || inLogo(r, c)) continue;
      dots += `<rect x="${c + M + 0.06}" y="${r + M + 0.06}" width="0.88" height="0.88" rx="0.28"/>`;
    }
  }
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${T} ${T}"><rect width="${T}" height="${T}" fill="#ffffff"/><g fill="${INK}">${dots}</g>${eyes}</svg>`;
}

async function main() {
  const QR_PX = 600;
  const qrBuf = await sharp(Buffer.from(brandedQrSvg(URL, QR_PX))).png().toBuffer();

  const corner = await sharp(LOGO)
    .extract({ left: 2, top: 2, width: 4, height: 4 })
    .resize(1, 1)
    .raw()
    .toBuffer();
  const cream = `rgb(${corner[0]},${corner[1]},${corner[2]})`;

  const center = Math.round(QR_PX / 2);
  const stamp = Math.round(QR_PX * 0.18);
  const logoPx = Math.round(QR_PX * 0.14);
  const stampSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${QR_PX}" height="${QR_PX}"><rect x="${center - stamp / 2}" y="${center - stamp / 2}" width="${stamp}" height="${stamp}" rx="${Math.round(stamp * 0.22)}" fill="${cream}"/></svg>`,
  );
  const logoBuf = await sharp(LOGO).resize(logoPx, logoPx).toBuffer();

  await sharp(qrBuf)
    .composite([
      { input: stampSvg, top: 0, left: 0 },
      { input: logoBuf, top: center - Math.round(logoPx / 2), left: center - Math.round(logoPx / 2) },
    ])
    .png()
    .toFile(OUT);

  console.log("OK ->", OUT, "| URL:", URL);
}

main().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
