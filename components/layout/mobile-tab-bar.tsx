"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartCount, useCartHydrated } from "@/store/cart-store";
import { useCartUI } from "@/lib/cart-ui-store";
import { UserAvatarSmall } from "./user-avatar-small";

type Tab =
  | { type: "link"; id: string; href: string; label: string; icon: typeof Home; matchExact?: boolean }
  | { type: "action"; id: string; label: string; icon: typeof Home; action: "openCart" };

// 4 tab (era 5): rimosso Cerca standalone (resta dentro /menu).
// Profilo spostato al CENTRO. Ordina (ex carrello) all'estrema destra.
const tabs: Tab[] = [
  { type: "link", id: "home", href: "/", label: "Home", icon: Home, matchExact: true },
  { type: "link", id: "menu", href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { type: "link", id: "profile", href: "/account", label: "Profilo", icon: User },
  { type: "action", id: "cart", label: "Ordina", icon: ShoppingBag, action: "openCart" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const openCart = useCartUI((s) => s.open);

  function isActive(tab: Tab): boolean {
    if (tab.type === "action") return false;
    if (tab.matchExact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  }

  return (
    <nav
      aria-label="Navigazione mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper/85 backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          const showCartBadge = tab.id === "cart" && hydrated && count > 0;

          const content = (
            <motion.span
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 480, damping: 22 }}
              className={cn(
                "relative flex h-14 flex-col items-center justify-center gap-1 px-3 transition-colors",
                active ? "text-bamboo" : "text-warm-gray hover:text-ink",
              )}
            >
              <span className="relative">
                {tab.id === "profile" ? (
                  <UserAvatarSmall active={active} />
                ) : (
                  <Icon
                    className={cn("h-5 w-5 transition", active && "stroke-[2.25]")}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                )}
                <AnimatePresence>
                  {showCartBadge && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 20 }}
                      className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sushi-red px-1 font-sans text-[10px] font-semibold leading-none text-paper ring-2 ring-paper"
                    >
                      {count > 99 ? "99+" : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-wide transition",
                  active ? "font-semibold" : "font-normal",
                )}
              >
                {tab.label}
              </span>
              {active && (
                <motion.span
                  layoutId="active-tab-dot"
                  aria-hidden
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-bamboo"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
            </motion.span>
          );

          if (tab.type === "action") {
            return (
              <li key={tab.id} className="flex-1">
                <button
                  type="button"
                  onClick={openCart}
                  aria-label={tab.label}
                  className="block w-full"
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li key={tab.id} className="flex-1">
              <Link href={tab.href} aria-label={tab.label} className="block w-full">
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
