import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export function Price({
  cents,
  size = "md",
  accent = false,
  className,
}: {
  cents: number;
  size?: "sm" | "md" | "lg" | "xl";
  accent?: boolean;
  className?: string;
}) {
  const sizeMap = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  } as const;

  return (
    <span
      className={cn(
        "font-heading tabular-nums tracking-tight",
        sizeMap[size],
        accent ? "text-sushi-red" : "text-paper",
        className,
      )}
    >
      {formatPrice(cents)}
    </span>
  );
}
