"use client";

import { cn } from "@/lib/utils";
import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null,
  );
}

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  /** The thumbnail that opened the viewer — focus goes back to it on close. */
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function open(index: number, event: MouseEvent<HTMLButtonElement>) {
    openerRef.current = event.currentTarget;
    setLightbox(index);
  }

  function close() {
    setLightbox(null);
    const opener = openerRef.current;
    openerRef.current = null;
    opener?.focus();
  }

  // Move focus into the viewer once it is on screen. Closing hands focus
  // back to the opener in `close`, so nothing else needs to run here.
  useEffect(() => {
    if (lightbox === null) return;
    closeRef.current?.focus();
  }, [lightbox]);

  function handleDialogKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const root = e.currentTarget;
    const items = focusableWithin(root);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const inside = active instanceof HTMLElement && active !== root && root.contains(active);

    if (e.shiftKey) {
      if (!inside || active === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (!inside || active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const total = images.length;

  return (
    <>
      <div className="grid gap-1.5 overflow-hidden rounded-xl sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={(e) => open(0, e)}
          aria-label={`Open photo 1 of ${total}`}
          className="relative aspect-[4/3] bg-paper-2 sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <Image src={images[0]} alt={title} fill priority sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
        </button>
        {images.slice(1, 5).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={(e) => open(i + 1, e)}
            aria-label={`Open photo ${i + 2} of ${total}`}
            className="relative hidden aspect-square bg-paper-2 sm:block"
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
            {i === 3 && total > 5 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-brand-900/50 text-sm font-medium text-paper">
                <Expand className="mr-1.5 h-4 w-4" aria-hidden />+{total - 5} more
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {lightbox !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/90 p-4"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-paper focus-visible:outline-brand-300"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative h-[80dvh] w-full max-w-4xl">
            <Image src={images[lightbox]} alt={`${title} — photo ${lightbox + 1} of ${total}`} fill className="object-contain" />
          </div>
          <div className="absolute bottom-6 flex gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-1.5 rounded-full", i === lightbox ? "bg-paper" : "bg-paper/30")}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
