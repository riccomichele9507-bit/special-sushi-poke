import { createAdminClient } from "@/lib/supabase/admin";
import { CampaignBuilder } from "./campaign-builder";

// Sezione Campagne: segmentazione audience (registrati + guest) + invio email.
// Protetta da requireAdmin nel layout admin.
export default async function AdminMarketingPage() {
  const sb = createAdminClient();
  const [cats, codes] = await Promise.all([
    sb.from("categories").select("id, label").eq("available", true).order("sort_order"),
    sb.from("discount_codes").select("code, label, active").eq("active", true).order("code"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Campagne email</h1>
        <p className="mt-1 text-sm text-warm-gray">
          Segmenta i clienti (registrati + guest) e invia una campagna. L&apos;invio
          rispetta il consenso e include sempre il link di disiscrizione.
        </p>
      </div>

      <CampaignBuilder
        categories={cats.data ?? []}
        discountCodes={(codes.data ?? []).map((c) => ({ code: c.code, label: c.label }))}
      />
    </div>
  );
}
