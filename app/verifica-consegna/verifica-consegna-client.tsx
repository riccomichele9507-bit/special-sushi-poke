"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GoogleAddressAutocomplete,
  type AddressSelection,
} from "@/components/checkout/google-address-autocomplete";
import { DeliveryQuoteBox } from "@/components/checkout/delivery-quote-box";

export function VerificaConsegnaClient() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");
  const [cartEuro, setCartEuro] = useState("");

  const cartCents = (() => {
    const n = parseFloat(cartEuro || "0");
    return isNaN(n) ? 0 : Math.round(n * 100);
  })();

  function handleSelect(selection: AddressSelection | null) {
    if (selection) {
      setCoords({ lat: selection.lat, lng: selection.lng });
      setFormattedAddress(selection.address);
    } else {
      setCoords(null);
      setFormattedAddress("");
    }
  }

  return (
    <div className="space-y-6">
      <GoogleAddressAutocomplete
        value={address}
        onValueChange={setAddress}
        onSelect={handleSelect}
        label="Il tuo indirizzo di consegna"
        placeholder="Inizia a scrivere: via, civico, città…"
      />

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
        />
        <p className="text-xs text-warm-gray">
          Oltre 6 km serve un minimo di €30 per consegnare.
        </p>
      </div>

      <DeliveryQuoteBox
        coords={coords}
        formattedAddress={formattedAddress}
        cartCents={cartCents}
        orderType="delivery"
      />

      {/* Box informativo regole */}
      <div className="rounded-lg border border-bamboo/20 bg-bamboo/5 p-4 text-sm text-warm-gray space-y-1">
        <p className="font-semibold text-ink">Come funzionano le consegne</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>
            Entro <strong>6 km</strong>: consegna <strong>gratuita</strong>, nessun minimo.
          </li>
          <li>
            Tra <strong>6 e 12 km</strong>: gratuita ma minimo carrello <strong>€30</strong>.
          </li>
          <li>
            Oltre <strong>12 km</strong>: purtroppo non consegniamo.
          </li>
        </ul>
      </div>
    </div>
  );
}
