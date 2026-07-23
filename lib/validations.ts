import { z } from "zod";

const italianPhoneRegex = /^(\+39\s?)?(3\d{2}|0\d{1,3})\s?\d{6,8}$/;

const baseFields = {
  name: z
    .string()
    .min(2, "Inserisci il tuo nome (almeno 2 caratteri)")
    .max(60, "Massimo 60 caratteri"),
  phone: z
    .string()
    .min(8, "Numero non valido")
    .regex(italianPhoneRegex, "Inserisci un numero italiano valido (es. 333 1234567)"),
  email: z.string().email("Inserisci un'email valida"),
  paymentMethod: z.enum(["cash", "card"]),
  // Slot calcolato server-side, salvato come ISO 8601 (UTC)
  slotStartIso: z.string().datetime({ message: "Slot non confermato" }),
  slotEndIso: z.string().datetime({ message: "Slot non confermato" }),
};

export const checkoutSchema = z.discriminatedUnion("orderType", [
  z.object({
    orderType: z.literal("delivery"),
    ...baseFields,
    addressLine: z
      .string()
      .min(5, "Conferma un indirizzo dal menu suggerimenti")
      .max(180, "Indirizzo troppo lungo"),
    addressNotes: z
      .string()
      .min(2, "Indica interno, scala o piano")
      .max(80, "Massimo 80 caratteri"),
    driverNotes: z.string().max(200, "Massimo 200 caratteri").optional(),
    // Geo richiesto per delivery: viene da Google Places Autocomplete
    geo: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  z.object({
    orderType: z.literal("pickup"),
    ...baseFields,
    addressLine: z.string().optional(),
    addressNotes: z.string().optional(),
    driverNotes: z.string().optional(),
    geo: z.unknown().optional(),
  }),
]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Campagne email: criteri di segmentazione + contenuto ────────────────────
// Validati server-side prima di caricare l'audience o inviare. I numeri sono
// nullable = "nessun vincolo" (coerente con DEFAULT_CRITERIA in lib/marketing).

export const segmentCriteriaSchema = z.object({
  consent: z.enum(["any", "consenting", "non_consenting"]),
  registration: z.enum(["any", "registered", "guest"]),
  orderActivity: z.enum(["any", "never", "has_ordered"]),
  registeredWithinDays: z.number().int().min(1).max(3650).nullable(),
  minOrders: z.number().int().min(1).max(1000).nullable(),
  minSpentCents: z.number().int().min(0).max(100_000_000).nullable(),
  inactiveDays: z.number().int().min(1).max(3650).nullable(),
  orderType: z.enum(["any", "delivery", "pickup"]),
  categoryId: z.string().max(60).nullable(),
  discountUse: z.enum(["any", "used_any", "never_used", "used_specific"]),
  discountCode: z.string().max(40).nullable(),
});

export type SegmentCriteriaInput = z.infer<typeof segmentCriteriaSchema>;

export const campaignContentSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Oggetto troppo corto (min 3 caratteri)")
    .max(150, "Oggetto troppo lungo (max 150)"),
  message: z
    .string()
    .trim()
    .min(5, "Messaggio troppo corto")
    .max(2000, "Messaggio troppo lungo (max 2000)"),
  promoCode: z.string().trim().max(40).nullable().optional(),
  // Guardia legale: forzare l'invio anche a chi NON ha consenso richiede opt-in esplicito.
  includeNoConsent: z.boolean().default(false),
});

export type CampaignContentInput = z.infer<typeof campaignContentSchema>;
