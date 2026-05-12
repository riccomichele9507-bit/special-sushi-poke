import { cn } from "@/lib/utils";

export function KanjiOrnament({
  char,
  className,
  ariaHidden = true,
}: {
  char: string;
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        "pointer-events-none select-none font-heading text-gold/[0.07] leading-none",
        "tracking-tighter",
        className,
      )}
    >
      {char}
    </span>
  );
}
