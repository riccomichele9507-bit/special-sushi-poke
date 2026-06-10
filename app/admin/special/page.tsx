import { createAdminClient } from "@/lib/supabase/admin";
import { SpecialForm } from "./special-form";

export default async function AdminSpecialPage() {
  const supabase = createAdminClient();
  const [{ data: special }, { data: dishes }] = await Promise.all([
    supabase.from("daily_special").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("dishes")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Offerta del giorno</h1>
        <p className="text-sm text-warm-gray mt-1">
          Mostra una promozione in homepage con countdown all&apos;ora di fine.
        </p>
      </div>
      <SpecialForm special={special} dishes={dishes ?? []} />
    </div>
  );
}
