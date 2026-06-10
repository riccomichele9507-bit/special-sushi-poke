// Helper condivisi per le server action admin.

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

/**
 * Verifica che il chiamante sia un admin. Throw error altrimenti.
 * Usare in ogni server action admin.
 */
export async function assertAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("Non sei admin");
  return user.id;
}

/**
 * Esegue una server action admin: verifica admin → callback con admin client (bypass RLS)
 * → revalida path. Cattura errori e ritorna struttura uniforme.
 */
export async function adminAction<T>(
  callback: (sb: ReturnType<typeof createAdminClient>, userId: string) => Promise<T>,
  options: { revalidate?: string[]; tags?: string[] } = {},
): Promise<AdminActionResult> {
  try {
    const userId = await assertAdmin();
    const sb = createAdminClient();
    await callback(sb, userId);
    for (const path of options.revalidate ?? []) revalidatePath(path);
    // revalidateTag rimosso: in Next 16 ha firma cambiata e non lo usiamo
    // (data layer usa React cache() per-request, no cacheTag attivo).
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore sconosciuto";
    console.error("adminAction error:", msg);
    return { ok: false, error: msg };
  }
}
