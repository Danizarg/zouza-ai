import { AgentDemo } from "@/components/home/agent-demo";
import { Hero } from "@/components/home/hero";
import { TalkToSuziButton } from "@/components/home/talk-to-suzi-button";
import { ListingCard } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import {
  ArrowRight,
  CalendarCheck,
  FileText,
  MessageCircle,
  Search,
  Sparkles,
  Tag,
  Upload,
  Wand2,
  Waves,
} from "lucide-react";
import Link from "next/link";

/**
 * Homepage capability claims (ZOU-2 Rev 3 §4.1, copy from ZOU-8).
 *
 * Every label must map to a named function in `lib/ai/service.ts` or
 * `lib/ai/suzi-assistant.ts` — recorded in `code` so the page never promises
 * something the product cannot do. Max 6 items, label-only, no hover copy.
 */
const whySuzi = [
  { icon: Search, label: "Finds homes", code: "interpretSearchQuery" },
  { icon: Tag, label: "Explains the asking price", code: "answerAgentQuestion (price branch)" },
  { icon: FileText, label: "Drafts listing copy", code: "generateListingContent" },
  { icon: CalendarCheck, label: "Request a viewing", code: "answerAgentQuestion (viewing branch) + ContactActions" },
  { icon: Waves, label: "Compares locations", code: "interpretSearchQuery (city/beach) + answerAgentQuestion (beach branch)" },
  { icon: MessageCircle, label: "Answers property questions", code: "answerAgentQuestion / getPropertyAnswer" },
] as const;

/** What `generateListingContent` actually returns for a seller to review. */
const suziDrafts = [
  { icon: FileText, label: "Property title", code: "title" },
  { icon: FileText, label: "Description", code: "description" },
  { icon: Sparkles, label: "Lifestyle text", code: "lifestyleParagraph" },
  { icon: MessageCircle, label: "Buyer FAQ", code: "faq" },
  { icon: Tag, label: "Property highlights", code: "featureBullets / summary" },
  { icon: Wand2, label: "Listing draft", code: "wizard StepPreview → StepReview" },
] as const;

export default function HomePage() {
  // A plain slice of demo data. The previous `verified_owner && verified_property`
  // filter read mock flags and implied a verification pipeline that does not exist.
  const examples = MOCK_LISTINGS.slice(0, 6);

  return (
    <>
      <Hero />

      {/* What Suzi does */}
      <section className="container-page pt-8 md:pt-12">
        <div>
          <Reveal>
            <p className="eyebrow">What Suzi does</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold sm:text-4xl">
              Why Suzi is different
            </h2>
            <p className="mt-3 max-w-lg text-navy-600">
              Tell Suzi what you need. Search example properties, compare details, or start a listing draft.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {whySuzi.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.04} className="h-full">
                <div className="flex h-full flex-col items-start gap-3 rounded-xl border border-line bg-white p-5">
                  <item.icon className="h-4.5 w-4.5 text-gold-600" aria-hidden />
                  <p className="text-sm font-medium text-navy-900">{item.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-navy-700 hover:text-navy-950"
            >
              See how it works
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* One example conversation */}
      <section className="container-page pt-12 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <Reveal>
            <p className="eyebrow">One example conversation</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Questions about this home
            </h2>
            <p className="mt-3 max-w-md text-navy-600">
              Ask about the property details shown here, including price, availability, parking, pets, and the area.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <AgentDemo />
          </Reveal>
        </div>
      </section>

      {/* Example properties */}
      <section className="container-page pt-12 md:pt-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">Example properties</p>
                <Badge tone="neutral">Demo data</Badge>
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
                A few places to explore
              </h2>
              <p className="mt-3 max-w-lg text-navy-600">
                Examples to show how Zouza presents property details.
              </p>
            </div>
            <Link href="/explore" className={buttonClasses("outline", "sm")}>
              View all properties
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {examples.map((l, i) => (
            <Reveal key={l.id} delay={i * 0.06} className="h-full">
              <ListingCard listing={l} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* List your property */}
      <section className="mt-12 border-y border-line bg-parchment py-12 md:mt-20 md:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <Reveal>
            <p className="eyebrow">List with the details you have</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold text-navy-950 sm:text-4xl">
              Draft a listing with Suzi
            </h2>
            <p className="mt-3 max-w-lg text-navy-600">
              Share the property details you have. Suzi helps shape a draft listing for you to review before it goes live.
            </p>
            <div className="mt-8">
              <Link href="/list-with-ai" className={buttonClasses("primary", "md")}>
                <Upload className="h-4 w-4" aria-hidden />
                List with Suzi
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid grid-cols-2 gap-4">
              {suziDrafts.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-5 text-sm font-medium text-navy-900"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-parchment text-navy-700">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-16 bg-navy-950 py-12 text-ivory md:mt-24 md:py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Tell Suzi what you need.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <TalkToSuziButton variant="outline" />
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
    </>
  );
}
