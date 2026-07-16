import { Reveal } from "@/components/reveal";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  FileCheck2,
  Flag,
  ShieldCheck,
  Video,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & verification",
  description:
    "How Zouza verifies owners and properties, fights fake listings, and keeps verification status transparent for every home.",
};

const steps = [
  {
    icon: BadgeCheck,
    title: "Owner identity verification",
    text: "Owners confirm their identity before a listing can carry the verified badge — reducing anonymous, throwaway listings.",
  },
  {
    icon: FileCheck2,
    title: "Proof of ownership or listing authorisation",
    text: "We ask for documentation showing the owner has the right to list — a deed, utility bill, or written authorisation from the owner.",
  },
  {
    icon: ShieldCheck,
    title: "Property verification",
    text: "Address and details are cross-checked against public records where available, flagging mismatches for manual review.",
  },
  {
    icon: Video,
    title: "Video proof",
    text: "Owners can record a short walkthrough matching the listing photos — a strong signal the property is real and current.",
  },
  {
    icon: Calendar,
    title: "Last verified date",
    text: "Every verified listing shows exactly when it was last checked, so you know how fresh the verification is — not just a one-time badge.",
  },
  {
    icon: Flag,
    title: "User reporting",
    text: "Anyone can report a listing that looks fake, outdated, or misleading. Reports are reviewed and can suspend a listing pending checks.",
  },
] as const;

export default function TrustPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Trust & verification</p>
            <h1 className="mt-3 text-4xl font-semibold text-navy-950 sm:text-5xl">
              Built to stop fake listings before they start.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Every property portal fights the same problem: listings that
              don&rsquo;t exist, are already gone, or belong to someone else.
              Zouza&rsquo;s verification system is designed around one goal —
              you should be able to trust what you see.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col rounded-xl border border-line bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-sans text-sm font-semibold text-navy-900">{s.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <div className="flex items-start gap-3 rounded-xl border border-terra-200 bg-terra-100 p-6">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-terra-700" aria-hidden />
              <div>
                <h2 className="font-sans text-sm font-semibold text-navy-900">
                  Verification reduces risk — it does not guarantee outcomes
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">
                  Zouza verification is a best-effort trust signal, not
                  a legal or financial guarantee. We do not guarantee that a
                  property is free of undisclosed issues, that a tenant or
                  buyer will complete a transaction, or that any listing is
                  entirely free of error. Always verify independently before
                  signing anything or transferring money, and never send
                  funds outside of a proper legal contract.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
