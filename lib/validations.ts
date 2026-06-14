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
