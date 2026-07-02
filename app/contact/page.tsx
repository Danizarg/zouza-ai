import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Aurora Homes",
  description: "Get in touch about renting, listing, selling or buying a property, or ask about partnerships and support.",
};

export default function ContactPage() {
  return (
    <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.3fr]">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">
          Talk to Aurora Homes
        </h1>
        <p className="mt-4 max-w-sm text-navy-600">
          Whether you want to rent, list a property, sell, buy, or explore a
          partnership — send us a message and a real person will reply.
        </p>

        <div className="mt-8 space-y-4 text-sm text-navy-600">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold-600" aria-hidden />
            hello@aurorahomes.example
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-600" aria-hidden />
            Valencia, Spain (remote-first team)
          </p>
        </div>

        <p className="mt-8 max-w-sm text-xs leading-relaxed text-navy-500">
          Aurora Homes is an independent concept and is not affiliated with
          Airbnb, Idealista, ThinkSpain, Zillow, Booking, or any other
          rental/property platform. See our{" "}
          <Link href="/legal/disclaimer" className="underline hover:text-navy-700">
            full disclaimer
          </Link>
          .
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}
