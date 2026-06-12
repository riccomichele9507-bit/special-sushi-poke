import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { QuickActionButton } from "./quick-action-button";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type SearchParams = { status?: string };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, created_at, slot_start, slot_end, order_type, status, customer_name, customer_phone, total_cents, payment_method, fiscal_receipt_issued, is_test",
    )
    .eq("is_test", false)
    .order("created_at", { ascending: false })
    .limit(100);
  if (params.status) query = query.eq("status", params.status as OrderStatus);

  const { data: orders } = await query;

  const statuses = [
    { id: "", label: "Tutti" },
    { id: "received", label: "Ricevuti" },
    { id: "confirmed", label: "Confermati" },
    { id: "preparing", label: "In preparazione" },
    { id: "ready", label: "Pronti" },
    { id: "in_delivery", label: "In consegna" },
    { id: "delivered", label: "Consegnati" },
    { id: "cancelled", label: "Cancellati" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Ordini</h1>
        <p className="text-sm text-warm-gray mt-1">
          Ultimi 100 ordini reali (test esclusi). {orders?.length ?? 0} mostrati.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.id}
            href={s.id ? `/admin/orders?status=${s.id}` : "/admin/orders"}
            className={`rounded-full px-3 py-1 text-xs border ${
              (params.status ?? "") === s.id
                ? "bg-bamboo text-paper border-bamboo"
                : "bg-paper text-warm-gray border-bamboo/20"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Ora</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2 text-right">Totale</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center">Azione rapida</th>
              <th className="px-3 py-2 text-center">Fisc.</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr
                key={o.id}
                className="border-t border-bamboo/10 hover:bg-bamboo/5"
              >
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-bamboo hover:underline font-semibold"
                  >
                    {o.order_number} →
                  </Link>
                </td>
                <td className="px-3 py-2 text-warm-gray">
                  {new Date(o.created_at).toLocaleString("it-IT", {
                    timeZone: "Europe/Rome",
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </td>
                <td className="px-3 py-2 text-xs">
                  {o.order_type === "delivery" ? "🛵" : "🏪"} {o.order_type}
                </td>
                <td className="px-3 py-2 text-xs">
                  {new Date(o.slot_start).toLocaleTimeString("it-IT", {
                    timeZone: "Europe/Rome",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  -
                  {new Date(o.slot_end).toLocaleTimeString("it-IT", {
                    timeZone: "Europe/Rome",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 py-2">
                  <div>{o.customer_name}</div>
                  <div className="text-warm-gray text-xs">{o.customer_phone}</div>
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  <span className="text-xs text-warm-gray mr-1">
                    {o.payment_method === "card" ? "💳" : "💶"}
                  </span>
                  €{(o.total_cents / 100).toFixed(2).replace(".", ",")}
                </td>
                <td className="px-3 py-2 text-xs">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-3 py-2 text-center">
                  <QuickActionButton
                    orderId={o.id}
                    status={o.status}
                    orderType={o.order_type}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  {o.fiscal_receipt_issued ? "✅" : "⏳"}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-warm-gray">
                  Nessun ordine al momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-warm-gray">
        💡 Clicca sul numero ordine per il dettaglio completo (indirizzo, piatti, storico).
        Il bottone verde nella colonna &quot;Azione rapida&quot; fa avanzare lo status di 1 step
        senza aprire il dettaglio.
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    received: "bg-blue-100 text-blue-900",
    confirmed: "bg-bamboo/15 text-bamboo",
    preparing: "bg-amber-100 text-amber-900",
    ready: "bg-purple-100 text-purple-900",
    in_delivery: "bg-cyan-100 text-cyan-900",
    delivered: "bg-green-100 text-green-900",
    cancelled: "bg-sushi-red/15 text-sushi-red",
    refunded: "bg-warm-gray/15 text-warm-gray",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${map[status] ?? "bg-warm-gray/15"}`}>
      {status}
    </span>
  );
}
