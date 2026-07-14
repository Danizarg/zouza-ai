"use client";

import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-1.5 overflow-hidden rounded-xl sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="relative aspect-[4/3] bg-sand sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <Image src={images[0]} alt={title} fill priority sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
        </button>
        {images.slice(1, 5).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightbox(i + 1)}
            className="relative hidden aspect-square bg-sand sm:block"
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
            {i === 3 && images.length > 5 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/50 text-sm font-medium text-ivory">
                <Expand className="mr-1.5 h-4 w-4" aria-hidden />+{images.length - 5} more
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {lightbox !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ivory"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image src={images[lightbox]} alt={title} fill className="object-contain" />
          </div>
          <div className="absolute bottom-6 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-1.5 rounded-full", i === lightbox ? "bg-ivory" : "bg-ivory/30")}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
