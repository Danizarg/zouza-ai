import { AgentDemo } from "@/components/home/agent-demo";
import { Hero } from "@/components/home/hero";
import { ListingCard } from "@/components/listing-card";
import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist-form";
import { MOCK_LISTINGS, SPAIN_DESTINATIONS } from "@/lib/mock-data";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  Clock3,
  Euro,
  FileText,
  Home,
  KeyRound,
  Landmark,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const intents = [
  {
    href: "/rent-out",
    icon: KeyRound,
    title: "Rent out",
    de: "Vermieten",
    text: "List a rental in minutes. Zouza writes the exposé and answers tenants 24/7.",
  },
  {
    href: "/sell",
    icon: Landmark,
    title: "Sell",
    de: "Verkaufen",
    text: "Agency-level presentation without the agency process — direct to buyers.",
  },
  {
    href: "/rent",
    icon: Home,
    title: "Rent",
    de: "Mieten",
    text: "Verified homes with the total move-in cost shown before you enquire.",
  },
  {
    href: "/buy",
    icon: Building2,
    title: "Buy",
    de: "Kaufen",
    text: "Buy directly from verified owners. Transparent asking prices, no games.",
  },
] as const;

const aiFlow = [
  { icon: Camera, title: "Upload photos", text: "Drag in the photos you already have on your phone." },
  { icon: Wand2, title: "AI analyses", text: "Zouza detects rooms, light, features and selling points." },
  { icon: FileText, title: "Exposé generated", text: "Professional title, description, lifestyle and location copy." },
  { icon: MessageCircle, title: "FAQ created", text: "Tenant and buyer questions answered before they are asked." },
  { icon: Sparkles, title: "Listing published", text: "Live with translations and its own AI assistant." },
] as const;

const ownerBenefits = [
  { icon: Clock3, title: "Save hours per listing", text: "No more writing descriptions, retyping the same answers, or juggling portals." },
  { icon: FileText, title: "Look professional", text: "Every home gets an agency-grade exposé — even if you have never written one." },
  { icon: MessageCircle, title: "More qualified enquiries", text: "Zouza pre-answers routine questions, so the leads that reach you are serious." },
  { icon: Euro, title: "Reduce agent costs", text: "Keep control and skip the classic commission for marketing work AI now does." },
] as const;

const seekerBenefits = [
  { icon: ShieldCheck, title: "Verified homes", text: "Owner identity and property checks, with a visible last-verified date." },
  { icon: Receipt, title: "Real total prices", text: "Rent, utilities, deposit and fees added up before you enquire. No surprises." },
  { icon: MessageCircle, title: "Instant answers", text: "Every listing has an AI assistant that knows the property — day and night." },
  { icon: BadgeCheck, title: "Direct owners", text: "Talk to the person who actually owns the home, not a call centre." },
] as const;

const stayLiveBuy = [
  {
    title: "Stay",
    subtitle: "Short & medium term",
    text: "Furnished homes for 1–6 months. Ideal for remote workers, winter escapes and try-before-you-move.",
    href: "/rent",
  },
  {
    title: "Live",
    subtitle: "Long-term rentals",
    text: "12-month-plus homes with clear deposits, honest utility estimates and verified owners.",
    href: "/rent",
  },
  {
    title: "Buy",
    subtitle: "Owner-direct sales",
    text: "Purchase directly from verified owners with a documented trail — no inflated agency layer.",
    href: "/buy",
  },
] as const;

