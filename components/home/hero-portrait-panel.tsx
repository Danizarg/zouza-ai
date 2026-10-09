"use client";

import Image from "next/image";
import { useState } from "react";

/** The hero portrait, with a silhouette fallback if the image fails to load. */
export function HeroPortraitPanel({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div className="relative aspect-[4/5] max-h-[36rem] w-full overflow-hidden rounded-xl border border-line shadow-card sm:aspect-[3/4] lg:aspect-[4/5]">
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
          <span className="sr-only">Suzi portrait unavailable</span>
        </div>
      )}
    </div>
  );
}
