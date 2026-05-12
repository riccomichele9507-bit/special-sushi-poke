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
        "sticky top-[60px] z-30 -mx-4 px-4 py-3",
        "bg-paper/90 backdrop-blur-xl",
        "border-b border-border",
        className,
      )}
    >
      <nav
        aria-label="Categorie menu"
        className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                "group relative shrink-0 rounded-full px-3.5 py-1.5 font-sans text-[13px] font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bamboo/40",
                cat.available
                  ? isActive
                    ? "bg-bamboo text-paper shadow-[0_2px_8px_-2px_rgba(90,122,100,0.45)]"
                    : "bg-paper-warm/60 text-warm-gray ring-1 ring-border hover:text-ink hover:bg-paper-warm"
                  : "text-warm-gray/40 cursor-not-allowed",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
