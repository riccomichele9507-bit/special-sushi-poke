import { createAdminClient } from "@/lib/supabase/admin";
import { ClosureForm } from "./closure-form";
import { ClosureDeleteButton } from "./closure-delete-button";

export default async function AdminClosuresPage() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: closures } = await supabase
    .from("closures")
    .select("*")
    .gte("end_date", today)
    .order("start_date", { ascending: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Chiusure & ferie</h1>
        <p className="text-sm text-warm-gray mt-1">
          Periodi in cui il sito non accetta ordini. Festività italiane già
          pre-caricate; rimuovi quelle in cui resterai aperto.
        </p>
      </div>

      <div className="rounded-lg border border-bamboo/20 p-4">
        <h2 className="text-lg font-semibold mb-3">Aggiungi periodo</h2>
        <ClosureForm />
      </div>

      <ul className="divide-y divide-bamboo/10 overflow-hidden rounded-lg border border-bamboo/20">
        {closures?.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-3 py-3">
            {/* Rimuovi: pulsante a lato, sempre visibile anche su mobile */}
            <ClosureDeleteButton
              id={c.id}
              label={`${c.start_date} — ${c.reason ?? "Chiusura"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">
                {c.start_date}
                {c.end_date !== c.start_date ? ` → ${c.end_date}` : ""}
              </p>
              <p className="truncate text-xs text-warm-gray">
                {c.reason ?? "—"} · Pranzo {c.closes_lunch ? "❌" : "✅"} · Cena{" "}
                {c.closes_dinner ? "❌" : "✅"}
              </p>
            </div>
          </li>
        ))}
        {(!closures || closures.length === 0) && (
          <li className="px-4 py-6 text-center text-warm-gray">
            Nessuna chiusura programmata.
          </li>
        )}
      </ul>
    </div>
  );
}
