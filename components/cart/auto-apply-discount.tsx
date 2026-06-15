"use client";

// Applica automaticamente uno sconto passato via URL (?code=SUSHI10), es. dal
// QR del volantino. Il cliente inquadra → atterra su /menu → lo sconto è già nel
// carrello, senza digitare nulla. Il totale resta comunque ricalcolato e
// rivalidato server-side in createOrder (anti-tamper).

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePricing } from "@/lib/pricing-store";
import { useCartTotal } from "@/store/cart-store";
import { checkDiscountCode } from "@/app/actions/discount";

export function AutoApplyDiscount() {
  const setDiscount = usePricing((s) => s.setDiscount);
  const existing = usePricing((s) => s.discount);
  const subtotal = useCartTotal();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("code");
    if (!raw) return;
    done.current = true;

    // Pulisci subito il parametro dall'URL (no re-toast al refresh, link pulito)
    params.delete("code");
    const qs = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash,
    );

    if (existing) return; // non sovrascrivere un codice già applicato

    const code = raw.trim().toUpperCase();
    (async () => {
      const r = await checkDiscountCode(code, subtotal);
      if (r.ok) {
        setDiscount({ code: r.code, kind: r.kind, value: r.value, label: r.label });
        toast.success(`Sconto ${r.code} applicato! 🎉`, {
          description: "Lo trovi già nel carrello al momento dell'ordine.",
          duration: 3500,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
