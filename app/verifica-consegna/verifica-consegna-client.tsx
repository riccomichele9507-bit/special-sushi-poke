"use client";

import { useState, useTransition } from "react";
import { MapPin, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";
import { getDeliveryQuote, type DeliveryQuoteResult } from "@/app/actions/delivery-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerificaConsegnaClient() {
  const [address, setAddress] = useState("");
  const [cartEuro, setCartEuro] = useState("");
  const [result, setResult] = useState<DeliveryQuoteResult | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const cartCents = Math.round(parseFloat(cartEuro || "0") * 100);
    startTransition(async () => {
      const r = await getDeliveryQuote({
        address,
        cartTotalCents: isNaN(cartCents) ? 0 : cartCents,
        orderType: "delivery",
      });
      setResult(r);
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="address">Indirizzo di consegna</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="es. Via Sparano 10, Bari"
            disabled={pending}
            required
            minLength={5}
            autoComplete="street-address"
          />
          <p className="text-xs text-warm-gray">
            Più completo è (via + civico + città), più preciso è il calcolo.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cart">Importo carrello (€) — opzionale</Label>
          <Input
            id="cart"
            type="number"
            min="0"
            step="0.01"
            value={cartEuro}
            onChange={(e) => setCartEuro(e.target.value)}
            placeholder="0.00"
            disabled={pending}
          />
          <p className="text-xs text-warm-gray">
            Se sei oltre i 6 km serve un minimo di €30 per consegnare.
          </p>
        </div>

        <Button
          type="submit"
          disabled={pending || address.trim().length < 5}
          className="w-full bg-bamboo hover:bg-bamboo/90 text-paper"
        >
          {pending ? "Verifica in corso…" : "Verifica"}
        </Button>
      </form>

      {result && <QuoteResultCard result={result} />}

      {/* Box informativo regole */}
      <div className="rounded-lg border border-bamboo/20 bg-bamboo/5 p-4 text-sm text-warm-gray space-y-1">
        <p className="font-semibold text-ink">Come funzionano le consegne</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>Entro <strong>6 km</strong>: consegna <strong>gratuita</strong>, nessun minimo d&apos;ordine.</li>
          <li>Tra <strong>6 e 12 km</strong>: gratuita ma minimo carrello <strong>€30</strong>.</li>
          <li>Oltre <strong>12 km</strong>: purtroppo non consegniamo.</li>
        </ul>
      </div>
    </div>
  );
}

function QuoteResultCard({ result }: { result: DeliveryQuoteResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-lg border border-sushi-red/30 bg-sushi-red/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-sushi-red" />
          <p className="font-semibold text-sushi-red">Consegna non possibile</p>
        </div>
        <p className="text-sm text-ink">{result.errorMessage}</p>
        {result.formattedAddress && (
          <p className="text-xs text-warm-gray flex items-start gap-1.5">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{result.formattedAddress}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-bamboo/40 bg-bamboo/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-bamboo" />
        <p className="font-semibold text-bamboo">Consegniamo nella tua zona ✓</p>
      </div>

      {result.formattedAddress && (
        <p className="text-xs text-warm-gray flex items-start gap-1.5">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{result.formattedAddress}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <p className="text-xs uppercase tracking-wider text-warm-gray">Distanza</p>
          <p className="text-lg font-semibold text-ink">
            {result.distanceKm?.toFixed(1)} km
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-warm-gray">Costo</p>
          <p className="text-lg font-semibold text-bamboo">
            {result.freeDelivery
              ? "Gratis"
              : `Min €${(result.minCartCents! / 100).toFixed(0)}`}
          </p>
        </div>
      </div>

      <div className="border-t border-bamboo/20 pt-3 space-y-1">
        <p className="text-xs uppercase tracking-wider text-warm-gray flex items-center gap-1">
          <Clock className="h-3 w-3" /> Consegna stimata
        </p>
        <p className="text-2xl font-serif-jp text-ink">
          Tra le <span className="text-bamboo">{result.slotStart}</span> e le{" "}
          <span className="text-bamboo">{result.slotEnd}</span>
        </p>
        <p className="text-xs text-warm-gray flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Servizio:{" "}
          <span className="font-medium">
            {result.service === "lunch" ? "Pranzo" : "Cena"}
          </span>
          {" · "}~{result.etaMinutes} min dall&apos;ordine
        </p>
      </div>
    </div>
  );
}
