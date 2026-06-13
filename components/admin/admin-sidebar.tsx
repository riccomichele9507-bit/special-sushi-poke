"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Tags,
  Store,
  Star,
  CalendarX,
  Ticket,
  Truck,
  ShoppingBag,
  Users,
  Printer,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Ordini", icon: ShoppingBag },
  { href: "/admin/menu", label: "Menu (piatti)", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categorie", icon: Tags },
  { href: "/admin/special", label: "Offerta del giorno", icon: Star },
  { href: "/admin/discounts", label: "Codici sconto", icon: Ticket },
  { href: "/admin/delivery", label: "Consegne & orari", icon: Truck },
  { href: "/admin/closures", label: "Chiusure / ferie", icon: CalendarX },
  { href: "/admin/restaurant", label: "Dati ristorante", icon: Store },
  { href: "/admin/customers", label: "Clienti", icon: Users },
  { href: "/admin/printer", label: "Stampante", icon: Printer },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-bamboo/20 bg-paper p-4 hidden md:flex md:flex-col">
      <div className="mb-6">
        <p className="font-serif-jp text-xl text-ink">Special Sushi</p>
        <p className="text-xs text-warm-gray">Pannello titolare</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-bamboo/15 text-ink font-semibold"
                  : "text-warm-gray hover:bg-bamboo/5 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-bamboo/10 pt-4 space-y-2">
        <p className="text-xs text-warm-gray truncate" title={userEmail}>
          {userEmail}
        </p>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-warm-gray hover:bg-sushi-red/10 hover:text-sushi-red"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        </form>
      </div>
    </aside>
  );
}
