"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleCategoryAvailable } from "@/app/actions/admin/categories";

type Category = {
  id: string;
  label: string;
  slug: string;
  available: boolean;
  kanji: string | null;
  sort_order: number;
};

export function CategoryRow({ category }: { category: Category }) {
  const [pending, startTransition] = useTransition();
  return (
    <tr className="border-t border-bamboo/10">
      <td className="px-4 py-2 text-warm-gray">{category.sort_order}</td>
      <td className="px-4 py-2 font-medium">{category.label}</td>
      <td className="px-4 py-2 text-warm-gray font-mono text-xs">
        {category.slug}
      </td>
      <td className="px-4 py-2 text-2xl font-serif-jp">
        {category.kanji ?? "—"}
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          defaultChecked={category.available}
          disabled={pending}
          onChange={(e) => {
            const next = e.currentTarget.checked;
            startTransition(async () => {
              const r = await toggleCategoryAvailable(category.id, next);
              if (!r.ok) {
                toast.error(r.error);
                e.target.checked = category.available;
              } else {
                toast.success(next ? "Disponibile" : "Nascosta dal menu");
              }
            });
          }}
          className="h-4 w-4 rounded border-bamboo/40 text-bamboo focus:ring-bamboo"
        />
      </td>
    </tr>
  );
}
