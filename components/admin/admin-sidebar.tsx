"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Tags,
  Store,
  CalendarX,
  Truck,
  ShoppingBag,
  Users,
  Printer,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Ordini", icon: ShoppingBag },
  { href: "/admin/menu", label: "Menu (piatti)", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categorie", icon: Tags },
  { href: "/admin/delivery", label: "Consegne & orari", icon: Truck },
  { href: "/admin/closures", label: "Chiusure / ferie", icon: CalendarX },
  { href: "/admin/restaurant", label: "Dati ristorante", icon: Store },
  { href: "/admin/customers", label: "Clienti", icon: Users },
  { href: "/admin/printer", label: "Stampante", icon: Printer },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(item.href)
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
  );

  const logoutBlock = () => (
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
  );

  return (
    <>
      {/* Barra superiore MOBILE con hamburger (nascosta da md in su) */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-bamboo/20 bg-paper px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Apri menu"
          className="rounded-md p-1.5 text-ink hover:bg-bamboo/10"
        >
          <Menu className="h-6 w-6" />
        </button>
        <p className="font-serif-jp text-lg text-ink">Special Sushi</p>
      </header>

      {/* Drawer MOBILE a scomparsa */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-paper p-4 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="font-serif-jp text-xl text-ink">Special Sushi</p>
                <p className="text-xs text-warm-gray">Pannello titolare</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
                className="rounded-md p-1 text-warm-gray hover:bg-bamboo/10 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navLinks(() => setOpen(false))}
            {logoutBlock()}
          </aside>
        </div>
      )}

      {/* Sidebar DESKTOP (visibile da md in su) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-bamboo/20 bg-paper p-4 md:flex">
        <div className="mb-6">
          <p className="font-serif-jp text-xl text-ink">Special Sushi</p>
          <p className="text-xs text-warm-gray">Pannello titolare</p>
        </div>
        {navLinks()}
        {logoutBlock()}
      </aside>
    </>
  );
}
