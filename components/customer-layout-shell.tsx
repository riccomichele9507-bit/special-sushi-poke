"use client";

import { usePathname } from "next/navigation";
import { DeliveryLocationBar } from "@/components/layout/delivery-location-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { DishDetailDrawer } from "@/components/menu/dish-detail-drawer";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";
import { TestHelpers } from "@/components/shared/test-helpers";

/**
 * Wrappa il root layout: sulle route /admin/* nasconde tutta la "chrome" cliente
 * (tab bar mobile, cart drawer, dish detail drawer, delivery location bar, WhatsApp FAB).
 * Sul resto del sito (pagine pubbliche) renderizza tutto normalmente.
 */
export function CustomerLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // Niente chrome cliente: l'admin layout fornisce la sua sidebar + banner stampante
    return <>{children}</>;
  }

  return (
    <>
      <DeliveryLocationBar />
      <main className="flex-1 pb-24">{children}</main>
      <MobileTabBar />
      <CartDrawer />
      <DishDetailDrawer />
      <TestHelpers />
      <WhatsAppFab />
    </>
  );
}
