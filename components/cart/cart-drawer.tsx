"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/use-media-query";
import { useCartUI } from "@/lib/cart-ui-store";
import {
  useCartCount,
  useCartHydrated,
  useCartItemsWithDish,
  useCartTotal,
} from "@/store/cart-store";
import { usePricing } from "@/lib/pricing-store";
import { promoConfig, computeAutoPromoCents } from "@/lib/promo/auto-promo";
import { Price } from "@/components/shared/price";
import { CartItemRow } from "./cart-item-row";
import { CartUpsell } from "./cart-upsell";
import { EmptyCart } from "./empty-cart";

export function CartDrawer() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const open = useCartUI((s) => s.isOpen);
  const closeDrawer = useCartUI((s) => s.close);
  const hydrated = useCartHydrated();
  const items = useCartItemsWithDish();
  const count = useCartCount();
  const subtotal = useCartTotal();
  const tipCents = usePricing((s) => s.tipCents);

  const promo = promoConfig();
  const discountCents = computeAutoPromoCents(subtotal, promo);
  const total = Math.max(0, subtotal - discountCents) + tipCents;

  function handleCheckout() {
    closeDrawer();
    router.push("/checkout");
  }

  const direction = isDesktop ? "right" : "bottom";

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => (v ? useCartUI.getState().open() : closeDrawer())}
      direction={direction}
    >
      <DrawerContent
        className="border-border bg-paper text-ink data-[vaul-drawer-direction=bottom]:max-h-[92svh] data-[vaul-drawer-direction=right]:max-w-md data-[vaul-drawer-direction=right]:rounded-l-2xl"
      >
        <DrawerHeader className="shrink-0 border-b border-border px-5 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            {/* Sinistra: freccia per tornare indietro (chiude il carrello) */}
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Torna indietro"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-warm-gray transition hover:bg-paper-warm hover:text-ink"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </button>

            {/* Centro: logo */}
            <Image
              src="/logo-mark.png"
              alt="Special Sushi Poke"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
            />

            {/* Destra: Ordina ancora (con micro-shake ogni 30s) */}
            {hydrated && count > 0 ? (
              <motion.div
                animate={{ rotate: [0, -7, 6, -5, 4, 0], x: [0, -2, 2, -1, 1, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 30,
                  ease: "easeInOut",
                }}
              >
                <Link
                  href="/menu"
                  onClick={closeDrawer}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-bamboo/10 px-2.5 text-[11px] font-semibold text-bamboo hover:bg-bamboo/20"
                >
                  + Ordina ancora
                </Link>
              </motion.div>
            ) : (
              <span className="h-7 w-8" aria-hidden />
            )}
          </div>
          <DrawerTitle className="mt-2 font-heading text-xl font-bold text-ink">
            Il tuo carrello
            {hydrated && count > 0 && (
              <span className="ml-2 font-sans text-base font-normal text-warm-gray">
                ({count})
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Riepilogo del tuo carrello Special Sushi Poke
          </DrawerDescription>
        </DrawerHeader>

        {!hydrated || items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5"
              data-vaul-no-drag
            >
              <div className="space-y-3 py-3">
                <CartUpsell />
                <div>
                  {items.map((item, i) => (
                    <CartItemRow
                      key={item.dish.id}
                      item={item}
                      isLast={i === items.length - 1}
                    />
                  ))}
                </div>
                {(discountCents > 0 || tipCents > 0) && (
                  <div className="flex flex-col gap-1.5 rounded-xl bg-paper-warm/40 p-3 text-sm ring-1 ring-border">
                    <div className="flex items-center justify-between text-warm-gray">
                      <span>Subtotale</span>
                      <Price cents={subtotal} size="sm" className="!text-ink" />
                    </div>
                    {discountCents > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-bamboo-deep font-medium">
                          Promo {promo.percent}% su tutto
                        </span>
                        <span className="font-heading font-semibold text-bamboo-deep tabular-nums">
                          −<Price cents={discountCents} size="sm" className="!text-bamboo-deep" />
                        </span>
                      </div>
                    )}
                    {tipCents > 0 && (
                      <div className="flex items-center justify-between text-warm-gray">
                        <span>Mancia staff</span>
                        <Price cents={tipCents} size="sm" className="!text-ink" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-paper/95 px-5 pb-5 pt-3 backdrop-blur">
              <div className="flex items-end justify-between pb-3">
                <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-warm-gray">
                  Totale
                </span>
                <Price cents={total} size="xl" className="!text-bamboo font-bold" />
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bamboo font-sans text-sm font-semibold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep hover:shadow-[0_8px_28px_-6px_rgba(90,122,100,0.6)] active:scale-[0.98]"
              >
                Procedi al checkout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
