"use client";

import { User } from "lucide-react";
import { useUser } from "@/lib/auth/use-user";
import { cn } from "@/lib/utils";

/**
 * Avatar piccolo per il tab bar.
 * - Se loggato: cerchio bambù con iniziali del nome (es. "MR" per Mario Rossi)
 * - Se non loggato: icona User generica
 */
export function UserAvatarSmall({ active }: { active: boolean }) {
  const { user, loading } = useUser();

  if (loading || !user) {
    return (
      <User
        className={cn("h-5 w-5 transition", active && "stroke-[2.25]")}
        strokeWidth={active ? 2.25 : 1.75}
      />
    );
  }

  // Estrai iniziali dal nome o fallback all'email
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "";

  const initials = fullName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full font-heading text-[9px] font-bold uppercase leading-none transition",
        active
          ? "bg-bamboo text-paper ring-1 ring-bamboo/40"
          : "bg-bamboo/15 text-bamboo-deep ring-1 ring-bamboo/30",
      )}
      aria-label="Profilo loggato"
    >
      {initials || "·"}
    </span>
  );
}
