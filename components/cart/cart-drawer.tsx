"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/lib/use-media-query";
import { useCartUI } from "@/lib/cart-ui-store";
import {
  useCartCount,
  useCartHydrated,
  useCartItemsWithDish,
} from "@/store/cart-store";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";
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
        <DrawerHeader className="shrink-0 border-b border-border px-5 pt-5">
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
            <ScrollArea className="flex-1 min-h-0 px-5">
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
              </div>
            </ScrollArea>

            <DrawerFooter className="shrink-0 border-t border-border gap-3 bg-paper/95 px-5 pb-5 pt-3 backdrop-blur">
              <TipSelector />
              <CartSummary />
              <button
                type="button"
                onClick={handleCheckout}
                className="group mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-bamboo font-sans text-sm font-semibold text-paper shadow-[0_4px_18px_-6px_rgba(90,122,100,0.5)] transition hover:bg-bamboo-deep hover:shadow-[0_8px_28px_-6px_rgba(90,122,100,0.6)] active:scale-[0.98]"
              >
                Procedi al checkout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
