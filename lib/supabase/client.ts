// Supabase client per il BROWSER (Client Components, Realtime, auth UI).
// Usa l'anon key. La sessione utente vive nei cookie httpOnly + storage Supabase.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
