"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePricing } from "@/lib/pricing-store";

export function DiscountCodeInput() {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const discountCode = usePricing((s) => s.discountCode);
  const applyDiscount = usePricing((s) => s.applyDiscount);
  const clearDiscount = usePricing((s) => s.clearDiscount);

  function handleApply() {
    if (!input.trim()) return;
    const success = applyDiscount(input);
    if (success) {
      toast.success("Codice applicato", { duration: 1400 });
      setInput("");
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
      toast.error("Codice non valido");
    }
  }

  if (discountCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-2 rounded-xl bg-bamboo/10 px-3 py-2.5 ring-1 ring-bamboo/30"
      >
        <span className="flex items-center gap-2 text-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bamboo text-paper">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="font-heading font-semibold text-bamboo-deep">
            {discountCode.code}
          </span>
          <span className="text-warm-gray text-xs">
            −{discountCode.percent}%
          </span>
        </span>
        <button
          type="button"
          onClick={clearDiscount}
          aria-label="Rimuovi codice sconto"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-warm-gray transition hover:bg-paper hover:text-ink"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-paper-warm/40 p-1 ring-1 ring-border">
      <div className="flex flex-1 items-center gap-2 pl-3">
        <Tag className="h-3.5 w-3.5 shrink-0 text-warm-gray" strokeWidth={1.75} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Codice sconto"
          maxLength={20}
          className={cn(
            "h-8 w-full bg-transparent font-mono text-sm tracking-wider text-ink placeholder:text-warm-gray placeholder:font-sans placeholder:tracking-normal outline-none",
            error && "text-sushi-red",
          )}
        />
      </div>
      <motion.button
        type="button"
        onClick={handleApply}
        disabled={!input.trim()}
        whileTap={{ scale: 0.93 }}
        className={cn(
          "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition",
          input.trim()
            ? "bg-bamboo text-paper hover:bg-bamboo-deep"
            : "bg-warm-gray/20 text-warm-gray cursor-not-allowed",
        )}
      >
        Applica
      </motion.button>
    </div>
  );
}
