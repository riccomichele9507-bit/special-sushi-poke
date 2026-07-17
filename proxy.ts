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
    // 1) Rotte che leggono la sessione LATO SERVER → il proxy gira sempre.
    //    (admin/layout requireAdmin, account, checkout+embedded-pay, flussi auth)
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/auth/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/profile",

    // 2) Qualsiasi ALTRA pagina, ma SOLO quando la richiesta è una Server Action
    //    (header 'next-action', cfr. ACTION_HEADER di Next.js). Serve perché
    //    azioni come toggleFavorite (cuoricino in dish-card, usato su home/menu/
    //    search) leggono la sessione e girano sulla rotta della pagina chiamante.
    //    Le visite normali e i bot NON fanno partire il proxy → è qui che si
    //    risparmiano ~30k invocazioni/giorno.
    {
      source: "/((?!api/|_next/static|_next/image).*)",
      has: [{ type: "header", key: "next-action" }],
    },
  ],
};

// NOTA: /api è escluso ovunque di proposito — le route API si autenticano da sole
// (token CloudPRNT, firma Stripe, bearer cron) e non usano la sessione Supabase.
