"use client";

import { PriceBreakdown } from "@/components/price-breakdown";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/types";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import Image from "next/image";

export function StepPreview({
  listing,
  onBack,
  onPublish,
  publishing,
}: {
  listing: Listing;
  onBack: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Preview your listing</h1>
      <p className="mt-2 text-navy-600">This is exactly what buyers and tenants will see.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white">
        <div className="grid gap-1 sm:grid-cols-4">
          <div className="relative aspect-[4/3] bg-sand sm:col-span-2 sm:aspect-auto">
            {listing.images[0] ? (
              <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" unoptimized />
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-1 sm:col-span-2">
            {listing.images.slice(1, 5).map((src, i) => (
              <div key={i} className="relative aspect-square bg-sand">
                <Image src={src} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <p className="flex items-center gap-1 text-sm text-navy-500">
            <MapPin className="h-4 w-4" aria-hidden />
            {listing.address_area}, {listing.city}, {listing.country}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-navy-900">{listing.title}</h2>
          <div className="mt-3 flex items-center gap-5 text-sm text-navy-600">
            <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" aria-hidden />{listing.bedrooms} bed</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" aria-hidden />{listing.bathrooms} bath</span>
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4" aria-hidden />{listing.size_m2} m²</span>
          </div>

          <p className="mt-5 leading-relaxed whitespace-pre-line text-navy-700">{listing.description}</p>

          <div className="mt-6 rounded-xl border border-line bg-parchment p-5">
            <PriceBreakdown listing={listing} />
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {listing.features.map((f) => (
              <li key={f} className="text-sm text-navy-600">— {f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={publishing}>Back</Button>
        <Button onClick={onPublish} disabled={publishing}>
          {publishing ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </div>
  );
}
