// Template email marketing "già pronti" per la sezione /admin/marketing.
// Ogni template imposta con un click: segmento consigliato + oggetto + messaggio
// (+ eventuale sconto). Il titolare poi controlla l'anteprima e invia.
//
// NOTE per il testo (message):
//  - NON iniziare con "Ciao {nome}": il saluto viene aggiunto automaticamente.
//  - NON mettere link/bottone "Ordina ora": è aggiunto automaticamente in coda.
//  - Se il template ha uno sconto (`suggestedDiscount`), all'invio viene generato
//    un codice breve (es. GUSTO37) e appare un box col codice + scadenza. Il testo
//    può dire "usa il codice qui sotto". Se lo sconto è null, non citarlo.
//  - Righe vuote (\n\n) = nuovi paragrafi. Tono semplice, mobile-first, un solo
//    obiettivo per email (principio della skill email).
//
// `group`: "offerta" = con sconto · "annuncio" = senza sconto (relazione/novità).
// `suggestedPresetId` → id in SEGMENT_PRESETS (lib/marketing/segments.ts).
// `suggestedDiscount` → configurazione sconto (il codice viene generato all'invio).

export type TemplateGroup = "offerta" | "annuncio";

export interface TemplateDiscount {
  kind: "percent" | "fixed";
  value: number; // percent → 1..100 · fixed → centesimi
  expiryDays: number;
  minOrderCents: number;
}

export interface EmailTemplate {
  id: string;
  group: TemplateGroup;
  label: string;
  description: string;
  suggestedPresetId: string | null;
  suggestedDiscount: TemplateDiscount | null;
  subject: string;
  message: string;
}

