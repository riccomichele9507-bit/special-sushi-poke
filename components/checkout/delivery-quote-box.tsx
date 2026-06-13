"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock, CheckCircle2, XCircle, Truck, MapPin, Moon } from "lucide-react";
import {
  getDeliveryQuote,
  type DeliveryQuoteResult,
  type SlotOption,
} from "@/app/actions/delivery-quote";
import { cn } from "@/lib/utils";

interface Props {
  /** Coords selezionate (da autocomplete). null = nessun indirizzo confermato. */
  coords: { lat: number; lng: number } | null;
  /** Indirizzo formattato (da autocomplete) — passato al quote per coerenza display. */
  formattedAddress?: string;
  /** Totale carrello in centesimi per check minimo €30. */
  cartCents: number;
  /** Tipo ordine. */
  orderType: "delivery" | "pickup";
  /** Callback quando lo slot selezionato cambia (per salvare ISO nel form). */
  onSlotChange?: (slot: SlotOption | null, quote: DeliveryQuoteResult | null) => void;
}

const REFRESH_INTERVAL_MS = 60_000;

/** Frase amichevole per il pre-ordine: "stasera", "oggi a pranzo", "domani a cena"... */
function preorderPhrase(
  service: "lunch" | "dinner" | undefined,
  dayLabel: string | undefined,
): string {
  const meal = service === "dinner" ? "cena" : "pranzo";
  if (dayLabel === "oggi") return service === "dinner" ? "stasera" : "oggi a pranzo";
  if (dayLabel) return `${dayLabel} a ${meal}`;
  return `il prossimo servizio (${meal})`;
}

export function DeliveryQuoteBox({
  coords,
  formattedAddress,
  cartCents,
  orderType,
  onSlotChange,
}: Props) {
  const [quote, setQuote] = useState<DeliveryQuoteResult | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shouldFetch =
    orderType === "pickup" || (orderType === "delivery" && !!coords);

  // Fetch al cambio input
  useEffect(() => {
    if (!shouldFetch) {
      setQuote(null);
      setSelectedIso(null);
      onSlotChange?.(null, null);
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
      if (r.ok && r.slots && r.slots.length > 0) {
        const defaultSlot = r.slots[r.defaultSlotIndex ?? 0];
        setSelectedIso(defaultSlot.endIso);
        onSlotChange?.(defaultSlot, r);
      } else {
        setSelectedIso(null);
        onSlotChange?.(null, r);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, coords?.lat, coords?.lng, cartCents, orderType, formattedAddress]);

  // Refresh periodico
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
        if (r.ok && r.slots && r.slots.length > 0) {
          // Se lo slot selezionato è ancora nella lista nuova → mantienilo.
          // Altrimenti reset al default (prima disponibile).
          const stillAvailable = r.slots.find((s) => s.endIso === selectedIso);
          const chosen = stillAvailable ?? r.slots[r.defaultSlotIndex ?? 0];
          setSelectedIso(chosen.endIso);
          onSlotChange?.(chosen, r);
        }
      });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, quote?.ok, coords?.lat, coords?.lng, cartCents, orderType, selectedIso]);

  function handleSelect(slot: SlotOption) {
    setSelectedIso(slot.endIso);
    onSlotChange?.(slot, quote);
  }

  // Stato 1: nessuna richiesta ancora (delivery senza coords)
  if (!shouldFetch) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-paper-warm/30 p-4 text-center">
        <MapPin className="mx-auto mb-1 h-5 w-5 text-warm-gray/60" />
        <p className="text-sm text-warm-gray">
          Inserisci l&apos;indirizzo per vedere gli orari di consegna disponibili.
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
            {orderType === "delivery"
              ? "Consegna non possibile"
              : "Ritiro non disponibile"}
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

  // Stato 4: success con slot picker
  if (quote && quote.ok && quote.slots && quote.slots.length > 0) {
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
              : "Ritiro disponibile"}
          </p>
        </div>

        {quote.isPreorder && (
          <div className="flex items-start gap-2 rounded-xl bg-gold/10 px-3 py-2.5 ring-1 ring-gold/30">
            <Moon className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
            <p className="text-xs text-ink">
              <span className="font-semibold">Adesso siamo chiusi.</span>{" "}
              Puoi pre-ordinare per{" "}
              <span className="font-semibold">{preorderPhrase(quote.service, quote.dayLabel)}</span>
              : scegli una fascia qui sotto, prepariamo all&apos;apertura.
            </p>
          </div>
        )}

        {orderType === "delivery" && quote.formattedAddress && (
          <p className="flex items-start gap-1.5 text-xs text-warm-gray">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{quote.formattedAddress}</span>
          </p>
        )}

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
            <span>servizio {quote.service === "lunch" ? "pranzo" : "cena"}</span>
          </div>
        )}

        <div className="border-t border-bamboo/20 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-warm-gray">
              <Clock className="h-3 w-3" />
              {orderType === "delivery"
                ? "Scegli quando ricevere"
                : "Scegli quando ritirare"}
            </p>
            {quote.dayLabel && quote.dayLabel !== "oggi" && (
              <span className="rounded-full bg-bamboo/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bamboo-deep">
                {quote.dayLabel}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quote.slots.map((slot, idx) => {
              const isSelected = slot.endIso === selectedIso;
              const isFirst = idx === (quote.defaultSlotIndex ?? 0);
              return (
                <button
                  key={slot.endIso}
                  type="button"
                  onClick={() => handleSelect(slot)}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative rounded-xl border px-2 py-2.5 text-center text-sm transition",
                    isSelected
                      ? "border-bamboo bg-bamboo text-paper shadow-[0_2px_8px_-2px_rgba(90,122,100,0.4)]"
                      : "border-border bg-paper hover:border-bamboo/60 hover:bg-bamboo/5",
                  )}
                >
                  <div className={cn("font-semibold tabular-nums", isSelected ? "text-paper" : "text-ink")}>
                    {slot.startHHmm} – {slot.endHHmm}
                  </div>
                  {isFirst && (
                    <div
                      className={cn(
                        "text-[9px] uppercase tracking-wider mt-0.5",
                        isSelected ? "text-paper/80" : "text-bamboo",
                      )}
                    >
                      Il prima possibile
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-warm-gray">
            {quote.slots.length} {quote.slots.length === 1 ? "fascia" : "fasce"} disponibili
            {quote.isPreorder && " — pre-ordine"}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
