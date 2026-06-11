"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getEffectiveStatus,
  statusLabel,
  timelineSteps,
  timelineIndex,
} from "@/lib/orders/status";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface Props {
  initialOrder: Order;
  userId: string;
}

interface ItemSnapshot {
  name: string;
  qty: number;
  lineTotalCents: number;
}

export function OrderTrackingClient({ initialOrder, userId }: Props) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [now, setNow] = useState(new Date());

  // Realtime: aggiorna lo stato quando il titolare cambia status dal dashboard
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id, userId]);

  // Tick ogni 30s per ricalcolare effective status (in caso di transizioni "auto")
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const effective = getEffectiveStatus(order, now);
  const steps = timelineSteps(order.order_type);
  const currentIdx = timelineIndex(effective, order.order_type);
  const items = (order.items as unknown as ItemSnapshot[]) ?? [];

  const slotStart = new Date(order.slot_start);
  const slotEnd = new Date(order.slot_end);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Slot info */}
      <div className="rounded-2xl border border-bamboo/30 bg-bamboo/5 p-4">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-warm-gray">
          <Clock className="h-3 w-3" />
          {order.order_type === "delivery" ? "Consegna" : "Ritiro"}
        </p>
        <p className="mt-1 text-2xl font-bold text-ink">
          Tra le <span className="text-bamboo">{fmt(slotStart)}</span> e le{" "}
          <span className="text-bamboo">{fmt(slotEnd)}</span>
        </p>
        <p className="mt-1 text-sm font-medium text-bamboo-deep">
          {statusLabel(effective, order.order_type)}
        </p>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-paper p-4">
        <h2 className="text-[10px] uppercase tracking-wider text-warm-gray mb-3">
          Avanzamento
        </h2>
        <ol className="space-y-3">
          {steps.map((step, idx) => {
            const done = idx < currentIdx;
            const current = idx === currentIdx;
            return (
              <li key={step.key + idx} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                    done && "bg-bamboo text-paper",
                    current && "bg-bamboo text-paper ring-4 ring-bamboo/20 animate-pulse",
                    !done && !current && "bg-paper-warm text-warm-gray-soft border border-border",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    current
                      ? "font-semibold text-ink"
                      : done
                      ? "text-warm-gray"
                      : "text-warm-gray/60",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Address (delivery only) */}
      {order.order_type === "delivery" && order.address_line && (
        <div className="rounded-2xl border border-border bg-paper p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-warm-gray">
            <MapPin className="h-3 w-3" />
            Indirizzo consegna
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{order.address_line}</p>
          {order.address_notes && (
            <p className="text-xs text-warm-gray mt-1">{order.address_notes}</p>
          )}
        </div>
      )}

      {/* Items + Total */}
      <div className="rounded-2xl border border-border bg-paper p-4">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-warm-gray mb-3">
          <Receipt className="h-3 w-3" />
          Riepilogo
        </p>
        <ul className="divide-y divide-border">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between py-2 text-sm">
              <span className="text-ink">
                {it.qty}× {it.name}
              </span>
              <span className="font-medium text-ink tabular-nums">
                €{(it.lineTotalCents / 100).toFixed(2).replace(".", ",")}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-border pt-3 flex justify-between">
          <span className="font-semibold text-ink">Totale</span>
          <span className="font-bold text-bamboo tabular-nums text-lg">
            €{(order.total_cents / 100).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </div>
  );
}
