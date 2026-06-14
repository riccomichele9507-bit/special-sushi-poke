// Callback OAuth + email verification.
// Supabase reindirizza qui dopo che il cliente clicca il link di conferma
// nell'email di benvenuto. Lo scambiamo per una sessione e mandiamo a /account.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeRedirect } from "@/lib/auth/safe-redirect";
import { sendWelcomeEmail } from "@/lib/email/send";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"), "/menu");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Applica eventuale marketing consent salvato in cookie al signup email/password
      const consentCookie = request.cookies.get("ssp_pending_consent")?.value;
      if (data.user && consentCookie === "yes") {
        try {
          const admin = createAdminClient();
          await admin
            .from("customers")
            .update({ marketing_consent: true })
            .eq("id", data.user.id);
        } catch (e) {
          console.error("auth/callback: failed to apply pending consent", e);
        }
      }
      // Email di benvenuto (dedup per indirizzo → parte una sola volta). Copre
      // anche le iscrizioni con Google. Saltata nel flusso reset password.
      const isPasswordReset = next.includes("reset-password");
      if (!isPasswordReset && data.user?.email) {
        await sendWelcomeEmail({
          to: data.user.email,
          name: (data.user.user_metadata?.full_name as string) ?? "",
          customerId: data.user.id,
        });
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      // Pulisci cookie temporanei
      response.cookies.delete("ssp_pending_consent");
      return response;
    }
    console.error("auth/callback exchange error:", error);
  }

  // Errore o niente code → ritorna alla login con messaggio
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link di conferma non valido o scaduto.")}`,
  );
}