export default function HomePage() {
  const exampleListing = MOCK_LISTINGS.find((l) => l.id === "l-javea-villa")!;
  const featured = MOCK_LISTINGS.filter((l) => l.verified_owner && l.verified_property).slice(0, 3);

  return (
    <>
      <Hero />

      {/* Intent cards */}
      <section className="container-page pb-16 md:pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intents.map((intent, i) => (
            <Reveal key={intent.href} delay={i * 0.06} className="h-full">
              <Link
                href={intent.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-parchment text-navy-800">
                  <intent.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-display text-xl font-semibold text-navy-900">
                  {intent.title}
                  <span className="ml-2 font-sans text-xs font-normal tracking-wide text-navy-400 uppercase">
                    {intent.de}
                  </span>
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600">{intent.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-terra-600">
                  Start
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI upload flow */}
      <section className="border-y border-line bg-parchment py-16 md:py-24">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">How Zouza works</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-navy-950 sm:text-4xl">
              From phone photos to a professional listing in five steps
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {aiFlow.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.07} className="h-full">
                <div className="relative h-full rounded-2xl border border-line bg-white p-5">
                  <span className="absolute -top-3 left-5 rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-semibold text-gold-300">
                    {i + 1}
                  </span>
                  <step.icon className="mt-2 h-5 w-5 text-gold-600" aria-hidden />
                  <h3 className="mt-3 font-sans text-sm font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <div className="mt-10">
              <Link href="/create-listing" className={buttonClasses("ink", "md")}>
                <Upload className="h-4 w-4" aria-hidden />
                Try it with your photos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Example AI-generated listing + agent demo */}
      <section className="container-page grid items-start gap-10 py-16 md:py-24 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Example output</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
            This exposé was generated from seven photos
          </h2>
          <p className="mt-4 max-w-md text-navy-600">
            The owner uploaded photos and five facts. Zouza wrote the title,
            description, feature list and FAQ, prepared six translations, and
            switched on the property&rsquo;s own AI assistant.
          </p>
          <div className="mt-8">
            <ListingCard listing={exampleListing} />
          </div>
          <Link
            href={`/listings/${exampleListing.id}`}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-terra-600 hover:text-terra-700"
          >
            See the full generated listing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">Every property gets its own AI assistant</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
            Try the property agent — ask it anything
          </h2>
          <p className="mt-4 max-w-md text-navy-600">
            It answers from the listing&rsquo;s verified data: availability,
            true costs, pets, parking, the neighbourhood. Owners stop repeating
            themselves; tenants get instant, honest answers.
          </p>
          <div className="mt-8">
            <AgentDemo />
          </div>
        </Reveal>
      </section>

      {/* Trust: verified homes + real prices */}
      <section className="border-y border-line bg-navy-950 py-16 text-ivory md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <Reveal>
            <ShieldCheck className="h-6 w-6 text-gold-300" aria-hidden />
            <h2 className="mt-4 text-3xl font-semibold text-ivory sm:text-4xl">Verified homes</h2>
            <p className="mt-4 max-w-md leading-relaxed text-navy-300">
              Fake listings are the plague of property portals. Zouza verifies
              owner identity and proof of ownership, cross-checks the address,
              and shows you when each home was last checked — for example,
              &ldquo;last verified 12 days ago&rdquo;.
            </p>
            <Link
              href="/trust"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
            >
              How verification works
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <Receipt className="h-6 w-6 text-gold-300" aria-hidden />
            <h2 className="mt-4 text-3xl font-semibold text-ivory sm:text-4xl">Real price transparency</h2>
            <div className="mt-6 max-w-md rounded-2xl border border-navy-700 bg-navy-900 p-6">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-navy-300">Monthly rent</dt><dd className="font-medium">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-300">Utilities (estimate)</dt><dd className="font-medium">€150</dd></div>
                <div className="flex justify-between"><dt className="text-navy-300">Deposit (refundable)</dt><dd className="font-medium">€1,200</dd></div>
                <div className="flex justify-between"><dt className="text-navy-300">Platform fee (2%)</dt><dd className="font-medium">€24</dd></div>
                <div className="mt-3 flex justify-between border-t border-navy-700 pt-3">
                  <dt className="font-semibold text-ivory">Total due at move-in</dt>
                  <dd className="font-display text-lg font-semibold text-gold-300">€2,574</dd>
                </div>
              </dl>
            </div>
            <p className="mt-4 max-w-md text-sm text-navy-300">
              Every rental on Zouza shows this breakdown before you enquire.
              No hidden costs — ever.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stay / Live / Buy */}
      <section className="container-page py-16 md:py-24">
        <Reveal>
          <p className="eyebrow">One marketplace, three ways in</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">Stay. Live. Buy.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {stayLiveBuy.map((mode, i) => (
            <Reveal key={mode.title} delay={i * 0.07} className="h-full">
              <Link
                href={mode.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-7 shadow-card transition-shadow hover:shadow-lift"
              >
                <p className="font-display text-2xl font-semibold text-navy-900">{mode.title}</p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-gold-600 uppercase">
                  {mode.subtitle}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{mode.text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-terra-600">
                  Browse homes
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured verified homes */}
      <section className="border-y border-line bg-parchment py-16 md:py-24">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Verified this month</p>
                <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
                  Homes you can actually trust
                </h2>
              </div>
              <Link href="/rent" className={buttonClasses("outline", "sm")}>
                View all homes
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l, i) => (
              <Reveal key={l.id} delay={i * 0.07} className="h-full">
                <ListingCard listing={l} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-page grid gap-14 py-16 md:py-24 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">For owners</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950">
            Less stress. More serious enquiries.
          </h2>
          <ul className="mt-8 space-y-6">
            {ownerBenefits.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terra-100 text-terra-700">
                  <b.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-navy-900">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-600">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow">For tenants & buyers</p>
          <h2 className="mt-3 text-3xl font-semibold text-navy-950">
            Honest homes, honest numbers.
          </h2>
          <ul className="mt-8 space-y-6">
            {seekerBenefits.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <b.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-navy-900">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-600">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Destinations */}
      <section className="border-t border-line bg-ivory py-16 md:py-24">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">Spain first — global next</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Where Zouza is opening
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPAIN_DESTINATIONS.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.05}>
                <Link
                  href="/rent"
                  className="group relative block overflow-hidden rounded-2xl shadow-card"
                >
                  <div className="relative aspect-[16/10] bg-sand">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/10 to-transparent" />
                  </div>
                  <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between">
                    <div>
                      <p className="font-display text-xl font-semibold text-ivory">{d.name}</p>
                      <p className="text-xs text-ivory/80">{d.tagline}</p>
                    </div>
                    <span className="rounded-full bg-ivory/15 px-2.5 py-1 text-xs font-medium text-ivory backdrop-blur">
                      {d.count} homes
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fees + waitlist */}
      <section className="border-t border-line bg-parchment py-16 md:py-24">
        <div className="container-page max-w-3xl">
          <Reveal>
            <p className="eyebrow">Early access</p>
            <h2 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
              Low, transparent fees. No hidden costs.
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              Zouza is built as a pure intermediary: we charge a small,
              clearly displayed platform fee instead of classic agency
              commissions, and every cost is shown before anyone enquires.
              Join the waitlist and be first in when we open your area.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
            <p className="mt-4 text-xs text-navy-500">
              The exact fee structure will be announced before launch. No payment
              details required — this is a waitlist, not a purchase.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-4 z-40 px-4 lg:hidden">
        <Link
          href="/create-listing"
          className={buttonClasses("primary", "lg", "w-full shadow-lift")}
        >
          <Upload className="h-4.5 w-4.5" aria-hidden />
          Upload photos — Zouza does the rest
        </Link>
      </div>
    </>
  );
}
