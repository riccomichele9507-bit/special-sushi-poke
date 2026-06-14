"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bike, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { markOrderOutForFulfillment } from "@/app/actions/admin/order-status";

interface Props {
  orderId: string;
  status: string;
  orderType: "delivery" | "pickup";
}

/**
 * Bottone "smart 1-click" che compare nella riga della lista ordini admin.
 * Mostra l'azione contestuale al prossimo step possibile dello status.
 * Niente bottone se ordine già consegnato/cancellato.
 */
export function QuickActionButton({ orderId, status, orderType }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Azionabile solo da ricevuto/confermato → affidato al rider / pronto al ritiro.
  if (!["received", "confirmed", "preparing"].includes(status)) {
    return <span className="text-xs text-warm-gray">—</span>;
  }

  const label = orderType === "delivery" ? "Affidato rider" : "Pronto ritiro";
  const Icon = orderType === "delivery" ? Bike : ShoppingBag;
  const action = () => markOrderOutForFulfillment(orderId);
  const successMsg =
    orderType === "delivery"
      ? "Cliente avvisato: affidato al rider"
      : "Cliente avvisato: pronto al ritiro";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        startTransition(async () => {
          const r = await action();
          if (r.ok) {
            toast.success(successMsg);
            router.refresh();
          } else {
            toast.error(r.error ?? "Errore");
          }
        });
      }}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full bg-bamboo px-2.5 py-1 text-[11px] font-semibold text-paper hover:bg-bamboo-deep disabled:opacity-50 whitespace-nowrap"
    >
      <Icon className="h-3 w-3" />
      {pending ? "..." : label}
    </button>
  );
}
