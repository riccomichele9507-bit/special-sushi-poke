import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { AccountForm } from "./account-form";
import { ReorderButton } from "@/components/account/reorder-button";
import { getLoyaltyStatus, POINTS_REDEMPTION_THRESHOLD } from "@/lib/loyalty/points";
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

  const loyalty = await getLoyaltyStatus(user.id);

  const admin = createAdminClient();
  const { data: recentOrders } = await admin
    .from("orders")
    .select("id, order_number, created_at, status, total_cents, order_type, slot_start, slot_end")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const progressPct = Math.min(
    100,
    ((loyalty.balance % POINTS_REDEMPTION_THRESHOLD) /
      POINTS_REDEMPTION_THRESHOLD) *
      100,
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {paid && (
        <div className="rounded-xl border border-bamboo/40 bg-bamboo/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-bamboo shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-bamboo">Pagamento confermato!</p>
            <p className="text-sm text-warm-gray mt-0.5">
              Ordine{" "}
              <span className="font-mono font-semibold text-ink">#{paid}</span>{" "}
              ricevuto. I tuoi punti sono stati aggiornati qui sotto 👇
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
        <h1 className="text-3xl font-serif-jp text-ink">I miei Premi</h1>
        <p className="text-sm text-warm-gray">{user.email}</p>
      </div>

      {/* Loyalty card */}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-bamboo/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-bamboo-deep">
            <Star className="h-3 w-3 fill-gold text-gold" />
            Programma fedeltà
          </p>
          <p className="text-xs text-warm-gray">
            {loyalty.ordersCount} ordini · €{(loyalty.totalSpentCents / 100).toFixed(0)} spesi
          </p>
        </div>
        <p className="text-3xl font-bold text-ink">
          {loyalty.balance} <span className="text-base font-normal text-warm-gray">punti</span>
        </p>
        {loyalty.balance >= POINTS_REDEMPTION_THRESHOLD ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-bamboo">
            <Sparkles className="h-4 w-4" />
            Hai sbloccato uno sconto di €{loyalty.euroNextReward}! Sarà applicato al prossimo ordine.
          </p>
        ) : (
          <>
            <div className="mt-3 h-2 w-full rounded-full bg-paper-warm overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bamboo to-gold transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-warm-gray">
              Ti mancano <strong>{loyalty.pointsToNextReward} punti</strong> per uno sconto di €
              {loyalty.euroNextReward}.
            </p>
          </>
        )}
        <p className="mt-3 text-[11px] text-warm-gray/70">
          1€ speso = 1 punto. 100 punti = €10 di sconto. Solo ordini consegnati.
        </p>
      </div>

      {/* Recent orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">I miei ordini recenti</h2>
          <ul className="space-y-2">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border bg-paper p-3 transition hover:border-bamboo/40 hover:bg-bamboo/5"
              >
                <Link
                  href={`/account/orders/${o.order_number}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-ink truncate">
                    {o.order_type === "delivery" ? "🛵" : "🏪"} {o.order_number}
                  </p>
                  <p className="text-xs text-warm-gray">
                    {new Date(o.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    · {statusLabel(
                      getEffectiveStatus({
                        status: o.status,
                        order_type: o.order_type,
                        slot_start: o.slot_start,
                        created_at: o.created_at,
                      }),
                      o.order_type,
                    )}
                  </p>
                </Link>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    €{(o.total_cents / 100).toFixed(2).replace(".", ",")}
                  </span>
                  <ReorderButton orderNumber={o.order_number} />
                </div>
              </li>
            ))}
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
