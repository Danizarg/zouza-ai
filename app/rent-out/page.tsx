import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import {
  Camera,
  Clock3,
  Euro,
  FileEdit,
  FileText,
  MessageCircle,
  Rocket,
  Sparkles,
  Upload,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rent out your property professionally, powered by AI",
  description:
    "Upload photos. Zouza creates the listing, exposé, FAQ, translations and a dedicated AI assistant — rent out your property in minutes.",
};

const benefits = [
  { icon: Clock3, title: "Save time", text: "No more writing descriptions from scratch or repeating yourself in every message." },
  { icon: Sparkles, title: "Look professional", text: "Agency-grade presentation, generated from the photos you already have." },
  { icon: MessageCircle, title: "More qualified enquiries", text: "The AI assistant pre-answers routine questions before they reach you." },
  { icon: Euro, title: "Reduce agent costs", text: "Keep the listing and communication in your hands — skip the classic commission." },
  { icon: FileEdit, title: "Less stress", text: "One simple flow instead of juggling portals, templates and spreadsheets." },
] as const;

const steps = [
  { icon: Camera, title: "Upload photos", text: "Drag in the photos from your phone — no professional camera needed." },
  { icon: FileText, title: "Add basic facts", text: "Bedrooms, size, rent, deposit — five minutes of simple questions." },
  { icon: Sparkles, title: "AI creates the listing", text: "Zouza writes the exposé, FAQ, translations and price breakdown." },
  { icon: FileEdit, title: "Review and edit", text: "Everything is editable — change anything before it goes live." },
  { icon: Rocket, title: "Publish", text: "Your listing goes live on the marketplace, ready to be found." },
  { icon: MessageCircle, title: "AI assistant takes over", text: "It answers tenant questions 24/7, using only your listing's facts." },
] as const;

const faqs = [
  {
    q: "Do I need to be technical to use this?",
    a: "No. If you can use WhatsApp, you can use Zouza. Upload photos, answer simple questions, and review the result before publishing.",
  },
  {
    q: "Can I still write my own description?",
    a: "Yes — every AI-generated field is editable. Use it as a starting point or a finished draft, your choice.",
  },
  {
    q: "What does it cost to list?",
    a: "See the Pricing page for our transparent, low-fee model. There is no obligation and no hidden cost to create a draft listing.",
  },
  {
    q: "Who answers the AI assistant's questions if it doesn't know?",
    a: "The assistant only answers from the facts you provide. Anything it can't answer is forwarded to you directly as a message.",
  },
  {
    q: "Can I take the listing down at any time?",
    a: "Yes, you control publishing status at all times from your owner dashboard.",
  },
];

export default function RentOutPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">For owners</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold text-navy-950 sm:text-5xl">
              Rent out your property professionally in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-navy-600">
              Upload photos. Zouza creates the listing, exposé, FAQ,
              translations, and AI assistant.
            </p>
            <div className="mt-8">
              <Link href="/create-listing" className={buttonClasses("primary", "lg")}>
                <Upload className="h-4.5 w-4.5" aria-hidden />
                Start with photos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <Reveal>
          <h2 className="text-3xl font-semibold text-navy-950">Why owners switch to Zouza</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col rounded-xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950 text-gold-300">
                  <b.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-sans text-sm font-semibold text-navy-900">{b.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-navy-600">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-navy-950 py-16 text-ivory md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-gold-300">The flow</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">From photos to published, step by step</h2>
          </Reveal>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06} className="h-full">
                <li className="flex h-full flex-col rounded-xl border border-navy-700 bg-navy-900 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 text-gold-300">
                    {i + 1}
                  </span>
                  <p className="mt-4 flex items-center gap-2 font-sans text-sm font-semibold text-ivory">
                    <step.icon className="h-4 w-4 text-gold-300" aria-hidden />
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-300">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.2}>
            <div className="mt-10">
              <Link href="/create-listing" className={buttonClasses("primary", "lg")}>
                Start with photos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <Reveal>
          <p className="eyebrow">Simple by design</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950">
            Built so a first-time owner can do it alone
          </h2>
          <p className="mt-3 max-w-xl text-navy-600">
            We tested this flow with owners who had never listed a property
            before. If you can send a photo by text message, you can publish a
            professional listing on Zouza.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05} className="h-full">
              <div className="h-full rounded-xl border border-line bg-white p-5">
                <h3 className="font-sans text-sm font-semibold text-navy-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
