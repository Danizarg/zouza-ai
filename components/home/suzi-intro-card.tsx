"use client";

import { motion } from "framer-motion";
import { Gauge, Headphones, MessageCircleQuestion, Search, Settings2 } from "lucide-react";

const CAPABILITIES = [
  { icon: Search, text: "Find the perfect property" },
  { icon: Gauge, text: "Understand true market value" },
  { icon: MessageCircleQuestion, text: "Answer all your questions" },
  { icon: Settings2, text: "Handle the details" },
  { icon: Headphones, text: "Assist 24/7" },
] as const;

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

      <p className="mt-5 text-sm leading-relaxed text-navy-600">I&rsquo;m here to help you:</p>
      <ul className="mt-3 space-y-2.5">
        {CAPABILITIES.map((c) => (
          <li key={c.text} className="flex items-center gap-3 text-sm text-navy-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-parchment text-navy-700">
              <c.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {c.text}
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-line pt-4 text-xs font-medium tracking-wide text-navy-400 uppercase">
        Powered by AI. Guided by Suzi.
      </p>
    </div>
  );
}
