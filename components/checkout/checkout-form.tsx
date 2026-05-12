"use client";

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
import { useCartStore, useCartCount, useCartHydrated } from "@/store/cart-store";
import { PickupTimeSelect } from "./pickup-time-select";
import { OrderTypeToggle } from "./order-type-toggle";
import { DeliveryAddressInput } from "./delivery-address-input";
import { PaymentMethodRadio } from "./payment-method-radio";

const INPUT_CLASSES =
  "h-12 rounded-xl border-border bg-paper-warm/40 px-4 text-base text-ink placeholder:text-warm-gray/70 focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20 focus-visible:bg-paper";
const LABEL_CLASSES =
  "font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-warm-gray";

export function CheckoutForm() {
  const router = useRouter();
  const clear = useCartStore((s) => s.clear);
  const count = useCartCount();
  const hydrated = useCartHydrated();

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
      name: "",
      phone: "",
      email: "",
      addressLine: "",
      addressNotes: "",
      deliveryTime: "",
      driverNotes: "",
      paymentMethod: "cash",
    } as CheckoutInput,
  });

  const orderType = watch("orderType");
  const paymentMethod = watch("paymentMethod");
  const isDelivery = orderType === "delivery";

  async function onSubmit(data: CheckoutInput) {
    await new Promise((r) => setTimeout(r, 500));

    if (data.paymentMethod === "card") {
      const params = new URLSearchParams({
        type: data.orderType,
        name: data.name,
        time: data.deliveryTime,
      });
      router.push(`/checkout/payment?${params.toString()}`);
      return;
    }

    clear();
    toast.success("Ordine ricevuto", {
      description:
        data.orderType === "delivery"
          ? "Ti chiamiamo a breve per confermare la consegna."
          : "Ti chiamiamo a breve per confermare il ritiro.",
    });
    router.push("/checkout/success");
  }

  const disabledSubmit = hydrated && count === 0;

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
          <OrderTypeToggle value={field.value} onValueChange={field.onChange} />
        )}
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
        <>
          <Controller
            control={control}
            name="addressLine"
            render={({ field }) => (
              <DeliveryAddressInput
                id="addressLine"
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onGeoChange={(geo) => setValue("geo", geo, { shouldValidate: false })}
                hasError={!!errors.addressLine}
                errorMessage={errors.addressLine?.message}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="addressNotes" className={LABEL_CLASSES}>
              Dettagli indirizzo
              <span className="ml-1 normal-case tracking-normal text-warm-gray/60">— opzionale</span>
            </Label>
            <Input
              id="addressNotes"
              {...register("addressNotes")}
              placeholder="Interno 3, scala B, citofono Rossi"
              className={INPUT_CLASSES}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="deliveryTime" className={LABEL_CLASSES}>
          {isDelivery ? "Orario di consegna" : "Orario di ritiro"}
        </Label>
        <Controller
          control={control}
          name="deliveryTime"
          render={({ field }) => (
            <PickupTimeSelect
              id="deliveryTime"
              value={field.value}
              onValueChange={field.onChange}
              hasError={!!errors.deliveryTime}
              placeholder={
                isDelivery ? "Quando vuoi ricevere l'ordine" : "Quando vieni a ritirare"
              }
            />
          )}
        />
        {errors.deliveryTime && (
          <p className="text-xs text-sushi-red">{errors.deliveryTime.message}</p>
        )}
      </div>

      {isDelivery && (
        <div className="space-y-2">
          <Label htmlFor="driverNotes" className={LABEL_CLASSES}>
            Note per il rider
            <span className="ml-1 normal-case tracking-normal text-warm-gray/60">— opzionale</span>
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
        <p className={LABEL_CLASSES}>
          Metodo di pagamento
        </p>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <PaymentMethodRadio value={field.value} onValueChange={field.onChange} />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || disabledSubmit}
        className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bamboo px-6 font-sans text-sm font-semibold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep hover:shadow-[0_8px_28px_-6px_rgba(90,122,100,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
      >
        {isSubmitting
          ? "Invio in corso..."
          : disabledSubmit
            ? "Il carrello è vuoto"
            : paymentMethod === "card"
              ? "Vai al pagamento"
              : "Conferma ordine"}
        {!isSubmitting && !disabledSubmit && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        )}
      </button>

      <p className="text-center text-[11px] text-warm-gray">
        {paymentMethod === "card"
          ? "Pagamento sicuro tramite Stripe (demo — nessun addebito reale)."
          : isDelivery
            ? "Ti chiameremo entro 5 minuti per confermare la consegna. Paghi al rider."
            : "Ti chiameremo entro 5 minuti per confermare il ritiro. Paghi al banco."}
      </p>
    </form>
  );
}
