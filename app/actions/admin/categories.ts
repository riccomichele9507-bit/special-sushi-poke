"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const categorySchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(40),
  available: z.boolean().default(true),
  icon_name: z.string().trim().nullable().optional(),
  kanji: z.string().trim().nullable().optional(),
  color_from: z.string().trim().nullable().optional(),
  color_to: z.string().trim().nullable().optional(),
  sort_order: z.number().int().nonnegative().default(0),
});

export async function updateCategory(
  fd: FormData,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const row = categorySchema.parse({
        id: fd.get("id"),
        label: fd.get("label"),
        slug: fd.get("slug"),
        available: fd.get("available") === "on",
        icon_name: (fd.get("icon_name") as string) || null,
        kanji: (fd.get("kanji") as string) || null,
        color_from: (fd.get("color_from") as string) || null,
        color_to: (fd.get("color_to") as string) || null,
        sort_order: parseInt((fd.get("sort_order") as string) || "0", 10),
      });
      const { error } = await sb.from("categories").upsert(row);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/categories", "/menu", "/"], tags: ["categories"] },
  );
}

export async function toggleCategoryAvailable(
  id: string,
  available: boolean,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb
        .from("categories")
        .update({ available })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/categories", "/menu", "/"], tags: ["categories"] },
  );
}
