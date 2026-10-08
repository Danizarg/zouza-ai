import { ZMark } from "@/components/brand/z-mark";
import { Reveal } from "@/components/reveal";
import { AlertTriangle, Receipt, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";

export const metadata: Metadata = {
  title: "Trust & verification",
  description:
    "How Zouza verifies owners and homes, keeps prices honest with zero Zouza fee, and keeps Suzi's recommendations independent of payment.",
};

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const pillars: readonly { icon: Icon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Verified homes",
    text: "Owners confirm identity and the right to list. Every verified listing shows its last-checked date.",
  },
  {
    icon: Receipt,
    title: "Honest pricing",
    text: "Rent, utilities and deposit shown before you enquire. No commission, no booking fee. Owners pay €20/month; buyers and tenants pay nothing.",
  },
  {
    icon: ZMark,
    title: "Suzi's advice is not for sale",
    text: "Payment never influences Suzi's recommendations. Promoted listings are always labelled.",
  },
];

export default function TrustPage() {
  return (
    <div>
      <section className="border-b border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Trust</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
              Trust what you see.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              How Zouza verifies homes, keeps prices honest and keeps Suzi independent.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-brand-300">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-sans text-base font-semibold text-ink">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-100 p-6">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              <div>
                <h2 className="font-sans text-sm font-semibold text-ink">
                  Verification is not a guarantee.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  Zouza is an intermediary and does not process payments, hold
                  deposits or give legal, tax or financial advice. Always verify
                  independently before signing or paying.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
