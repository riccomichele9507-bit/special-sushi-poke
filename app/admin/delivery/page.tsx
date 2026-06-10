import { createAdminClient } from "@/lib/supabase/admin";
import { DeliveryForm } from "./delivery-form";

export default async function AdminDeliveryPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("delivery_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Consegne & orari</h1>
        <p className="text-sm text-warm-gray mt-1">
          Tutti i parametri del motore consegna. Modifiche immediate sul sito.
        </p>
      </div>
      <DeliveryForm settings={data} />
    </div>
  );
}
