import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function isRedeemed(o: { status: string; payment_method: string }): boolean {
  return (
    o.status !== "cancelled" &&
    o.status !== "refunded" &&
    (o.payment_method === "cash" || o.status !== "received")
  );
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createAdminClient();
  const { data: c } = await sb.from("campaigns").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  let redeemers: Array<{
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_id: string | null;
    total_cents: number;
    status: string;
    payment_method: string;
    created_at: string;
  }> = [];
  if (c.discount_code) {
    const { data } = await sb
      .from("orders")
      .select(
        "order_number, customer_name, customer_email, customer_id, total_cents, status, payment_method, created_at",
      )
      .eq("discount_code", c.discount_code)
      .eq("is_test", false)
      .order("created_at", { ascending: false });
    redeemers = (data ?? []).filter(isRedeemed);
  }
  const revenue = redeemers.reduce((s, o) => s + o.total_cents, 0);

  const discountLabel = c.discount_code
    ? c.discount_kind === "fixed"
      ? `${euro(c.discount_value ?? 0)} di sconto`
      : `${c.discount_value ?? 0}% di sconto`
    : "Nessuno sconto";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/marketing/storico"
          className="text-xs text-warm-gray hover:text-ink"
        >
          ← Storico campagne
        </Link>
        <h1 className="mt-1 text-2xl font-serif-jp text-ink">{c.subject}</h1>
        <p className="mt-1 text-sm text-warm-gray">
          Inviata il {fmtDateTime(c.created_at)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Inviate" value={String(c.sent)} />
        <Stat label="Riscatti" value={c.discount_code ? String(redeemers.length) : "—"} />
        <Stat
          label="Tasso"
          value={c.discount_code && c.sent > 0 ? `${Math.round((redeemers.length / c.sent) * 100)}%` : "—"}
        />
        <Stat label="Incasso" value={c.discount_code ? euro(revenue) : "—"} accent />
      </div>

      <div className="rounded-lg border border-bamboo/20 p-4 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <div>
            <span className="text-warm-gray">Codice: </span>
            <span className="font-mono font-semibold text-ink">{c.discount_code ?? "—"}</span>
          </div>
          <div>
            <span className="text-warm-gray">Sconto: </span>
            {discountLabel}
          </div>
          <div>
            <span className="text-warm-gray">Scadenza: </span>
            {c.expires_at ? fmtDateTime(c.expires_at) : "—"}
          </div>
          {c.min_order_cents ? (
            <div>
              <span className="text-warm-gray">Ordine minimo: </span>
              {euro(c.min_order_cents)}
            </div>
          ) : null}
        </div>
      </div>

      {c.discount_code ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink">
            Chi ha usato il codice ({redeemers.length})
          </h2>
          <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bamboo/5 text-left">
                <tr>
                  <th className="px-3 py-2">Ordine</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Quando</th>
                  <th className="px-3 py-2 text-right">Totale</th>
                </tr>
              </thead>
              <tbody>
                {redeemers.map((o) => (
                  <tr key={o.order_number} className="border-t border-bamboo/10">
                    <td className="px-3 py-2 font-mono text-xs">{o.order_number}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {o.customer_name}
                        {!o.customer_id && (
                          <span className="rounded bg-warm-gray/15 px-1 text-[9px] font-semibold uppercase text-warm-gray">
                            guest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-warm-gray">{o.customer_email}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-warm-gray">{fmtDateTime(o.created_at)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{euro(o.total_cents)}</td>
                  </tr>
                ))}
                {redeemers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-warm-gray">
                      Ancora nessun riscatto per questo codice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-warm-gray">Questa campagna non aveva uno sconto.</p>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-bamboo/15 p-3 text-center">
      <div className={`text-xl font-bold ${accent ? "text-bamboo-deep" : "text-ink"}`}>{value}</div>
      <div className="text-[10px] text-warm-gray">{label}</div>
    </div>
  );
}
