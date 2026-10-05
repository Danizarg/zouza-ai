import { json, preflight } from "@/lib/api/http";
import { findListing, getReviewsFor } from "@/lib/server/catalogue";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  // Next has already URL-decoded the dynamic segment; decoding again would
  // throw a URIError (a 500) on a literal "%" such as GET /listings/%25.
  const { id } = await ctx.params;
  const listing = findListing(id);
  if (!listing) return json(req, { error: "not_found" }, { status: 404 });
  return json(
    req,
    { listing, reviews: getReviewsFor(listing.id) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}

export function OPTIONS(req: Request): Response {
  return preflight(req);
}
