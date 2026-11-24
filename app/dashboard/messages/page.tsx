import { Inbox } from "@/components/messages/inbox";
import { Badge } from "@/components/ui/badge";
import { requireViewer } from "@/lib/auth/server";
import { getConversations } from "@/lib/dashboard";
import { daysAgo } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your conversations with owners and prospective tenants or buyers on Zouza.",
};

export default async function DashboardMessagesPage() {
  const viewer = await requireViewer("/dashboard/messages");
  if (!viewer) return <Inbox />;

  const conversations = await getConversations(viewer.id);

  return (
    <div className="container-page max-w-3xl py-8 md:py-10">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Conversations about your listings, and with owners you&rsquo;ve contacted.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border-strong bg-white p-6">
          <p className="text-sm font-semibold text-ink">No conversations yet</p>
          <p className="mt-1 text-sm text-muted">
            When someone enquires about one of your listings, or you message an owner, the
            thread appears here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-white">
          {conversations.map((c) => (
            <li key={c.id} className="flex items-start gap-3 p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                {c.listing_image ? (
                  <Image src={c.listing_image} alt="" fill sizes="48px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{c.counterpart_name}</p>
                  {c.unread > 0 ? (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-paper">
                      {c.unread}
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`/property/${c.listing_id}`}
                  className="truncate text-xs text-muted hover:text-ink"
                >
                  {c.listing_title}
                </Link>
                {c.prequalified ? (
                  <Badge tone="brand" className="mt-1.5">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    Pre-qualified
                  </Badge>
                ) : null}
                <p className="mt-1 text-xs text-muted">{daysAgo(c.last_message_at)}d ago</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
