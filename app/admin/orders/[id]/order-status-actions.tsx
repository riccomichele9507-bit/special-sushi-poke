"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Bike, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { markOrderOutForFulfillment } from "@/app/actions/admin/order-status";

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

  // Già affidato/concluso → nessuna azione
  if (["in_delivery", "ready", "delivered", "cancelled", "refunded"].includes(currentStatus)) {
    return (
      <div className="rounded-xl border border-bamboo/20 bg-bamboo/5 p-4 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-bamboo mb-1" />
        <p className="text-sm font-medium text-ink">
          {currentStatus === "cancelled"
            ? "Ordine annullato."
            : currentStatus === "refunded"
              ? "Ordine rimborsato."
              : orderType === "delivery"
                ? "Affidato al rider. Cliente avvisato. ✅"
                : "Pronto al ritiro. Cliente avvisato. ✅"}
        </p>
      </div>
    );
  }

  // Unico step: ricevuto/confermato → affidato al rider / pronto al ritiro
  const Icon = orderType === "delivery" ? Bike : ShoppingBag;
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-warm-gray">Azione</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          handleAction(
            () => markOrderOutForFulfillment(orderId),
            orderType === "delivery"
              ? "Cliente avvisato: affidato al rider"
              : "Cliente avvisato: pronto al ritiro",
          )
        }
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-bamboo text-sm font-semibold text-paper transition hover:bg-bamboo-deep disabled:opacity-50 shadow-[0_2px_10px_-2px_rgba(90,122,100,0.4)]"
      >
        <Icon className="h-5 w-5" />
        {pending
          ? "Aggiornando…"
          : orderType === "delivery"
            ? "Affidato al rider"
            : "Pronto al ritiro"}
      </button>
    </div>
  );
}
