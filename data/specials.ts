export interface DailySpecial {
  id: string;
  dishId: string;
  label: string;
  badgeLabel: string;
  discountPercent: number;
  /** Daily reset time in HH:mm format (local). Countdown re-runs each day. */
  endTimeLocal: string;
}

export const dailySpecial: DailySpecial = {
  id: "lunch-2026",
  dishId: "box-25",
  label: "Offerta Pranzo",
  badgeLabel: "PRANZO -20% OFF",
  discountPercent: 20,
  endTimeLocal: "16:00",
};

/** Compute next end-of-day moment given the special's endTimeLocal. */
export function getNextSpecialEnd(): Date {
  const [h, m] = dailySpecial.endTimeLocal.split(":").map(Number);
  const now = new Date();
  const end = new Date(now);
  end.setHours(h, m, 0, 0);
  if (end <= now) end.setDate(end.getDate() + 1);
  return end;
}
