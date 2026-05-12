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
import { EmptyCart } from "./empty-cart";

export function CartDrawer() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const open = useCartUI((s) => s.isOpen);
  const setOpen = useCartUI((s) => (s.isOpen ? s.close : s.open));
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
        className="border-white/10 bg-ink text-paper data-[vaul-drawer-direction=right]:max-w-md data-[vaul-drawer-direction=right]:rounded-l-2xl"
      >
        <DrawerHeader className="border-b border-white/[0.06] px-5 pt-5">
          <DrawerTitle className="font-heading text-2xl font-semibold text-paper">
            Il tuo carrello
            {hydrated && count > 0 && (
              <span className="ml-2 font-sans text-base font-normal text-white/40">
                ({count})
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription className="text-xs uppercase tracking-[0.22em] text-gold/70">
            Asporto · Special Sushi Poke
          </DrawerDescription>
        </DrawerHeader>

        {!hydrated || items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="py-2">
                {items.map((item, i) => (
                  <CartItemRow
                    key={item.dish.id}
                    item={item}
                    isLast={i === items.length - 1}
                  />
                ))}
              </div>
            </ScrollArea>

            <DrawerFooter className="border-t border-white/[0.06] gap-4 bg-ink/95 px-5 pb-6 pt-5 backdrop-blur">
              <CartSummary />
              <button
                type="button"
                onClick={handleCheckout}
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-sushi-red font-sans text-sm font-medium text-paper transition hover:bg-sushi-red/90 hover:shadow-[0_0_32px_rgba(200,16,46,0.45)] active:scale-[0.98]"
              >
                Procedi al ritiro
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
