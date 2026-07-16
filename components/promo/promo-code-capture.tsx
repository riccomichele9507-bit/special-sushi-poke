"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";

/**
 * Cattura il codice sconto dall'URL (?code=…) — es. il QR del volantino Glovo
 * che porta a /menu?code=SUSHI10 — e lo salva nel cart-store (persistito), così
 * viene pre-applicato in automatico al checkout. Nessuna UI propria: solo un
 * toast di conferma. DEVE stare dentro un <Suspense> perché usa useSearchParams
 * (Next 16: altrimenti l'intero albero esce dal prerendering).
 */
export function PromoCodeCapture() {
  const searchParams = useSearchParams();
  const setPendingCode = useCartStore((s) => s.setPendingCode);
  // Evita di ri-processare/ri-notificare lo stesso codice a ogni re-render.
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get("code");
    if (!raw) return;
    // Sanitizza: solo alfanumerici, maiuscolo, max 24 caratteri.
    const code = raw
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 24);
    if (!code || handledRef.current === code) return;
    handledRef.current = code;
    setPendingCode(code);
    toast.success(`Codice ${code} attivo`, {
      description: "Lo sconto si applica al checkout. Iscriviti e ordina dal sito.",
    });
  }, [searchParams, setPendingCode]);

  return null;
}
