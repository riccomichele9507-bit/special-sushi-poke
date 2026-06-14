import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DormantCampaignButton } from "./dormant-campaign-button";
import { EmailTestButton } from "./email-test-button";

type SearchParams = { filter?: string };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  const isDormant = params.filter === "dormant";

  let customers: Array<{
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    marketing_consent: boolean;
    last_order_at?: string | null;
    total_orders?: number | null;
    created_at?: string;
  }> = [];

  if (isDormant) {
    const { data } = await supabase.rpc("list_dormant_customers", { days: 30 });
    customers = (data as typeof customers) ?? [];
  } else {
    const { data } = await supabase
      .from("customers")
      .select("id, email, name, phone, marketing_consent, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    customers = data ?? [];
    // Data ultimo ordine per ciascun cliente
    const ids = customers.map((c) => c.id);
    if (ids.length) {
      const { data: ords } = await supabase
        .from("orders")
        .select("customer_id, created_at")
        .in("customer_id", ids)
        .order("created_at", { ascending: false });
      const last = new Map<string, string>();
      for (const o of ords ?? []) {
        if (o.customer_id && !last.has(o.customer_id)) {
          last.set(o.customer_id, o.created_at);
        }
      }
      customers = customers.map((c) => ({
        ...c,
        last_order_at: last.get(c.id) ?? null,
      }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Clienti</h1>
        <p className="text-sm text-warm-gray mt-1">
          {customers.length} {isDormant ? "clienti dormienti (no ordini ultimi 30gg)" : "clienti registrati"}.
        </p>
      </div>

      <div className="flex gap-2">
        <FilterLink href="/admin/customers" active={!isDormant}>Tutti</FilterLink>
        <FilterLink href="/admin/customers?filter=dormant" active={isDormant}>Dormienti 30+ giorni</FilterLink>
      </div>

      <EmailTestButton />

      {isDormant && <DormantCampaignButton />}

      <div className="rounded-lg border border-bamboo/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Marketing</th>
              <th className="px-3 py-2">Ultimo ordine</th>
              {isDormant && <th className="px-3 py-2 text-right">Ordini totali</th>}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-bamboo/10">
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.name ?? "—"}</td>
                <td className="px-3 py-2 text-warm-gray">{c.phone ?? "—"}</td>
                <td className="px-3 py-2">{c.marketing_consent ? "✅" : "❌"}</td>
                <td className="px-3 py-2 text-xs text-warm-gray">
                  {c.last_order_at
                    ? new Date(c.last_order_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Mai"}
                </td>
                {isDormant && <td className="px-3 py-2 text-right">{c.total_orders ?? 0}</td>}
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={isDormant ? 6 : 5} className="px-3 py-8 text-center text-warm-gray">
                  {isDormant ? "Nessun cliente dormiente. Tutti fedeli!" : "Nessun cliente registrato."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs border ${
        active
          ? "bg-bamboo text-paper border-bamboo"
          : "bg-paper text-warm-gray border-bamboo/20"
      }`}
    >
      {children}
    </Link>
  );
}
