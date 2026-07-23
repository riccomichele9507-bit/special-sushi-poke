import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}
function fmtDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString("it-IT", {
        timeZone: "Europe/Rome",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
}

// Un ordine "conta come riscatto" con lo stesso criterio di hasRedeemedCode:
// non annullato/rimborsato, e contanti oppure carta già confermata.
function isRedeemed(o: { status: string; payment_method: string }): boolean {
  return (
    o.status !== "cancelled" &&
    o.status !== "refunded" &&
    (o.payment_method === "cash" || o.status !== "received")
  );
}

export default async function StoricoCampagnePage() {
  const sb = createAdminClient();
  const [campaignsRes, ordersRes] = await Promise.all([
    sb.from("campaigns").select("*").order("created_at", { ascending: false }),
    sb
      .from("orders")
      .select("discount_code, total_cents, status, payment_method")
      .not("discount_code", "is", null)
      .eq("is_test", false),
  ]);
  const campaigns = campaignsRes.data ?? [];
  const orders = ordersRes.data ?? [];

  // Riscatti + incasso per codice (una passata su tutti gli ordini col codice).
  const byCode = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    if (!o.discount_code || !isRedeemed(o)) continue;
    const cur = byCode.get(o.discount_code) ?? { count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += o.total_cents;
    byCode.set(o.discount_code, cur);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif-jp text-ink">Storico campagne</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Come vanno le campagne: email inviate, riscatti del codice e incasso generato.
          </p>
        </div>
        <Link
          href="/admin/marketing"
          className="rounded-full border border-bamboo/20 px-3 py-1.5 text-xs text-warm-gray hover:border-bamboo/50"
        >
          ← Nuova campagna
        </Link>
      </div>

      <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Oggetto</th>
              <th className="px-3 py-2">Codice</th>
              <th className="px-3 py-2 text-right">Inviate</th>
              <th className="px-3 py-2 text-right">Riscatti</th>
              <th className="px-3 py-2 text-right">Tasso</th>
              <th className="px-3 py-2 text-right">Incasso</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const m = c.discount_code ? byCode.get(c.discount_code) : undefined;
              const redemptions = m?.count ?? 0;
              const revenue = m?.revenue ?? 0;
              const rate =
                c.discount_code && c.sent > 0
                  ? Math.round((redemptions / c.sent) * 100)
                  : null;
              return (
                <tr key={c.id} className="border-t border-bamboo/10 hover:bg-bamboo/5">
                  <td className="px-3 py-2 text-xs text-warm-gray">{fmtDate(c.created_at)}</td>
                  <td className="px-3 py-2">{c.subject}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {c.discount_code ?? <span className="text-warm-gray">nessuno</span>}
                  </td>
                  <td className="px-3 py-2 text-right">{c.sent}</td>
                  <td className="px-3 py-2 text-right">{c.discount_code ? redemptions : "—"}</td>
                  <td className="px-3 py-2 text-right">{rate != null ? `${rate}%` : "—"}</td>
                  <td className="px-3 py-2 text-right font-semibold text-bamboo-deep">
                    {c.discount_code ? euro(revenue) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {c.discount_code && redemptions > 0 && (
                      <Link
                        href={`/admin/marketing/storico/${c.id}`}
                        className="text-xs text-bamboo hover:underline"
                      >
                        chi →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-warm-gray">
                  Nessuna campagna inviata ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-warm-gray">
        💡 &quot;Riscatti&quot; = ordini pagati che hanno usato il codice della campagna.
        Clicca &quot;chi →&quot; per vedere i clienti che l&apos;hanno usato.
      </p>
    </div>
  );
}
