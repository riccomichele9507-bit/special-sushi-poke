import Link from "next/link";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ShoppingBag,
  UtensilsCrossed,
  Users,
  AlertCircle,
} from "lucide-react";
import { PauseToggleButton } from "@/components/admin/pause-toggle-button";

/** Veloce: solo gli stat indispensabili in 2 query parallele */
async function getQuickStats() {
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [ordersToday, dishesSoldOut, restaurant] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString())
      .eq("is_test", false),
    supabase
      .from("dishes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false),
    supabase
      .from("restaurant_settings")
      .select("manual_pause")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  return {
    ordersToday: ordersToday.count ?? 0,
    dishesSoldOut: dishesSoldOut.count ?? 0,
    manualPause: restaurant.data?.manual_pause ?? false,
  };
}

/** Lento (RPC dormant): caricato in Suspense separato */
async function SlowStats() {
  const supabase = createAdminClient();
  const [dishesActive, customersTotal] = await Promise.all([
    supabase
      .from("dishes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("customers").select("id", { count: "exact", head: true }),
  ]);
  return (
    <>
      <Kpi
        label="Piatti attivi"
        value={dishesActive.count ?? 0}
        icon={UtensilsCrossed}
        href="/admin/menu"
      />
      <Kpi
        label="Clienti totali"
        value={customersTotal.count ?? 0}
        icon={Users}
        href="/admin/customers"
      />
    </>
  );
}

export default async function AdminHomePage() {
  const k = await getQuickStats();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Benvenuto</h1>
        <p className="text-sm text-warm-gray mt-1">
          Stato del ristorante in tempo reale.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Ordini oggi" value={k.ordersToday} icon={ShoppingBag} href="/admin/orders" />
        <Suspense fallback={<KpiSkeleton />}>
          <SlowStats />
        </Suspense>
        <Kpi
          label="Piatti esauriti"
          value={k.dishesSoldOut}
          icon={AlertCircle}
          href="/admin/menu?filter=sold_out"
          accent={k.dishesSoldOut > 0 ? "warn" : undefined}
        />
      </div>

      {/* Reminder fiscale permanente */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-900 mb-1">
          ⚠️ Promemoria fiscale
        </h3>
        <p className="text-sm text-amber-800">
          Per <strong>ogni ordine consegnato o ritirato</strong>, emetti il
          Documento Commerciale dalla Cassa Fiscale del SmartPOS Nexi prima di
          chiudere l&apos;ordine. La stampa che esce dalla stampante in cucina è
          solo la comanda di lavoro — NON è un documento fiscale.
        </p>
      </div>

      {/* Azioni rapide */}
      <div>
        <h2 className="text-xl font-semibold text-ink mb-3">Azioni rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/menu"
            className="rounded-lg border border-bamboo/20 bg-paper p-4 hover:bg-bamboo/5 transition-colors"
          >
            <p className="font-semibold text-ink">Esaurito un piatto?</p>
            <p className="text-sm text-warm-gray">
              Lo togli dal menu in 1 click dalla pagina Piatti.
            </p>
          </Link>
          <Link
            href="/admin/closures"
            className="rounded-lg border border-bamboo/20 bg-paper p-4 hover:bg-bamboo/5 transition-colors"
          >
            <p className="font-semibold text-ink">Chiudi per ferie</p>
            <p className="text-sm text-warm-gray">
              Aggiungi un periodo: il sito blocca gli ordini in quei giorni.
            </p>
          </Link>
          <PauseToggleButton paused={k.manualPause} />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-bamboo/20 bg-paper p-4 animate-pulse">
      <div className="h-5 w-5 rounded bg-bamboo/10" />
      <div className="mt-2 h-6 w-12 rounded bg-bamboo/10" />
      <div className="mt-2 h-3 w-20 rounded bg-bamboo/10" />
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent?: "warn";
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-4 hover:shadow-sm transition ${
        accent === "warn"
          ? "border-amber-300 bg-amber-50"
          : "border-bamboo/20 bg-paper hover:bg-bamboo/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-warm-gray" />
        <span className="text-2xl font-bold text-ink">
          {value ?? "—"}
        </span>
      </div>
      <p className="mt-2 text-sm text-warm-gray">{label}</p>
    </Link>
  );
}
