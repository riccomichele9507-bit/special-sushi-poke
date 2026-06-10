import { createAdminClient } from "@/lib/supabase/admin";
import { DishForm } from "../dish-form";

export default async function NewDishPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, label")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-serif-jp text-ink">Nuovo piatto</h1>
      <DishForm dish={null} categories={categories ?? []} />
    </div>
  );
}
