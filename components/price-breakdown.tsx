import type { Listing } from "@/lib/types";
import { formatPrice, totalMoveIn } from "@/lib/utils";

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className={muted ? "text-sm text-navy-500" : "text-sm text-navy-700"}>{label}</dt>
      <dd className={muted ? "text-sm text-navy-500" : "text-sm font-medium text-navy-900"}>
        {value}
      </dd>
    </div>
  );
}

/** The "real price" module — Aurora's transparency signature. */
export function PriceBreakdown({ listing }: { listing: Listing }) {
  if (listing.mode === "rent") {
    const feePct = listing.platform_fee_percent ?? 0;
    const fee = Math.round(((listing.price_monthly ?? 0) * feePct) / 100);
    return (
      <dl className="divide-y divide-line">
        <Row label="Monthly rent" value={formatPrice(listing.price_monthly ?? 0)} />
        <Row
          label="Utilities (estimate)"
          value={
            listing.utilities_monthly
              ? `${formatPrice(listing.utilities_monthly)} /month`
              : "Paid separately"
          }
        />
        <Row label="Deposit (refundable)" value={formatPrice(listing.deposit ?? 0)} />
        <Row label={`Platform fee estimate (${feePct}%)`} value={formatPrice(fee)} />
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="text-sm font-semibold text-navy-900">Total due at move-in</dt>
          <dd className="font-display text-xl font-semibold text-navy-900">
            {formatPrice(totalMoveIn(listing))}
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <dl className="divide-y divide-line">
      <Row label="Asking price" value={formatPrice(listing.price_sale ?? 0)} />
      <Row label="Agency commission" value="None — direct from owner" />
      <Row
        label="Taxes & notary fees"
        value="Vary by region (placeholder)"
        muted
      />
      <p className="pt-3 text-xs leading-relaxed text-navy-500">
        Purchase taxes, notary and registry fees depend on the region and your
        situation. Aurora Homes does not provide legal or tax advice — always
        confirm final costs with an independent professional.
      </p>
    </dl>
  );
}
