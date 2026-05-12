"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupedPickupSlots } from "@/data/pickup-slots";

export function PickupTimeSelect({
  value,
  onValueChange,
  id,
  hasError,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  hasError?: boolean;
}) {
  const groups = groupedPickupSlots();

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")}>
      <SelectTrigger
        id={id}
        aria-invalid={hasError}
        className="h-12 w-full rounded-lg border-white/10 bg-paper/[0.04] px-4 text-base text-paper data-placeholder:text-white/40 hover:bg-paper/[0.06] focus-visible:border-gold/60 focus-visible:ring-gold/30"
      >
        <SelectValue placeholder="Scegli un orario di ritiro" />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-ink/95 text-paper backdrop-blur-xl">
        {groups.map((g, idx) => (
          <SelectGroup key={g.group}>
            <SelectLabel className="font-heading text-[10px] uppercase tracking-[0.24em] text-gold/80">
              {g.group}
            </SelectLabel>
            {g.slots.map((slot) => (
              <SelectItem
                key={slot}
                value={slot}
                className="text-paper focus:bg-paper/[0.08]"
              >
                {slot}
              </SelectItem>
            ))}
            {idx < groups.length - 1 && (
              <div className="my-1 h-px bg-white/[0.06]" />
            )}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
