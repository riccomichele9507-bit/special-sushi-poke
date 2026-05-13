"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
import { Price } from "@/components/shared/price";
import { CartItemRow } from "./cart-item-row";
import { CartUpsell } from "./cart-upsell";
import { DiscountCodeInput } from "./discount-code-input";
import { TipSelector } from "./tip-selector";
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
  const discountCode = usePricing((s) => s.discountCode);
  const tipCents = usePricing((s) => s.tipCents);

  const discountCents = discountCode
    ? Math.round((subtotal * discountCode.percent) / 100)
    : 0;
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
          <DrawerTitle className="font-heading text-xl font-bold text-ink">
            Il tuo carrello
            {hydrated && count > 0 && (
              <span className="ml-2 font-sans text-base font-normal text-warm-gray">
                ({count})
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription className="text-[10px] uppercase tracking-[0.22em] text-bamboo">
            Consegna · Special Sushi Poke
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
                <DiscountCodeInput />
                <TipSelector />
                {(discountCents > 0 || tipCents > 0) && (
                  <div className="flex flex-col gap-1.5 rounded-xl bg-paper-warm/40 p-3 text-sm ring-1 ring-border">
                    <div className="flex items-center justify-between text-warm-gray">
                      <span>Subtotale</span>
                      <Price cents={subtotal} size="sm" className="!text-ink" />
                    </div>
                    {discountCents > 0 && discountCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-bamboo-deep">
                          Sconto <span className="font-mono">{discountCode.code}</span> (−{discountCode.percent}%)
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
