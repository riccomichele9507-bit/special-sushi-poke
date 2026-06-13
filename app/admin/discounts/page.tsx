import { createAdminClient } from "@/lib/supabase/admin";
import { DiscountCodeForm } from "./discount-code-form";
import { DiscountCodeRowActions } from "./discount-code-row-actions";

function fmtEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLive(c: {
  active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  max_redemptions: number | null;
  redemptions: number;
}): { live: boolean; note: string } {
  if (!c.active) return { live: false, note: "Disattivato" };
  const now = Date.now();
  if (c.valid_from && now < new Date(c.valid_from).getTime())
    return { live: false, note: "Non ancora attivo" };
  if (c.valid_to && now > new Date(c.valid_to).getTime())
    return { live: false, note: "Scaduto" };
  if (c.max_redemptions != null && c.redemptions >= c.max_redemptions)
    return { live: false, note: "Esaurito" };
  return { live: true, note: "Attivo" };
}

export default async function AdminDiscountsPage() {
  const supabase = createAdminClient();
  const { data: codes } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Codici sconto</h1>
        <p className="text-sm text-warm-gray mt-1">
          Crea codici da comunicare ai clienti (es. per WhatsApp, social, volantini).
          Puoi scegliere uno sconto in € o in %, con periodo di validità e ordine
          minimo. Lo sconto viene applicato e ricalcolato sul server, a prova di
          manomissione.
        </p>
      </div>

      <div className="rounded-lg border border-bamboo/20 p-4">
        <h2 className="text-lg font-semibold mb-3">Nuovo codice</h2>
        <DiscountCodeForm />
      </div>

      <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-3 py-2">Codice</th>
              <th className="px-3 py-2">Sconto</th>
              <th className="px-3 py-2">Min. ordine</th>
              <th className="px-3 py-2">Dal</th>
              <th className="px-3 py-2">Al</th>
              <th className="px-3 py-2">Usi</th>
              <th className="px-3 py-2">Stato</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {codes?.map((c) => {
              const st = isLive(c);
              return (
                <tr key={c.code} className="border-t border-bamboo/10">
                  <td className="px-3 py-2 font-mono font-semibold text-ink">
                    {c.code}
                    {c.label && (
                      <span className="block font-sans text-xs font-normal text-warm-gray">
                        {c.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {c.kind === "percent" ? `−${c.value}%` : `−${fmtEuro(c.value)}`}
                  </td>
                  <td className="px-3 py-2 text-warm-gray">
                    {c.min_order_cents > 0 ? fmtEuro(c.min_order_cents) : "—"}
                  </td>
                  <td className="px-3 py-2 text-warm-gray">{fmtDate(c.valid_from)}</td>
                  <td className="px-3 py-2 text-warm-gray">{fmtDate(c.valid_to)}</td>
                  <td className="px-3 py-2 text-warm-gray tabular-nums">
                    {c.redemptions}
                    {c.max_redemptions != null ? `/${c.max_redemptions}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        st.live
                          ? "text-bamboo font-medium"
                          : "text-warm-gray"
                      }
                    >
                      {st.live ? "🟢" : "⚪"} {st.note}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <DiscountCodeRowActions code={c.code} active={c.active} />
                  </td>
                </tr>
              );
            })}
            {(!codes || codes.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-warm-gray">
                  Nessun codice sconto. Creane uno qui sopra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
