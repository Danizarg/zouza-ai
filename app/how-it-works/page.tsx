import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import {
  Camera,
  FileText,
  Gauge,
  Globe,
  Languages,
  MessageCircle,
  Rocket,
  Search,
  Sparkles,
  Tag,
  Upload,
  Wand2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Zouza's AI handles listing creation, natural-language search, and 24/7 property questions.",
};

const steps = [
  { icon: Camera, title: "Upload photos", text: "Drag in the photos you already have on your phone — no professional shoot required." },
  { icon: Wand2, title: "AI creates everything", text: "Zouza detects rooms and features, then writes the title, description, FAQ, and pricing." },
  { icon: Rocket, title: "Publish", text: "Review everything — every word stays editable — then go live with a dedicated AI assistant." },
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

const searchExamples = [
  "I want to buy a villa in Marbella under €1.2M.",
  "I need a long-term rental near the beach with 3 bedrooms.",
  "Find investment properties with strong rental potential.",
  "I am relocating from Germany and need a family home.",
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h1 className="mt-3 text-4xl font-semibold text-navy-950 sm:text-5xl">
              Real estate, handled by AI.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">
              Zouza replaces the painful parts of buying, renting, selling and
              listing property with an AI that does the work — not another
              portal with a chatbot bolted on.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <Reveal>
          <p className="eyebrow">For owners</p>
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

      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <p className="eyebrow">For buyers &amp; renters</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Search in plain language
            </h2>
            <p className="mt-4 max-w-md text-navy-600">
              No filters to configure first. Describe the home you want, and
              Zouza explains why each match fits — budget, bedrooms, distance
              to the beach, lifestyle.
            </p>
            <Link
              href="/ai-search"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-terra-600 hover:text-terra-700"
            >
              <Search className="h-4 w-4" aria-hidden />
              Try AI search
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-2">
              {searchExamples.map((ex) => (
                <p key={ex} className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy-700">
                  &ldquo;{ex}&rdquo;
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">Every property gets its own AI</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Talk to this property&rsquo;s AI
            </h2>
            <p className="mt-4 text-navy-600">
              Not &ldquo;Contact Agent.&rdquo; Every listing answers its own
              questions about fees, taxes, availability and the neighbourhood
              — 24 hours a day, from the listing&rsquo;s real data.
            </p>
            <Link href="/explore" className={buttonClasses("primary", "md", "mt-8")}>
              Explore homes
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
