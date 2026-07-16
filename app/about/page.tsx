import { Reveal } from "@/components/reveal";
import {
  BadgeCheck,
  Globe2,
  Handshake,
  Receipt,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zouza",
  description:
    "Zouza' mission: professional property marketing powered by AI, verified homes, transparent prices, direct owners — Spain first, global next.",
};

const pillars = [
  {
    icon: Sparkles,
    title: "AI-powered property marketing",
    text: "Most owners aren't copywriters or photographers. Zouza turns ordinary phone photos and a few facts into an agency-grade listing — exposé, FAQ, translations, and a dedicated AI assistant per property.",
  },
  {
    icon: BadgeCheck,
    title: "Verified homes",
    text: "Fake and stale listings erode trust in every property portal. We verify owner identity and property details, and show exactly when a listing was last checked.",
  },
  {
    icon: Receipt,
    title: "Clear prices, no hidden costs",
    text: "Every rental shows rent, utilities, deposit and platform fee added up before you enquire. Every sale shows the direct asking price, with no invisible agency markup.",
  },
  {
    icon: Handshake,
    title: "Direct owners",
    text: "We connect people directly. Owners keep control of their listing and conversations; tenants and buyers deal with the person who actually owns the home.",
  },
] as const;

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">Our mission</p>
            <h1 className="mt-3 text-4xl font-semibold text-navy-950 sm:text-5xl">
              Property marketing, made honest and effortless.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Zouza exists because listing a property shouldn&rsquo;t
              require an agency, a copywriter, or a second job answering the
              same questions all day. We built an AI assistant that does the
              marketing work, on top of a marketplace built around
              verification and transparent pricing.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07} className="h-full">
              <div className="flex h-full flex-col rounded-xl border border-line bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-navy-950 py-16 text-ivory md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <Globe2 className="h-6 w-6 text-gold-300" aria-hidden />
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Spain first, global next</h2>
            <p className="mt-4 leading-relaxed text-navy-300">
              We are starting in Spain — Valencia, the Costa Blanca, Mallorca,
              the Costa del Sol, Barcelona and Andalusia — where the gap
              between agency-level presentation and everyday owners is
              widest. Once the verification and AI marketing model is proven
              here, Zouza expands to new regions with the same principles:
              honest prices, verified homes, and an AI assistant on every
              listing.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-2xl font-semibold text-navy-950">Why a pure intermediary MVP</h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              Zouza is deliberately scoped as a marketing and
              marketplace platform in this first version — listings, search,
              messaging, verification, contract template area, reviews,
              viewing requests, and AI tools. We do not process payments,
              rent collection, escrow, deposits, or provide legal advice.
              This keeps the product focused, keeps your money and legal
              relationships where they belong — directly between you and the
              other party — and lets us earn trust in the part of the process
              we understand best: presenting your property professionally.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
