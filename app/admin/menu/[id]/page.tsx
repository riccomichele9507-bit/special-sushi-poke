import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DishForm } from "../dish-form";

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: dish }, { data: categories }] = await Promise.all([
    supabase.from("dishes").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("id, label")
      .order("sort_order", { ascending: true }),
  ]);
  if (!dish) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif-jp text-ink">Modifica piatto</h1>
        <p className="text-sm text-warm-gray mt-1">
          id: <code>{id}</code>
        </p>
      </div>
      <DishForm dish={dish} categories={categories ?? []} />
    </div>
  );
}
