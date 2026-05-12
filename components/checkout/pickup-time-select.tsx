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
import { groupedDeliverySlots } from "@/data/pickup-slots";

export function PickupTimeSelect({
  value,
  onValueChange,
  id,
  hasError,
  placeholder = "Scegli un orario",
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  hasError?: boolean;
  placeholder?: string;
}) {
  const groups = groupedDeliverySlots();

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")}>
      <SelectTrigger
        id={id}
        aria-invalid={hasError}
        className="h-12 w-full rounded-xl border-border bg-paper-warm/40 px-4 text-base text-ink data-placeholder:text-warm-gray/70 hover:bg-paper-warm focus-visible:border-bamboo/60 focus-visible:ring-bamboo/20"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-border bg-paper text-ink backdrop-blur-xl">
        {groups.map((g, idx) => (
          <SelectGroup key={g.group}>
            <SelectLabel className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-bamboo">
              {g.group}
            </SelectLabel>
            {g.slots.map((slot) => (
              <SelectItem
                key={slot}
                value={slot}
                className="text-ink focus:bg-paper-warm"
              >
                {slot}
              </SelectItem>
            ))}
            {idx < groups.length - 1 && (
              <div className="my-1 h-px bg-border" />
            )}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
