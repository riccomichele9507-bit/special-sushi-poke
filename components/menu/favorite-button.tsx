"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { toggleFavorite } from "@/app/actions/favorites";
import { useUser } from "@/lib/auth/use-user";
import { cn } from "@/lib/utils";

interface Props {
  dishId: string;
  dishName: string;
  initialFavorite?: boolean;
  /** Variante size: 'sm' usata in dish-card, 'lg' in dish-detail-drawer */
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Bottone cuore per aggiungere/rimuovere dai preferiti.
 * Client-side optimistic update + server toggle.
 */
export function FavoriteButton({
  dishId,
  dishName,
  initialFavorite = false,
  size = "sm",
  className,
}: Props) {
  const { user, loading } = useUser();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  const sizeStyles =
    size === "lg"
      ? "h-11 w-11"
      : "h-7 w-7";

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;
    if (!user) {
      toast("Accedi per salvare i preferiti", {
        description: "Crea un account in 10 secondi.",
        duration: 2000,
      });
      return;
    }

    // Optimistic update
    const previousValue = isFavorite;
    setIsFavorite(!previousValue);

    startTransition(async () => {
      const result = await toggleFavorite(dishId);
      if (!result.ok) {
        // Rollback
        setIsFavorite(previousValue);
        toast.error(result.errorMessage);
        return;
      }
      setIsFavorite(result.nowFavorite);
      toast.success(
        result.nowFavorite
          ? `${dishName} salvato nei preferiti ❤`
          : `${dishName} rimosso dai preferiti`,
        { duration: 1500 },
      );
    });
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      aria-label={isFavorite ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
      disabled={pending}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition",
        sizeStyles,
        isFavorite
          ? "bg-sushi-red text-paper shadow-[0_2px_10px_-2px_rgba(200,16,46,0.5)]"
          : "bg-paper/95 text-warm-gray ring-1 ring-border hover:text-sushi-red",
        className,
      )}
    >
      <Heart
        className={cn(size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5")}
        strokeWidth={2.25}
        fill={isFavorite ? "currentColor" : "none"}
      />
    </motion.button>
  );
}
