export interface DiscountCode {
  code: string;
  percent: number;
  label: string;
}

export const DISCOUNT_CODES: Record<string, DiscountCode> = {
  SUSHI20: { code: "SUSHI20", percent: 20, label: "Sushi 20% off" },
  BARI10: { code: "BARI10", percent: 10, label: "Bari 10%" },
  WELCOME15: { code: "WELCOME15", percent: 15, label: "Benvenuto -15%" },
  STUDENT10: { code: "STUDENT10", percent: 10, label: "Studenti -10%" },
};

export function validateDiscountCode(input: string): DiscountCode | null {
  const normalized = input.trim().toUpperCase();
  return DISCOUNT_CODES[normalized] ?? null;
}
