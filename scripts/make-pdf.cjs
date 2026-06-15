// Esporta il volantino PNG in PDF pronto stampa (dimensione pagina = immagine a 300 DPI).
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const ROOT = path.resolve(__dirname, "..");
const PNG = path.join(ROOT, "marketing", "volantino-special-sushi.png");
const OUT = path.join(ROOT, "marketing", "volantino-special-sushi.pdf");
const DPI = 300;

(async () => {
  const png = fs.readFileSync(PNG);
  const pdf = await PDFDocument.create();
  const img = await pdf.embedPng(png);
  const w = (img.width / DPI) * 72; // pt
  const h = (img.height / DPI) * 72;
  const page = pdf.addPage([w, h]);
  page.drawImage(img, { x: 0, y: 0, width: w, height: h });
  pdf.setTitle("Volantino Special Sushi Poke — SUSHI10");
  pdf.setSubject("Sconto 10% ordinando dal sito");
  fs.writeFileSync(OUT, await pdf.save());
  const mm = (pt) => ((pt / 72) * 25.4).toFixed(0);
  console.log(`PDF -> ${OUT}  (${mm(w)}x${mm(h)} mm @ ${DPI}dpi)`);
})();
