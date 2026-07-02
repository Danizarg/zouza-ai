import { Reveal } from "@/components/reveal";
import { buttonClasses } from "@/components/ui/button";
import {
  BadgeCheck,
  Calendar,
  FileText,
  MessageCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sell your property with agency-level presentation",
  description:
    "Upload photos and Aurora prepares a professional sales exposé, buyer FAQ, and verification badge — sell directly, without the agency process.",
};

const features = [
  { icon: Upload, title: "Upload photos", text: "Bring the photos you already have. No professional shoot required." },
  { icon: FileText, title: "Professional sales exposé", text: "Aurora writes a buyer-ready description, lifestyle and location copy." },
  { icon: MessageCircle, title: "Buyer FAQ generated", text: "Common buyer questions answered automatically, from your facts." },
  { icon: Calendar, title: "Request viewings", text: "Interested buyers request a viewing directly through the listing." },
  { icon: BadgeCheck, title: "Direct owner contact", text: "Buyers reach you directly — no middle layer, no delay." },
  { icon: ShieldCheck, title: "Verification badge", text: "Verify your identity and ownership to earn buyer trust." },
] as const;

export default function SellPage() {
  return (
    <div>
      <section className="border-b border-line bg-parchment py-16 md:py-20">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow">For owners</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold text-navy-950 sm:text-5xl">
              Sell your property with agency-level presentation, without the
              agency process.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-navy-600">
              Upload photos. Aurora prepares your sales listing — description,
              FAQ, and price transparency — so serious buyers reach you
              directly.
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-sans text-sm font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-navy-600">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-parchment py-16 md:py-20">
        <div className="container-page max-w-2xl">
          <Reveal>
            <h2 className="text-2xl font-semibold text-navy-950">Important disclaimer</h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              Aurora Homes is a marketing and marketplace platform — we do not
              provide legal, tax or notarial advice, and we do not process
              payments, escrow or deposits for property sales. All price
              figures shown (taxes, notary fees) are indicative placeholders.
              Always confirm final terms with an independent lawyer, notary
              and tax advisor before completing a sale.
            </p>
            <Link
              href="/legal/disclaimer"
              className="mt-4 inline-block text-sm font-medium text-terra-600 hover:text-terra-700"
            >
              Read the full disclaimer
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
