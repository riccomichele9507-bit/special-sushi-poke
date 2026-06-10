"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const specialSchema = z.object({
  dish_id: z.string().trim().nullable(),
  label: z.string().trim().max(80).nullable(),
  badge_label: z.string().trim().max(40).nullable(),
  discount_percent: z.number().int().min(0).max(100).nullable(),
  end_time_local: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:mm")
    .nullable(),
  is_active: z.boolean().default(true),
});

export async function updateDailySpecial(
  fd: FormData,
): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const dishId = (fd.get("dish_id") as string) || "";
      const discount = (fd.get("discount_percent") as string) || "";
      const endTime = (fd.get("end_time_local") as string) || "";
      const row = specialSchema.parse({
        dish_id: dishId.trim() === "" ? null : dishId.trim(),
        label: ((fd.get("label") as string) || "").trim() || null,
        badge_label: ((fd.get("badge_label") as string) || "").trim() || null,
        discount_percent: discount === "" ? null : parseInt(discount, 10),
        end_time_local: endTime.trim() === "" ? null : endTime.trim(),
        is_active: fd.get("is_active") === "on",
      });
      const { error } = await sb
        .from("daily_special")
        .update(row)
        .eq("id", 1);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/", "/admin/special"], tags: ["special"] },
  );
}
