"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";

/**
 * Svuota carrello + sconto + mancia al montaggio. Da usare sulle pagine di
 * conferma post-pagamento, così l'utente che rientra NON trova il carrello
 * pieno con l'ordine già fatto (il carrello si ripopola solo con "Riordina").
 */
export function ClearCartOnMount() {
  useEffect(() => {
    useCartStore.getState().clear();
    usePricing.getState().setTip(0);
  }, []);
  return null;
}
