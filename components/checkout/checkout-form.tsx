"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import {
  useCartStore,
  useCartCount,
  useCartHydrated,
  useCartTotal,
} from "@/store/cart-store";
import { OrderTypeToggle } from "./order-type-toggle";
import { PaymentMethodRadio } from "./payment-method-radio";
import {
  GoogleAddressAutocomplete,
  type AddressSelection,
} from "./google-address-autocomplete";
import { DeliveryQuoteBox } from "./delivery-quote-box";
import type { DeliveryQuoteResult, SlotOption } from "@/app/actions/delivery-quote";
import { createOrder } from "@/app/actions/orders";
import { quoteDiscountCode } from "@/app/actions/discount";
import { usePricing } from "@/lib/pricing-store";
import { TipSelector } from "@/components/cart/tip-selector";

const INPUT_CLASSES =
  "h-12 rounded-xl border-border bg-paper-warm/40 px-4 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper";
const LABEL_CLASSES =
  "font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-warm-gray";

interface CheckoutFormProps {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  defaultAddress?: {
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  } | null;
  /** True se l'utente NON è loggato (checkout come ospite). */
  isGuest?: boolean;
}

export function CheckoutForm({
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  defaultAddress = null,
  isGuest = false,
}: CheckoutFormProps = {}) {
  const router = useRouter();
  const clear = useCartStore((s) => s.clear);
  const count = useCartCount();
  const hydrated = useCartHydrated();
  const cartCents = useCartTotal();

  // Stato slot/coords sincronizzato col DeliveryQuoteBox.
  // Pre-inizializzato con l'ultimo indirizzo salvato del cliente (se presente),
  // così lo slot di consegna viene calcolato subito senza ridigitare l'indirizzo.
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    placeId?: string;
  } | null>(
    defaultAddress ? { lat: defaultAddress.lat, lng: defaultAddress.lng } : null,
  );
  const [formattedAddress, setFormattedAddress] = useState<string>(
    defaultAddress?.address ?? "",
  );
  const [quote, setQuote] = useState<DeliveryQuoteResult | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: "delivery",
      name: defaultName,
      phone: defaultPhone,
      email: defaultEmail,
      addressLine: defaultAddress?.address ?? "",
      addressNotes: defaultAddress?.notes ?? "",
      driverNotes: "",
      paymentMethod: "card",
      slotStartIso: "",
      slotEndIso: "",
      ...(defaultAddress
        ? { geo: { lat: defaultAddress.lat, lng: defaultAddress.lng } }
        : {}),
    } as CheckoutInput,
  });

  const orderType = watch("orderType");
  const paymentMethod = watch("paymentMethod");
  const addressLine = watch("addressLine");
  const isDelivery = orderType === "delivery";

  function handleAddressSelect(selection: AddressSelection | null) {
    if (selection) {
      setCoords({
        lat: selection.lat,
        lng: selection.lng,
        placeId: selection.placeId,
      });
      setFormattedAddress(selection.address);
      setValue("geo", { lat: selection.lat, lng: selection.lng }, { shouldValidate: true });
    } else {
      setCoords(null);
      setFormattedAddress("");
      setValue("geo", undefined as never, { shouldValidate: true });
    }
  }

  function handleSlotChange(slot: SlotOption | null, q: DeliveryQuoteResult | null) {
    setQuote(q);
    if (slot) {
      setValue("slotStartIso", slot.startIso, { shouldValidate: true });
      setValue("slotEndIso", slot.endIso, { shouldValidate: true });
    } else {
      setValue("slotStartIso", "", { shouldValidate: false });
      setValue("slotEndIso", "", { shouldValidate: false });
    }
  }

  // Slot selezionato corrente per le label CTA
  const selectedSlotEndIso = watch("slotEndIso");
  const selectedSlot = quote?.slots?.find((s) => s.endIso === selectedSlotEndIso);

  const cartItems = useCartStore((s) => s.items);
  const tipCents = usePricing((s) => s.tipCents);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // Codice sconto (feedback immediato; il server ricalcola comunque l'anti-tamper)
  const [discountCode, setDiscountCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function applyDiscountCode() {
    const code = discountCode.trim();
    if (!code) return;
    setCheckingCode(true);
    const r = await quoteDiscountCode(code, cartCents);
    setCheckingCode(false);
    if (r.ok) {
      const eur = `€${(r.discountCents / 100).toFixed(2).replace(".", ",")}`;
      setCodeFeedback({ ok: true, message: `Codice applicato: −${eur} di sconto` });
    } else {
      setCodeFeedback({ ok: false, message: r.message });
    }
  }

  // Chiave anti-doppione: stabile per questo tentativo di checkout, così un
  // doppio-tap / retry crea UN solo ordine (il server fa dedup su questa chiave).
  const idempotencyKeyRef = useRef<string>("");
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  async function onSubmit(data: CheckoutInput) {
    if (!quote?.ok || !selectedSlot) {
      toast.error("Slot di consegna non confermato. Aggiorna l'indirizzo.");
      return;
    }

    const result = await createOrder({
      idempotencyKey: idempotencyKeyRef.current,
      orderType: data.orderType,
      name: data.name,
      phone: data.phone,
      email: data.email,
      addressLine: data.orderType === "delivery" ? data.addressLine : undefined,
      addressNotes: data.orderType === "delivery" ? data.addressNotes : undefined,
      driverNotes: data.orderType === "delivery" ? data.driverNotes : undefined,
      paymentMethod: data.paymentMethod,
      slotStartIso: selectedSlot.startIso,
      slotEndIso: selectedSlot.endIso,
      geo:
        data.orderType === "delivery" && coords
          ? coords
          : undefined,
      items: cartItems,
      tipCents,
      marketingConsent,
      discountCode: discountCode.trim() || undefined,
    });

    if (!result.ok) {
      // Sessione scaduta o non loggato → redirect login con returnTo
      if (result.errorCode === "unauthenticated") {
        toast.error("Sessione scaduta", {
          description: "Accedi di nuovo per completare l'ordine.",
        });
        window.location.href = "/login?returnTo=/checkout";
        return;
      }
      toast.error("Ordine non inviato", {
        description: result.errorMessage,
      });
      return;
    }

    if (data.paymentMethod === "card") {
      // Embedded checkout: rimane sul nostro dominio, no redirect a stripe.com
      window.location.href = `/checkout/embedded-pay?orderId=${result.orderId}`;
      return;
    }

    // Svuotare il carrello PRIMA della navigazione per evitare race con re-render
    clear();
    toast.success("Ordine ricevuto!", {
      description:
        data.orderType === "delivery"
          ? `Consegna tra le ${selectedSlot.startHHmm} e le ${selectedSlot.endHHmm}.`
          : `Pronto al ritiro tra le ${selectedSlot.startHHmm} e le ${selectedSlot.endHHmm}.`,
    });
    // Ospite → pagina di ringraziamento pubblica (per id ordine, non sequenziale).
    // Registrato → tracking ordine nel profilo.
    window.location.href = isGuest
      ? `/checkout/grazie?id=${result.orderId}`
      : `/account/orders/${result.orderNumber}`;
  }

  const cartEmpty = hydrated && count === 0;
  const cannotSubmit =
    cartEmpty || isSubmitting || !quote?.ok || !selectedSlot;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-2xl bg-paper ring-1 ring-border p-5 sm:p-6 shadow-[0_4px_18px_-6px_rgba(28,28,28,0.06)]"
      noValidate
    >
      <Controller
        control={control}
        name="orderType"
        render={({ field }) => (
          <OrderTypeToggle
            value={field.value}
            onValueChange={(v) => {
              field.onChange(v);
              // Reset coords se passa a pickup
              if (v === "pickup") {
                setCoords(null);
                setFormattedAddress("");
                setValue("addressLine", "");
                setValue("geo", undefined as never);
              }
            }}
          />
        )}
      />

      {isDelivery && (
        <>
          <Controller
            control={control}
            name="addressLine"
            render={({ field }) => (
              <GoogleAddressAutocomplete
                id="addressLine"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onSelect={handleAddressSelect}
                hasError={!!errors.addressLine}
                errorMessage={errors.addressLine?.message}
                initiallyConfirmed={!!defaultAddress}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="addressNotes" className={LABEL_CLASSES}>
              Dettagli interno / scala / piano
            </Label>
            <Input
              id="addressNotes"
              {...register("addressNotes")}
              placeholder="Interno 3, scala B, citofono Rossi"
              aria-invalid={!!errors.addressNotes}
              className={cn(INPUT_CLASSES, errors.addressNotes && "border-sushi-red/60")}
            />
            {errors.addressNotes && (
              <p className="text-xs text-sushi-red">{errors.addressNotes.message}</p>
            )}
          </div>
        </>
      )}

      {/* Box slot Glovo: sempre visibile, mostra placeholder se delivery senza coords */}
      <DeliveryQuoteBox
        coords={coords}
        formattedAddress={formattedAddress}
        cartCents={cartCents}
        orderType={orderType}
        onSlotChange={handleSlotChange}
      />

      <div className="space-y-2">
        <Label htmlFor="name" className={LABEL_CLASSES}>
          Nome e cognome
        </Label>
        <Input
          id="name"
          {...register("name")}
          autoComplete="name"
          placeholder="Mario Rossi"
          aria-invalid={!!errors.name}
          className={cn(INPUT_CLASSES, errors.name && "border-sushi-red/60")}
        />
        {errors.name && (
          <p className="text-xs text-sushi-red">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className={LABEL_CLASSES}>
            Telefono
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            {...register("phone")}
            autoComplete="tel"
            placeholder="333 1234567"
            aria-invalid={!!errors.phone}
            className={cn(INPUT_CLASSES, errors.phone && "border-sushi-red/60")}
          />
          {errors.phone && (
            <p className="text-xs text-sushi-red">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={LABEL_CLASSES}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            {...register("email")}
            autoComplete="email"
            placeholder="mario@example.it"
            aria-invalid={!!errors.email}
            className={cn(INPUT_CLASSES, errors.email && "border-sushi-red/60")}
          />
          {errors.email && (
            <p className="text-xs text-sushi-red">{errors.email.message}</p>
          )}
        </div>
      </div>

      {isDelivery && (
        <div className="space-y-2">
          <Label htmlFor="driverNotes" className={LABEL_CLASSES}>
            Note per il rider
            <span className="ml-1 normal-case tracking-normal text-warm-gray/60">
              — opzionale
            </span>
          </Label>
          <Textarea
            id="driverNotes"
            {...register("driverNotes")}
            rows={3}
            placeholder="Es. citofono rotto, suona al 2° piano · senza sesamo · niente glutine"
            className="min-h-[88px] rounded-xl border-border bg-paper-warm/40 px-4 py-3 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper"
          />
          {errors.driverNotes && (
            <p className="text-xs text-sushi-red">{errors.driverNotes.message}</p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <p className={LABEL_CLASSES}>Mancia per lo staff</p>
        <TipSelector />
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="discountCode" className={LABEL_CLASSES}>
          Codice sconto
          <span className="ml-1 normal-case tracking-normal text-warm-gray/60">
            — opzionale
          </span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="discountCode"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setCodeFeedback(null);
            }}
            placeholder="Es. BENTORNATO10"
            autoCapitalize="characters"
            autoComplete="off"
            className={cn(INPUT_CLASSES, "flex-1 uppercase placeholder:normal-case")}
          />
          <button
            type="button"
            onClick={applyDiscountCode}
            disabled={checkingCode || !discountCode.trim()}
            className="h-12 shrink-0 rounded-xl border border-bamboo/50 px-5 text-sm font-semibold text-bamboo transition hover:bg-bamboo/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checkingCode ? "…" : "Applica"}
          </button>
        </div>
        {codeFeedback && (
          <p
            className={cn(
              "text-xs",
              codeFeedback.ok ? "text-bamboo" : "text-sushi-red",
            )}
          >
            {codeFeedback.message}
          </p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <p className={LABEL_CLASSES}>Metodo di pagamento</p>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <PaymentMethodRadio
              value={field.value}
              onValueChange={field.onChange}
              orderType={orderType}
            />
          )}
        />
      </div>

      {/* Consenso marketing GDPR */}
      <label className="flex items-start gap-3 rounded-xl border border-border bg-paper-warm/30 p-3 cursor-pointer hover:bg-paper-warm/60 transition">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-warm-gray text-bamboo focus:ring-bamboo cursor-pointer"
        />
        <div className="text-xs">
          <p className="font-medium text-ink">
            Voglio ricevere offerte e novità via email
          </p>
          <p className="mt-0.5 text-warm-gray">
            Promo, nuovi piatti, sconti compleanno. Niente spam. Puoi disiscriverti quando vuoi.
          </p>
        </div>
      </label>

      <button
        type="submit"
        disabled={cannotSubmit}
        className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bamboo px-6 font-sans text-sm font-semibold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep hover:shadow-[0_8px_28px_-6px_rgba(90,122,100,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
      >
        {isSubmitting
          ? "Invio in corso…"
          : cartEmpty
            ? "Il carrello è vuoto"
            : !quote?.ok || !selectedSlot
              ? isDelivery && !coords
                ? "Inserisci l'indirizzo per procedere"
                : "Scegli un orario di consegna"
              : paymentMethod === "card"
                ? `Vai al pagamento · ${selectedSlot.startHHmm}–${selectedSlot.endHHmm}`
                : `Conferma · ${selectedSlot.startHHmm}–${selectedSlot.endHHmm}`}
        {!isSubmitting && !cannotSubmit && (
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        )}
      </button>

      <p className="text-center text-[11px] text-warm-gray">
        {paymentMethod === "card"
          ? "Pagamento sicuro tramite Stripe."
          : isDelivery
            ? "Paghi alla consegna, in contanti al rider."
            : "Paghi al ritiro, in contanti al banco."}
      </p>
    </form>
  );
}