const D = (
  value: number,
  expiryDays: number,
  minOrderCents: number,
  kind: "percent" | "fixed" = "percent",
): TemplateDiscount => ({ kind, value, expiryDays, minOrderCents });

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // ── Con offerta (sconto) ──────────────────────────────────────────────
  {
    id: "winback",
    group: "offerta",
    label: "Bentornato (dormienti)",
    description: "Non ordina da un po' · 10% valido 7 giorni",
    suggestedPresetId: "dormant",
    suggestedDiscount: D(10, 7, 1500),
    subject: "Ci manchi 🍣 il tuo sushi ti aspetta",
    message:
      "È passato un po' dall'ultima volta, e ci sei mancato.\n\n" +
      "Abbiamo tenuto tutto come piace a te: pesce fresco ogni giorno, poke e sushi preparati al momento, consegna gratis a Bari.\n\n" +
      "Torna a trovarci con un piccolo regalo: usa il codice qui sotto sul tuo prossimo ordine.",
  },
  {
    id: "first_order",
    group: "offerta",
    label: "Primo ordine (iscritti)",
    description: "Iscritto ma non ha ancora ordinato · 10% valido 14 giorni",
    suggestedPresetId: "never_ordered",
    suggestedDiscount: D(10, 14, 1500),
    subject: "Il tuo primo ordine è a un tap 🍣",
    message:
      "Grazie per esserti iscritto! Manca solo una cosa: il tuo primo ordine.\n\n" +
      "Scegli tra poke colorate, sushi roll e box da condividere — è tutto pronto in pochi minuti e la consegna a Bari è gratis.\n\n" +
      "Per iniziare col piede giusto, il codice qui sotto è tuo.",
  },
  {
    id: "loyalty",
    group: "offerta",
    label: "Grazie (abituali) + sconto",
    description: "Chi ordina spesso · 10% valido 14 giorni",
    suggestedPresetId: "repeat",
    suggestedDiscount: D(10, 14, 0),
    subject: "Grazie di cuore 🙏 un pensiero per te",
    message:
      "Sei uno dei nostri clienti più affezionati, e lo notiamo.\n\n" +
      "Grazie per scegliere Special Sushi Poke ancora e ancora: per una cucina che prepara tutto al momento significa davvero tanto.\n\n" +
      "Ecco un piccolo grazie da usare quando vuoi sul prossimo ordine.",
  },
  {
    id: "weekend",
    group: "offerta",
    label: "Serata sushi (promo)",
    description: "Tutti i clienti con consenso · 10% valido 3 giorni (urgenza)",
    suggestedPresetId: null,
    suggestedDiscount: D(10, 3, 1500),
    subject: "Stasera sushi? 🍱 un motivo in più",
    message:
      "La voglia di sushi non ha bisogno di scuse — ma noi te ne diamo una comunque.\n\n" +
      "Pesce fresco, poke generose e roll appena fatti, consegna gratis a Bari. Ordini in due minuti dal sito: niente code, niente attese al telefono.\n\n" +
      "Usa il codice qui sotto, al resto pensiamo noi.",
  },
  {
    id: "comfort_badday",
    group: "offerta",
    label: "Giornata storta (coccola)",
    description: "Comfort food + 10% valido 5 giorni per tirarsi su",
    suggestedPresetId: null,
    suggestedDiscount: D(10, 5, 1500),
    subject: "Giornata storta? Rimediamo noi 🍣",
    message:
      "Certe giornate girano male e basta. La cena, almeno quella, deve andare liscia.\n\n" +
      "Sushi fresco e poke generose, pronti in pochi minuti e consegnati a casa a Bari senza spese. Zero code, zero telefonate.\n\n" +
      "Coccolati stasera: il codice qui sotto è un pensiero da parte nostra.",
  },

  // ── Senza sconto (annunci / relazione) ────────────────────────────────
  {
    id: "new_menu",
    group: "annuncio",
    label: "Novità nel menù",
    description: "Annuncio nuovi piatti · nessuno sconto",
    suggestedPresetId: null,
    suggestedDiscount: null,
    subject: "Nuovi piatti nel menù 🍣 da provare",
    message:
      "C'è qualcosa di nuovo da assaggiare da Special Sushi Poke.\n\n" +
      "Abbiamo aggiunto nuove proposte al menù, pensate per chi ama cambiare e scoprire sapori diversi: dai un'occhiata e trova il tuo prossimo preferito.\n\n" +
      "La consegna a Bari è sempre gratis.",
  },
  {
    id: "winback_soft",
    group: "annuncio",
    label: "Ci manchi (senza sconto)",
    description: "Dormienti · messaggio caldo senza offerta",
    suggestedPresetId: "dormant",
    suggestedDiscount: null,
    subject: "Ci manchi 🍣",
    message:
      "È passato un po' dall'ultima volta, e ci sei mancato.\n\n" +
      "Pesce fresco ogni giorno, poke e sushi preparati al momento, consegna gratis a Bari: quando ti va, ci trovi qui.\n\n" +
      "A presto!",
  },
  {
    id: "loyalty_soft",
    group: "annuncio",
    label: "Grazie (senza sconto)",
    description: "Abituali · ringraziamento sincero senza offerta",
    suggestedPresetId: "repeat",
    suggestedDiscount: null,
    subject: "Grazie di cuore 🙏",
    message:
      "Sei uno dei nostri clienti più affezionati, e volevamo solo dirti grazie.\n\n" +
      "Scegliere Special Sushi Poke ancora e ancora, per noi che prepariamo tutto al momento, significa molto. Continua a farci compagnia.\n\n" +
      "A presto!",
  },
  {
    id: "story",
    group: "annuncio",
    label: "Dietro le quinte",
    description: "Racconto/qualità · costruisce relazione, nessuna richiesta",
    suggestedPresetId: null,
    suggestedDiscount: null,
    subject: "Come nasce la tua poke 🥢",
    message:
      "Ti sei mai chiesto cosa c'è dietro una poke fatta bene?\n\n" +
      "Partiamo dal pesce fresco selezionato ogni giorno, riso preparato come si deve e ingredienti tagliati al momento quando arriva il tuo ordine. Niente scorciatoie.\n\n" +
      "La prossima volta che ordini, sai cosa arriva in tavola.",
  },
  {
    id: "comfort_rain",
    group: "annuncio",
    label: "Piove? Sushi a casa",
    description: "Comfort/relax · empatico, senza sconto",
    suggestedPresetId: null,
    suggestedDiscount: null,
    subject: "Piove? Ci pensiamo noi 🌧️🍣",
    message:
      "Giornata grigia e zero voglia di uscire? Ti capiamo benissimo.\n\n" +
      "Resta comodo dove sei: poke colorate, sushi e roll freschi arrivano dritti a casa tua, con consegna gratis a Bari.\n\n" +
      "Tu scegli la serie da guardare, al resto pensiamo noi.",
  },
];
