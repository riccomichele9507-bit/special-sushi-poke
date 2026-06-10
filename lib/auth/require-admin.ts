// Helper server-only: assicura che la sessione corrente sia un admin.
// Redirect a /login se non autenticato, a /?error=not_admin se autenticato ma non admin.

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/admin");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/?error=not_admin");
  }

  return user;
}
