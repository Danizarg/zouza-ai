import { ZMark } from "@/components/brand/z-mark";
import { Reveal } from "@/components/reveal";
import { ArrowRight, Home, KeyRound, ListChecks, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Tell Suzi what you need. She searches verified homes, explains every match and connects you with the owner. Owners list for €20/month; buyers and tenants pay nothing.",
};

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const steps: readonly { icon: Icon; title: string; text: string }[] = [
  {
    icon: ZMark,
    title: "Tell Suzi",
    text: "Describe the home you want in plain words. Type or speak.",
  },
  {
    icon: Search,
    title: "Suzi finds it",
    text: "She searches every verified listing and shortlists what matches.",
  },
  {
    icon: ListChecks,
    title: "See why it fits",
    text: "Each match shows a score and the reasons behind it.",
  },
  {
    icon: KeyRound,
    title: "Make it happen",
    text: "Ask the home anything, then message its owner or request a viewing.",
  },
];

const doors: readonly { icon: Icon; title: string; next: string; href: string }[] = [
  {
    icon: Search,
    title: "Find a home",
    next: "Tell Suzi what you need. She shortlists verified homes.",
    href: "/ai-search",
  },
  {
    icon: Home,
    title: "List your home",
    next: "Photos plus a short chat. Suzi writes the listing.",
    href: "/list-with-ai",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
              One conversation, four steps.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Suzi is your AI real estate partner. Here is what happens next.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="h-full">
              <Reveal delay={i * 0.08} className="h-full">
                <div className="h-full border-t-2 border-brand-500 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-brand-300">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="mt-4 font-sans text-base font-semibold text-ink">{step.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-brand-900 py-16 text-paper md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-brand-300">Start here</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Two doors, one Suzi.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {doors.map((door, i) => (
              <Reveal key={door.title} delay={i * 0.08} className="h-full">
                <Link
                  href={door.href}
                  className="group flex h-full flex-col rounded-xl border border-brand-700 bg-brand-900 p-6 transition-colors hover:border-brand-400"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                    <door.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-6 flex items-center gap-2 font-display text-2xl font-semibold text-paper">
                    {door.title}
                    <ArrowRight
                      className="h-5 w-5 text-brand-300 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-brand-200">{door.next}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <Reveal>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
            Owners pay €20/month per live listing. Buyers and tenants pay nothing. No fees.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            See pricing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
