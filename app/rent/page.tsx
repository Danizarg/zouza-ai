import { SearchResults } from "@/components/search/search-results";
import { getListings } from "@/lib/listings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent a home in Spain",
  description:
    "Search verified rental homes across Spain with transparent total move-in costs — rent, utilities, deposit and fees, all shown upfront.",
};

export default async function RentPage() {
  const listings = await getListings("rent");

  return (
    <div>
      <div className="border-b border-line bg-parchment py-10">
        <div className="container-page">
          <p className="eyebrow">Rent · Mieten</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy-950 sm:text-4xl">
            Find a home to rent
          </h1>
          <p className="mt-2 max-w-xl text-navy-600">
            Verified owners, real total costs, and an AI assistant on every
            listing that answers your questions instantly.
          </p>
        </div>
      </div>
      <SearchResults mode="rent" listings={listings} />
    </div>
  );
}
