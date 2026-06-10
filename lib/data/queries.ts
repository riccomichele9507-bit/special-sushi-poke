// Data layer SERVER-ONLY: legge dal DB Supabase e mappa alle interfacce app (types/dish.ts).
// Usato da RSC e Server Actions. Per query specifiche utente (orders di un cliente),
// vedi lib/data/orders.ts (creato in FASE C).
//
// Cache: `cache()` di React deduplicate per request. Per cross-request usare
// `unstable_cache` o `export const revalidate` lato page.

import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Category,
  CategoryId,
  Dish,
  Allergen,
  SpicyLevel,
} from "@/types/dish";
import type { Database } from "@/lib/supabase/database.types";

type DishRow = Database["public"]["Tables"]["dishes"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type RestaurantRow = Database["public"]["Tables"]["restaurant_settings"]["Row"];
type DailySpecialRow = Database["public"]["Tables"]["daily_special"]["Row"];
type DeliverySettingsRow = Database["public"]["Tables"]["delivery_settings"]["Row"];

// ============================================================
// Mappers DB row → app type
// ============================================================
function mapRowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ingredients: row.ingredients,
    price: row.price,
    category: row.category_id as CategoryId,
    image: row.image,
    imageAlt: row.image_alt,
    allergens: row.allergens as Allergen[],
    spicyLevel: row.spicy_level as SpicyLevel,
    isNew: row.is_new || undefined,
    isVegan: row.is_vegan || undefined,
    isFeatured: row.is_featured || undefined,
    isMostOrdered: row.is_most_ordered || undefined,
    pieces: row.pieces ?? undefined,
    bgFrom: row.bg_from ?? undefined,
    bgTo: row.bg_to ?? undefined,
  };
}

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id as CategoryId,
    label: row.label,
    slug: row.slug,
    available: row.available,
    iconName: row.icon_name ?? undefined,
  };
}

// Client riusato fra le query (admin = bypassa RLS, ok per letture pubbliche)
const supabase = () => createAdminClient();

// ============================================================
// Dishes
// ============================================================
export const getMenu = cache(async (): Promise<Dish[]> => {
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getMenu: ${error.message}`);
  return (data ?? []).map(mapRowToDish);
});

export const getAllDishes = cache(async (): Promise<Dish[]> => {
  // Include is_active=false (per admin)
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getAllDishes: ${error.message}`);
  return (data ?? []).map(mapRowToDish);
});

export const getDishById = cache(
  async (id: string): Promise<Dish | undefined> => {
    const { data, error } = await supabase()
      .from("dishes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`getDishById(${id}): ${error.message}`);
    return data ? mapRowToDish(data) : undefined;
  },
);

export const getDishesByCategory = cache(
  async (categoryId: string): Promise<Dish[]> => {
    const { data, error } = await supabase()
      .from("dishes")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error)
      throw new Error(`getDishesByCategory(${categoryId}): ${error.message}`);
    return (data ?? []).map(mapRowToDish);
  },
);

export const getFeaturedDishes = cache(async (): Promise<Dish[]> => {
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getFeaturedDishes: ${error.message}`);
  return (data ?? []).map(mapRowToDish);
});

export const getMostOrderedDishes = cache(async (): Promise<Dish[]> => {
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .eq("is_most_ordered", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getMostOrderedDishes: ${error.message}`);
  return (data ?? []).map(mapRowToDish);
});

export const searchDishes = cache(async (query: string): Promise<Dish[]> => {
  if (!query.trim()) return [];
  const term = `%${query.trim().replace(/[%_]/g, "\\$&")}%`;
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.${term},description.ilike.${term}`)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`searchDishes: ${error.message}`);
  return (data ?? []).map(mapRowToDish);
});

// ============================================================
// Categories
// ============================================================
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await supabase()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getCategories: ${error.message}`);
  return (data ?? []).map(mapRowToCategory);
});

export const getAvailableCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await supabase()
    .from("categories")
    .select("*")
    .eq("available", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getAvailableCategories: ${error.message}`);
  return (data ?? []).map(mapRowToCategory);
});

// ============================================================
// Singletons
// ============================================================
export const getRestaurant = cache(async (): Promise<RestaurantRow | null> => {
  const { data, error } = await supabase()
    .from("restaurant_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`getRestaurant: ${error.message}`);
  return data;
});

export const getDailySpecial = cache(
  async (): Promise<DailySpecialRow | null> => {
    const { data, error } = await supabase()
      .from("daily_special")
      .select("*")
      .eq("id", 1)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(`getDailySpecial: ${error.message}`);
    return data;
  },
);

export const getDeliverySettings = cache(
  async (): Promise<DeliverySettingsRow | null> => {
    const { data, error } = await supabase()
      .from("delivery_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(`getDeliverySettings: ${error.message}`);
    return data;
  },
);
