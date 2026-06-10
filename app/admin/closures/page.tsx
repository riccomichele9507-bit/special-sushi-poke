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

      <div className="rounded-lg border border-bamboo/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-4 py-2">Da</th>
              <th className="px-4 py-2">A</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Pranzo</th>
              <th className="px-4 py-2">Cena</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {closures?.map((c) => (
              <tr key={c.id} className="border-t border-bamboo/10">
                <td className="px-4 py-2">{c.start_date}</td>
                <td className="px-4 py-2">{c.end_date}</td>
                <td className="px-4 py-2 text-warm-gray">{c.reason ?? "—"}</td>
                <td className="px-4 py-2">
                  {c.closes_lunch ? "❌ Chiuso" : "✅ Aperto"}
                </td>
                <td className="px-4 py-2">
                  {c.closes_dinner ? "❌ Chiuso" : "✅ Aperto"}
                </td>
                <td className="px-4 py-2 text-right">
                  <ClosureDeleteButton id={c.id} label={`${c.start_date} — ${c.reason ?? "Chiusura"}`} />
                </td>
              </tr>
            ))}
            {(!closures || closures.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-warm-gray">
                  Nessuna chiusura programmata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
