"use client";

import { ListingDetail } from "@/components/listing/listing-detail";
import { buttonClasses } from "@/components/ui/button";
import { getLocalListing } from "@/lib/local-listings";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import Link from "next/link";

/** Looks a listing up in localStorage — used when the server couldn't find it (drafts published in mock mode). */
export function LocalListingView({ id }: { id: string }) {
  const listing = useClientSnapshot(() => getLocalListing(id), null);

  if (!listing) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-navy-950">Listing not found</h1>
        <p className="max-w-sm text-navy-600">
          This listing may have been unpublished, or the link is incorrect.
        </p>
        <Link href="/rent" className={buttonClasses("primary", "md")}>
          Browse homes
        </Link>
      </div>
    );
  }

  return <ListingDetail listing={listing} />;
}
