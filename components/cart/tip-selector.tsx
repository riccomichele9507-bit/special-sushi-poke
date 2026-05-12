"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricing } from "@/lib/pricing-store";

const TIP_OPTIONS = [
  { value: 0, label: "Nessuna" },
  { value: 100, label: "€1" },
  { value: 200, label: "€2" },
  { value: 300, label: "€3" },
] as const;

export function TipSelector() {
  const tipCents = usePricing((s) => s.tipCents);
  const setTip = usePricing((s) => s.setTip);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-warm-gray">
        <Heart className="h-3 w-3 text-sakura-deep" strokeWidth={2} />
        <span className="font-sans font-medium uppercase tracking-wider">
          Mancia per il personale
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-paper-warm/40 p-1 ring-1 ring-border">
        {TIP_OPTIONS.map((opt) => {
          const selected = tipCents === opt.value;
          return (
            <motion.button
              type="button"
              key={opt.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => setTip(opt.value)}
              aria-pressed={selected}
              className={cn(
                "rounded-full py-1.5 text-xs font-semibold transition",
                selected
                  ? "bg-bamboo text-paper shadow-[0_2px_8px_-2px_rgba(90,122,100,0.4)]"
                  : "text-warm-gray hover:text-ink",
              )}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
