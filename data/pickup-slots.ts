import type { DeliverySlot } from "@/types/checkout";

function generateSlots(start: string, end: string, stepMinutes = 15): string[] {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const slots: string[] = [];
  for (let t = startMin; t <= endMin; t += stepMinutes) {
    const h = Math.floor(t / 60).toString().padStart(2, "0");
    const m = (t % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export function getTodayDeliverySlots(): DeliverySlot[] {
  const lunch = generateSlots("12:30", "14:30");
  const dinner = generateSlots("19:00", "22:30");
  return [...lunch, ...dinner].map((time) => ({
    value: time,
    label: time,
  }));
}

export function groupedDeliverySlots() {
  return [
    { group: "Pranzo", slots: generateSlots("12:30", "14:30") },
    { group: "Cena", slots: generateSlots("19:00", "22:30") },
  ];
}
