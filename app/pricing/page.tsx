import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing & fees",
  description:
    "Zouza.ai' transparent, low-fee model — every cost shown before you enquire, with no hidden charges.",
};

const principles = [
  "One low platform fee, shown before you ever enquire",
  "No hidden charges added after you've committed",
  "No classic agency commission layered on top",
  "Free to create and preview a listing draft",
];

export default function PricingPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-3 text-4xl font-semibold text-navy-950 sm:text-5xl">
              Low, transparent fees. No hidden costs.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Zouza.ai is a pure intermediary — we don&rsquo;t process
              payments or take a commission on your rent or sale price. We
              charge a small platform fee for the marketplace and AI tools,
              shown clearly before anyone commits to anything.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-semibold text-navy-950">What you always see upfront</h2>
            <ul className="mt-6 space-y-3">
              {principles.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <p className="eyebrow">Example rental breakdown</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-navy-600">Monthly rent</dt><dd className="font-medium text-navy-900">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Utilities (estimate)</dt><dd className="font-medium text-navy-900">€150</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Deposit (refundable)</dt><dd className="font-medium text-navy-900">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-600">Platform fee (example 0–3%)</dt><dd className="font-medium text-navy-900">€0–36</dd></div>
                <div className="mt-3 flex justify-between border-t border-line pt-3">
                  <dt className="font-semibold text-navy-900">Total due at move-in</dt>
                  <dd className="font-display text-lg font-semibold text-terra-600">€2,550–2,586</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-navy-500">
                Illustrative example only. Exact platform fee structure will
                be announced before public launch.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-navy-950">Ready to see it in action?</h2>
            <p className="mt-1 text-sm text-navy-600">Create a listing draft for free — no payment required.</p>
          </div>
          <Link href="/create-listing" className={buttonClasses("primary", "md")}>
            Start with photos
          </Link>
        </div>
      </section>
    </div>
  );
}
