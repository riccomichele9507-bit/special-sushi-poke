// Next.js 16: middleware è stato rinominato in "proxy".
// Refresh sessione Supabase ad ogni request e propagazione cookie.

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Difensivo: se le env vars Supabase mancano (es. non configurate su Vercel),
  // bypassa il refresh sessione per non crashare le pagine pubbliche.
  // Solo le pagine che richiedono auth (login/account/admin) saranno limitate.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }
  try {
    return await updateSession(request);
  } catch (e) {
    // Qualunque errore Supabase (key invalida, network, ecc.) → continua senza refresh.
    console.error("proxy updateSession error:", e);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    // Tutte le route eccetto asset statici e file pubblici
    "/((?!_next/static|_next/image|favicon.ico|menu/|og/|.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)",
  ],
};
