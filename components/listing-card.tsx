import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { VerificationBadges } from "@/components/verification-badge";
import type { Listing } from "@/lib/types";
import { formatPrice, totalMoveIn } from "@/lib/utils";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ListingCard({ listing }: { listing: Listing }) {
  const isRent = listing.mode === "rent";
  const price = isRent ? listing.price_monthly : listing.price_sale;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors duration-200 hover:border-navy-300">
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-10"
        aria-label={listing.title}
      />
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <Badge tone="navy">{isRent ? "For rent" : "For sale"}</Badge>
          {listing.new_build ? <Badge tone="terra">New build</Badge> : null}
        </div>
        <SaveButton listingId={listing.id} className="absolute top-3 right-3 z-20" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold text-navy-900">
              {formatPrice(price ?? 0)}
              {isRent ? (
                <span className="font-sans text-sm font-normal text-navy-500"> /month</span>
              ) : null}
            </p>
            {isRent ? (
              <p className="mt-0.5 text-xs text-navy-500">
                {formatPrice(totalMoveIn(listing))} total at move-in — all costs shown
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-navy-500">
                Direct from owner · no agency commission
              </p>
            )}
          </div>
        </div>

        <h3 className="font-sans text-sm leading-snug font-medium text-navy-800">
          {listing.title}
        </h3>

        <p className="flex items-center gap-1 text-xs text-navy-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {listing.address_area}, {listing.city}
        </p>

        <div className="flex items-center gap-4 text-xs text-navy-600">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" aria-hidden />
            {listing.bedrooms > 0 ? `${listing.bedrooms} bed` : "Studio"}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" aria-hidden />
            {listing.bathrooms} bath
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" aria-hidden />
            {listing.size_m2} m²
          </span>
        </div>

        <div className="mt-auto pt-1">
          <VerificationBadges listing={listing} compact />
        </div>
      </div>
    </article>
  );
}
