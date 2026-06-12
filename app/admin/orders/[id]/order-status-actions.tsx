"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Truck, Bike, ShoppingBag, ChefHat } from "lucide-react";
import { toast } from "sonner";
import {
  markOrderOutForFulfillment,
  markOrderDelivered,
  markOrderPreparing,
} from "@/app/actions/admin/order-status";

interface Props {
  orderId: string;
  currentStatus: string;
  orderType: "delivery" | "pickup";
}

/**
 * Pannello azioni Smart 1-click sul dettaglio ordine admin.
 * Mostra SOLO i bottoni rilevanti per lo stato corrente.
 */
export function OrderStatusActions({ orderId, currentStatus, orderType }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMsg: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(result.error ?? "Errore");
      }
    });
  }

  // Stati finali / non-azionabili
  if (["delivered", "cancelled", "refunded"].includes(currentStatus)) {
    return (
      <div className="rounded-xl border border-bamboo/20 bg-bamboo/5 p-4 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-bamboo mb-1" />
        <p className="text-sm font-medium text-ink">
          Ordine{" "}
          {currentStatus === "delivered"
            ? orderType === "pickup"
              ? "ritirato"
              : "consegnato"
            : currentStatus}
          .
        </p>
      </div>
    );
  }

  const buttons: Array<{
    label: string;
    icon: typeof Truck;
    color: "primary" | "secondary";
    action: () => void;
    show: boolean;
  }> = [
    {
      label: "Inizio preparazione",
      icon: ChefHat,
      color: "secondary",
      show: ["received", "confirmed"].includes(currentStatus),
      action: () =>
        handleAction(
          () => markOrderPreparing(orderId),
          "Status: In preparazione",
        ),
    },
    {
      label: orderType === "delivery" ? "Affidato al rider" : "Pronto al ritiro",
      icon: orderType === "delivery" ? Bike : ShoppingBag,
      color: "primary",
      show: ["received", "confirmed", "preparing"].includes(currentStatus),
      action: () =>
        handleAction(
          () => markOrderOutForFulfillment(orderId),
          orderType === "delivery"
            ? "Cliente avvisato: in consegna"
            : "Cliente avvisato: pronto al ritiro",
        ),
    },
    {
      label: orderType === "delivery" ? "Consegnato" : "Ritirato",
      icon: CheckCircle2,
      color: "primary",
      show: ["in_delivery", "ready"].includes(currentStatus),
      action: () =>
        handleAction(
          () => markOrderDelivered(orderId),
          orderType === "delivery" ? "Ordine consegnato!" : "Ordine ritirato!",
        ),
    },
  ];

  const visible = buttons.filter((b) => b.show);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-warm-gray">
        Azioni rapide
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((b, i) => {
          const Icon = b.icon;
          const isPrimary = b.color === "primary";
          return (
            <button
              key={i}
              type="button"
              onClick={b.action}
              disabled={pending}
              className={`inline-flex h-14 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                isPrimary
                  ? "bg-bamboo text-paper hover:bg-bamboo-deep shadow-[0_2px_10px_-2px_rgba(90,122,100,0.4)]"
                  : "border border-bamboo/30 bg-paper text-bamboo hover:bg-bamboo/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              {pending ? "Aggiornando…" : b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
