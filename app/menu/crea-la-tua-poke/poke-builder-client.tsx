"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  computePokePrice,
  validatePokeSelections,
  type PokeBuilderConfig,
} from "@/data/poke-builder";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";

type Selections = Record<string, string[]>;

export function PokeBuilderClient({ config }: { config: PokeBuilderConfig }) {
  const router = useRouter();
  const addCustomPoke = useCartStore((s) => s.addCustomPoke);
  const [selections, setSelections] = useState<Selections>(() =>
    Object.fromEntries(config.categories.map((c) => [c.id, [] as string[]])),
  );

  const { totalCents, extrasCents, extrasBreakdown } = useMemo(
    () => computePokePrice(selections),
    [selections],
  );

  const errors = useMemo(
    () => validatePokeSelections(selections),
    [selections],
  );

  function toggle(catId: string, itemId: string) {
    setSelections((prev) => {
      const current = prev[catId] ?? [];
      const isSelected = current.includes(itemId);
      const cat = config.categories.find((c) => c.id === catId)!;

      let next: string[];
      if (isSelected) {
        next = current.filter((id) => id !== itemId);
      } else {
        // Blocca se max raggiunto + no extras possibili
        if (
          cat.maxIncluded != null &&
          cat.extraCents == null &&
          current.length >= cat.maxIncluded
        ) {
          toast.error(`Max ${cat.maxIncluded} per ${cat.label}.`);
          return prev;
        }
        next = [...current, itemId];
      }
      return { ...prev, [catId]: next };
    });
  }

  function handleAddToCart() {
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    // Mappa selections (IDs) → labels per display nel carrello
    const selectionLabels: Record<string, string[]> = {};
    for (const cat of config.categories) {
      const selectedIds = selections[cat.id] ?? [];
      if (selectedIds.length === 0) continue;
      selectionLabels[cat.id] = selectedIds.map(
        (id) => cat.items.find((it) => it.id === id)?.label ?? id,
      );
    }
    addCustomPoke({
      type: "custom-poke",
      basePriceCents: config.basePriceCents,
      extrasCents,
      selectionLabels,
    });
    toast.success("Poke aggiunta al carrello 🥗");
    router.push("/menu?category=poke");
  }

  return (
    <div className="space-y-6">
      {config.pricePending && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          ⚠️ <strong>Prezzo base in attesa di conferma</strong>: stiamo usando il
          placeholder di <strong>{formatPrice(config.basePriceCents)}</strong>.
          Le aggiunte (proteine +€1,50 e condimenti +€1) sono già attive.
        </div>
      )}

      {config.categories.map((cat) => {
        const selected = selections[cat.id] ?? [];
        return (
          <section
            key={cat.id}
            className="rounded-lg border border-bamboo/15 bg-paper p-4 space-y-3"
          >
            <header className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{cat.label}</h2>
                <p className="text-xs text-warm-gray">{cat.description}</p>
              </div>
              <CategoryCounter
                selected={selected.length}
                maxIncluded={cat.maxIncluded}
                extraCents={cat.extraCents}
              />
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cat.items.map((item) => {
                const isSelected = selected.includes(item.id);
                const wouldBeExtra =
                  cat.maxIncluded != null &&
                  cat.extraCents != null &&
                  cat.extraCents > 0 &&
                  !isSelected &&
                  selected.length >= cat.maxIncluded;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(cat.id, item.id)}
                    className={[
                      "relative rounded-lg border text-left text-sm px-3 py-2 transition-colors",
                      isSelected
                        ? "bg-bamboo text-paper border-bamboo"
                        : "bg-paper text-ink border-bamboo/30 hover:bg-bamboo/5",
                    ].join(" ")}
                  >
                    {item.label}
                    {wouldBeExtra && (
                      <span className="absolute top-0.5 right-1.5 text-[10px] text-sushi-red">
                        +€{(cat.extraCents! / 100).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Riepilogo costi */}
      <section className="rounded-lg border border-bamboo/30 bg-bamboo/5 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-ink">Riepilogo</h3>
        <div className="flex justify-between text-sm">
          <span className="text-warm-gray">Poke base</span>
          <span>{formatPrice(config.basePriceCents)}</span>
        </div>
        {extrasBreakdown.map((b) => (
          <div key={b.category} className="flex justify-between text-sm">
            <span className="text-warm-gray">
              {b.category} extra (×{b.extras})
            </span>
            <span>+{formatPrice(b.cents)}</span>
          </div>
        ))}
        {extrasCents === 0 && (
          <div className="text-xs text-warm-gray italic">
            Nessuna aggiunta a costo extra.
          </div>
        )}
        <div className="border-t border-bamboo/20 pt-2 flex justify-between font-semibold text-ink">
          <span>Totale</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
      </section>

      {/* CTA sticky */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none md:static md:px-0">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={errors.length > 0}
            className={[
              "w-full rounded-full px-6 py-3 font-semibold shadow-lg transition-colors",
              errors.length > 0
                ? "bg-warm-gray/30 text-warm-gray cursor-not-allowed"
                : "bg-sushi-red text-paper hover:bg-sushi-red/90",
            ].join(" ")}
          >
            {errors.length > 0
              ? errors[0]
              : `Aggiungi al carrello — ${formatPrice(totalCents)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryCounter({
  selected,
  maxIncluded,
  extraCents,
}: {
  selected: number;
  maxIncluded: number | null;
  extraCents: number | null;
}) {
  if (maxIncluded == null) {
    return (
      <span className="text-xs text-warm-gray whitespace-nowrap">
        {selected} scelt{selected === 1 ? "o" : "i"}
      </span>
    );
  }
  const over = selected - maxIncluded;
  const showExtra = over > 0 && extraCents != null && extraCents > 0;
  return (
    <span className="text-xs whitespace-nowrap">
      <span className={over > 0 && extraCents === null ? "text-sushi-red" : "text-warm-gray"}>
        {selected}/{maxIncluded}
      </span>
      {showExtra && (
        <span className="text-sushi-red ml-1">
          (+{over} = +€{((over * extraCents!) / 100).toFixed(2).replace(".", ",")})
        </span>
      )}
    </span>
  );
}
