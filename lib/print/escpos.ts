// Builder minimale di comandi ESC/POS per stampante termica 80mm (Star
// TSP143IV in emulazione ESC/POS). Genera un Buffer binario: testo, dimensioni
// font, allineamento, QR code NATIVO (la stampante disegna il QR da una stringa)
// e taglio carta. Nessuna dipendenza esterna.
//
// Encoding: testo ASCII passthrough; le lettere accentate italiane vengono
// traslitterate in ASCII (100% leggibili su qualsiasi code page); il solo "€"
// usa il byte di PC858 con code page impostata a init. Se il code page reale
// differisse, l'unico glifo a rischio è "€" — tutto il resto resta corretto.

const ESC = 0x1b;
const GS = 0x1d;

// traslitterazione accenti -> ASCII (robusto a qualsiasi code page)
const TRANSLIT: Record<string, string> = {
  à: "a", á: "a", â: "a", ä: "a", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i", ò: "o", ó: "o", ô: "o", ö: "o",
  ù: "u", ú: "u", û: "u", ü: "u", ç: "c", ñ: "n",
  À: "A", È: "E", É: "E", Ì: "I", Ò: "O", Ù: "U", Ç: "C",
  "·": "-", "–": "-", "—": "-", "“": '"', "”": '"', "’": "'", "…": "...",
};
const EURO_CP858 = 0xd5;

function encodeText(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    if (ch === "€") {
      out.push(EURO_CP858);
      continue;
    }
    const mapped = TRANSLIT[ch] ?? ch;
    for (const c of mapped) {
      const code = c.charCodeAt(0);
      out.push(code >= 0x20 && code <= 0x7e ? code : 0x3f /* '?' */);
    }
  }
  return out;
}

export class EscPosBuilder {
  private bytes: number[] = [];

  constructor() {
    // init + code page PC858 (per il glifo €)
    this.bytes.push(ESC, 0x40); // ESC @  reset
    this.bytes.push(ESC, 0x74, 19); // ESC t 19  -> PC858
  }

  /** Allineamento: 0 left, 1 center, 2 right. */
  align(n: 0 | 1 | 2): this {
    this.bytes.push(ESC, 0x61, n);
    return this;
  }

  /** Dimensione carattere: moltiplicatori 1..8 per larghezza/altezza. */
  size(width = 1, height = 1): this {
    const w = Math.max(1, Math.min(8, width)) - 1;
    const h = Math.max(1, Math.min(8, height)) - 1;
    this.bytes.push(GS, 0x21, (w << 4) | h);
    return this;
  }

  bold(on: boolean): this {
    this.bytes.push(ESC, 0x45, on ? 1 : 0);
    return this;
  }

  /** Testo senza newline. */
  text(s: string): this {
    this.bytes.push(...encodeText(s));
    return this;
  }

  /** Testo + newline. */
  line(s = ""): this {
    this.bytes.push(...encodeText(s), 0x0a);
    return this;
  }

  feed(n = 1): this {
    for (let i = 0; i < n; i++) this.bytes.push(0x0a);
    return this;
  }

  /**
   * QR code nativo (modello 2). La stampante genera il QR dalla stringa.
   * @param data contenuto (es. URL Google Maps)
   * @param moduleSize 1..16 (dimensione modulo in punti; ~8 ≈ 4 cm)
   */
  qr(data: string, moduleSize = 8): this {
    const fn = (...b: number[]) => this.bytes.push(GS, 0x28, 0x6b, ...b);
    // Funzione 165: modello QR = 2
    fn(0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // Funzione 167: dimensione modulo
    fn(0x03, 0x00, 0x31, 0x43, Math.max(1, Math.min(16, moduleSize)));
    // Funzione 169: livello correzione errore = M (49)
    fn(0x03, 0x00, 0x31, 0x45, 49);
    // Funzione 080: store data
    const payload = encodeUrl(data);
    const len = payload.length + 3;
    fn(len & 0xff, (len >> 8) & 0xff, 0x31, 0x50, 0x30, ...payload);
    // Funzione 081: stampa il QR
    fn(0x03, 0x00, 0x31, 0x51, 0x30);
    return this;
  }

  /** Taglio carta (parziale). */
  cut(): this {
    this.feed(3);
    this.bytes.push(GS, 0x56, 0x01); // GS V 1 partial cut
    return this;
  }

  build(): Buffer {
    return Buffer.from(this.bytes);
  }
}

// URL/QR data: solo ASCII (gli URL lo sono già). Non-ASCII -> escape minimale.
function encodeUrl(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    out.push(code >= 0x20 && code <= 0x7e ? code : 0x3f);
  }
  return out;
}
