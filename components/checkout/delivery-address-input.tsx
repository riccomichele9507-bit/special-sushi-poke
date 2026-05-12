"use client";

import { useState } from "react";
import { MapPin, Loader2, ExternalLink, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { restaurant } from "@/data/restaurant";

interface Props {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  onGeoChange?: (geo: { lat: number; lng: number } | undefined) => void;
  hasError?: boolean;
  errorMessage?: string;
}

type GeoStatus = "idle" | "loading" | "success" | "error";

export function DeliveryAddressInput({
  id = "addressLine",
  value,
  onValueChange,
  onGeoChange,
  hasError,
  errorMessage,
}: Props) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setGeoCoords(coords);
        setGeoStatus("success");
        onGeoChange?.(coords);
        if (!value.trim()) {
          onValueChange(`📍 Posizione GPS — ${coords.lat}, ${coords.lng}`);
        }
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const mapsCheckUrl = value
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-warm-gray">
          Indirizzo di consegna
        </Label>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoStatus === "loading"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
            geoStatus === "success"
              ? "bg-bamboo/15 text-bamboo-deep ring-1 ring-bamboo/30"
              : "bg-paper-warm/60 text-warm-gray ring-1 ring-border hover:bg-paper-warm hover:text-ink",
          )}
        >
          {geoStatus === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : geoStatus === "success" ? (
            <Check className="h-3 w-3" />
          ) : (
            <MapPin className="h-3 w-3" />
          )}
          {geoStatus === "success" ? "Posizione rilevata" : "Usa la mia posizione"}
        </button>
      </div>

      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Via Roma 12, 70124 Bari"
        autoComplete="street-address"
        aria-invalid={!!hasError}
        className={cn(
          "h-12 rounded-xl border-border bg-paper-warm/40 px-4 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper",
          hasError && "border-sushi-red/60",
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <p className="text-warm-gray">
          Consegniamo entro <span className="font-semibold text-bamboo">{restaurant.deliveryRadiusKm} km</span> dal locale
        </p>
        {mapsCheckUrl && (
          <a
            href={mapsCheckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-bamboo transition hover:text-bamboo-deep"
          >
            Verifica su Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {geoStatus === "error" && (
        <p className="text-xs text-sushi-red">
          Impossibile rilevare la posizione. Scrivi l&apos;indirizzo a mano.
        </p>
      )}

      {hasError && errorMessage && (
        <p className="text-xs text-sushi-red">{errorMessage}</p>
      )}

      {geoCoords && geoStatus === "success" && (
        <p className="text-xs text-bamboo">
          Coordinate: {geoCoords.lat}, {geoCoords.lng}
        </p>
      )}
    </div>
  );
}
