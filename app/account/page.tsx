import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CheckCircle2, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AccountForm } from "./account-form";
import { RecentOrderRow } from "@/components/account/recent-order-row";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { getEffectiveStatus, statusLabel } from "@/lib/orders/status";

interface PageProps {
  searchParams: Promise<{ paid?: string; retry?: string }>;
}

export default async function AccountPage({ searchParams }: PageProps) {
  const { paid, retry } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/account");

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const admin = createAdminClient();
  const { data: recentOrders } = await admin
    .from("orders")
    .select("id, order_number, created_at, status, total_cents, order_type, slot_start, slot_end, items")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Preferiti del cliente (con join sui dishes per nome+image+prezzo)
  const { data: favoritesRaw } = await admin
    .from("favorites")
    .select(
      "dish_id, created_at, dishes!inner(id, name, image, image_alt, price, is_active)",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const favorites = (favoritesRaw ?? [])
    .map((f) => {
      // dishes potrebbe essere object o array a seconda dello stato del client
      const dish = Array.isArray(f.dishes) ? f.dishes[0] : f.dishes;
      if (!dish) return null;
      return {
        id: dish.id,
        name: dish.name,
        image: dish.image,
        imageAlt: dish.image_alt,
        price: dish.price,
        isActive: dish.is_active,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {paid && <ClearCartOnMount />}
      {paid && (
        <div className="rounded-xl border border-bamboo/40 bg-bamboo/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-bamboo shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-bamboo">
              Ordine #{paid} confermato! 🎉
            </p>
            <p className="text-sm text-warm-gray mt-0.5">
              Lo trovi qui sotto tra i tuoi ordini recenti.
            </p>
            <Link
              href={`/account/orders/${paid}`}
              className="text-xs font-medium text-bamboo hover:text-bamboo-deep underline-offset-2 hover:underline"
            >
              Vedi stato ordine →
            </Link>
          </div>
        </div>
      )}

      {retry && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">Pagamento non completato</p>
          <p className="text-sm text-amber-800 mt-0.5">
            Riprova dall&apos;ordine{" "}
            <Link
              href={`/account/orders/${retry}`}
              className="underline font-medium"
            >
              #{retry}
            </Link>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl font-serif-jp text-ink">Il mio profilo</h1>
        <p className="text-sm text-warm-gray">{user.email}</p>
      </div>

      {/* Preferiti del cliente */}
      {favorites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-sushi-red text-sushi-red" />I miei preferiti
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {favorites.map((d) => (
              <Link
                key={d.id}
                href={`/menu#dish-${d.id}`}
                className="group flex flex-col gap-1"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border">
                  {d.image ? (
                    <Image
                      src={d.image}
                      alt={d.imageAlt}
                      fill
                      sizes="100px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-paper-warm" />
                  )}
                  {!d.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-[10px] font-bold uppercase tracking-wider text-paper">
                      Esaurito
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-medium text-ink truncate">{d.name}</p>
                <p className="text-[10px] tabular-nums text-bamboo">
                  €{(d.price / 100).toFixed(2).replace(".", ",")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">I miei ordini recenti</h2>
          <ul className="space-y-2">
            {recentOrders.map((o) => {
              const its = Array.isArray(o.items)
                ? (o.items as Array<{ name?: string; qty?: number }>).map((it) => ({
                    name: it.name ?? "Piatto",
                    qty: it.qty ?? 1,
                  }))
                : [];
              const dateText = new Date(o.created_at).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
              });
              const statusText = statusLabel(
                getEffectiveStatus({
                  status: o.status,
                  order_type: o.order_type,
                  slot_start: o.slot_start,
                  created_at: o.created_at,
                }),
                o.order_type,
              );
              return (
                <RecentOrderRow
                  key={o.id}
                  orderNumber={o.order_number}
                  orderType={o.order_type}
                  dateText={dateText}
                  statusText={statusText}
                  totalCents={o.total_cents}
                  items={its}
                />
              );
            })}
          </ul>
        </div>
      )}

      <AccountForm
        defaultName={customer?.name ?? ""}
        defaultPhone={customer?.phone ?? ""}
        defaultMarketingConsent={customer?.marketing_consent ?? false}
      />

      <div className="pt-8 border-t border-bamboo/20">
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto border-sushi-red/40 text-sushi-red hover:bg-sushi-red/10"
          >
            Esci
          </Button>
        </form>
      </div>
    </div>
  );
}
