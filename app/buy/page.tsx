import { SearchResults } from "@/components/search/search-results";
import { getListings } from "@/lib/listings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy a home in Spain",
  description:
    "Search verified homes for sale across Spain, direct from owners — transparent asking prices, no agency commission layered on top.",
};

export default async function BuyPage() {
  const listings = await getListings("buy");

  return (
    <div>
      <div className="border-b border-line bg-parchment py-10">
        <div className="container-page">
          <p className="eyebrow">Buy · Kaufen</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy-950 sm:text-4xl">
            Find a home to buy
          </h1>
          <p className="mt-2 max-w-xl text-navy-600">
            Verified owners, direct sales, and transparent asking prices —
            request a viewing or contact the owner in a click.
          </p>
        </div>
      </div>
      <SearchResults mode="buy" listings={listings} />
    </div>
  );
}
