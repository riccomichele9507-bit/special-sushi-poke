"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const timeHHmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm");

const settingsSchema = z
  .object({
    prep_minutes: z.number().int().positive(),
    buffer_minutes: z.number().int().nonnegative(),
    baseline_min_minutes: z.number().int().positive(),
    baseline_pickup_min: z.number().int().positive(),
    max_orders_per_slot: z.number().int().min(1).max(50),
    slot_duration_minutes: z.number().int().min(15).max(60),
    service_lunch_start_time: timeHHmm,
    service_lunch_last_order_time: timeHHmm,
    service_lunch_last_delivery_time: timeHHmm,
    service_dinner_start_time: timeHHmm,
    service_dinner_last_order_time: timeHHmm,
    service_dinner_last_delivery_time: timeHHmm,
    service_dinner_weekend_last_order_time: timeHHmm,
    service_dinner_weekend_last_delivery_time: timeHHmm,
    closed_weekdays: z.array(z.number().int().min(0).max(6)),
    max_distance_km: z.number().int().positive(),
    free_delivery_max_km: z.number().int().positive(),
    min_cart_cents_above_free: z.number().int().nonnegative(),
  })
  .refine(
    (v) => v.free_delivery_max_km <= v.max_distance_km,
    "free_delivery_max_km deve essere ≤ max_distance_km",
  )
  .refine(
    (v) => v.baseline_min_minutes >= v.prep_minutes + v.buffer_minutes,
    "baseline_min_minutes deve essere ≥ prep+buffer",
  );

export async function updateDeliverySettings(
  fd: FormData,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const closedDays = ((fd.get("closed_weekdays") as string) || "")
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      const intField = (k: string) =>
        parseInt((fd.get(k) as string) || "0", 10);

      // travel_buckets NON è più modificabile da questo form (rimosso il campo
      // JSON per evitare modifiche accidentali). Non è incluso nell'update →
      // la colonna resta invariata a DB.
      const row = settingsSchema.parse({
        prep_minutes: intField("prep_minutes"),
        buffer_minutes: intField("buffer_minutes"),
        baseline_min_minutes: intField("baseline_min_minutes"),
        baseline_pickup_min: intField("baseline_pickup_min"),
        max_orders_per_slot: intField("max_orders_per_slot"),
        slot_duration_minutes: intField("slot_duration_minutes"),
        service_lunch_start_time: fd.get("service_lunch_start_time"),
        service_lunch_last_order_time: fd.get("service_lunch_last_order_time"),
        service_lunch_last_delivery_time: fd.get(
          "service_lunch_last_delivery_time",
        ),
        service_dinner_start_time: fd.get("service_dinner_start_time"),
        service_dinner_last_order_time: fd.get("service_dinner_last_order_time"),
        service_dinner_last_delivery_time: fd.get(
          "service_dinner_last_delivery_time",
        ),
        service_dinner_weekend_last_order_time: fd.get(
          "service_dinner_weekend_last_order_time",
        ),
        service_dinner_weekend_last_delivery_time: fd.get(
          "service_dinner_weekend_last_delivery_time",
        ),
        closed_weekdays: closedDays,
        max_distance_km: intField("max_distance_km"),
        free_delivery_max_km: intField("free_delivery_max_km"),
        min_cart_cents_above_free: intField("min_cart_cents_above_free"),
      });

      const { error } = await sb
        .from("delivery_settings")
        .update(row)
        .eq("id", 1);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/delivery", "/", "/checkout"], tags: ["delivery"] },
  );
}
