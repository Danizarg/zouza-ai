import { ListingDetail } from "@/components/listing/listing-detail";
import { LocalListingView } from "@/components/listing/local-listing-view";
import { getListingById } from "@/lib/listings";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: "Property" };
  return {
    title: listing.title,
    description: listing.summary,
    openGraph: {
      title: listing.title,
      description: listing.summary,
      images: listing.images.slice(0, 1),
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return <LocalListingView id={id} />;
  }

  return <ListingDetail listing={listing} />;
}
