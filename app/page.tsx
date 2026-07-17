import { AgentDemo } from "@/components/home/agent-demo";
import { ConversationShowcase } from "@/components/home/conversation-showcase";
import { Hero } from "@/components/home/hero";
import { LiveDemo } from "@/components/home/live-demo";
import { MiniAiPrompt } from "@/components/home/mini-ai-prompt";
import { NlSearchDemo } from "@/components/home/nl-search-demo";
import { ValueStrip } from "@/components/home/value-strip";
import { ListingCard } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { MOCK_LISTINGS, MOCK_TESTIMONIALS } from "@/lib/mock-data";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  FileText,
  Gauge,
  GraduationCap,
  Handshake,
  Landmark,
  Languages,
  MessageCircle,
  Rocket,
  Search,
  Sparkles,
  Tag,
  Upload,
  Wand2,
  Waves,
} from "lucide-react";
import Link from "next/link";

const howItWorks = [
  { icon: MessageCircle, title: "Tell Suzi", text: "Speak or type what you need — buying, renting, selling, or listing." },
  { icon: Sparkles, title: "Suzi finds it", text: "Our AI searches, filters and understands what actually matters to you." },
  { icon: Search, title: "Get matches", text: "Verified homes, or a ready listing, with the reasoning behind every result." },
  { icon: Handshake, title: "Make it happen", text: "Message owners directly, book a viewing, or publish — Suzi handles the details." },
] as const;

const whySuzi = [
  { icon: Search, label: "Finds homes", example: "Matches from plain language, not filters" },
  { icon: Gauge, label: "Estimates prices", example: "Real market value from comparable homes" },
  { icon: FileText, label: "Writes exposés", example: "Agency-grade descriptions from your photos" },
  { icon: CalendarCheck, label: "Organises viewings", example: "Proposes times, confirms with the owner" },
  { icon: GraduationCap, label: "Recommends schools", example: "Local schools near any listing" },
  { icon: Waves, label: "Calculates beach distance", example: "Walking or driving time to the coast" },
  { icon: Landmark, label: "Explains financing", example: "Mortgage basics, taxes, and notary fees" },
  { icon: MessageCircle, label: "Reviews documents", example: "Flags anything that looks off before you sign" },
] as const;

const steps = [
  { icon: Camera, title: "Upload photos", text: "Drag in the photos you already have on your phone." },
  { icon: Wand2, title: "Suzi asks a few questions", text: "Only what she couldn't detect — pets, parking, that kind of thing." },
  { icon: Rocket, title: "Publish", text: "Review, then go live with Suzi answering enquiries for you." },
] as const;

const aiCreates = [
  { icon: FileText, label: "Property title", example: "“Sea-view villa with private pool in Marbella”" },
  { icon: FileText, label: "Description", example: "A full agency-style write-up from your photos and facts" },
  { icon: Sparkles, label: "Lifestyle text", example: "Mornings on the terrace, five minutes from the beach" },
  { icon: MessageCircle, label: "Buyer FAQ", example: "“Are pets allowed? Is parking included?”" },
  { icon: Tag, label: "Property highlights", example: "Pool · sea view · garage · 3 bedrooms" },
  { icon: Gauge, label: "Price estimation", example: "Estimated range based on area, size, and features" },
  { icon: Rocket, label: "SEO text", example: "Optimised so the listing is found, not just published" },
  { icon: Languages, label: "Multiple languages", example: "EN / ES / DE / FR / IT / NL" },
  { icon: MessageCircle, label: "Suzi for this listing", example: "Answers questions about this home, 24/7" },
  { icon: Rocket, label: "Listing publication", example: "Live the moment you approve it" },
] as const;

