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

export function CheckoutForm() {
  const router = useRouter();
  const clear = useCartStore((s) => s.clear);
  const count = useCartCount();
  const hydrated = useCartHydrated();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      pickupSlot: "",
      notes: "",
    },
  });

  async function onSubmit(data: CheckoutInput) {
    await new Promise((r) => setTimeout(r, 700));
    void data;
    clear();
    toast.success("Ordine ricevuto", {
      description: "Ti chiamiamo per confermare il ritiro.",
    });
    router.push("/checkout/success");
  }

  const disabledSubmit = hydrated && count === 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-2xl bg-ink/60 ring-1 ring-white/10 backdrop-blur p-5 sm:p-8"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="font-sans text-xs uppercase tracking-[0.22em] text-white/60">
          Nome e cognome
        </Label>
        <Input
          id="name"
          {...register("name")}
          autoComplete="name"
          placeholder="Mario Rossi"
          aria-invalid={!!errors.name}
          className={cn(
            "h-12 rounded-lg border-white/10 bg-paper/[0.04] px-4 text-base text-paper placeholder:text-white/30 focus-visible:border-gold/60 focus-visible:ring-gold/30",
            errors.name && "border-sushi-red/60 aria-invalid:border-sushi-red/60",
          )}
        />
        {errors.name && (
          <p className="text-xs text-sushi-red">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-sans text-xs uppercase tracking-[0.22em] text-white/60">
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
            className={cn(
              "h-12 rounded-lg border-white/10 bg-paper/[0.04] px-4 text-base text-paper placeholder:text-white/30 focus-visible:border-gold/60 focus-visible:ring-gold/30",
              errors.phone && "border-sushi-red/60",
            )}
          />
          {errors.phone && (
            <p className="text-xs text-sushi-red">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-xs uppercase tracking-[0.22em] text-white/60">
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
            className={cn(
              "h-12 rounded-lg border-white/10 bg-paper/[0.04] px-4 text-base text-paper placeholder:text-white/30 focus-visible:border-gold/60 focus-visible:ring-gold/30",
              errors.email && "border-sushi-red/60",
            )}
          />
          {errors.email && (
            <p className="text-xs text-sushi-red">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupSlot" className="font-sans text-xs uppercase tracking-[0.22em] text-white/60">
          Orario di ritiro
        </Label>
        <Controller
          control={control}
          name="pickupSlot"
          render={({ field }) => (
            <PickupTimeSelect
              id="pickupSlot"
              value={field.value}
              onValueChange={field.onChange}
              hasError={!!errors.pickupSlot}
            />
          )}
        />
        {errors.pickupSlot && (
          <p className="text-xs text-sushi-red">{errors.pickupSlot.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="font-sans text-xs uppercase tracking-[0.22em] text-white/60">
          Note (allergie, intolleranze, richieste)
          <span className="ml-1 normal-case tracking-normal text-white/35">— opzionale</span>
        </Label>
        <Textarea
          id="notes"
          {...register("notes")}
          rows={3}
          placeholder="Es. senza sesamo, niente glutine..."
          aria-invalid={!!errors.notes}
          className="min-h-[88px] rounded-lg border-white/10 bg-paper/[0.04] px-4 py-3 text-base text-paper placeholder:text-white/30 focus-visible:border-gold/60 focus-visible:ring-gold/30"
        />
        {errors.notes && (
          <p className="text-xs text-sushi-red">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || disabledSubmit}
        className="group mt-2 inline-flex h-13 min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sushi-red px-6 font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_36px_rgba(200,16,46,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
      >
        {isSubmitting ? "Invio in corso..." : disabledSubmit ? "Il carrello è vuoto" : "Conferma ordine"}
        {!isSubmitting && !disabledSubmit && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        )}
      </button>

      <p className="text-center text-[11px] text-white/40">
        Confermando, ti chiameremo entro 5 minuti per la conferma del ritiro.
        Nessun pagamento online: paghi al ritiro.
      </p>
    </form>
  );
}
