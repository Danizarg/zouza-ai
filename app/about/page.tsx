import { Reveal } from "@/components/reveal";
import { ArrowRight, BadgeCheck, Handshake, Home, Receipt, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Zouza",
  description:
    "Zouza is an AI-first home marketplace, starting in Spain. Verified homes, clear prices with zero Zouza fee, and owners you deal with directly. Suzi is who you talk to.",
};

const pillars = [
  {
    icon: BadgeCheck,
    title: "Verified homes",
    text: "Owners confirm identity and ownership. Every verified listing shows when it was last checked.",
  },
  {
    icon: Receipt,
    title: "Clear prices, zero Zouza fee",
    text: "Rent, utilities and deposit added up before you enquire. Zouza adds nothing.",
  },
  {
    icon: Handshake,
    title: "Direct owners",
    text: "You deal with the owner directly. They keep control of their listing and conversations.",
  },
] as const;

const doors = [
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
] as const;

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-paper-2 py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">About Zouza</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">
              Property, made honest and simple.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              An AI-first home marketplace, starting in Spain. Suzi is who you talk to.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07} className="h-full">
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

      <section className="border-y border-border bg-brand-900 py-16 text-paper md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow text-brand-300">Our role</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A pure intermediary.</h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-200">
              Zouza connects people. We never handle payments, deposits, or legal, tax or financial advice.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {doors.map((door, i) => (
            <Reveal key={door.title} delay={i * 0.08} className="h-full">
              <Link
                href={door.href}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-border-strong"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <door.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-6 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                  {door.title}
                  <ArrowRight
                    className="h-5 w-5 text-brand-500 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{door.next}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
