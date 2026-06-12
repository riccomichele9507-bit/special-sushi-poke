"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bike, ShoppingBag, CheckCircle2, ChefHat } from "lucide-react";
import { toast } from "sonner";
import {
  markOrderOutForFulfillment,
  markOrderDelivered,
  markOrderPreparing,
} from "@/app/actions/admin/order-status";

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

  if (["delivered", "cancelled", "refunded"].includes(status)) {
    return <span className="text-xs text-warm-gray">—</span>;
  }

  let label = "";
  let Icon: typeof Bike = Bike;
  let action: () => Promise<{ ok: boolean; error?: string }> = async () => ({
    ok: false,
  });
  let successMsg = "";

  if (["received", "confirmed"].includes(status)) {
    label = orderType === "delivery" ? "Affidato rider" : "Pronto ritiro";
    Icon = orderType === "delivery" ? Bike : ShoppingBag;
    action = () => markOrderOutForFulfillment(orderId);
    successMsg =
      orderType === "delivery"
        ? "Cliente avvisato: in consegna"
        : "Cliente avvisato: pronto al ritiro";
  } else if (status === "preparing") {
    label = orderType === "delivery" ? "Affidato rider" : "Pronto ritiro";
    Icon = orderType === "delivery" ? Bike : ShoppingBag;
    action = () => markOrderOutForFulfillment(orderId);
    successMsg =
      orderType === "delivery"
        ? "Cliente avvisato: in consegna"
        : "Cliente avvisato: pronto al ritiro";
  } else if (["in_delivery", "ready"].includes(status)) {
    label = orderType === "delivery" ? "Consegnato" : "Ritirato";
    Icon = CheckCircle2;
    action = () => markOrderDelivered(orderId);
    successMsg =
      orderType === "delivery" ? "Ordine consegnato!" : "Ordine ritirato!";
  } else {
    return <span className="text-xs text-warm-gray">—</span>;
  }

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
