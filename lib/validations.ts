import { z } from "zod";

const italianPhoneRegex = /^(\+39\s?)?(3\d{2}|0\d{1,3})\s?\d{6,8}$/;

export const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, "Inserisci il tuo nome (almeno 2 caratteri)")
    .max(60, "Massimo 60 caratteri"),
  phone: z
    .string()
    .min(8, "Numero non valido")
    .regex(italianPhoneRegex, "Inserisci un numero italiano valido (es. 333 1234567)"),
  email: z.string().email("Inserisci un'email valida"),
  pickupSlot: z.string().min(1, "Scegli un orario di ritiro"),
  notes: z.string().max(200, "Massimo 200 caratteri").optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
