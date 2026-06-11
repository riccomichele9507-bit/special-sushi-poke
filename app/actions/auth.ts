"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Schemi zod
// ============================================================
const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email è obbligatoria")
  .email("Inserisci un'email valida")
  .max(254);

const passwordSchema = z
  .string()
  .min(8, "Almeno 8 caratteri")
  .max(72, "Massimo 72 caratteri");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+39\s?)?(3\d{2}|0\d{1,3})\s?\d{6,8}$/, "Numero italiano non valido")
  .optional()
  .or(z.literal(""));

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Inserisci la password"),
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(80),
  phone: phoneSchema,
  marketingConsent: z.boolean(),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, "Devi accettare termini e privacy"),
});

const passwordResetRequestSchema = z.object({ email: emailSchema });

// ============================================================
// Types ritorno (per il form client)
// ============================================================
export type ActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string };

// ============================================================
// Login
// ============================================================
export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Messaggi user-friendly per i casi comuni
    if (error.message.toLowerCase().includes("invalid login")) {
      return { ok: false, error: "Email o password non corretti." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        ok: false,
        error:
          "Devi prima confermare l'email. Controlla la tua casella di posta.",
      };
    }
    return { ok: false, error: error.message };
  }

  // Verifica se admin → redirect ad /admin invece che /account
  let redirectTo = "/account";
  if (data.user) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (adminRow) redirectTo = "/admin";
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo };
}

// ============================================================
// Signup
// ============================================================
export async function signup(formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    marketingConsent: formData.get("marketingConsent") === "on",
    termsAccepted: formData.get("termsAccepted") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://special-sushi-poke.vercel.app";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        ok: false,
        error:
          "Esiste già un account con questa email. Prova ad accedere o recuperare la password.",
      };
    }
    return { ok: false, error: error.message };
  }

  // Il trigger DB `handle_new_user` crea la riga in customers.
  // Aggiorniamo name/phone/marketing_consent subito dopo (idempotente).
  // Nota: l'utente non è ancora confermato → l'update via service-role sarebbe
  // pulito ma il client anon basta perché customers.id = auth.uid() (RLS update self).
  // Lo faremo dal callback /auth/callback dopo la conferma email.

  // Salviamo le preferenze marketing in cookie temporaneo per dopo la conferma
  // (alternativa: pendenti via tabella, ma più semplice il cookie 24h)
  return { ok: true };
}

// ============================================================
// Logout
// ============================================================
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ============================================================
// Aggiorna profilo cliente
// ============================================================
const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: phoneSchema,
  marketingConsent: z.boolean(),
});

export async function updateProfile(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    marketingConsent: formData.get("marketingConsent") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non sei autenticato" };

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      marketing_consent: parsed.data.marketingConsent,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  return { ok: true };
}

// ============================================================
// Password reset request
// ============================================================
export async function requestPasswordReset(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email non valida" };
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://special-sushi-poke.vercel.app";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  // NON rivelare se l'email esiste o no (security best practice)
  if (error) {
    console.error("password reset error", error);
  }
  return { ok: true };
}
