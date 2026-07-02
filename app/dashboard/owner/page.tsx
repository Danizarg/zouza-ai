"use client";

import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { listLocalListings } from "@/lib/local-listings";
import { MOCK_LISTINGS, MOCK_VIEWING_REQUESTS } from "@/lib/mock-data";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { formatDate } from "@/lib/utils";
import {
  Eye,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const performance = [
  { listing: MOCK_LISTINGS[0], views: 342, enquiries: 12, aiAnswered: 27 },
  { listing: MOCK_LISTINGS[1], views: 198, enquiries: 6, aiAnswered: 14 },
];

export default function OwnerDashboardPage() {
  const drafts = useClientSnapshot(() => listLocalListings(), []);

  const published = MOCK_LISTINGS.slice(0, 2);
  const totalViews = performance.reduce((s, p) => s + p.views, 0);
  const totalEnquiries = performance.reduce((s, p) => s + p.enquiries, 0);
  const totalAiAnswered = performance.reduce((s, p) => s + p.aiAnswered, 0);

  return (
    <div className="container-page max-w-5xl py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Owner dashboard</h1>
          <p className="mt-1 text-sm text-navy-500">Performance across your published listings.</p>
        </div>
        <Link href="/create-listing" className={buttonClasses("primary", "md")}>
          <Plus className="h-4 w-4" aria-hidden />
          Add new listing
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label="Total views" value={totalViews} />
        <StatCard icon={MessageCircle} label="Enquiries" value={totalEnquiries} tone="terra" />
        <StatCard icon={Sparkles} label="AI questions answered" value={totalAiAnswered} tone="gold" />
        <StatCard icon={ShieldCheck} label="Verification tasks" value={2} />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-navy-900">Listing performance</h2>
        <div className="mt-5 space-y-3">
          {performance.map((p) => (
            <div key={p.listing.id} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm font-medium text-navy-900">{p.listing.title}</p>
              <div className="flex gap-6 text-sm text-navy-600">
                <span>{p.views} views</span>
                <span>{p.enquiries} enquiries</span>
                <span>{p.aiAnswered} AI answers</span>
              </div>
              <Link href={`/listings/${p.listing.id}`} className={buttonClasses("outline", "sm")}>
                View listing
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-navy-900">Viewing requests</h2>
        <div className="mt-5 space-y-3">
          {MOCK_VIEWING_REQUESTS.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-navy-900">{v.requester_name}</p>
                <p className="text-xs text-navy-500">
                  {v.listing_title} · Preferred: {formatDate(v.preferred_date)}
                  {v.note ? ` · "${v.note}"` : ""}
                </p>
              </div>
              <Badge tone={v.status === "confirmed" ? "gold" : v.status === "pending" ? "neutral" : "terra"}>
                {v.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-navy-900">Verification tasks</h2>
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
            <ShieldCheck className="h-5 w-5 text-terra-600" aria-hidden />
            <p className="flex-1 text-sm text-navy-800">Confirm your identity to earn the owner-verified badge</p>
            <Link href="/trust" className={buttonClasses("outline", "sm")}>Start</Link>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
            <ShieldCheck className="h-5 w-5 text-terra-600" aria-hidden />
            <p className="flex-1 text-sm text-navy-800">Upload proof of ownership for &ldquo;{published[0]?.title}&rdquo;</p>
            <Link href="/trust" className={buttonClasses("outline", "sm")}>Start</Link>
          </div>
        </div>
      </section>

      {drafts.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-navy-900">Draft listings</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {drafts.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      ) : null}

      <section className="mt-12 pb-4">
        <h2 className="font-display text-xl font-semibold text-navy-900">Published listings</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {published.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>
    </div>
  );
}
