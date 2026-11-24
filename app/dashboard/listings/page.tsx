import { DemoListings } from "@/components/dashboard/demo-listings";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListingStatusBadge, RequestStatusBadge } from "@/components/dashboard/listing-status";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListingCard } from "@/components/listing-card";
import { buttonClasses } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/server";
import { getConversations, getOwnerListings, getViewingRequests } from "@/lib/dashboard";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, FileText, Home, MessageCircle, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function DashboardListingsPage() {
  const viewer = await requireViewer("/dashboard/listings");
  if (!viewer) return <DemoListings />;

  const [mine, conversations, requests] = await Promise.all([
    getOwnerListings(viewer.id),
    getConversations(viewer.id),
    getViewingRequests(viewer.id),
  ]);

  const live = mine.filter((l) => l.status === "published");
  const notLive = mine.filter((l) => l.status !== "published");
  const enquiries = conversations.filter((c) => c.counterpart_role === "seeker").length;
  const incoming = requests.filter((r) => r.incoming);
  const pending = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="container-page max-w-5xl py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">My listings</h1>
          <p className="mt-1 text-sm text-muted">
            Everything you&rsquo;ve listed, and what&rsquo;s come in for it.
          </p>
        </div>
        <Link href="/list-with-ai" className={buttonClasses("primary", "md")}>
          <Plus className="h-4 w-4" aria-hidden />
          Add new listing
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Home} label="Live listings" value={live.length} />
        <StatCard icon={FileText} label="Drafts" value={notLive.length} />
        <StatCard icon={MessageCircle} label="Enquiries" value={enquiries} tone="brand" />
        <StatCard icon={CalendarCheck} label="Requests to answer" value={pending} tone="brand" />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">Live listings</h2>
        {live.length === 0 ? (
          <EmptyState
            title={mine.length === 0 ? "Nothing listed yet" : "Nothing live right now"}
            body="Create and preview for free. The €20/month subscription starts once a listing is live."
            action={{ href: "/list-with-ai", label: "List with Suzi" }}
          />
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {live.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {notLive.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-ink">Drafts and archived</h2>
          <div className="mt-5 space-y-3">
            {notLive.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{l.title}</p>
                  <p className="text-xs text-muted">
                    {l.address_area}, {l.city} · updated {formatDate(l.updated_at)}
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
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink">Viewing requests</h2>
        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            When someone asks to view, stay at or move into one of your listings, it shows up here.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {incoming.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{v.requester_name || "A visitor"}</p>
                  <p className="truncate text-xs text-muted">
                    {v.listing_title} · {formatDate(v.preferred_date)}
                    {v.end_date ? ` – ${formatDate(v.end_date)}` : ""}
                    {v.note ? ` · "${v.note}"` : ""}
                  </p>
                </div>
                <RequestStatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 pb-4">
        <h2 className="font-display text-xl font-semibold text-ink">Verification tasks</h2>
        <div className="mt-5 space-y-3">
          {!viewer.verified ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
              <p className="flex-1 text-sm text-ink-2">
                Confirm your identity to earn the owner-verified badge
              </p>
              <Link href="/trust" className={buttonClasses("outline", "sm")}>
                Learn more
              </Link>
            </div>
          ) : null}
          {live.filter((l) => !l.verified_property).map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
              <p className="flex-1 text-sm text-ink-2">
                Upload proof of ownership for &ldquo;{l.title}&rdquo;
              </p>
              <Link href="/trust" className={buttonClasses("outline", "sm")}>
                Learn more
              </Link>
            </div>
          ))}
          {viewer.verified && live.every((l) => l.verified_property) ? (
            <p className="text-sm text-muted">Nothing outstanding.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
