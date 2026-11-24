import "server-only";

import { rowToListing, LISTING_SELECT, type ListingRow } from "@/lib/listings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Conversation, Listing } from "@/lib/types";

/**
 * What the signed-in person's dashboard shows, read through row-level security as them.
 * Every function returns an empty list in mock mode or when a query fails, so a dashboard
 * section degrades to its empty state rather than an error page.
 */

export async function getOwnerListings(userId: string): Promise<Listing[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[dashboard] own listings:", error.message);
    return [];
  }
  return (data as ListingRow[]).map(rowToListing);
}

export async function getSavedListings(userId: string): Promise<Listing[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("saved_listings")
    .select(`created_at, listing:listings(${LISTING_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[dashboard] saved listings:", error.message);
    return [];
  }
  return (data as unknown as Array<{ listing: ListingRow | null }>)
    .map((row) => row.listing)
    .filter((l): l is ListingRow => Boolean(l))
    .map(rowToListing);
}

interface ConversationRow {
  id: string;
  listing_id: string;
  seeker_id: string;
  owner_id: string;
  prequalified: boolean;
  prequalification_note: string | null;
  last_message_at: string;
  seeker_last_read_at: string | null;
  owner_last_read_at: string | null;
  listing: {
    title: string;
    listing_images: Array<{ url: string; sort_order: number }> | null;
  } | null;
  seeker: { full_name: string } | null;
  owner: { full_name: string } | null;
  messages: Array<{ sender_id: string | null; created_at: string }> | null;
}

/** Conversations the person takes part in, shaped like the inbox's `Conversation`. */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `id, listing_id, seeker_id, owner_id, prequalified, prequalification_note, last_message_at,
       seeker_last_read_at, owner_last_read_at,
       listing:listings(title, listing_images(url, sort_order)),
       seeker:profiles!conversations_seeker_id_fkey(full_name),
       owner:profiles!conversations_owner_id_fkey(full_name),
       messages(sender_id, created_at)`,
    )
    .or(`seeker_id.eq.${userId},owner_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  if (error) {
    console.error("[dashboard] conversations:", error.message);
    return [];
  }
  return (data as unknown as ConversationRow[]).map((c) => {
    const iAmOwner = c.owner_id === userId;
    const lastRead = iAmOwner ? c.owner_last_read_at : c.seeker_last_read_at;
    const unread = (c.messages ?? []).filter(
      (m) => m.sender_id !== userId && (!lastRead || m.created_at > lastRead),
    ).length;
    const image = (c.listing?.listing_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
    return {
      id: c.id,
      listing_id: c.listing_id,
      listing_title: c.listing?.title ?? "Listing",
      listing_image: image ?? "",
      counterpart_name: (iAmOwner ? c.seeker?.full_name : c.owner?.full_name) || "Zouza user",
      counterpart_role: iAmOwner ? "seeker" : "owner",
      last_message_at: c.last_message_at,
      unread,
      prequalified: c.prequalified,
      prequalification_note: c.prequalification_note,
    };
  });
}

export interface DashboardViewingRequest {
  id: string;
  listing_id: string;
  listing_title: string;
  requester_name: string;
  kind: "viewing" | "stay" | "move_in";
  preferred_date: string;
  end_date: string | null;
  status: "pending" | "confirmed" | "declined" | "cancelled";
  note: string | null;
  created_at: string;
  /** True when the request is for one of the viewer's own listings (they decide on it). */
  incoming: boolean;
}

/** Requests the person made, and requests on listings they own. Row rules limit it to those. */
export async function getViewingRequests(userId: string): Promise<DashboardViewingRequest[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("viewing_requests")
    .select(
      "id, listing_id, requester_id, requester_name, kind, preferred_date, end_date, status, note, created_at, listing:listings(title, owner_id)",
    )
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    console.error("[dashboard] viewing requests:", error.message);
    return [];
  }
  type Row = Omit<DashboardViewingRequest, "listing_title" | "incoming"> & {
    requester_id: string;
    listing: { title: string; owner_id: string } | null;
  };
  return (data as unknown as Row[]).map(({ listing, requester_id, ...r }) => ({
    ...r,
    listing_title: listing?.title ?? "Listing",
    incoming: listing?.owner_id === userId && requester_id !== userId,
  }));
}
