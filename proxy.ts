// Next.js 16: middleware è stato rinominato in "proxy".
// Refresh sessione Supabase ad ogni request e propagazione cookie.

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tutte le route eccetto asset statici e file pubblici
    "/((?!_next/static|_next/image|favicon.ico|menu/|og/|.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)$).*)",
  ],
};
