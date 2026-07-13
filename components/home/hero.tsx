"use client";

import { buttonClasses } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Camera, FileText, Languages, MessageCircle, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const heroImage =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80";

const generatedTags = [
  { icon: FileText, label: "Exposé written" },
  { icon: Languages, label: "6 languages" },
  { icon: MessageCircle, label: "AI agent live" },
  { icon: BadgeCheck, label: "FAQ generated" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* warm horizon wash, no gradient blobs */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            "linear-gradient(180deg, var(--color-parchment) 0%, var(--color-ivory) 100%)",
        }}
        aria-hidden
      />
      <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Verified marketplace · Spain first
          </motion.p>
          <motion.h1
            className="mt-4 text-4xl leading-[1.08] font-semibold text-navy-950 sm:text-5xl lg:text-[3.4rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Professional Property Marketing.
            <br />
            <span className="text-terra-600">Powered by AI.</span>
          </motion.h1>
          <motion.p
            className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            Upload photos. Zouza creates the listing — a polished exposé,
            buyer and tenant FAQ, translations, and a dedicated AI assistant
            that answers questions about your property around the clock.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/create-listing" className={buttonClasses("primary", "lg")}>
              <Upload className="h-4.5 w-4.5" aria-hidden />
              Upload photos
            </Link>
            <Link href="/rent" className={buttonClasses("outline", "lg")}>
              Explore homes
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
          <motion.p
            className="mt-6 text-sm text-navy-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Free to try · No agency contract · Listing ready in minutes
          </motion.p>
        </div>

        {/* Photos → listing transformation */}
        <motion.div
          className="relative mx-auto w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="rounded-2xl border border-line bg-white p-3 shadow-lift">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
              <Image
                src={heroImage}
                alt="A whitewashed Mediterranean villa with a pool, presented as an Zouza listing"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900/85 px-3 py-1 text-xs font-medium text-ivory backdrop-blur">
                <Camera className="h-3.5 w-3.5" aria-hidden />
                7 photos uploaded
              </span>
            </div>
            <div className="p-4">
              <p className="eyebrow">Zouza generated</p>
              <p className="mt-1.5 font-display text-lg leading-snug font-semibold text-navy-900">
                Whitewashed Villa with Pool and Montgó Views, Jávea
              </p>
              <p className="mt-1 text-sm text-navy-500">
                4 bed · 3 bath · 210 m² · Tosalet · €2,400/month
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {generatedTags.map((tag, i) => (
                  <motion.span
                    key={tag.label}
                    className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-gold-100 px-2.5 py-1 text-xs font-medium text-gold-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.55 + i * 0.15 }}
                  >
                    <tag.icon className="h-3 w-3" aria-hidden />
                    {tag.label}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            className="absolute -bottom-5 -left-4 hidden rounded-xl border border-line bg-white px-4 py-3 shadow-card sm:block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <p className="text-xs text-navy-500">First qualified enquiry</p>
            <p className="text-sm font-semibold text-navy-900">2 h 14 min after publishing</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
