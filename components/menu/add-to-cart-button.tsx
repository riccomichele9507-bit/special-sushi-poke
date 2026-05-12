"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useCartUI } from "@/lib/cart-ui-store";

export function AddToCartButton({
  dishId,
  dishName,
  className,
  variant = "pill",
}: {
  dishId: string;
  dishName: string;
  className?: string;
  variant?: "floating" | "inline" | "pill";
}) {
  const add = useCartStore((s) => s.add);
  const openCart = useCartUI((s) => s.open);

  function handleAdd() {
    add(dishId);
    toast.success("Aggiunto al carrello", {
      description: dishName,
      duration: 1600,
    });
    setTimeout(() => openCart(), 220);
  }

  const aria = `Aggiungi ${dishName} al carrello`;
  const springTap = { type: "spring", stiffness: 460, damping: 18 } as const;

  if (variant === "inline") {
    return (
      <motion.button
        type="button"
        onClick={handleAdd}
        aria-label={aria}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.93 }}
        transition={springTap}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-bamboo px-5 text-sm font-medium text-paper",
          "hover:bg-bamboo-deep hover:shadow-[0_0_24px_rgba(90,122,100,0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo focus-visible:ring-offset-2",
          className,
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Aggiungi
      </motion.button>
    );
  }

  if (variant === "pill") {
    return (
      <motion.button
        type="button"
        onClick={handleAdd}
        aria-label={aria}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        transition={springTap}
        className={cn(
          "inline-flex h-7 items-center gap-0.5 rounded-full bg-bamboo px-2.5 text-[11px] font-semibold text-paper",
          "shadow-[0_2px_10px_-2px_rgba(90,122,100,0.5)]",
          "hover:bg-bamboo-deep",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo focus-visible:ring-offset-1",
          className,
        )}
      >
        <Plus className="h-3 w-3" strokeWidth={2.8} />
        Add
      </motion.button>
    );
  }

  // floating circular
  return (
    <motion.button
      type="button"
      onClick={handleAdd}
      aria-label={aria}
      whileHover={{ scale: 1.08, boxShadow: "0 0 32px rgba(90, 122, 100, 0.45)" }}
      whileTap={{ scale: 0.82, rotate: 90 }}
      transition={springTap}
      className={cn(
        "group inline-flex h-11 w-11 items-center justify-center rounded-full bg-bamboo text-paper",
        "shadow-[0_8px_24px_-8px_rgba(90,122,100,0.6)]",
        "ring-1 ring-inset ring-paper/10 hover:ring-paper/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo focus-visible:ring-offset-2",
        className,
      )}
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
    </motion.button>
  );
}
