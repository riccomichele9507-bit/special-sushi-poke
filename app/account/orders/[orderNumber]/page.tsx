import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OrderTrackingClient } from "./order-tracking-client";

export const metadata: Metadata = {
  title: "Il tuo ordine",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/account/orders/${orderNumber}`)}`,
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-2">
      <Link
        href="/account"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper-warm/60 px-3 font-sans text-xs font-medium text-warm-gray ring-1 ring-border transition hover:bg-paper-warm hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        I miei ordini
      </Link>

      <header className="mb-5 mt-4">
        <p className="text-[10px] uppercase tracking-[0.32em] text-bamboo font-sans">
          Ordine {order.order_number}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
          {order.order_type === "delivery"
            ? "La tua consegna"
            : "Il tuo ritiro"}
        </h1>
      </header>

      <OrderTrackingClient initialOrder={order} userId={user.id} />
    </div>
  );
}
