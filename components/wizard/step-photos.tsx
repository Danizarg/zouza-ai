"use client";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

export interface WizardPhoto {
  file: File;
  previewUrl: string;
}

export function StepPhotos({
  photos,
  onChange,
  onBack,
  onContinue,
}: {
  photos: WizardPhoto[];
  onChange: (photos: WizardPhoto[]) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const hintId = useId();

  function openPicker() {
    inputRef.current?.click();
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    onChange([...photos, ...next]);
  }

  function removeAt(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  /* A click on the zone's own surface opens the picker. The "Choose photos"
     button and the file input already do that themselves (and the input's
     programmatic click bubbles up here), so their clicks are left alone. */
  function handleZoneClick(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button, input")) return;
    openPicker();
  }

  /* Enter / Space while the zone itself has focus. Keys pressed on the
     button inside are its own business. */
  function handleZoneKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }

  return (
    <div>
      <h1 id={headingId} className="text-2xl font-semibold text-ink sm:text-3xl">
        Upload photos
      </h1>
      <p className="mt-2 text-muted">
        Add the photos you have.{" "}
        {isSupabaseConfigured()
          ? "They're saved with your listing."
          : "Demo mode: they stay in this tab."}
      </p>

      <div
        role="group"
        aria-labelledby={headingId}
        aria-describedby={hintId}
        tabIndex={0}
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`relative mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-brand-500 bg-brand-50" : "border-border bg-paper-2 hover:border-border-strong"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
          <Camera className="h-5 w-5 text-ink-2" aria-hidden />
        </span>
        <p className="font-medium text-ink">Drag photos here</p>
        <Button variant="outline" onClick={openPicker}>
          Choose photos
        </Button>
        <p id={hintId} className="text-xs text-muted">
          JPG or PNG
        </p>
        {/* Visually hidden, not display:none: it stays in the accessibility
            tree and can take focus, while the button and the zone are the
            tab stops (tabIndex -1 avoids a third stop for the same action). */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          tabIndex={-1}
          aria-labelledby={headingId}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            // Reset so the same file can be re-added after being removed.
            e.target.value = "";
          }}
        />
      </div>

      {photos.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="Added photos">
          {photos.map((p, i) => (
            <li key={p.previewUrl} className="relative aspect-square overflow-hidden rounded-xl bg-paper-2">
              <Image src={p.previewUrl} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
              {/* 44px hit area (touch target) around a 28px visible control,
                  always visible — no hover-only reveal, so touch and
                  keyboard users can find it. */}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="group/remove absolute top-0 right-0 flex h-11 w-11 cursor-pointer items-center justify-center text-paper"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-900/70 transition-colors group-hover/remove:bg-brand-900 group-focus-visible/remove:bg-brand-900">
                  <X className="h-3.5 w-3.5" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button disabled={photos.length === 0} onClick={onContinue}>
          <Upload className="h-4 w-4" aria-hidden />
          Continue with {photos.length} photo{photos.length === 1 ? "" : "s"}
        </Button>
      </div>
    </div>
  );
}
