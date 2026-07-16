"use client";

import { ListingCard } from "@/components/listing-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { getSavedIds } from "@/components/save-button";
import { listLocalListings } from "@/lib/local-listings";
import { MOCK_CONVERSATIONS, MOCK_LISTINGS, MOCK_VIEWING_REQUESTS } from "@/lib/mock-data";
import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { formatDate } from "@/lib/utils";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const savedListings = useClientSnapshot(() => {
    const savedIds = getSavedIds();
    return MOCK_LISTINGS.filter((l) => savedIds.includes(l.id));
  }, []);
  const drafts = useClientSnapshot(() => listLocalListings(), []);

  const myListings = MOCK_LISTINGS.slice(0, 2);
  const unreadMessages = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="container-page max-w-5xl py-8 md:py-10">
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Welcome back</h1>
      <p className="mt-1 text-sm text-navy-500">Here&rsquo;s what&rsquo;s happening across your Zouza account.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UserIcon} label="Active listings" value={myListings.length} />
        <StatCard icon={Heart} label="Saved homes" value={savedListings.length} tone="gold" />
        <StatCard icon={MessageCircle} label="Unread messages" value={unreadMessages} tone="terra" />
        <StatCard icon={Sparkles} label="AI drafts" value={drafts.length} />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-navy-900">My listings</h2>
          <Link href="/list-with-ai" className={buttonClasses("outline", "sm")}>
            Add listing
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {myListings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {drafts.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-navy-900">AI-generated drafts</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {drafts.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="saved" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-xl font-semibold text-navy-900">Saved homes</h2>
        {savedListings.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">
            Nothing saved yet — tap the heart icon on any listing to save it here.
          </p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {savedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-navy-900">Viewing requests</h2>
        <div className="mt-5 space-y-3">
          {MOCK_VIEWING_REQUESTS.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-navy-900">{v.listing_title}</p>
                <p className="text-xs text-navy-500">{v.requester_name} · Preferred: {formatDate(v.preferred_date)}</p>
              </div>
              <Badge tone={v.status === "confirmed" ? "gold" : v.status === "pending" ? "neutral" : "terra"}>
                {v.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section id="verification" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-xl font-semibold text-navy-900">Verification status</h2>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-gold-600" aria-hidden />
          <div>
            <p className="text-sm font-medium text-navy-900">Identity not yet verified</p>
            <p className="text-xs text-navy-500">Verify your identity to unlock the owner-verified badge on your listings.</p>
          </div>
          <Link href="/trust" className={buttonClasses("outline", "sm", "ml-auto")}>
            Learn more
          </Link>
        </div>
      </section>

      <section id="profile" className="mt-12 scroll-mt-24 pb-4">
        <h2 className="font-display text-xl font-semibold text-navy-900">Profile</h2>
        <div className="mt-5 flex items-center gap-4 rounded-xl border border-line bg-white p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-gold-300">
            <UserIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
              Demo account <BadgeCheck className="h-4 w-4 text-navy-300" aria-hidden />
            </p>
            <p className="text-xs text-navy-500">Connect Supabase Auth to enable real accounts and sign-in.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
