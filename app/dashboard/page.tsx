import { DemoOverview } from "@/components/dashboard/demo-overview";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListingStatusBadge, RequestStatusBadge } from "@/components/dashboard/listing-status";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListingCard } from "@/components/listing-card";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/server";
import {
  getConversations,
  getOwnerListings,
  getSavedListings,
  getViewingRequests,
} from "@/lib/dashboard";
import { formatDate } from "@/lib/utils";
import {
  BadgeCheck,
  FileText,
  Heart,
  MessageCircle,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

const ROLE_LABEL = { owner: "Owner", seeker: "Looking for a home", both: "Owner and seeker" } as const;

export default async function DashboardPage() {
  const viewer = await requireViewer("/dashboard");
  if (!viewer) return <DemoOverview />;

  const [mine, saved, conversations, requests] = await Promise.all([
    getOwnerListings(viewer.id),
    getSavedListings(viewer.id),
    getConversations(viewer.id),
    getViewingRequests(viewer.id),
  ]);

  const live = mine.filter((l) => l.status === "published");
  const notLive = mine.filter((l) => l.status !== "published");
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const firstName = viewer.name.split(/\s+/)[0] || "there";

  return (
    <div className="container-page max-w-5xl py-8 md:py-10">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Welcome back, {firstName}</h1>
      <p className="mt-1 text-sm text-muted">
        Here&rsquo;s what&rsquo;s happening across your Zouza account.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={UserIcon} label="Live listings" value={live.length} />
        <StatCard icon={Heart} label="Saved homes" value={saved.length} tone="brand" />
        <StatCard icon={MessageCircle} label="Unread messages" value={unread} tone="brand" />
        <StatCard icon={FileText} label="Drafts" value={notLive.length} />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">My listings</h2>
          <Link href="/list-with-ai" className={buttonClasses("outline", "sm")}>
            Add listing
          </Link>
        </div>
        {mine.length === 0 ? (
          <EmptyState
            title="No listings yet"
            body="Add photos and answer a short chat — Suzi writes the listing and you review every word."
            action={{ href: "/list-with-ai", label: "List with Suzi" }}
          />
        ) : (
          <>
            {live.length > 0 ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {live.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            ) : null}
            {notLive.length > 0 ? (
              <div className="mt-5 space-y-3">
                {notLive.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{l.title}</p>
                      <p className="text-xs text-muted">
                        {l.address_area}, {l.city} · {formatDate(l.updated_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <ListingStatusBadge status={l.status} />
                      <Link href={`/property/${l.id}`} className={buttonClasses("outline", "sm")}>
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <section id="saved" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-xl font-semibold text-ink">Saved homes</h2>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nothing saved yet — tap the heart icon on any listing to save it here.
          </p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {saved.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">Viewing requests</h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No viewing requests yet. Requests you make, and requests on your listings, show up here.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {requests.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{v.listing_title}</p>
                  <p className="text-xs text-muted">
                    {v.incoming ? `${v.requester_name || "A visitor"} asked` : "You asked"} ·{" "}
                    {v.kind === "viewing" ? "Viewing" : v.kind === "stay" ? "Stay" : "Move-in"}{" "}
                    {formatDate(v.preferred_date)}
                    {v.end_date ? ` – ${formatDate(v.end_date)}` : ""}
                  </p>
                </div>
                <RequestStatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="verification" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-xl font-semibold text-ink">Verification status</h2>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
          <div>
            <p className="text-sm font-medium text-ink">
              {viewer.verified ? "Identity verified" : "Identity not yet verified"}
            </p>
            <p className="text-xs text-muted">
              {viewer.verified
                ? "Your listings carry the owner-verified badge."
                : "Verify your identity to unlock the owner-verified badge on your listings."}
            </p>
          </div>
          <Link href="/trust" className={buttonClasses("outline", "sm", "ml-auto")}>
            Learn more
          </Link>
        </div>
      </section>

      <section id="profile" className="mt-12 scroll-mt-24 pb-4">
        <h2 className="font-display text-xl font-semibold text-ink">Profile</h2>
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-brand-300">
            <UserIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {viewer.name}
              {viewer.verified ? (
                <BadgeCheck className="h-4 w-4 text-success" aria-hidden />
              ) : null}
            </p>
            <p className="truncate text-xs text-muted">
              {viewer.email ?? "No email"} · {ROLE_LABEL[viewer.role]} · Member since{" "}
              {formatDate(viewer.createdAt)}
            </p>
          </div>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
