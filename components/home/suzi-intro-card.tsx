"use client";

import { motion } from "framer-motion";
import { Gauge, Headphones, MessageCircleQuestion, Search, Star, Users } from "lucide-react";
import Image from "next/image";

const CAPABILITIES = [
  { icon: Search, text: "Find the perfect property" },
  { icon: Gauge, text: "Understand true market value" },
  { icon: MessageCircleQuestion, text: "Answer all your questions" },
  { icon: Users, text: "Handle paperwork & details" },
  { icon: Headphones, text: "Available 24/7" },
] as const;

const AVATAR_SEEDS = [
  "photo-1494790108377-be9c29b29330",
  "photo-1500648767791-00dcc994a43e",
  "photo-1519085360753-af0119f7cbe7",
];

/** The personality/trust panel that introduces Suzi — the emotional core of the hero. */
export function SuziIntroCard() {
  return (
    <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-7">
      <div className="flex items-center gap-4">
        <motion.span
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #E8CFA0 0%, #B3945A 45%, #0F1B33 100%)",
          }}
          animate={{ boxShadow: ["0 0 0 0 rgba(179,148,90,0.35)", "0 0 0 10px rgba(179,148,90,0)"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
        <div>
          <p className="font-display text-lg font-semibold text-navy-950">Hi, I&rsquo;m Suzi. 👋</p>
          <p className="text-sm text-navy-600">Your AI Real Estate Partner</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-navy-600">
        I&rsquo;m here to save you time and help you make the right move.
      </p>
      <ul className="mt-4 space-y-2.5">
        {CAPABILITIES.map((c) => (
          <li key={c.text} className="flex items-center gap-3 text-sm text-navy-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-parchment text-navy-700">
              <c.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {c.text}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs text-navy-500">Trusted by thousands of happy clients.</p>
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex -space-x-2">
            {AVATAR_SEEDS.map((seed) => (
              <Image
                key={seed}
                src={`https://images.unsplash.com/${seed}?auto=format&fit=crop&w=64&h=64&q=70`}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <span className="flex items-center gap-1 rounded-full bg-navy-950 px-2 py-0.5 text-xs font-semibold text-ivory">
            4.9 <Star className="h-3 w-3 fill-gold-300 text-gold-300" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
