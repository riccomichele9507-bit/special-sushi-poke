import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRomeHHmm, relativeDayLabel } from "@/lib/delivery/time";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const metadata: Metadata = {
  title: "Ordine confermato",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function GraziePage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  if (!id) redirect("/menu");

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "order_number, status, total_cents, order_type, slot_start, slot_end, payment_method",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) redirect("/menu");

  const slotStart = new Date(order.slot_start);
  const slotEnd = new Date(order.slot_end);
  const dayLabel = relativeDayLabel(slotStart);
  const slotText = `${dayLabel} ${formatRomeHHmm(slotStart)}–${formatRomeHHmm(slotEnd)}`;
  const isDelivery = order.order_type === "delivery";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <ClearCartOnMount />
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-bamboo" strokeWidth={1.5} />
        <h1 className="mt-4 font-heading text-2xl font-bold text-ink">
          Ordine #{order.order_number} confermato! 🎉
        </h1>
        <p className="mt-2 text-sm text-warm-gray">
          Grazie per aver ordinato da Special Sushi Poke.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-paper p-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-warm-gray">{isDelivery ? "Consegna" : "Ritiro"}</span>
          <span className="font-medium text-ink">{slotText}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-warm-gray">Totale</span>
          <span className="font-heading font-bold text-bamboo tabular-nums">
            €{(order.total_cents / 100).toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-warm-gray">Pagamento</span>
          <span className="font-medium text-ink">
            {order.payment_method === "card" ? "Carta (pagato)" : "Contanti alla consegna"}
          </span>
        </div>
        <p className="pt-1 text-xs text-warm-gray">
          {isDelivery
            ? "Ti contattiamo se serve. Tieni il telefono a portata di mano."
            : "Ti aspettiamo in negozio all'orario scelto."}
        </p>
      </div>

      {/* Invito a registrarsi */}
      <div className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-bamboo/5 p-5 text-center">
        <Star className="mx-auto h-6 w-6 fill-gold text-gold" />
        <h2 className="mt-2 font-heading text-lg font-bold text-ink">
          Crea un account e guadagna premi
        </h2>
        <p className="mt-1 text-sm text-warm-gray">
          Segui i tuoi ordini, salva l&apos;indirizzo e accumula punti: ogni euro
          speso ti avvicina a uno sconto. La consegna a Bari è gratis.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-bamboo px-6 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-bamboo-deep"
        >
          Iscriviti ora
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/menu"
          className="text-sm font-medium text-warm-gray underline-offset-2 hover:text-ink hover:underline"
        >
          Torna al menu
        </Link>
      </div>
    </div>
  );
}
