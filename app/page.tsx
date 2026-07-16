import { AgentDemo } from "@/components/home/agent-demo";
import { Hero } from "@/components/home/hero";
import { LiveDemo } from "@/components/home/live-demo";
import { NlSearchDemo } from "@/components/home/nl-search-demo";
import { ListingCard } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { MOCK_LISTINGS, MOCK_TESTIMONIALS } from "@/lib/mock-data";
import {
  ArrowRight,
  Camera,
  FileText,
  Gauge,
  Globe,
  Languages,
  MessageCircle,
  Rocket,
  Sparkles,
  Tag,
  Upload,
  Wand2,
} from "lucide-react";
import Link from "next/link";

const steps = [
  { icon: Camera, title: "Upload photos", text: "Drag in the photos you already have on your phone." },
  { icon: Wand2, title: "AI creates everything", text: "Title, description, FAQ, pricing, translations — done automatically." },
  { icon: Rocket, title: "Publish", text: "Review, then go live with a dedicated AI assistant answering enquiries." },
] as const;

const aiCreates = [
  { icon: FileText, label: "Property title" },
  { icon: FileText, label: "Description" },
  { icon: Sparkles, label: "Lifestyle text" },
  { icon: MessageCircle, label: "Buyer FAQ" },
  { icon: Tag, label: "Property highlights" },
  { icon: Gauge, label: "Price estimation" },
  { icon: Globe, label: "SEO text" },
  { icon: Languages, label: "Multiple languages" },
  { icon: MessageCircle, label: "AI assistant" },
  { icon: Rocket, label: "Listing publication" },
] as const;

export default function HomePage() {
  const featured = MOCK_LISTINGS.filter((l) => l.verified_owner && l.verified_property).slice(0, 5);

  return (
    <>
      <Hero />

      {/* Live AI demo */}
      <section className="border-y border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">See it happen</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold text-navy-950 sm:text-4xl">
              Upload photos. Zouza does the rest.
            </h2>
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
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
            From photos to a published listing in three steps
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
            <Link href="/list-with-ai" className={buttonClasses("primary", "md")}>
              <Upload className="h-4 w-4" aria-hidden />
              Start with AI
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
              Everything Zouza creates from your photos
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {aiCreates.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.04} className="h-full">
                <div className="flex h-full flex-col items-start gap-3 rounded-xl border border-navy-700 bg-navy-900 p-4">
                  <item.icon className="h-4.5 w-4.5 text-gold-300" aria-hidden />
                  <p className="text-sm font-medium text-ivory">{item.label}</p>
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
            Tell Zouza what you&rsquo;re looking for
          </h2>
          <p className="mt-3 max-w-lg text-navy-600">
            No filters to configure first — describe the home you want in
            plain language, and Zouza explains why each result matches.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10">
            <NlSearchDemo />
          </div>
        </Reveal>
      </section>

      {/* Property AI assistant demo */}
      <section className="border-y border-line bg-parchment py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow">Every property gets its own AI</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Talk to this property&rsquo;s AI
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

      {/* Featured properties */}
      <section className="container-page py-16 md:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Verified this month</p>
              <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
                Featured properties
              </h2>
            </div>
            <Link href="/explore" className={buttonClasses("outline", "sm")}>
              Explore all homes
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
        <div className="container-page flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Start with AI.</h2>
            <p className="mt-2 max-w-md text-navy-300">
              Tell Zouza what you want to do — buying, renting, selling, or
              listing — and the AI guides the rest.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/list-with-ai" className={buttonClasses("primary", "lg")}>
              <Sparkles className="h-4.5 w-4.5" aria-hidden />
              Start with AI
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
      </section>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-4 z-40 px-4 lg:hidden">
        <Link
          href="/list-with-ai"
          className={buttonClasses("primary", "lg", "w-full shadow-card")}
        >
          <Sparkles className="h-4.5 w-4.5" aria-hidden />
          Start with AI
        </Link>
      </div>
    </>
  );
}
