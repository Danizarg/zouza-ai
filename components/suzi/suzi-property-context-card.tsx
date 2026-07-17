import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

/** Shown at the top of the panel when Suzi has a specific listing in context. */
export function SuziPropertyContextCard({ listing }: { listing: Listing }) {
  const price = listing.mode === "rent" ? listing.price_monthly : listing.price_sale;
  return (
    <div className="flex items-center gap-3 border-b border-line bg-parchment px-4 py-2.5">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-sand">
        <Image src={listing.images[0]} alt="" fill className="object-cover" sizes="40px" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-navy-900">{listing.title}</p>
        <p className="text-[0.7rem] text-navy-500">
          {listing.city} · {formatPrice(price ?? 0)}
          {listing.mode === "rent" ? "/mo" : ""}
        </p>
      </div>
    </div>
  );
}
