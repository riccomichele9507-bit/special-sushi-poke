"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock, CheckCircle2, XCircle, Truck, MapPin } from "lucide-react";
import {
  getDeliveryQuote,
  type DeliveryQuoteResult,
} from "@/app/actions/delivery-quote";

interface Props {
  /** Coords selezionate (da autocomplete). null = nessun indirizzo confermato. */
  coords: { lat: number; lng: number } | null;
  /** Indirizzo formattato (da autocomplete) — passato al quote per coerenza display. */
  formattedAddress?: string;
  /** Totale carrello in centesimi per check minimo €30. */
  cartCents: number;
  /** Tipo ordine. */
  orderType: "delivery" | "pickup";
  /** Callback quando lo slot cambia (per salvare ISO nel form). */
  onQuoteChange?: (quote: DeliveryQuoteResult | null) => void;
}

const REFRESH_INTERVAL_MS = 60_000; // 60s

export function DeliveryQuoteBox({
  coords,
  formattedAddress,
  cartCents,
  orderType,
  onQuoteChange,
}: Props) {
  const [quote, setQuote] = useState<DeliveryQuoteResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Determina se è il momento di chiamare (delivery richiede coords, pickup no)
  const shouldFetch = orderType === "pickup" || (orderType === "delivery" && !!coords);

  // Fetch iniziale + ogni volta che cambiano gli input
  useEffect(() => {
    if (!shouldFetch) {
      setQuote(null);
      onQuoteChange?.(null);
      return;
    }
    startTransition(async () => {
      const r = await getDeliveryQuote({
        coords: coords ?? undefined,
        formattedAddress,
        cartTotalCents: cartCents,
        orderType,
      });
      setQuote(r);
      onQuoteChange?.(r);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldFetch,
    coords?.lat,
    coords?.lng,
    cartCents,
    orderType,
    formattedAddress,
  ]);

  // Refresh periodico per aggiornare lo slot in base all'ora corrente
  useEffect(() => {
    if (!shouldFetch || !quote?.ok) return;
    const id = setInterval(() => {
      startTransition(async () => {
        const r = await getDeliveryQuote({
          coords: coords ?? undefined,
          formattedAddress,
          cartTotalCents: cartCents,
          orderType,
        });
        setQuote(r);
        onQuoteChange?.(r);
      });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, quote?.ok, coords?.lat, coords?.lng, cartCents, orderType]);

  // Stato 1: nessuna richiesta ancora (delivery senza coords)
  if (!shouldFetch) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-paper-warm/30 p-4 text-center">
        <MapPin className="mx-auto mb-1 h-5 w-5 text-warm-gray/60" />
        <p className="text-sm text-warm-gray">
          Inserisci l&apos;indirizzo per calcolare lo slot di consegna.
        </p>
      </div>
    );
  }

  // Stato 2: loading iniziale
  if (pending && !quote) {
    return (
      <div className="animate-pulse rounded-2xl border border-border bg-paper-warm/40 p-4">
        <div className="mb-2 h-3 w-1/3 rounded bg-border" />
        <div className="h-8 w-2/3 rounded bg-border" />
      </div>
    );
  }

  // Stato 3: error
  if (quote && !quote.ok) {
    return (
      <div className="rounded-2xl border border-sushi-red/40 bg-sushi-red/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-sushi-red" />
          <p className="font-semibold text-sushi-red">
            {orderType === "delivery" ? "Consegna non possibile" : "Ritiro non disponibile"}
          </p>
        </div>
        <p className="text-sm text-ink">{quote.errorMessage}</p>
        {quote.formattedAddress && (
          <p className="flex items-start gap-1.5 text-xs text-warm-gray">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{quote.formattedAddress}</span>
          </p>
        )}
      </div>
    );
  }

  // Stato 4: success
  if (quote && quote.ok) {
    return (
      <div className="rounded-2xl border border-bamboo/40 bg-bamboo/5 p-4 space-y-3 relative">
        {pending && (
          <span className="absolute right-3 top-3 text-[10px] uppercase tracking-wider text-bamboo/60">
            aggiornando…
          </span>
        )}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-bamboo" />
          <p className="font-semibold text-bamboo">
            {orderType === "delivery"
              ? "Consegniamo nella tua zona"
              : "Pronto al ritiro"}
          </p>
        </div>

        {orderType === "delivery" && quote.formattedAddress && (
          <p className="flex items-start gap-1.5 text-xs text-warm-gray">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{quote.formattedAddress}</span>
          </p>
        )}

        <div className="border-t border-bamboo/20 pt-3">
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-warm-gray">
            <Clock className="h-3 w-3" />
            {orderType === "delivery" ? "Consegna stimata" : "Pronto al ritiro"}
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            Tra le <span className="text-bamboo">{quote.slotStart}</span> e le{" "}
            <span className="text-bamboo">{quote.slotEnd}</span>
          </p>
        </div>

        {orderType === "delivery" && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-gray">
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {quote.distanceKm?.toFixed(1)} km
            </span>
            <span className="font-medium text-bamboo">
              {quote.freeDelivery
                ? "Consegna gratuita"
                : `Minimo €${((quote.minCartCents ?? 0) / 100).toFixed(0)}`}
            </span>
            <span>
              servizio {quote.service === "lunch" ? "pranzo" : "cena"}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
