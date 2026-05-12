"use client";

import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/checkout";

const options: { id: PaymentMethod; label: string; description: string; icon: typeof Banknote }[] = [
  {
    id: "cash",
    label: "Contanti alla consegna",
    description: "Paghi al rider quando arriva.",
    icon: Banknote,
  },
  {
    id: "card",
    label: "Carta adesso",
    description: "Pagamento sicuro online (demo Stripe).",
    icon: CreditCard,
  },
];

export function PaymentMethodRadio({
  value,
  onValueChange,
}: {
  value: PaymentMethod;
  onValueChange: (value: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Metodo di pagamento" className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            key={opt.id}
            onClick={() => onValueChange(opt.id)}
            className={cn(
              "group relative flex items-start gap-3 rounded-xl border bg-paper-warm/40 p-4 text-left transition-all",
              selected
                ? "border-bamboo/60 bg-bamboo/[0.08] ring-1 ring-bamboo/40"
                : "border-border hover:border-bamboo/30 hover:bg-paper-warm",
            )}
          >
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition",
                selected
                  ? "bg-bamboo/15 text-bamboo-deep ring-bamboo/30"
                  : "bg-paper text-warm-gray ring-border group-hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p
                className={cn(
                  "font-heading text-sm font-semibold transition",
                  selected ? "text-ink" : "text-ink/90",
                )}
              >
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs text-warm-gray">{opt.description}</p>
            </div>
            <span
              aria-hidden
              className={cn(
                "absolute right-3 top-3 inline-flex h-4 w-4 items-center justify-center rounded-full transition",
                selected
                  ? "bg-bamboo ring-2 ring-bamboo/30"
                  : "bg-transparent ring-1 ring-border",
              )}
            >
              {selected && <span className="h-1.5 w-1.5 rounded-full bg-paper" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
