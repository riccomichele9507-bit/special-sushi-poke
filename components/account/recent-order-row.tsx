"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { ReorderButton } from "./reorder-button";

export interface RecentOrderItem {
  name: string;
  qty: number;
}

export function RecentOrderRow({
  orderNumber,
  orderType,
  dateText,
  statusText,
  totalCents,
  items,
}: {
  orderNumber: string;
  orderType: "delivery" | "pickup";
  dateText: string;
  statusText: string;
  totalCents: number;
  items: RecentOrderItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-xl border border-border bg-paper transition hover:border-bamboo/40">
      <div className="flex items-center justify-between p-3">
        <Link href={`/account/orders/${orderNumber}`} className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">
            {orderType === "delivery" ? "🛵" : "🏪"} {orderNumber}
          </p>
          <p className="text-xs text-warm-gray">
            {dateText} · {statusText}
          </p>
        </Link>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {/* + per vedere cosa è stato ordinato (prima del prezzo) */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Nascondi piatti" : "Mostra piatti ordinati"}
              aria-expanded={open}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bamboo/10 text-bamboo transition hover:bg-bamboo/20"
            >
              {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          )}
          <span className="text-sm font-semibold text-ink tabular-nums">
            €{(totalCents / 100).toFixed(2).replace(".", ",")}
          </span>
          <ReorderButton orderNumber={orderNumber} />
        </div>
      </div>

      {open && items.length > 0 && (
        <ul className="border-t border-border px-3 py-2 space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-warm-gray">
              <span className="font-semibold text-bamboo tabular-nums">{it.qty}×</span>
              <span className="text-ink">{it.name}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
