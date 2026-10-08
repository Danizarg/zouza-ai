import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "No fees, no commission. Owners pay a flat €20/month to keep a listing live; buyers and tenants use Zouza for free.",
};

const ownerIncludes = [
  "Suzi writes your listing from photos and a chat",
  "Suzi answers questions about your home",
  "Unlimited enquiries and viewing requests",
  "No commission on rent or sale price",
  "Cancel any month, no contract",
];

const seekerIncludes = [
  "Talk to Suzi as much as you like",
  "Search every listing in plain language",
  "Ask Suzi about any home",
  "Message owners and request viewings",
];

const example = [
  { dt: "Monthly rent", dd: "€1,200" },
  { dt: "Utilities (estimate)", dd: "€150" },
  { dt: "Deposit (refundable)", dd: "€1,200" },
  { dt: "Zouza fee", dd: "€0" },
] as const;

export default function PricingPage() {
  return (
    <div>
      <section className="border-b border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
              No fees. One simple subscription.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Owners pay €20/month to keep a listing live. Everyone looking pays nothing.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-xl border-2 border-brand-500 bg-surface p-7">
              <p className="eyebrow">For owners</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-ink">€20</span>
                <span className="text-muted">/ month</span>
              </p>
              <p className="mt-2 text-sm text-muted">
                Create and preview free. Subscribe when you publish.
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {ownerIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/list-with-ai" className={buttonClasses("primary", "md", "mt-8 w-full")}>
                List with Suzi
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-7">
              <p className="eyebrow">For buyers &amp; tenants</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-ink">Free</span>
              </p>
              <p className="mt-2 text-sm text-muted">Always.</p>
              <ul className="mt-6 flex-1 space-y-3">
                {seekerIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ai-search" className={buttonClasses("outline", "md", "mt-8 w-full")}>
                Find a home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-semibold text-ink">What a tenant pays</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Everything goes to the owner or back to you.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="eyebrow">Example rental</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {example.map((row) => (
                  <div key={row.dt} className="flex justify-between">
                    <dt className="text-muted">{row.dt}</dt>
                    <dd className="font-medium text-ink">{row.dd}</dd>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <dt className="font-semibold text-ink">Total due at move-in</dt>
                  <dd className="font-display text-lg font-semibold text-brand-600">€2,550</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Illustrative. Zouza is an intermediary and never processes rent,
                deposits or any other payment.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
