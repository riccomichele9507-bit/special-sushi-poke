"use server";

import { z } from "zod";
import { adminAction, type AdminActionResult } from "./helpers";

const closureSchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().trim().max(200).nullable(),
    closes_lunch: z.boolean(),
    closes_dinner: z.boolean(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "La data fine deve essere ≥ data inizio",
  })
  .refine((v) => v.closes_lunch || v.closes_dinner, {
    message: "Almeno uno tra pranzo/cena deve essere chiuso",
  });

export async function addClosure(fd: FormData): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const row = closureSchema.parse({
        start_date: fd.get("start_date"),
        end_date: fd.get("end_date"),
        reason: ((fd.get("reason") as string) || "").trim() || null,
        closes_lunch: fd.get("closes_lunch") === "on",
        closes_dinner: fd.get("closes_dinner") === "on",
      });
      const { error } = await sb.from("closures").insert(row);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/closures", "/", "/checkout"] },
  );
}

export async function deleteClosure(id: string): Promise<AdminActionResult> {
  return adminAction(
    async (sb) => {
      const { error } = await sb.from("closures").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    { revalidate: ["/admin/closures", "/", "/checkout"] },
  );
}
