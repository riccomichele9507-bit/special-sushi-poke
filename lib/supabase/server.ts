// Supabase client per SSR (Server Components + Server Actions + Route Handlers).
// Usa l'anon key + cookies della sessione utente → rispetta RLS come l'utente loggato.
// In Next 16 cookies() è async.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components possono fallire su set: il proxy.ts gestisce il refresh.
          }
        },
      },
    },
  );
}
