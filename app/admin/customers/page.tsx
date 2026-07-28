import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmailTestButton } from "./email-test-button";

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("customers")
    .select("id, email, name, phone, marketing_consent, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const customers = data ?? [];

  // Ultimo ordine per cliente: match per customer_id OPPURE per email
  // (case-insensitive). Molti ordini hanno customer_id NULL perché fatti da NON
  // loggato (guest), pur con la stessa email dell'account: senza il match per
  // email risulterebbero "Mai" anche per chi ha davvero ordinato.
  const { data: ords } = await supabase
    .from("orders")
    .select("customer_id, customer_email, created_at")
    .eq("is_test", false)
    .order("created_at", { ascending: false });
  const lastByEmail = new Map<string, string>();
  const lastById = new Map<string, string>();
  for (const o of ords ?? []) {
    if (o.customer_email) {
      const k = o.customer_email.toLowerCase();
      if (!lastByEmail.has(k)) lastByEmail.set(k, o.created_at);
    }
    if (o.customer_id && !lastById.has(o.customer_id)) {
      lastById.set(o.customer_id, o.created_at);
    }
  }
  const lastOrderFor = (c: { id: string; email: string }): string | null => {
    const a = lastByEmail.get(c.email.toLowerCase());
    const b = lastById.get(c.id);
    if (a && b) return a > b ? a : b; // ISO 8601: confronto stringa = cronologico
    return a ?? b ?? null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-serif-jp text-ink">Clienti</h1>
          <p className="mt-1 text-sm text-warm-gray">{customers.length} clienti registrati.</p>
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
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Marketing</th>
              <th className="px-3 py-2">Ultimo ordine</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const last = lastOrderFor(c);
              return (
                <tr key={c.id} className="border-t border-bamboo/10">
                  <td className="px-3 py-2">{c.email}</td>
                  <td className="px-3 py-2">{c.name ?? "—"}</td>
                  <td className="px-3 py-2 text-warm-gray">{c.phone ?? "—"}</td>
                  <td className="px-3 py-2">{c.marketing_consent ? "✅" : "❌"}</td>
                  <td className="px-3 py-2 text-xs text-warm-gray">
                    {last
                      ? new Date(last).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Mai"}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-warm-gray">
                  Nessun cliente registrato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
