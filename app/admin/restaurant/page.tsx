import { createAdminClient } from "@/lib/supabase/admin";
import { RestaurantForm } from "./restaurant-form";

export default async function AdminRestaurantPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("restaurant_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Dati ristorante</h1>
        <p className="text-sm text-warm-gray mt-1">
          Nome, indirizzo, contatti, orari pubblici, social. Vengono mostrati
          nelle pagine pubbliche e nella vetrina del sito.
        </p>
      </div>
      <RestaurantForm data={data} />
    </div>
  );
}
