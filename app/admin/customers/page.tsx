import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmailTestButton } from "./email-test-button";

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}
function fmtDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Mai";
}

export default async function AdminCustomersPage() {
  const sb = createAdminClient();

  // Audience unificata: TUTTI: clienti registrati + chi ha ordinato senza
  // registrarsi (guest). Una riga per email, con metriche già aggregate (ultimo
  // ordine, n° ordini, spesa) dagli ordini salvati.
  const { data } = await sb.rpc("get_marketing_audience");
  const rows = (data ?? []).slice().sort((a, b) => {
    // Ultimo ordine più recente in cima (chi non ha mai ordinato va in fondo).
    const la = a.last_order_at ?? "";
    const lb = b.last_order_at ?? "";
    if (la !== lb) return la < lb ? 1 : -1;
    return (a.email ?? "").localeCompare(b.email ?? "");
  });

  const registered = rows.filter((r) => r.is_registered).length;
  const guests = rows.length - registered;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif-jp text-ink">Clienti</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {rows.length} clienti · {registered} registrati · {guests} guest (hanno
            ordinato senza account).
          </p>
        </div>
        <Link
          href="/admin/marketing"
          className="rounded-full border border-bamboo/20 px-3 py-1.5 text-xs text-warm-gray hover:border-bamboo/50"
        >
          Invia una campagna →
        </Link>
      </div>

      <EmailTestButton />

      <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Mktg</th>
              <th className="px-3 py-2">Ultimo ordine</th>
              <th className="px-3 py-2 text-right">Ordini</th>
              <th className="px-3 py-2 text-right">Spesa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email} className="border-t border-bamboo/10">
                <td className="px-3 py-2">{r.name ?? "—"}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2 text-warm-gray">{r.phone ?? "—"}</td>
                <td className="px-3 py-2">
                  {r.is_registered ? (
                    <span className="rounded bg-bamboo/10 px-1.5 text-[10px] font-semibold text-bamboo-deep">
                      registrato
                    </span>
                  ) : (
                    <span className="rounded bg-warm-gray/15 px-1.5 text-[10px] font-semibold uppercase text-warm-gray">
                      guest
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{r.marketing_consent ? "✅" : "❌"}</td>
                <td className="px-3 py-2 text-xs text-warm-gray">{fmtDate(r.last_order_at)}</td>
                <td className="px-3 py-2 text-right">{r.total_orders}</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {r.total_orders > 0 ? euro(r.total_spent_cents) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-warm-gray">
                  Nessun cliente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-warm-gray">
        💡 Include anche chi ha ordinato senza registrarsi (guest): i loro ordini sono
        salvati e la data dell&apos;ultimo ordine è sempre tracciata.
      </p>
    </div>
  );
}
