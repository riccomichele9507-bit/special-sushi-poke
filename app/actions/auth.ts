"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { sendWelcomeEmail } from "@/lib/email/send";

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

// Cellulare OBBLIGATORIO in iscrizione (solo mobile, prefisso 3xx)
const phoneSchema = z
  .string()
  .trim()
  .min(8, "Inserisci il numero di cellulare")
  .regex(/^(\+39\s?)?3\d{2}\s?\d{6,7}$/, "Numero di cellulare italiano non valido");

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
  | { ok: true; redirectTo?: string; needsConfirmation?: boolean }
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

  // Verifica se admin → /admin; cliente normale → /menu (non al profilo)
  let redirectTo = "/menu";
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
    "https://specialsushipokebari.com";

  const { data: signUpData, error } = await supabase.auth.signUp({
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
  // Aggiorniamo name/phone subito via service-role (l'utente non è ancora confermato
  // quindi RLS update self non funziona). marketing_consent viene applicato al
  // callback /auth/callback dopo la conferma email tramite cookie temporaneo.
  try {
    const admin = createAdminClient();
    await admin
      .from("customers")
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      })
      .eq("email", parsed.data.email);
  } catch (e) {
    console.error("signup: failed to update customer profile", e);
    // non blocchiamo il signup per questo
  }

  // returnTo opzionale (es. se l'iscrizione parte dal checkout)
  const returnToRaw = (formData.get("returnTo") as string) || "";
  const redirectTo = returnToRaw ? safeRedirect(returnToRaw, "/menu") : "/menu";

  // Se "Confirm email" è disattivato su Supabase, signUp restituisce già una
  // sessione → l'utente è dentro subito, niente conferma. Applichiamo subito
  // il consenso marketing e mandiamo al profilo (poi parte l'email di benvenuto).
  if (signUpData.session) {
    if (parsed.data.marketingConsent) {
      try {
        const admin = createAdminClient();
        await admin
          .from("customers")
          .update({ marketing_consent: true })
          .eq("email", parsed.data.email);
      } catch (e) {
        console.error("signup: consent update failed", e);
      }
    }
    // Email di benvenuto (best-effort, non blocca l'iscrizione)
    await sendWelcomeEmail({
      to: parsed.data.email,
      name: parsed.data.name,
      customerId: signUpData.user?.id ?? null,
    });

    revalidatePath("/", "layout");
    return { ok: true, redirectTo };
  }

  // Altrimenti (conferma email ancora attiva): cookie consent + schermata "controlla email"
  if (parsed.data.marketingConsent) {
    const cookieStore = await cookies();
    cookieStore.set("ssp_pending_consent", "yes", {
      maxAge: 60 * 60 * 24, // 24h
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return { ok: true, needsConfirmation: true };
}

// ============================================================
// Logout
// ============================================================
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
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

  if (error) {
    console.error("updateProfile error:", error);
    return { ok: false, error: "Impossibile salvare il profilo. Riprova." };
  }

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
    "https://specialsushipokebari.com";

  // Passa dal callback (route handler) che scambia il code e imposta la sessione,
  // poi atterra su /auth/reset-password con sessione attiva.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  // NON rivelare se l'email esiste o no (security best practice)
  if (error) {
    console.error("password reset error", error);
  }
  return { ok: true };
}

// ============================================================
// Aggiorna password (dalla pagina reset, con sessione attiva)
// ============================================================
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Password non valida" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "Sessione scaduta. Riapri il link dall'email e riprova.",
    };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, redirectTo: "/account" };
}
