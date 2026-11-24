import { Badge } from "@/components/ui/badge";
import type { ListingStatus } from "@/lib/types";

const LABELS: Record<ListingStatus, { text: string; tone: "success" | "neutral" | "danger" | "brand" }> = {
  published: { text: "Live", tone: "success" },
  draft: { text: "Draft", tone: "neutral" },
  archived: { text: "Archived", tone: "neutral" },
  pending_review: { text: "In review", tone: "brand" },
  removed: { text: "Removed", tone: "danger" },
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const { text, tone } = LABELS[status] ?? LABELS.draft;
  return <Badge tone={tone}>{text}</Badge>;
}

export function RequestStatusBadge({
  status,
}: {
  status: "pending" | "confirmed" | "declined" | "cancelled";
}) {
  const tone = status === "confirmed" ? "success" : status === "pending" ? "neutral" : "danger";
  return <Badge tone={tone}>{status}</Badge>;
}
