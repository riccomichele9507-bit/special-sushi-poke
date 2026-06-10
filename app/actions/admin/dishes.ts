"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const dishSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  ingredients: z.array(z.string().trim()).default([]),
  price: z.number().int().nonnegative(),
  category_id: z.string().min(1),
  image: z.string().default(""),
  image_alt: z.string().trim().default(""),
  allergens: z.array(z.string()).default([]),
  spicy_level: z.number().int().min(0).max(3).default(0),
  is_new: z.boolean().default(false),
  is_vegan: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_most_ordered: z.boolean().default(false),
  pieces: z.number().int().positive().nullable().optional(),
  bg_from: z.string().nullable().optional(),
  bg_to: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().nonnegative().default(0),
});

function parseFromFormData(fd: FormData) {
  const ingredients = (fd.get("ingredients") as string) || "";
  const allergens = (fd.get("allergens") as string) || "";
  return dishSchema.parse({
    id: fd.get("id"),
    name: fd.get("name"),
    description: fd.get("description") || "",
    ingredients: ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    price: Math.round(parseFloat((fd.get("price") as string) || "0") * 100),
    category_id: fd.get("category_id"),
    image: fd.get("image") || "",
    image_alt: fd.get("image_alt") || "",
    allergens: allergens
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    spicy_level: parseInt((fd.get("spicy_level") as string) || "0", 10),
    is_new: fd.get("is_new") === "on",
    is_vegan: fd.get("is_vegan") === "on",
    is_featured: fd.get("is_featured") === "on",
    is_most_ordered: fd.get("is_most_ordered") === "on",
    pieces: fd.get("pieces") ? parseInt(fd.get("pieces") as string, 10) : null,
    bg_from: (fd.get("bg_from") as string) || null,
    bg_to: (fd.get("bg_to") as string) || null,
    is_active: fd.get("is_active") === "on",
    sort_order: parseInt((fd.get("sort_order") as string) || "0", 10),
  });
}

export async function updateDish(fd: FormData): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const row = parseFromFormData(fd);
      const { error } = await sb.from("dishes").upsert(row);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/menu", "/menu", "/"], tags: ["dishes"] },
  );
}

export async function toggleDishActive(
  dishId: string,
  isActive: boolean,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb
        .from("dishes")
        .update({ is_active: isActive })
        .eq("id", dishId);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/menu", "/menu", "/"], tags: ["dishes"] },
  );
}

export async function deleteDish(dishId: string): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb.from("dishes").delete().eq("id", dishId);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/menu", "/menu"], tags: ["dishes"] },
  );
}
