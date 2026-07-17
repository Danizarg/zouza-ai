"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The hero's right-side portrait — Suzi as an actual human presence, not
 * an icon. No licensed photo exists yet, so this renders a large bust
 * silhouette (clearly a person, not a generic avatar glyph) until one is
 * provided. Also handles the real photo failing to load at runtime, so it
 * never shows a broken-image icon once a src is wired in.
 *
 * To swap in the real photo: drop the file at
 * `public/images/suzi-portrait.jpg`, then pass
 * `src="/images/suzi-portrait.jpg"` from the caller (components/home/hero.tsx).
 */
export function HeroPortraitPanel({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-line shadow-card sm:aspect-[3/4]">
      {showPhoto ? (
        <Image
          src={src as string}
          alt="Suzi, your AI real estate partner"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            background: "radial-gradient(circle at 60% 15%, #E8CFA0 0%, #B3945A 42%, #0F1B33 100%)",
          }}
        >
          <svg viewBox="0 0 200 260" className="h-[75%] w-auto text-ivory/85" fill="none" aria-hidden>
            <circle cx="100" cy="78" r="52" fill="currentColor" />
            <path d="M18 260 C18 172 52 148 100 148 C148 148 182 172 182 260 Z" fill="currentColor" />
          </svg>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-navy-950/55 px-3 py-1 text-center text-[0.65rem] font-medium whitespace-nowrap text-ivory/90 backdrop-blur-sm">
            Suzi portrait placeholder — swap in public/images/suzi-portrait.jpg
          </span>
        </div>
      )}
    </div>
  );
}
