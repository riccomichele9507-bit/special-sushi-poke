"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Star, X, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getDishById } from "@/data/menu";
import { categoryColors, getCategoryKanji, getCategoryById } from "@/data/categories";
import {
  getDishSizeVariants,
  type DishSizeVariant,
} from "@/data/dish-extras";
import {
  getDishReviews,
  getDishRating,
  getDishReviewCount,
} from "@/data/dish-reviews";
import { useCartStore } from "@/store/cart-store";
import { useDishDetail } from "@/lib/dish-detail-store";
import { Price } from "@/components/shared/price";
import { formatPrice } from "@/lib/format";

export function DishDetailDrawer() {
  const openDishId = useDishDetail((s) => s.openDishId);
  const close = useDishDetail((s) => s.close);
  const add = useCartStore((s) => s.add);

  const dish = openDishId ? getDishById(openDishId) : null;

  const variants = useMemo(() => (dish ? getDishSizeVariants(dish) : null), [dish]);
  const reviews = useMemo(() => (dish ? getDishReviews(dish.id) : []), [dish]);
  const rating = useMemo(() => (dish ? getDishRating(dish.id) : 0), [dish]);
  const reviewCount = useMemo(() => (dish ? getDishReviewCount(dish.id) : 0), [dish]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (dish) {
      setSelectedVariantId(variants ? "standard" : null);
      setQuantity(1);
    }
  }, [dish, variants]);

  if (!dish) {
    return (
      <Drawer open={false} onOpenChange={() => {}}>
        <DrawerContent className="hidden" />
      </Drawer>
    );
  }

  const selectedVariant: DishSizeVariant | null =
    variants?.find((v) => v.id === selectedVariantId) ?? null;
  const variantMultiplier = selectedVariant?.priceMultiplier ?? 1;

  const unitPrice = Math.round(dish.price * variantMultiplier);
  const totalPrice = unitPrice * quantity;

  const colors = categoryColors[dish.category];
  const bgFrom = dish.bgFrom ?? colors?.from ?? "#888";
  const bgTo = dish.bgTo ?? colors?.to ?? "#222";
  const kanji = getCategoryKanji(dish.category);
  const category = getCategoryById(dish.category);

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) add(dish!.id);

    const customizationParts: string[] = [];
    if (selectedVariant && selectedVariant.id !== "standard") {
      customizationParts.push(selectedVariant.label);
    }
    const description = customizationParts.length
      ? `${quantity > 1 ? `${quantity}× · ` : ""}${customizationParts.join(" · ")}`
      : quantity > 1
        ? `${quantity} unità`
        : undefined;

    toast.success(`${dish!.name} aggiunto`, {
      description,
      duration: 1800,
    });
    close();
  }

  return (
    <Drawer
      open={!!openDishId}
      onOpenChange={(v) => (v ? null : close())}
      direction="bottom"
    >
      <DrawerContent className="border-border bg-paper text-ink max-h-[94svh] overflow-hidden">
        <DrawerTitle className="sr-only">{dish.name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          Dettaglio piatto, varianti, extra e recensioni
        </DrawerDescription>

        <button
          type="button"
          onClick={close}
          aria-label="Chiudi"
          className="absolute right-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow-md ring-1 ring-border backdrop-blur-md transition hover:bg-paper"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="relative aspect-[5/4] w-full overflow-hidden bg-paper-warm">
            {dish.image ? (
              <Image
                src={dish.image}
                alt={dish.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center font-heading text-[10rem] text-paper/25 select-none">
                  {kanji}
                </span>
                <div
                  aria-hidden
                  className="absolute inset-0 mix-blend-overlay opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 55%)",
                  }}
                />
              </div>
            )}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent"
            />
          </div>

          <div className="space-y-6 px-5 pb-32 pt-3">
            {category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bamboo/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-bamboo-deep ring-1 ring-bamboo/20">
                {category.label}
              </span>
            )}

            <div>
              <h2 className="font-heading text-3xl font-bold leading-tight text-ink">
                {dish.name}
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-warm-gray">
                {dish.description}
              </p>
              {dish.ingredients.length > 0 && (
                <p className="mt-2 font-sans text-xs text-warm-gray">
                  <span className="font-semibold uppercase tracking-wider text-ink/70">
                    Ingredienti:
                  </span>{" "}
                  {dish.ingredients.join(", ")}
                </p>
              )}
            </div>

            <div className="flex items-end justify-between gap-3">
              <Price cents={dish.price} size="xl" className="!text-bamboo font-bold" />
              <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="font-heading font-bold text-ink">{rating.toFixed(1)}</span>
                <span>({reviewCount} Recensioni)</span>
              </div>
            </div>

            {variants && (
              <div className="space-y-2">
                <p className="font-heading text-sm font-bold text-ink">
                  Scegli la dimensione
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {variants.map((v) => {
                    const selected = selectedVariantId === v.id;
                    const variantPrice = Math.round(dish.price * v.priceMultiplier);
                    return (
                      <motion.button
                        type="button"
                        key={v.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedVariantId(v.id)}
                        aria-pressed={selected}
                        className={cn(
                          "flex flex-col items-center rounded-xl border px-3 py-2.5 transition",
                          selected
                            ? "border-bamboo bg-bamboo/10 ring-1 ring-bamboo/40"
                            : "border-border bg-paper-warm/40 hover:bg-paper-warm",
                        )}
                      >
                        <span className={cn(
                          "font-heading text-sm font-bold",
                          selected ? "text-bamboo-deep" : "text-ink"
                        )}>
                          {v.label}
                        </span>
                        <span className="mt-0.5 text-[11px] tabular-nums text-warm-gray">
                          {formatPrice(variantPrice)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extras/Toppings ELIMINATI su richiesta utente: il drawer ora mostra
                solo descrizione, ingredienti, allergeni, recensioni. */}

            {dish.allergens.length > 0 && (
              <div className="rounded-xl bg-sakura/15 px-3 py-2.5 ring-1 ring-sakura/30">
                <p className="text-[11px] uppercase tracking-[0.16em] text-sakura-deep font-semibold">
                  Contiene
                </p>
                <p className="mt-0.5 font-sans text-xs text-ink">
                  {dish.allergens.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")}
                </p>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-bold text-ink">
                    Recensioni clienti
                  </p>
                  <span className="text-[11px] text-warm-gray tabular-nums">
                    {reviewCount} totali
                  </span>
                </div>
                <ul className="space-y-2">
                  {reviews.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl bg-paper-warm/40 p-3"
                    >
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bamboo/15 font-heading text-xs font-bold text-bamboo-deep">
                        {r.author.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-sm font-semibold text-ink">
                            {r.author}
                          </span>
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={cn(
                                  "h-2.5 w-2.5",
                                  idx < r.rating
                                    ? "fill-gold text-gold"
                                    : "fill-warm-gray-soft/30 text-warm-gray-soft/30",
                                )}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mt-0.5 font-sans text-xs italic text-warm-gray">
                          &ldquo;{r.text}&rdquo;
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>

        <AnimatePresence>
          <motion.div
            key="footer"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-paper/95 backdrop-blur-xl px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full bg-paper-warm/60 p-0.5 ring-1 ring-border">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuisci quantità"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-paper"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </motion.button>
                <span className="min-w-[1.5rem] text-center font-sans text-sm font-bold tabular-nums text-ink">
                  {quantity}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Aumenta quantità"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-paper"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </motion.button>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="group flex h-12 flex-1 items-center justify-between gap-2 rounded-full bg-bamboo px-5 font-sans text-sm font-bold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.55)] transition hover:bg-bamboo-deep"
              >
                <span className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  Ordina
                </span>
                <span className="font-heading font-bold tabular-nums">
                  {formatPrice(totalPrice)}
                </span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  );
}
