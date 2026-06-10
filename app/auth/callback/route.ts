// Callback OAuth + email verification.
// Supabase reindirizza qui dopo che il cliente clicca il link di conferma
// nell'email di benvenuto. Lo scambiamo per una sessione e mandiamo a /account.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sessione creata, redirect alla destinazione
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("auth/callback exchange error:", error);
  }

  // Errore o niente code → ritorna alla login con messaggio
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link di conferma non valido o scaduto.")}`,
  );
}
