"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/dish";

export function CategoryTabs({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  const [active, setActive] = useState<string>(
    categories.find((c) => c.available)?.id ?? categories[0]?.id ?? "",
  );
  const refs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    const targets = categories
      .filter((c) => c.available)
      .map((c) => document.getElementById(`category-${c.slug}`))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id.replace("category-", "");
          const cat = categories.find((c) => c.slug === id);
          if (cat) setActive(cat.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.1, 0.3, 0.5],
      },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  function handleClick(cat: Category) {
    if (!cat.available) return;
    setActive(cat.id);
    const target = document.getElementById(`category-${cat.slug}`);
    if (target) {
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  }

  return (
    <div
      className={cn(
        "sticky top-16 z-30 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3",
        "bg-ink/80 backdrop-blur-xl",
        "border-b border-white/[0.06]",
        className,
      )}
    >
      <nav
        aria-label="Categorie menu"
        className="flex gap-2 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                refs.current.set(cat.id, el);
              }}
              type="button"
              onClick={() => handleClick(cat)}
              disabled={!cat.available}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "group relative shrink-0 rounded-full px-4 py-2 font-sans text-sm transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                cat.available
                  ? isActive
                    ? "bg-paper/[0.08] text-paper"
                    : "text-white/55 hover:text-paper hover:bg-paper/[0.04]"
                  : "text-white/25 cursor-not-allowed",
              )}
            >
              <span className="flex items-center gap-2">
                {cat.label}
                {!cat.available && (
                  <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
                    presto
                  </span>
                )}
              </span>
              {isActive && cat.available && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-[13px] h-px bg-gradient-to-r from-transparent via-gold to-transparent"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
