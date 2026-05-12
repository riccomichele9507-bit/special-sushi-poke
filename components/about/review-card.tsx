import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { Review } from "@/data/reviews";

const sourceLabel: Record<NonNullable<Review["source"]>, string> = {
  google: "Google",
  tripadvisor: "Tripadvisor",
  instagram: "Instagram",
};

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl bg-ink/60 ring-1 ring-white/[0.06] backdrop-blur p-6 transition hover:ring-gold/25">
      <div className="flex items-center gap-1.5" aria-label={`Valutazione ${review.rating} su 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < review.rating ? "fill-gold text-gold" : "text-white/15",
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <blockquote className="mt-5 flex-1 font-heading text-base italic leading-relaxed text-paper/90">
        “{review.text}”
      </blockquote>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-paper">{review.author}</p>
          <p className="mt-0.5 text-xs text-white/45">{formatDate(review.date)}</p>
        </div>
        {review.source && (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-paper/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
            {sourceLabel[review.source]}
          </span>
        )}
      </div>
    </article>
  );
}
