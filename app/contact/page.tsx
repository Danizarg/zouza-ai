import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Zouza",
  description:
    "Questions about renting, listing, selling or buying, partnerships or support — send Zouza a message and a real person replies.",
};

export default function ContactPage() {
  return (
    <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.3fr]">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Get in touch.</h1>
        <p className="mt-4 max-w-sm text-muted">
          Questions, partnerships or support — send a message and a real person replies.
        </p>

        <a
          href="mailto:hello@zouza.ai"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 hover:text-ink"
        >
          <Mail className="h-4 w-4 text-brand-600" aria-hidden />
          hello@zouza.ai
        </a>

        <p className="mt-8 max-w-sm text-xs leading-relaxed text-muted">
          Zouza is an independent platform, not affiliated with any other property site.{" "}
          <Link href="/legal/disclaimer" className="underline hover:text-ink-2">
            Read the disclaimer
          </Link>
          .
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}
