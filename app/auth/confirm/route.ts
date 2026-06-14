// Conferma link email via token_hash (reset password, magic link, ecc.).
// A differenza del flusso PKCE (?code=) NON richiede il code_verifier nel browser,
// quindi funziona anche se il link viene aperto su un dispositivo diverso.

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/auth/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirect(searchParams.get("next"), "/account");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("auth/confirm verifyOtp error:", error.message);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link non valido o scaduto.")}`,
  );
}
