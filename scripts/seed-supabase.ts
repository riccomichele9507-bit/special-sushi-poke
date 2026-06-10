/**
 * Seed Supabase 'Special Sushi' from static data/*.ts files.
 * Idempotent (upsert su PK). Run: npm run seed
 *
 * Env richieste (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (server-only, mai esposta al client)
 */

import { config as loadEnv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, "../.env.local") });

import { menu } from "../data/menu";
import { categories, categoryKanji, categoryColors } from "../data/categories";
import { restaurant } from "../data/restaurant";
import { dailySpecial } from "../data/specials";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "ERRORE: Manca NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedRestaurantSettings() {
  const r = restaurant;
  const { error } = await supabase.from("restaurant_settings").upsert({
    id: 1,
    name: r.name,
    tagline: r.tagline,
    street: r.address.street,
    city: r.address.city,
    postal_code: r.address.postalCode,
    country: r.address.country,
    full_address: r.address.fullAddress,
    phone: r.phone,
    phone_display: r.phoneDisplay,
    whatsapp: r.whatsapp,
    whatsapp_display: r.whatsappDisplay,
    email: r.email,
    hours_weekdays: r.hours.weekdays,
    hours_weekend: r.hours.weekend,
    hours_closed: r.hours.closed,
    instagram: r.social.instagram,
    facebook: r.social.facebook,
    lat: r.coords.lat,
    lng: r.coords.lng,
    map_embed_url: r.mapEmbedUrl,
    delivery_radius_km: r.deliveryRadiusKm,
    cuisine: r.cuisine,
    price_range: r.priceRange,
  });
  if (error) throw new Error(`restaurant_settings: ${error.message}`);
  console.log("  OK restaurant_settings (1)");
}

async function seedCategories() {
  const rows = categories.map((c, i) => ({
    id: c.id,
    label: c.label,
    slug: c.slug,
    available: c.available,
    icon_name: c.iconName ?? null,
    kanji: categoryKanji[c.id] ?? null,
    color_from: categoryColors[c.id]?.from ?? null,
    color_to: categoryColors[c.id]?.to ?? null,
    sort_order: i,
  }));
  const { error } = await supabase.from("categories").upsert(rows);
  if (error) throw new Error(`categories: ${error.message}`);
  console.log(`  OK categories (${rows.length})`);
}

async function seedDishes() {
  const rows = menu.map((d, i) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    ingredients: d.ingredients,
    price: d.price,
    category_id: d.category,
    image: d.image,
    image_alt: d.imageAlt,
    allergens: d.allergens,
    spicy_level: d.spicyLevel,
    is_new: d.isNew ?? false,
    is_vegan: d.isVegan ?? false,
    is_featured: d.isFeatured ?? false,
    is_most_ordered: d.isMostOrdered ?? false,
    pieces: d.pieces ?? null,
    bg_from: d.bgFrom ?? null,
    bg_to: d.bgTo ?? null,
    sort_order: i,
  }));
  // Upsert in batch da 50 per limitare la dimensione di ogni request
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("dishes").upsert(chunk);
    if (error) throw new Error(`dishes batch ${i}-${i + chunk.length}: ${error.message}`);
  }
  console.log(`  OK dishes (${rows.length})`);
}

async function seedDailySpecial() {
  const s = dailySpecial;
  const { error } = await supabase.from("daily_special").upsert({
    id: 1,
    dish_id: s.dishId,
    label: s.label,
    badge_label: s.badgeLabel,
    discount_percent: s.discountPercent,
    end_time_local: s.endTimeLocal,
    is_active: true,
  });
  if (error) throw new Error(`daily_special: ${error.message}`);
  console.log(`  OK daily_special (dishId=${s.dishId})`);
}

async function main() {
  console.log("Seeding Supabase 'Special Sushi' (lbdwvgcnwvkisrjqremx)...\n");
  // Ordine importante per i FK: categories prima di dishes, dishes prima di daily_special
  await seedRestaurantSettings();
  await seedCategories();
  await seedDishes();
  await seedDailySpecial();
  console.log("\nSeed completo.");
}

main().catch((e) => {
  console.error("\nSeed fallito:", e.message);
  process.exit(1);
});
