import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "No fees, no commission. Owners pay a flat €20/month to list; buyers and tenants use Zouza for free.",
};

const ownerIncludes = [
  "Suzi writes your full listing from your photos and a short chat",
  "Your own AI property assistant answers enquiries 24/7",
  "Unlimited enquiries and viewing requests",
  "Verification badges for you and your property",
  "No commission on your rent or sale price — ever",
  "Cancel any month, no contract",
];

const seekerIncludes = [
  "Talk to Suzi as much as you like",
  "Natural-language search and every listing",
  "Ask Suzi anything about a specific home",
  "Message owners and request viewings",
  "No booking fee, no fee at move-in",
];

export default function PricingPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-3 text-4xl font-semibold text-navy-950 sm:text-5xl">
              No fees. Just one simple subscription.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Zouza never takes a cut of your rent or your sale price. There is
              no commission and no booking fee. Owners pay a flat monthly
              subscription to list — and for everyone looking for a home,
              Zouza is completely free.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-xl border-2 border-navy-950 bg-white p-7">
              <p className="eyebrow">For owners</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-navy-950">€20</span>
                <span className="text-navy-600">/ month</span>
              </p>
              <p className="mt-2 text-sm text-navy-600">
                Per owner. Create and preview your listing for free — the
                subscription starts when you publish.
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {ownerIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/list-with-ai" className={buttonClasses("primary", "md", "mt-8 w-full")}>
                List with Suzi
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-xl border border-line bg-white p-7">
              <p className="eyebrow">For buyers &amp; tenants</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-semibold text-navy-950">Free</span>
              </p>
              <p className="mt-2 text-sm text-navy-600">
                Always. No account fee, no fee at move-in, no fee on purchase.
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {seekerIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
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

      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-semibold text-navy-950">What a tenant actually pays</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              Everything goes to the owner or comes back to you. Zouza adds
              nothing to the total.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-xl border border-line bg-white p-6">
              <p className="eyebrow">Example rental</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-navy-600">Monthly rent</dt><dd className="font-medium text-navy-900">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Utilities (estimate)</dt><dd className="font-medium text-navy-900">€150</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Deposit (refundable)</dt><dd className="font-medium text-navy-900">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Zouza fee</dt><dd className="font-medium text-navy-900">€0</dd></div>
                <div className="mt-3 flex justify-between border-t border-line pt-3">
                  <dt className="font-semibold text-navy-900">Total due at move-in</dt>
                  <dd className="font-display text-lg font-semibold text-terra-600">€2,550</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-navy-500">
                Illustrative example. Zouza is an intermediary and does not
                process rent, deposits or any other payment between owners and
                tenants.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
