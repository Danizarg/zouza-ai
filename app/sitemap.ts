import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { MetadataRoute } from "next";

const STATIC_ROUTES = [
  "",
  "/rent",
  "/buy",
  "/rent-out",
  "/sell",
  "/create-listing",
  "/about",
  "/trust",
  "/pricing",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const listingEntries: MetadataRoute.Sitemap = MOCK_LISTINGS.map((listing) => ({
    url: `${appUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.updated_at),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...listingEntries];
}
