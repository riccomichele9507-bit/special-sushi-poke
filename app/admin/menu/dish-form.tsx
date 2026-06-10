"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDish, deleteDish } from "@/app/actions/admin/dishes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DishRow = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category_id: string;
  image: string;
  image_alt: string;
  allergens: string[];
  spicy_level: number;
  is_new: boolean;
  is_vegan: boolean;
  is_featured: boolean;
  is_most_ordered: boolean;
  pieces: number | null;
  bg_from: string | null;
  bg_to: string | null;
  is_active: boolean;
  sort_order: number;
};

export function DishForm({
  dish,
  categories,
}: {
  dish: DishRow | null;
  categories: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await updateDish(fd);
      if (r.ok) {
        toast.success("Piatto salvato");
        router.push("/admin/menu");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  async function handleDelete() {
    if (!dish) return;
    if (
      !confirm(
        `Eliminare definitivamente "${dish.name}"? Questa azione non si annulla.`,
      )
    )
      return;
    startTransition(async () => {
      const r = await deleteDish(dish.id);
      if (r.ok) {
        toast.success("Piatto eliminato");
        router.push("/admin/menu");
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <form action={action} className="space-y-5">
      <Field label="ID slug" required hint="es. nigiri-salmon. Non modificare se esistente.">
        <Input name="id" defaultValue={dish?.id} required maxLength={80} readOnly={!!dish} />
      </Field>
      <Field label="Nome" required>
        <Input name="name" defaultValue={dish?.name ?? ""} required maxLength={120} />
      </Field>
      <Field label="Descrizione">
        <Textarea name="description" defaultValue={dish?.description ?? ""} rows={2} maxLength={500} />
      </Field>
      <Field label="Ingredienti" hint="Separati da virgola">
        <Input name="ingredients" defaultValue={(dish?.ingredients ?? []).join(", ")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prezzo €" required>
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={dish ? (dish.price / 100).toFixed(2) : ""}
            required
          />
        </Field>
        <Field label="Categoria" required>
          <select
            name="category_id"
            defaultValue={dish?.category_id ?? ""}
            required
            className="w-full rounded-md border border-bamboo/30 bg-paper px-3 py-2"
          >
            <option value="">— Seleziona —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Path immagine" hint="es. /menu/nigiri-salmon.png">
        <Input name="image" defaultValue={dish?.image ?? ""} />
      </Field>
      <Field label="Alt immagine">
        <Input name="image_alt" defaultValue={dish?.image_alt ?? ""} />
      </Field>
      <Field label="Allergeni" hint="Separati da virgola: pesce, crostacei, soia, latte, glutine, uova, sesamo, frutta-secca, molluschi">
        <Input name="allergens" defaultValue={(dish?.allergens ?? []).join(", ")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Spicy (0-3)">
          <Input name="spicy_level" type="number" min="0" max="3" defaultValue={dish?.spicy_level ?? 0} />
        </Field>
        <Field label="Pezzi (opzionale)">
          <Input name="pieces" type="number" min="1" defaultValue={dish?.pieces ?? ""} />
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Check name="is_active" label="Disponibile" defaultChecked={dish?.is_active ?? true} />
        <Check name="is_new" label="Nuovo" defaultChecked={dish?.is_new ?? false} />
        <Check name="is_vegan" label="Vegano" defaultChecked={dish?.is_vegan ?? false} />
        <Check name="is_featured" label="Featured" defaultChecked={dish?.is_featured ?? false} />
        <Check name="is_most_ordered" label="Più ordinato" defaultChecked={dish?.is_most_ordered ?? false} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="bg_from" hint="HEX, opz">
          <Input name="bg_from" defaultValue={dish?.bg_from ?? ""} />
        </Field>
        <Field label="bg_to" hint="HEX, opz">
          <Input name="bg_to" defaultValue={dish?.bg_to ?? ""} />
        </Field>
        <Field label="Ordine">
          <Input name="sort_order" type="number" defaultValue={dish?.sort_order ?? 0} />
        </Field>
      </div>

      {error && (
        <div className="rounded bg-sushi-red/10 border border-sushi-red/30 text-sushi-red text-sm p-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending} className="bg-bamboo text-paper hover:bg-bamboo/90">
          {pending ? "Salvataggio..." : "Salva"}
        </Button>
        {dish && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={pending}
            className="border-sushi-red/40 text-sushi-red hover:bg-sushi-red/10"
          >
            Elimina piatto
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">
        {label}
        {required && <span className="text-sushi-red ml-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-warm-gray">{hint}</p>}
    </div>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
      />
      {label}
    </label>
  );
}
