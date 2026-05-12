"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDishDetail } from "@/lib/dish-detail-store";
import { useCartUI } from "@/lib/cart-ui-store";

function TestHelpersInner() {
  const params = useSearchParams();
  const openDish = useDishDetail((s) => s.open);
  const openCart = useCartUI((s) => s.open);

  useEffect(() => {
    const preview = params.get("preview");
    const cart = params.get("cart");
    if (preview) {
      const t = setTimeout(() => openDish(preview), 350);
      return () => clearTimeout(t);
    }
    if (cart === "open") {
      const t = setTimeout(() => openCart(), 350);
      return () => clearTimeout(t);
    }
  }, [params, openDish, openCart]);

  return null;
}

export function TestHelpers() {
  return (
    <Suspense fallback={null}>
      <TestHelpersInner />
    </Suspense>
  );
}
