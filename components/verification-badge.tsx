import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/types";
import { daysAgo } from "@/lib/utils";
import { BadgeCheck, ShieldCheck } from "lucide-react";

export function VerificationBadges({
  listing,
  compact = false,
}: {
  listing: Listing;
  compact?: boolean;
}) {
  if (!listing.verified_owner && !listing.verified_property) {
    return compact ? null : <Badge tone="neutral">Verification pending</Badge>;
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {listing.verified_owner ? (
        <Badge tone="gold">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          Owner verified
        </Badge>
      ) : null}
      {listing.verified_property ? (
        <Badge tone="gold">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Property verified
        </Badge>
      ) : null}
      {!compact && listing.last_verified_at ? (
        <Badge tone="neutral">Checked {daysAgo(listing.last_verified_at)} days ago</Badge>
      ) : null}
    </span>
  );
}
