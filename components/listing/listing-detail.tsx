"use client";

import { AgentChat } from "@/components/listing/agent-chat";
import { ContactActions } from "@/components/listing/contact-actions";
import { Gallery } from "@/components/listing/gallery";
import { Reviews } from "@/components/listing/reviews";
import { PriceBreakdown } from "@/components/price-breakdown";
import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { VerificationBadges } from "@/components/verification-badge";
import { getMockReviews } from "@/lib/mock-data";
import type { Listing } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Bath,
  BedDouble,
  Calendar,
  FileText,
  MapPin,
  PawPrint,
  Ruler,
  Waves,
} from "lucide-react";

export function ListingDetail({ listing }: { listing: Listing }) {
  const isRent = listing.mode === "rent";
  const reviews = getMockReviews(listing.id);

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1 text-sm text-navy-500">
            <MapPin className="h-4 w-4" aria-hidden />
            {listing.address_area}, {listing.city}, {listing.country}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
            {listing.title}
          </h1>
          {listing.ai_summary ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">{listing.ai_summary}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="navy">{isRent ? "For rent" : "For sale"}</Badge>
          <SaveButton listingId={listing.id} className="static" />
        </div>
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <section className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-6">
            <span className="flex items-center gap-1.5 text-sm text-navy-700">
              <BedDouble className="h-4 w-4" aria-hidden />
              {listing.bedrooms > 0 ? `${listing.bedrooms} bedrooms` : "Studio"}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-navy-700">
              <Bath className="h-4 w-4" aria-hidden />
              {listing.bathrooms} bathrooms
            </span>
            <span className="flex items-center gap-1.5 text-sm text-navy-700">
              <Ruler className="h-4 w-4" aria-hidden />
              {listing.size_m2} m²
            </span>
            {listing.pets_allowed ? (
              <span className="flex items-center gap-1.5 text-sm text-navy-700">
                <PawPrint className="h-4 w-4" aria-hidden />
                Pets allowed
              </span>
            ) : null}
          </section>

          <section>
            <VerificationBadges listing={listing} />
            {listing.last_verified_at ? (
              <p className="mt-2 text-xs text-navy-500">
                Last verified {formatDate(listing.last_verified_at)}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy-900">About this home</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-navy-700">{listing.description}</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy-900">Features</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {listing.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-navy-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900">
              <Waves className="h-5 w-5 text-gold-600" aria-hidden />
              Location intelligence
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-navy-700">
              <li>
                {listing.distance_to_beach_min
                  ? `${listing.distance_to_beach_min} minutes ${listing.distance_to_beach_min <= 12 ? "on foot" : "by car"} to the nearest beach.`
                  : `${listing.city} has good coastal access nearby.`}
              </li>
              <li>Cafés, pharmacies and daily services within walking distance of {listing.address_area}.</li>
              {listing.taxes_note ? <li>{listing.taxes_note}</li> : null}
            </ul>
            <div className="mt-4 flex aspect-video items-center justify-center rounded-xl border border-dashed border-line bg-parchment text-sm text-navy-500">
              Interactive map — coming soon ({listing.address_area}, {listing.city})
            </div>
          </section>

          {isRent ? (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900">
                <Calendar className="h-5 w-5 text-gold-600" aria-hidden />
                Availability
              </h2>
              <p className="mt-3 text-sm text-navy-600">
                Available from{" "}
                <span className="font-medium text-navy-900">
                  {listing.available_from ? formatDate(listing.available_from) : "now"}
                </span>
                {listing.minimum_stay ? ` · Minimum stay: ${listing.minimum_stay}` : ""}
              </p>
              <div className="mt-4 flex aspect-[3/1] items-center justify-center rounded-xl border border-dashed border-line bg-parchment text-sm text-navy-500">
                Availability calendar — coming soon
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900">
              <FileText className="h-5 w-5 text-gold-600" aria-hidden />
              Contract templates
            </h2>
            <p className="mt-3 text-sm text-navy-600">
              Standard {isRent ? "rental" : "sale"} contract templates for
              {" "}{listing.country} will be available to download here before
              you sign anything. Zouza does not provide legal advice —
              always have contracts reviewed independently.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-line bg-parchment p-5 text-sm text-navy-500">
              Contract template area — coming soon
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy-900">Reviews</h2>
            <div className="mt-4">
              <Reviews reviews={reviews} rating={listing.rating} count={listing.review_count} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div id="ai" className="scroll-mt-24">
            <p className="mb-2 px-1 text-sm font-semibold text-navy-900">Talk to this property&rsquo;s AI</p>
            <AgentChat listing={listing} />
          </div>

          <div className="rounded-xl border border-line bg-white p-6">
            <p className="font-display text-2xl font-semibold text-navy-900">
              {formatPrice((isRent ? listing.price_monthly : listing.price_sale) ?? 0)}
              {isRent ? <span className="font-sans text-sm font-normal text-navy-500"> /month</span> : null}
            </p>
            <div className="mt-4 border-t border-line pt-2">
              <PriceBreakdown listing={listing} />
            </div>
            <div className="mt-5">
              <ContactActions listing={listing} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
