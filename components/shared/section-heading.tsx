import { cn } from "@/lib/utils";
import { KanjiOrnament } from "./kanji-ornament";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  kanji,
  align = "left",
  divider = true,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  kanji?: string;
  align?: "left" | "center";
  divider?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {kanji && (
        <KanjiOrnament
          char={kanji}
          className={cn(
            "absolute -top-10 text-[14rem] sm:text-[18rem] leading-none",
            align === "center" ? "left-1/2 -translate-x-1/2" : "-left-6 sm:-left-12",
          )}
        />
      )}
      <div className="relative">
        {eyebrow && (
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-gold/80 font-sans">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-paper leading-[1.05] tracking-tight">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-base sm:text-lg text-white/60 font-sans max-w-2xl",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
        {divider && (
          <div
            className={cn(
              "mt-6 h-px w-16 bg-gradient-to-r from-gold/60 to-transparent",
              align === "center" && "mx-auto",
            )}
          />
        )}
        {children}
      </div>
    </div>
  );
}
