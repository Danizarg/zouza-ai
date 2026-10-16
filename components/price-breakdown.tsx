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
      <dt className={muted ? "text-sm text-muted" : "text-sm text-ink-2"}>{label}</dt>
      <dd className={muted ? "text-sm text-muted" : "text-sm font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}

/** The "real price" module — Zouza's transparency signature. */
export function PriceBreakdown({ listing }: { listing: Listing }) {
  if (listing.mode === "rent") {
    return (
      <dl className="divide-y divide-border">
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
        <Row label="Zouza fee" value="€0 — never any" />
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="text-sm font-semibold text-ink">Total due at move-in</dt>
          <dd className="font-display text-xl font-semibold text-ink">
            {formatPrice(totalMoveIn(listing))}
          </dd>
        </div>
        <p className="pt-3 text-xs leading-relaxed text-muted">
          Zouza charges tenants nothing. Owners pay a flat €20/month to list
          — there is no commission or booking fee on top of your rent.
        </p>
      </dl>
    );
  }

  return (
    <dl className="divide-y divide-border">
      <Row label="Asking price" value={formatPrice(listing.price_sale ?? 0)} />
      <Row label="Agency commission" value="None — direct from owner" />
      <Row label="Zouza fee" value="€0 — never any" />
      <Row
        label="Taxes & notary fees"
        value="Vary by region (placeholder)"
        muted
      />
      <p className="pt-3 text-xs leading-relaxed text-muted">
        Zouza takes no cut of the sale price — owners pay a flat €20/month to
        list. Purchase taxes, notary and registry fees depend on the region
        and your situation; Zouza does not provide legal or tax advice, so
        always confirm final costs with an independent professional.
      </p>
    </dl>
  );
}
