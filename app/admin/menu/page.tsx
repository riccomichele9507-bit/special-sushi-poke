import Link from "next/link";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { DishRowToggle } from "./dish-row-toggle";

type SearchParams = { filter?: string; category?: string };

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("dishes")
    .select("id, name, price, category_id, is_active, image, sort_order")
    .order("category_id", { ascending: true })
    .order("sort_order", { ascending: true });
  if (params.filter === "sold_out") query = query.eq("is_active", false);
  if (params.category) query = query.eq("category_id", params.category);

  const [{ data: dishes }, { data: categories }] = await Promise.all([
    query,
    supabase
      .from("categories")
      .select("id, label")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif-jp text-ink">Piatti</h1>
          <p className="text-sm text-warm-gray mt-1">
            Modifica nome, prezzo, foto, esaurito. {dishes?.length ?? 0} piatti
            mostrati.
          </p>
        </div>
        <Link href="/admin/menu/new">
          <Button className="bg-bamboo text-paper hover:bg-bamboo/90">
            <Plus className="h-4 w-4 mr-1" /> Nuovo piatto
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/menu" active={!params.filter && !params.category}>
          Tutti
        </FilterChip>
        <FilterChip
          href="/admin/menu?filter=sold_out"
          active={params.filter === "sold_out"}
        >
          Esauriti
        </FilterChip>
        {categories?.map((c) => (
          <FilterChip
            key={c.id}
            href={`/admin/menu?category=${c.id}`}
            active={params.category === c.id}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      <div className="rounded-lg border border-bamboo/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bamboo/5 text-left">
            <tr>
              <th className="px-4 py-2">Piatto</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2 text-right">Prezzo</th>
              <th className="px-4 py-2 text-center">Disponibile</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {dishes?.map((d) => (
              <tr
                key={d.id}
                className="border-t border-bamboo/10 hover:bg-bamboo/5"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {d.image ? (
                      <img
                        src={d.image}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-bamboo/10" />
                    )}
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-warm-gray">{d.category_id}</td>
                <td className="px-4 py-2 text-right">
                  €{(d.price / 100).toFixed(2).replace(".", ",")}
                </td>
                <td className="px-4 py-2 text-center">
                  <DishRowToggle dishId={d.id} active={d.is_active} />
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/admin/menu/${d.id}`}
                    className="text-bamboo text-sm hover:underline"
                  >
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
            {(!dishes || dishes.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warm-gray">
                  Nessun piatto trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs border transition-colors ${
        active
          ? "bg-bamboo text-paper border-bamboo"
          : "bg-paper text-warm-gray border-bamboo/20 hover:bg-bamboo/5"
      }`}
    >
      {children}
    </Link>
  );
}
