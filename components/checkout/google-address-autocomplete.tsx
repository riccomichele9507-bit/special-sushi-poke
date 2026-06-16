"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AddressSelection {
  address: string; // formatted_address
  lat: number;
  lng: number;
  /** Google Place ID, per navigazione precisa dallo scontrino (QR). */
  placeId?: string;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface Props {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (selection: AddressSelection | null) => void;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
  placeholder?: string;
  /** Se true, parte già "confermato" (indirizzo precompilato): non rifetcha i suggerimenti. */
  initiallyConfirmed?: boolean;
}

const DEBOUNCE_MS = 300;
const MIN_INPUT = 3;

export function GoogleAddressAutocomplete({
  id = "addressLine",
  value,
  onValueChange,
  onSelect,
  hasError,
  errorMessage,
  label = "Indirizzo di consegna",
  placeholder = "Inizia a scrivere via, civico, città…",
  initiallyConfirmed = false,
}: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);

  // Session token Google: stesso per tutto il typing + select finale
  const sessionTokenRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Init session token
  useEffect(() => {
    sessionTokenRef.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
  }, []);

  // Click outside chiude dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Se il valore corrente è esattamente quello confermato, non rifetch
    if (confirmed) return;

    const trimmed = value.trim();
    if (trimmed.length < MIN_INPUT) {
      setPredictions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/places-autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: trimmed,
            sessionToken: sessionTokenRef.current,
          }),
        });
        const data = (await res.json()) as { predictions?: Prediction[] };
        setPredictions(data.predictions ?? []);
        setIsOpen(true);
      } catch (e) {
        console.error("autocomplete error", e);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, confirmed]);

  async function handleSelect(p: Prediction) {
    setIsOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/place-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: p.placeId,
          sessionToken: sessionTokenRef.current,
        }),
      });
      if (!res.ok) throw new Error("details failed");
      const data = (await res.json()) as {
        formattedAddress: string;
        lat: number;
        lng: number;
      };
      onValueChange(data.formattedAddress);
      onSelect({
        address: data.formattedAddress,
        lat: data.lat,
        lng: data.lng,
        placeId: p.placeId,
      });
      setConfirmed(true);
      // Nuovo session token per la prossima ricerca
      sessionTokenRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
    } catch (e) {
      console.error("place details error", e);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    onValueChange("");
    onSelect(null);
    setPredictions([]);
    setConfirmed(false);
    setIsOpen(false);
  }

  function handleChange(v: string) {
    onValueChange(v);
    if (confirmed) {
      // Se l'utente modifica dopo aver confermato, invalida la selezione
      setConfirmed(false);
      onSelect(null);
    }
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label
        htmlFor={id}
        className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-warm-gray"
      >
        {label}
      </Label>

      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray/60"
          strokeWidth={1.75}
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!!hasError}
          className={cn(
            "h-12 rounded-xl border-border bg-paper-warm/40 pl-10 pr-10 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper",
            hasError && "border-sushi-red/60",
            confirmed && "border-bamboo/40 bg-bamboo/5",
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-bamboo" />
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Cancella indirizzo"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-warm-gray hover:bg-paper-warm hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-border bg-paper py-1 shadow-lg ring-1 ring-black/5"
        >
          {predictions.map((p) => (
            <li key={p.placeId} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => handleSelect(p)}
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-paper-warm/60"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bamboo" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.mainText}</p>
                  {p.secondaryText && (
                    <p className="truncate text-xs text-warm-gray">{p.secondaryText}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasError && errorMessage && (
        <p className="text-xs text-sushi-red">{errorMessage}</p>
      )}

      {!confirmed && value.length >= MIN_INPUT && (
        <p className="text-[11px] text-warm-gray">
          Seleziona uno dei suggerimenti per confermare l&apos;indirizzo.
        </p>
      )}
    </div>
  );
}
