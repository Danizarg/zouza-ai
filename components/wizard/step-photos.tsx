"use client";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Upload photos</h1>
      <p className="mt-2 text-navy-600">
        Drag in the photos you already have — Zouza will detect rooms and
        features automatically.{" "}
        {isSupabaseConfigured()
          ? "Photos are stored securely in Supabase."
          : "Running in demo mode — photos stay in this browser tab."}
      </p>

      <div
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
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-gold-500 bg-gold-100" : "border-line bg-parchment hover:border-navy-300"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
          <Camera className="h-5 w-5 text-navy-700" aria-hidden />
        </span>
        <p className="font-medium text-navy-900">Drag photos here, or click to browse</p>
        <p className="text-xs text-navy-500">JPG or PNG · Add as many as you like</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {photos.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.previewUrl} className="group relative aspect-square overflow-hidden rounded-xl bg-sand">
              <Image src={p.previewUrl} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
                aria-label="Remove photo"
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy-950/70 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
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
