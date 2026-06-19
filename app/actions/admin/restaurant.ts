"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const restaurantSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).nullable(),
  street: z.string().trim().max(200).nullable(),
  city: z.string().trim().max(120).nullable(),
  postal_code: z.string().trim().max(20).nullable(),
  country: z.string().trim().max(80).nullable(),
  full_address: z.string().trim().max(300).nullable(),
  phone: z.string().trim().max(40).nullable(),
  phone_display: z.string().trim().max(40).nullable(),
  whatsapp: z.string().trim().max(40).nullable(),
  whatsapp_display: z.string().trim().max(40).nullable(),
  email: z.string().trim().max(200).nullable(),
  hours_weekdays: z.string().trim().max(120).nullable(),
  hours_weekend: z.string().trim().max(120).nullable(),
  hours_closed: z.string().trim().max(120).nullable(),
  instagram: z.string().trim().max(200).nullable(),
  facebook: z.string().trim().max(200).nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  map_embed_url: z.string().trim().max(500).nullable(),
  delivery_radius_km: z.number().int().positive().nullable(),
  cuisine: z.array(z.string()).default([]),
  price_range: z.string().trim().max(20).nullable(),
  manual_pause: z.boolean().default(false),
  auto_promo_active: z.boolean().default(true),
  auto_promo_percent: z.number().int().min(0).max(100).default(20),
  auto_promo_min_cents: z.number().int().min(0).default(5000),
});

function nullableStr(fd: FormData, key: string) {
  const v = (fd.get(key) as string) || "";
  return v.trim() === "" ? null : v.trim();
}

export async function updateRestaurant(
  fd: FormData,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const cuisine = ((fd.get("cuisine") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const row = restaurantSchema.parse({
        name: fd.get("name"),
        tagline: nullableStr(fd, "tagline"),
        street: nullableStr(fd, "street"),
        city: nullableStr(fd, "city"),
        postal_code: nullableStr(fd, "postal_code"),
        country: nullableStr(fd, "country"),
        full_address: nullableStr(fd, "full_address"),
        phone: nullableStr(fd, "phone"),
        phone_display: nullableStr(fd, "phone_display"),
        whatsapp: nullableStr(fd, "whatsapp"),
        whatsapp_display: nullableStr(fd, "whatsapp_display"),
        email: nullableStr(fd, "email"),
        hours_weekdays: nullableStr(fd, "hours_weekdays"),
        hours_weekend: nullableStr(fd, "hours_weekend"),
        hours_closed: nullableStr(fd, "hours_closed"),
        instagram: nullableStr(fd, "instagram"),
        facebook: nullableStr(fd, "facebook"),
        lat: fd.get("lat") ? parseFloat(fd.get("lat") as string) : null,
        lng: fd.get("lng") ? parseFloat(fd.get("lng") as string) : null,
        map_embed_url: nullableStr(fd, "map_embed_url"),
        delivery_radius_km: fd.get("delivery_radius_km")
          ? parseInt(fd.get("delivery_radius_km") as string, 10)
          : null,
        cuisine,
        price_range: nullableStr(fd, "price_range"),
        manual_pause: fd.get("manual_pause") === "on",
        auto_promo_active: fd.get("auto_promo_active") === "on",
        auto_promo_percent: fd.get("auto_promo_percent")
          ? parseInt(fd.get("auto_promo_percent") as string, 10)
          : 20,
        auto_promo_min_cents: fd.get("auto_promo_min_euro")
          ? Math.round(parseFloat(fd.get("auto_promo_min_euro") as string) * 100)
          : 5000,
      });
      const { error } = await sb
        .from("restaurant_settings")
        .update(row)
        .eq("id", 1);
      if (error) throw new Error(error.message);
    },
    {
      revalidate: ["/", "/profile", "/admin/restaurant"],
      tags: ["restaurant"],
    },
  );
}

export async function toggleManualPause(
  paused: boolean,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb
        .from("restaurant_settings")
        .update({ manual_pause: paused })
        .eq("id", 1);
      if (error) throw new Error(error.message);
    },
    {
      revalidate: ["/", "/checkout", "/admin", "/admin/restaurant", "/admin/delivery"],
      tags: ["restaurant"],
    },
  );
}