export default function HomePage() {
  const featured = MOCK_LISTINGS.filter((l) => l.verified_owner && l.verified_property).slice(0, 5);

  return (
    <>
      <Hero />

      {/* Value strip */}
      <section className="border-y border-line bg-parchment py-10 md:py-12">
        <div className="container-page">
          <ValueStrip />
        </div>
      </section>

      {/* How Zouza works */}
      <section className="container-page py-16 md:py-20">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
            From your words to the perfect match
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06} className="relative h-full">
              <div className="h-full border-t-2 border-navy-950 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-950">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{step.text}</p>
              </div>
              {i < howItWorks.length - 1 ? (
                <span className="absolute top-4 -right-3 hidden h-5 w-5 items-center justify-center text-navy-300 lg:flex">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link
            href="/how-it-works"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-950"
          >
            See how it works
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
      </section>

      {/* Interactive AI conversation showcase */}
      <section className="border-y border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Talk to Suzi</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold text-navy-950 sm:text-4xl">
              One partner, every intent
            </h2>
            <p className="mt-3 max-w-lg text-navy-600">
              Buy, rent, sell, list, or invest — Suzi handles the conversation,
              by voice or by typing.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <ConversationShowcase />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured properties */}
      <section className="container-page py-16 md:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Verified this month</p>
              <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
                Handpicked for you
              </h2>
            </div>
            <Link href="/explore" className={buttonClasses("outline", "sm")}>
              View all properties
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.06} className="h-full">
              <ListingCard listing={l} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why Suzi is different */}
      <section className="border-y border-line bg-navy-950 py-16 text-ivory md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-gold-300">Not a general chatbot</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold sm:text-4xl">
              Why Suzi is different
            </h2>
            <p className="mt-4 max-w-lg text-navy-300">
              Suzi knows only real estate — trained on one job, not a thousand.
              Ask her anything about buying, renting, selling or listing a home.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {whySuzi.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.04} className="h-full">
                <div className="group flex h-full flex-col items-start gap-3 rounded-xl border border-navy-700 bg-navy-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-500/50">
                  <item.icon className="h-4.5 w-4.5 text-gold-300" aria-hidden />
                  <p className="text-sm font-medium text-ivory">{item.label}</p>
                  <p className="text-xs leading-snug text-navy-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {item.example}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Property AI assistant demo */}
      <section className="border-b border-line bg-white py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow">Every property gets its own Suzi</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Ask Suzi about this property
            </h2>
            <p className="mt-4 max-w-md text-navy-600">
              Not &ldquo;Contact Agent.&rdquo; Every listing answers its own
              questions — community fees, distance to the beach, schools,
              taxes, availability — 24 hours a day, from the listing&rsquo;s
              real data.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <AgentDemo />
          </Reveal>
        </div>
      </section>

      {/* Seller flow: List with Suzi */}
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Step 1: upload photos. That&rsquo;s it.</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold text-navy-950 sm:text-4xl">
              List with Suzi
            </h2>
            <p className="mt-3 max-w-lg text-navy-600">
              No forms to fill in. Suzi detects bedrooms, bathrooms, pool, sea
              view and more from your photos, then asks only what she
              couldn&rsquo;t see for herself.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <LiveDemo />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Three simple steps */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="h-full">
              <div className="h-full border-t-2 border-navy-950 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy-950">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-10">
            <Link href="/list-with-ai" className={buttonClasses("primary", "md", "glow-cta")}>
              <Upload className="h-4 w-4" aria-hidden />
              List with Suzi
            </Link>
          </div>
        </Reveal>
      </section>

      {/* AI creates everything */}
      <section className="border-y border-line bg-navy-950 py-16 text-ivory md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-gold-300">One upload, one pipeline</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold sm:text-4xl">
              Everything Suzi creates from your photos
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {aiCreates.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.04} className="h-full">
                <div className="group flex h-full flex-col items-start gap-3 rounded-xl border border-navy-700 bg-navy-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-500/50">
                  <item.icon className="h-4.5 w-4.5 text-gold-300" aria-hidden />
                  <p className="text-sm font-medium text-ivory">{item.label}</p>
                  <p className="text-xs leading-snug text-navy-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {item.example}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Natural language search */}
      <section className="container-page py-16 md:py-20">
        <Reveal>
          <p className="eyebrow">Search, reinvented</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-navy-950 sm:text-4xl">
            Tell Suzi what you&rsquo;re looking for
          </h2>
          <p className="mt-3 max-w-lg text-navy-600">
            No filters to configure first — describe the home you want in
            plain language, and Suzi explains why each result matches.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <NlSearchDemo />
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Trusted by owners and buyers</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              What people say after using Zouza
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {MOCK_TESTIMONIALS.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.06} className="h-full">
                <div className="flex h-full flex-col rounded-xl border border-line bg-white p-6">
                  <p className="flex-1 text-sm leading-relaxed text-navy-700">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-sm font-semibold text-navy-950">{t.name}</p>
                    <p className="text-xs text-navy-500">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line bg-navy-950 py-16 text-ivory md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Tell Suzi what you need.</h2>
            <p className="mt-2 max-w-md text-navy-300">
              Buying, renting, selling, or listing — say it, or type it, and
              Suzi takes care of the rest.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/list-with-ai" className={buttonClasses("primary", "lg", "glow-cta")}>
                <Sparkles className="h-4.5 w-4.5" aria-hidden />
                Talk to Suzi
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-lg border border-ivory/25 px-7 py-3 text-base font-medium text-ivory transition-colors hover:border-ivory/50"
              >
                Explore homes
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="flex lg:justify-end">
            <MiniAiPrompt />
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-4 z-40 px-4 lg:hidden">
        <Link
          href="/list-with-ai"
          className={buttonClasses("primary", "lg", "w-full shadow-card glow-cta")}
        >
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
          Talk to Suzi
        </Link>
      </div>
    </>
  );
}
