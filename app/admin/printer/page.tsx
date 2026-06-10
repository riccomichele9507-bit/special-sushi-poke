import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPrinterPage() {
  const supabase = createAdminClient();
  const [{ data: health }, { data: recentJobs }] = await Promise.all([
    supabase.from("printer_health").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("print_jobs")
      .select("id, status, created_at, claimed_at, printed_at, attempts, last_error, order_id")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Stampante</h1>
        <p className="text-sm text-warm-gray mt-1">
          Stato Star TSP143IV CloudPRNT + cronologia stampe.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Ultimo poll" value={health?.last_poll_at ? new Date(health.last_poll_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" }) : "—"} />
        <Tile label="Stato carta" value={health?.paper_status ?? "—"} accent={health?.paper_status !== "OK" ? "warn" : undefined} />
        <Tile label="Job in attesa" value={String(health?.pending_jobs_count ?? 0)} />
        <Tile label="MAC stampante" value={health?.printer_mac ?? "—"} mono />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-ink mb-3">Ultimi 50 job</h2>
        <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bamboo/5 text-left">
              <tr>
                <th className="px-3 py-2">Stato</th>
                <th className="px-3 py-2">Creato</th>
                <th className="px-3 py-2">Stampato</th>
                <th className="px-3 py-2">Ordine</th>
                <th className="px-3 py-2 text-center">Tentativi</th>
                <th className="px-3 py-2">Errore</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs?.map((j) => (
                <tr key={j.id} className="border-t border-bamboo/10">
                  <td className="px-3 py-2 text-xs">
                    <PrintStatus status={j.status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-warm-gray">
                    {new Date(j.created_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" })}
                  </td>
                  <td className="px-3 py-2 text-xs text-warm-gray">
                    {j.printed_at ? new Date(j.printed_at).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome" }) : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{j.order_id ?? "—"}</td>
                  <td className="px-3 py-2 text-center">{j.attempts}</td>
                  <td className="px-3 py-2 text-xs text-sushi-red">{j.last_error ?? ""}</td>
                </tr>
              ))}
              {(!recentJobs || recentJobs.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-warm-gray">
                    Nessun job di stampa ancora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-bamboo/20 p-4 text-sm text-warm-gray">
        <p className="font-semibold text-ink mb-2">🛠️ Setup stampante</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Genera <code>CLOUDPRNT_TOKEN</code> (UUID) e mettilo in <code>.env.local</code> + Vercel env vars.</li>
          <li>Configura la stampante: pannello web Star → CloudPRNT → URL <code>https://special-sushi-poke.vercel.app/api/cloudprnt</code>.</li>
          <li>Auth Basic: username <code>printer</code>, password = <code>CLOUDPRNT_TOKEN</code>.</li>
          <li>Polling: 10 secondi. Salva + reboot stampante.</li>
        </ol>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: "warn";
  mono?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent === "warn"
          ? "border-amber-300 bg-amber-50"
          : "border-bamboo/20 bg-paper"
      }`}
    >
      <p className="text-xs text-warm-gray uppercase">{label}</p>
      <p className={`mt-1 ${mono ? "font-mono text-xs" : "text-sm font-semibold"} text-ink truncate`}>
        {value}
      </p>
    </div>
  );
}

function PrintStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    in_progress: "bg-blue-100 text-blue-900",
    printed: "bg-green-100 text-green-900",
    failed: "bg-sushi-red/15 text-sushi-red",
    cancelled: "bg-warm-gray/15 text-warm-gray",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded ${map[status] ?? "bg-warm-gray/15"}`}>
      {status}
    </span>
  );
}
