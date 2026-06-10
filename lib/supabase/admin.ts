// Supabase client SERVER-ONLY con service_role.
// BYPASSA TUTTE LE RLS. Mai importare in client component, mai esporre la chiave.
// Usato per: insert ordini (createOrder), CRUD admin, endpoint stampante, seed.

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "x-app": "ssp-server-admin" } },
    },
  );
}
