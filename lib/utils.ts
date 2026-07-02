export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return eur.format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function daysAgo(iso: string): number {
  const then = new Date(iso).getTime();
  return Math.max(0, Math.round((Date.now() - then) / 86_400_000));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Total due at move-in: first month + deposit + platform fee on first month. */
export function totalMoveIn(input: {
  price_monthly?: number | null;
  utilities_monthly?: number | null;
  deposit?: number | null;
  platform_fee_percent?: number | null;
}): number {
  const rent = input.price_monthly ?? 0;
  const utilities = input.utilities_monthly ?? 0;
  const deposit = input.deposit ?? 0;
  const fee = (rent * (input.platform_fee_percent ?? 0)) / 100;
  return Math.round(rent + utilities + deposit + fee);
}
