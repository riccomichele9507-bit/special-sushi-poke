// Template email marketing "già pronti" per la sezione /admin/marketing.
// Ogni template imposta con un click: segmento consigliato + oggetto + messaggio
// + codice sconto suggerito. Il titolare poi controlla l'anteprima e invia.
//
// NOTE per il testo (message):
//  - NON iniziare con "Ciao {nome}": il saluto viene aggiunto automaticamente.
//  - NON mettere link/bottone "Ordina ora": è aggiunto automaticamente in coda.
//  - Se il template suggerisce un codice, appare in automatico un box col codice.
//  - Righe vuote (\n\n) = nuovi paragrafi. Tono semplice, mobile-first.
//
// `suggestedPresetId` fa riferimento agli id in SEGMENT_PRESETS (lib/marketing/segments.ts).
// `suggestedPromoCode` deve essere un codice esistente e attivo in discount_codes.

export interface EmailTemplate {
  id: string;
  label: string;
  description: string;
  suggestedPresetId: string | null;
  suggestedPromoCode: string | null;
  subject: string;
  message: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "winback",
    label: "Bentornato (dormienti)",
    description: "Per chi non ordina da un po'. Sconto di riattivazione.",
    suggestedPresetId: "dormant",
    suggestedPromoCode: "BENTORNATO10",
    subject: "Ci manchi 🍣 il tuo sushi ti aspetta",
    message:
      "È passato un po' dall'ultima volta, e ci sei mancato.\n\n" +
      "Abbiamo tenuto tutto come piace a te: pesce fresco ogni giorno, poke e sushi preparati al momento, consegna gratis a Bari.\n\n" +
      "Torna a trovarci con un piccolo regalo: usa il codice qui sotto sul tuo prossimo ordine.",
  },
  {
    id: "first_order",
    label: "Primo ordine (iscritti)",
    description: "Per chi si è iscritto ma non ha ancora ordinato.",
    suggestedPresetId: "never_ordered",
    suggestedPromoCode: "SUSHI10",
    subject: "Il tuo primo ordine è a un tap 🍣",
    message:
      "Grazie per esserti iscritto! Manca solo una cosa: il tuo primo ordine.\n\n" +
      "Scegli tra poke colorate, sushi roll e box da condividere — è tutto pronto in pochi minuti e la consegna a Bari è gratis.\n\n" +
      "Per iniziare col piede giusto, il codice qui sotto è tuo.",
  },
  {
    id: "loyalty",
    label: "Grazie (clienti abituali)",
    description: "Un pensiero per chi ordina spesso.",
    suggestedPresetId: "repeat",
    suggestedPromoCode: "BENTORNATO10",
    subject: "Grazie di cuore 🙏 un pensiero per te",
    message:
      "Sei uno dei nostri clienti più affezionati, e lo notiamo.\n\n" +
      "Grazie per scegliere Special Sushi Poke ancora e ancora: per una cucina che prepara tutto al momento significa davvero tanto.\n\n" +
      "Ecco un piccolo grazie da usare quando vuoi sul prossimo ordine.",
  },
  {
    id: "weekend",
    label: "Serata sushi (promo)",
    description: "Promo generica per tutti i clienti con consenso.",
    suggestedPresetId: null,
    suggestedPromoCode: "BENTORNATO10",
    subject: "Stasera sushi? 🍱 un motivo in più",
    message:
      "La voglia di sushi non ha bisogno di scuse — ma noi te ne diamo una comunque.\n\n" +
      "Pesce fresco, poke generose e roll appena fatti, consegna gratis a Bari. Ordini in due minuti dal sito: niente code, niente attese al telefono.\n\n" +
      "Usa il codice qui sotto, al resto pensiamo noi.",
  },
  {
    id: "new_menu",
    label: "Novità nel menù",
    description: "Annuncio nuovi piatti. Senza sconto.",
    suggestedPresetId: null,
    suggestedPromoCode: null,
    subject: "Nuovi piatti nel menù 🍣 da provare",
    message:
      "C'è qualcosa di nuovo da assaggiare da Special Sushi Poke.\n\n" +
      "Abbiamo aggiunto nuove proposte al menù, pensate per chi ama cambiare e scoprire sapori diversi: dai un'occhiata e trova il tuo prossimo preferito.\n\n" +
      "La consegna a Bari è sempre gratis.",
  },
];
