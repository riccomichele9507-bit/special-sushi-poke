import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MapPin, Truck, ShoppingBag, Clock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatusActions } from "./order-status-actions";
import { ReprintButton } from "./reprint-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ItemSnapshot {
  dishId: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
  variant?: string;
  extras?: string[];
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sb = createAdminClient();

  const { data: order } = await sb
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: history } = await sb
    .from("order_status_history")
    .select("status, changed_at, changed_by")
    .eq("order_id", order.id)
    .order("changed_at", { ascending: true });

  const items = (order.items as unknown as ItemSnapshot[]) ?? [];
  const isDelivery = order.order_type === "delivery";

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Tutti gli ordini
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif-jp text-ink">
            {order.order_number}
          </h1>
          <p className="text-sm text-warm-gray mt-1">
            {isDelivery ? "🛵 Consegna" : "🏪 Ritiro"} ·{" "}
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* AZIONI 1-CLICK */}
      <OrderStatusActions
        orderId={order.id}
        currentStatus={order.status}
        orderType={order.order_type}
      />

      {/* Slot consegna/ritiro */}
      <div className="rounded-xl border border-bamboo/30 bg-bamboo/5 p-4">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-warm-gray">
          <Clock className="h-3.5 w-3.5" />
          {isDelivery ? "Consegna prevista" : "Pronto al ritiro"}
        </p>
        <p className="mt-1 text-2xl font-bold text-ink">
          Tra le <span className="text-bamboo">{formatTime(order.slot_start)}</span>{" "}
          e le <span className="text-bamboo">{formatTime(order.slot_end)}</span>
        </p>
        <p className="mt-1 text-xs text-warm-gray">
          ETA: ~{order.eta_minutes} min · {order.payment_method === "card" ? "💳 Carta" : "💶 Contanti"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cliente */}
        <div className="rounded-xl border border-bamboo/20 bg-paper p-4">
          <p className="text-xs uppercase tracking-wider text-warm-gray mb-2">
            Cliente
          </p>
          <p className="text-lg font-semibold text-ink">{order.customer_name}</p>
          <div className="mt-2 space-y-1 text-sm">
            <a
              href={`tel:${order.customer_phone}`}
              className="flex items-center gap-2 text-bamboo hover:text-bamboo-deep font-medium"
            >
              <Phone className="h-4 w-4" />
              {order.customer_phone}
            </a>
            <p className="text-warm-gray text-xs break-all">
              {order.customer_email}
            </p>
          </div>
        </div>

        {/* Indirizzo (solo delivery) */}
        {isDelivery && order.address_line && (
          <div className="rounded-xl border border-bamboo/20 bg-paper p-4">
            <p className="text-xs uppercase tracking-wider text-warm-gray mb-2 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Indirizzo
            </p>
            <p className="text-sm text-ink">{order.address_line}</p>
            {order.address_notes && (
              <p className="text-xs text-warm-gray mt-1">
                Note: {order.address_notes}
              </p>
            )}
            {order.road_distance_m != null && (
              <p className="text-xs text-warm-gray mt-1">
                <Truck className="inline h-3 w-3 mr-0.5" />
                {(order.road_distance_m / 1000).toFixed(1)} km
              </p>
            )}
            {order.driver_notes && (
              <p className="mt-2 rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
                <strong>Note rider:</strong> {order.driver_notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Piatti */}
      <div className="rounded-xl border border-bamboo/20 bg-paper p-4">
        <p className="text-xs uppercase tracking-wider text-warm-gray mb-3 flex items-center gap-1">
          <ShoppingBag className="h-3.5 w-3.5" />
          Piatti
        </p>
        <ul className="divide-y divide-bamboo/10">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between py-2 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">
                  {it.qty}× {it.name}
                </p>
                {it.extras && it.extras.length > 0 && (
                  <p className="text-xs text-warm-gray">
                    + {it.extras.join(", ")}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold tabular-nums">
                €{(it.lineTotalCents / 100).toFixed(2).replace(".", ",")}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-bamboo/10 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-warm-gray">Subtotale</span>
            <span className="tabular-nums">
              €{(order.subtotal_cents / 100).toFixed(2).replace(".", ",")}
            </span>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-sm text-bamboo">
              <span>Sconto{order.discount_code ? ` (${order.discount_code})` : ""}</span>
              <span className="tabular-nums">
                -€{(order.discount_cents / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
          {order.tip_cents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Mancia</span>
              <span className="tabular-nums">
                €{(order.tip_cents / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-bamboo/10">
            <span>Totale</span>
            <span className="tabular-nums text-bamboo">
              €{(order.total_cents / 100).toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>

      {/* Ristampa */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            Stampa non arrivata in cucina?
          </p>
          <p className="text-xs text-amber-800">
            Forza una nuova stampa della comanda.
          </p>
        </div>
        <ReprintButton orderId={order.id} />
      </div>

      {/* Storico status */}
      {history && history.length > 0 && (
        <div className="rounded-xl border border-bamboo/20 bg-paper p-4">
          <p className="text-xs uppercase tracking-wider text-warm-gray mb-3">
            Storico
          </p>
          <ol className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink">{h.status}</span>
                <span className="text-xs text-warm-gray">
                  {formatDateTime(h.changed_at)} · {h.changed_by ?? "—"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${map[status] ?? "bg-warm-gray/15"}`}
    >
      {status}
    </span>
  );
}
