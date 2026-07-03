import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
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

  const catMap = new Map((categories ?? []).map((c) => [c.id, c.label]));

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

      <ul className="divide-y divide-bamboo/10 overflow-hidden rounded-lg border border-bamboo/20">
        {dishes?.map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-3 py-3">
            {/* Modifica: pulsante a lato, sempre visibile anche su mobile */}
            <Link
              href={`/admin/menu/${d.id}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bamboo px-3 py-2 text-xs font-semibold text-paper hover:bg-bamboo/90"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifica
            </Link>
            {d.image ? (
              <img
                src={d.image}
                alt=""
                className="h-11 w-11 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-11 w-11 shrink-0 rounded bg-bamboo/10" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{d.name}</p>
              <p className="truncate text-xs text-warm-gray">
                {catMap.get(d.category_id) ?? d.category_id} · €
                {(d.price / 100).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-warm-gray">
                Disp.
              </span>
              <DishRowToggle dishId={d.id} active={d.is_active} />
            </div>
          </li>
        ))}
        {(!dishes || dishes.length === 0) && (
          <li className="px-4 py-8 text-center text-warm-gray">
            Nessun piatto trovato.
          </li>
        )}
      </ul>
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
