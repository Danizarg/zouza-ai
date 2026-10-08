import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

export function Reviews({ reviews, rating, count }: { reviews: Review[]; rating: number | null; count: number }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-paper-2 p-6 text-sm text-muted">
        No reviews yet — be the first to stay here and share your experience.
      </div>
    );
  }

  return (
    <div>
      {rating ? (
        <div className="mb-5 flex items-center gap-2">
          <Star className="h-5 w-5 fill-brand-500 text-brand-500" aria-hidden />
          <span className="font-display text-lg font-semibold text-ink">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted">· {count} review{count === 1 ? "" : "s"}</span>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">{r.author_name}</p>
              <span className="flex items-center gap-0.5 text-xs text-brand-600">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-brand-500 text-brand-500" aria-hidden />
                ))}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{r.comment}</p>
            <p className="mt-2 text-xs text-muted">{formatDate(r.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
