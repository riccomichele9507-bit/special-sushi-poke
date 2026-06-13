"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { useUser } from "@/lib/auth/use-user";

/**
 * Header personalizzato post-login: "Hello, [Nome]" con avatar tondo iniziali.
 * Stile mobile-first ispirato a app delivery moderne (DoorDash/Glovo).
 * Mostrato sopra il hero, solo se loggato.
 */
export function HelloHeader() {
  const { user, loading } = useUser();

  if (loading || !user) return null;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "amico";

  const firstName = fullName.split(/\s+/)[0];
  const initials = fullName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section className="px-4 pt-3">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/account"
          className="flex items-center gap-3 min-w-0 flex-1"
          aria-label="Vai al profilo"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bamboo text-paper font-heading text-xs font-bold uppercase ring-2 ring-bamboo/20">
            {initials || "·"}
          </span>
          <div className="min-w-0">
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-warm-gray">
              <MapPin className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />
              Bari, Italia
            </p>
            <p className="font-heading text-lg font-bold leading-tight text-ink truncate">
              Ciao, {firstName} 👋
            </p>
          </div>
        </Link>
        <Link
          href="/account"
          className="inline-flex h-9 items-center gap-0.5 rounded-full bg-paper-warm/60 px-2 text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink"
          aria-label="Profilo"
        >
          Profilo
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
