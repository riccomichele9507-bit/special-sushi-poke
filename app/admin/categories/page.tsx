import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryRow } from "./category-row";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif-jp text-ink">Categorie</h1>
        <p className="text-sm text-warm-gray mt-1">
          Le categorie del menu. Toggle &quot;disponibile&quot; nasconde l&apos;intera
          categoria dal pubblico.
        </p>
      </div>

      <div className="rounded-lg border border-bamboo/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-4 py-2">Ordine</th>
              <th className="px-4 py-2">Etichetta</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Kanji</th>
              <th className="px-4 py-2 text-center">Disponibile</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => <CategoryRow key={c.id} category={c} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
